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
    <>
      <ContainerWidth>
        <div className="py-4 sm:py-6 lg:py-8 rounded-lg overflow-hidden">
          <div className="rounded-lg relative aspect-square md:aspect-[2.4/1] overflow-hidden bg-cover">
            <div className="h-full w-full flex flex-col justify-center items-center text-center gap-y-8 bg-black/40">
              <div className="font-bold text-3xl sm:text-5xl lg:text-6xl max-w-xl text-white dark:text-white/80">
                Uilyam MakDonald taniqli ilohiyot o‘qituvchisi
                <p className="text-white/80 dark:text-white/60 mt-4 text-base font-normal">
                  Комментарии к Библии МакДональда на Узбекском языке.
                </p>
                <Button size="lg" variant="outline" asChild className="text-foreground">
                  <AppLink href="/mbc/40/0">O'qing</AppLink>
                </Button>
                <div className="flex flex-wrap"></div>
              </div>
            </div>
          </div>
        </div>
      </ContainerWidth>
      <section>
        <ContainerWidth className="xl:max-w-4xl">
          <div className="py-5 font-light">
            <p>
              <strong>Uilyam Makdonald </strong>- mashhur ilohiyot o‘qituvchisi, oltmishdan ortiq kitob muallifi,
              ularning ba’zilari allaqachon o’zbek tiliga tarjima qilingan. U 1947-1965-yillarda &quot;Emmaus&quot;
              Muqaddas Kitob maktabida dars bergan, 1959-yildan esa shu maktabning rahbari bo‘lgan.
            </p>
            <p>Makdonaldning Muqaddas Kitobga yozgan sharhlari</p>
            <p>Uilyam Makdonaldning fikrlari haqida</p>
            <h3 className="text-xl/16 font-bold">Muallif haqida</h3>
            <p>Uilyam (Bill) Makdonald 1917-yil 7-yanvarda Massachusets shtatining Leominster shahrida tug‘ilgan.</p>
            <p>
              30 yoshida Uilyam Makdonald Xudoga Muqaddas Kitobga sharhlar yozib, Yangi Ahdni oyatma-oyat tushuntirib
              berish va’dasini berdi. Mana shu va’daning ijrosi - qirq yildan ortiq vaqt davomida Muqaddas Kitobni
              chuqur o‘rganish, ko‘p yillik o‘qituvchilik faoliyati va Rabbga izchil xizmat qilishning samarasi. Muallif
              uchun shunchaki ma’lumot yoki nazariy bilimlarni yetkazish emas, balki Rabbimiz Iso Masihning
              ulug‘vorligini va U amalga oshirgan ishlarni ko‘rsatish, Muqaddas Kitobdagi o‘zaro bog‘liqliklarni
              tushuntirish, shu tariqa talqinni pand-nasihat bilan birlashtirish muhimdir.
            </p>
            <p>
              O‘qish oson bo‘lgan bu sharhlar o‘quvchini Xudoning Kalomini muntazam va uzluksiz o‘rganishga hamda
              Muqaddas Kitob boyliklaridan zavqlanishga undaydi.
            </p>
            <p>
              Shuning uchun barcha maqolalar amaliyot bilan chambarchas bog‘liq, ularni o‘qish e’tiqodda dalda beradi.
              Makdonald Muqaddas Kitobning murakkab joylarini chetlab o‘tmaydi, balki ularni batafsil tushuntiradi,
              muhim mavzularni alohida yoritadi.
            </p>
            <p>
              Uilyam Makdonald - mashhur ilohiyot o‘qituvchisi, oltmishdan ortiq kitob muallifi, ularning ba’zilari
              allaqachon rus tiliga tarjima qilingan. U 1947-1965-yillarda &quot;Emmaus&quot; Muqaddas Kitob maktabida
              dars bergan, 1959-yildan esa shu maktabning rahbari bo‘lgan. 1973-1996-yillarda u cherkov ichki Muqaddas
              Kitob maktabi xodimlari jamoasiga a’zo bo‘lgan. 1996-yildan so‘ng Uilyam Makdonald vafotiga qadar, ya’ni
              2007-yil 25-dekabrgacha Muqaddas Kitob xizmatida bo‘ldi.
            </p>
            <h3 className="text-xl/16 font-bold">Muallif so‘zboshisi</h3>
            <p>
              &rdquo;Masihiylar uchun Muqaddas Kitob sharhlari&quot; kitobining maqsadi - oddiy masihiyga Xudoning
              Kalomini jiddiy o‘rganishni boshlashda yordam berishdir. Ammo shuni yodda tutish kerakki, hech qanday
              sharhlar kitobi Muqaddas Kitobning o‘rnini bosa olmaydi. Bunday nashrlar qila oladigan eng yaxshi narsa -
              umumiy tushunchalarni tushunarli tarzda tushuntirish va o‘quvchini keyingi o‘rganish uchun Muqaddas
              Kitobga yo‘naltirishdir.
            </p>
            <p>
              Sharhlar oddiy, ommabop tilda yozilgan. Ular ilmiy yoki chuqur ilohiyotshunoslik tadqiqoti darajasiga
              da’vo qilmaydi. Ko‘p masihiylar Eski va Yangi Ahdning asl tillarini bilishmaydi, ammo bu ularni Kalomning
              amaliy foydasidan uzoqlashtirmaydi. Ishonchim komilki, Muqaddas Yozuvlarni muntazam o‘rganish orqali har
              bir masihiy &rdquo;benuqson ishlovchi, haqiqat so‘zini to‘g‘ri tushuntiruvchi&quot; bo‘lishi mumkin (2
              Timo‘tiy 2:15).
            </p>
            <p>
              Sharhlar qisqaligi, aniqligi va maqsadga yo‘naltirilganligi bilan ajralib turadi. Biror parchani
              tushunishda yordam olish uchun o‘quvchiga uzun tushuntirish sahifalarini o‘qib chiqishning hojati yo‘q.
              Zamonaviy hayot sur’ati haqiqatni ma’lumotnoma ko‘rinishida bayon etishni talab qiladi. Sharhlar Muqaddas
              Kitobning tushunish qiyin bo‘lgan joylarini chetlab o‘tmaydi. Ko‘p hollarda muqobil tushuntirishlar
              keltiriladi, bu esa o‘quvchiga ulardan qaysi biri matn mazmuniga va umuman Muqaddas Kitobga ko‘proq mos
              kelishini o‘zi hal qilish imkonini beradi.
            </p>
            <p>
              Faqat Muqaddas Kitobni bilishning o‘zi yetarli emas. Kalomni hayotda amalda qo‘llash zarur. Shu sababli,
              sharhlar Muqaddas Kitobni Xudo insonining hayotida qanday qo‘llash mumkinligi haqida maslahat berishga
              intiladi. Agar bu kitobdan Muqaddas Kitobdan ajralgan holda foydalanilsa, u yordamchidan ko‘ra ko‘proq
              tuzoqqa aylanadi; agar u o‘quvchini Muqaddas Yozuvlarni shaxsan o‘rganishga va Xudoning amrlariga itoat
              etishga undasa, demak u o‘z maqsadiga erishgan bo‘ladi.
            </p>
            <p>
              Muqaddas Kitobni qamrab olgan Muqaddas Ruh o‘quvchiga ajoyib intilish - Xudoni Uning Kalomi orqali bilish
              yo‘lini yoritib bersin.
            </p>
            <p>* - sharhlarga so‘zboshi yozgan paytida, u butun umri davomida 84 dan ortiq kitob yozgan.</p>
          </div>
          <div className="flex my-5 justify-center">
            <Button size="lg" asChild className="w-40 mx-auto">
              <AppLink variant="button" href="/mbc/40/0">
                O'qing
              </AppLink>
            </Button>
          </div>
        </ContainerWidth>
      </section>
    </>
  );
}
