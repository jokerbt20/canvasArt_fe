import { useTranslation } from "react-i18next";
import { PageMeta } from "../../components/common/PageMeta";
import { SettingsGroupEditor } from "../../components/admin/SettingsGroupEditor";

export default function AdminHomepagePage() {
  const { t } = useTranslation("admin");

  return (
    <>
      <PageMeta title={t("nav.homepage")} />
      <SettingsGroupEditor
        group="Homepage"
        title={t("nav.homepage")}
        fields={[
          { key: "hero.title", label: "Hero Title" },
          { key: "hero.subtitle", label: "Hero Subtitle" },
          { key: "about.title", label: "About Title" },
          { key: "about.body", label: "About Body", multiline: true },
        ]}
      />
    </>
  );
}
