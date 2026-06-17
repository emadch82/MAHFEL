'use server';

export async function submitContactForm(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const message = formData.get('message') as string;

  if (!name || !email || !message) {
    return { success: false, error: 'فیلدها را کامل پر کنید' };
  }

  try {
    const res = await fetch('http://localhost:5000/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message }),
    });

    if (!res.ok) {
      return { success: false, error: 'خطا در ارسال پیام' };
    }

    return { success: true, message: 'پیام شما با موفقیت ارسال شد' };
  } catch {
    return { success: false, error: 'خطای سرور' };
  }
}

export async function searchContent(query: string) {
  if (!query || query.trim().length < 2) {
    return { results: [] };
  }

  try {
    const res = await fetch(`http://localhost:5000/api/search?q=${encodeURIComponent(query)}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return { results: [] };
    }

    return await res.json();
  } catch {
    return { results: [] };
  }
}

export async function getPodcastById(id: string) {
  try {
    const res = await fetch(`http://localhost:5000/api/podcasts/${id}`, {
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      return null;
    }

    return await res.json();
  } catch {
    return null;
  }
}
