import React, { useState, useEffect } from 'react'
import BottomNav from '../components/BottomNav'
import ProfileEditModal from '../components/ProfileEditModal'
import PostModal from '../components/PostModal'
import PostCard from '../components/PostCard'
import CardPrestador from '../components/CardPrestador'
import UserSettingsModal from '../components/UserSettingsModal'
import FinanceiraTab from '../components/FinanceiraTab'

export default function Main(){
  const [tab, setTab] = useState<'home'|'finance'|'profile'|'inicio'>('inicio')
  const [search, setSearch] = useState('')
  const [user, setUser] = useState<{documento?:string,nome?:string,email?:string,descricao?:string,servico?:string,especialidade?:string,dataNasc?:string,formacao?:string,tempoArea?:string,valorHora?:number,qualidade?:number,credibilidade?:string,emailComercial?:string,cidade?:string}|null>(null)
  const [editing, setEditing] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [posting, setPosting] = useState(false)
  const [posts, setPosts] = useState<any[]>([])
  const [userPosts, setUserPosts] = useState<any[]>([])
  const [prestadores, setPrestadores] = useState<Array<any>>([])
  const [selectedCategory, setSelectedCategory] = useState('Todos')

  const fetchPosts = () => {
    const doc = localStorage.getItem('documento')
    const url = doc ? `http://localhost:8080/api/posts?currentUser=${encodeURIComponent(doc)}` : 'http://localhost:8080/api/posts'
    fetch(url)
      .then(r => r.json())
      .then(data => setPosts(data))
      .catch(err => console.error('Erro ao carregar posts:', err))
  }

  const fetchUserPosts = () => {
    const documento = localStorage.getItem('documento')
    if (!documento) return
    fetch(`http://localhost:8080/api/posts/user/${encodeURIComponent(documento)}?currentUser=${encodeURIComponent(documento)}`)
      .then(r => r.json())
      .then(data => setUserPosts(data))
      .catch(err => console.error('Erro ao buscar posts do usuário:', err))
  }

  const refreshAll = () => {
    fetchPosts()
    fetchUserPosts()
  }

  useEffect(() => {
    if (tab === 'inicio') fetchPosts()
  }, [tab])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: conectar com busca real — por enquanto apenas log
    console.log('Pesquisar:', search)
  }

  useEffect(()=>{
    // quando abrir aba profile, buscar usuário salvo
    if(tab !== 'profile') return
    const documento = localStorage.getItem('documento')
    if(!documento) return
    console.log('Buscando usuário (on profile open):', documento)
    fetch(`http://localhost:8080/api/user/${encodeURIComponent(documento)}`)
      .then(r=> r.ok ? r.json() : null)
      .then(d=> { 
        console.log('Dados do usuário carregados (profile):', d)
        // TODO: Remover quando backend retornar 'cidade'
        // if (d && !d.cidade) { d.cidade = 'São Paulo' }
        setUser(d) 
      })
      .catch(err=> { console.error('Erro ao buscar usuário (profile):', err); setUser(null) })

    fetch(`http://localhost:8080/api/posts/user/${encodeURIComponent(documento)}`)
      .then(r => r.json())
      .then(data => setUserPosts(data))
      .catch(err => console.error('Erro ao buscar posts do usuário:', err))
  },[tab])

  // prefetch do usuário no mount caso já esteja logado
  useEffect(()=>{
    const documento = localStorage.getItem('documento')
    if(!documento) return
    console.log('Prefetch usuário no mount:', documento)
    fetch(`http://localhost:8080/api/user/${encodeURIComponent(documento)}`)
      .then(r=>{
        console.log('prefetch response status:', r.status)
        if(!r.ok) throw new Error('Não encontrado');
        return r.json()
      })
      .then(d=> { 
        console.log('Usuário obtido (prefetch):', d); 
        console.log('Nome do usuário (prefetch):', d.nome)
        // TODO: Remover quando backend retornar 'cidade'
        // if (d && !d.cidade) { d.cidade = 'São Paulo' }
        setUser(d) 
      })
      .catch(err=> { console.debug('Sem usuário no prefetch:', err) })
  },[])

  useEffect(()=>{
    // buscar provedores do backend quando abrir a aba Procurar (home)
    if(tab !== 'home') return
    fetch('http://localhost:8080/api/providers')
      .then(r=>{ if(!r.ok) throw new Error('Erro ao buscar providers'); return r.json() })
      .then((data:any[])=>{
        // anexa imagens placeholder aos registros
        const covers = [
          'https://images.unsplash.com/photo-1503264116251-35a269479413?q=80&w=1400&auto=format&fit=crop&ixlib=rb-4.0.3&s=1',
          'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=1400&auto=format&fit=crop&ixlib=rb-4.0.3&s=2',
          'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1400&auto=format&fit=crop&ixlib=rb-4.0.3&s=3'
        ]
        const avatars = [
          'https://i.pravatar.cc/150?img=32',
          'https://i.pravatar.cc/150?img=12',
          'https://i.pravatar.cc/150?img=10'
        ]
        const mapped = data.map((p, i)=> ({
          id: p.documento,
          name: p.nome,
          description: p.descricao || '',
          service: p.servico || '',
          cover: covers[i % covers.length],
          avatar: avatars[i % avatars.length],
          rating: 4
        }))
        setPrestadores(mapped)
      })
      .catch(err=>{ console.error('Erro ao carregar prestadores:', err); setPrestadores([]) })
  },[tab])

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

  const filteredPrestadores = prestadores.filter(p => {
    const matchesCategory = selectedCategory === 'Todos' || (p.service && p.service.toLowerCase() === selectedCategory.toLowerCase())
    const term = search.toLowerCase().trim()
    const matchesSearch = !term || (
      (p.name && p.name.toLowerCase().includes(term)) ||
      (p.service && p.service.toLowerCase().includes(term)) ||
      (p.description && p.description.toLowerCase().includes(term))
    )
    return matchesCategory && matchesSearch
  })

  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark')

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [isDark])

  return (
    <div className="main-page">
      <header className="main-header">
        <div className="header-title">
          <h2>{tab === 'home' ? 'Procurar' : tab === 'finance' ? 'Financeiro' : tab === 'profile' ? 'Perfil' : tab === 'inicio' ? 'Feed LGI' : ''}</h2>
        </div>

        {tab === 'profile' && (
          <div className="header-actions">
            <button className="new-post-btn-sm" onClick={() => setPosting(true)}>
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Postar
            </button>
            <button 
              className="theme-toggle-btn" 
              aria-label="Alternar tema" 
              onClick={() => setIsDark(!isDark)}
            >
              {isDark ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
            <button className="settings-btn" aria-label="Configurações" onClick={() => setSettingsOpen(true)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </button>
            <button className="edit-btn" aria-label="Editar perfil" onClick={()=>setEditing(true)}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4 12.5-12.5z" />
              </svg>
            </button>
          </div>
        )}

        {tab === 'home' && (
          <form className="header-search" onSubmit={handleSearchSubmit} role="search">
            <input
              className="search-input"
              type="search"
              placeholder="Pesquisar..."
              value={search}
              onChange={e=>setSearch(e.target.value)}
              aria-label="Pesquisar"
            />
            <button className="search-btn" type="submit" aria-label="Buscar">🔍</button>
          </form>
        )}
      </header>

      <div className="content" style={{padding:16}}>
        {tab === 'inicio' && (
          <div className="posts-feed">
            {posts.length > 0 ? (
              posts.map(p => <PostCard key={p.id} post={p} />)
            ) : (
              <div className="premium-empty-state">
                <div className="empty-state-icon">✨</div>
                <h3>O feed está silencioso</h3>
                <p>Seja o primeiro a compartilhar uma postagem ou novidade com a comunidade LGI!</p>
                <button className="new-post-btn-sm" onClick={() => setPosting(true)}>
                  Criar Publicação
                </button>
              </div>
            )}
          </div>
        )}

        {tab === 'home' && (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <div className="filter-chips-container">
              {['Todos', 'Eletricista', 'Encanador', 'Pintor', 'TI'].map(cat => (
                <button
                  key={cat}
                  className={`filter-chip ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            {filteredPrestadores.length > 0 ? (
              <div className="feed-grid">
                {filteredPrestadores.map(p=> (
                  <CardPrestador
                    key={p.id}
                    id={p.id}
                    name={p.name}
                    description={p.description}
                    service={p.service}
                    cover={p.cover}
                    avatar={p.avatar}
                    rating={p.rating}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>Nenhum prestador encontrado para essa categoria.</p>
              </div>
            )}
          </div>
        )}

        {tab === 'finance' && (
          <FinanceiraTab />
        )}

        {tab === 'profile' && (
          <div className="profile-view">
            <div 
              className="profile-bg" 
              style={{ backgroundImage: localStorage.getItem('bgImageLocal') ? `url(${localStorage.getItem('bgImageLocal')})` : undefined }}
              aria-hidden="true"
            ></div>

            <div className="profile-meta">
              <img 
                className="profile-photo" 
                src={localStorage.getItem('profileImageLocal') || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.nome || 'U')}&background=fff&color=333&size=256`} 
                alt="Foto de perfil" 
              />
              <div className="profile-info">
                <h3>{user?.nome || 'Usuário'}</h3>
                <div className="profile-sub-info">
                  <p className="muted">{user?.emailComercial || user?.email || ''}</p>
                  <div className="badge-group">
                    {user?.servico && <span className="service-badge">{user.servico}</span>}
                    {user?.especialidade && <span className="specialty-badge">{user.especialidade}</span>}
                  </div>
                </div>
                {user?.descricao && <p className="profile-desc">{user.descricao}</p>}
                
                <div className="profile-stats-card">
                  <div className="stats-header">
                    <h4>Ficha Técnica</h4>
                  </div>
                  <div className="stats-grid">
                    <div className="stat-item">
                      <span className="stat-label">📍 Localização</span>
                      <span className="stat-value">{(() => { console.log('DEBUG - user:', user); console.log('DEBUG - user.cidade:', user?.cidade); return user?.cidade || '--'; })()}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Idade</span>
                      <span className="stat-value">{calculateAge(user?.dataNasc) || '--'} anos</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Tempo na Área</span>
                      <span className="stat-value">{user?.tempoArea || '--'}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Valor/Hora</span>
                      <span className="stat-value">R$ {user?.valorHora?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Qualidade</span>
                      <span className="stat-value">{renderStars(user?.qualidade)}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Credibilidade</span>
                      <span className="stat-value">
                        <span className={`cred-badge ${user?.credibilidade?.toLowerCase() || 'pendente'}`}>
                          {user?.credibilidade || 'Pendente'}
                        </span>
                      </span>
                    </div>
                    <div className="stat-item wide">
                      <span className="stat-label">Formação Técnica</span>
                      <span className="stat-value">{user?.formacao || '--'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="profile-posts-section">
              <h4>Minhas Publicações</h4>
              <div className="profile-posts-grid">
                {userPosts.length > 0 ? (
                  userPosts.map(p => (
                    <div key={p.id} className="profile-post-thumb">
                      {p.mediaType === 'image' ? (
                        <img src={p.mediaContent} alt="Post" />
                      ) : (
                        <div className="video-thumb">
                          <video src={p.mediaContent} />
                          <div className="video-icon">▶</div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="empty-msg">Você ainda não tem publicações.</p>
                )}
              </div>
            </div>
          </div>
        )}
        <ProfileEditModal open={editing} onClose={()=>setEditing(false)} user={user} onSave={(u)=>setUser(u)} />
        <UserSettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} user={user} />
        <PostModal 
          open={posting} 
          onClose={() => setPosting(false)} 
          userDocumento={user?.documento || ''} 
          onPostCreated={refreshAll} 
        />
      </div>

      <BottomNav selected={tab} onChange={(t)=>setTab(t)} />
    </div>
  )
}
