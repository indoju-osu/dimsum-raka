import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { useStore } from '../../context/StoreContext.tsx';
import type { StoreSettings } from '../../types.ts';

interface AdminOutletCtx {
  onPasswordChanged?: () => void;
}

export function AdminSettingsPage() {
  const { refreshStore } = useStore();
  const outletCtx = useOutletContext<AdminOutletCtx>();

  const [form, setForm] = useState<StoreSettings | null>(null);
  const [savingStore, setSavingStore] = useState(false);
  const [storeFeedback, setStoreFeedback] = useState<string | null>(null);
  const [storeError, setStoreError] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingPass, setSavingPass] = useState(false);
  const [passFeedback, setPassFeedback] = useState<string | null>(null);
  const [passError, setPassError] = useState<string | null>(null);

  const [resetStep, setResetStep] = useState<0 | 1 | 2>(0);
  const [confirmText, setConfirmText] = useState('');
  const [resetting, setResetting] = useState(false);
  const [resetFeedback, setResetFeedback] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/settings', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) setForm(data.settings);
      });
  }, []);

  const handleSaveStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setSavingStore(true);
    setStoreFeedback(null);
    setStoreError(null);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...form,
          shipping_fee: Number(form.shipping_fee) || 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStoreError(data.error || 'Gagal menyimpan pengaturan toko.');
        return;
      }
      setForm(data.settings);
      await refreshStore();
      setStoreFeedback('Pengaturan toko berhasil disimpan dan langsung aktif di halaman depan.');
    } finally {
      setSavingStore(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPass(true);
    setPassFeedback(null);
    setPassError(null);
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPassError(data.error || 'Gagal mengubah password.');
        return;
      }
      setCurrentPassword('');
      setNewPassword('');
      setPassFeedback('Password administrator berhasil diperbarui.');
      outletCtx?.onPasswordChanged?.();
    } finally {
      setSavingPass(false);
    }
  };

  const handleResetDemo = async () => {
    setResetting(true);
    try {
      const res = await fetch('/api/admin/reset-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ confirmText }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStoreError(data.error || 'Konfirmasi tidak sesuai.');
        return;
      }
      setResetStep(0);
      setConfirmText('');
      setResetFeedback('Seluruh data produk, kategori, artikel, testimoni, dan pengaturan telah dikembalikan ke data awal.');
      await refreshStore();
      const refreshed = await fetch('/api/admin/settings', { credentials: 'include' }).then((r) => r.json());
      if (refreshed.settings) setForm(refreshed.settings);
    } finally {
      setResetting(false);
    }
  };

  if (!form) {
    return <div className="py-10 text-sm text-[#333333]/70">Memuat pengaturan toko...</div>;
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#26351F]">Pengaturan Toko &amp; Akun</h1>
        <p className="text-sm text-[#333333]/75 mt-1">
          Kelola identitas brand, nomor WhatsApp tujuan checkout, ongkos kirim, serta keamanan akun admin.
        </p>
      </div>

      {resetFeedback && (
        <div className="p-4 rounded-xl bg-[#838655]/15 border border-[#838655] text-sm text-[#26351F]">
          {resetFeedback}
        </div>
      )}

      {/* Store Settings Form */}
      <section className="bg-white rounded-3xl border border-[#CFB799]/50 p-6 sm:p-8">
        <h2 className="font-display text-xl font-bold text-[#26351F] mb-5">Identitas &amp; Operasional Toko</h2>

        <form onSubmit={handleSaveStore} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#26351F] mb-1">Nama Brand / Toko *</label>
              <input
                type="text"
                required
                value={form.brand_name}
                onChange={(e) => setForm({ ...form, brand_name: e.target.value })}
                className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-[#CFB799] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#26351F] mb-1">Nomor WhatsApp Toko (628...) *</label>
              <input
                type="text"
                required
                value={form.whatsapp_number}
                onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })}
                className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-[#CFB799] text-sm tabular-nums"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#26351F] mb-1">Deskripsi Singkat Brand</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-[#CFB799] text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#26351F] mb-1">Alamat Lengkap Dapur *</label>
            <input
              type="text"
              required
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-[#CFB799] text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#26351F] mb-1">Jam Operasional *</label>
              <input
                type="text"
                required
                value={form.operational_hours}
                onChange={(e) => setForm({ ...form, operational_hours: e.target.value })}
                className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-[#CFB799] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#26351F] mb-1">Instagram</label>
              <input
                type="text"
                value={form.instagram}
                onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-[#CFB799] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#26351F] mb-1">TikTok</label>
              <input
                type="text"
                value={form.tiktok}
                onChange={(e) => setForm({ ...form, tiktok: e.target.value })}
                className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-[#CFB799] text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#26351F] mb-1">Tarif Ongkos Kirim (Rp)</label>
              <input
                type="number"
                min={0}
                value={form.shipping_fee}
                onChange={(e) => setForm({ ...form, shipping_fee: Number(e.target.value) })}
                className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-[#CFB799] text-sm tabular-nums"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#26351F] mb-1">Info Pengiriman</label>
              <input
                type="text"
                value={form.shipping_info}
                onChange={(e) => setForm({ ...form, shipping_info: e.target.value })}
                className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-[#CFB799] text-sm"
              />
            </div>
          </div>

          {storeError && <div className="p-3 rounded-xl bg-red-50 text-xs text-red-800">{storeError}</div>}
          {storeFeedback && (
            <div className="p-3 rounded-xl bg-[#838655]/15 text-xs sm:text-sm text-[#26351F]">{storeFeedback}</div>
          )}

          <button
            type="submit"
            disabled={savingStore}
            className="min-h-[44px] px-6 py-2.5 rounded-xl bg-[#DDAE35] text-[#26351F] font-bold text-sm hover:bg-[#cfa028] cursor-pointer"
          >
            {savingStore ? 'Menyimpan...' : 'Simpan Pengaturan Toko'}
          </button>
        </form>
      </section>

      {/* Change Admin Password */}
      <section className="bg-white rounded-3xl border border-[#CFB799]/50 p-6 sm:p-8">
        <h2 className="font-display text-xl font-bold text-[#26351F] mb-4">Ubah Password Administrator</h2>

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-semibold text-[#26351F] mb-1">Password Saat Ini *</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-[#CFB799] text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#26351F] mb-1">Password Baru (min. 6 karakter) *</label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-[#CFB799] text-sm"
            />
          </div>

          {passError && <div className="p-3 rounded-xl bg-red-50 text-xs text-red-800">{passError}</div>}
          {passFeedback && (
            <div className="p-3 rounded-xl bg-[#838655]/15 text-xs sm:text-sm text-[#26351F]">{passFeedback}</div>
          )}

          <button
            type="submit"
            disabled={savingPass}
            className="min-h-[44px] px-6 py-2.5 rounded-xl bg-[#26351F] text-white font-semibold text-sm cursor-pointer"
          >
            {savingPass ? 'Memperbarui...' : 'Perbarui Password'}
          </button>
        </form>
      </section>

      {/* Reset Demo Data (Double Confirmation) */}
      <section className="bg-white rounded-3xl border border-red-200 p-6 sm:p-8">
        <div className="flex items-start gap-3 mb-4">
          <AlertTriangle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
          <div>
            <h2 className="font-display text-xl font-bold text-red-900">Reset Data Demo</h2>
            <p className="text-sm text-[#333333]/80 mt-1">
              Mengembalikan seluruh produk, kategori, pesanan, artikel, testimoni, dan pengaturan toko ke kondisi awal (akun &amp; password admin Anda tetap dipertahankan).
            </p>
          </div>
        </div>

        {resetStep === 0 && (
          <button
            type="button"
            onClick={() => setResetStep(1)}
            className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-300 text-red-700 font-semibold text-sm hover:bg-red-50 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Data Demo</span>
          </button>
        )}

        {resetStep === 1 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 space-y-3">
            <p className="text-sm font-semibold text-red-900">
              Konfirmasi Pertama: Yakin ingin menghapus seluruh perubahan produk dan pesanan saat ini?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setResetStep(0)}
                className="min-h-[40px] px-4 py-2 rounded-xl bg-white border border-[#CFB799] text-xs font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => setResetStep(2)}
                className="min-h-[40px] px-4 py-2 rounded-xl bg-red-700 text-white text-xs font-semibold cursor-pointer"
              >
                Lanjutkan ke Konfirmasi Akhir
              </button>
            </div>
          </div>
        )}

        {resetStep === 2 && (
          <div className="bg-red-50 border border-red-300 rounded-2xl p-4 space-y-3">
            <p className="text-sm font-semibold text-red-900">
              Konfirmasi Kedua: Ketik <code className="font-mono bg-white px-1.5 py-0.5 rounded">RESET DATA DEMO</code> di bawah ini:
            </p>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="RESET DATA DEMO"
              className="w-full max-w-xs min-h-[44px] px-3 py-2 rounded-xl border border-red-300 bg-white text-sm font-mono"
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setResetStep(0);
                  setConfirmText('');
                }}
                className="min-h-[40px] px-4 py-2 rounded-xl bg-white border border-[#CFB799] text-xs font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={resetting || confirmText !== 'RESET DATA DEMO'}
                onClick={handleResetDemo}
                className="min-h-[40px] px-4 py-2 rounded-xl bg-red-700 text-white text-xs font-bold disabled:opacity-40 cursor-pointer"
              >
                {resetting ? 'Mereset...' : 'Eksekusi Reset Sekarang'}
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
