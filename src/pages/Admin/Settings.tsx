import Stack from "@mui/material/Stack";
import { useTranslation } from "react-i18next";
import { PageMeta } from "../../components/common/PageMeta";
import { SettingsGroupEditor } from "../../components/admin/SettingsGroupEditor";

export default function AdminSettingsPage() {
  const { t } = useTranslation("admin");

  return (
    <>
      <PageMeta title={t("nav.settings")} />
      <Stack spacing={6}>
        <SettingsGroupEditor
          group="General"
          title="General"
          fields={[
            { key: "site.name", label: "Site Name" },
            { key: "site.currency", label: "Currency" },
          ]}
        />
        <SettingsGroupEditor
          group="Contact"
          title="Contact Information"
          fields={[
            { key: "contact.address", label: "Address" },
            { key: "contact.phone", label: "Phone" },
            { key: "contact.email", label: "Email" },
            { key: "contact.hours", label: "Working Hours" },
          ]}
        />
      </Stack>
    </>
  );
}
