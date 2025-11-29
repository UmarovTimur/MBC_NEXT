import { Container } from "@/components/ui/container";

export default function Footer() {
  return (
    <footer className="bg-white border-t">
      <Container>
        <div className="mx-auto py-10">
          <p className="text-center text-xs text-black">
            &copy; 2024 MBC NEXT. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
}
