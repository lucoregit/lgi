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

export default function PostCard({ post, onPostDeleted, isProfilePost = false, canDelete = false, onOpenPost }: { post: Post, onPostDeleted?: (postId: number) => void, isProfilePost?: boolean, canDelete?: boolean, onOpenPost?: () => void }) {
  const navigate = useNavigate()
  const initialLiked = post.isLikedByUser ?? post.likedByUser ?? false
  const [liked, setLiked] = useState(initialLiked)
  const [likes, setLikes] = useState(post.likesCount || 0)
  
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState('')
  const [showOptionsMenu, setShowOptionsMenu] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportReasons, setReportReasons] = useState<string[]>([])
  const [reportComment, setReportComment] = useState('')
  const [reportSubmitted, setReportSubmitted] = useState(false)
  const [isReporting, setIsReporting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const currentUser = localStorage.getItem('documento')
  const isOwner = currentUser === post.userDocumento
  const showDeleteOption = canDelete && isOwner

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const optionsButton = target.closest('.post-action-wrapper')
      if (!optionsButton && showOptionsMenu) {
        setShowOptionsMenu(false)
      }
    }

    if (showOptionsMenu) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [showOptionsMenu])

  const handleLike = () => {
    const doc = localStorage.getItem('documento')
    if (!doc) return // Não permite curtir se não estiver logado

    const endpoint = liked ? 'unlike' : 'like'
    fetch(`/api/posts/${post.id}/${endpoint}`, { 
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
    fetch(`/api/posts/${post.id}/comments`)
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

  const REPORT_REASONS = [
    'Conteúdo inapropriado ou ofensivo',
    'Spam ou publicidade enganosa',
    'Informações falsas ou enganosas',
    'Assédio ou comportamento abusivo',
    'Violação de direitos autorais',
  ]

  const toggleReason = (reason: string) => {
    setReportReasons(prev =>
      prev.includes(reason) ? prev.filter(r => r !== reason) : [...prev, reason]
    )
  }

  const handleSubmitReport = () => {
    if (reportReasons.length === 0) return
    setIsReporting(true)
    // Simulação de envio — substituir por fetch real quando o endpoint existir
    setTimeout(() => {
      setIsReporting(false)
      setReportSubmitted(true)
      setTimeout(() => {
        setShowReportModal(false)
        setReportReasons([])
        setReportComment('')
        setReportSubmitted(false)
      }, 1800)
    }, 800)
  }

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault()
    const documento = localStorage.getItem('documento')
    if (!documento || !newComment.trim()) return

    fetch(`/api/posts/${post.id}/comments`, {
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
    setShowDeleteModal(true)
    setShowOptionsMenu(false)
  }

  const confirmDeletePost = () => {
    if (!currentUser) return

    setIsDeleting(true)
    fetch(`/api/posts/${post.id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userDocumento: currentUser })
    })
      .then(r => {
        if (r.ok) {
          setShowDeleteModal(false)
          if (onPostDeleted) {
            onPostDeleted(post.id)
          }
        } else if (r.status === 403) {
          alert('Você não tem permissão para deletar este post')
          setShowDeleteModal(false)
        } else if (r.status === 404) {
          alert('Post não encontrado')
          setShowDeleteModal(false)
        } else {
          alert('Erro ao deletar post')
          setShowDeleteModal(false)
        }
      })
      .catch(err => {
        console.error('Erro ao deletar post:', err)
        alert('Erro ao deletar post')
        setShowDeleteModal(false)
      })
      .finally(() => setIsDeleting(false))
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
    <div className={`post-card-premium${onOpenPost ? ' clickable-card' : ''}`} onClick={onOpenPost ? () => onOpenPost() : undefined}>
      <div className="post-header">
        <div className="post-user-meta">
          <img 
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(post.userName || post.userDocumento)}&background=random&color=fff&size=256`} 
            alt="User" 
            className="post-user-avatar"
            style={{ cursor: 'pointer' }}
            onClick={e => { e.stopPropagation(); handleProfileClick() }}
          />
          <div className="post-user-info">
            <span 
              className="post-user-name" 
              style={{ cursor: 'pointer' }}
              onClick={e => { e.stopPropagation(); handleProfileClick() }}
            >
              {post.userName || post.userDocumento}
            </span>
          </div>
        </div>
        <div className="post-action-wrapper" style={{ position: 'relative' }}>
          <button className="post-action-btn" onClick={e => { e.stopPropagation(); setShowOptionsMenu(!showOptionsMenu) }} aria-haspopup={true} aria-expanded={showOptionsMenu}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
          </button>
          {showOptionsMenu && (
            <div className="post-options-menu">
              {showDeleteOption ? (
                <button className="post-option-btn option-delete" onClick={e => { e.stopPropagation(); handleDeletePost() }} style={{color: '#ef4444'}}>🗑️ Deletar post</button>
              ) : (
                <>
                  <button className="post-option-btn option-interest" onClick={e => { e.stopPropagation(); setShowOptionsMenu(false); alert('Registrado: tenho interesse') }}>Tenho interesse</button>
                  <button className="post-option-btn option-not-interest" onClick={e => { e.stopPropagation(); setShowOptionsMenu(false); alert('Registrado: não tenho interesse') }}>Não tenho interesse</button>
                  <button className="post-option-btn option-report" onClick={e => { e.stopPropagation(); setShowOptionsMenu(false); setShowReportModal(true); }}>Denunciar</button>
                </>
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
        <button className="post-action-btn" onClick={e => { e.stopPropagation(); handleLike() }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill={liked ? "#ef4444" : "none"} stroke={liked ? "#ef4444" : "currentColor"} strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.84-8.84 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
        <button className="post-action-btn" onClick={e => { e.stopPropagation(); setShowComments(!showComments) }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        </button>
        <button className="post-action-btn">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 2l4 4-4 4" /><path d="M3 11v-1a4 4 0 0 1 4-4h14" /><path d="M7 22l-4-4 4-4" /><path d="M21 13v1a4 4 0 0 1-4 4H3" />
          </svg>
        </button>
        <button className="post-action-btn" onClick={e => { e.stopPropagation(); const shareData = {
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

      {showReportModal && ReactDOM.createPortal(
        <div className="modal-overlay" onClick={() => !isReporting && !reportSubmitted && setShowReportModal(false)}>
          <div className="report-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="report-modal-title">
            {reportSubmitted ? (
              <div className="report-success">
                <div className="report-success-icon">✓</div>
                <p>Denúncia enviada com sucesso!</p>
                <span>Agradecemos por ajudar a manter a comunidade segura.</span>
              </div>
            ) : (
              <>
                <div className="report-modal-header">
                  <div className="report-modal-title-group">
                    <span className="report-modal-icon">⚑</span>
                    <h3 id="report-modal-title">Denunciar publicação</h3>
                  </div>
                  <button className="modal-close-btn" onClick={() => setShowReportModal(false)} aria-label="Fechar">✕</button>
                </div>
                <div className="report-modal-body">
                  <p className="report-modal-subtitle">Selecione os motivos da denúncia (pode escolher mais de um):</p>
                  <div className="report-reasons-list">
                    {REPORT_REASONS.map(reason => (
                      <label key={reason} className={`report-reason-item${reportReasons.includes(reason) ? ' selected' : ''}`}>
                        <input
                          type="checkbox"
                          className="report-reason-checkbox"
                          checked={reportReasons.includes(reason)}
                          onChange={() => toggleReason(reason)}
                        />
                        <span className="report-reason-checkmark">{reportReasons.includes(reason) ? '✓' : ''}</span>
                        <span className="report-reason-label">{reason}</span>
                      </label>
                    ))}
                  </div>
                  <div className="report-comment-section">
                    <label className="report-comment-label" htmlFor={`report-comment-${post.id}`}>Descrição adicional (opcional)</label>
                    <textarea
                      id={`report-comment-${post.id}`}
                      className="report-comment-textarea"
                      placeholder="Descreva com mais detalhes o motivo da denúncia..."
                      value={reportComment}
                      onChange={e => setReportComment(e.target.value)}
                      rows={3}
                      maxLength={500}
                    />
                    <span className="report-comment-counter">{reportComment.length}/500</span>
                  </div>
                </div>
                <div className="report-modal-footer">
                  <button className="report-modal-btn cancel" onClick={() => setShowReportModal(false)} disabled={isReporting}>Cancelar</button>
                  <button
                    className="report-modal-btn submit"
                    onClick={handleSubmitReport}
                    disabled={reportReasons.length === 0 || isReporting}
                  >
                    {isReporting ? 'Enviando...' : 'Enviar denúncia'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>,
        document.body
      )}

      {showDeleteModal && ReactDOM.createPortal(
        <div className="modal-overlay" onClick={() => !isDeleting && setShowDeleteModal(false)}>
          <div className="delete-modal" onClick={e => e.stopPropagation()}>
            <div className="delete-modal-header">
              <h3>Deletar publicação</h3>
              <button className="modal-close-btn" onClick={() => setShowDeleteModal(false)} disabled={isDeleting} aria-label="Fechar">✕</button>
            </div>
            <div className="delete-modal-body">
              <p>Tem certeza que deseja deletar esta publicação? Esta ação não pode ser desfeita.</p>
            </div>
            <div className="delete-modal-footer">
              <button className="delete-modal-btn cancel" onClick={() => setShowDeleteModal(false)} disabled={isDeleting}>
                Cancelar
              </button>
              <button className="delete-modal-btn confirm" onClick={confirmDeletePost} disabled={isDeleting}>
                {isDeleting ? 'Deletando...' : 'Deletar'}
              </button>
            </div>
          </div>
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
          
          <form className="comment-input-wrapper" onSubmit={e => { e.stopPropagation(); handleAddComment(e) }}>
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


