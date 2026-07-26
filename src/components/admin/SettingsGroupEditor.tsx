import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import { SubmitButton } from "../common/SubmitButton";
import { useSettings, useUpsertSettings } from "../../hooks/useContent";

export interface SettingFieldDef {
  key: string;
  label: string;
  multiline?: boolean;
}

interface SettingsGroupEditorProps {
  group: string;
  title: string;
  fields: SettingFieldDef[];
}

export function SettingsGroupEditor({ group, title, fields }: SettingsGroupEditorProps) {
  const { t } = useTranslation("common");
  const { data: settings, isLoading } = useSettings(group);
  const upsertSettings = useUpsertSettings();
  const [values, setValues] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!settings) return;
    const map: Record<string, string> = {};
    for (const field of fields) {
      map[field.key] = settings.find((s) => s.key === field.key)?.value ?? "";
    }
    setValues(map);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  const handleSave = async () => {
    try {
      await upsertSettings.mutateAsync({
        settings: fields.map((field) => ({
          key: field.key,
          value: values[field.key] ?? "",
          group,
        })),
      });
      setSaved(true);
    } catch {
      // Error toast is shown globally; leave the form as-is so the user can retry.
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4, textTransform: "none", fontFamily: "inherit" }}>
        {title}
      </Typography>

      {saved && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSaved(false)}>
          {t("status.saved", "Saved successfully.")}
        </Alert>
      )}

      <Box sx={{ border: "1px solid", borderColor: "divider", bgcolor: "background.paper", p: 4, maxWidth: 640 }}>
        <Stack spacing={2.5}>
          {fields.map((field) => (
            <TextField
              key={field.key}
              fullWidth
              label={field.label}
              value={values[field.key] ?? ""}
              onChange={(e) => setValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
              disabled={isLoading}
              multiline={field.multiline}
              minRows={field.multiline ? 4 : undefined}
            />
          ))}
          <SubmitButton variant="contained" onClick={handleSave} loading={upsertSettings.isPending} sx={{ alignSelf: "flex-start" }}>
            {t("actions.save")}
          </SubmitButton>
        </Stack>
      </Box>
    </Box>
  );
}
