import { useCallback, useRef, useState } from 'react'
import { AlertCircle, ImagePlus, X } from 'lucide-react'

const ACCEPTED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const MAX_SIZE = 2 * 1024 * 1024

export default function FileDropzone({
  initialPreview = null,
  onFile,
  className = '',
}) {
  const inputRef = useRef(null)
  const [preview, setPreview] = useState(initialPreview)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState(null)
  const isBlobPreview = preview?.startsWith('blob:') ?? false

  const handleFiles = useCallback((files) => {
    const f = files?.[0]
    if (!f) return

    if (!ACCEPTED_TYPES.has(f.type)) {
      setError('Format tidak didukung. Gunakan JPEG, PNG, atau WEBP.')
      return
    }
    if (f.size > MAX_SIZE) {
      setError(`Ukuran gambar ${(f.size / 1024 / 1024).toFixed(1)} MB, maksimal 2 MB.`)
      return
    }

    setError(null)
    setPreview((prev) => {
      if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev)
      return URL.createObjectURL(f)
    })
    onFile?.(f)
  }, [onFile])

  const clear = () => {
    setPreview((prev) => {
      if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev)
      return null
    })
    onFile?.(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className={className}>
      <div
        role="button"
        tabIndex={0}
        aria-label="Unggah gambar sampul"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          handleFiles(e.dataTransfer.files)
        }}
        className={`relative flex min-h-48 cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border-2 border-dashed p-6 text-center transition ${
          error
            ? 'border-red-400 bg-red-50/60'
            : dragging
              ? 'border-ink-900 bg-cream-50'
              : 'border-ink-900/15 bg-white hover:border-ink-900/30 hover:bg-cream-50'
        }`}
      >
        {preview ? (
          <>
            <img src={preview} alt="Pratinjau gambar sampul" className="absolute inset-0 size-full object-cover" />
            <span className="absolute inset-0 bg-ink-900/30 transition hover:bg-ink-900/20" />
            <span className="relative z-10 inline-flex items-center gap-2 rounded-lg bg-ink-900/70 px-4 py-2 text-sm font-semibold text-white backdrop-blur">
              <ImagePlus className="size-4" /> {isBlobPreview ? 'Ganti gambar' : 'Klik untuk mengganti'}
            </span>
          </>
        ) : (
          <>
            <span className="grid size-12 place-items-center rounded-2xl bg-ink-100 text-ink-700">
              <ImagePlus className="size-6" />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink-900">Tarik &amp; letakkan foto di sini</p>
              <p className="mt-1 text-xs text-ink-500">
                atau klik untuk memilih file ? JPEG, PNG, WEBP ? maks 2 MB ? disarankan lanskap
                ?1200?800 px (16:9)
              </p>
            </div>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {error && (
        <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-600">
          <AlertCircle className="size-3.5 shrink-0" /> {error}
        </p>
      )}

      {isBlobPreview && (
        <button type="button" onClick={clear} className="btn btn-ghost mt-2 px-3 py-1.5 text-xs">
          <X className="size-3.5" /> Hapus gambar
        </button>
      )}
    </div>
  )
}
