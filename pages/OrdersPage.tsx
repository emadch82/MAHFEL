
import React from 'react';
import { toPersianDigits } from '../utils/helpers';

export interface Order {
  id: number;
  orderNumber: string;
  items: Array<{ title: string; cover?: string; price?: string; quantity: number }>;
  totalPrice: number;
  paymentMethod: string;
  cardLast4?: string;
  date: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

interface OrdersPageProps {
  orders: Order[];
  onBack: () => void;
  onReadBook?: (order: Order, itemIndex: number) => void;
}

const OrdersPage: React.FC<OrdersPageProps> = ({ orders, onBack, onReadBook }) => {
  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return toPersianDigits(d.toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }));
    } catch { return iso; }
  };

  const paymentLabels: Record<string, { icon: string; label: string }> = {
    'card-to-card': { icon: 'fa-exchange-alt', label: 'کارت به کارت' },
    'online': { icon: 'fa-globe', label: 'پرداخت آنلاین' },
    'wallet': { icon: 'fa-wallet', label: 'کیف پول' },
  };

  return (
    <div className="min-h-screen animate-fadeIn" style={{ background: 'var(--surface)' }} dir="rtl">
      {/* Header */}
      <div className="sticky top-0 z-10 px-4 py-4" style={{ background: 'color-mix(in srgb, var(--surface) 92%, transparent)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <button onClick={onBack} className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all active:scale-90" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            <i className="fas fa-arrow-right text-base" style={{ color: 'var(--text-2)' }} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}>
              <i className="fas fa-receipt text-sm text-white" />
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black" style={{ color: 'var(--text)' }}>سفارشات من</h1>
              {orders.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold" style={{ background: 'color-mix(in srgb, var(--primary) 12%, transparent)', color: 'var(--primary)' }}>{toPersianDigits(String(orders.length))}</span>
              )}
            </div>
          </div>
          <div className="w-11" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="relative mb-6">
              <div className="w-24 h-24 rounded-3xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--primary) 10%, transparent), color-mix(in srgb, var(--secondary) 10%, transparent))', border: '2px dashed var(--border)' }}>
                <i className="fas fa-receipt text-3xl" style={{ color: 'var(--text-3)' }} />
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--surface-2)', border: '2px solid var(--surface)' }}>
                <i className="fas fa-times text-xs" style={{ color: 'var(--text-3)' }} />
              </div>
            </div>
            <p className="text-sm font-black mb-1" style={{ color: 'var(--text)' }}>هنوز سفارشی ثبت نکرده‌اید</p>
            <p className="text-xs leading-relaxed max-w-[240px]" style={{ color: 'var(--text-3)' }}>کتاب‌های مورد علاقه خود را از نشر سُها تهیه کنید و اینجا مشاهده کنید</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, orderIdx) => {
              const paymentInfo = paymentLabels[order.paymentMethod] || paymentLabels['card-to-card'];
              return (
                <div key={order.id} className="rounded-2xl overflow-hidden animate-fadeInUp" style={{ animationDelay: `${orderIdx * 60}ms`, background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                  {/* Order Header */}
                  <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: order.status === 'confirmed' ? 'color-mix(in srgb, #22c55e 15%, transparent)' : order.status === 'pending' ? 'color-mix(in srgb, #f59e0b 15%, transparent)' : 'color-mix(in srgb, #ef4444 15%, transparent)' }}>
                          <i className={`fas ${order.status === 'confirmed' ? 'fa-check' : order.status === 'pending' ? 'fa-clock' : 'fa-times'} text-[10px]`} style={{ color: order.status === 'confirmed' ? '#22c55e' : order.status === 'pending' ? '#f59e0b' : '#ef4444' }} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold" style={{ color: 'var(--text-3)' }}>شماره سفارش</p>
                          <p className="text-xs font-black font-mono" style={{ color: 'var(--text)' }}>{order.orderNumber}</p>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="text-[10px] font-bold" style={{ color: 'var(--text-3)' }}>{formatDate(order.date)}</p>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black mt-1 ${order.status === 'confirmed' ? 'bg-green-500/10 text-green-500' : order.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-red-500/10 text-red-500'}`}>
                          {order.status === 'confirmed' ? 'تایید شده' : order.status === 'pending' ? 'در انتظار' : 'لغو شده'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-4 space-y-2.5">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-2.5 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                        <div className="relative w-10 h-14 rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
                          {item.cover ? (
                            <img src={item.cover} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}>
                              <i className="fas fa-book text-white text-xs" />
                            </div>
                          )}
                          <div className="absolute top-0 right-0 bottom-0 w-0.5 bg-black/15" />
                        </div>
                        <div className="flex-1 min-w-0 text-right">
                          <p className="text-[13px] font-black line-clamp-1" style={{ color: 'var(--text)' }}>{item.title}</p>
                          <p className="text-[10px] font-bold mt-0.5" style={{ color: 'var(--text-3)' }}>تعداد: {item.quantity}</p>
                        </div>
                        <p className="text-[11px] font-black tabular-nums" style={{ color: 'var(--primary)' }}>{toPersianDigits(item.price || '۰')}</p>
                      </div>
                    ))}
                  </div>

                  {/* Order Footer */}
                  <div className="flex items-center justify-between p-4 border-t" style={{ borderColor: 'var(--border)' }}>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                        <i className={`fas ${paymentInfo.icon} text-[9px]`} style={{ color: 'var(--text-3)' }} />
                        <span className="text-[10px] font-bold" style={{ color: 'var(--text-3)' }}>
                          {paymentInfo.label}
                          {order.cardLast4 && <span className="font-mono"> ••••{order.cardLast4}</span>}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {order.status === 'confirmed' && onReadBook && (
                        <button onClick={() => onReadBook(order, 0)} className="px-3 py-1.5 rounded-xl text-[10px] font-black flex items-center gap-1.5 active:scale-95 transition-all" style={{ background: 'linear-gradient(135deg, var(--primary), color-mix(in srgb, var(--primary) 80%, var(--secondary)))', color: 'white', boxShadow: '0 4px 15px var(--primary-glow)' }}>
                          <i className="fas fa-book-open text-[8px]" />
                          مطالعه
                        </button>
                      )}
                      <span className="text-[11px] font-black tabular-nums" style={{ color: 'var(--text)' }}>{toPersianDigits(order.totalPrice.toLocaleString('fa-IR'))} <span className="text-[9px] font-bold" style={{ color: 'var(--text-3)' }}>تومان</span></span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
