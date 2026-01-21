import { ContainerWidth } from "@/shared/ui/Container";

export default function BooksPage() {
  return (
    <ContainerWidth className={""}>
      <div className="py-10">
        <h1 className="text-3xl font-bold">Books page</h1>
        <p className="mt-4 text-gray-600">This is the About page to demonstrate routing in Next.js.</p>
      </div>
    </ContainerWidth>
  );
}
