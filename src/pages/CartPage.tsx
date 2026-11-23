import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Trash2,
  Minus,
  Plus,
  AlertTriangle,
  CheckCircle2,
  MessageCircle,
  ShoppingBag,
  ArrowRight,
} from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';
import type { Order, ValidatedCartResponse } from '../types.ts';
import { formatRupiah } from '../utils/format.ts';
import { SafeImage } from '../components/SafeImage.tsx';

export function CartPage() {
  const { cart, replaceCart, updateCartQuantity, removeFromCart, clearCart, settings } = useStore();

  const [validated, setValidated] = useState<ValidatedCartResponse | null>(null);
  const [validating, setValidating] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [changesAccepted, setChangesAccepted] = useState(true);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'Pengiriman' | 'Ambil Sendiri'>('Pengiriman');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<{ order: Order; whatsappUrl: string } | null>(null);

  const validateCartFromServer = useCallback(
    async (itemsToCheck: typeof cart, acknowledgePrevious = false) => {
      if (itemsToCheck.length === 0) {
        setValidated({
          items: [],
          subtotal: 0,
          shippingFee: settings.shipping_fee || 0,
          whatsappNumber: settings.whatsapp_number,
          brandName: settings.brand_name,
          hasChanges: false,
          warnings: [],
        });
        setWarnings([]);
        setChangesAccepted(true);
        return null;
      }

      setValidating(true);
      try {
        const res = await fetch('/api/cart/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: itemsToCheck }),
        });
        if (!res.ok) throw new Error('Gagal memvalidasi harga & stok terbaru.');
        const data: ValidatedCartResponse = await res.json();
        setValidated(data);

        if (data.hasChanges) {
          setWarnings(data.warnings);
          if (!acknowledgePrevious) setChangesAccepted(false);
          replaceCart(
            data.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              clientPrice: item.unitPrice,
            }))
          );
        } else {
          // Ensure clientPrice mirrors official server price
          replaceCart(
            data.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              clientPrice: item.unitPrice,
            }))
          );
        }
        return data;
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : 'Gagal menghubungi server.');
        return null;
      } finally {
        setValidating(false);
      }
    },
    [replaceCart, settings.brand_name, settings.shipping_fee, settings.whatsapp_number]
  );

  useEffect(() => {
    validateCartFromServer(cart, false);
    // Validate on initial mount and whenever item count/product list structure changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart.length]);

  const handleQtyChange = async (productId: number, nextQty: number) => {
    if (nextQty <= 0) {
      removeFromCart(productId);
      const filtered = cart.filter((i) => i.productId !== productId);
      await validateCartFromServer(filtered, true);
      return;
    }
    updateCartQuantity(productId, nextQty);
    const nextItems = cart.map((i) => (i.productId === productId ? { ...i, quantity: nextQty } : i));
    await validateCartFromServer(nextItems, true);
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // Re-validate stock & official prices right before order submission
    const latest = await validateCartFromServer(cart, false);
    if (!latest || latest.items.length === 0) {
      setSubmitError('Keranjang Anda kosong atau produk tidak tersedia.');
      return;
    }
    if (latest.hasChanges) {
      setSubmitError('Ada pembaruan harga atau stok terbaru. Mohon tinjau dan setujui pembaruan keranjang di atas terlebih dahulu.');
      return;
    }
    if (!changesAccepted) {
      setSubmitError('Mohon konfirmasi persetujuan Anda terhadap pembaruan harga/stok di atas.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_address: customerAddress,
          delivery_method: deliveryMethod,
          notes,
          items: latest.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error || 'Gagal mencatat pesanan.');
        await validateCartFromServer(cart, false);
        return;
      }

      clearCart();
      setCompletedOrder({ order: data.order, whatsappUrl: data.whatsappUrl });

      // Trigger anchor click instead of window.open so iframe popup policies are respected gracefully
      const a = document.createElement('a');
      a.href = data.whatsappUrl;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {
      setSubmitError('Terjadi gangguan koneksi saat mengirim pesanan.');
    } finally {
      setSubmitting(false);
    }
  };

  if (completedOrder) {
    const { order, whatsappUrl } = completedOrder;
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl border border-[#CFB799]/60 p-8 sm:p-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#838655]/15 text-[#26351F] flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-[#838655]" />
          </div>
          <p className="text-xs font-semibold text-[#838655] mb-1">Pesanan Berhasil Dicatat</p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#26351F] mb-2">
            Nomor Pesanan: {order.order_number}
          </h1>
          <p className="text-sm text-[#333333]/80 mb-6">
            Stok produk telah diamankan untuk Anda. Klik tombol di bawah jika tab WhatsApp belum terbuka otomatis untuk mengirim rincian pesanan ke dapur kami.
          </p>

          <div className="bg-[#F7F6F2] rounded-2xl border border-[#CFB799]/40 p-5 text-left space-y-2 mb-6 text-sm">
            <div className="flex justify-between">
              <span className="text-[#333333]/75">Nama Pemesan</span>
              <span className="font-semibold text-[#26351F]">{order.customer_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#333333]/75">Metode</span>
              <span className="font-semibold text-[#26351F]">{order.delivery_method}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-[#CFB799]/40">
              <span className="font-bold text-[#26351F]">Total Pembayaran</span>
              <span className="font-bold text-[#26351F] tabular-nums">{formatRupiah(order.total_amount)}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[48px] inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#DDAE35] text-[#26351F] font-bold text-sm hover:bg-[#cfa028] transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Buka WhatsApp Konfirmasi</span>
            </a>
            <Link
              to="/products"
              className="min-h-[48px] inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#26351F] text-white font-semibold text-sm"
            >
              Belanja Menu Lainnya
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const items = validated?.items || [];
  const subtotal = validated?.subtotal || 0;
  const activeShippingFee = deliveryMethod === 'Ambil Sendiri' ? 0 : validated?.shippingFee ?? settings.shipping_fee ?? 0;
  const grandTotal = subtotal + (items.length > 0 ? activeShippingFee : 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#26351F] mb-2">Keranjang &amp; Checkout</h1>
      <p className="text-sm sm:text-base text-[#333333]/80 mb-8">
        Harga dan stok produk divalidasi langsung dari server sebelum Anda terhubung ke WhatsApp toko.
      </p>

      {/* Server Revalidation Warning Banner */}
      {warnings.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-900 mb-1">Pembaruan Otomatis Keranjang dari Server</p>
              <ul className="list-disc pl-4 text-xs sm:text-sm text-amber-800 space-y-1">
                {warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          </div>
          {!changesAccepted && (
            <button
              type="button"
              onClick={() => {
                setChangesAccepted(true);
                setSubmitError(null);
              }}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-[#26351F] text-white text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 cursor-pointer"
            >
              Setujui Pembaruan
            </button>
          )}
        </div>
      )}

      {items.length === 0 && !validating ? (
        <div className="bg-white rounded-3xl border border-[#CFB799]/50 p-12 text-center">
          <ShoppingBag className="w-12 h-12 text-[#838655] mx-auto mb-4 opacity-80" />
          <h2 className="font-display text-2xl font-bold text-[#26351F] mb-2">Keranjang Anda Masih Kosong</h2>
          <p className="text-sm text-[#333333]/80 mb-6">
            Tambahkan dimsum favorit Anda terlebih dahulu sebelum melakukan checkout.
          </p>
          <Link
            to="/products"
            className="min-h-[48px] inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#DDAE35] text-[#26351F] font-bold text-sm"
          >
            <span>Lihat Menu Dimsum</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cart Item List */}
          <div className="lg:col-span-7 space-y-4">
            {items.map((item) => (
              <div
                key={item.productId}
                className="bg-white rounded-2xl border border-[#CFB799]/50 p-4 sm:p-5 flex items-center gap-4"
              >
                <Link
                  to={`/products/${item.slug}`}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-[#E9E5DA] shrink-0"
                >
                  <SafeImage src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                </Link>

                <div className="flex-1 min-w-0">
                  <Link
                    to={`/products/${item.slug}`}
                    className="font-display text-base sm:text-lg font-bold text-[#26351F] hover:text-[#838655] line-clamp-1"
                  >
                    {item.name}
                  </Link>
                  <p className="text-xs text-[#333333]/70 mb-2">
                    {item.unitInfo} · Stok tersisa {item.stock}
                  </p>
                  <div className="flex items-baseline gap-2 tabular-nums">
                    <span className="text-sm sm:text-base font-bold text-[#26351F]">
                      {formatRupiah(item.unitPrice)}
                    </span>
                    {item.isPromo && item.originalPrice > item.unitPrice && (
                      <span className="text-xs text-[#333333]/50 line-through">
                        {formatRupiah(item.originalPrice)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div className="inline-flex items-center rounded-xl border border-[#CFB799] bg-[#F7F6F2]">
                    <button
                      type="button"
                      onClick={() => handleQtyChange(item.productId, item.quantity - 1)}
                      aria-label={`Kurangi ${item.name}`}
                      className="min-h-[44px] min-w-[40px] inline-flex items-center justify-center text-[#26351F] cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-bold text-[#26351F] tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      disabled={item.quantity >= item.stock}
                      onClick={() => handleQtyChange(item.productId, item.quantity + 1)}
                      aria-label={`Tambah ${item.name}`}
                      className="min-h-[44px] min-w-[40px] inline-flex items-center justify-center text-[#26351F] disabled:opacity-40 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-[#26351F] tabular-nums">
                      {formatRupiah(item.subtotal)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleQtyChange(item.productId, 0)}
                      aria-label={`Hapus ${item.name}`}
                      className="p-2 text-[#333333]/60 hover:text-red-700 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout Form & Summary */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-[#CFB799]/60 p-6 sm:p-7">
            <h2 className="font-display text-2xl font-bold text-[#26351F] mb-5">Data Pengiriman</h2>

            <form onSubmit={handleCheckoutSubmit} className="space-y-4">
              <div>
                <label htmlFor="cust-name" className="block text-xs font-semibold text-[#26351F] mb-1.5">
                  Nama Lengkap *
                </label>
                <input
                  id="cust-name"
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Contoh: Ibu Dewi Anggraini"
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-[#CFB799] bg-[#F7F6F2]/50 text-sm text-[#26351F] focus:outline-none focus:border-[#26351F]"
                />
              </div>

              <div>
                <label htmlFor="cust-phone" className="block text-xs font-semibold text-[#26351F] mb-1.5">
                  Nomor WhatsApp Aktif *
                </label>
                <input
                  id="cust-phone"
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-[#CFB799] bg-[#F7F6F2]/50 text-sm text-[#26351F] focus:outline-none focus:border-[#26351F]"
                />
              </div>

              <div>
                <span className="block text-xs font-semibold text-[#26351F] mb-1.5">Metode Pengambilan *</span>
                <div className="grid grid-cols-2 gap-2.5">
                  {(['Pengiriman', 'Ambil Sendiri'] as const).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setDeliveryMethod(method)}
                      className={`min-h-[44px] px-3 py-2 rounded-xl border text-sm font-semibold transition-colors cursor-pointer ${
                        deliveryMethod === method
                          ? 'bg-[#26351F] text-white border-[#26351F]'
                          : 'bg-white text-[#26351F] border-[#CFB799] hover:bg-[#E9E5DA]/50'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="cust-address" className="block text-xs font-semibold text-[#26351F] mb-1.5">
                  Alamat Lengkap {deliveryMethod === 'Ambil Sendiri' ? '(atau patokan lokasi Anda)' : '*'}
                </label>
                <textarea
                  id="cust-address"
                  required
                  rows={3}
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="Jalan, nomor rumah, RT/RW, kelurahan, patokan..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CFB799] bg-[#F7F6F2]/50 text-sm text-[#26351F] focus:outline-none focus:border-[#26351F]"
                />
              </div>

              <div>
                <label htmlFor="cust-notes" className="block text-xs font-semibold text-[#26351F] mb-1.5">
                  Catatan Tambahan (Opsional)
                </label>
                <input
                  id="cust-notes"
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Misal: Minta chili oil ekstra, kirim jam 4 sore"
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-[#CFB799] bg-[#F7F6F2]/50 text-sm text-[#26351F] focus:outline-none focus:border-[#26351F]"
                />
              </div>

              {/* Order Summary */}
              <div className="pt-4 border-t border-[#E9E5DA] space-y-2 text-sm tabular-nums">
                <div className="flex justify-between text-[#333333]/80">
                  <span>Subtotal Produk</span>
                  <span className="font-semibold text-[#26351F]">{formatRupiah(subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#333333]/80">
                  <span>Ongkos Kirim</span>
                  <span className="font-semibold text-[#26351F]">
                    {activeShippingFee > 0 ? formatRupiah(activeShippingFee) : 'Gratis'}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[#E9E5DA] text-base font-bold text-[#26351F]">
                  <span>Total Pembayaran</span>
                  <span>{formatRupiah(grandTotal)}</span>
                </div>
              </div>

              {submitError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs sm:text-sm text-red-800">
                  {submitError}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || validating || !changesAccepted}
                className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#DDAE35] text-[#26351F] font-bold text-sm sm:text-base hover:bg-[#cfa028] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <MessageCircle className="w-5 h-5" />
                <span>{submitting ? 'Memproses Pesanan...' : 'Kirim Pesanan via WhatsApp'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
