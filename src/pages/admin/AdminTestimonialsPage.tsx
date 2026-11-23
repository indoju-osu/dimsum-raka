import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Star, X } from 'lucide-react';
import type { Testimonial } from '../../types.ts';

interface TestimonialForm {
  customer_name: string;
  role: string;
  rating: number;
  content: string;
  is_visible: boolean;
  is_demo: boolean;
}

const EMPTY_TESTIMONIAL: TestimonialForm = {
  customer_name: '',
  role: '',
  rating: 5,
  content: '',
  is_visible: true,
  is_demo: false,
};

export function AdminTestimonialsPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<TestimonialForm>(EMPTY_TESTIMONIAL);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadTestimonials = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/testimonials', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setItems(data.testimonials || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTestimonials();
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_TESTIMONIAL);
    setError(null);
    setModalOpen(true);
  };

  const openEdit = (t: Testimonial) => {
    setEditingId(t.id);
    setForm({
      customer_name: t.customer_name,
      role: t.role,
      rating: t.rating,
      content: t.content,
      is_visible: t.is_visible,
      is_demo: t.is_demo,
    });
    setError(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const url = editingId ? `/api/admin/testimonials/${editingId}` : '/api/admin/testimonials';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Gagal menyimpan testimoni.');
        return;
      }
      setModalOpen(false);
      await loadTestimonials();
    } finally {
      setSaving(false);
    }
  };

  const toggleVisibility = async (t: Testimonial) => {
    const res = await fetch(`/api/admin/testimonials/${t.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ ...t, is_visible: !t.is_visible }),
    });
    if (res.ok) await loadTestimonials();
  };

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/admin/testimonials/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (res.ok) await loadTestimonials();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#26351F]">Manajemen Testimoni</h1>
          <p className="text-sm text-[#333333]/75 mt-1">Atur ulasan pelanggan yang tampil di halaman beranda.</p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#DDAE35] text-[#26351F] font-bold text-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Testimoni</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-full py-10 text-center text-sm text-[#333333]/60">Memuat testimoni...</div>
        ) : (
          items.map((t) => (
            <div key={t.id} className="bg-white rounded-2xl border border-[#CFB799]/50 p-5 flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < t.rating ? 'fill-[#DDAE35] text-[#DDAE35]' : 'text-[#CFB799]'}`}
                      />
                    ))}
                  </div>
                  {t.is_demo && <span className="text-xs text-[#333333]/60">Demo</span>}
                </div>
                <p className="text-sm text-[#333333] leading-relaxed mb-3">"{t.content}"</p>
                <p className="text-sm font-bold text-[#26351F]">{t.customer_name}</p>
                <p className="text-xs text-[#333333]/70">{t.role}</p>
              </div>

              <div className="pt-3 border-t border-[#E9E5DA] flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => toggleVisibility(t)}
                  className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                    t.is_visible ? 'bg-[#838655]/15 text-[#26351F]' : 'bg-[#E9E5DA] text-[#333333]/70'
                  }`}
                >
                  {t.is_visible ? 'Ditampilkan' : 'Disembunyikan'}
                </button>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => openEdit(t)}
                    aria-label={`Edit testimoni ${t.customer_name}`}
                    className="min-h-[38px] min-w-[38px] inline-flex items-center justify-center rounded-xl border border-[#CFB799] text-[#26351F] cursor-pointer"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(t.id)}
                    aria-label={`Hapus testimoni ${t.customer_name}`}
                    className="min-h-[38px] min-w-[38px] inline-flex items-center justify-center rounded-xl border border-red-200 text-red-700 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#CFB799] w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl font-bold text-[#26351F]">
                {editingId ? 'Edit Testimoni' : 'Tambah Testimoni'}
              </h2>
              <button type="button" onClick={() => setModalOpen(false)} className="p-2 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#26351F] mb-1">Nama Pelanggan *</label>
                <input
                  type="text"
                  required
                  value={form.customer_name}
                  onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-[#CFB799] text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#26351F] mb-1">Profesi / Kota</label>
                  <input
                    type="text"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-[#CFB799] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#26351F] mb-1">Rating (1–5)</label>
                  <select
                    value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-[#CFB799] text-sm bg-white"
                  >
                    {[5, 4, 3, 2, 1].map((r) => (
                      <option key={r} value={r}>
                        {r} Bintang
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#26351F] mb-1">Isi Ulasan *</label>
                <textarea
                  rows={3}
                  required
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#CFB799] text-sm"
                />
              </div>

              <div className="flex gap-5">
                <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_visible}
                    onChange={(e) => setForm({ ...form, is_visible: e.target.checked })}
                    className="w-4 h-4 accent-[#26351F]"
                  />
                  <span>Tampilkan di Beranda</span>
                </label>
                <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_demo}
                    onChange={(e) => setForm({ ...form, is_demo: e.target.checked })}
                    className="w-4 h-4 accent-[#26351F]"
                  />
                  <span>Tandai Ulasan Demo</span>
                </label>
              </div>

              {error && <div className="p-3 rounded-xl bg-red-50 text-xs text-red-800">{error}</div>}

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="min-h-[44px] px-4 py-2 rounded-xl border border-[#CFB799] text-sm font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="min-h-[44px] px-5 py-2 rounded-xl bg-[#DDAE35] text-[#26351F] text-sm font-bold cursor-pointer"
                >
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
