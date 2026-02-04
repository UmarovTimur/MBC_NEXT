import { AppLink } from "@/shared/ui/AppLink";

export function Footer() {
  return (
    <footer className="border-t border-border outline-ring/50">
      <div className="mx-auto p-5">
        <div className="flex justify-center gap-x-5 gap-y-2 flex-wrap ">
          <AppLink href="https://kitobook.com/">KITOBLAR</AppLink>
          <AppLink href="https://www.kitobook.com/kitoblar/">Audiokitoblar</AppLink>
          <AppLink href="https://www.kitobook.com/category/book/hikoyalar-kitobi/">Ҳикоялар китоби</AppLink>
          <AppLink href="https://kitobook.com/uzmusic">UZMUSIC</AppLink>
          <AppLink href="https://www.kitobook.com/mcdonald/">MakDonald Sharhlar</AppLink>
          <AppLink href="https://www.kitobook.com/video/kino/">KINOLAR &amp; Multfimlar</AppLink>
          <AppLink href="https://www.kitobook.com/yes">NAJOT XABARI</AppLink>
          <AppLink href="https://www.kitobook.com/gospel/">Xushxabar hikoyalari</AppLink>
          <AppLink href="https://www.kitobook.com/krk/">Qaraqalpaqsha Kitap</AppLink>
          <AppLink href="https://uzlatin.com/">UzLatin</AppLink>
        </div>
      </div>
    </footer>
  );
}
