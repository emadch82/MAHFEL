
import React, { useState, useEffect, useRef } from 'react';
import type { PublishedBook } from '../types';
import { toPersianDigits } from '../utils/helpers';
import type { CartItem } from './CartModal';
import type { Order } from '../pages/OrdersPage';

interface CheckoutFlowProps {
  items: CartItem[];
  isOpen: boolean;
  onClose: () => void;
  onComplete: (order: Order) => void;
  walletBalance: number;
  onTopUp: (amount: number) => void;
  onDeduct: (amount: number) => boolean;
}

type PaymentMethod = 'card-to-card' | 'online' | 'wallet' | 'cod' | null;
type Step = 'cart' | 'personal' | 'address' | 'payment' | 'card-details' | 'otp' | 'wallet-topup' | 'processing' | 'success';

const parsePrice = (p?: string) => {
  if (!p) return 0;
  return parseInt(p.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString()).replace(/[^0-9]/g, '')) || 0;
};

const DEST_CARD = '۶۱۰۴-۳۳۷۸-۷۴۱۲-۵۰۲۲';
const DEST_CARD_RAW = '6104337874125022';

const detectBank = (cardNum: string): { name: string; color: string; gradient: string } | null => {
  const bin = cardNum.replace(/\s/g, '');
  if (bin.length < 6) return null;
  const p6 = bin.substring(0, 6);
  const p5 = bin.substring(0, 5);
  const banks: Record<string, { name: string; color: string; gradient: string }> = {
    '603799': { name: 'ملی', color: '#1e88e5', gradient: 'linear-gradient(135deg, #0d2137 0%, #1565c0 30%, #0d47a1 60%, #1a237e 100%)' }, '628023': { name: 'ملی', color: '#1e88e5', gradient: 'linear-gradient(135deg, #0d2137 0%, #1565c0 30%, #0d47a1 60%, #1a237e 100%)' },
    '627961': { name: 'ملات', color: '#2e7d32', gradient: 'linear-gradient(135deg, #1b3a1b 0%, #2e7d32 25%, #1b5e20 55%, #0a2e0a 100%)' }, '502938': { name: 'ملات', color: '#2e7d32', gradient: 'linear-gradient(135deg, #1b3a1b 0%, #2e7d32 25%, #1b5e20 55%, #0a2e0a 100%)' },
    '627412': { name: 'تجارت', color: '#c62828', gradient: 'linear-gradient(135deg, #2a0a0a 0%, #b71c1c 30%, #c62828 60%, #3e0c0c 100%)' },
    '627381': { name: 'رفاه', color: '#0277bd', gradient: 'linear-gradient(135deg, #0a1e33 0%, #0277bd 30%, #01579b 60%, #0d2137 100%)' }, '589463': { name: 'رفاه', color: '#0277bd', gradient: 'linear-gradient(135deg, #0a1e33 0%, #0277bd 30%, #01579b 60%, #0d2137 100%)' },
    '601988': { name: 'صادرات', color: '#2e7d32', gradient: 'linear-gradient(135deg, #0a1f0a 0%, #1b5e20 30%, #388e3c 55%, #0a2e0a 100%)' }, '589210': { name: 'صادرات', color: '#2e7d32', gradient: 'linear-gradient(135deg, #0a1f0a 0%, #1b5e20 30%, #388e3c 55%, #0a2e0a 100%)' },
    '621034': { name: 'سرمایه', color: '#ad1457', gradient: 'linear-gradient(135deg, #2a0a1a 0%, #880e4f 30%, #ad1457 60%, #3e0c1f 100%)' }, '636214': { name: 'سرمایه', color: '#ad1457', gradient: 'linear-gradient(135deg, #2a0a1a 0%, #880e4f 30%, #ad1457 60%, #3e0c1f 100%)' },
    '628127': { name: 'انصار', color: '#1565c0', gradient: 'linear-gradient(135deg, #0a1628 0%, #1565c0 30%, #0d47a1 55%, #1a237e 100%)' }, '639599': { name: 'انصار', color: '#1565c0', gradient: 'linear-gradient(135deg, #0a1628 0%, #1565c0 30%, #0d47a1 55%, #1a237e 100%)' },
    '627353': { name: 'توسعه', color: '#283593', gradient: 'linear-gradient(135deg, #0a0e2a 0%, #283593 30%, #1a237e 60%, #0d1040 100%)' }, '636795': { name: 'توسعه', color: '#283593', gradient: 'linear-gradient(135deg, #0a0e2a 0%, #283593 30%, #1a237e 60%, #0d1040 100%)' },
    '627648': { name: 'کشاورزی', color: '#2e7d32', gradient: 'linear-gradient(135deg, #0a1a0d 0%, #2e7d32 25%, #1b5e20 50%, #0a2e0a 100%)' }, '628016': { name: 'کشاورزی', color: '#2e7d32', gradient: 'linear-gradient(135deg, #0a1a0d 0%, #2e7d32 25%, #1b5e20 50%, #0a2e0a 100%)' },
    '627884': { name: 'مسکن', color: '#1565c0', gradient: 'linear-gradient(135deg, #0d1b2e 0%, #1565c0 30%, #1976d2 55%, #0a1e33 100%)' }, '628055': { name: 'مسکن', color: '#1565c0', gradient: 'linear-gradient(135deg, #0d1b2e 0%, #1565c0 30%, #1976d2 55%, #0a1e33 100%)' },
    '627979': { name: 'سامان', color: '#ef6c00', gradient: 'linear-gradient(135deg, #2a1500 0%, #e65100 25%, #ef6c00 50%, #3e1f00 100%)' },
    '621476': { name: 'سینا', color: '#1565c0', gradient: 'linear-gradient(135deg, #0a1628 0%, #1565c0 35%, #0d47a1 65%, #0a1020 100%)' }, '502896': { name: 'سینا', color: '#1565c0', gradient: 'linear-gradient(135deg, #0a1628 0%, #1565c0 35%, #0d47a1 65%, #0a1020 100%)' },
    '628208': { name: 'پاسارگاد', color: '#ef6c00', gradient: 'linear-gradient(135deg, #1a0f00 0%, #e65100 25%, #f57c00 50%, #3e1f00 100%)' }, '639611': { name: 'پاسارگاد', color: '#ef6c00', gradient: 'linear-gradient(135deg, #1a0f00 0%, #e65100 25%, #f57c00 50%, #3e1f00 100%)' }, '502229': { name: 'پاسارگاد', color: '#ef6c00', gradient: 'linear-gradient(135deg, #1a0f00 0%, #e65100 25%, #f57c00 50%, #3e1f00 100%)' },
    '627488': { name: 'کارآفرین', color: '#00695c', gradient: 'linear-gradient(135deg, #0a1a17 0%, #00695c 30%, #004d40 60%, #0a2e28 100%)' },
    '639370': { name: 'اقتصاد نوین', color: '#303f9f', gradient: 'linear-gradient(135deg, #0e1030 0%, #303f9f 30%, #283593 60%, #0d0e30 100%)' },
    '636949': { name: 'دی', color: '#388e3c', gradient: 'linear-gradient(135deg, #0a1f0a 0%, #388e3c 30%, #2e7d32 55%, #0a2e0a 100%)' }, '628036': { name: 'دی', color: '#388e3c', gradient: 'linear-gradient(135deg, #0a1f0a 0%, #388e3c 30%, #2e7d32 55%, #0a2e0a 100%)' }, '502907': { name: 'دی', color: '#388e3c', gradient: 'linear-gradient(135deg, #0a1f0a 0%, #388e3c 30%, #2e7d32 55%, #0a2e0a 100%)' },
    '603761': { name: 'شهر', color: '#d32f2f', gradient: 'linear-gradient(135deg, #2a0a0a 0%, #c62828 30%, #d32f2f 55%, #3e0c0c 100%)' }, '628098': { name: 'شهر', color: '#d32f2f', gradient: 'linear-gradient(135deg, #2a0a0a 0%, #c62828 30%, #d32f2f 55%, #3e0c0c 100%)' },
    '639607': { name: 'ایران زمین', color: '#00796b', gradient: 'linear-gradient(135deg, #0a1a17 0%, #00796b 30%, #00695c 60%, #0a2e28 100%)' }, '502910': { name: 'ایران زمین', color: '#00796b', gradient: 'linear-gradient(135deg, #0a1a17 0%, #00796b 30%, #00695c 60%, #0a2e28 100%)' },
    '639347': { name: 'قوامین', color: '#7b1fa2', gradient: 'linear-gradient(135deg, #1a0a25 0%, #6a1b9a 25%, #7b1fa2 50%, #2a0e3a 100%)' },
    '603770': { name: 'پارسیان', color: '#e65100', gradient: 'linear-gradient(135deg, #2a1500 0%, #e65100 30%, #bf360c 55%, #3e1f00 100%)' }, '622106': { name: 'پارسیان', color: '#e65100', gradient: 'linear-gradient(135deg, #2a1500 0%, #e65100 30%, #bf360c 55%, #3e1f00 100%)' },
    '627760': { name: 'پست بانک', color: '#2e7d32', gradient: 'linear-gradient(135deg, #0a1a0d 0%, #2e7d32 30%, #1b5e20 55%, #0a2e0a 100%)' }, '601629': { name: 'پست بانک', color: '#2e7d32', gradient: 'linear-gradient(135deg, #0a1a0d 0%, #2e7d32 30%, #1b5e20 55%, #0a2e0a 100%)' },
    '601056': { name: 'خاورمیانه', color: '#0d47a1', gradient: 'linear-gradient(135deg, #060e1a 0%, #0d47a1 30%, #1565c0 55%, #0a1628 100%)' },
  };
  return banks[p6] || banks[p5] || null;
};

const CheckoutFlow: React.FC<CheckoutFlowProps> = ({ items, isOpen, onClose, onComplete, walletBalance, onTopUp, onDeduct }) => {
  const [step, setStep] = useState<Step>('cart');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);

  // Personal info
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // Address
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [plaque, setPlaque] = useState('');

  // Card
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardCvv2, setCardCvv2] = useState('');
  const [cardExpMonth, setCardExpMonth] = useState('');
  const [cardExpYear, setCardExpYear] = useState('');

  // Captcha
  const [cardCaptcha, setCardCaptcha] = useState('');
  const [cardCaptchaCode, setCardCaptchaCode] = useState('');

  // OTP
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [otpResendTimer, setOtpResendTimer] = useState(60);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Wallet top-up
  const [topUpAmount, setTopUpAmount] = useState('');

  const generateCaptchaCode = React.useCallback(() => {
    const code = String(Math.floor(1000 + Math.random() * 9000));
    setCardCaptchaCode(code);
    setCardCaptcha('');
  }, []);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    if (step !== 'card-details' || otpResendTimer <= 0 || !generatedOtp) return;
    const t = setInterval(() => setOtpResendTimer(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [step, otpResendTimer, generatedOtp]);

  useEffect(() => {
    if (isOpen) {
      setStep('cart');
      setPaymentMethod(null);
      setFullName('');
      setPhone('');
      setEmail('');
      setProvince('');
      setCity('');
      setFullAddress('');
      setPostalCode('');
      setPlaque('');
      setCardNumber('');
      setCardHolder('');
      setCardCvv2('');
      setCardExpMonth('');
      setCardExpYear('');
      setCardCaptcha('');
      setCardCaptchaCode('');
      setOtp(['', '', '', '', '', '']);
      setGeneratedOtp('');
      setOrderNumber('');
      setOtpResendTimer(60);
      setTopUpAmount('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (step === 'card-details') generateCaptchaCode();
  }, [step, generateCaptchaCode]);

  if (!isOpen) return null;

  const totalPrice = items.reduce((sum, item) => sum + parsePrice(item.book.price) * item.quantity, 0);
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const formatCardNumber = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const handleSendOtp = () => {
    if (cardCaptcha !== cardCaptchaCode) return;
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedOtp(code);
    setOtpResendTimer(60);
    setOtp(['', '', '', '', '', '']);
    console.log('');
    console.log('╔══════════════════════════════════════════╗');
    console.log('║          🔐 رمز پویا (One-Time Pass)       ║');
    console.log('╠══════════════════════════════════════════╣');
    console.log(`║  رمز:  ${code}                          ║`);
    console.log(`║  کارت: ${cardNumber.replace(/\s/g, '')}        ║`);
    console.log(`║  مبلغ: ${toPersianDigits(totalPrice.toLocaleString('fa-IR'))} تومان            ║`);
    console.log(`║  تاریخ: ${new Date().toLocaleString('fa-IR')}    ║`);
    console.log('╚══════════════════════════════════════════╝');
    console.log('');
    generateCaptchaCode();
    setTimeout(() => otpRefs.current[0]?.focus(), 100);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (value && !/^\d$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus();
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) {
      const newOtp = pasted.split('').concat(Array(6).fill('')).slice(0, 6);
      setOtp(newOtp);
      otpRefs.current[Math.min(pasted.length, 5)]?.focus();
    }
  };

  const finalizeOrder = (method: string, card4?: string) => {
    setStep('processing');
    const orderNum = String(Math.floor(100000 + Math.random() * 900000));
    setOrderNumber(orderNum);
    setTimeout(() => {
      const order: Order = {
        id: Date.now(),
        orderNumber: orderNum,
        items: items.map(i => ({ title: i.book.title, cover: i.book.cover, price: i.book.price, quantity: i.quantity })),
        totalPrice,
        paymentMethod: method,
        cardLast4: card4,
        date: new Date().toISOString(),
        status: 'confirmed',
      };
      setStep('success');
      onComplete(order);
    }, 2500);
  };

  const handleVerifyOtp = () => {
    if (otp.join('') === generatedOtp) {
      finalizeOrder(paymentMethod || 'card-to-card', cardNumber.replace(/\s/g, '').slice(-4));
    }
  };

  const handleWalletPay = () => {
    if (walletBalance >= totalPrice) {
      onDeduct(totalPrice);
      finalizeOrder('wallet');
    }
  };

  const handleCodPay = () => {
    finalizeOrder('cod');
  };

  const canProceedCard = cardNumber.replace(/\s/g, '').length >= 16 && cardHolder.trim().length >= 3;
  const canProceedPersonal = fullName.trim().length >= 3 && phone.trim().length >= 10;
  const canProceedAddress = province.trim() && city.trim() && fullAddress.trim().length >= 10 && postalCode.trim().length >= 10;

  const stepLabels: Record<string, string> = {
    'cart': 'سبد خرید',
    'personal': 'اطلاعات شخصی',
    'address': 'آدرس ارسال',
    'payment': 'نحوه پرداخت',
    'card-details': 'اطلاعات کارت',
    'otp': 'تأیید رمز پویا',
    'wallet-topup': 'شارژ کیف پول',
    'processing': 'در حال پردازش',
    'success': 'پرداخت موفق',
  };

  const mainSteps = ['cart', 'personal', 'address', 'payment'];
  const currentStepIdx = mainSteps.indexOf(step);
  const progressPercent = currentStepIdx >= 0 ? ((currentStepIdx + 1) / mainSteps.length) * 100 : (step === 'payment' || step === 'card-details' || step === 'otp' || step === 'wallet-topup') ? 100 : 0;

  const goBack = () => {
    if (step === 'cart') onClose();
    else if (step === 'personal') setStep('cart');
    else if (step === 'address') setStep('personal');
    else if (step === 'payment') setStep('address');
    else if (step === 'card-details') setStep('payment');
    else if (step === 'otp') setStep('card-details');
    else if (step === 'wallet-topup') setStep('payment');
  };

  const displayStep = ['cart', 'personal', 'address', 'payment'].includes(step) ? step : step;

  return (
    <div className="fixed inset-0 z-[7000] animate-fadeIn flex flex-col" style={{ background: step === 'card-details' ? 'linear-gradient(160deg, #ffffff 0%, #f0fdfa 20%, #ccfbf1 45%, #ffffff 70%, #f0fdfa 100%)' : 'var(--surface)' }} dir="rtl">
      {step === 'card-details' && (
        <>
          <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(20,184,166,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -60, left: -60, width: 260, height: 260, borderRadius: '50%', background: 'radial-gradient(circle, rgba(45,212,191,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: '40%', left: '50%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(94,234,212,0.05) 0%, transparent 60%)', transform: 'translate(-50%, -50%)', pointerEvents: 'none' }} />
        </>
      )}
      {/* Header */}
      <div className="shrink-0 px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <button onClick={goBack} className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all active:scale-90" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            <i className={`fas ${step === 'cart' || step === 'success' ? 'fa-times' : 'fa-chevron-right'} text-sm`} style={{ color: 'var(--text-2)' }} />
          </button>
          <h2 className="text-sm font-black" style={{ color: 'var(--text)' }}>
            {stepLabels[step]}
          </h2>
          <button onClick={onClose} className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all active:scale-90" style={{ background: step === 'card-details' ? 'rgba(255,255,255,0.7)' : 'var(--surface-2)', border: step === 'card-details' ? '1px solid rgba(255,255,255,0.8)' : '1px solid var(--border)', backdropFilter: 'blur(10px)' }}>
            <i className="fas fa-times text-sm" style={{ color: step === 'card-details' ? '#475569' : 'var(--text-2)' }} />
          </button>
        </div>

        {step !== 'processing' && step !== 'success' && (
          <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--surface-2)' }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progressPercent}%`, background: 'linear-gradient(90deg, var(--primary), var(--secondary))' }} />
          </div>
        )}
      </div>

      {/* Step indicators */}
      {['cart', 'personal', 'address', 'payment'].includes(step) && (
        <div className="shrink-0 flex items-center gap-1 px-5 py-2">
          {[
            { key: 'cart', label: 'سبد', icon: 'fa-shopping-cart' },
            { key: 'personal', label: 'مشخصات', icon: 'fa-user' },
            { key: 'address', label: 'آدرس', icon: 'fa-location-dot' },
            { key: 'payment', label: 'پرداخت', icon: 'fa-credit-card' },
          ].map((s, i) => (
            <React.Fragment key={s.key}>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] font-black transition-all" style={{ background: i <= currentStepIdx ? 'var(--primary)' : 'var(--surface-2)', color: i <= currentStepIdx ? 'white' : 'var(--text-3)' }}>
                <i className={`fas ${s.icon} text-[8px]`} />
                <span className="hidden sm:inline">{s.label}</span>
              </div>
              {i < 3 && <div className="flex-1 h-0.5 rounded-full transition-all" style={{ background: i < currentStepIdx ? 'var(--primary)' : 'var(--surface-2)' }} />}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 no-scrollbar">

        {/* ═══ STEP: CART ═══ */}
        {step === 'cart' && (
          <div className="space-y-3 animate-fadeInUp max-w-lg mx-auto">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'color-mix(in srgb, var(--primary) 15%, transparent)' }}>
                <i className="fas fa-shopping-cart text-[10px]" style={{ color: 'var(--primary)' }} />
              </div>
              <p className="text-xs font-black" style={{ color: 'var(--text)' }}>اقلام سبد شما</p>
            </div>

            {items.map((item, idx) => (
              <div key={item.book.id} className="flex items-center gap-3 p-3.5 rounded-2xl animate-fadeInUp" style={{ animationDelay: `${idx * 50}ms`, background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                <div className="relative w-14 h-20 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
                  {item.book.cover ? (
                    <img src={item.book.cover} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}>
                      <i className="fas fa-book text-white" />
                    </div>
                  )}
                  <div className="absolute top-0 right-0 bottom-0 w-0.5 bg-black/20" />
                </div>
                <div className="flex-1 min-w-0 text-right">
                  <h3 className="text-[13px] font-black line-clamp-1" style={{ color: 'var(--text)' }}>{item.book.title}</h3>
                  <p className="text-[10px] mt-0.5 font-bold" style={{ color: 'var(--text-3)' }}>{item.book.authorName}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md" style={{ background: 'var(--surface)', color: 'var(--text-3)' }}>تعداد: {item.quantity}</span>
                    <span className="text-[10px] font-black" style={{ color: 'var(--primary)' }}>{toPersianDigits(item.book.price || '۰')} × {item.quantity}</span>
                  </div>
                </div>
                <p className="text-sm font-black tabular-nums" style={{ color: 'var(--text)' }}>{toPersianDigits((parsePrice(item.book.price) * item.quantity).toLocaleString('fa-IR'))}</p>
              </div>
            ))}

            <div className="p-4 rounded-2xl mt-4" style={{ background: 'color-mix(in srgb, var(--primary) 8%, var(--surface-2))', border: '1px solid color-mix(in srgb, var(--primary) 15%, var(--border))' }}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold" style={{ color: 'var(--text-3)' }}>جمع کل</span>
                  <p className="text-[10px] font-bold" style={{ color: 'var(--text-3)' }}>{totalCount} کتاب</p>
                </div>
                <span className="text-lg font-black tabular-nums" style={{ color: 'var(--primary)' }}>{toPersianDigits(totalPrice.toLocaleString('fa-IR'))} <span className="text-xs">تومان</span></span>
              </div>
            </div>
          </div>
        )}

        {/* ═══ STEP: PERSONAL INFO ═══ */}
        {step === 'personal' && (
          <div className="space-y-4 animate-fadeInUp max-w-lg mx-auto">
            <p className="text-xs font-bold text-center mb-4" style={{ color: 'var(--text-3)' }}>مشخصات خود را وارد کنید</p>

            <div className="p-5 rounded-2xl space-y-3" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
              <div>
                <label className="text-[10px] font-black mb-1.5 flex items-center gap-1.5" style={{ color: 'var(--text-3)' }}>
                  <i className="fas fa-user text-[8px]" /> نام و نام خانوادگی
                </label>
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="نام کامل" className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', '--tw-ring-color': 'var(--primary)' } as any} />
              </div>
              <div>
                <label className="text-[10px] font-black mb-1.5 flex items-center gap-1.5" style={{ color: 'var(--text-3)' }}>
                  <i className="fas fa-phone text-[8px]" /> شماره تماس
                </label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))} placeholder="۰۹۱۲۳۴۵۶۷۸۹" className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2" dir="ltr" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', '--tw-ring-color': 'var(--primary)' } as any} />
              </div>
              <div>
                <label className="text-[10px] font-black mb-1.5 flex items-center gap-1.5" style={{ color: 'var(--text-3)' }}>
                  <i className="fas fa-envelope text-[8px]" /> ایمیل (اختیاری)
                </label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="example@email.com" className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2" dir="ltr" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', '--tw-ring-color': 'var(--primary)' } as any} />
              </div>
            </div>
          </div>
        )}

        {/* ═══ STEP: ADDRESS ═══ */}
        {step === 'address' && (
          <div className="space-y-4 animate-fadeInUp max-w-lg mx-auto">
            <p className="text-xs font-bold text-center mb-4" style={{ color: 'var(--text-3)' }}>آدرس ارسال سفارش</p>

            <div className="p-5 rounded-2xl space-y-3" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black mb-1.5 flex items-center gap-1.5" style={{ color: 'var(--text-3)' }}>
                    <i className="fas fa-map text-[8px]" /> استان
                  </label>
                  <input type="text" value={province} onChange={e => setProvince(e.target.value)} placeholder="تهران" className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', '--tw-ring-color': 'var(--primary)' } as any} />
                </div>
                <div>
                  <label className="text-[10px] font-black mb-1.5 flex items-center gap-1.5" style={{ color: 'var(--text-3)' }}>
                    <i className="fas fa-city text-[8px]" /> شهر
                  </label>
                  <input type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="تهران" className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', '--tw-ring-color': 'var(--primary)' } as any} />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black mb-1.5 flex items-center gap-1.5" style={{ color: 'var(--text-3)' }}>
                  <i className="fas fa-road text-[8px]" /> آدرس کامل
                </label>
                <textarea value={fullAddress} onChange={e => setFullAddress(e.target.value)} placeholder="خیابان، کوچه، پلاک..." rows={3} className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2 resize-none" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', '--tw-ring-color': 'var(--primary)' } as any} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black mb-1.5 flex items-center gap-1.5" style={{ color: 'var(--text-3)' }}>
                    <i className="fas fa-hashtag text-[8px]" /> کد پستی
                  </label>
                  <input type="text" value={postalCode} onChange={e => setPostalCode(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="۱۲۳۴۵۶۷۸۹۰" className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2" dir="ltr" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', '--tw-ring-color': 'var(--primary)' } as any} />
                </div>
                <div>
                  <label className="text-[10px] font-black mb-1.5 flex items-center gap-1.5" style={{ color: 'var(--text-3)' }}>
                    <i className="fas fa-door-open text-[8px]" /> پلاک
                  </label>
                  <input type="text" value={plaque} onChange={e => setPlaque(e.target.value)} placeholder="پلاک" className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', '--tw-ring-color': 'var(--primary)' } as any} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ STEP: PAYMENT METHOD ═══ */}
        {step === 'payment' && (
          <div className="space-y-3 animate-fadeInUp max-w-lg mx-auto">
            <p className="text-xs font-bold text-center mb-2" style={{ color: 'var(--text-3)' }}>نحوه پرداخت خود را انتخاب کنید</p>

            {/* Order summary */}
            <div className="p-3 rounded-2xl mb-3" style={{ background: 'color-mix(in srgb, var(--primary) 6%, var(--surface-2))', border: '1px solid color-mix(in srgb, var(--primary) 12%, var(--border))' }}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold" style={{ color: 'var(--text-3)' }}>مبلغ قابل پرداخت ({totalCount} کتاب)</span>
                <span className="text-sm font-black tabular-nums" style={{ color: 'var(--primary)' }}>{toPersianDigits(totalPrice.toLocaleString('fa-IR'))} تومان</span>
              </div>
            </div>

            {/* Card to Card */}
            <button onClick={() => { setPaymentMethod('card-to-card'); setStep('card-details'); }} className="w-full p-4 rounded-2xl flex items-center gap-4 active:scale-[0.98] transition-all text-right group" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all group-hover:scale-110" style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--primary) 20%, transparent), color-mix(in srgb, var(--primary) 5%, transparent))' }}>
                <i className="fas fa-exchange-alt text-lg" style={{ color: 'var(--primary)' }} />
              </div>
              <div className="flex-1 text-right">
                <h3 className="text-sm font-black" style={{ color: 'var(--text)' }}>کارت به کارت</h3>
                <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-3)' }}>انتقال مستقیم با رمز پویا</p>
              </div>
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--surface)' }}>
                <i className="fas fa-chevron-left text-[10px]" style={{ color: 'var(--text-3)' }} />
              </div>
            </button>

            {/* Wallet */}
            <button onClick={() => { setPaymentMethod('wallet'); if (walletBalance >= totalPrice) { handleWalletPay(); } else { setStep('wallet-topup'); } }} className="w-full p-4 rounded-2xl flex items-center gap-4 active:scale-[0.98] transition-all text-right group" style={{ background: walletBalance >= totalPrice ? 'linear-gradient(135deg, color-mix(in srgb, #f59e0b 8%, var(--surface-2)), var(--surface-2))' : 'var(--surface-2)', border: `1px solid ${walletBalance >= totalPrice ? 'color-mix(in srgb, #f59e0b 20%, var(--border))' : 'var(--border)'}` }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all group-hover:scale-110" style={{ background: 'linear-gradient(135deg, color-mix(in srgb, #f59e0b 20%, transparent), color-mix(in srgb, #f59e0b 5%, transparent))' }}>
                <i className="fas fa-wallet text-lg" style={{ color: '#f59e0b' }} />
              </div>
              <div className="flex-1 text-right">
                <h3 className="text-sm font-black" style={{ color: 'var(--text)' }}>کیف پول سُها</h3>
                <p className="text-[10px] mt-0.5" style={{ color: walletBalance >= totalPrice ? '#f59e0b' : 'var(--text-3)' }}>
                  موجودی: {toPersianDigits(walletBalance.toLocaleString('fa-IR'))} تومان
                  {walletBalance < totalPrice && ' — موجودی کافی نیست'}
                </p>
              </div>
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--surface)' }}>
                <i className="fas fa-chevron-left text-[10px]" style={{ color: 'var(--text-3)' }} />
              </div>
            </button>

            {/* COD */}
            <button onClick={() => { setPaymentMethod('cod'); handleCodPay(); }} className="w-full p-4 rounded-2xl flex items-center gap-4 active:scale-[0.98] transition-all text-right group" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all group-hover:scale-110" style={{ background: 'linear-gradient(135deg, color-mix(in srgb, #22c55e 20%, transparent), color-mix(in srgb, #22c55e 5%, transparent))' }}>
                <i className="fas fa-truck text-lg" style={{ color: '#22c55e' }} />
              </div>
              <div className="flex-1 text-right">
                <h3 className="text-sm font-black" style={{ color: 'var(--text)' }}>پرداخت درب محل</h3>
                <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-3)' }}>پرداخت هنگام تحویل سفارش</p>
              </div>
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--surface)' }}>
                <i className="fas fa-chevron-left text-[10px]" style={{ color: 'var(--text-3)' }} />
              </div>
            </button>
          </div>
        )}

        {/* ═══ STEP: CARD DETAILS ═══ */}
        {step === 'card-details' && (
          <div className="space-y-4 animate-fadeInUp max-w-lg mx-auto">
            {/* ── Header ── */}
            <div className="mb-1" />
            {/* ── Bank Card Visual ── */}
            {(() => {
              const bank = detectBank(cardNumber);
              const bg = bank
                ? bank.gradient
                : 'linear-gradient(135deg, #1a2744 0%, #0f1b33 50%, #162040 100%)';
              return (
              <div className="relative w-full overflow-hidden mb-3" style={{ maxWidth: 340, margin: '0 auto 12px', aspectRatio: '1.586 / 1', borderRadius: 16, background: bg, boxShadow: `0 20px 60px ${bank ? bank.color + '50' : 'rgba(0,0,0,0.5)'}` }}>
                {/* Multi-layer gradients */}
                <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 90% 10%, rgba(255,255,255,0.12), transparent 50%)' }} />
                <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 10% 90%, rgba(0,0,0,0.3), transparent 60%)' }} />
                <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, rgba(255,255,255,0.06) 0%, transparent 40%, rgba(0,0,0,0.15) 100%)` }} />
                <div className="absolute inset-0" style={{ opacity: 0.03, backgroundImage: 'repeating-linear-gradient(45deg, white 0, white 1px, transparent 0, transparent 50%)', backgroundSize: '8px 8px' }} />

                <div className="relative h-full flex flex-col justify-between" style={{ zIndex: 1, padding: '18px 22px 16px' }}>

                  {/* ── Row 1: Bank Logo ── */}
                  <div className="flex items-center justify-end">
                    {/* Bank name */}
                    {bank ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                        <span style={{ fontSize: 15, fontWeight: 900, color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.3)', letterSpacing: '0.05em' }}>{bank.name}</span>
                        <span style={{ fontSize: 7, fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.15em' }}>BANK</span>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                        <span style={{ fontSize: 14, fontWeight: 900, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em' }}>IRAN</span>
                        <span style={{ fontSize: 7, fontWeight: 600, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em' }}>BANK</span>
                      </div>
                    )}
                  </div>

                  {/* ── Row 2: Card Number ── */}
                  <div dir="ltr" style={{ fontFamily: "'Courier New', Consolas, monospace", fontSize: 19, fontWeight: 700, color: '#fff', letterSpacing: '0.15em', textAlign: 'left', textShadow: '0 1px 6px rgba(0,0,0,0.2)', padding: '4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {cardNumber || '••••  ••••  ••••  ••••'}
                  </div>

                  {/* ── Row 3: Expiry + CCV2 + Shetab ── */}
                  <div className="flex items-end justify-between">
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20 }}>
                      <div>
                        <div style={{ fontSize: 6, fontWeight: 700, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.15em', marginBottom: 2 }}>تاریخ</div>
                        <div style={{ fontFamily: "'Courier New', monospace", fontSize: 13, fontWeight: 700, color: '#fff' }}>{cardExpMonth && cardExpYear ? `${cardExpMonth}/${cardExpYear}` : '••/••'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 6, fontWeight: 700, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.15em', marginBottom: 2 }}>CVV2</div>
                        <div style={{ fontFamily: "'Courier New', monospace", fontSize: 13, fontWeight: 700, color: '#fff' }}>{cardCvv2 || '•••'}</div>
                      </div>
                    </div>

                    {/* Shetab logo */}
                    <div style={{ width: 36, height: 24, borderRadius: 5, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.15)' }}>
                      <span style={{ fontSize: 8, fontWeight: 900, color: '#fff', letterSpacing: '0.05em' }}>شتاب</span>
                    </div>
                  </div>
                </div>
              </div>
              );
            })()}

            {/* ── Form Container ── */}
            <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.8)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', boxShadow: '0 8px 32px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)' }}>
              {/* Card Number */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg flex items-center justify-center" style={{ width: 28, height: 28, background: 'rgba(245,158,11,0.12)' }}>
                      <i className="fas fa-credit-card text-[11px]" style={{ color: '#d97706' }} />
                    </div>
                    <span className="text-[13px] font-semibold" style={{ color: '#1e293b' }}>شماره کارت</span>
                  </div>
                  <span className="font-mono text-[10px] font-semibold" style={{ color: cardNumber.replace(/\s/g, '').length >= 16 ? '#16a34a' : '#94a3b8' }}>
                    {cardNumber.replace(/\s/g, '').length}/16
                  </span>
                </div>
                <input type="text" value={cardNumber} onChange={e => setCardNumber(formatCardNumber(e.target.value))} placeholder="شماره ۱۶ رقمی کارت" dir="ltr" maxLength={19}
                  style={{ width: '100%', height: 52, borderRadius: 14, fontSize: 16, fontFamily: 'monospace', fontWeight: 600, outline: 'none', background: 'rgba(255,255,255,0.8)', border: '1.5px solid rgba(255,255,255,0.9)', color: '#1e293b', caretColor: '#f59e0b', transition: 'border-color 0.3s, box-shadow 0.3s', boxSizing: 'border-box', padding: '0 18px', letterSpacing: '0.18em', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)' }}
                  onFocus={e => { e.currentTarget.style.borderColor = '#f59e0b'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.12), inset 0 1px 2px rgba(0,0,0,0.04)'; e.currentTarget.style.background = '#fff'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.9)'; e.currentTarget.style.boxShadow = 'inset 0 1px 2px rgba(0,0,0,0.04)'; e.currentTarget.style.background = 'rgba(255,255,255,0.8)'; }}
                />
              </div>

              {/* CCV2 + Expiry */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="rounded-lg flex items-center justify-center" style={{ width: 28, height: 28, background: 'rgba(245,158,11,0.12)' }}>
                    <i className="fas fa-calendar-check text-[11px]" style={{ color: '#d97706' }} />
                  </div>
                  <span className="text-[13px] font-semibold" style={{ color: '#1e293b' }}>CCV2 و تاریخ انقضا</span>
                </div>
                <div className="flex gap-2">
                  <input type="tel" inputMode="numeric" pattern="[0-9]*" value={cardCvv2} onChange={e => setCardCvv2(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="CCV2" dir="ltr" maxLength={4}
                    style={{ flex: 1, height: 50, borderRadius: 12, fontSize: 15, fontWeight: 700, fontFamily: 'monospace', textAlign: 'center', letterSpacing: '0.1em', outline: 'none', background: 'rgba(255,255,255,0.8)', border: '1.5px solid rgba(255,255,255,0.9)', color: '#1e293b', caretColor: '#f59e0b', transition: 'border-color 0.3s, box-shadow 0.3s', boxSizing: 'border-box', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)' }}
                    onFocus={e => { e.currentTarget.style.borderColor = '#f59e0b'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.12), inset 0 1px 2px rgba(0,0,0,0.04)'; e.currentTarget.style.background = '#fff'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.9)'; e.currentTarget.style.boxShadow = 'inset 0 1px 2px rgba(0,0,0,0.04)'; e.currentTarget.style.background = 'rgba(255,255,255,0.8)'; }}
                  />
                  <input type="tel" inputMode="numeric" pattern="[0-9]*" value={cardExpMonth} onChange={e => setCardExpMonth(e.target.value.replace(/\D/g, '').slice(0, 2))} placeholder="ماه" dir="ltr" maxLength={2}
                    style={{ width: 70, height: 50, borderRadius: 12, fontSize: 15, fontWeight: 700, fontFamily: 'monospace', textAlign: 'center', outline: 'none', background: 'rgba(255,255,255,0.8)', border: '1.5px solid rgba(255,255,255,0.9)', color: '#1e293b', caretColor: '#f59e0b', transition: 'border-color 0.3s, box-shadow 0.3s', boxSizing: 'border-box', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)' }}
                    onFocus={e => { e.currentTarget.style.borderColor = '#f59e0b'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.12), inset 0 1px 2px rgba(0,0,0,0.04)'; e.currentTarget.style.background = '#fff'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.9)'; e.currentTarget.style.boxShadow = 'inset 0 1px 2px rgba(0,0,0,0.04)'; e.currentTarget.style.background = 'rgba(255,255,255,0.8)'; }}
                  />
                  <input type="tel" inputMode="numeric" pattern="[0-9]*" value={cardExpYear} onChange={e => setCardExpYear(e.target.value.replace(/\D/g, '').slice(0, 2))} placeholder="سال" dir="ltr" maxLength={2}
                    style={{ width: 70, height: 50, borderRadius: 12, fontSize: 15, fontWeight: 700, fontFamily: 'monospace', textAlign: 'center', outline: 'none', background: 'rgba(255,255,255,0.8)', border: '1.5px solid rgba(255,255,255,0.9)', color: '#1e293b', caretColor: '#f59e0b', transition: 'border-color 0.3s, box-shadow 0.3s', boxSizing: 'border-box', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)' }}
                    onFocus={e => { e.currentTarget.style.borderColor = '#f59e0b'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.12), inset 0 1px 2px rgba(0,0,0,0.04)'; e.currentTarget.style.background = '#fff'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.9)'; e.currentTarget.style.boxShadow = 'inset 0 1px 2px rgba(0,0,0,0.04)'; e.currentTarget.style.background = 'rgba(255,255,255,0.8)'; }}
                  />
                </div>
              </div>
            </div>

            {/* ── Captcha ── */}
            <div className="rounded-2xl p-5 -mt-1" style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.8)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', boxShadow: '0 8px 32px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)' }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="rounded-lg flex items-center justify-center" style={{ width: 28, height: 28, background: 'rgba(245,158,11,0.12)' }}>
                  <i className="fas fa-shield-halved text-[11px]" style={{ color: '#d97706' }} />
                </div>
                <span className="text-[13px] font-semibold" style={{ color: '#1e293b' }}>کد امنیتی</span>
              </div>
              <div className="flex gap-3 items-stretch">
                <input type="tel" inputMode="numeric" pattern="[0-9]*" value={cardCaptcha} onChange={e => setCardCaptcha(e.target.value.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString()).replace(/\D/g, '').slice(0, 4))} placeholder="۴ رقم" dir="ltr" maxLength={4}
                  style={{ flex: 1, height: 52, borderRadius: 14, fontSize: 17, fontWeight: 700, fontFamily: 'monospace', textAlign: 'center', letterSpacing: '0.3em', outline: 'none', background: 'rgba(255,255,255,0.8)', border: '1.5px solid rgba(255,255,255,0.9)', color: '#1e293b', caretColor: '#f59e0b', transition: 'border-color 0.3s, box-shadow 0.3s', boxSizing: 'border-box', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)' }}
                  onFocus={e => { e.currentTarget.style.borderColor = '#f59e0b'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.12), inset 0 1px 2px rgba(0,0,0,0.04)'; e.currentTarget.style.background = '#fff'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.9)'; e.currentTarget.style.boxShadow = 'inset 0 1px 2px rgba(0,0,0,0.04)'; e.currentTarget.style.background = 'rgba(255,255,255,0.8)'; }}
                />
                <div onClick={generateCaptchaCode} className="flex items-center justify-center gap-1.5 cursor-pointer select-none shrink-0" style={{ width: 120, height: 52, borderRadius: 14, background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.08)', transition: 'background 0.2s' }}>
                  <span dir="ltr" className="font-mono text-xl font-black" style={{ color: 'rgba(245,158,11,0.65)', letterSpacing: '0.12em' }}>
                    {cardCaptchaCode.split('').map((ch, i) => (
                      <span key={i} className="inline-block" style={{ transform: `rotate(${(i % 2 === 0 ? 1 : -1) * (2 + i * 2)}deg)` }}>{ch}</span>
                    ))}
                  </span>
                  <i className="fas fa-rotate text-[8px]" style={{ color: 'rgba(245,158,11,0.25)' }} />
                </div>
              </div>
            </div>

            {/* ── OTP ── */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg flex items-center justify-center" style={{ width: 28, height: 28, background: 'rgba(245,158,11,0.12)' }}>
                    <i className="fas fa-key text-[10px]" style={{ color: '#d97706' }} />
                  </div>
                  <span className="text-[13px] font-semibold" style={{ color: '#1e293b' }}>کد تایید ۶ رقمی</span>
                </div>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(6, 36px)', direction: 'ltr' }}>
                  {[0, 1, 2, 3, 4, 5].map(i => (
                    <input
                      key={i}
                      ref={el => { otpRefs.current[i] = el; }}
                      type="tel" inputMode="numeric" pattern="[0-9]*" maxLength={2}
                      value={otp[i]}
                      onChange={e => handleOtpChange(i, e.target.value.replace(/\D/g, ''))}
                      onKeyDown={e => handleOtpKeyDown(i, e)}
                      style={{
                        height: 40, width: 36, borderRadius: 10, fontSize: 16, fontWeight: 900, outline: 'none',
                        textAlign: 'center', caretColor: '#f59e0b',
                        background: 'rgba(255,255,255,0.8)',
                        border: `1.5px solid ${otp[i] ? '#f59e0b' : 'rgba(255,255,255,0.9)'}`,
                        color: '#1e293b',
                        transition: 'border-color 0.3s, transform 0.15s, box-shadow 0.3s',
                        boxSizing: 'border-box',
                        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)',
                      }}
                      onFocus={e => { e.currentTarget.style.borderColor = '#f59e0b'; e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.12)'; e.currentTarget.style.zIndex = '1'; }}
                      onBlur={e => { e.currentTarget.style.borderColor = otp[i] ? '#f59e0b' : '#e2e8f0'; e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.zIndex = '0'; }}
                    />
                  ))}
                </div>
                <button onClick={handleSendOtp} disabled={cardNumber.replace(/\s/g, '').length < 16 || cardCvv2.length < 3 || cardExpMonth.length < 2 || cardExpYear.length < 2 || cardCaptcha !== cardCaptchaCode} style={{
                  height: 40, padding: '0 12px', borderRadius: 8, fontSize: 10, fontWeight: 700, whiteSpace: 'nowrap' as const,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, flexShrink: 0,
                  cursor: 'pointer', outline: 'none', transition: 'all 0.3s', boxSizing: 'border-box' as const,
                  background: (cardNumber.replace(/\s/g, '').length >= 16 && cardCvv2.length >= 3 && cardExpMonth.length >= 2 && cardExpYear.length >= 2 && cardCaptcha === cardCaptchaCode) ? 'linear-gradient(135deg, #f59e0b, #f97316)' : 'rgba(255,255,255,0.6)',
                  color: (cardNumber.replace(/\s/g, '').length >= 16 && cardCvv2.length >= 3 && cardExpMonth.length >= 2 && cardExpYear.length >= 2 && cardCaptcha === cardCaptchaCode) ? '#fff' : '#94a3b8',
                  border: `1px solid ${(cardNumber.replace(/\s/g, '').length >= 16 && cardCvv2.length >= 3 && cardExpMonth.length >= 2 && cardExpYear.length >= 2 && cardCaptcha === cardCaptchaCode) ? '#f59e0b' : 'rgba(255,255,255,0.8)'}`,
                  backdropFilter: 'blur(10px)',
                }}>
                  <i className={otpResendTimer > 0 && generatedOtp ? 'fas fa-clock' : 'fas fa-paper-plane'} style={{ fontSize: 9 }} />
                  {otpResendTimer > 0 && generatedOtp ? `${toPersianDigits(String(otpResendTimer))}s` : 'ارسال رمز پویا'}
                </button>
              </div>
            </div>

            {/* ── Destination ── */}
            <div className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.7)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', boxShadow: '0 8px 32px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)' }}>
              <div className="flex items-center gap-2 mb-2">
                <i className="fas fa-university text-xs" style={{ color: '#d97706' }} />
                <span className="text-[10px] font-black" style={{ color: '#78716c' }}>کارت مقصد — نشر سُها</span>
              </div>
              <p className="text-[11px] font-mono font-bold" dir="ltr" style={{ color: '#d97706' }}>{DEST_CARD}</p>
              <div className="flex items-center justify-between mt-2 pt-2" style={{ borderTop: '1px solid rgba(245,158,11,0.12)' }}>
                <span className="text-[10px] font-bold" style={{ color: '#78716c' }}>مبلغ قابل پرداخت</span>
                <span className="text-base font-black tabular-nums" style={{ color: '#d97706' }}>{toPersianDigits(totalPrice.toLocaleString('fa-IR'))} <span className="text-[10px]">تومان</span></span>
              </div>
            </div>

            {/* ── Submit ── */}
              <button onClick={handleVerifyOtp} disabled={otp.join('').length < 6 || cardNumber.replace(/\s/g, '').length < 16 || cardCvv2.length < 3 || cardExpMonth.length < 2 || cardExpYear.length < 2} className="w-full rounded-2xl text-sm font-black flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed relative overflow-hidden" style={{ height: 52, background: (otp.join('').length >= 6 && cardNumber.replace(/\s/g, '').length >= 16 && cardCvv2.length >= 3 && cardExpMonth.length >= 2 && cardExpYear.length >= 2) ? 'linear-gradient(135deg, #f59e0b, #f97316)' : 'rgba(255,255,255,0.6)', color: (otp.join('').length >= 6 && cardNumber.replace(/\s/g, '').length >= 16 && cardCvv2.length >= 3 && cardExpMonth.length >= 2 && cardExpYear.length >= 2) ? '#fff' : '#94a3b8', boxShadow: (otp.join('').length >= 6 && cardNumber.replace(/\s/g, '').length >= 16 && cardCvv2.length >= 3 && cardExpMonth.length >= 2 && cardExpYear.length >= 2) ? '0 8px 30px rgba(245,158,11,0.25)' : '0 4px 12px rgba(0,0,0,0.04)', border: `1px solid ${(otp.join('').length >= 6 && cardNumber.replace(/\s/g, '').length >= 16 && cardCvv2.length >= 3 && cardExpMonth.length >= 2 && cardExpYear.length >= 2) ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.8)'}`, backdropFilter: 'blur(10px)' }}>
              <i className="fas fa-lock text-[11px]" />
              <span>{(otp.join('').length >= 6 && cardNumber.replace(/\s/g, '').length >= 16 && cardCvv2.length >= 3 && cardExpMonth.length >= 2 && cardExpYear.length >= 2) ? 'پرداخت و تکمیل سفارش' : 'تمام فیلدها را پر کنید'}</span>
            </button>

            {/* Security */}
            <div className="flex items-center justify-center gap-1.5 mt-3">
              <i className="fas fa-lock text-[7px]" style={{ color: '#94a3b8' }} />
              <span className="text-[8px]" style={{ color: '#94a3b8' }}>پرداخت امن با رمزنگاری ۲۵۶ بیتی</span>
            </div>
          </div>
        )}

        {/* ═══ STEP: WALLET TOP-UP ═══ */}
        {step === 'wallet-topup' && (
          <div className="space-y-4 animate-fadeInUp max-w-lg mx-auto">
            <div className="text-center py-2">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: 'linear-gradient(135deg, color-mix(in srgb, #f59e0b 20%, transparent), color-mix(in srgb, #f59e0b 5%, transparent))', border: '1px solid color-mix(in srgb, #f59e0b 20%, var(--border))' }}>
                <i className="fas fa-wallet text-2xl" style={{ color: '#f59e0b' }} />
              </div>
              <p className="text-sm font-black mb-1" style={{ color: 'var(--text)' }}>شارژ کیف پول</p>
              <p className="text-[10px]" style={{ color: 'var(--text-3)' }}>
                موجودی فعلی: {toPersianDigits(walletBalance.toLocaleString('fa-IR'))} تومان
              </p>
              <p className="text-[10px] mt-1" style={{ color: '#f59e0b' }}>
                مبلغ مورد نیاز: {toPersianDigits(totalPrice.toLocaleString('fa-IR'))} تومان
              </p>
            </div>

            {/* Quick amounts */}
            <div className="grid grid-cols-2 gap-2">
              {[100000, 200000, 500000, 1000000].map(amount => (
                <button key={amount} onClick={() => { onTopUp(amount); if (walletBalance + amount >= totalPrice) { handleWalletPay(); } }} className="p-3.5 rounded-2xl text-center active:scale-[0.98] transition-all" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                  <span className="text-xs font-black" style={{ color: 'var(--text)' }}>{toPersianDigits(amount.toLocaleString('fa-IR'))}</span>
                  <p className="text-[9px] mt-0.5" style={{ color: 'var(--text-3)' }}>تومان</p>
                </button>
              ))}
            </div>

            {/* Custom amount */}
            <div className="p-4 rounded-2xl" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
              <label className="text-[10px] font-black mb-2 block" style={{ color: 'var(--text-3)' }}>مبلغ دلخواه</label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input type="text" value={topUpAmount} onChange={e => setTopUpAmount(e.target.value)} placeholder="مبلغ" className="w-full px-4 py-3 rounded-xl text-sm font-bold outline-none transition-all focus:ring-2" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', '--tw-ring-color': '#f59e0b' } as any} />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[9px] font-bold" style={{ color: 'var(--text-3)' }}>تومان</span>
                </div>
                <button onClick={() => {
                  const amt = parseInt(topUpAmount.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString()).replace(/[^0-9]/g, '')) || 0;
                  if (amt >= 10000) { onTopUp(amt); if (walletBalance + amt >= totalPrice) { handleWalletPay(); } setTopUpAmount(''); }
                }} disabled={(parseInt(topUpAmount.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString()).replace(/[^0-9]/g, '')) || 0) < 10000} className="px-5 py-3 rounded-xl text-xs font-black text-white transition-all active:scale-95 disabled:opacity-40" style={{ background: '#f59e0b' }}>
                  شارژ
                </button>
              </div>
            </div>

            {/* Card info for top-up */}
            <div className="p-4 rounded-2xl" style={{ background: 'color-mix(in srgb, #f59e0b 6%, var(--surface-2))', border: '1px solid color-mix(in srgb, #f59e0b 12%, var(--border))' }}>
              <div className="flex items-center gap-2 mb-2">
                <i className="fas fa-info-circle text-xs" style={{ color: '#f59e0b' }} />
                <span className="text-[10px] font-black" style={{ color: 'var(--text)' }}>نحوه شارژ</span>
              </div>
              <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-3)' }}>
                مبلغ مورد نظر را به کارت زیر واریز کنید و سپس گزینه شارژ را بزنید. پس از تأیید، موجودی کیف پول شما افزایش می‌یابد.
              </p>
              <p className="text-[11px] font-mono font-bold mt-2" dir="ltr" style={{ color: '#f59e0b' }}>{DEST_CARD}</p>
            </div>
          </div>
        )}

        {/* ═══ STEP: PROCESSING ═══ */}
        {step === 'processing' && (
          <div className="flex flex-col items-center justify-center h-full animate-fadeInUp">
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-full flex items-center justify-center animate-pulse" style={{ background: 'color-mix(in srgb, var(--primary) 15%, transparent)' }}>
                <i className="fas fa-spinner fa-spin text-3xl" style={{ color: 'var(--primary)' }} />
              </div>
              <div className="absolute inset-0 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
            </div>
            <p className="text-sm font-black mb-1" style={{ color: 'var(--text)' }}>در حال پردازش پرداخت...</p>
            <p className="text-[10px]" style={{ color: 'var(--text-3)' }}>لطفاً از بستن صفحه خودداری کنید</p>
          </div>
        )}

        {/* ═══ STEP: SUCCESS ═══ */}
        {step === 'success' && (
          <div className="flex flex-col items-center justify-center h-full animate-fadeInUp text-center">
            <div className="relative mb-6">
              <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, color-mix(in srgb, #22c55e 20%, transparent), color-mix(in srgb, #22c55e 5%, transparent))' }}>
                <i className="fas fa-check text-4xl" style={{ color: '#22c55e' }} />
              </div>
              <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center animate-bounce" style={{ background: '#22c55e' }}>
                <i className="fas fa-check text-xs text-white" />
              </div>
            </div>
            <h2 className="text-lg font-black mb-1" style={{ color: 'var(--text)' }}>پرداخت با موفقیت انجام شد</h2>
            <p className="text-[11px] font-bold mb-4" style={{ color: 'var(--text-3)' }}>شماره سفارش: <span className="font-mono" style={{ color: 'var(--primary)' }}>{orderNumber}</span></p>

            <div className="w-full max-w-xs p-4 rounded-2xl mb-6" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold" style={{ color: 'var(--text-3)' }}>تعداد کتاب</span>
                  <span className="text-[11px] font-black" style={{ color: 'var(--text)' }}>{totalCount} عنوان</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold" style={{ color: 'var(--text-3)' }}>مبلغ پرداختی</span>
                  <span className="text-[11px] font-black" style={{ color: 'var(--primary)' }}>{toPersianDigits(totalPrice.toLocaleString('fa-IR'))} تومان</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold" style={{ color: 'var(--text-3)' }}>نحوه پرداخت</span>
                  <span className="text-[11px] font-black" style={{ color: 'var(--text)' }}>
                    {paymentMethod === 'card-to-card' && 'کارت به کارت'}
                    {paymentMethod === 'wallet' && 'کیف پول'}
                    {paymentMethod === 'cod' && 'پرداخت درب محل'}
                  </span>
                </div>
              </div>
            </div>

            <button onClick={onClose} className="w-full max-w-xs py-3.5 rounded-2xl text-sm font-black active:scale-[0.98] transition-all" style={{ background: 'var(--primary)', color: 'white', boxShadow: '0 10px 30px var(--primary-glow)' }}>
              <i className="fas fa-store ml-2" />
              بازگشت به نشر سُها
            </button>
          </div>
        )}
      </div>

      {/* Footer buttons */}
      {step === 'cart' && items.length > 0 && (
        <div className="shrink-0 p-4 border-t" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
          <button onClick={() => setStep('personal')} className="w-full py-3.5 rounded-2xl text-white text-sm font-black flex items-center justify-center gap-2 active:scale-[0.98] transition-all relative overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--primary), color-mix(in srgb, var(--primary) 80%, var(--secondary)))', boxShadow: '0 10px 30px var(--primary-glow)' }}>
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0" />
            <i className="fas fa-arrow-left relative z-10" />
            <span className="relative z-10">ادامه فرآیند خرید</span>
          </button>
        </div>
      )}
      {step === 'personal' && (
        <div className="shrink-0 p-4 border-t" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
          <button onClick={() => setStep('address')} disabled={!canProceedPersonal} className="w-full py-3.5 rounded-2xl text-white text-sm font-black flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed relative overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--primary), color-mix(in srgb, var(--primary) 80%, var(--secondary)))', boxShadow: '0 10px 30px var(--primary-glow)' }}>
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0" />
            <i className="fas fa-arrow-left relative z-10" />
            <span className="relative z-10">مرحله بعد</span>
          </button>
        </div>
      )}
      {step === 'address' && (
        <div className="shrink-0 p-4 border-t" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
          <button onClick={() => setStep('payment')} disabled={!canProceedAddress} className="w-full py-3.5 rounded-2xl text-white text-sm font-black flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed relative overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--primary), color-mix(in srgb, var(--primary) 80%, var(--secondary)))', boxShadow: '0 10px 30px var(--primary-glow)' }}>
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0" />
            <i className="fas fa-arrow-left relative z-10" />
            <span className="relative z-10">انتخاب نحوه پرداخت</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default CheckoutFlow;
