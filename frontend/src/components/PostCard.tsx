import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ReactDOM from 'react-dom'

type Post = {
  id: number
  userDocumento: string
  userName?: string
  likesCount?: number
  isLikedByUser?: boolean
  likedByUser?: boolean
  mediaContent: string
  mediaType: 'image' | 'video'
  descricao: string
  createdAt: string
}

export default function PostCard({ post, onPostDeleted }: { post: Post, onPostDeleted?: (postId: number) => void }) {
  const navigate = useNavigate()
  const initialLiked = post.isLikedByUser ?? post.likedByUser ?? false
  const [liked, setLiked] = useState(initialLiked)
  const [likes, setLikes] = useState(post.likesCount || 0)
  
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState('')
  const [showOptionsMenu, setShowOptionsMenu] = useState(false)
  const [showReportToast, setShowReportToast] = useState(false)
  const [toastExiting, setToastExiting] = useState(false)

  const currentUser = localStorage.getItem('documento')
  const isOwner = currentUser === post.userDocumento

  const handleLike = () => {
    const doc = localStorage.getItem('documento')
    if (!doc) return // Não permite curtir se não estiver logado

    const endpoint = liked ? 'unlike' : 'like'
    fetch(`http://localhost:8080/api/posts/${post.id}/${endpoint}`, { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userDocumento: doc })
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setLikes(data.likes)
          setLiked(data.isLiked ?? !liked)
        }
      })
  }

  const fetchComments = () => {
    fetch(`http://localhost:8080/api/posts/${post.id}/comments`)
      .then(r => r.json())
      .then(data => setComments(data))
      .catch(err => console.error('Erro ao buscar comentários:', err))
  }

  useEffect(() => {
    setLiked(post.isLikedByUser ?? post.likedByUser ?? false)
    setLikes(post.likesCount || 0)
  }, [post.isLikedByUser, post.likedByUser, post.likesCount])

  useEffect(() => {
    if (showComments) fetchComments()
  }, [showComments])

  useEffect(() => {
    if (!showReportToast) {
      setToastExiting(false)
      return
    }
    const exitTimer = setTimeout(() => setToastExiting(true), 2000)
    const hideTimer = setTimeout(() => setShowReportToast(false), 2500)
    return () => {
      clearTimeout(exitTimer)
      clearTimeout(hideTimer)
    }
  }, [showReportToast])

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault()
    const documento = localStorage.getItem('documento')
    if (!documento || !newComment.trim()) return

    fetch(`http://localhost:8080/api/posts/${post.id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userDocumento: documento, content: newComment })
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setNewComment('')
          fetchComments()
        }
      })
  }

  const handleDeletePost = () => {
    if (!window.confirm('Tem certeza que deseja deletar este post? Esta ação não pode ser desfeita.')) {
      return
    }

    fetch(`http://localhost:8080/api/posts/${post.id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userDocumento: currentUser })
    })
      .then(r => {
        if (r.ok) {
          setShowOptionsMenu(false)
          if (onPostDeleted) {
            onPostDeleted(post.id)
          }
        } else if (r.status === 403) {
          alert('Você não tem permissão para deletar este post')
        } else if (r.status === 404) {
          alert('Post não encontrado')
        } else {
          alert('Erro ao deletar post')
        }
      })
      .catch(err => {
        console.error('Erro ao deletar post:', err)
        alert('Erro ao deletar post')
      })
  }

  const handleProfileClick = () => {
    navigate(`/prestador/${post.userDocumento}`, { 
      state: { 
        provider: { 
          id: post.userDocumento, 
          name: post.userName || `Usuário ${post.userDocumento}`,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(post.userName || post.userDocumento)}&background=random&color=fff&size=256`,
          cover: 'https://images.unsplash.com/photo-1503264116251-35a269479413?q=80&w=1400&auto=format&fit=crop&ixlib=rb-4.0.3&s=1',
          rating: 5,
          service: '',
          description: ''
        } 
      } 
    })
  }

  const formatTimeAgo = (dateStr: string) => {
    const now = new Date()
    const past = new Date(dateStr)
    const diffInMs = now.getTime() - past.getTime()
    const diffInMins = Math.floor(diffInMs / (1000 * 60))
    const diffInHours = Math.floor(diffInMins / 60)
    const diffInDays = Math.floor(diffInHours / 24)

    if (diffInMins < 1) return 'agora mesmo'
    if (diffInMins < 60) return `há ${diffInMins} minutos`
    if (diffInHours < 24) return `há ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`
    return `há ${diffInDays} ${diffInDays === 1 ? 'dia' : 'dias'}`
  }

  return (
    <div className="post-card-premium">
      <div className="post-header">
        <div className="post-user-meta">
          <img 
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(post.userName || post.userDocumento)}&background=random&color=fff&size=256`} 
            alt="User" 
            className="post-user-avatar"
            style={{ cursor: 'pointer' }}
            onClick={handleProfileClick}
          />
          <div className="post-user-info">
            <span 
              className="post-user-name" 
              style={{ cursor: 'pointer' }}
              onClick={handleProfileClick}
            >
              {post.userName || post.userDocumento}
            </span>
          </div>
        </div>
        <div className="post-action-wrapper" style={{ position: 'relative' }}>
          <button className="post-action-btn" onClick={() => setShowOptionsMenu(!showOptionsMenu)} aria-haspopup={true} aria-expanded={showOptionsMenu}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
          </button>
          {showOptionsMenu && (
            <div className="post-options-menu">
              <button className="post-option-btn option-interest" onClick={() => { setShowOptionsMenu(false); alert('Registrado: tenho interesse') }}>Tenho interesse</button>
              <button className="post-option-btn option-not-interest" onClick={() => { setShowOptionsMenu(false); alert('Registrado: não tenho interesse') }}>Não tenho interesse</button>
              <button className="post-option-btn option-report" onClick={() => { setShowOptionsMenu(false); setShowReportToast(true); }}>Denunciar</button>
              {isOwner && (
                <button className="post-option-btn option-delete" onClick={() => handleDeletePost()} style={{color: '#ef4444'}}>🗑️ Deletar post</button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="post-content">
        {post.mediaType === 'image' ? (
          <img src={post.mediaContent} alt="Post" className="post-media" onDoubleClick={handleLike} />
        ) : (
          <video src={post.mediaContent} className="post-media" controls />
        )}
      </div>

      <div className="post-actions">
        <button className="post-action-btn" onClick={handleLike}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill={liked ? "#ef4444" : "none"} stroke={liked ? "#ef4444" : "currentColor"} strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.84-8.84 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
        <button className="post-action-btn" onClick={() => setShowComments(!showComments)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        </button>
        <button className="post-action-btn">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 2l4 4-4 4" /><path d="M3 11v-1a4 4 0 0 1 4-4h14" /><path d="M7 22l-4-4 4-4" /><path d="M21 13v1a4 4 0 0 1-4 4H3" />
          </svg>
        </button>
        <button className="post-action-btn" onClick={() => {
          const shareData = {
            title: 'Confira este post no LGI',
            text: post.descricao,
            url: window.location.origin + '/post/' + post.id
          }
          if (navigator.share) {
            navigator.share(shareData).catch(err => console.log('Erro ao compartilhar', err))
          } else {
            navigator.clipboard.writeText(shareData.url)
            alert('Link copiado para a área de transferência!')
          }
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>

      <div className="post-likes-info">
        <span><b>{likes} curtidas</b></span>
      </div>

      <div className="post-caption-wrapper">
        <span className="post-caption-user" onClick={handleProfileClick}>{post.userName || post.userDocumento}</span>
        <span className="post-caption-text">{post.descricao}</span>
      </div>

      <div className="post-time-ago">
        publicada {formatTimeAgo(post.createdAt)}
      </div>

      {showReportToast && ReactDOM.createPortal(
        <div className="toast-container" aria-live="polite">
          <div className={`report-toast ${toastExiting ? 'toast-exit' : ''}`}>Denunciado</div>
        </div>,
        document.body
      )}

      {showComments && (
        <div className="post-comments-section">
          {comments.map(c => (
            <div key={c.id} className="comment-item">
              <span className="comment-user">{c.userName || c.userDocumento}</span>
              <span className="comment-text">{c.content}</span>
            </div>
          ))}
          
          <form className="comment-input-wrapper" onSubmit={handleAddComment}>
            <input 
              className="comment-input" 
              placeholder="Adicione um comentário..." 
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
            />
            <button className="comment-submit-btn" type="submit" disabled={!newComment.trim()}>
              Publicar
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
