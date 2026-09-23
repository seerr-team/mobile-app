#!/usr/bin/env node
// Lists the Seerr web changes that may need to be ported to the mobile app.
//
// The `seerr` submodule commit recorded in the mobile repo is the last synced
// version. The script diffs it against a newer Seerr ref and reports:
//   1. changed web files that have a mobile counterpart (with commits)
//   2. new web files imported by those counterparts (new sub-components)
//   3. added/removed/changed translation keys under prefixes used by the app
//   4. all other web changes, so new features are not missed
//
// Usage: node bin/seerr-changes.mjs [--from <ref>] [--to <ref>] [--fetch]
//                                   [--diff] [--all] [--unmapped]
//   --from      last synced Seerr ref (default: submodule commit in HEAD)
//   --to        Seerr ref to compare with (default: submodule HEAD,
//               or origin/develop with --fetch)
//   --fetch     fetch the Seerr remote before comparing
//   --diff      print the diff of every changed counterpart file
//   --all       also list web changes outside of src/ in section 4
//   --unmapped  list mobile files without any web counterpart
//               (except the ones listed in "mobileOnly")
//
// Once the changes are ported, record the new synced version with:
//   git -C seerr checkout <to> && git add seerr && git commit

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const SEERR = path.join(ROOT, 'seerr');
const CONFIG = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'seerr-sync.json'), 'utf8')
);

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const option = (name) => {
  const i = args.indexOf(name);
  return i === -1 ? undefined : args[i + 1];
};

const color = process.stdout.isTTY && !process.env.NO_COLOR;
const paint = (code) => (s) => (color ? `\x1b[${code}m${s}\x1b[0m` : s);
const bold = paint(1);
const dim = paint(2);
const red = paint(31);
const green = paint(32);
const yellow = paint(33);
const cyan = paint(36);

const git = (cwd, ...cmd) =>
  execFileSync('git', cmd, {
    cwd,
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
  });
const seerrGit = (...cmd) => git(SEERR, ...cmd);

// --- Refs -------------------------------------------------------------------

if (flag('--fetch')) {
  process.stderr.write(dim('Fetching Seerr...\n'));
  seerrGit('fetch', '--quiet', 'origin');
}
const from =
  option('--from') ?? git(ROOT, 'ls-tree', 'HEAD', 'seerr').split(/\s+/)[2];
const to =
  option('--to') ?? (flag('--fetch') ? `origin/${CONFIG.branch}` : 'HEAD');
const fromSha = seerrGit('rev-parse', '--short', from).trim();
const toSha = seerrGit('rev-parse', '--short', to).trim();

// --- Helpers ----------------------------------------------------------------

const globToRegex = (glob) =>
  new RegExp(
    '^' +
      glob
        .replace(/[.+^${}()|[\]\\]/g, '\\$&')
        .replace(/\*\*\/?/g, '\0')
        .replace(/\*/g, '[^/]*')
        .replace(/\0/g, '.*') +
      '$'
  );
const ignored = CONFIG.ignore.map(globToRegex);
const isIgnored = (file) => ignored.some((re) => re.test(file));

const webFilesAtTo = new Set(
  seerrGit('ls-tree', '-r', '--name-only', to).split('\n').filter(Boolean)
);
const webFilesAtFrom = new Set(
  seerrGit('ls-tree', '-r', '--name-only', from).split('\n').filter(Boolean)
);
const webExists = (file) => webFilesAtTo.has(file) || webFilesAtFrom.has(file);

const EXTENSIONS = ['', '.ts', '.tsx', '.js', '/index.ts', '/index.tsx'];
const resolveWeb = (base) =>
  EXTENSIONS.map((ext) => base + ext).find(webExists);

const walk = (dir) =>
  fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true }).flatMap((e) => {
    const rel = path.posix.join(dir, e.name);
    if (e.isDirectory()) return walk(rel);
    return /\.(ts|tsx)$/.test(e.name) ? [rel] : [];
  });

// --- Mobile -> web mapping ---------------------------------------------------

// web file -> Map<mobile file, reason>
const counterparts = new Map();
const link = (web, mobile, reason) => {
  if (!web || isIgnored(web)) return;
  if (!counterparts.has(web)) counterparts.set(web, new Map());
  if (!counterparts.get(web).has(mobile))
    counterparts.get(web).set(mobile, reason);
};

const mobileFiles = Object.keys(CONFIG.mirrors).flatMap((dir) =>
  fs.existsSync(path.join(ROOT, dir)) ? walk(dir) : []
);
const i18nPrefixes = new Map(); // prefix -> Set<mobile file>
const unmapped = [];

for (const mobile of mobileFiles) {
  const before = counterparts.size;
  let linked = false;

  // 1. Same relative path (components/X -> src/components/X, app/X -> src/pages/X)
  const dir = mobile.split('/')[0];
  const mirror = resolveWeb(
    path.posix.join(CONFIG.mirrors[dir], mobile.slice(dir.length + 1))
  );
  if (mirror) {
    link(mirror, mobile, 'same path');
    linked = true;
  }

  // 2. Explicit mapping from seerr-sync.json
  for (const web of [CONFIG.map[mobile] ?? []].flat()) {
    link(resolveWeb(web) ?? web, mobile, 'mapped');
    linked = true;
  }

  const source = fs.readFileSync(path.join(ROOT, mobile), 'utf8');

  // 3. Direct imports of Seerr sources (@server/..., @seerr/...)
  for (const [, alias, target] of source.matchAll(
    /from\s+['"]@(server|seerr)\/([^'"]+)['"]/g
  )) {
    const base = alias === 'server' ? `server/${target}` : target;
    link(resolveWeb(base), mobile, 'imported');
  }

  // 4. Translation prefixes: getSeerrMessages('components.Foo.Bar')
  for (const [, prefix] of source.matchAll(
    /getSeerrMessages\(\s*['"]([^'"]+)['"]/g
  )) {
    if (!i18nPrefixes.has(prefix)) i18nPrefixes.set(prefix, new Set());
    i18nPrefixes.get(prefix).add(mobile);
    // components.Discover.StudioSlider -> src/components/Discover/StudioSlider
    if (prefix.startsWith('components.'))
      link(
        resolveWeb(`src/${prefix.replaceAll('.', '/')}`),
        mobile,
        'messages'
      );
    else linked ||= prefix === 'i18n';
  }

  if (
    !linked &&
    counterparts.size === before &&
    !CONFIG.mobileOnly.includes(mobile)
  )
    unmapped.push(mobile);
}

// --- Web changes -------------------------------------------------------------

const changes = seerrGit('diff', '--name-status', '-M', `${from}..${to}`)
  .split('\n')
  .filter(Boolean)
  .map((line) => {
    const [status, a, b] = line.split('\t');
    return { status: status[0], file: b ?? a, oldFile: b ? a : undefined };
  })
  .filter((c) => !isIgnored(c.file));

const commitsFor = (...files) =>
  seerrGit('log', '--format=%h %s', `${from}..${to}`, '--', ...files)
    .split('\n')
    .filter(Boolean);

const STATUS = {
  A: green('added   '),
  M: yellow('modified'),
  D: red('deleted '),
  R: cyan('renamed '),
};
const printChange = (c) =>
  `  ${STATUS[c.status] ?? c.status} ${c.oldFile ? `${c.oldFile} -> ` : ''}${c.file}`;

// Web files ported as UI, as opposed to Seerr sources only imported for types
const isUi = (web) =>
  [...(counterparts.get(web)?.values() ?? [])].some((r) => r !== 'imported');

const tracked = [];
const others = [];
for (const c of changes) {
  const mobiles = counterparts.get(c.file) ?? counterparts.get(c.oldFile);
  if (mobiles) tracked.push({ ...c, mobiles });
  else others.push(c);
}

// New web files imported by a tracked web file (at `to`): new sub-components
const importsOf = (file) => {
  if (!webFilesAtTo.has(file) || !/\.(ts|tsx)$/.test(file)) return [];
  const source = seerrGit('show', `${to}:${file}`);
  return [
    ...source.matchAll(/from\s+['"](@app|@server|\.{1,2})\/([^'"]+)['"]/g),
  ]
    .map(([, alias, target]) => {
      if (alias === '@app') return resolveWeb(`src/${target}`);
      if (alias === '@server') return resolveWeb(`server/${target}`);
      return resolveWeb(
        path.posix.join(path.posix.dirname(file), alias, target)
      );
    })
    .filter(Boolean);
};
const added = new Map(
  others.filter((c) => c.status === 'A').map((c) => [c.file, c])
);
const newDeps = new Map(); // new web file -> Set<tracked web file>
for (const web of [...counterparts.keys()].filter(isUi)) {
  for (const dep of importsOf(web)) {
    if (!added.has(dep)) continue;
    if (!newDeps.has(dep)) newDeps.set(dep, new Set());
    newDeps.get(dep).add(web);
  }
}

// --- Output -------------------------------------------------------------------

const out = [];
const section = (title) => out.push('', bold(title), '');

out.push(
  bold(`Seerr changes ${fromSha}..${toSha}`) +
    dim(` (${commitsFor().length} commits, ${changes.length} files)`)
);

const printTracked = (c) => {
  out.push(printChange(c));
  for (const [mobile, reason] of c.mobiles)
    out.push(`      ${cyan('→')} ${mobile} ${dim(`(${reason})`)}`);
  for (const commit of commitsFor(...[c.oldFile, c.file].filter(Boolean)))
    out.push(dim(`      ${commit}`));
  if (flag('--diff') && !c.file.endsWith('.json'))
    out.push(
      seerrGit(
        'diff',
        ...(color ? ['--color'] : []),
        `${from}..${to}`,
        '--',
        ...[c.oldFile, c.file].filter(Boolean)
      )
        .trimEnd()
        .replace(/^/gm, '      ')
    );
};
const ui = tracked.filter((c) => isUi(c.file) || isUi(c.oldFile));
const types = tracked.filter((c) => !ui.includes(c));
const byFile = (a, b) => a.file.localeCompare(b.file);

section(`1. Changed web files with a mobile counterpart (${ui.length})`);
ui.sort(byFile).forEach(printTracked);

section(`1b. Changed Seerr sources imported by the app (${types.length})`);
types.sort(byFile).forEach(printTracked);

section(`2. New web files imported by those counterparts (${newDeps.size})`);
for (const [dep, parents] of newDeps) {
  out.push(printChange(added.get(dep)));
  const list = [...parents];
  out.push(
    dim(
      `      imported by ${list.slice(0, 3).join(', ')}` +
        (list.length > 3 ? ` and ${list.length - 3} more` : '')
    )
  );
}

// Translation keys under prefixes used by the app
const readLocale = (ref) => {
  try {
    return JSON.parse(seerrGit('show', `${ref}:${CONFIG.locale}`));
  } catch {
    return {};
  }
};
const oldLocale = readLocale(from);
const newLocale = readLocale(to);
const prefixes = [...i18nPrefixes.keys()];
const keyChanges = [
  ...new Set([...Object.keys(oldLocale), ...Object.keys(newLocale)]),
]
  .filter((key) => prefixes.some((p) => key.startsWith(`${p}.`)))
  .filter((key) => oldLocale[key] !== newLocale[key])
  .sort();
section(
  `3. Translation keys changed under used prefixes (${keyChanges.length})`
);
for (const key of keyChanges) {
  if (!(key in oldLocale))
    out.push(`  ${green('+')} ${key} ${dim(JSON.stringify(newLocale[key]))}`);
  else if (!(key in newLocale)) out.push(`  ${red('-')} ${key}`);
  else
    out.push(
      `  ${yellow('~')} ${key} ${dim(`${JSON.stringify(oldLocale[key])} → ${JSON.stringify(newLocale[key])}`)}`
    );
}

const otherShown = others.filter(
  (c) => !newDeps.has(c.file) && (flag('--all') || c.file.startsWith('src/'))
);
section(
  `4. Other web changes, not ported yet (${otherShown.length})` +
    (flag('--all') ? '' : dim(' — src/ only, use --all for everything'))
);
const groups = Map.groupBy(otherShown, (c) =>
  c.file.split('/').slice(0, 3).join('/')
);
for (const [group, list] of [...groups].sort(([a], [b]) =>
  a.localeCompare(b)
)) {
  const commits = commitsFor(...list.map((c) => c.file));
  out.push(
    `  ${bold(group)} ${dim(`(${list.length} files, ${commits.length} commits)`)}`
  );
  for (const c of list) out.push('  ' + printChange(c));
}

if (flag('--unmapped')) {
  section(`Mobile files without a web counterpart (${unmapped.length})`);
  out.push(...unmapped.map((f) => `  ${f}`));
  out.push(dim('  Add them to "map" in seerr-sync.json if they have one.'));
}

console.log(out.join('\n'));
