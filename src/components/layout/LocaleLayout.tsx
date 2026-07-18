import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Navigate, Outlet, useParams } from "react-router-dom";
import { defaultLanguage, supportedLanguages, type SupportedLanguage } from "../../i18n";

export function LocaleLayout() {
  const { lang } = useParams<{ lang: string }>();
  const { i18n } = useTranslation();

  const isValid = supportedLanguages.includes(lang as SupportedLanguage);

  useEffect(() => {
    if (isValid && i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
  }, [lang, isValid, i18n]);

  if (!isValid) {
    return <Navigate to={`/${defaultLanguage}`} replace />;
  }

  document.documentElement.lang = lang as string;

  return <Outlet />;
}
