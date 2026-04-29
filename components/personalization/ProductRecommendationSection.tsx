import type { Product } from "@prisma/client";
import { ProductCard } from "@/components/ui/ProductCard";

type ProductRecommendationSectionProps = {
  title: string;
  subtitle: string;
  products: Product[];
};

export function ProductRecommendationSection({
  title,
  subtitle,
  products,
}: ProductRecommendationSectionProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="mt-12 border-t border-brand-500/10 pt-9 lg:mt-14">
      <h2 className="font-display text-2xl font-semibold text-white sm:text-3xl">{title}</h2>
      <p className="mt-2 text-sm text-zinc-500">{subtitle}</p>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <div key={product.id} className="h-full">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
