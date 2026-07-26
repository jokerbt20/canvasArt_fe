import { useTranslation } from "react-i18next";
import { PageMeta } from "../../components/common/PageMeta";
import { HeroSlideshow } from "./sections/HeroSlideshow";
import { FeaturedPaintingsSection } from "./sections/FeaturedPaintingsSection";
import { FeaturedCategoriesSection } from "./sections/FeaturedCategoriesSection";
import { FramesSection } from "./sections/FramesSection";
import { ContactBanner } from "./sections/ContactBanner";

export default function HomePage() {
  const { t } = useTranslation("home");

  return (
    <>
      <PageMeta title={t("hero.eyebrow")} description={t("hero.subtitle")} />
      <HeroSlideshow />
      <FeaturedPaintingsSection />
      <FeaturedCategoriesSection />
      <FramesSection />
      <ContactBanner />
    </>
  );
}
