import fs from 'fs';
import path from 'path';
import i18n from 'i18n';

// Config function to load translations
export function config() {
  const translations = {};

  // Load all files from /locales folder
  fs.readdirSync('locales').forEach(folder => {
    translations[folder] = load(folder);
  });

  i18n.configure({
    defaultLocale: 'en',
    locales: ['en', 'es'],
    updateFiles: false,
    objectNotation: true,
    staticCatalog: translations,
  });
}

// Function to load translations for a specific locale
function load(locale) {
  const translations = {};
  const localePath = `./locales/${locale}`;

  fs.readdirSync(localePath).forEach(file => {
    const fileName = file.replace(`${locale}_`, '').replace('.json', '');
    const filePath = path.join(localePath, file);
    const fileContents = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    translations[fileName] = fileContents;
  });

  return translations;
}

// Function to get the correct plural form of a translation
export function plural(path, count) {
  const keys = path.split('.');
  const translation = i18n.__(keys.slice(0, -1).join('.'));
  const lastKey = keys[keys.length - 1];
  const pluralKey = count === 1 ? 'one' : 'other';
  return translation[lastKey][pluralKey];
}
