import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Tags,
  ClipboardList,
  FileText,
  MessageSquareQuote,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  AlertTriangle,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext.tsx';

const ADMIN_NAV = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Produk & Stok', icon: Package },
  { to: '/admin/categories', label: 'Kategori', icon: Tags },
  { to: '/admin/orders', label: 'Pesanan', icon: ClipboardList },
  { to: '/admin/articles', label: 'Artikel', icon: FileText },
  { to: '/admin/testimonials', label: 'Testimoni', icon: MessageSquareQuote },
  { to: '/admin/settings', label: 'Pengaturan', icon: Settings },
];

export function AdminLayout() {
  const { settings } = useStore();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [usingDefaultPassword, setUsingDefaultPassword] = useState(false);
  const [username, setUsername] = useState('admin');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    let active = true;
    fetch('/api/auth/me', { credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) {
          if (active) navigate('/admin/login', { replace: true });
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (active && data) {
          setUsername(data.user?.username || 'admin');
          setUsingDefaultPassword(Boolean(data.usingDefaultPassword));
          setChecking(false);
        }
      })
      .catch(() => {
        if (active) navigate('/admin/login', { replace: true });
      });

    return () => {
      active = false;
    };
  }, [navigate]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    navigate('/admin/login', { replace: true });
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-[#F7F6F2] flex items-center justify-center text-sm font-medium text-[#26351F]">
        Memeriksa sesi administrator...
      </div>
    );
  }

  const SidebarContent = (
    <div className="h-full flex flex-col justify-between bg-[#26351F] text-[#F7F6F2] p-5">
      <div>
        <div className="pb-5 mb-5 border-b border-white/15">
          <p className="text-xs font-semibold text-[#DDAE35] mb-1">Panel Pengelola</p>
          <p className="font-display text-lg font-bold text-white leading-snug">{settings.brand_name}</p>
          <p className="text-xs text-[#E9E5DA]/70 mt-1">Masuk sebagai {username}</p>
        </div>

        <nav className="space-y-1.5" aria-label="Menu Admin">
          {ADMIN_NAV.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `min-h-[44px] px-3.5 rounded-xl flex items-center gap-3 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#DDAE35] text-[#26351F] font-bold'
                      : 'text-[#E9E5DA]/85 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="pt-5 border-t border-white/15 space-y-2">
        <Link
          to="/"
          className="min-h-[44px] px-3.5 rounded-xl flex items-center gap-3 text-sm font-medium text-[#E9E5DA]/85 hover:bg-white/10 hover:text-white transition-colors"
        >
          <ExternalLink className="w-4 h-4 shrink-0" />
          <span>Lihat Toko Publik</span>
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full min-h-[44px] px-3.5 rounded-xl flex items-center gap-3 text-sm font-medium text-red-200 hover:bg-red-500/20 hover:text-white transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Keluar</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F7F6F2] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 sticky top-0 h-screen">{SidebarContent}</aside>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <aside className="relative w-72 max-w-[85vw] h-full z-10">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Tutup sidebar"
              className="absolute top-4 right-4 p-2 text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            {SidebarContent}
          </aside>
        </div>
      )}

      {/* Main Workspace */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-[#CFB799]/50 px-4 h-16 flex items-center justify-between">
          <span className="font-display text-lg font-bold text-[#26351F]">Admin {settings.brand_name}</span>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Buka menu admin"
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl border border-[#CFB799] text-[#26351F] cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {usingDefaultPassword && (
            <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-amber-900">
                  Anda masih menggunakan password bawaan (<code className="font-mono font-bold">admin</code>). Demi keamanan toko, segera ubah password di Pengaturan.
                </p>
              </div>
              <Link
                to="/admin/settings"
                className="min-h-[40px] px-4 py-2 rounded-xl bg-[#26351F] text-white text-xs font-semibold inline-flex items-center justify-center whitespace-nowrap shrink-0"
              >
                Ganti Password
              </Link>
            </div>
          )}

          <Outlet context={{ onPasswordChanged: () => setUsingDefaultPassword(false) }} />
        </main>
      </div>
    </div>
  );
}
