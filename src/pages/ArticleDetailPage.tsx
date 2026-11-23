import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import type { Article } from '../types.ts';
import { formatDateId } from '../utils/format.ts';
import { SafeImage } from '../components/SafeImage.tsx';

export function ArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch(`/api/articles/${encodeURIComponent(slug || '')}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data?.article) setArticle(data.article);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 animate-pulse space-y-4">
        <div className="h-8 w-2/3 bg-[#E9E5DA] rounded" />
        <div className="aspect-[4/3] bg-[#E9E5DA] rounded-3xl" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="font-display text-3xl font-bold text-[#26351F] mb-3">Artikel Tidak Ditemukan</h1>
        <Link
          to="/articles"
          className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#DDAE35] text-[#26351F] font-bold text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Artikel</span>
        </Link>
      </div>
    );
  }

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <Link
        to="/articles"
        className="inline-flex items-center gap-2 text-sm font-medium text-[#26351F] hover:text-[#838655] mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Semua Artikel</span>
      </Link>

      <div className="flex items-center gap-2 text-xs sm:text-sm text-[#838655] font-semibold mb-3">
        <span>{article.category}</span>
        <span aria-hidden="true">·</span>
        <span className="text-[#333333]/70 font-normal">{formatDateId(article.published_at)}</span>
      </div>

      <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#26351F] leading-tight mb-6">
        {article.title}
      </h1>

      <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-[#E9E5DA] border border-[#CFB799]/50 mb-8">
        <SafeImage src={article.cover_url} alt={article.title} className="w-full h-full object-cover" />
      </div>

      <div className="bg-white rounded-3xl border border-[#CFB799]/40 p-6 sm:p-10 space-y-5 text-base text-[#333333] leading-relaxed">
        {article.content.split('\n\n').map((para, idx) => (
          <p key={idx} className="whitespace-pre-line">
            {para}
          </p>
        ))}
      </div>
    </article>
  );
}
