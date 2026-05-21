import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import PostCard from '../components/PostCard'

export default function Prestador(){
  const { id } = useParams()
  const loc = useLocation()
  const navigate = useNavigate()
  const [provider, setProvider] = useState<any>((loc.state as any)?.provider || null)
  const [loading, setLoading] = useState(!provider)
  const [posts, setPosts] = useState<any[]>([])

  const fetchUserPosts = (userId: string) => {
    const doc = localStorage.getItem('documento')
    const url = doc ? `http://localhost:8080/api/posts/user/${encodeURIComponent(userId)}?currentUser=${doc}` : `http://localhost:8080/api/posts/user/${encodeURIComponent(userId)}`
    fetch(url)
      .then(r => r.json())
      .then(data => {
        setPosts(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Erro ao buscar posts:', err)
        setLoading(false)
      })
  }

  useEffect(() => {
    if (id) {
      setLoading(true)
      fetch(`http://localhost:8080/api/user/${encodeURIComponent(id)}`)
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data) {
              setProvider({
                id: data.documento,
                name: data.nome,
                description: data.descricao || '',
                service: data.servico || '',
                especialidade: data.especialidade || '',
                dataNasc: data.dataNasc,
                formacao: data.formacao,
                tempoArea: data.tempoArea,
                valorHora: data.valorHora,
                qualidade: data.qualidade,
                credibilidade: data.credibilidade,
                emailComercial: data.emailComercial,
                email: data.email,
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.nome)}&background=random&color=fff&size=256`,
                cover: 'https://images.unsplash.com/photo-1503264116251-35a269479413?q=80&w=1400&auto=format&fit=crop&ixlib=rb-4.0.3&s=1',
                rating: data.qualidade || 5
              })
          }
        })
        .catch(err => console.error('Erro ao buscar prestador:', err))

      fetchUserPosts(id)
    }
  }, [id])

  const handlePostDeleted = (postId: number) => {
    setPosts(posts.filter(p => p.id !== postId))
  }

  const calculateAge = (birthDate?: string) => {
    if (!birthDate) return null
    const birth = new Date(birthDate)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  const renderStars = (rating?: number) => {
    const r = rating || 0
    return (
      <span className="stars-container">
        {[1, 2, 3, 4, 5].map(s => (
          <span key={s} className={s <= Math.round(r) ? 'star filled' : 'star'}>★</span>
        ))}
        <span className="rating-num">({r.toFixed(1)})</span>
      </span>
    )
  }

  if(loading) return <div style={{padding:24, textAlign:'center'}}>Carregando perfil...</div>

  if(!provider) {
    return (
      <div style={{padding:24, textAlign:'center'}}>
        <p>Prestador não encontrado.</p>
        <button className="btn primary" onClick={()=>navigate('/main')}>Voltar para o Início</button>
      </div>
    )
  }

  return (
    <div className="main-page">
      <header className="main-header">
        <button className="back-btn-simple" onClick={() => navigate(-1)} style={{position:'absolute', left:12, top:12, background:'transparent', border:'none', cursor:'pointer', color:'var(--text)'}}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <div className="header-title" style={{textAlign:'center'}}>
          <h2>Perfil</h2>
        </div>
      </header>

      <div className="content" style={{padding:16}}>
        <div className="profile-view">
          <div className="profile-bg" style={{backgroundImage:`url(${provider.cover})`, backgroundSize:'cover', backgroundPosition:'center', height: 160}} aria-hidden="true"></div>

          <div className="profile-meta">
            <img className="profile-photo" src={provider.avatar} alt="Foto de perfil" />
            <div className="profile-info">
              <h3>{provider.name}</h3>
              <div className="profile-sub-info" style={{justifyContent:'center', marginTop: 4}}>
                <p className="muted">{provider.emailComercial || provider.email || ''}</p>
              </div>
              <div className="badge-group" style={{justifyContent:'center', marginTop: 8}}>
                {provider.service && <span className="service-badge">{provider.service}</span>}
                {provider.especialidade && <span className="specialty-badge">{provider.especialidade}</span>}
              </div>
              {provider.description && <p className="profile-desc" style={{marginTop: 12}}>{provider.description}</p>}

              <div className="profile-stats-card">
                <div className="stats-header">
                  <h4>Ficha Técnica</h4>
                </div>
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-label">📍 Localização</span>
                    <span className="stat-value muted">Não informada</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Idade</span>
                    <span className="stat-value">{calculateAge(provider.dataNasc) || '--'} anos</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Tempo na Área</span>
                    <span className="stat-value">{provider.tempoArea || '--'}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Valor/Hora</span>
                    <span className="stat-value">R$ {provider.valorHora?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Qualidade</span>
                    <span className="stat-value">{renderStars(provider.qualidade)}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Credibilidade</span>
                    <span className="stat-value">
                      <span className={`cred-badge ${provider.credibilidade?.toLowerCase() || 'pendente'}`}>
                        {provider.credibilidade || 'Pendente'}
                      </span>
                    </span>
                  </div>
                  <div className="stat-item wide">
                    <span className="stat-label">Formação Técnica</span>
                    <span className="stat-value">{provider.formacao || '--'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="profile-posts-section">
            <h4>Publicações</h4>
            <div className="profile-posts-grid">
              {posts.length > 0 ? (
                posts.map(p => {
                  const currentUserDoc = localStorage.getItem('documento')
                  const isOwner = currentUserDoc === p.userDocumento

                  if (isOwner) {
                    return (
                      <div key={p.id} style={{ gridColumn: '1 / -1' }}>
                        <PostCard post={p} onPostDeleted={handlePostDeleted} />
                      </div>
                    )
                  }

                  return (
                    <div
                      key={p.id}
                      className="profile-post-thumb"
                      role="button"
                      tabIndex={0}
                      onClick={() => navigate(`/posts/${p.id}`)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          navigate(`/posts/${p.id}`)
                        }
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      {p.mediaType === 'image' ? (
                        <img src={p.mediaContent} alt="Post" />
                      ) : (
                        <div className="video-thumb">
                          <video src={p.mediaContent} />
                          <div className="video-icon">▶</div>
                        </div>
                      )}
                    </div>
                  )
                })
              ) : (
                <p className="empty-msg">Este usuário ainda não tem publicações.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
