"use client";

import { AppLink } from "@/shared/ui/AppLink";
import { Button } from "@/shared/ui/button";
import { ContainerWidth } from "@/shared/ui/Container";
export const dynamic = "force-static";

export default function HomePage() {

  return (
    <>
      <ContainerWidth>
        <div className="py-4 sm:py-6 lg:py-8 rounded-lg overflow-hidden">
          <div className="rounded-lg relative aspect-square md:aspect-[2.4/1] overflow-hidden bg-cover">
            <div className="h-full w-full flex flex-col justify-center items-center text-center gap-y-8 bg-black/40">
              <div className="font-bold text-3xl px-4 sm:text-5xl lg:text-6xl max-w-xl text-white dark:text-white/80">
                Vilyam Barklinin şərhləri
                <p className="text-white/80 mb-4 dark:text-white/60 mt-4 text-base font-normal">
                  Müqəddəs Kitabın şərhi Qlazqo Universitetinin Əhdi-Cədid
                  Tədqiqatları Departamentinin professoru tərəfindən yazılmışdır.
                  Professor Əhdi-Cədidi və qədim yunan dilini tədris etmişdir.
                </p>
                <Button size="lg" variant="outline" asChild className="text-foreground">
                  <AppLink href="/barclay/40/0">Oxu</AppLink>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </ContainerWidth>
    </>
  );
}