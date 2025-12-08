import { useCallback } from "react";
import { useTranslation } from "react-i18next";

const useLanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const switchLanguage = useCallback(() => {
    const newLang = i18n.language === "en" ? "ar" : "en";
    i18n.changeLanguage(newLang);

    // Update direction (rtl / ltr)
    document.body.dir = newLang === "ar" ? "rtl" : "ltr";
  }, [i18n]);

  const isArabic = i18n.language === "ar";

  return { switchLanguage, isArabic, currentLang: i18n.language };
};

export default useLanguageSwitcher;
