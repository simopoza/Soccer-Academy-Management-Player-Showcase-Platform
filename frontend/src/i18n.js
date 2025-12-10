import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// English translations
import enRegistration from "./locales/en/registration-page-translation.json";
import enLogin from "./locales/en/login-page-translation.json";
import enCompleteProfile from "./locales/en/complete-profile-translation.json";
import enAdmin from "./locales/en/admin-translation.json";

// Arabic translations
import arRegistration from "./locales/ar/registration-page-translation.json";
import arLogin from "./locales/ar/login-page-translation.json";
import arCompleteProfile from "./locales/ar/complete-profile-translation.json";
import arAdmin from "./locales/ar/admin-translation.json";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { 
        translation: {
          ...enRegistration,
          ...enLogin,
          ...enCompleteProfile,
          ...enAdmin
        }
      },
      ar: { 
        translation: {
          ...arRegistration,
          ...arLogin,
          ...arCompleteProfile,
          ...arAdmin
        }
      }
    },
    lng: "en", // default language
    fallbackLng: "en",
    interpolation: { escapeValue: false }
  });

export default i18n;
