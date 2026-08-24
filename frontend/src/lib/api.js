import axios from 'axios'

const TOKEN_KEY = 'ukmverse_token'

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

const client = axios.create({
  baseURL: '/api',
  headers: { Accept: 'application/json' },
})

client.interceptors.request.use((config) => {
  const token = tokenStore.get()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

client.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && tokenStore.get()) {
      tokenStore.clear()
      window.dispatchEvent(new CustomEvent('ukmverse:unauthorized'))
    }
    return Promise.reject(error)
  },
)

export function extractError(error) {
  const body = error?.response?.data
  if (body?.errors) {
    const first = Object.values(body.errors)[0]?.[0]
    return { message: first || body.message || 'Terjadi kesalahan', fieldErrors: body.errors }
  }
  return { message: body?.message || error?.message || 'Terjadi kesalahan', fieldErrors: null }
}

// ---- Auth ----
export async function loginUser(payload) {
  const { data } = await client.post('/login', payload)
  return data
}
export async function registerUser(payload) {
  const { data } = await client.post('/register', payload)
  return data
}
export async function logoutUser() {
  const { data } = await client.post('/logout')
  return data
}
export async function fetchMe() {
  const { data } = await client.get('/me')
  return data
}

// ---- Kategori ----
export async function listCategories() {
  const { data } = await client.get('/categories')
  return data.data
}

// ---- UMKM ----
export async function listUmkms(params = {}) {
  const { data } = await client.get('/umkms', { params })
  return data
}

// NOTE: endpoint `/my-umkms` belum ada di backend - minta temen backend
// tambahkan `GET /api/my-umkms` (auth:sanctum) yang mengembalikan daftar
// UMKM milik user login (shape: paginasi seperti /umkms).
export async function listMyUmkms() {
  const { data } = await client.get('/my-umkms')
  return data
}

export async function getUmkm(slug) {
  const { data } = await client.get(`/umkms/${slug}`)
  return data
}

export async function createUmkm(formData) {
  const { data } = await client.post('/umkms', formData)
  return data
}

export async function updateUmkm(id, formData, withImage) {
  if (withImage) formData.append('_method', 'PUT')
  const { data } = await client.post(`/umkms/${id}`, formData)
  return data
}

export async function deleteUmkm(id) {
  const { data } = await client.delete(`/umkms/${id}`)
  return data
}

// ---- Admin (verifikasi lapak) ----
// NOTE: endpoint /admin/* belum ada di backend - lihat catatan Obsidian
// "Catatan Backend" untuk spesifikasi lengkapnya. Frontend sudah menangani
// 404/405 dengan fallback empty state.
export async function listPendingUmkms() {
  const { data } = await client.get('/admin/umkms/pending')
  return data
}

export async function verifyUmkm(id) {
  const { data } = await client.patch(`/admin/umkms/${id}/verify`)
  return data
}

export async function rejectUmkm(id) {
  const { data } = await client.patch(`/admin/umkms/${id}/reject`)
  return data
}

// ---- Rating ----
// NOTE: endpoint rating belum ada di backend - spesifikasi di catatan Obsidian.
// Frontend menyembunyikan UI rating secara halus kalau endpoint 404.
export async function rateUmkm(slug, rating) {
  const { data } = await client.post(`/umkms/${slug}/rate`, { rating })
  return data
}

export async function fetchMyRating(slug) {
  const { data } = await client.get(`/umkms/${slug}/my-rating`)
  return data
}

// ---- Komentar ----
// NOTE: endpoint komentar belum ada di backend - spesifikasi di catatan Obsidian.
export async function fetchComments(slug, page = 1) {
  const { data } = await client.get(`/umkms/${slug}/comments`, { params: { page } })
  return data
}

export async function postComment(slug, comment) {
  const { data } = await client.post(`/umkms/${slug}/comments`, { comment })
  return data
}