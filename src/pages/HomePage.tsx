import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Leaf, ShieldCheck, Flame, MessageCircle, Star } from 'lucide-react';
import type { Product, Testimonial } from '../types.ts';
import { useStore } from '../context/StoreContext.tsx';
import { ProductCard } from '../components/ProductCard.tsx';
import { SafeImage } from '../components/SafeImage.tsx';

const ADVANTAGES = [
  {
    icon: Leaf,
    title: 'Bahan Berkualitas',
    description: 'Daging paha ayam pilihan, udang segar harian, dan bumbu dapur alami tanpa pengawet buatan.',
  },
  {
    icon: ShieldCheck,
    title: 'Fresh & Higienis',
    description: 'Diproses setiap pagi di dapur berstandar bersih dengan kemasan rapi dan aman untuk keluarga.',
  },
  {
    icon: Flame,
    title: 'Praktis Disajikan',
    description: 'Tersedia siap santap hangat maupun kemasan frozen vacuum yang siap dikukus dalam 10 menit.',
  },
  {
    icon: MessageCircle,
    title: 'Pesan Mudah via WhatsApp',
    description: 'Pilih menu di katalog, validasi keranjang otomatis, dan konfirmasi langsung ke WhatsApp dapur.',
  },
];

export function HomePage() {
  const { settings, categories } = useStore();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function loadHome() {
      try {
        const [prodRes, testRes] = await Promise.all([
          fetch('/api/products?sort=popular'),
          fetch('/api/testimonials'),
        ]);
        if (!active) return;
        if (prodRes.ok) {
          const pData = await prodRes.json();
          const all: Product[] = pData.products || [];
          const highlighted = all.filter((p) => p.is_best_seller || p.is_promo || p.is_new_arrival);
          setFeaturedProducts((highlighted.length > 0 ? highlighted : all).slice(0, 8));
        }
        if (testRes.ok) {
          const tData = await testRes.json();
          setTestimonials(tData.testimonials || []);
        }
      } catch {
        // Handled cleanly via empty state
      } finally {
        if (active) setLoading(false);
      }
    }
    loadHome();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div>
      {/* 2-Column Editorial Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-14">
        <div className="bg-[#E9E5DA] rounded-3xl overflow-hidden border border-[#CFB799]/50 grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-6 p-8 sm:p-12 lg:p-14 flex flex-col justify-center">
            <p className="text-xs sm:text-sm font-semibold text-[#838655] tracking-wide mb-3">
              {settings.brand_name} · Produksi Segar Setiap Hari
            </p>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#26351F] leading-[1.15] text-balance mb-5">
              Dimsum Lezat, Hangat, dan Bikin Ketagihan.
            </h1>
            <p className="text-base sm:text-lg text-[#333333] leading-relaxed max-w-xl mb-8">
              Diracik hangat dari resep rumahan dengan daging ayam dan udang pilihan, kulit lembut, serta cocolan chili oil aromatik. Siap menemani santap keluarga maupun stok freezer di rumah.
            </p>

            <div className="flex flex-wrap items-center gap-3.5">
              <Link
                to="/products"
                className="min-h-[48px] inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#DDAE35] text-[#26351F] font-bold text-sm sm:text-base hover:bg-[#cfa028] transition-colors whitespace-nowrap"
              >
                <span>Pesan Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/promotions"
                className="min-h-[48px] inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#26351F] text-white font-semibold text-sm sm:text-base hover:bg-[#1e2a18] transition-colors whitespace-nowrap"
              >
                Jelajahi Menu
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 min-h-[280px] sm:min-h-[380px] lg:min-h-full relative">
            <SafeImage
              src="/src/assets/images/hero_dimsum_feast_1795412481233.jpg"
              alt="Sajian dimsum artisanal hangat dalam klakat bambu"
              className="w-full h-full object-cover lg:absolute lg:inset-0"
            />
          </div>
        </div>

        {/* 4 Advantages Bento Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mt-6">
          {ADVANTAGES.map((adv) => {
            const Icon = adv.icon;
            return (
              <div
                key={adv.title}
                className="bg-white rounded-2xl border border-[#CFB799]/40 p-5 sm:p-6 flex flex-col gap-2.5"
              >
                <div className="w-10 h-10 rounded-xl bg-[#E9E5DA] text-[#26351F] flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h2 className="font-display text-lg font-bold text-[#26351F]">{adv.title}</h2>
                <p className="text-sm text-[#333333]/85 leading-relaxed">{adv.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Visual Categories Section */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#26351F]">Kategori Pilihan</h2>
              <p className="text-sm sm:text-base text-[#333333]/80 mt-1">
                Pilih varian favorit Anda dari siap santap hingga kemasan stok beku.
              </p>
            </div>
            <Link
              to="/products"
              className="text-sm font-semibold text-[#26351F] hover:text-[#838655] inline-flex items-center gap-1.5 whitespace-nowrap"
            >
              <span>Lihat Semua Menu</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/products?category=${encodeURIComponent(cat.slug)}`}
                className="group bg-white rounded-2xl border border-[#CFB799]/45 p-3 flex flex-col items-center text-center hover:border-[#26351F] transition-colors"
              >
                <div className="w-full aspect-square rounded-xl overflow-hidden bg-[#E9E5DA] mb-2.5">
                  <SafeImage
                    src={cat.image_url}
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-[#26351F] line-clamp-2 leading-tight">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products ("Favorit Pelanggan") */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#26351F]">Favorit Pelanggan</h2>
            <p className="text-sm sm:text-base text-[#333333]/80 mt-1">
              Menu terlaris, promo hemat, dan varian terbaru langsung dari dapur kami.
            </p>
          </div>
          <Link
            to="/products"
            className="min-h-[44px] inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[#26351F] text-white text-sm font-semibold hover:bg-[#1e2a18] transition-colors whitespace-nowrap self-start sm:self-auto"
          >
            Buka Katalog Lengkap
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-[#CFB799]/30 p-4 h-80 animate-pulse" />
            ))}
          </div>
        ) : featuredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#CFB799]/40 p-10 text-center">
            <p className="text-[#333333]">Belum ada produk unggulan yang tersedia saat ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Customer Testimonials */}
      {testimonials.length > 0 && (
        <section className="bg-[#E9E5DA] py-14 mt-6 border-y border-[#CFB799]/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-8">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#26351F]">Kata Pelanggan Kami</h2>
              <p className="text-sm sm:text-base text-[#333333]/80 mt-1">
                Cerita hangat dari keluarga dan pelanggan yang telah menikmati racikan {settings.brand_name}.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((item) => (
                <article
                  key={item.id}
                  className="bg-white rounded-2xl border border-[#CFB799]/45 p-6 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-1 mb-3" aria-label={`Rating ${item.rating} dari 5`}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < item.rating ? 'fill-[#DDAE35] text-[#DDAE35]' : 'text-[#CFB799]'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm sm:text-base text-[#333333] leading-relaxed mb-5">"{item.content}"</p>
                  </div>

                  <div className="pt-4 border-t border-[#E9E5DA] flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold text-[#26351F]">{item.customer_name}</p>
                      <p className="text-xs text-[#333333]/70">{item.role}</p>
                    </div>
                    {item.is_demo && (
                      <span className="text-[11px] text-[#333333]/55 whitespace-nowrap">Ulasan Demonstrasi</span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
