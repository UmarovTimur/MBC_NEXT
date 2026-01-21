export function Footer() {
  return (
    <footer className="border-t border-border outline-ring/50">
      <div className="mx-auto p-5">
        <div
          className="flex justify-center flex-wrap text-sm text-gray-600 
                      dark:text-gray-500 gap-x-5 gap-y-2
                      [&_a]:transition-color
                      [&_a:hover]:text-blue-500 dark:[&_a:hover]:text-blue-300 "
        >
          <a href="https://kitobook.com/">KITOBLAR</a>
          <a href="https://www.kitobook.com/kitoblar/">Audiokitoblar</a>
          <a href="https://www.kitobook.com/category/book/hikoyalar-kitobi/">Ҳикоялар китоби</a>
          <a href="https://kitobook.com/uzmusic">UZMUSIC</a>
          <a href="https://www.kitobook.com/mcdonald/">MakDonald Sharhlar</a>
          <a href="https://www.kitobook.com/video/kino/">KINOLAR &amp; Multfimlar</a>
          <a href="https://www.kitobook.com/yes">NAJOT XABARI</a>
          <a href="https://www.kitobook.com/gospel/">Xushxabar hikoyalari</a>
          <a href="https://www.kitobook.com/krk/">Qaraqalpaqsha Kitap</a>
          <a href="https://uzlatin.com/">UzLatin</a>
        </div>
      </div>
    </footer>
  );
}
