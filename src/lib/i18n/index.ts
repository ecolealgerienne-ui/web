/**
 * Export central pour i18n
 */

export { I18nProvider, useLocale } from './provider';
export { useTranslations, useCommonTranslations, useErrorTranslations, useNavigationTranslations } from './hooks';
export { locales, defaultLocale, localeNames, isRTL, type Locale } from './config';
