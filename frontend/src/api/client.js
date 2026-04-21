// ═══════════════════════════════════════════════════════════════════════════
// FILE: frontend/src/api/client.js
// DEVELOPER: Anak 6 (Frontend - API Client & Shared Components)
// DESKRIPSI: Axios HTTP client untuk komunikasi dengan backend API
// ═══════════════════════════════════════════════════════════════════════════

import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,  // 15 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.response.use(
  (response) => response.data,  // Return data langsung jika success
  (error) => {
    // Extract error message dari berbagai format response
    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      'Terjadi kesalahan pada server.'
    return Promise.reject(new Error(message))
  }
)

export const getStudent = (nim) => api.get(`/api/student/${nim}`)
export const getPredict = (nim) => api.get(`/api/predict/${nim}`)
export const getStudents = (params = {}) => api.get('/api/students', { params })
export const getHealth = () => api.get('/health')
export const postIPKTarget = (nim, payload) => api.post(`/api/ipk-target/${nim}`, payload)

export default api

// ═══════════════════════════════════════════════════════════════════════════
// CATATAN PENTING:
// ═══════════════════════════════════════════════════════════════════════════
// 1. BASE_URL: ambil dari environment variable atau fallback ke localhost:8001
// 2. timeout: 15 detik untuk prevent hanging requests
// 3. headers: Content-Type JSON untuk semua requests
// 4. Response interceptor: simplify response handling
//    - Success: return response.data langsung (tidak perlu .data lagi)
//    - Error: extract message dari berbagai format error response
// 5. API functions:
//    - getStudent(nim): get data mahasiswa by NIM
//    - getPredict(nim): get prediksi akademik by NIM
//    - getStudents(params): get list mahasiswa dengan filter
//    - getHealth(): health check endpoint
//    - postIPKTarget(nim, payload): submit target IPK analysis
// 6. Semua functions return Promise
// 7. Error handling: throw Error dengan message yang user-friendly
// 8. Usage example:
//    try {
//      const data = await getStudent('24026004')
//      console.log(data)  // Langsung dapat data, tidak perlu .data
//    } catch (error) {
//      console.error(error.message)  // User-friendly error message
//    }
// ═══════════════════════════════════════════════════════════════════════════
