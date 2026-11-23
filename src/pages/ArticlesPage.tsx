import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { Article } from '../types.ts';
import { formatDateId } from '../utils/format.ts';
import { SafeImage } from '../components/SafeImage.tsx';

export function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch('/api/articles')
      .then((res) => res.json())
      .then((data) => {
        if (active) setArticles(data.articles || []);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-2xl mb-10">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#26351F]">Artikel &amp; Panduan Kuliner</h1>
        <p className="text-sm sm:text-base text-[#333333]/80 mt-2">
          Tips praktis mengukus dimsum, cara penyimpanan stok frozen, hingga inspirasi sajian acara keluarga.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl h-96 animate-pulse" />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#CFB799]/50 p-12 text-center">
          <p className="text-[#333333]/80">Belum ada artikel yang dipublikasikan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.map((article) => (
            <article
              key={article.id}
              className="bg-white rounded-2xl border border-[#CFB799]/45 overflow-hidden flex flex-col"
            >
              <Link to={`/articles/${article.slug}`} className="aspect-[4/3] bg-[#E9E5DA] overflow-hidden block">
                <SafeImage
                  src={article.cover_url}
                  alt={article.title}
                  className="w-full h-full object-cover hover:scale-[1.03] transition-transform duration-300"
                />
              </Link>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-2 text-xs text-[#838655] font-semibold mb-2">
                  <span>{article.category}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-[#333333]/65 font-normal">{formatDateId(article.published_at)}</span>
                </div>
                <Link
                  to={`/articles/${article.slug}`}
                  className="font-display text-xl font-bold text-[#26351F] leading-snug hover:text-[#838655] transition-colors mb-2.5"
                >
                  {article.title}
                </Link>
                <p className="text-sm text-[#333333]/85 leading-relaxed mb-5 line-clamp-3">{article.excerpt}</p>
                <Link
                  to={`/articles/${article.slug}`}
                  className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-[#26351F] hover:text-[#838655]"
                >
                  <span>Baca Selengkapnya</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
