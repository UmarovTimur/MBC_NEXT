import { Header } from '@/components/header';
import Footer from '@/components/footer';
import { Container } from '@/components/ui/container';

export default function Home() {
  return (
    <>
      <Header />
      <Container>
        <div className="space-y-10 pb-10">
          <div className="p-4 sm:p-6 lg:p-8 rounded-lg overflow-hidden">
            <div
              className="rounded-lg relative aspect-square md:aspect-[2.4/1] overflow-hidden bg-cover"
              style={{ backgroundImage: `url(/hero-bg.jpg)` }} // Placeholder or remove if no image
            >
              <div className="h-full w-full flex flex-col justify-center items-center text-center gap-y-8 bg-black/40">
                <div className="font-bold text-3xl sm:text-5xl lg:text-6xl sm:max-w-xl max-w-xs text-white">
                  Welcome to MBC NEXT
                  <p className="text-lg text-white/80 mt-4 font-normal">
                    A basic page with Header, Footer, and Container.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
      <Footer />
    </>
  );
}
