'use client'
import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Upload, Trash2, Star } from 'lucide-react'

interface Photo {
  id: string
  url: string
  storage_path: string | null
  is_cover: boolean
  sort_order: number
}

export default function PhotoManager({
  listingId,
  initialPhotos,
}: {
  listingId: string
  initialPhotos: Photo[]
}) {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploading(true)
    setError('')

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) { setError('Max. 5 MB pro Bild.'); continue }
      const ext = file.name.split('.').pop()
      const path = `${listingId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { error: upErr } = await supabase.storage
        .from('listing-photos')
        .upload(path, file, { upsert: false })

      if (upErr) { setError(upErr.message); continue }

      const { data: { publicUrl } } = supabase.storage
        .from('listing-photos')
        .getPublicUrl(path)

      const { data: inserted } = await supabase
        .from('listing_images')
        .insert({
          listing_id: listingId,
          url: publicUrl,
          storage_path: path,
          is_cover: photos.length === 0,
          sort_order: photos.length,
        })
        .select()
        .single()

      if (inserted) setPhotos(p => [...p, inserted as Photo])
    }

    setUploading(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  async function handleDelete(photo: Photo) {
    if (photo.storage_path) {
      await supabase.storage.from('listing-photos').remove([photo.storage_path])
    }
    await supabase.from('listing_images').delete().eq('id', photo.id)
    const remaining = photos.filter(p => p.id !== photo.id)
    if (photo.is_cover && remaining.length > 0) {
      await supabase.from('listing_images').update({ is_cover: true }).eq('id', remaining[0].id)
      remaining[0].is_cover = true
    }
    setPhotos(remaining)
  }

  async function handleSetCover(photo: Photo) {
    await supabase.from('listing_images').update({ is_cover: false }).eq('listing_id', listingId)
    await supabase.from('listing_images').update({ is_cover: true }).eq('id', photo.id)
    setPhotos(p => p.map(ph => ({ ...ph, is_cover: ph.id === photo.id })))
  }

  return (
    <div>
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm text-red-400 mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
        {photos.map(photo => (
          <div key={photo.id}
            className="relative group aspect-video rounded-xl overflow-hidden bg-white/[0.04] border border-white/[0.06]">
            <img src={photo.url} alt="" className="w-full h-full object-cover" />
            {photo.is_cover && (
              <div className="absolute top-2 left-2 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                Cover
              </div>
            )}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              {!photo.is_cover && (
                <button onClick={() => handleSetCover(photo)}
                  className="p-2 bg-indigo-600 rounded-lg text-white hover:bg-indigo-700 transition-colors"
                  title="Als Cover setzen">
                  <Star size={14} />
                </button>
              )}
              <button onClick={() => handleDelete(photo)}
                className="p-2 bg-red-600 rounded-lg text-white hover:bg-red-700 transition-colors"
                title="Löschen">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}

        <button onClick={() => inputRef.current?.click()} disabled={uploading}
          className="aspect-video rounded-xl border-2 border-dashed border-white/[0.12] hover:border-indigo-500/50 flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-indigo-400 transition-colors disabled:opacity-50">
          <Upload size={20} />
          <span className="text-xs font-semibold">
            {uploading ? 'Lädt hoch…' : 'Foto hinzufügen'}
          </span>
        </button>
      </div>

      <input ref={inputRef} type="file" accept="image/*" multiple onChange={handleUpload} className="hidden" />
      <p className="text-xs text-gray-600">JPEG, PNG oder WebP · Max. 5 MB · Hover: Cover setzen oder löschen</p>
    </div>
  )
}
