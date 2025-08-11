/* eslint-disable no-console */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Get the version from the command line arguments
const version = process.argv[2];
if (!version) {
  console.error('Please provide a version number as an argument.');
  process.exit(1);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// app.json
const appJsonPath = path.join(__dirname, '../app.json');
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
appJson.expo.version = version;
fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + '\n');

// package.json
const packageJsonPath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
packageJson.version = version;
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

// package-lock.json
const packageLockJsonPath = path.join(__dirname, '../package-lock.json');
const packageLockJson = JSON.parse(
  fs.readFileSync(packageLockJsonPath, 'utf8')
);
packageLockJson.version = version;
packageLockJson.packages[''].version = version;
fs.writeFileSync(
  packageLockJsonPath,
  JSON.stringify(packageLockJson, null, 2) + '\n'
);

console.log(
  `Version updated to ${version} in app.json, package.json, and package-lock.json`
);
