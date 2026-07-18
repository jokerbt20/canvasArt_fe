import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { defaultLanguage, supportedLanguages, type SupportedLanguage } from "../../i18n";

export function RootRedirect() {
  const { i18n } = useTranslation();
  const detected = i18n.language?.slice(0, 2) as SupportedLanguage;
  const target = supportedLanguages.includes(detected) ? detected : defaultLanguage;
  return <Navigate to={`/${target}`} replace />;
}
