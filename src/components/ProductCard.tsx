import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import type { Product } from '../types.ts';
import { formatRupiah, getEffectivePrice } from '../utils/format.ts';
import { useStore } from '../context/StoreContext.tsx';
import { SafeImage } from './SafeImage.tsx';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useStore();
  const effectivePrice = getEffectivePrice(product);
  const hasDiscount = product.is_promo && product.discount_price && product.discount_price < product.price;
  const outOfStock = product.stock <= 0;

  let highlightTag: { label: string; tone: string } | null = null;
  if (product.is_promo && hasDiscount) {
    highlightTag = { label: 'Promo', tone: 'bg-[#DDAE35] text-[#26351F]' };
  } else if (product.is_best_seller) {
    highlightTag = { label: 'Best Seller', tone: 'bg-[#838655] text-white' };
  } else if (product.is_new_arrival) {
    highlightTag = { label: 'Menu Baru', tone: 'bg-[#26351F] text-white' };
  }

  return (
    <article className="group bg-white rounded-2xl border border-[#CFB799]/45 overflow-hidden flex flex-col transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <Link to={`/products/${product.slug}`} className="relative block aspect-square bg-[#E9E5DA] overflow-hidden">
        <SafeImage
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        {highlightTag && (
          <span
            className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg text-xs font-semibold tracking-tight ${highlightTag.tone}`}
          >
            {highlightTag.label}
          </span>
        )}
        {outOfStock && (
          <div className="absolute inset-0 bg-[#26351F]/55 flex items-center justify-center">
            <span className="px-3 py-1.5 rounded-lg bg-white text-[#26351F] text-xs font-semibold">
              Stok Habis
            </span>
          </div>
        )}
      </Link>

      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        <div className="flex items-center justify-between gap-2 text-xs text-[#333333]/70 mb-1.5">
          <span className="truncate">{product.category_name || 'Dimsum'}</span>
          <span aria-hidden="true">·</span>
          <span className="whitespace-nowrap shrink-0 tabular-nums">{product.unit_info}</span>
        </div>

        <Link
          to={`/products/${product.slug}`}
          className="font-display text-lg font-semibold text-[#26351F] leading-snug hover:text-[#838655] transition-colors line-clamp-2 mb-2"
        >
          {product.name}
        </Link>

        <div className="mt-auto pt-3 border-t border-[#E9E5DA]">
          <div className="flex items-baseline gap-2 mb-3 tabular-nums">
            <span className="text-lg font-bold text-[#26351F]">{formatRupiah(effectivePrice)}</span>
            {hasDiscount && (
              <span className="text-xs text-[#333333]/55 line-through">{formatRupiah(product.price)}</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/products/${product.slug}`}
              className="flex-1 min-h-[44px] inline-flex items-center justify-center px-3 py-2 rounded-xl border border-[#CFB799] text-xs sm:text-sm font-semibold text-[#26351F] hover:bg-[#E9E5DA]/60 transition-colors whitespace-nowrap"
            >
              Lihat Detail
            </Link>
            <button
              type="button"
              disabled={outOfStock}
              onClick={() => addToCart(product.id, 1, effectivePrice, product.name)}
              aria-label={`Tambah ${product.name} ke keranjang`}
              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#DDAE35] text-[#26351F] text-xs sm:text-sm font-bold hover:bg-[#cfa028] disabled:bg-[#E9E5DA] disabled:text-[#333333]/40 disabled:cursor-not-allowed transition-colors whitespace-nowrap cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">{outOfStock ? 'Habis' : 'Tambah'}</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
