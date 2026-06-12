
export const DEFAULT_COVER = '/pdc.png';

export const formatTime = (seconds: number): string => {
  if (isNaN(seconds)) return "00:00";
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hours > 0) return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

export const toPersianDigits = (str: string | number): string => {
    if (str === null || str === undefined) return '';
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return str.toString().replace(/\d/g, (d) => persianDigits[parseInt(d)]);
};

export const getRandomTailwindColor = (seed: string = "") => {
  const colors = [
    '#EF4444', '#3B82F6', '#10B981', '#F59E0B', 
    '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6',
    '#F97316', '#06B6D4'
  ];
  const index = seed ? seed.length % colors.length : Math.floor(Math.random() * colors.length);
  return colors[index];
};

export const getInitials = (name: string) => {
  if (!name) return "؟";
  const parts = name.trim().split(' ');
  if (parts.length > 1) return parts[0][0] + (parts[1] ? parts[1][0] : "");
  return name.trim().charAt(0);
};

export const formatPersianDate = (dateStr: string): string => {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Intl.DateTimeFormat('fa-IR', options).format(date);
  } catch (e) {
    return toPersianDigits(dateStr);
  }
};

export const isSameDay = (d1: Date, d2: Date): boolean => {
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
};

export const formatDateSeparator = (dateStr: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (isSameDay(date, today)) return 'امروز';
  if (isSameDay(date, yesterday)) return 'دیروز';
  
  return formatPersianDate(dateStr);
};

export const formatTimeFromISO = (isoString: string): string => {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return toPersianDigits(`${hours}:${minutes}`);
  } catch (e) {
    return '';
  }
};

export const formatPersianDateForInput = (dateStr: string): string => {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Intl.DateTimeFormat('fa-IR', options).format(date);
  } catch (e) {
    return toPersianDigits(dateStr);
  }
};

export const parsePersianDateInput = (persianStr: string): string | null => {
  if (!persianStr) return null;
  const engStr = persianStr.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString());
  return engStr;
};
