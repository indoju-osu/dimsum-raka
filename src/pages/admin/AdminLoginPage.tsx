import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useStore } from '../../context/StoreContext.tsx';

export function AdminLoginPage() {
  const { settings } = useStore();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    fetch('/api/auth/me', { credentials: 'include' })
      .then((res) => {
        if (active && res.ok) navigate('/admin', { replace: true });
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login gagal.');
        return;
      }
      navigate('/admin', { replace: true });
    } catch {
      setError('Gagal menghubungi server.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F6F2] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#26351F] hover:text-[#838655] mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Toko {settings.brand_name}</span>
        </Link>

        <div className="bg-white rounded-3xl border border-[#CFB799]/60 p-7 sm:p-9 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-[#E9E5DA] text-[#26351F] flex items-center justify-center mb-5">
            <Lock className="w-6 h-6" />
          </div>

          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#26351F] mb-1.5">
            Login Admin Toko
          </h1>
          <p className="text-sm text-[#333333]/75 mb-5">
            Masuk untuk mengelola produk, stok, pesanan WhatsApp, dan konten {settings.brand_name}.
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <p className="font-bold mb-0.5">Peringatan Keamanan Awal</p>
              <p>
                Akun bawaan menggunakan username <code className="font-mono font-bold">admin</code> dan password{' '}
                <code className="font-mono font-bold">admin</code>. Anda wajib segera mengganti password setelah masuk di menu Pengaturan.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="admin-user" className="block text-xs font-semibold text-[#26351F] mb-1.5">
                Username
              </label>
              <input
                id="admin-user"
                type="text"
                required
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-[#CFB799] bg-[#F7F6F2]/50 text-sm text-[#26351F] focus:outline-none focus:border-[#26351F]"
              />
            </div>

            <div>
              <label htmlFor="admin-pass" className="block text-xs font-semibold text-[#26351F] mb-1.5">
                Password
              </label>
              <input
                id="admin-pass"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-[#CFB799] bg-[#F7F6F2]/50 text-sm text-[#26351F] focus:outline-none focus:border-[#26351F]"
              />
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs sm:text-sm text-red-800">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full min-h-[48px] rounded-xl bg-[#DDAE35] text-[#26351F] font-bold text-sm hover:bg-[#cfa028] disabled:opacity-50 transition-colors cursor-pointer"
            >
              {submitting ? 'Memverifikasi...' : 'Masuk Dashboard'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
