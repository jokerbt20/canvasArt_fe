import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enCommon from "./locales/en/common.json";
import enHome from "./locales/en/home.json";
import enGallery from "./locales/en/gallery.json";
import enOffers from "./locales/en/offers.json";
import enCustomers from "./locales/en/customers.json";
import enContact from "./locales/en/contact.json";
import enCart from "./locales/en/cart.json";
import enAdmin from "./locales/en/admin.json";

import mkCommon from "./locales/mk/common.json";
import mkHome from "./locales/mk/home.json";
import mkGallery from "./locales/mk/gallery.json";
import mkOffers from "./locales/mk/offers.json";
import mkCustomers from "./locales/mk/customers.json";
import mkContact from "./locales/mk/contact.json";
import mkCart from "./locales/mk/cart.json";
import mkAdmin from "./locales/mk/admin.json";

export const supportedLanguages = ["en", "mk"] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];
// Macedonian is the default: the site always opens in Macedonian unless the URL or a saved
// preference says otherwise.
export const defaultLanguage: SupportedLanguage = "mk";

export const resources = {
  en: {
    common: enCommon,
    home: enHome,
    gallery: enGallery,
    offers: enOffers,
    customers: enCustomers,
    contact: enContact,
    cart: enCart,
    admin: enAdmin,
  },
  mk: {
    common: mkCommon,
    home: mkHome,
    gallery: mkGallery,
    offers: mkOffers,
    customers: mkCustomers,
    contact: mkContact,
    cart: mkCart,
    admin: mkAdmin,
  },
} as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: defaultLanguage,
    supportedLngs: supportedLanguages,
    ns: [
      "common",
      "home",
      "gallery",
      "offers",
      "customers",
      "contact",
      "cart",
      "admin",
    ],
    defaultNS: "common",
    interpolation: { escapeValue: false },
    detection: {
      // Browser language is intentionally omitted so an English browser doesn't override the
      // Macedonian default. A new visitor falls back to `mk`; the URL path and a saved choice win.
      order: ["path", "localStorage"],
      lookupFromPathIndex: 0,
      caches: ["localStorage"],
      lookupLocalStorage: "canvasart_lang",
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
