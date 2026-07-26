import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Button from "@mui/material/Button";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import SearchIcon from "@mui/icons-material/Search";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import i18n, { supportedLanguages } from "../../i18n";
import { PageMeta } from "../../components/common/PageMeta";
import { useSettings, useUpsertSettings } from "../../hooks/useContent";
import {
  buildTranslationEntries,
  namespaces,
  overrideKey,
  parseOverrideKey,
  I18N_SETTINGS_GROUP,
  type TranslationEntry,
} from "../../utils/i18nOverrides";

export default function AdminTranslationsPage() {
  const { t } = useTranslation("admin");
  const { data: settings } = useSettings(I18N_SETTINGS_GROUP);
  const upsert = useUpsertSettings();

  const entries = useMemo(() => buildTranslationEntries(), []);

  const [activeNs, setActiveNs] = useState<string>(namespaces[0] ?? "common");
  const [search, setSearch] = useState("");
  // Touched field values, keyed by full override key (e.g. "i18n.en.home.hero.title").
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  // Stored overrides currently persisted on the backend, keyed by override key.
  const overrides = useMemo(() => {
    const map: Record<string, string> = {};
    for (const s of settings ?? []) {
      if (parseOverrideKey(s.key) && s.value != null) map[s.key] = s.value;
    }
    return map;
  }, [settings]);

  const effective = (lang: string, entry: TranslationEntry): string => {
    const key = overrideKey(lang, entry.ns, entry.path);
    if (key in edits) return edits[key];
    if (key in overrides) return overrides[key];
    return entry.defaults[lang as (typeof supportedLanguages)[number]] ?? "";
  };

  const isOverridden = (entry: TranslationEntry): boolean =>
    supportedLanguages.some((lang) => {
      const key = overrideKey(lang, entry.ns, entry.path);
      const value = key in edits ? edits[key] : overrides[key];
      return value != null && value !== entry.defaults[lang];
    });

  const setField = (lang: string, entry: TranslationEntry, value: string) => {
    setEdits((prev) => ({ ...prev, [overrideKey(lang, entry.ns, entry.path)]: value }));
    setSaved(false);
  };

  const resetEntry = (entry: TranslationEntry) => {
    setEdits((prev) => {
      const next = { ...prev };
      for (const lang of supportedLanguages) {
        next[overrideKey(lang, entry.ns, entry.path)] = entry.defaults[lang];
      }
      return next;
    });
    setSaved(false);
  };

  const term = search.trim().toLowerCase();
  const visible = useMemo(() => {
    const inNs = entries.filter((e) => e.ns === activeNs);
    if (!term) return inNs;
    return inNs.filter((e) => {
      if (e.path.toLowerCase().includes(term)) return true;
      return supportedLanguages.some((lang) => effective(lang, e).toLowerCase().includes(term));
    });
    // effective depends on edits/overrides; recompute on those too.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries, activeNs, term, edits, overrides]);

  const pendingCount = Object.keys(edits).length;

  const handleSave = async () => {
    if (pendingCount === 0) return;
    try {
      await upsert.mutateAsync({
        settings: Object.entries(edits).map(([key, value]) => ({
          key,
          value,
          group: I18N_SETTINGS_GROUP,
        })),
      });
    } catch {
      // Error toast is shown globally; keep the edits so the user can retry.
      return;
    }

    // Reflect the change in the live UI immediately, without a reload.
    for (const [key, value] of Object.entries(edits)) {
      const parsed = parseOverrideKey(key);
      if (parsed) i18n.addResource(parsed.lang, parsed.ns, parsed.path, value);
    }
    void i18n.changeLanguage(i18n.language);

    setEdits({});
    setSaved(true);
  };

  return (
    <Box>
      <PageMeta title={t("nav.translations")} />

      <Stack spacing={1} sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ textTransform: "none", fontFamily: "inherit" }}>
          {t("translations.title")}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t("translations.subtitle")}
        </Typography>
      </Stack>

      {saved && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSaved(false)}>
          {t("translations.saved")}
        </Alert>
      )}

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{
          mb: 2,
          position: "sticky",
          top: 0,
          zIndex: 2,
          bgcolor: "background.default",
          py: 1.5,
          alignItems: { sm: "center" },
        }}
      >
        <TextField
          size="small"
          placeholder={t("translations.search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ maxWidth: 360, flex: 1 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
        <Box sx={{ flex: 1 }} />
        {pendingCount > 0 && (
          <Chip
            color="warning"
            variant="outlined"
            label={t("translations.pending", { count: pendingCount })}
          />
        )}
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={pendingCount === 0 || upsert.isPending}
          startIcon={upsert.isPending ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          {t("translations.save")}
        </Button>
      </Stack>

      <Tabs
        value={activeNs}
        onChange={(_, value) => setActiveNs(value)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 2, borderBottom: "1px solid", borderColor: "divider" }}
      >
        {namespaces.map((ns) => (
          <Tab key={ns} value={ns} label={ns} sx={{ textTransform: "none" }} />
        ))}
      </Tabs>

      {visible.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ py: 6, textAlign: "center" }}>
          {t("translations.noResults")}
        </Typography>
      ) : (
        <Stack spacing={2}>
          {visible.map((entry) => {
            const key = `${entry.ns}.${entry.path}`;
            return (
              <Box
                key={key}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.paper",
                  p: 2.5,
                }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ mb: 1.5, alignItems: "center", justifyContent: "space-between" }}
                >
                  <Stack direction="row" spacing={1} sx={{ alignItems: "center", minWidth: 0 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontFamily: "monospace", wordBreak: "break-all" }}
                    >
                      {entry.path}
                    </Typography>
                    {isOverridden(entry) && (
                      <Chip size="small" color="primary" variant="outlined" label={t("translations.overridden")} />
                    )}
                  </Stack>
                  <Tooltip title={t("translations.reset")}>
                    <span>
                      <IconButton size="small" onClick={() => resetEntry(entry)}>
                        <RestartAltIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Stack>

                <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                  {supportedLanguages.map((lang) => (
                    <TextField
                      key={lang}
                      fullWidth
                      multiline
                      minRows={1}
                      maxRows={8}
                      label={lang === "en" ? t("translations.english") : t("translations.macedonian")}
                      value={effective(lang, entry)}
                      onChange={(e) => setField(lang, entry, e.target.value)}
                    />
                  ))}
                </Stack>
              </Box>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}
