import React, { useCallback, useEffect, useState } from 'react';
import { Plus, Minus, Pencil, Trash2, Search, Upload, X } from 'lucide-react';
import type { Category, Product } from '../../types.ts';
import { formatRupiah } from '../../utils/format.ts';
import { SafeImage } from '../../components/SafeImage.tsx';

interface ProductFormState {
  category_id: number;
  name: string;
  description: string;
  price: number;
  discount_price: string;
  is_promo: boolean;
  is_best_seller: boolean;
  is_new_arrival: boolean;
  is_active: boolean;
  stock: number;
  unit_info: string;
  variant: string;
  serving_suggestion: string;
  image_url: string;
}

const EMPTY_FORM: ProductFormState = {
  category_id: 1,
  name: '',
  description: '',
  price: 20000,
  discount_price: '',
  is_promo: false,
  is_best_seller: false,
  is_new_arrival: false,
  is_active: true,
  stock: 15,
  unit_info: '5 pcs',
  variant: 'Siap Santap (Kukus)',
  serving_suggestion: '',
  image_url: '/src/assets/images/dimsum_ayam_original_1795412486133.jpg',
};

function compressImageToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('File bukan gambar yang valid.'));
      img.onload = () => {
        const maxDim = 900;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const ratio = Math.min(maxDim / width, maxDim / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas tidak didukung.'));
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductFormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (categoryFilter) params.set('category', categoryFilter);
      const [pRes, cRes] = await Promise.all([
        fetch(`/api/admin/products?${params.toString()}`, { credentials: 'include' }),
        fetch('/api/admin/categories', { credentials: 'include' }),
      ]);
      if (pRes.ok) {
        const pData = await pRes.json();
        setProducts(pData.products || []);
      }
      if (cRes.ok) {
        const cData = await cRes.json();
        setCategories(cData.categories || []);
      }
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter]);

  useEffect(() => {
    const t = setTimeout(loadData, 200);
    return () => clearTimeout(t);
  }, [loadData]);

  const handleQuickStock = async (product: Product, delta: number) => {
    const nextStock = Math.max(0, product.stock + delta);
    const res = await fetch(`/api/admin/products/${product.id}/stock`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ stock: nextStock }),
    });
    if (res.ok) {
      const data = await res.json();
      setProducts((prev) => prev.map((p) => (p.id === product.id ? data.product : p)));
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setForm({
      ...EMPTY_FORM,
      category_id: categories[0]?.id || 1,
    });
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingId(p.id);
    setForm({
      category_id: p.category_id,
      name: p.name,
      description: p.description || '',
      price: p.price,
      discount_price: p.discount_price ? String(p.discount_price) : '',
      is_promo: p.is_promo,
      is_best_seller: p.is_best_seller,
      is_new_arrival: p.is_new_arrival,
      is_active: p.is_active,
      stock: p.stock,
      unit_info: p.unit_info || '5 pcs',
      variant: p.variant || '',
      serving_suggestion: p.serving_suggestion || '',
      image_url: p.image_url || '',
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImageToDataUrl(file);
      setForm((prev) => ({ ...prev, image_url: dataUrl }));
      setFormError(null);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Gagal memproses gambar.');
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const parsedPrice = Number(form.price);
    const parsedDiscount = form.discount_price.trim() ? Number(form.discount_price) : null;
    if (parsedPrice <= 0) {
      setFormError('Harga normal harus lebih besar dari Rp0.');
      return;
    }
    if (parsedDiscount !== null && parsedDiscount >= parsedPrice) {
      setFormError('Harga diskon harus lebih kecil dari harga normal.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        category_id: Number(form.category_id),
        price: parsedPrice,
        discount_price: parsedDiscount,
        stock: Number(form.stock),
      };
      const url = editingId ? `/api/admin/products/${editingId}` : '/api/admin/products';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Gagal menyimpan produk.');
        return;
      }
      setModalOpen(false);
      setFeedback(editingId ? 'Produk berhasil diperbarui.' : 'Produk baru berhasil ditambahkan.');
      await loadData();
    } catch {
      setFormError('Gagal menghubungi server.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!deleteTarget) return;
    const res = await fetch(`/api/admin/products/${deleteTarget.id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (res.ok) {
      setFeedback(`Produk "${deleteTarget.name}" telah dihapus.`);
      setDeleteTarget(null);
      await loadData();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#26351F]">Manajemen Produk &amp; Stok</h1>
          <p className="text-sm text-[#333333]/75 mt-1">Tambah menu baru, atur promo, dan perbarui stok cepat langsung di tabel.</p>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#DDAE35] text-[#26351F] font-bold text-sm hover:bg-[#cfa028] whitespace-nowrap cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Produk</span>
        </button>
      </div>

      {feedback && (
        <div className="bg-[#838655]/15 border border-[#838655] text-[#26351F] px-4 py-3 rounded-xl text-sm flex items-center justify-between">
          <span>{feedback}</span>
          <button type="button" onClick={() => setFeedback(null)} className="text-xs font-bold underline cursor-pointer">
            Tutup
          </button>
        </div>
      )}

      {/* Search & Category Filter */}
      <div className="bg-white rounded-2xl border border-[#CFB799]/50 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#333333]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama produk..."
            className="w-full min-h-[44px] pl-10 pr-4 py-2 rounded-xl border border-[#CFB799] text-sm text-[#26351F]"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="min-h-[44px] px-3.5 py-2 rounded-xl border border-[#CFB799] text-sm text-[#26351F] bg-white"
        >
          <option value="">Semua Kategori</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-[#CFB799]/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F7F6F2] border-b border-[#CFB799]/40 text-xs font-semibold text-[#26351F]">
                <th className="py-3.5 px-4">Produk</th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-4">Harga</th>
                <th className="py-3.5 px-4">Stok Cepat</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9E5DA] text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-[#333333]/60">
                    Memuat data produk...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-[#333333]/60">
                    Tidak ada produk ditemukan.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-[#F7F6F2]/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#E9E5DA] shrink-0">
                          <SafeImage src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-semibold text-[#26351F]">{p.name}</p>
                          <p className="text-xs text-[#333333]/70">{p.unit_info}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs sm:text-sm text-[#333333]/85">{p.category_name}</td>
                    <td className="py-3 px-4 tabular-nums">
                      {p.is_promo && p.discount_price ? (
                        <div>
                          <span className="font-bold text-[#26351F]">{formatRupiah(p.discount_price)}</span>
                          <span className="block text-xs text-[#333333]/50 line-through">{formatRupiah(p.price)}</span>
                        </div>
                      ) : (
                        <span className="font-bold text-[#26351F]">{formatRupiah(p.price)}</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="inline-flex items-center rounded-xl border border-[#CFB799] bg-[#F7F6F2]">
                        <button
                          type="button"
                          onClick={() => handleQuickStock(p, -1)}
                          aria-label={`Kurangi stok ${p.name}`}
                          className="min-h-[36px] min-w-[34px] inline-flex items-center justify-center text-[#26351F] hover:bg-[#E9E5DA] rounded-l-xl cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span
                          className={`w-10 text-center text-xs font-bold tabular-nums ${
                            p.stock === 0 ? 'text-red-700' : p.stock <= 5 ? 'text-amber-700' : 'text-[#26351F]'
                          }`}
                        >
                          {p.stock}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQuickStock(p, 1)}
                          aria-label={`Tambah stok ${p.name}`}
                          className="min-h-[36px] min-w-[34px] inline-flex items-center justify-center text-[#26351F] hover:bg-[#E9E5DA] rounded-r-xl cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs">
                      <span className={`font-semibold ${p.is_active ? 'text-[#838655]' : 'text-[#333333]/50'}`}>
                        {p.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                      {p.is_promo && <span className="block text-[11px] text-[#DDAE35] font-bold">Promo</span>}
                      {p.is_best_seller && <span className="block text-[11px] text-[#26351F]">Best Seller</span>}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(p)}
                          aria-label={`Edit ${p.name}`}
                          className="min-h-[38px] min-w-[38px] inline-flex items-center justify-center rounded-xl border border-[#CFB799] text-[#26351F] hover:bg-[#E9E5DA] cursor-pointer"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(p)}
                          aria-label={`Hapus ${p.name}`}
                          className="min-h-[38px] min-w-[38px] inline-flex items-center justify-center rounded-xl border border-red-200 text-red-700 hover:bg-red-50 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-[#CFB799] w-full max-w-2xl p-6 sm:p-8 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl font-bold text-[#26351F]">
                {editingId ? 'Edit Produk Dimsum' : 'Tambah Produk Baru'}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-xl hover:bg-[#E9E5DA] text-[#26351F] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#26351F] mb-1">Nama Produk *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-[#CFB799] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#26351F] mb-1">Kategori *</label>
                  <select
                    value={form.category_id}
                    onChange={(e) => setForm({ ...form, category_id: Number(e.target.value) })}
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-[#CFB799] text-sm bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#26351F] mb-1">Harga Normal (Rp) *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-[#CFB799] text-sm tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#26351F] mb-1">Harga Diskon (Opsional)</label>
                  <input
                    type="number"
                    min={1}
                    value={form.discount_price}
                    onChange={(e) => setForm({ ...form, discount_price: e.target.value })}
                    placeholder="Kosongkan jika tidak diskon"
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-[#CFB799] text-sm tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#26351F] mb-1">Stok Tersedia *</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-[#CFB799] text-sm tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#26351F] mb-1">Isi Kemasan *</label>
                  <input
                    type="text"
                    required
                    value={form.unit_info}
                    onChange={(e) => setForm({ ...form, unit_info: e.target.value })}
                    placeholder="Misal: 5 pcs"
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-[#CFB799] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#26351F] mb-1">Varian / Tipe</label>
                  <input
                    type="text"
                    value={form.variant}
                    onChange={(e) => setForm({ ...form, variant: e.target.value })}
                    placeholder="Misal: Siap Santap / Frozen"
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-[#CFB799] text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#26351F] mb-1">Deskripsi Produk</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#CFB799] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#26351F] mb-1">Saran Penyajian / Penyimpanan</label>
                <textarea
                  rows={2}
                  value={form.serving_suggestion}
                  onChange={(e) => setForm({ ...form, serving_suggestion: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#CFB799] text-sm"
                />
              </div>

              {/* Image URL or Cloud-Run Safe Upload */}
              <div>
                <label className="block text-xs font-semibold text-[#26351F] mb-1">URL Gambar atau Upload File</label>
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                  <input
                    type="text"
                    value={form.image_url}
                    onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                    placeholder="https://... atau /src/assets/images/..."
                    className="flex-1 w-full min-h-[44px] px-3 py-2 rounded-xl border border-[#CFB799] text-sm"
                  />
                  <label className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#CFB799] bg-[#F7F6F2] text-xs font-semibold text-[#26351F] cursor-pointer hover:bg-[#E9E5DA] whitespace-nowrap">
                    <Upload className="w-4 h-4" />
                    <span>Upload Gambar</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="flex flex-wrap gap-5 pt-2">
                <label className="inline-flex items-center gap-2 text-sm text-[#26351F] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    className="w-4 h-4 accent-[#26351F]"
                  />
                  <span>Tampilkan di Toko</span>
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-[#26351F] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_best_seller}
                    onChange={(e) => setForm({ ...form, is_best_seller: e.target.checked })}
                    className="w-4 h-4 accent-[#26351F]"
                  />
                  <span>Best Seller</span>
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-[#26351F] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_promo}
                    onChange={(e) => setForm({ ...form, is_promo: e.target.checked })}
                    className="w-4 h-4 accent-[#26351F]"
                  />
                  <span>Sedang Promo</span>
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-[#26351F] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_new_arrival}
                    onChange={(e) => setForm({ ...form, is_new_arrival: e.target.checked })}
                    className="w-4 h-4 accent-[#26351F]"
                  />
                  <span>Menu Baru</span>
                </label>
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800">{formError}</div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-[#E9E5DA]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="min-h-[44px] px-5 py-2 rounded-xl border border-[#CFB799] text-sm font-semibold text-[#26351F] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="min-h-[44px] px-6 py-2 rounded-xl bg-[#DDAE35] text-[#26351F] text-sm font-bold hover:bg-[#cfa028] disabled:opacity-50 cursor-pointer"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Produk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#CFB799] w-full max-w-md p-6">
            <h2 className="font-display text-xl font-bold text-[#26351F] mb-2">Hapus Produk?</h2>
            <p className="text-sm text-[#333333]/80 mb-6">
              Anda yakin ingin menghapus <strong>{deleteTarget.name}</strong>? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="min-h-[44px] px-4 py-2 rounded-xl border border-[#CFB799] text-sm font-semibold text-[#26351F] cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteProduct}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-red-700 text-white text-sm font-semibold cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
