import { ContainerWidth } from "@/shared/ui/Container";

export default function HomePage() {
  return (
    <>
      <ContainerWidth>
        <div className="py-4 sm:py-6 lg:py-8 rounded-lg overflow-hidden">
          <div className="rounded-lg relative aspect-square md:aspect-[2.4/1] overflow-hidden bg-cover">
            <div className="h-full w-full flex flex-col justify-center items-center text-center gap-y-8 bg-black/40">
              <div className="font-bold text-3xl sm:text-5xl lg:text-6xl max-w-xl text-white dark:text-white/80">
                Uilyam MakDonald taniqli ilohiyot o‘qituvchisi.
                <p className="text-lg text-white/80 dark:text-white/60 mt-4 font-normal">
                  Комментарии к Библии МакДональда на Узбекском языке.
                </p>
              </div>
            </div>
          </div>
        </div>
      </ContainerWidth>
    </>
  );
}
