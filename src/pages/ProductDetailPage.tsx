import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, ShoppingBag, MessageCircle, Info } from 'lucide-react';
import type { Product } from '../types.ts';
import { useStore } from '../context/StoreContext.tsx';
import { buildDirectProductWhatsAppUrl, formatRupiah, getEffectivePrice } from '../utils/format.ts';
import { SafeImage } from '../components/SafeImage.tsx';
import { ProductCard } from '../components/ProductCard.tsx';

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { settings, addToCart } = useStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setNotFound(false);
    setQuantity(1);

    fetch(`/api/products/${encodeURIComponent(slug || '')}`)
      .then(async (res) => {
        if (res.status === 404) {
          if (active) setNotFound(true);
          return null;
        }
        if (!res.ok) throw new Error('Gagal memuat produk');
        return res.json();
      })
      .then((data) => {
        if (active && data) {
          setProduct(data.product);
          setRelated(data.related || []);
        }
      })
      .catch(() => {
        if (active) setNotFound(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-pulse">
          <div className="lg:col-span-6 aspect-square bg-[#E9E5DA] rounded-3xl" />
          <div className="lg:col-span-6 space-y-4">
            <div className="h-6 w-32 bg-[#E9E5DA] rounded" />
            <div className="h-10 w-3/4 bg-[#E9E5DA] rounded" />
            <div className="h-24 bg-[#E9E5DA] rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="font-display text-3xl font-bold text-[#26351F] mb-3">Produk Tidak Ditemukan</h1>
        <p className="text-[#333333]/80 mb-6">Menu yang Anda cari mungkin sudah tidak tersedia atau berpindah halaman.</p>
        <Link
          to="/products"
          className="min-h-[44px] inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#DDAE35] text-[#26351F] font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Katalog</span>
        </Link>
      </div>
    );
  }

  const effectivePrice = getEffectivePrice(product);
  const hasDiscount = product.is_promo && product.discount_price && product.discount_price < product.price;
  const outOfStock = product.stock <= 0;
  const directWaUrl = buildDirectProductWhatsAppUrl(settings.whatsapp_number, settings.brand_name, product, quantity);

  const badgeLabels: string[] = [];
  if (product.is_best_seller) badgeLabels.push('Best Seller');
  if (product.is_promo && hasDiscount) badgeLabels.push('Promo');
  if (product.is_new_arrival) badgeLabels.push('Menu Baru');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <Link
        to="/products"
        className="inline-flex items-center gap-2 text-sm font-medium text-[#26351F] hover:text-[#838655] mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Semua Produk</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Sticky Left Image */}
        <div className="lg:col-span-6 lg:sticky lg:top-24">
          <div className="aspect-square rounded-3xl overflow-hidden bg-[#E9E5DA] border border-[#CFB799]/50">
            <SafeImage src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Contiguous Purchase Module */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-[#CFB799]/50 p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-[#838655] font-semibold mb-2">
            <span>{product.category_name || 'Dimsum'}</span>
            {badgeLabels.length > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span>{badgeLabels.join(' · ')}</span>
              </>
            )}
          </div>

          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#26351F] leading-tight mb-3">
            {product.name}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-sm text-[#333333]/80 mb-5">
            <span>Isi kemasan: <strong className="text-[#26351F]">{product.unit_info}</strong></span>
            {product.variant && (
              <>
                <span aria-hidden="true">·</span>
                <span>Varian: <strong className="text-[#26351F]">{product.variant}</strong></span>
              </>
            )}
          </div>

          <div className="flex items-baseline gap-3 pb-5 border-b border-[#E9E5DA] tabular-nums">
            <span className="text-3xl font-bold text-[#26351F]">{formatRupiah(effectivePrice)}</span>
            {hasDiscount && (
              <span className="text-base text-[#333333]/50 line-through">{formatRupiah(product.price)}</span>
            )}
          </div>

          <div className="py-5 space-y-4 border-b border-[#E9E5DA]">
            <p className="text-sm sm:text-base text-[#333333] leading-relaxed">{product.description}</p>

            {product.serving_suggestion && (
              <div className="bg-[#F7F6F2] rounded-2xl border border-[#CFB799]/40 p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-[#838655] shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-[#26351F] mb-1">Saran Penyajian &amp; Penyimpanan</p>
                  <p className="text-xs sm:text-sm text-[#333333]/90 leading-relaxed">{product.serving_suggestion}</p>
                </div>
              </div>
            )}
          </div>

          {/* Stock & Quantity */}
          <div className="pt-5 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[#333333]">Ketersediaan Stok</span>
              <span
                className={`text-sm font-bold tabular-nums ${
                  outOfStock ? 'text-red-700' : product.stock <= 5 ? 'text-amber-700' : 'text-[#26351F]'
                }`}
              >
                {outOfStock ? 'Stok Habis' : `Tersedia ${product.stock} porsi`}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[#333333]">Jumlah Pesanan</span>
              <div className="inline-flex items-center rounded-xl border border-[#CFB799] bg-[#F7F6F2]">
                <button
                  type="button"
                  disabled={outOfStock || quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Kurangi jumlah"
                  className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-[#26351F] disabled:opacity-40 cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-bold text-[#26351F] tabular-nums">{outOfStock ? 0 : quantity}</span>
                <button
                  type="button"
                  disabled={outOfStock || quantity >= product.stock}
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  aria-label="Tambah jumlah"
                  className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-[#26351F] disabled:opacity-40 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                disabled={outOfStock}
                onClick={() => addToCart(product.id, quantity, effectivePrice, product.name)}
                className="min-h-[48px] inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#DDAE35] text-[#26351F] font-bold text-sm hover:bg-[#cfa028] disabled:bg-[#E9E5DA] disabled:text-[#333333]/40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{outOfStock ? 'Stok Habis' : 'Tambah ke Keranjang'}</span>
              </button>

              {outOfStock ? (
                <button
                  type="button"
                  disabled
                  className="min-h-[48px] inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#E9E5DA] text-[#333333]/40 font-semibold text-sm cursor-not-allowed"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Pesan Langsung via WhatsApp</span>
                </button>
              ) : (
                <a
                  href={directWaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[48px] inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#26351F] text-white font-semibold text-sm hover:bg-[#1e2a18] transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Pesan Langsung via WhatsApp</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="mt-16 pt-12 border-t border-[#CFB799]/40">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#26351F] mb-6">Menu Lainnya yang Cocok</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
