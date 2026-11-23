import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import type { Article } from '../../types.ts';
import { formatDateId } from '../../utils/format.ts';

interface ArticleForm {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  cover_url: string;
  status: 'published' | 'draft';
}

const EMPTY_ARTICLE: ArticleForm = {
  title: '',
  excerpt: '',
  content: '',
  category: 'Tips Memasak',
  cover_url: '/src/assets/images/article_steaming_guide_1795412487148.jpg',
  status: 'published',
};

export function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ArticleForm>(EMPTY_ARTICLE);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadArticles = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/articles', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setArticles(data.articles || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_ARTICLE);
    setError(null);
    setModalOpen(true);
  };

  const openEdit = (a: Article) => {
    setEditingId(a.id);
    setForm({
      title: a.title,
      excerpt: a.excerpt || '',
      content: a.content,
      category: a.category || 'Tips Memasak',
      cover_url: a.cover_url || '',
      status: a.status,
    });
    setError(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const url = editingId ? `/api/admin/articles/${editingId}` : '/api/admin/articles';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Gagal menyimpan artikel.');
        return;
      }
      setModalOpen(false);
      await loadArticles();
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (a: Article) => {
    const nextStatus = a.status === 'published' ? 'draft' : 'published';
    const res = await fetch(`/api/admin/articles/${a.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        title: a.title,
        excerpt: a.excerpt,
        content: a.content,
        category: a.category,
        cover_url: a.cover_url,
        status: nextStatus,
      }),
    });
    if (res.ok) await loadArticles();
  };

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/admin/articles/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (res.ok) await loadArticles();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#26351F]">Manajemen Artikel</h1>
          <p className="text-sm text-[#333333]/75 mt-1">Kelola artikel edukasi dan panduan penyajian dimsum.</p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#DDAE35] text-[#26351F] font-bold text-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tulis Artikel</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#CFB799]/50 divide-y divide-[#E9E5DA]">
        {loading ? (
          <div className="p-10 text-center text-sm text-[#333333]/60">Memuat artikel...</div>
        ) : articles.length === 0 ? (
          <div className="p-10 text-center text-sm text-[#333333]/60">Belum ada artikel.</div>
        ) : (
          articles.map((a) => (
            <div key={a.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs text-[#333333]/70 mb-1">
                  <span className="font-semibold text-[#838655]">{a.category}</span>
                  <span>·</span>
                  <span>{formatDateId(a.published_at)}</span>
                </div>
                <h2 className="font-display text-lg font-bold text-[#26351F] truncate">{a.title}</h2>
                <p className="text-xs sm:text-sm text-[#333333]/75 line-clamp-1 mt-0.5">{a.excerpt}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => toggleStatus(a)}
                  className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                    a.status === 'published'
                      ? 'bg-[#838655]/15 text-[#26351F]'
                      : 'bg-[#E9E5DA] text-[#333333]/75'
                  }`}
                >
                  {a.status === 'published' ? 'Published' : 'Draft'}
                </button>
                <button
                  type="button"
                  onClick={() => openEdit(a)}
                  aria-label={`Edit ${a.title}`}
                  className="min-h-[38px] min-w-[38px] inline-flex items-center justify-center rounded-xl border border-[#CFB799] text-[#26351F] cursor-pointer"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(a.id)}
                  aria-label={`Hapus ${a.title}`}
                  className="min-h-[38px] min-w-[38px] inline-flex items-center justify-center rounded-xl border border-red-200 text-red-700 cursor-pointer"
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
          <div className="bg-white rounded-3xl border border-[#CFB799] w-full max-w-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl font-bold text-[#26351F]">
                {editingId ? 'Edit Artikel' : 'Artikel Baru'}
              </h2>
              <button type="button" onClick={() => setModalOpen(false)} className="p-2 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#26351F] mb-1">Judul Artikel *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-[#CFB799] text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#26351F] mb-1">Kategori *</label>
                  <input
                    type="text"
                    required
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-[#CFB799] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#26351F] mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as 'published' | 'draft' })}
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-[#CFB799] text-sm bg-white"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#26351F] mb-1">Ringkasan (Excerpt)</label>
                <textarea
                  rows={2}
                  value={form.excerpt}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#CFB799] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#26351F] mb-1">Konten Lengkap *</label>
                <textarea
                  rows={6}
                  required
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#CFB799] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#26351F] mb-1">URL Gambar Sampul</label>
                <input
                  type="text"
                  value={form.cover_url}
                  onChange={(e) => setForm({ ...form, cover_url: e.target.value })}
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-[#CFB799] text-sm"
                />
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
                  {saving ? 'Menyimpan...' : 'Simpan Artikel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
