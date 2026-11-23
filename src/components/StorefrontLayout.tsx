import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { ShoppingBag, Menu, X, MapPin, Clock, Phone, CheckCircle2 } from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';
import { normalizeWhatsappNumber } from '../utils/format.ts';

const NAV_LINKS = [
  { to: '/', label: 'Beranda', end: true },
  { to: '/products', label: 'Semua Produk' },
  { to: '/promotions', label: 'Promo' },
  { to: '/about', label: 'Tentang Kami' },
  { to: '/articles', label: 'Artikel' },
];

export function StorefrontLayout() {
  const { settings, totalCartQuantity, toastMessage, dismissToast } = useStore();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const waHref = `https://wa.me/${normalizeWhatsappNumber(settings.whatsapp_number)}?text=${encodeURIComponent(
    `Halo ${settings.brand_name}, saya ingin bertanya tentang menu dimsum.`
  )}`;

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F6F2] text-[#333333]">
      {/* Sticky Top Header (3-zone contract) */}
      <header className="sticky top-0 z-40 bg-[#F7F6F2]/95 backdrop-blur-md border-b border-[#CFB799]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-[72px] flex items-center justify-between gap-6">
          {/* Zone 1: Brand wordmark */}
          <Link
            to="/"
            className="font-display text-xl sm:text-2xl font-bold tracking-tight text-[#26351F] whitespace-nowrap shrink-0"
          >
            {settings.brand_name}
          </Link>

          {/* Zone 2: Single-line nav links */}
          <nav className="hidden lg:flex items-center gap-7" aria-label="Navigasi Utama">
            {NAV_LINKS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `text-sm font-medium whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors ${
                    isActive
                      ? 'text-[#26351F] border-[#DDAE35] font-semibold'
                      : 'text-[#333333]/80 border-transparent hover:text-[#26351F] hover:border-[#CFB799]'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Zone 3: Cart & Primary CTA */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <Link
              to="/cart"
              aria-label={`Keranjang belanja (${totalCartQuantity} item)`}
              className="relative min-h-[44px] min-w-[44px] px-3 inline-flex items-center justify-center gap-2 rounded-xl border border-[#CFB799] bg-white text-[#26351F] hover:bg-[#E9E5DA]/60 transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="text-sm font-semibold tabular-nums">{totalCartQuantity}</span>
            </Link>

            <Link
              to="/products"
              className="hidden sm:inline-flex min-h-[44px] items-center justify-center px-5 py-2.5 rounded-xl bg-[#DDAE35] text-[#26351F] text-sm font-bold hover:bg-[#cfa028] transition-colors whitespace-nowrap shrink-0"
            >
              Pesan Sekarang
            </Link>

            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Buka menu navigasi"
              className="lg:hidden min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl border border-[#CFB799] bg-white text-[#26351F] cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-[#26351F]/50"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <aside className="relative ml-auto w-72 max-w-[85vw] h-full bg-[#F7F6F2] border-l border-[#CFB799] p-6 flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-5 border-b border-[#CFB799]/50">
                <span className="font-display text-lg font-bold text-[#26351F]">{settings.brand_name}</span>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Tutup menu"
                  className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl text-[#26351F] hover:bg-[#E9E5DA] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="mt-6 flex flex-col gap-2">
                {NAV_LINKS.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => setDrawerOpen(false)}
                    className={({ isActive }) =>
                      `min-h-[44px] px-4 rounded-xl flex items-center text-base font-medium transition-colors ${
                        isActive ? 'bg-[#26351F] text-white' : 'text-[#26351F] hover:bg-[#E9E5DA]'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
                <Link
                  to="/cart"
                  onClick={() => setDrawerOpen(false)}
                  className="min-h-[44px] px-4 rounded-xl flex items-center justify-between text-base font-medium text-[#26351F] hover:bg-[#E9E5DA]"
                >
                  <span>Keranjang</span>
                  <span className="font-bold tabular-nums">{totalCartQuantity}</span>
                </Link>
              </nav>
            </div>

            <div className="pt-6 border-t border-[#CFB799]/50 space-y-3">
              <Link
                to="/products"
                onClick={() => setDrawerOpen(false)}
                className="w-full min-h-[44px] inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[#DDAE35] text-[#26351F] text-sm font-bold"
              >
                Pesan Sekarang
              </Link>
              <Link
                to="/admin"
                onClick={() => setDrawerOpen(false)}
                className="block text-center text-xs font-medium text-[#333333]/70 hover:text-[#26351F] py-2"
              >
                Masuk Dashboard Admin
              </Link>
            </div>
          </aside>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-50 max-w-sm bg-[#26351F] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-[#838655]"
        >
          <CheckCircle2 className="w-5 h-5 text-[#DDAE35] shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
          <Link
            to="/cart"
            onClick={dismissToast}
            className="text-xs font-bold text-[#DDAE35] underline whitespace-nowrap ml-2"
          >
            Lihat Keranjang
          </Link>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Dynamic Store Footer */}
      <footer className="bg-[#26351F] text-[#F7F6F2] mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            <div className="lg:col-span-2">
              <h2 className="font-display text-2xl font-bold text-white mb-3">{settings.brand_name}</h2>
              <p className="text-sm text-[#E9E5DA]/85 leading-relaxed max-w-md mb-5">
                {settings.description}
              </p>
              <p className="text-xs text-[#CFB799] leading-relaxed max-w-md">{settings.shipping_info}</p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[#DDAE35] mb-4">Jelajahi</h3>
              <ul className="space-y-2.5 text-sm text-[#E9E5DA]/85">
                <li>
                  <Link to="/products" className="hover:text-white transition-colors">
                    Semua Menu Dimsum
                  </Link>
                </li>
                <li>
                  <Link to="/promotions" className="hover:text-white transition-colors">
                    Promo Spesial
                  </Link>
                </li>
                <li>
                  <Link to="/articles" className="hover:text-white transition-colors">
                    Artikel &amp; Tips Kukus
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="hover:text-white transition-colors">
                    Tentang Dapur Kami
                  </Link>
                </li>
                <li>
                  <Link to="/cart" className="hover:text-white transition-colors">
                    Keranjang &amp; Checkout
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[#DDAE35] mb-4">Kontak &amp; Lokasi</h3>
              <ul className="space-y-3 text-sm text-[#E9E5DA]/85">
                <li className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#DDAE35] shrink-0 mt-0.5" />
                  <span>{settings.address}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-[#DDAE35] shrink-0 mt-0.5" />
                  <span>{settings.operational_hours}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Phone className="w-4 h-4 text-[#DDAE35] shrink-0 mt-0.5" />
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white underline underline-offset-4"
                  >
                    WhatsApp ({settings.whatsapp_number})
                  </a>
                </li>
                {(settings.instagram || settings.tiktok) && (
                  <li className="pt-1 text-xs text-[#CFB799]">
                    {settings.instagram && <span>IG: {settings.instagram}</span>}
                    {settings.instagram && settings.tiktok && <span className="mx-2">·</span>}
                    {settings.tiktok && <span>TikTok: {settings.tiktok}</span>}
                  </li>
                )}
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#E9E5DA]/70">
            <p>
              &copy; {new Date().getFullYear()} {settings.brand_name}. Seluruh hak cipta dilindungi.
            </p>
            <Link to="/admin" className="hover:text-white transition-colors">
              Portal Pengelola Toko
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
