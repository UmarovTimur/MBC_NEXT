import { getI18n } from "@/app/providers/I18n/server";
import { AppLink } from "@/shared/ui/AppLink";
import { ContainerWidth } from "@/shared/ui/Container";

export default function NotFound() {
  const { t } = getI18n();

  return (
    <ContainerWidth>
      <div className="mx-auto max-w-xl py-16 text-center">
        <p className="mb-2 font-(family-name:--font-roboto-condensed) text-7xl font-black text-muted-foreground">404</p>
        <h1 className="mb-4 text-3xl font-bold">{t("notFoundTitle")}</h1>
        <p className="mb-8 text-muted-foreground">{t("notFoundDescription")}</p>
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 font-medium">
          <AppLink href="/">{t("breadcrumbHome")}</AppLink>
          <AppLink href="/azb">{t("oldTestament")} / {t("newTestament")}</AppLink>
          <AppLink href="/barclay">Barclay</AppLink>
          <AppLink href="/books">{t("books")}</AppLink>
        </nav>
      </div>
    </ContainerWidth>
  );
}
