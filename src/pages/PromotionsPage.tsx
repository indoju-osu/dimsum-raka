import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../types.ts';
import { ProductCard } from '../components/ProductCard.tsx';

export function PromotionsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch('/api/products?promo=true')
      .then((res) => res.json())
      .then((data) => {
        if (active) setProducts(data.products || []);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-[#26351F] text-white rounded-3xl p-8 sm:p-12 mb-10">
        <p className="text-xs sm:text-sm font-semibold text-[#DDAE35] mb-2">Penawaran Terbatas</p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-3">
          Promo Hemat Dimsum Pilihan
        </h1>
        <p className="text-sm sm:text-base text-[#E9E5DA]/90 max-w-2xl leading-relaxed">
          Nikmati potongan harga langsung untuk varian dimsum spesial dan paket hemat keluarga. Stok promo diperbarui setiap hari mengikuti ketersediaan dapur.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl h-80 animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#CFB799]/50 p-12 text-center">
          <h2 className="font-display text-xl font-bold text-[#26351F] mb-2">Belum Ada Promo Aktif</h2>
          <p className="text-sm text-[#333333]/80 mb-5">Jelajahi seluruh menu lezat kami di katalog lengkap.</p>
          <Link
            to="/products"
            className="min-h-[44px] inline-flex items-center px-5 py-2.5 rounded-xl bg-[#DDAE35] text-[#26351F] font-bold text-sm"
          >
            Lihat Semua Produk
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
