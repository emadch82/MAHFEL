
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { User, UserRole } from '../types';
import { toPersianDigits, getRandomTailwindColor, getInitials } from '../utils/helpers';
import { sendOtp, verifyOtp, completeProfile } from '../services/api';
import { SohaLogo, SohaLogotype } from '../components/SohaLogo';

interface LoginPageProps {
  onLoginSuccess: (user: User, token?: string) => void;
}

const ADMIN_IDENTITY = {
    name: 'سرای هنر و اندیشه',
    avatar: ''
};

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [avatarBase64, setAvatarBase64] = useState<string | null>(null);
  const [securityKey, setSecurityKey] = useState('');
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [existingUserData, setExistingUserData] = useState<User | null>(null); // for returning users
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Cropping States
  const [showCropModal, setShowCropModal] = useState(false);
  const [rawImage, setRawImage] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarColor = useMemo(() => getRandomTailwindColor(name), [name, step === 3]);

  const getStoredUser = async (phone: string): Promise<User | null> => {
    try {
      const res = await verifyOtp(phone, '0000');
      if (res && res.user && res.user.name) {
        return {
          phoneNumber: res.user.phoneNumber,
          name: res.user.name,
          avatar: res.user.avatar,
          role: res.user.role as UserRole,
          interests: res.user.interests || [],
          library: res.user.library,
        };
      }
    } catch {}
    return null;
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^09\d{9}$/.test(phoneNumber)) {
      setError('شماره موبایل نامعتبر است');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      const res = await sendOtp(phoneNumber);
      if (res && res.success) {
        setStep(2);
      } else {
        setError('خطا در ارسال کد. لطفاً دوباره تلاش کنید');
      }
    } catch (err: any) {
      setError(err?.message || 'خطا در ارسال کد');
    }
    setIsSubmitting(false);
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const joined = otp.join('');
    if (joined.length < 4) {
      setError('کد تایید ناقص است');
      return;
    }
    setError('');
    setIsSubmitting(true);

    try {
      const res = await verifyOtp(phoneNumber, joined);
      if (res && res.success) {
        if (res.token) localStorage.setItem('soha_token', res.token);
        if (res.user && res.user.name) {
          setExistingUserData({
            phoneNumber: res.user.phoneNumber,
            name: res.user.name,
            avatar: res.user.avatar,
            role: res.user.role as UserRole,
            interests: res.user.interests || [],
            library: res.user.library,
          });
          setName(res.user.name);
          if (res.user.avatar) setAvatarBase64(res.user.avatar);
        }
        setStep(3);
      } else {
        setError('خطا در تایید کد. لطفاً دوباره تلاش کنید');
      }
    } catch (err: any) {
      setError(err?.message || 'خطا در تایید کد');
    }
    setIsSubmitting(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setRawImage(reader.result as string);
        setShowCropModal(true);
        setZoom(1);
        setPosition({ x: 0, y: 0 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    isDragging.current = true;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    startPos.current = { x: clientX - position.x, y: clientY - position.y };
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging.current) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setPosition({ x: clientX - startPos.current.x, y: clientY - startPos.current.y });
  };

  const stopDragging = () => { isDragging.current = false; };

  const applyCrop = () => {
    const canvas = document.createElement('canvas');
    const outSize = 400; // Output resolution
    canvas.width = outSize;
    canvas.height = outSize;
    const ctx = canvas.getContext('2d');
    
    if (ctx && imageRef.current) {
      const img = imageRef.current;
      const displaySize = 280; // Size of the UI circle
      
      const naturalWidth = img.naturalWidth;
      const naturalHeight = img.naturalHeight;
      const aspect = naturalWidth / naturalHeight;
      
      // Calculate dimensions in UI space exactly as they appear
      let baseWidth, baseHeight;
      if (aspect > 1) {
          baseHeight = displaySize;
          baseWidth = displaySize * aspect;
      } else {
          baseWidth = displaySize;
          baseHeight = displaySize / aspect;
      }

      const drawWidth = baseWidth * zoom;
      const drawHeight = baseHeight * zoom;

      // Canvas context cleanup
      ctx.clearRect(0, 0, outSize, outSize);
      ctx.beginPath();
      ctx.arc(outSize / 2, outSize / 2, outSize / 2, 0, Math.PI * 2);
      ctx.clip();
      
      const canvasScale = outSize / displaySize;
      
      // Coordinate logic:
      // UI center of circle is (140, 140)
      // UI center of image is (140 + position.x, 140 + position.y)
      // Top-Left relative to circle origin:
      const uiX = (displaySize / 2) + position.x - (drawWidth / 2);
      const uiY = (displaySize / 2) + position.y - (drawHeight / 2);

      ctx.drawImage(
        img, 
        uiX * canvasScale, 
        uiY * canvasScale, 
        drawWidth * canvasScale, 
        drawHeight * canvasScale
      );
      
      setAvatarBase64(canvas.toDataURL('image/jpeg', 0.95));
      setShowCropModal(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (role !== 'admin' && !name.trim()) {
      setError('نام خود را وارد کنید');
      return;
    }
    setError('');
    if (role === 'admin') { setAdminUsername(''); setAdminPassword(''); setStep(4); }
    else if (role === 'author') setStep(4);
    else if (existingUserData && role === existingUserData.role) {
      onLoginSuccess(existingUserData);
    } else await finalizeLogin();
  };

  const handleSecurityKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (role === 'admin') {
      if (adminUsername !== 'admin' || adminPassword !== 'admin') {
        setError('نام کاربری یا رمز عبور اشتباه است');
        return;
      }
      await finalizeLogin();
    } else {
      try {
        const res = await completeProfile({ name, avatar: avatarBase64 || undefined, role, securityKey });
        if (res) {
          onLoginSuccess({
            phoneNumber: res.user.phoneNumber,
            name: res.user.name,
            avatar: res.user.avatar,
            role: res.user.role as UserRole,
            interests: res.user.interests || [],
            library: res.user.library,
          }, res.token);
        }
      } catch {
        setError('رمز امنیتی اشتباه است');
      }
    }
  };

  const finalizeLogin = async () => {
    try {
      const res = await completeProfile({
        name: role === 'admin' ? ADMIN_IDENTITY.name : name,
        avatar: role === 'admin' ? ADMIN_IDENTITY.avatar : (avatarBase64 || undefined),
        role,
        securityKey: role === 'admin' ? 'admin123' : undefined,
      });
      if (res) {
        onLoginSuccess({
          phoneNumber: res.user.phoneNumber,
          name: res.user.name,
          avatar: res.user.avatar,
          role: res.user.role as UserRole,
          interests: res.user.interests || [],
          library: res.user.library,
        }, res.token);
      }
    } catch {}
  };

  return (
    <div className="fixed inset-0 bg-background z-[2000] flex flex-col items-center justify-center p-6 animate-fadeIn font-sans overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent pointer-events-none"></div>
      
      <div className="w-full max-w-sm z-10">
        <div className="flex flex-col items-center mb-10 animate-slideInDown">
          <div className="mb-5">
             <SohaLogo size={88} />
          </div>
          <h1 className="font-nastaliq font-black text-3xl text-primary tracking-tight" style={{ textShadow: '0 2px 10px rgba(26, 179, 148, 0.3)' }}>
            سرای هنر و اندیشه
          </h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.25em] mt-2">Saraye Honar va Andisheh</p>
        </div>

        <div className="bg-white/95 backdrop-blur-2xl p-8 rounded-[3rem] shadow-2xl border border-white/40 animate-slideInUp relative min-h-[420px] flex flex-col justify-center">
          
          {step === 1 && (
            <form onSubmit={handlePhoneSubmit} className="space-y-6 animate-fadeIn">
              <div className="text-center">
                <h1 className="text-xl font-black text-gray-800 font-nastaliq">ورود به سرای هنر و اندیشه</h1>
                <p className="text-xs text-gray-500 mt-1 font-bold">برای شروع شماره موبایل خود را وارد کنید</p>
              </div>
              <input type="tel" dir="ltr" value={phoneNumber} onChange={(e) => { const val = e.target.value.replace(/\D/g, '').slice(0, 11); setPhoneNumber(val); }} maxLength={11} placeholder="09123456789" className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-4 text-center text-lg font-bold focus:border-primary transition-all outline-none" />
              {error && <p className="text-red-500 text-[10px] font-black text-center">{error}</p>}
              <button type="submit" className="w-full bg-primary text-white font-black py-4 rounded-2xl shadow-lg active:scale-95 transition-all">
                {isSubmitting ? <i className="fas fa-circle-notch fa-spin"></i> : 'دریافت کد تایید'}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleOtpSubmit} className="space-y-6 animate-fadeIn">
              <div className="text-center">
                <button type="button" onClick={() => setStep(1)} className="text-primary text-[10px] font-black mb-4 flex items-center gap-1 mx-auto bg-primary/5 px-3 py-1.5 rounded-full"><i className="fas fa-edit"></i> تغییر شماره ({phoneNumber})</button>
                <h1 className="text-xl font-black text-gray-800">تایید شماره</h1>
              </div>
              <div className="flex justify-center gap-3" dir="ltr">
                {otp.map((digit, idx) => (
                  <input key={idx} id={`otp-${idx}`} type="text" maxLength={1} value={digit}
                    onChange={(e) => {
                      const newOtp = [...otp];
                      newOtp[idx] = e.target.value.slice(-1);
                      setOtp(newOtp);
                      if (e.target.value && idx < 3) document.getElementById(`otp-${idx + 1}`)?.focus();
                    }}
                    className="w-12 h-12 bg-gray-50 border-2 border-gray-100 rounded-xl text-center text-xl font-black focus:border-primary outline-none"
                  />
                ))}
              </div>
              <button type="submit" className="w-full bg-primary text-white font-black py-4 rounded-2xl shadow-lg active:scale-95 transition-all">تایید نهایی</button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleProfileSubmit} className="space-y-6 animate-fadeIn">
              <div className="text-center mb-2">
                  <h1 className="text-lg font-black text-gray-800">تکمیل پروفایل</h1>
                  <p className="text-[10px] text-gray-400 font-bold mt-1">اطلاعات کاربری خود را وارد کنید</p>
              </div>

              <div className="flex flex-col items-center gap-4">
                {role === 'admin' ? (
                    <div className="flex flex-col items-center animate-fadeIn">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary shadow-xl ring-4 ring-primary/10">
                            <SohaLogo size={96} />
                        </div>
                        <span className="text-primary font-black text-sm mt-3">{ADMIN_IDENTITY.name}</span>
                        <p className="text-[9px] text-gray-400 font-bold mt-1">هویت رسمی مدیریت</p>
                    </div>
                ) : (
                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <div className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center shadow-2xl border-4 border-white transition-transform group-hover:scale-105"
                            style={{ backgroundColor: avatarBase64 ? 'transparent' : avatarColor }}>
                            {avatarBase64 ? <img src={avatarBase64} className="w-full h-full object-cover" alt="Avatar" /> : <span className="text-white text-3xl font-black">{getInitials(name)}</span>}
                        </div>
                        <div className="absolute bottom-0 right-0 bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white"><i className="fas fa-camera text-[10px]"></i></div>
                        <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileChange} />
                    </div>
                )}
              </div>

              <div className="space-y-4">
                {role !== 'admin' && <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="نام و نام خانوادگی" className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3 text-sm font-bold focus:border-primary outline-none transition-all" />}
                <div className="grid grid-cols-3 gap-2">
                  {(['user', 'author', 'admin'] as UserRole[]).map((r) => (
                    <button key={r} type="button" onClick={() => { setRole(r); setError(''); }} className={`py-2 rounded-xl text-[10px] font-black border-2 transition-all ${role === r ? 'bg-primary border-primary text-white shadow-md' : 'bg-white border-gray-100 text-gray-400'}`}>
                      {r === 'user' ? 'کاربر' : r === 'author' ? 'نویسنده' : 'ادمین'}
                    </button>
                  ))}
                </div>
              </div>
              <button type="submit" className="w-full bg-primary text-white font-black py-4 rounded-2xl shadow-lg active:scale-95 transition-all">{role === 'user' ? 'ورود به سرای هنر و اندیشه' : 'مرحله بعد'}</button>
            </form>
          )}

          {step === 4 && role === 'admin' && (
            <form onSubmit={handleSecurityKeySubmit} className="space-y-6 animate-fadeIn">
              <div className="text-center">
                <button type="button" onClick={() => setStep(3)} className="text-primary text-[10px] font-black mb-4 flex items-center gap-1 mx-auto bg-primary/5 px-4 py-2 rounded-full active:scale-95 transition-all"><i className="fas fa-arrow-right"></i> بازگشت</button>
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 mx-auto mb-4 border-2 border-red-100"><i className="fas fa-shield-alt text-2xl"></i></div>
                <h1 className="text-lg font-black text-gray-800">ورود به پنل مدیریت</h1>
                <p className="text-[10px] text-gray-500 mt-1 font-bold">نام کاربری و رمز عبور مدیر سیستم را وارد کنید</p>
              </div>
              <input type="text" value={adminUsername} onChange={(e) => setAdminUsername(e.target.value)} placeholder="نام کاربری" className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-4 text-center text-sm font-bold focus:border-primary outline-none transition-all" />
              <input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} placeholder="رمز عبور" className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-4 text-center text-sm font-bold focus:border-primary outline-none transition-all" />
              {error && <p className="text-red-500 text-[10px] font-black text-center">{error}</p>}
              <button type="submit" className="w-full bg-gray-900 text-white font-black py-4 rounded-2xl shadow-lg active:scale-95 transition-all">ورود به پنل مدیریت</button>
            </form>
          )}

          {step === 4 && role === 'author' && (
            <form onSubmit={handleSecurityKeySubmit} className="space-y-6 animate-fadeIn">
              <div className="text-center">
                <button type="button" onClick={() => setStep(3)} className="text-primary text-[10px] font-black mb-4 flex items-center gap-1 mx-auto bg-primary/5 px-4 py-2 rounded-full active:scale-95 transition-all"><i className="fas fa-arrow-right"></i> بازگشت</button>
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 mx-auto mb-4 border-2 border-red-100"><i className="fas fa-shield-alt text-2xl"></i></div>
                <h1 className="text-lg font-black text-gray-800">تایید سطح دسترسی</h1>
                <p className="text-[10px] text-gray-500 mt-1 font-bold">برای نقش <span className="text-primary">نویسنده</span> نیاز به رمز دارید</p>
              </div>
              <input type="password" value={securityKey} onChange={(e) => setSecurityKey(e.target.value)} placeholder="رمز عبور مخصوص" className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-4 text-center font-bold focus:border-primary outline-none" />
              {error && <p className="text-red-500 text-[10px] font-black text-center">{error}</p>}
              <button type="submit" className="w-full bg-gray-900 text-white font-black py-4 rounded-2xl shadow-lg active:scale-95 transition-all">ورود نهایی</button>
            </form>
          )}
        </div>
      </div>

      {showCropModal && rawImage && (
        <div className="fixed inset-0 z-[3000] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 animate-fadeIn">
          <div className="w-full max-w-sm bg-white rounded-[3.5rem] p-8 flex flex-col items-center shadow-2xl relative">
            <button onClick={() => setShowCropModal(false)} className="absolute top-6 left-6 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 active:scale-90 transition-all z-20"><i className="fas fa-times"></i></button>
            <h3 className="text-lg font-black text-gray-800 mb-8 mt-4">تنظیم تصویر پروفایل</h3>
            <div className="relative w-72 h-72 bg-gray-50 rounded-full overflow-hidden border-4 border-primary/20 cursor-move shadow-inner" onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={stopDragging} onMouseLeave={stopDragging} onTouchStart={handleMouseDown} onTouchMove={handleMouseMove} onTouchEnd={stopDragging}>
              <img ref={imageRef} src={rawImage} alt="Crop Area" className="absolute max-w-none pointer-events-none select-none origin-center" style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`, top: '50%', left: '50%', marginTop: '-140px', marginLeft: '-140px', width: '280px', transition: isDragging.current ? 'none' : 'transform 0.1s ease-out' }} />
              <div className="absolute inset-0 border-[30px] border-black/40 pointer-events-none rounded-full"></div>
              <div className="absolute inset-0 border-2 border-primary pointer-events-none rounded-full ring-4 ring-primary/5"></div>
            </div>
            <div className="w-full mt-10 space-y-8">
              <div className="flex items-center gap-5 bg-gray-50 p-4 rounded-2xl">
                <i className="fas fa-search-minus text-gray-300"></i>
                <input type="range" min="1" max="4" step="0.01" value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} className="flex-1 accent-primary h-2 bg-gray-200 rounded-full appearance-none cursor-pointer" />
                <i className="fas fa-search-plus text-gray-300"></i>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setShowCropModal(false)} className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-sm active:scale-95 transition-all">انصراف</button>
                <button onClick={applyCrop} className="flex-[2] py-4 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/30 active:scale-95 transition-all flex items-center justify-center gap-2"><i className="fas fa-check-circle"></i> تایید و برش</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
