import { AppLink } from "@/shared/ui/AppLink";

export function Footer() {
  return (
    <footer className="border-t border-border outline-ring/50">
      <div className="mx-auto p-5">
        <div className="flex justify-center gap-x-5 gap-y-2 flex-wrap text-sm ">
          <AppLink href="https://kitobook.com/">KİTABLAR</AppLink>
          <AppLink href="https://www.kitobook.com/kitoblar/">Audio kitablar</AppLink>
          <AppLink href="https://www.kitobook.com/category/book/hikoyalar-kitobi/">Hekayələr</AppLink>
          <AppLink href="https://kitobook.com/uzmusic">İlahilər</AppLink>
          <AppLink href="https://www.kitobook.com/video/kino/">Filmlər və cizgi filmləri</AppLink>
          <AppLink href="https://www.kitobook.com/yes">Xilas haqqında müjdə</AppLink>
          <AppLink href="https://www.kitobook.com/gospel/">Xoş xəbər hekayələri</AppLink>
        </div>
      </div>
    </footer>
  );
}
