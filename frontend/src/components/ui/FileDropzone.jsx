import { useCallback, useRef, useState } from 'react'
import { ImagePlus, X } from 'lucide-react'

export default function FileDropzone({
  initialPreview = null,
  onFile,
  accept = 'image/*',
  className = '',
}) {
  const inputRef = useRef(null)
  const [preview, setPreview] = useState(initialPreview)
  const [dragging, setDragging] = useState(false)
  const isBlobPreview = preview?.startsWith('blob:') ?? false

  const handleFiles = useCallback((files) => {
    const f = files?.[0]
    if (!f) return
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
          dragging
            ? 'border-brand-500 bg-brand-50'
            : 'border-ink-900/15 bg-white hover:border-brand-300 hover:bg-brand-50/40'
        }`}
      >
        {preview ? (
          <>
            <img src={preview} alt="Pratinjau gambar sampul" className="absolute inset-0 size-full object-cover" />
            <span className="absolute inset-0 bg-ink-900/30 transition hover:bg-ink-900/20" />
            <span className="relative z-10 inline-flex items-center gap-2 rounded-full bg-ink-900/70 px-4 py-2 text-sm font-semibold text-white backdrop-blur">
              <ImagePlus className="size-4" /> {isBlobPreview ? 'Ganti gambar' : 'Klik untuk mengganti'}
            </span>
          </>
        ) : (
          <>
            <span className="grid size-12 place-items-center rounded-2xl bg-brand-100 text-brand-600">
              <ImagePlus className="size-6" />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink-900">Tarik &amp; letakkan foto di sini</p>
              <p className="mt-1 text-xs text-ink-500">atau klik untuk memilih file · JPEG, PNG, WEBP · maks 2 MB</p>
            </div>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {isBlobPreview && (
        <button type="button" onClick={clear} className="btn btn-ghost mt-2 px-3 py-1.5 text-xs">
          <X className="size-3.5" /> Hapus gambar
        </button>
      )}
    </div>
  )
}