import { Suspense } from 'react';
import { getBanners } from '@/entities/banner/api/getBanners';
import { BannerSlider } from '@/widgets/banner-slider';
import { PopularProductsSection, PopularProductsSkeleton } from '@/widgets/popular-products';

export default async function Home() {
  const banners = await getBanners();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">
      <section>
        <BannerSlider banners={banners} />
      </section>

      <section id="popular">
        <Suspense fallback={<PopularProductsSkeleton />}>
          <PopularProductsSection />
        </Suspense>
      </section>
    </div>
  );
}
