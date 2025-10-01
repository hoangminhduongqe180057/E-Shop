import { useState, useEffect } from 'react'
import { Input, TextArea } from './Kit'

export default function ProductForm({ t, initial, onSubmit }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [file, setFile] = useState(null)

  useEffect(() => {
    if (initial) {
      setName(initial.name || '')
      setDescription(initial.description || '')
      setPrice(initial.price != null ? String(initial.price) : '')
    }
  }, [initial])

  function handleSubmit(e) {
    e.preventDefault()
    const formData = new FormData()
    formData.append('name', name.trim())
    formData.append('description', description.trim())
    formData.append('price', price)
    if (file) formData.append('File', file) // key "file" khớp với BE

    onSubmit(formData)
  }

  return (
    <form className="grid gap-3" onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-base-mute">{t('name')}</label>
          <Input value={name} onChange={e=>setName(e.target.value)} required maxLength={100}/>
        </div>
        <div>
          <label className="text-sm text-base-mute">{t('price')}</label>
          <Input type="number" min="0.01" step="0.01" value={price} onChange={e=>setPrice(e.target.value)} required />
        </div>
      </div>
      <div>
        <label className="text-sm text-base-mute">{t('image')} </label>
        <input type="file" accept="image/*" onChange={e=>setFile(e.target.files[0])}/>
      </div>
      <div>
        <label className="text-sm text-base-mute">{t('description')}</label>
        <TextArea value={description} onChange={e=>setDescription(e.target.value)} required maxLength={500}/>
      </div>
      <button className="mt-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl px-4 py-2">{t('save')}</button>
    </form>
  )
}