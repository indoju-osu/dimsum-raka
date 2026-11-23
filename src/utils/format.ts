import type { Product } from '../types.ts';

export function formatRupiah(amount: number): string {
  return `Rp${Number(amount || 0).toLocaleString('id-ID')}`;
}

export function getEffectivePrice(product: Pick<Product, 'price' | 'discount_price' | 'is_promo'>): number {
  if (product.is_promo && product.discount_price && product.discount_price < product.price) {
    return product.discount_price;
  }
  return product.price;
}

export function normalizeWhatsappNumber(phone: string): string {
  let digits = String(phone || '').replace(/\D/g, '');
  if (digits.startsWith('0')) {
    digits = '62' + digits.slice(1);
  } else if (!digits.startsWith('62') && digits.length > 0) {
    digits = '62' + digits;
  }
  return digits || '6281234567890';
}

export function buildDirectProductWhatsAppUrl(
  storePhone: string,
  brandName: string,
  product: Product,
  quantity: number
): string {
  const phone = normalizeWhatsappNumber(storePhone);
  const price = getEffectivePrice(product);
  const total = price * quantity;
  const text = [
    `Halo *${brandName}*, saya ingin memesan langsung:`,
    '',
    `Produk: *${product.name}* (${product.unit_info})`,
    `Jumlah: ${quantity} porsi`,
    `Estimasi Harga: ${formatRupiah(total)}`,
    '',
    'Apakah stok tersedia hari ini? Terima kasih.',
  ].join('\n');
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export function formatDateId(isoDate: string): string {
  try {
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(isoDate));
  } catch {
    return isoDate;
  }
}

export function formatDateTimeId(isoDate: string): string {
  try {
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(isoDate));
  } catch {
    return isoDate;
  }
}
