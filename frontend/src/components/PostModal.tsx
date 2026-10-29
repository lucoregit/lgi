import React, { useState, useRef } from 'react'

type Props = {
  open: boolean
  onClose: () => void
  userDocumento: string
  onPostCreated: () => void
}

export default function PostModal({ open, onClose, userDocumento, onPostCreated }: Props) {
  const [mediaContent, setMediaContent] = useState<string | null>(null)
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null)
  const [descricao, setDescricao] = useState('')
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!open) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const type = file.type.startsWith('video') ? 'video' : 'image'
    
    if (type === 'video') {
      const video = document.createElement('video')
      video.preload = 'metadata'
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src)
        if (video.duration > 215) {
          alert('Vídeos devem ter no máximo 215 segundos.')
          if (fileInputRef.current) fileInputRef.current.value = ''
          return
        }
        processFile(file, type)
      }
      video.src = URL.createObjectURL(file)
    } else {
      processFile(file, type)
    }
  }

  const processFile = (file: File, type: 'image' | 'video') => {
    const reader = new FileReader()
    reader.onload = () => {
      setMediaContent(reader.result as string)
      setMediaType(type)
    }
    reader.readAsDataURL(file)
  }

  const handlePost = async () => {
    if (!mediaContent || !mediaType) {
      alert('Selecione uma imagem ou vídeo.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userDocumento,
          mediaContent,
          mediaType,
          descricao
        })
      })

      if (!res.ok) throw new Error('Erro ao postar')

      onPostCreated()
      onClose()
      setMediaContent(null)
      setMediaType(null)
      setDescricao('')
    } catch (err) {
      console.error(err)
      alert('Erro ao criar postagem.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-container">
        <div className="modal-header-premium">
          <h3>Nova Postagem</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          <div className="post-upload-area" onClick={() => fileInputRef.current?.click()}>
            {mediaContent ? (
              mediaType === 'image' ? (
                <img src={mediaContent} alt="Preview" className="post-preview-media" />
              ) : (
                <video src={mediaContent} className="post-preview-media" controls />
              )
            ) : (
              <div className="upload-placeholder">
                <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p>Clique para selecionar foto ou vídeo</p>
                <small>(Vídeos até 215 segundos)</small>
              </div>
            )}
          </div>

          <input 
            ref={fileInputRef} 
            type="file" 
            hidden 
            accept="image/*,video/*" 
            onChange={handleFileChange} 
          />

          <div className="edit-form" style={{ padding: '0 24px 24px' }}>
            <div className="input-group">
              <label>Descrição</label>
              <textarea 
                value={descricao} 
                onChange={e => setDescricao(e.target.value)} 
                placeholder="Escreva uma legenda..."
                rows={3}
              />
            </div>
          </div>
        </div>

        <div className="modal-footer-premium">
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button 
            className="btn-primary-premium" 
            disabled={loading || !mediaContent} 
            onClick={handlePost}
          >
            {loading ? 'Postando...' : 'Publicar'}
          </button>
        </div>
      </div>
    </div>
  )
}


