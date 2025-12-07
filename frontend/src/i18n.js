import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en/registration-page-translation.json";
import ar from "./locales/ar/registration-page-translation.json";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ar: { translation: ar }
    },
    lng: "en", // default language
    fallbackLng: "en",
    interpolation: { escapeValue: false }
  });

export default i18n;
