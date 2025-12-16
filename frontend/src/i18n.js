import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// English translations
import enRegistration from "./locales/en/registration-page-translation.json";
import enLogin from "./locales/en/login-page-translation.json";
import enCompleteProfile from "./locales/en/complete-profile-translation.json";
import enAdmin from "./locales/en/admin-translation.json";
import enForgotPassword from "./locales/en/forgot-password-translation.json";
import enResetPassword from "./locales/en/reset-password-translation.json";
import enAdminDashboard from "./locales/en/admin-dashboard-translation.json";

// Arabic translations
import arRegistration from "./locales/ar/registration-page-translation.json";
import arLogin from "./locales/ar/login-page-translation.json";
import arCompleteProfile from "./locales/ar/complete-profile-translation.json";
import arAdmin from "./locales/ar/admin-translation.json";
import arForgotPassword from "./locales/ar/forgot-password-translation.json";
import arResetPassword from "./locales/ar/reset-password-translation.json";
import arAdminDashboard from "./locales/ar/admin-dashboard-translation.json";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { 
        translation: {
          ...enRegistration,
          ...enLogin,
          ...enCompleteProfile,
          ...enAdmin,
          ...enForgotPassword,
          ...enResetPassword,
          ...enAdminDashboard
        }
      },
      ar: { 
        translation: {
          ...arRegistration,
          ...arLogin,
          ...arCompleteProfile,
          ...arAdmin,
          ...arForgotPassword,
          ...arResetPassword,
          ...arAdminDashboard
        }
      }
    },
    lng: "en", // default language
    fallbackLng: "en",
    interpolation: { escapeValue: false }
  });

export default i18n;
