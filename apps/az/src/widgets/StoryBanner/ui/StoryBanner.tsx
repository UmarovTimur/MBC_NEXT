import { ContainerWidth } from "@/shared/ui/Container";
import { PromoBanner } from "@mbc/ui";

export function StoryBanner() {
  return (
    <ContainerWidth className="mb-10">
      <PromoBanner
        href="https://101story.org/az/"
        title="Müqəddəs Kitab hekayələri"
        subtitle="100-dən çox illüstrasiyalı hekayə — oxuyun və dinləyin"
        tagline="Yaradılışdan Vəhyə qədər • Pulsuz • Ailə üçün"
        buttonLabel="Oxumağa başla"
        domain="101story.org"
        images={[
          "https://101story.org/img/640/01.webp",
          "https://101story.org/img/640/10.webp",
          "https://101story.org/img/640/04.webp",
        ]}
        imageAlt="Müqəddəs Kitab hekayələri"
        logoSrc="https://101story.org/icon-192.png"
        titleClassName="font-(family-name:--font-roboto-condensed)"
      />
    </ContainerWidth>
  );
}
