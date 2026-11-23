import { useEffect, useState } from 'react';
import { formatDateTimeId, formatRupiah } from '../../utils/format.ts';
import type { Order, OrderStatus } from '../../types.ts';

const ORDER_STATUSES: OrderStatus[] = [
  'Menunggu Konfirmasi',
  'Diproses',
  'Siap Diambil',
  'Dalam Pengiriman',
  'Selesai',
  'Dibatalkan',
];

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/orders', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId: number, status: OrderStatus) => {
    const res = await fetch(`/api/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const data = await res.json();
      setOrders((prev) => prev.map((o) => (o.id === orderId ? data.order : o)));
      setFeedback(`Status pesanan ${data.order.order_number} diperbarui menjadi "${status}".`);
    }
  };

  const filteredOrders = statusFilter ? orders.filter((o) => o.status === statusFilter) : orders;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#26351F]">Manajemen Pesanan</h1>
          <p className="text-sm text-[#333333]/75 mt-1">
            Pantau pesanan masuk dari checkout WhatsApp dan perbarui status pemrosesan.
          </p>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="min-h-[44px] px-3.5 py-2 rounded-xl border border-[#CFB799] bg-white text-sm text-[#26351F]"
        >
          <option value="">Semua Status</option>
          {ORDER_STATUSES.map((st) => (
            <option key={st} value={st}>
              {st}
            </option>
          ))}
        </select>
      </div>

      {feedback && (
        <div className="p-4 rounded-xl bg-[#838655]/15 border border-[#838655] text-sm text-[#26351F] flex justify-between">
          <span>{feedback}</span>
          <button type="button" onClick={() => setFeedback(null)} className="text-xs font-bold underline cursor-pointer">
            Tutup
          </button>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-2xl p-10 text-center text-sm text-[#333333]/60">Memuat pesanan...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#CFB799]/50 p-10 text-center text-sm text-[#333333]/70">
          Belum ada pesanan untuk filter ini.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-[#CFB799]/50 p-5 sm:p-6 space-y-4"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#E9E5DA]">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#333333]/70 mb-1">
                    <span className="font-mono font-bold text-[#26351F]">{order.order_number}</span>
                    <span aria-hidden="true">·</span>
                    <span>{formatDateTimeId(order.created_at)}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-semibold text-[#838655]">{order.delivery_method}</span>
                  </div>
                  <h2 className="font-display text-lg font-bold text-[#26351F]">
                    {order.customer_name} ({order.customer_phone})
                  </h2>
                  <p className="text-xs sm:text-sm text-[#333333]/80 mt-0.5">{order.customer_address}</p>
                  {order.notes && (
                    <p className="text-xs text-[#838655] mt-1">Catatan: {order.notes}</p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3 shrink-0">
                  <div className="text-left sm:text-right mr-2">
                    <p className="text-xs text-[#333333]/70">Total Pesanan</p>
                    <p className="text-lg font-bold text-[#26351F] tabular-nums">{formatRupiah(order.total_amount)}</p>
                  </div>

                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                    aria-label={`Ubah status pesanan ${order.order_number}`}
                    className="min-h-[44px] px-3.5 py-2 rounded-xl border border-[#CFB799] bg-[#F7F6F2] text-sm font-semibold text-[#26351F]"
                  >
                    {ORDER_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs sm:text-sm">
                {(order.items_json || []).map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-[#F7F6F2] rounded-xl px-3.5 py-2.5 flex items-center justify-between gap-2"
                  >
                    <span className="text-[#26351F] font-medium truncate">
                      {item.name} x{item.quantity}
                    </span>
                    <span className="font-bold text-[#26351F] tabular-nums shrink-0">
                      {formatRupiah(item.subtotal)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
