import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import es from './locales/es.json'
import en from './locales/en.json'

// El idioma se persiste en localStorage bajo la clave 'sga-lang' para sobrevivir recargas
void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      es: { translation: es },
      en: { translation: en },
    },
    fallbackLng: 'es',
    supportedLngs: ['es', 'en'],
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'sga-lang',
    },
    interpolation: {
      // React ya escapa los valores por defecto — no hace falta doble escape
      escapeValue: false,
    },
  })

export default i18n
