import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import {
  defaultLanguage,
  supportedLanguages,
  type SupportedLanguage,
} from "../i18n";

export function useLocale() {
  const { i18n } = useTranslation();
  const { lang } = useParams<{ lang: string }>();
  const navigate = useNavigate();

  const locale: SupportedLanguage = supportedLanguages.includes(
    lang as SupportedLanguage,
  )
    ? (lang as SupportedLanguage)
    : defaultLanguage;

  const changeLocale = (next: SupportedLanguage) => {
    i18n.changeLanguage(next);
    const path = window.location.pathname.replace(/^\/(en|mk)/, `/${next}`);
    navigate(path + window.location.search, { replace: true });
  };

  return { locale, changeLocale };
}

export function localizedPath(locale: SupportedLanguage, path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `/${locale}${cleanPath === "/" ? "" : cleanPath}`;
}
