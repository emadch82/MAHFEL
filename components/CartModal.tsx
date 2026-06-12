
import React, { useEffect, useRef } from 'react';
import type { PublishedBook } from '../types';
import { toPersianDigits } from '../utils/helpers';

export interface CartItem {
  book: PublishedBook;
  quantity: number;
}

interface CartModalProps {
  items: CartItem[];
  isOpen: boolean;
  onClose: () => void;
  onRemove: (bookId: number) => void;
  onUpdateQuantity: (bookId: number, qty: number) => void;
  onCheckout: () => void;
}

const parsePrice = (p?: string) => {
  if (!p) return 0;
  return parseInt(p.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString()).replace(/[^0-9]/g, '')) || 0;
};

const CartModal: React.FC<CartModalProps> = ({ items, isOpen, onClose, onRemove, onUpdateQuantity, onCheckout }) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const totalPrice = items.reduce((sum, item) => sum + parsePrice(item.book.price) * item.quantity, 0);
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="fixed inset-0 z-[6000] animate-fadeIn" dir="rtl" ref={overlayRef}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="absolute left-0 top-0 bottom-0 w-full max-w-md animate-slideInRight flex flex-col" style={{ background: 'var(--surface)' }}>
        {/* Header */}
        <div className="relative px-5 pt-5 pb-4">
          <div className="absolute top-0 left-0 right-0 h-1 rounded-b-full" style={{ background: 'linear-gradient(90deg, var(--primary), var(--secondary))' }} />
          <div className="flex items-center justify-between">
            <button onClick={onClose} className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all active:scale-90 hover:scale-105" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
              <i className="fas fa-times text-sm" style={{ color: 'var(--text-2)' }} />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}>
                <i className="fas fa-shopping-cart text-xs text-white" />
              </div>
              <div>
                <h2 className="text-sm font-black" style={{ color: 'var(--text)' }}>سبد خرید</h2>
                {totalCount > 0 && (
                  <p className="text-[10px] font-bold" style={{ color: 'var(--text-3)' }}>{totalCount} کتاب</p>
                )}
              </div>
            </div>
            <div className="w-10" />
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-3 no-scrollbar">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-20">
              <div className="relative mb-6">
                <div className="w-24 h-24 rounded-3xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--primary) 10%, transparent), color-mix(in srgb, var(--secondary) 10%, transparent))', border: '2px dashed var(--border)' }}>
                  <i className="fas fa-shopping-cart text-3xl" style={{ color: 'var(--text-3)' }} />
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--surface-2)', border: '2px solid var(--surface)' }}>
                  <i className="fas fa-plus text-xs" style={{ color: 'var(--primary)' }} />
                </div>
              </div>
              <p className="text-sm font-black mb-1" style={{ color: 'var(--text)' }}>سبد خرید شما خالی است</p>
              <p className="text-xs leading-relaxed max-w-[200px]" style={{ color: 'var(--text-3)' }}>کتاب‌های مورد علاقه خود را از ویترین نشر سُها اضافه کنید</p>
            </div>
          ) : (
            items.map((item, idx) => (
              <div key={item.book.id} className="flex items-stretch gap-3 p-3 rounded-2xl animate-fadeInUp group" style={{ animationDelay: `${idx * 50}ms`, background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                {/* Cover */}
                <div className="relative w-16 h-24 rounded-xl overflow-hidden flex-shrink-0 shadow-lg" style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
                  {item.book.cover ? (
                    <img src={item.book.cover} className="w-full h-full object-cover" alt={item.book.title} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}>
                      <i className="fas fa-book text-white text-lg" />
                    </div>
                  )}
                  <div className="absolute top-0 right-0 bottom-0 w-0.5 bg-black/20" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                  <div>
                    <h3 className="text-[13px] font-black line-clamp-2 text-right leading-snug" style={{ color: 'var(--text)' }}>{item.book.title}</h3>
                    <p className="text-[10px] font-bold mt-1 truncate" style={{ color: 'var(--text-3)' }}>{item.book.authorName}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-black" style={{ color: 'var(--primary)' }}>
                      {toPersianDigits(item.book.price || '۰')} <span className="text-[9px] font-bold">تومان</span>
                    </p>
                    <div className="flex items-center gap-1.5">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1 p-0.5 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                        <button onClick={() => onUpdateQuantity(item.book.id, item.quantity - 1)} className="w-6 h-6 rounded-lg flex items-center justify-center transition-all active:scale-90" style={{ background: 'var(--surface-2)' }}>
                          <i className="fas fa-minus text-[7px]" style={{ color: 'var(--text-2)' }} />
                        </button>
                        <span className="text-[11px] font-black w-5 text-center tabular-nums" style={{ color: 'var(--text)' }}>{item.quantity}</span>
                        <button onClick={() => onUpdateQuantity(item.book.id, item.quantity + 1)} className="w-6 h-6 rounded-lg flex items-center justify-center transition-all active:scale-90" style={{ background: 'color-mix(in srgb, var(--primary) 15%, transparent)' }}>
                          <i className="fas fa-plus text-[7px]" style={{ color: 'var(--primary)' }} />
                        </button>
                      </div>
                      {/* Remove */}
                      <button onClick={() => onRemove(item.book.id)} className="w-7 h-7 rounded-xl flex items-center justify-center transition-all active:scale-90 opacity-60 hover:opacity-100" style={{ background: 'rgba(239,68,68,0.08)' }}>
                        <i className="fas fa-trash-alt text-[9px]" style={{ color: '#ef4444' }} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t px-5 py-4 space-y-3" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
            {/* Summary */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold" style={{ color: 'var(--text-3)' }}>تعداد اقلام</span>
                <span className="text-[11px] font-black" style={{ color: 'var(--text)' }}>{totalCount} کتاب</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold" style={{ color: 'var(--text-3)' }}>جمع کل</span>
                <span className="text-base font-black tabular-nums" style={{ color: 'var(--primary)' }}>{toPersianDigits(totalPrice.toLocaleString('fa-IR'))} <span className="text-[10px]">تومان</span></span>
              </div>
            </div>

            {/* Checkout Button */}
            <button onClick={onCheckout} className="w-full py-3.5 rounded-2xl text-white text-sm font-black flex items-center justify-center gap-2 active:scale-[0.98] transition-all relative overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--primary), color-mix(in srgb, var(--primary) 80%, var(--secondary)))', boxShadow: '0 10px 30px var(--primary-glow)' }}>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0" />
              <i className="fas fa-credit-card relative z-10" />
              <span className="relative z-10">تکمیل خرید و پرداخت</span>
              <i className="fas fa-arrow-left relative z-10 text-xs" />
            </button>

            {/* Security note */}
            <div className="flex items-center justify-center gap-1.5 pt-1">
              <i className="fas fa-shield-alt text-[9px]" style={{ color: 'var(--text-3)' }} />
              <p className="text-[9px] font-bold" style={{ color: 'var(--text-3)' }}>پرداخت امن و رمزنگاری شده</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartModal;
