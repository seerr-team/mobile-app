import enLocale from '@/jellyseerr/src/i18n/locale/en.json';
import { defineMessages as intlDefineMessages } from 'react-intl';
const localeValues: Record<string, string> = enLocale;

export default function getJellyseerrMessages(prefix: string) {
  const keys = Object.keys(enLocale).filter((key) =>
    key.startsWith(prefix + '.')
  );
  const messages: Record<string, { id: string; defaultMessage: string }> = {};
  for (const key of keys) {
    messages[key.replace(prefix + '.', '')] = {
      id: key,
      defaultMessage: localeValues[key],
    };
  }
  return intlDefineMessages(messages);
}
