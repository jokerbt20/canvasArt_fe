import i18n, { resources, supportedLanguages, type SupportedLanguage } from "../i18n";
import { contentService } from "../services/contentService";
import type { Setting } from "../types";

/**
 * Admin-editable translations.
 *
 * The bundled JSON files in src/i18n/locales are the *defaults*. Any string an admin
 * changes in the dashboard is stored as an "override" in the backend key-value settings
 * store (group "i18n") and merged on top of the defaults when the app boots. Nothing is
 * hardcoded — every t() string can be re-authored at runtime without a rebuild.
 */
export const I18N_SETTINGS_GROUP = "i18n";
const KEY_PREFIX = "i18n.";

/** A single translatable string, identified by namespace + dotted key path. */
export interface TranslationEntry {
  ns: string;
  path: string;
  defaults: Record<SupportedLanguage, string>;
}

type JsonObject = { [key: string]: unknown };

/** Flatten a nested locale object into `{ "a.b.c": "value" }`, keeping only string leaves. */
function flatten(obj: JsonObject, prefix = "", out: Record<string, string> = {}): Record<string, string> {
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      flatten(value as JsonObject, path, out);
    } else if (typeof value === "string") {
      out[path] = value;
    }
  }
  return out;
}

/** Namespaces in a stable order (English bundle is the source of truth for keys). */
export const namespaces = Object.keys(resources.en) as string[];

/** Build the full catalog of translatable entries from the bundled resources. */
export function buildTranslationEntries(): TranslationEntry[] {
  const entries: TranslationEntry[] = [];

  for (const ns of namespaces) {
    const flatByLang: Record<string, Record<string, string>> = {};
    for (const lang of supportedLanguages) {
      const bundle = (resources[lang] as Record<string, JsonObject>)[ns] ?? {};
      flatByLang[lang] = flatten(bundle);
    }

    // Union of paths across all languages (EN drives the order; MK-only keys still surface).
    const paths = new Set<string>();
    for (const lang of supportedLanguages) {
      Object.keys(flatByLang[lang]).forEach((p) => paths.add(p));
    }

    for (const path of [...paths].sort()) {
      const defaults = {} as Record<SupportedLanguage, string>;
      for (const lang of supportedLanguages) {
        defaults[lang] = flatByLang[lang][path] ?? "";
      }
      entries.push({ ns, path, defaults });
    }
  }

  return entries;
}

/** Encode a translatable string as a settings key, e.g. `i18n.en.home.hero.titleLine1`. */
export function overrideKey(lang: string, ns: string, path: string): string {
  return `${KEY_PREFIX}${lang}.${ns}.${path}`;
}

/** Decode a settings key back into its parts, or null if it is not an i18n override. */
export function parseOverrideKey(key: string): { lang: string; ns: string; path: string } | null {
  if (!key.startsWith(KEY_PREFIX)) return null;
  const parts = key.slice(KEY_PREFIX.length).split(".");
  if (parts.length < 3) return null;
  const [lang, ns, ...pathParts] = parts;
  return { lang, ns, path: pathParts.join(".") };
}

/** Merge a set of overrides into the live i18n instance, on top of the bundled defaults. */
export function applyOverrides(settings: Setting[]): void {
  for (const setting of settings) {
    const parsed = parseOverrideKey(setting.key);
    if (!parsed || setting.value == null) continue;
    if (!supportedLanguages.includes(parsed.lang as SupportedLanguage)) continue;
    // keySeparator defaults to "." so a dotted path nests correctly.
    i18n.addResource(parsed.lang, parsed.ns, parsed.path, setting.value);
  }
}

/**
 * Fetch overrides from the backend and merge them before the app renders.
 * Never throws and never hangs indefinitely — on any failure the bundled defaults stand.
 */
export async function loadI18nOverrides(timeoutMs = 4000): Promise<void> {
  try {
    const settings = await Promise.race([
      contentService.getSettings(I18N_SETTINGS_GROUP),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("i18n overrides timeout")), timeoutMs)),
    ]);
    applyOverrides(settings as Setting[]);
  } catch {
    // Ignore — bundled translations remain in effect.
  }
}
