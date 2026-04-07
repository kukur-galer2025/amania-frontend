// app/utils/api.ts

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// 🔥 Tambahkan parameter ke-3 (isFormData) sebagai opsional (default: false)
export const apiFetch = async (endpoint: string, options: RequestInit = {}, isFormData: boolean = false) => {
  // 1. Ambil token dari localStorage
  let token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // 🔥 MAGIC FIX 1: Hapus tanda kutip ekstra jika token disimpan via JSON.stringify 🔥
  if (token && (token.startsWith('"') && token.endsWith('"'))) {
    token = token.slice(1, -1);
  }

  // 2. Gunakan Web API 'Headers' agar manipulasi lebih stabil
  const headers = new Headers(options.headers || {});

  // 3. Set default Accept
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  // 4. Masukkan Authorization jika token tersedia
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // 5. 🔥 MAGIC FIX 2: Cerdas menangani Content-Type (FormData vs JSON) 🔥
  // Mengecek parameter isFormData ATAU otomatis mendeteksi instanceof FormData
  if (isFormData || options.body instanceof FormData) {
    headers.delete('Content-Type');
    headers.delete('content-type');
  } else {
    // Jika bukan FormData, pastikan set ke JSON jika belum ada
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: headers,
    });

    // Logging sederhana untuk bantu kamu debugging di console browser
    if (response.status === 401) {
      console.warn(`[API] 401 Unauthorized pada: ${endpoint}. Cek apakah token masih valid.`);
    }

    return response;
  } catch (error) {
    console.error("[API] Fetch Error:", error);
    throw error;
  }
};