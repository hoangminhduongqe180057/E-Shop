const BASE_URL = (import.meta.env.VITE_API_BASE || 'https://localhost:7273').replace(/\/$/, '');

async function http(path, { method = 'GET', data } = {}) {
  const options = { method, headers: {} }

  if (data instanceof FormData) {
    options.body = data
  } else if (data) {
    options.headers['Content-Type'] = 'application/json'
    options.body = JSON.stringify(data)
  }

  const res = await fetch(`${BASE_URL}${path}`, options)
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `HTTP ${res.status}`)
  }

  const text = await res.text()
  return text ? JSON.parse(text) : null
}

export const api = {
  listProducts: () => http('/api/products'),
  getProduct: (id) => http(`/api/products/${id}`),
  createProduct: (formData) => http('/api/products', { method: 'POST', data: formData }),
  updateProduct: (id, formData) => http(`/api/products/${id}`, { method: 'PUT', data: formData }),
  deleteProduct: (id) => http(`/api/products/${id}`, { method: 'DELETE' }),
}