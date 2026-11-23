import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import type { Category } from '../../types.ts';
import { useStore } from '../../context/StoreContext.tsx';
import { SafeImage } from '../../components/SafeImage.tsx';

export function AdminCategoriesPage() {
  const { refreshStore } = useStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('/src/assets/images/dimsum_ayam_original_1795412486133.jpg');
  const [saving, setSaving] = useState(false);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/categories', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setName('');
    setImageUrl('/src/assets/images/dimsum_ayam_original_1795412486133.jpg');
    setError(null);
    setModalOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setName(cat.name);
    setImageUrl(cat.image_url || '');
    setError(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const url = editing ? `/api/admin/categories/${editing.id}` : '/api/admin/categories';
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, image_url: imageUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Gagal menyimpan kategori.');
        return;
      }
      setModalOpen(false);
      setFeedback(editing ? 'Kategori diperbarui.' : 'Kategori baru ditambahkan.');
      await loadCategories();
      await refreshStore();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat: Category) => {
    setError(null);
    setFeedback(null);
    const res = await fetch(`/api/admin/categories/${cat.id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Kategori tidak dapat dihapus.');
      return;
    }
    setFeedback(`Kategori "${cat.name}" dihapus.`);
    await loadCategories();
    await refreshStore();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#26351F]">Manajemen Kategori</h1>
          <p className="text-sm text-[#333333]/75 mt-1">Atur pengelompokan menu dimsum yang tampil di halaman toko.</p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#DDAE35] text-[#26351F] font-bold text-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kategori</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800">{error}</div>
      )}
      {feedback && (
        <div className="p-4 rounded-xl bg-[#838655]/15 border border-[#838655] text-sm text-[#26351F]">{feedback}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-10 text-center text-sm text-[#333333]/70">Memuat kategori...</div>
        ) : (
          categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white rounded-2xl border border-[#CFB799]/50 p-4 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#E9E5DA] shrink-0">
                  <SafeImage src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-[#26351F] truncate">{cat.name}</p>
                  <p className="text-xs text-[#333333]/70 tabular-nums">{cat.product_count ?? 0} produk aktif</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => openEdit(cat)}
                  aria-label={`Edit ${cat.name}`}
                  className="min-h-[38px] min-w-[38px] inline-flex items-center justify-center rounded-xl border border-[#CFB799] text-[#26351F] hover:bg-[#E9E5DA] cursor-pointer"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(cat)}
                  aria-label={`Hapus ${cat.name}`}
                  className="min-h-[38px] min-w-[38px] inline-flex items-center justify-center rounded-xl border border-red-200 text-red-700 hover:bg-red-50 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#CFB799] w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl font-bold text-[#26351F]">
                {editing ? 'Edit Kategori' : 'Tambah Kategori'}
              </h2>
              <button type="button" onClick={() => setModalOpen(false)} className="p-2 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#26351F] mb-1">Nama Kategori *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-[#CFB799] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#26351F] mb-1">URL Gambar</label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-[#CFB799] text-sm"
                />
              </div>
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
