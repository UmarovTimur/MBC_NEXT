import { Container } from "@/components/ui/container";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-border outline-ring/50">
      <Container>
        <div className="mx-auto py-5">
          <p className="text-center text-xs text-black">
            &copy; 2024 MBC NEXT. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
}
