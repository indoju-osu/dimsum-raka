import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, RotateCcw, SlidersHorizontal } from 'lucide-react';
import type { Product } from '../types.ts';
import { useStore } from '../context/StoreContext.tsx';
import { ProductCard } from '../components/ProductCard.tsx';

export function ProductsPage() {
  const { categories } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchInput, setSearchInput] = useState(() => searchParams.get('search') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(searchInput);
  const [selectedCategory, setSelectedCategory] = useState(() => searchParams.get('category') || '');
  const [minPrice, setMinPrice] = useState(() => searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(() => searchParams.get('maxPrice') || '');
  const [onlyBestSeller, setOnlyBestSeller] = useState(() => searchParams.get('bestSeller') === 'true');
  const [onlyPromo, setOnlyPromo] = useState(() => searchParams.get('promo') === 'true');
  const [onlyNewArrival, setOnlyNewArrival] = useState(() => searchParams.get('newArrival') === 'true');
  const [onlyInStock, setOnlyInStock] = useState(() => searchParams.get('inStock') === 'true');
  const [sortBy, setSortBy] = useState(() => searchParams.get('sort') || 'popular');

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Sync URL query param category when clicking from HomePage category links
  useEffect(() => {
    const urlCat = searchParams.get('category') || '';
    if (urlCat !== selectedCategory) {
      setSelectedCategory(urlCat);
    }
  }, [searchParams]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (selectedCategory) params.set('category', selectedCategory);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (onlyBestSeller) params.set('bestSeller', 'true');
    if (onlyPromo) params.set('promo', 'true');
    if (onlyNewArrival) params.set('newArrival', 'true');
    if (onlyInStock) params.set('inStock', 'true');
    if (sortBy) params.set('sort', sortBy);
    return params.toString();
  }, [
    debouncedSearch,
    selectedCategory,
    minPrice,
    maxPrice,
    onlyBestSeller,
    onlyPromo,
    onlyNewArrival,
    onlyInStock,
    sortBy,
  ]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    fetch(`/api/products?${queryString}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Gagal memuat daftar produk.');
        return res.json();
      })
      .then((data) => {
        if (active) setProducts(data.products || []);
      })
      .catch((err) => {
        if (active) setError(err.message || 'Terjadi kesalahan saat memuat produk.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [queryString]);

  const handleResetFilters = () => {
    setSearchInput('');
    setDebouncedSearch('');
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    setOnlyBestSeller(false);
    setOnlyPromo(false);
    setOnlyNewArrival(false);
    setOnlyInStock(false);
    setSortBy('popular');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#26351F]">Katalog Menu Dimsum</h1>
        <p className="text-sm sm:text-base text-[#333333]/80 mt-2">
          Temukan varian dimsum hangat, kemasan frozen, hingga paket hemat untuk keluarga.
        </p>
      </div>

      {/* Search & Sort Toolbar */}
      <div className="bg-white rounded-2xl border border-[#CFB799]/50 p-4 sm:p-5 mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#333333]/50 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Cari nama dimsum, varian, atau kategori..."
              aria-label="Cari produk"
              className="w-full min-h-[44px] pl-10 pr-4 py-2.5 rounded-xl border border-[#CFB799] bg-[#F7F6F2]/60 text-sm text-[#26351F] placeholder:text-[#333333]/50 focus:outline-none focus:border-[#26351F]"
            />
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Urutkan produk"
              className="min-h-[44px] px-3.5 py-2.5 rounded-xl border border-[#CFB799] bg-white text-sm font-medium text-[#26351F] focus:outline-none focus:border-[#26351F]"
            >
              <option value="popular">Urutkan: Terpopuler</option>
              <option value="newest">Terbaru</option>
              <option value="price_asc">Harga Terendah</option>
              <option value="price_desc">Harga Tertinggi</option>
              <option value="name_asc">Nama A – Z</option>
            </select>

            <button
              type="button"
              onClick={() => setShowFiltersMobile((v) => !v)}
              className="lg:hidden min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#CFB799] bg-white text-sm font-semibold text-[#26351F] cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filter</span>
            </button>

            <button
              type="button"
              onClick={handleResetFilters}
              className="min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#CFB799] text-sm font-medium text-[#26351F] hover:bg-[#E9E5DA]/60 transition-colors whitespace-nowrap cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Filter</span>
            </button>
          </div>
        </div>

        {/* Multi-Condition Filter Bar */}
        <div className={`${showFiltersMobile ? 'block' : 'hidden'} lg:block pt-4 border-t border-[#E9E5DA]`}>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-4">
              <label htmlFor="cat-select" className="block text-xs font-semibold text-[#26351F] mb-1.5">
                Kategori
              </label>
              <select
                id="cat-select"
                value={selectedCategory}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedCategory(val);
                  if (val) setSearchParams({ category: val });
                  else setSearchParams({});
                }}
                className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-[#CFB799] bg-white text-sm text-[#26351F] focus:outline-none focus:border-[#26351F]"
              >
                <option value="">Semua Kategori</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="min-price" className="block text-xs font-semibold text-[#26351F] mb-1.5">
                Harga Minimum (Rp)
              </label>
              <input
                id="min-price"
                type="number"
                min={0}
                step={1000}
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="0"
                className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-[#CFB799] bg-white text-sm tabular-nums text-[#26351F] focus:outline-none focus:border-[#26351F]"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="max-price" className="block text-xs font-semibold text-[#26351F] mb-1.5">
                Harga Maksimum (Rp)
              </label>
              <input
                id="max-price"
                type="number"
                min={0}
                step={1000}
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="200000"
                className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-[#CFB799] bg-white text-sm tabular-nums text-[#26351F] focus:outline-none focus:border-[#26351F]"
              />
            </div>

            <div className="md:col-span-4 flex flex-wrap gap-x-4 gap-y-2 pb-2">
              <label className="inline-flex items-center gap-2 text-sm text-[#26351F] cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyBestSeller}
                  onChange={(e) => setOnlyBestSeller(e.target.checked)}
                  className="w-4 h-4 accent-[#26351F]"
                />
                <span>Best Seller</span>
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-[#26351F] cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyPromo}
                  onChange={(e) => setOnlyPromo(e.target.checked)}
                  className="w-4 h-4 accent-[#26351F]"
                />
                <span>Promo</span>
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-[#26351F] cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyNewArrival}
                  onChange={(e) => setOnlyNewArrival(e.target.checked)}
                  className="w-4 h-4 accent-[#26351F]"
                />
                <span>Menu Baru</span>
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-[#26351F] cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyInStock}
                  onChange={(e) => setOnlyInStock(e.target.checked)}
                  className="w-4 h-4 accent-[#26351F]"
                />
                <span>Hanya Stok Tersedia</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Results Count */}
      {!loading && !error && (
        <p className="text-xs sm:text-sm text-[#333333]/75 mb-4 tabular-nums">
          Menampilkan {products.length} produk
        </p>
      )}

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-[#CFB799]/30 h-80 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl border border-red-200 p-8 text-center">
          <p className="text-red-700 font-medium mb-3">{error}</p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="min-h-[44px] px-5 py-2 rounded-xl bg-[#26351F] text-white text-sm font-semibold cursor-pointer"
          >
            Muat Ulang
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#CFB799]/40 p-12 text-center">
          <h2 className="font-display text-xl font-bold text-[#26351F] mb-2">Menu Tidak Ditemukan</h2>
          <p className="text-sm text-[#333333]/80 mb-5">
            Tidak ada produk yang sesuai dengan kombinasi pencarian atau filter Anda.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#DDAE35] text-[#26351F] text-sm font-bold cursor-pointer"
          >
            Reset Semua Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
