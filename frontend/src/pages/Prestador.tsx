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
  const [contratarOpen, setContratarOpen] = useState(false)
  const [specialties, setSpecialties] = useState<{code:string, name:string}[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [submitMsg, setSubmitMsg] = useState('')
  const [form, setForm] = useState({
    servico: '',
    data: '',
    hora: '',
    localizacao: '',
    preco: '',
    obs: ''
  })

  const fetchUserPosts = (userId: string) => {
    const doc = localStorage.getItem('documento')
    const url = doc ? `/api/posts/user/${encodeURIComponent(userId)}?currentUser=${doc}` : `/api/posts/user/${encodeURIComponent(userId)}`
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
      fetch(`/api/user/${encodeURIComponent(id)}`)
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
                cidade: data.cidade,
                // prefer locally-uploaded images (if present in this browser)
                avatar: (localStorage.getItem(`profileImageLocal_${data.documento}`)) || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.nome)}&background=random&color=fff&size=256`,
                cover: (localStorage.getItem(`bgImageLocal_${data.documento}`)) || 'https://images.unsplash.com/photo-1503264116251-35a269479413?q=80&w=1400&auto=format&fit=crop&ixlib=rb-4.0.3&s=1',
                rating: data.qualidade || 5
              })
          }
        })
        .catch(err => console.error('Erro ao buscar prestador:', err))

      fetchUserPosts(id)
    }
  }, [id])

  useEffect(() => {
    const serviceName = provider?.service
    if (serviceName) {
      fetch('/api/services')
        .then(r => r.ok ? r.json() : [])
        .then((services: any[]) => {
          const match = (Array.isArray(services) ? services : []).find(
            (s: any) => (s.name || s.classe_serv || '').toLowerCase().trim() === serviceName.toLowerCase().trim()
          )
          if (match?.code) {
            return fetch(`/api/specialties/${match.code}`)
              .then(r => r.ok ? r.json() : [])
          }
          return []
        })
        .then((data: any[]) => {
          setSpecialties(Array.isArray(data) ? data.map((s: any) => ({ code: String(s.code || ''), name: String(s.name || '') })).filter((s: {code:string, name:string}) => s.code && s.name) : [])
        })
        .catch(() => setSpecialties([]))
    } else {
      fetch('/api/services')
        .then(r => r.ok ? r.json() : [])
        .then((data: any[]) => {
          setSpecialties(Array.isArray(data) ? data.map((s: any) => ({ code: String(s.code || ''), name: String(s.name || s.classe_serv || '') })).filter((s: {code:string, name:string}) => s.code && s.name) : [])
        })
        .catch(() => setSpecialties([]))
    }
  }, [provider?.id, provider?.service])

  const openContratar = () => {
    setForm({
      servico: '',
      data: '',
      hora: '',
      localizacao: '',
      preco: provider?.valorHora ? provider.valorHora.toFixed(2) : '',
      obs: ''
    })
    setSubmitMsg('')
    setContratarOpen(true)
  }

  const handleContratar = () => {
    if (!form.servico || !form.data || !form.hora || !form.localizacao) {
      setSubmitMsg('Preencha todos os campos obrigatórios.')
      return
    }
    setSubmitting(true)
    setSubmitMsg('')

    const documento = localStorage.getItem('documento')
    if (!documento) {
      setSubmitMsg('Você precisa estar logado para contratar.')
      setSubmitting(false)
      return
    }

    fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client: documento,
        service: form.servico,
        date: form.data,
        time: form.hora,
        localizacao: form.localizacao,
        price: form.preco,
        obs: form.obs,
        prestador: id
      })
    })
      .then(r => {
        if (!r.ok) throw new Error('Erro ao solicitar serviço')
        return r.json()
      })
      .then(() => {
        setSubmitMsg('Solicitação enviada com sucesso!')
        setSubmitting(false)
        setTimeout(() => setContratarOpen(false), 1500)
      })
      .catch(err => {
        setSubmitMsg(err.message)
        setSubmitting(false)
      })
  }

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
      <header className="main-header prestador-header">
        <button className="back-btn-simple prestador-back-btn" onClick={() => navigate(-1)} aria-label="Voltar">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <div className="header-title prestador-header-title">
          <h2>Perfil</h2>
        </div>
        <div className="prestador-header-spacer" aria-hidden="true" />
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
                    <span className={provider.cidade ? 'stat-value' : 'stat-value muted'}>{provider.cidade || 'Não informada'}</span>
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

              <button className="contratar-btn" onClick={openContratar}>
                Contratar
              </button>
            </div>
          </div>

          {contratarOpen && (
            <div className="modal-overlay" role="dialog" aria-modal="true" onClick={(e) => e.target === e.currentTarget && setContratarOpen(false)}>
              <div className="modal-container contratar-modal">
                <div className="modal-header-premium">
                  <h3>Contratar Serviço</h3>
                  <button className="close-btn" onClick={() => setContratarOpen(false)}>&times;</button>
                </div>
                <div className="modal-body">
                  <div className="contratar-form">
                    <div className="input-group">
                      <label>Serviço</label>
                      <select
                        className="select-premium"
                        value={form.servico}
                        onChange={e => setForm({...form, servico: e.target.value})}
                      >
                        <option value="">Selecione um serviço</option>
                        {specialties.map(s => (
                          <option key={s.code} value={s.code}>{s.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="input-group">
                      <label>Data</label>
                      <input
                        className="input"
                        type="date"
                        value={form.data}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={e => setForm({...form, data: e.target.value})}
                      />
                    </div>

                    <div className="input-group">
                      <label>Horário</label>
                      <input
                        className="input"
                        type="time"
                        value={form.hora}
                        onChange={e => setForm({...form, hora: e.target.value})}
                      />
                    </div>

                    <div className="input-group">
                      <label>Localização</label>
                      <input
                        className="input"
                        type="text"
                        placeholder="Onde será realizado o serviço"
                        value={form.localizacao}
                        onChange={e => setForm({...form, localizacao: e.target.value})}
                      />
                    </div>

                    <div className="input-group">
                      <label>Preço (R$)</label>
                      <input
                        className="input"
                        type="number"
                        step="0.01"
                        value={form.preco}
                        onChange={e => setForm({...form, preco: e.target.value})}
                      />
                    </div>

                    <div className="input-group">
                      <label>Observações</label>
                      <textarea
                        className="input"
                        rows={3}
                        placeholder="Alguma observação?"
                        value={form.obs}
                        onChange={e => setForm({...form, obs: e.target.value})}
                      />
                    </div>

                    {submitMsg && (
                      <div className={`contratar-msg ${submitMsg.includes('sucesso') ? 'success' : 'error'}`}>
                        {submitMsg}
                      </div>
                    )}
                    <button className="contratar-submit-btn" onClick={handleContratar} disabled={submitting}>
                      {submitting ? 'Enviando...' : 'Solicitar Contratação'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="profile-posts-section">
            <h4>Publicações</h4>
            <div className="profile-posts-grid">
              {posts.length > 0 ? (
                posts.map(p => (
                  <div key={p.id}>
                    <PostCard
                      post={p}
                      onPostDeleted={handlePostDeleted}
                      canDelete={false}
                      onOpenPost={() => navigate(`/posts/${p.id}`)}
                    />
                  </div>
                ))
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


