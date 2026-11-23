import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Tags, ClipboardList, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import type { AdminOverview } from '../../types.ts';
import { formatDateTimeId, formatRupiah } from '../../utils/format.ts';

export function AdminOverviewPage() {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch('/api/admin/overview', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data) setOverview(data);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  if (loading || !overview) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-56 bg-[#E9E5DA] rounded" />
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 bg-white rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const kpis = [
    { label: 'Total Produk', value: overview.totalProducts, icon: Package, tone: 'text-[#26351F]' },
    { label: 'Total Kategori', value: overview.totalCategories, icon: Tags, tone: 'text-[#26351F]' },
    { label: 'Total Pesanan', value: overview.totalOrders, icon: ClipboardList, tone: 'text-[#26351F]' },
    { label: 'Produk Tersedia', value: overview.availableProducts, icon: CheckCircle2, tone: 'text-[#838655]' },
    { label: 'Stok Menipis (<= 5)', value: overview.lowStockCount, icon: AlertTriangle, tone: 'text-amber-700' },
    { label: 'Stok Habis (0)', value: overview.outOfStockCount, icon: XCircle, tone: 'text-red-700' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#26351F]">Ringkasan Toko</h1>
        <p className="text-sm text-[#333333]/75 mt-1">Data inventori dan pesanan terkini langsung dari database.</p>
      </div>

      {/* 6 Real-time KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="bg-white rounded-2xl border border-[#CFB799]/50 p-5 flex items-center justify-between gap-4"
            >
              <div>
                <p className="text-xs sm:text-sm font-medium text-[#333333]/75 mb-1">{kpi.label}</p>
                <p className={`text-2xl sm:text-3xl font-bold tabular-nums ${kpi.tone}`}>{kpi.value}</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-[#F7F6F2] flex items-center justify-center shrink-0">
                <Icon className={`w-5 h-5 ${kpi.tone}`} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Products */}
        <section className="bg-white rounded-2xl border border-[#CFB799]/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-bold text-[#26351F]">Peringatan Stok Menipis</h2>
            <Link to="/admin/products" className="text-xs font-semibold text-[#838655] hover:underline">
              Kelola Stok
            </Link>
          </div>

          {overview.lowStockProducts.length === 0 ? (
            <p className="text-sm text-[#333333]/70 py-6 text-center">Semua stok produk dalam kondisi aman.</p>
          ) : (
            <div className="divide-y divide-[#E9E5DA]">
              {overview.lowStockProducts.map((p) => (
                <div key={p.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#26351F] truncate">{p.name}</p>
                    <p className="text-xs text-[#333333]/70">{p.category_name} · {p.unit_info}</p>
                  </div>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-lg tabular-nums shrink-0 ${
                      p.stock === 0 ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    Stok: {p.stock}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recent Orders */}
        <section className="bg-white rounded-2xl border border-[#CFB799]/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-bold text-[#26351F]">Pesanan Terbaru</h2>
            <Link to="/admin/orders" className="text-xs font-semibold text-[#838655] hover:underline">
              Lihat Semua
            </Link>
          </div>

          {overview.recentOrders.length === 0 ? (
            <p className="text-sm text-[#333333]/70 py-6 text-center">Belum ada pesanan masuk.</p>
          ) : (
            <div className="divide-y divide-[#E9E5DA]">
              {overview.recentOrders.map((ord) => (
                <div key={ord.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#26351F] truncate">
                      {ord.customer_name} · <span className="font-mono text-xs">{ord.order_number}</span>
                    </p>
                    <p className="text-xs text-[#333333]/70">
                      {ord.delivery_method} · {formatDateTimeId(ord.created_at)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-[#26351F] tabular-nums">{formatRupiah(ord.total_amount)}</p>
                    <p className="text-xs font-medium text-[#838655]">{ord.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
