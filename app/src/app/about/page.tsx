import { Header } from '@/components/header';
import Footer from '@/components/footer';
import { Container } from '@/components/ui/container';

export default function AboutPage() {
  return (
    <>
      <Header />
      <Container>
        <div className="py-10">
          <h1 className="text-3xl font-bold">About Us</h1>
          <p className="mt-4 text-gray-600">
            This is the About page to demonstrate routing in Next.js.
          </p>
        </div>
      </Container>
      <Footer />
    </>
  );
}
