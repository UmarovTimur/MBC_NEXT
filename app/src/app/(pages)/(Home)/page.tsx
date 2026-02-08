"use client";

import { AppLink } from "@/shared/ui/AppLink";
import { Button } from "@/shared/ui/button";
import { ContainerWidth } from "@/shared/ui/Container";
export const dynamic = "force-static";

export default function HomePage() {
  // const router = useRouter();

  // useEffect(() => {
  //   router.replace("/mbc/40/0/");
  // }, [router]);

  return (
    <main className="mt-8 lg:mt-16">
      <ContainerWidth>
        <div className="py-4 sm:py-6 lg:py-8 rounded-lg overflow-hidden">
          <div className="rounded-lg relative aspect-square md:aspect-[2.4/1] overflow-hidden bg-cover">
            <div className="h-full w-full flex flex-col justify-center items-center text-center gap-y-8 bg-black/40">
              <div className="font-bold text-3xl px-4 sm:text-5xl lg:text-6xl max-w-xl text-white dark:text-white/80">
                Barclay şərhləri
                <p className="text-white/80 mb-4 dark:text-white/60 mt-4 text-base font-normal">
                  Şərhlər Qlazqo Universitetində Yeni Əhdi öyrənən kafedranın müəllimi tərəfindən yazılmışdır.
                </p>
                <Button size="lg" variant="outline" asChild className="text-foreground">
                  <AppLink href="/barclay/40/0">Oxu</AppLink>
                </Button>
                <div className="flex flex-wrap"></div>
              </div>
            </div>
          </div>
        </div>
      </ContainerWidth>
    </main>
  );
}
