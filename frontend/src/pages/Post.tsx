import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import PostCard from '../components/PostCard'

export default function PostPage(){
  const { id } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError('')
    const doc = localStorage.getItem('documento')
    const suffix = doc ? `?currentUser=${encodeURIComponent(doc)}` : ''
    const fetchPost = async () => {
      const url = `/api/posts/${encodeURIComponent(id)}${suffix}`
      console.debug('Fetching post URL:', url)
      try {
        const r = await fetch(url)
        if (!r.ok) {
          const text = await r.text().catch(() => '')
          console.warn('Post fetch failed', r.status, text)
          if (r.status === 404) {
            // fallback: try fetching all posts and find locally
            console.debug('Attempting fallback: fetch all posts')
            const allResp = await fetch('/api/posts')
            if (allResp.ok) {
              const list = await allResp.json()
              const found = list.find((p: any) => String(p.id) === String(id))
              if (found) {
                setPost(found)
                return
              }
            }
          }
          throw new Error(text || `HTTP ${r.status}`)
        }
        const data = await r.json()
        setPost(data)
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar post')
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [id])

  if (loading) return <div style={{padding:24, textAlign:'center'}}>Carregando publicação...</div>
  if (error) return (
    <div style={{padding:24, textAlign:'center'}}>
      <p>{error}</p>
      <button className="btn primary" onClick={() => navigate('/main')}>Voltar ao feed</button>
    </div>
  )
  if (!post) return (
    <div style={{padding:24, textAlign:'center'}}>
      <p>Publicação não encontrada.</p>
      <button className="btn primary" onClick={() => navigate('/main')}>Voltar ao feed</button>
    </div>
  )

  return (
    <div className="main-page">
      <header className="main-header prestador-header">
        <button className="back-btn-simple prestador-back-btn" onClick={() => navigate(-1)} aria-label="Voltar">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <div className="header-title prestador-header-title"><h2>Post</h2></div>
        <div className="prestador-header-spacer" aria-hidden="true" />
      </header>

      <div className="content" style={{padding:16}}>
        <PostCard post={post} onPostDeleted={() => navigate('/main')} />
      </div>
    </div>
  )
}


