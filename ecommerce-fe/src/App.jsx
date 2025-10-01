import { useEffect, useMemo, useState } from 'react'
import { api } from './lib/api'
import { Card, Button } from './components/Kit'
import ProductForm from './components/ProductForm'
import Modal from './components/Modal'
import Toast from './components/Toast'
import { makeT } from './i18n'
import SparkleCursor from './components/SparkleCursor'

export default function App() {
  // theme & lang
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'vi')
  const t = makeT(lang)
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark')
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('theme', theme)
  }, [theme])
  useEffect(() => { localStorage.setItem('lang', lang) }, [lang])

  // data
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [toast, setToast] = useState({ open: false, msg: '', type: 'success' })
  const [openCreate, setOpenCreate] = useState(false)
  const [editing, setEditing] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [detail, setDetail] = useState(null)

  // filters
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [sort, setSort] = useState('default')

  // paging
const [page, setPage] = useState(1)
const [pageSize, setPageSize] = useState(4)

  async function load() {
    setLoading(true)
    try {
      const data = await api.listProducts()
      setItems(data)
    } catch {
      setToast({ open: true, msg: 'Lỗi tải dữ liệu', type: 'error' })
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    let list = items
    const q = query.trim().toLowerCase()
    if (q) list = list.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
    const min = parseFloat(minPrice); const max = parseFloat(maxPrice)
    if (!isNaN(min)) list = list.filter(p => p.price >= min)
    if (!isNaN(max)) list = list.filter(p => p.price <= max)
    if (sort === 'price-asc') list = [...list].sort((a,b)=>a.price-b.price)
    if (sort === 'price-desc') list = [...list].sort((a,b)=>b.price-a.price)
    return list
  }, [items, query, minPrice, maxPrice, sort])

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, page, pageSize])

  const totalPages = Math.ceil(filtered.length / pageSize)

  async function createProduct(payload) {
    try {
      await api.createProduct(payload)
      setOpenCreate(false)
      setToast({ open: true, msg: t('createdOk'), type: 'success' })
      load()
    } catch {
      setToast({ open: true, msg: t('createdErr'), type: 'error' })
    }
  }

  async function updateProduct(payload) {
    try {
      await api.updateProduct(editing.id, payload)
      setEditing(null)
      setToast({ open: true, msg: t('updatedOk'), type: 'success' })
      load()
    } catch {
      setToast({ open: true, msg: t('updatedErr'), type: 'error' })
    }
  }

  async function deleteProductConfirm() {
    try {
      await api.deleteProduct(confirm.id)
      setConfirm(null)
      setToast({ open: true, msg: t('deletedOk'), type: 'success' })
      load()
    } catch {
      setToast({ open: true, msg: t('deletedErr'), type: 'error' })
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur bg-gradient-to-r from-brand-600/80 to-brand-500/80 border-b border-base-line shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <span className="text-xl font-bold text-white">E-Shop</span>
          <div className="flex items-center gap-2">
            <select
              className="bg-white text-gray-800 dark:bg-gray-700 dark:text-white border border-white/20 rounded-lg px-2 py-1 text-sm"
              value={lang}
              onChange={e=>setLang(e.target.value)}
            >
              <option value="vi">🇻🇳 VN</option>
              <option value="en">🇬🇧 EN</option>
            </select>
            <Button variant="ghost" size="sm" onClick={()=>setTheme(theme==='dark'?'light':'dark')}>
              {theme === 'dark' ? '🌙' : '☀️'}
            </Button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-5">

        {/* Search + Filters */}
        <Card>
          <div className="p-4 flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <input
                className="flex-1 md:w-[360px] bg-base-soft border border-base-line rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500"
                placeholder={t('search')}
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
              <div className="flex items-center gap-2">
                <Button onClick={() => setOpenCreate(true)}>{t('add')}</Button>
                <Button variant="ghost" onClick={load}>{t('refresh')}</Button>
              </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs text-base-mute mb-1">{t('minPrice')}</label>
                <input
                  className="w-full bg-base-soft border border-base-line rounded-xl px-3 py-2"
                  type="number" min="0" value={minPrice}
                  onChange={e=>setMinPrice(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-base-mute mb-1">{t('maxPrice')}</label>
                <input
                  className="w-full bg-base-soft border border-base-line rounded-xl px-3 py-2"
                  type="number" min="0" value={maxPrice}
                  onChange={e=>setMaxPrice(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-base-mute mb-1">{t('sort')}</label>
                <select
                  className="w-full bg-base-soft border border-base-line rounded-xl px-3 py-2"
                  value={sort} onChange={e=>setSort(e.target.value)}
                >
                  <option value="default">{t('sortDefault')}</option>
                  <option value="price-asc">{t('sortPriceAsc')}</option>
                  <option value="price-desc">{t('sortPriceDesc')}</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => { setMinPrice(''); setMaxPrice(''); setSort('default') }}
                >
                  {t('reset')}
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-base-mute">
            Hiển thị {pageSize} sản phẩm / trang
          </span>
          <select
            className="bg-base-soft border border-base-line rounded-lg px-2 py-1 text-sm"
            value={pageSize}
            onChange={e => { setPageSize(Number(e.target.value)); setPage(1) }}
          >
            <option value={4}>4</option>
            <option value={8}>8</option>
            <option value={12}>12</option>
            <option value={16}>16</option>
          </select>
        </div>

        {/* Product Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paged.map(p => (
            <Card key={p.id} className="p-3 hover:shadow-lg transition">
              <img src={p.imageUrl} alt={p.name} className="w-full h-40 object-contain rounded-lg border border-base-line bg-white"/>
              <div className="mt-2">
                <div className="font-semibold text-base">{p.name}</div>
                <div className="text-sm text-base-mute line-clamp-2">{p.description}</div>
                <div className="mt-1 font-bold text-brand-600">{Intl.NumberFormat('vi-VN').format(p.price)} đ</div>
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <Button size="sm" variant="ghost" onClick={()=>setDetail(p)}>{t('detail')}</Button>
                <Button size="sm" onClick={()=>setEditing(p)}>{t('edit')}</Button>
                <Button size="sm" variant="danger" onClick={()=>setConfirm(p)}>{t('delete')}</Button>
              </div>
            </Card>
          ))}
        </div>

        <div className="flex justify-center items-center gap-2 mt-6">
          <Button
            variant="ghost"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            ⬅️
          </Button>
          <span className="text-sm">Trang {page} / {totalPages}</span>
          <Button
            variant="ghost"
            size="sm"
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            ➡️
          </Button>
        </div>
      </main>

      {/* Create */}
      <Modal open={openCreate} onClose={() => setOpenCreate(false)} title={t('createTitle')}>
        <ProductForm t={t} onSubmit={createProduct} />
      </Modal>

      {/* Edit */}
      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={t('editTitle')}
        footer={(
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setEditing(null)}>{t('cancel')}</Button>
          </div>
        )}
      >
        {editing && <ProductForm t={t} initial={editing} onSubmit={updateProduct} />}
      </Modal>

      {/* Detail */}
      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        title={t('detailTitle')}
        className="my-8 max-h-[80vh] overflow-y-auto"
        footer={(
          <div className="flex justify-end">
            <Button variant="ghost" onClick={() => setDetail(null)}>
              {t('close')}
            </Button>
          </div>
        )}
      >
        {detail && (
          <div className="space-y-4">
            <img 
              src={detail.imageUrl} 
              alt={detail.name} 
              className="w-full max-h-[60vh] object-contain rounded-xl border border-base-line bg-base-soft"
            />
            <div>
              <div className="font-semibold text-lg">{detail.name}</div>
              <div className="text-base-mute">{detail.description}</div>
              <div className="mt-2 font-medium">
                {Intl.NumberFormat('vi-VN').format(detail.price)} đ
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirm delete */}
      <Modal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title={t('confirmDelete')}
        footer={(
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfirm(null)}>{t('later')}</Button>
            <Button variant="danger" onClick={deleteProductConfirm}>{t('delete')}</Button>
          </div>
        )}
      >
        {confirm && (
          <div className="text-base-mute">
            {lang === 'vi'
              ? <>Bạn chắc chắn muốn xoá <span className="text-base-text">{confirm.name}</span>?</>
              : <>Are you sure to delete <span className="text-base-text">{confirm.name}</span>?</>}
          </div>
        )}
      </Modal>

      {/* Toast + Hiệu ứng */}
      <Toast
        open={toast.open}
        message={toast.msg}
        type={toast.type}
        onClose={() => setToast(t => ({ ...t, open: false }))}
      />
      <SparkleCursor />
    </div>
  )
}
