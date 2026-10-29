import React, { useState, useEffect, useRef } from 'react'

type Props = {
  open: boolean
  onClose: () => void
  user: { documento?: string; nome?: string; descricao?: string; email?: string; servico?: string; especialidade?: string; formacao?: string; tempoArea?: string; valorHora?: number; emailComercial?: string; cidade?: string } | null
  onSave: (u: any) => void
}

export default function ProfileEditModal({ open, onClose, user, onSave }: Props) {
  const [nome, setNome] = useState(user?.nome || '')
  const [descricao, setDescricao] = useState(user?.descricao || '')
  const [servico, setServico] = useState(user?.servico || '')
  const [especialidade, setEspecialidade] = useState(user?.especialidade || '')
  const [formacao, setFormacao] = useState(user?.formacao || '')
  const [tempoArea, setTempoArea] = useState(user?.tempoArea || '')
  const [valorHora, setValorHora] = useState(user?.valorHora?.toString() || '')
  const [emailComercial, setEmailComercial] = useState(user?.emailComercial || '')
  const [cidade, setCidade] = useState(user?.cidade || '')
  
  const [servicesList, setServicesList] = useState<Array<{name:string, code:string}>>([])
  const [specialtiesList, setSpecialtiesList] = useState<Array<{name:string, code:string}>>([])
  
  const [profilePreview, setProfilePreview] = useState<string | null>(null)
  const [bgPreview, setBgPreview] = useState<string | null>(null)
  const bgInputRef = useRef<HTMLInputElement | null>(null)
  const profileInputRef = useRef<HTMLInputElement | null>(null)

  // Carregar lista de serviços ao abrir
  useEffect(() => {
    if (open) {
      fetch('/api/services')
        .then(r => r.json())
        .then(data => setServicesList(Array.isArray(data) ? data : []))
        .catch(err => console.error('Erro ao buscar serviços:', err))
    }
  }, [open])

  // Reset/Sincronizar campos quando o usuário ou modal mudam
  useEffect(() => {
    setNome(user?.nome || '')
    setDescricao(user?.descricao || '')
    setServico(user?.servico || '')
    setEspecialidade(user?.especialidade || '')
    setFormacao(user?.formacao || '')
    setTempoArea(user?.tempoArea || '')
    setValorHora(user?.valorHora?.toString() || '')
    setEmailComercial(user?.emailComercial || '')
    setCidade(user?.cidade || '')
    // Use per-user localStorage keys to avoid sharing images between different accounts
    const profileKey = user?.documento ? `profileImageLocal_${user.documento}` : null
    const bgKey = user?.documento ? `bgImageLocal_${user.documento}` : null
    setProfilePreview(profileKey ? localStorage.getItem(profileKey) : null)
    setBgPreview(bgKey ? localStorage.getItem(bgKey) : null)
  }, [user, open])

  // Carregar especialidades quando o serviço muda
  useEffect(() => {
    if (!servico || servicesList.length === 0) {
      setSpecialtiesList([])
      return
    }

    const selectedService = servicesList.find(s => s.name === servico)
    if (selectedService) {
      fetch(`/api/specialties/${selectedService.code}`)
        .then(r => r.json())
        .then(data => setSpecialtiesList(Array.isArray(data) ? data : []))
        .catch(err => console.error('Erro ao buscar especialidades:', err))
    }
  }, [servico, servicesList])

  if (!open) return null

  const handleFile = (f: File | null, setter: (s: string | null) => void) => {
    if (!f) return
    const reader = new FileReader()
    reader.onload = () => {
      const data = reader.result as string
      setter(data)
    }
    reader.readAsDataURL(f)
  }

  const submit = async () => {
    if (!user?.documento) return
    try {
      const resp = await fetch(`/api/user/${encodeURIComponent(user.documento)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, descricao, servico, especialidade, formacao, tempoArea, valorHora, emailComercial, cidade })
      })
      if (!resp.ok) throw new Error('Falha ao salvar')
      const updated = await resp.json()
      
      // Persist images per-user (key includes documento). Don't write global keys.
      if (user?.documento) {
        const profileKey = `profileImageLocal_${user.documento}`
        const bgKey = `bgImageLocal_${user.documento}`
        if (profilePreview) localStorage.setItem(profileKey, profilePreview)
        if (bgPreview) localStorage.setItem(bgKey, bgPreview)
      }
      
      onSave(updated)
      onClose()
    } catch (err) {
      console.error(err)
      alert('Erro ao salvar perfil')
    }
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-container">
        <div className="modal-header-premium">
          <h3>Editar Perfil</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          <div className="edit-banner-section">
            <div 
              className="edit-banner" 
              style={{ backgroundImage: bgPreview ? `url(${bgPreview})` : 'linear-gradient(135deg, #6366f1, #a855f7)' }}
            >
              <button className="change-banner-btn" onClick={() => bgInputRef.current?.click()}>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Trocar Capa
              </button>
            </div>
            
            <div className="edit-avatar-wrapper">
              <div className="edit-avatar">
                <img 
                  src={profilePreview || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.nome || 'U')}&background=fff&color=333&size=256`} 
                  alt="Avatar" 
                />
                <button className="change-avatar-btn" onClick={() => profileInputRef.current?.click()}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <input ref={bgInputRef} type="file" hidden accept="image/*" onChange={e => handleFile(e.target.files?.[0] || null, setBgPreview)} />
          <input ref={profileInputRef} type="file" hidden accept="image/*" onChange={e => handleFile(e.target.files?.[0] || null, setProfilePreview)} />

          <div className="edit-form">
            <div className="input-group">
              <label>Nome Completo</label>
              <input 
                type="text" 
                value={nome} 
                onChange={e => setNome(e.target.value)} 
                placeholder="Seu nome"
              />
            </div>

            <div className="input-group">
              <label>Email Comercial (Para contato)</label>
              <input 
                type="email" 
                value={emailComercial} 
                onChange={e => setEmailComercial(e.target.value)} 
                placeholder="email@exemplo.com"
              />
            </div>

            <div className="input-group">
              <label>📍 Localização (Cidade)</label>
              <input 
                type="text" 
                value={cidade} 
                onChange={e => setCidade(e.target.value)} 
                placeholder="Ex: São Paulo, Rio de Janeiro"
              />
            </div>

            <div className="edit-grid-row">
              <div className="input-group">
                <label>Serviço</label>
                <select 
                  value={servico} 
                  onChange={e => { setServico(e.target.value); setEspecialidade(''); }}
                  className="select-premium"
                >
                  <option value="">Selecione...</option>
                  {servicesList.map(s => (
                    <option key={s.code} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label>Especialidade</label>
                <select 
                  value={especialidade} 
                  onChange={e => setEspecialidade(e.target.value)}
                  className="select-premium"
                  disabled={!servico || specialtiesList.length === 0}
                >
                  <option value="">Selecione...</option>
                  {specialtiesList.map(s => (
                    <option key={s.code} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="input-group">
              <label>Bio / Descrição</label>
              <textarea 
                value={descricao} 
                onChange={e => setDescricao(e.target.value)} 
                placeholder="Conte um pouco sobre você..."
                rows={3}
              />
            </div>

            <div className="input-group">
              <label>Formação Técnica</label>
              <input 
                type="text" 
                value={formacao} 
                onChange={e => setFormacao(e.target.value)} 
                placeholder="Ex: Engenharia de Software, Técnico em TI..."
              />
            </div>

            <div className="edit-grid-row">
              <div className="input-group">
                <label>Tempo na Área</label>
                <input 
                  type="text" 
                  value={tempoArea} 
                  onChange={e => setTempoArea(e.target.value)} 
                  placeholder="Ex: 5 anos"
                />
              </div>
              <div className="input-group">
                <label>Valor por Hora (R$)</label>
                <input 
                  type="number" 
                  value={valorHora} 
                  onChange={e => setValorHora(e.target.value)} 
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer-premium">
          <button className="btn-secondary" onClick={onClose}>Descartar</button>
          <button className="btn-primary-premium" onClick={submit}>Salvar Alterações</button>
        </div>
      </div>
    </div>
  )
}


