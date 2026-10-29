import React, { useState } from 'react'

type Props = {
  open: boolean
  onClose: () => void
  user: any
}

export default function UserSettingsModal({ open, onClose, user }: Props) {
  const [activeTab, setActiveTab] = useState<'login' | 'pagamento' | 'associacao'>('login')
  const [activeLoginSubTab, setActiveLoginSubTab] = useState<'credenciais' | 'historico'>('credenciais')
  const [passwordChangeStep, setPasswordChangeStep] = useState<'none' | 'verify' | 'new_password'>('none')
  const [currentEmail, setCurrentEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [passwordError, setPasswordError] = useState(false)

  const maskEmail = (email?: string) => {
    if (!email) return ''
    const [userPart, domain] = email.split('@')
    if (!userPart || !domain) return email
    if (userPart.length <= 2) return email
    const first = userPart[0]
    const last = userPart[userPart.length - 1]
    return `${first}***${last}@${domain}`
  }

  const maskPhone = (phone?: string) => {
    if (!phone) return ''
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 11) {
      return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7)}`
    } else if (cleaned.length === 10) {
      return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 6)}-${cleaned.substring(6)}`
    }
    return phone
  }

  const handleVerifyCurrent = async () => {
    try {
      const resp = await fetch('/api/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credenciais: currentEmail, senha: currentPassword })
      })
      
      const data = await resp.json()
      
      if (resp.ok && data.valid) {
        setPasswordError(false)
        setPasswordChangeStep('new_password')
      } else {
        setPasswordError(true)
      }
    } catch (err) {
      console.error('Erro ao verificar senha:', err)
      setPasswordError(true)
    }
  }

  const handleFinalChange = async () => {
    if (newPassword !== confirmNewPassword) {
      alert('As senhas não coincidem.')
      return
    }
    if (newPassword.length < 6) {
      alert('A nova senha deve ter pelo menos 6 caracteres.')
      return
    }
    
    try {
      const resp = await fetch('/api/update-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credenciais: currentEmail, novaSenha: newPassword })
      })

      if (resp.ok) {
        alert('Senha alterada com sucesso!')
        resetPasswordFlow()
      } else {
        const data = await resp.json()
        alert(data.error || 'Erro ao atualizar senha.')
      }
    } catch (err) {
      console.error('Erro ao atualizar senha:', err)
      alert('Erro de conexão com o servidor.')
    }
  }

  const resetPasswordFlow = () => {
    setPasswordChangeStep('none')
    setCurrentEmail('')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmNewPassword('')
    setPasswordError(false)
  }

  if (!open) return null

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-container settings-modal">
        <div className="modal-header-premium">
          <h3>Configurações</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="settings-content">
          <aside className="settings-sidebar">
            <button 
              className={`sidebar-item ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => setActiveTab('login')}
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Login
            </button>
            <button 
              className={`sidebar-item ${activeTab === 'pagamento' ? 'active' : ''}`}
              onClick={() => setActiveTab('pagamento')}
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Pagamento
            </button>
            <button 
              className={`sidebar-item ${activeTab === 'associacao' ? 'active' : ''}`}
              onClick={() => setActiveTab('associacao')}
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Associação
            </button>
          </aside>

          <main className="settings-main">
            {activeTab === 'login' && (
              <div className="settings-tab-pane">
                <div className="horizontal-tabs">
                  <button 
                    className={`h-tab-item ${activeLoginSubTab === 'credenciais' ? 'active' : ''}`}
                    onClick={() => { setActiveLoginSubTab('credenciais'); resetPasswordFlow(); }}
                  >
                    Credenciais
                  </button>
                  <button 
                    className={`h-tab-item ${activeLoginSubTab === 'historico' ? 'active' : ''}`}
                    onClick={() => { setActiveLoginSubTab('historico'); resetPasswordFlow(); }}
                  >
                    Histórico de login
                  </button>
                </div>

                <div className="tab-sub-content">
                  {activeLoginSubTab === 'credenciais' ? (
                    <div className="credentials-view">
                      {passwordChangeStep === 'none' ? (
                        <>
                          <div className="input-group">
                            <label>Email</label>
                            <input type="text" value={maskEmail(user?.email)} readOnly disabled />
                          </div>
                          <div className="input-group">
                            <label>Telefone</label>
                            <input type="text" value={maskPhone(user?.telefone)} placeholder="Não cadastrado" readOnly disabled />
                          </div>
                          <div className="input-group">
                            <label>Senha</label>
                            <div className="password-display">
                              <input type="password" value="********" readOnly disabled />
                              <button className="text-btn" onClick={() => setPasswordChangeStep('verify')}>Alterar</button>
                            </div>
                          </div>
                        </>
                      ) : passwordChangeStep === 'verify' ? (
                        <div className="change-password-form">
                          <h4>Verificação de Segurança</h4>
                          <p className="muted" style={{fontSize:'0.85rem'}}>Para sua segurança, confirme seus dados atuais.</p>
                          <div className="input-group">
                            <label>Email atual</label>
                            <input 
                              type="email" 
                              value={currentEmail} 
                              onChange={e => setCurrentEmail(e.target.value)} 
                              placeholder="Digite seu email atual"
                            />
                          </div>
                          <div className="input-group">
                            <label>Senha atual</label>
                            <input 
                              type="password" 
                              value={currentPassword} 
                              onChange={e => setCurrentPassword(e.target.value)} 
                              placeholder="Digite sua senha atual"
                            />
                            {passwordError && (
                              <button className="forgot-password-link" onClick={() => alert('Recuperação de senha enviada!')}>
                                Esqueci a senha
                              </button>
                            )}
                          </div>
                          <div className="form-actions-settings">
                            <button className="btn-secondary" onClick={() => setPasswordChangeStep('none')}>Cancelar</button>
                            <button className="btn primary" onClick={handleVerifyCurrent}>Verificar</button>
                          </div>
                        </div>
                      ) : (
                        <div className="change-password-form">
                          <h4>Nova Senha</h4>
                          <p className="muted" style={{fontSize:'0.85rem'}}>Defina sua nova credencial de acesso.</p>
                          <div className="input-group">
                            <label>Nova Senha</label>
                            <input 
                              type="password" 
                              value={newPassword} 
                              onChange={e => setNewPassword(e.target.value)} 
                              placeholder="Mínimo 6 caracteres"
                            />
                          </div>
                          <div className="input-group">
                            <label>Confirmar Nova Senha</label>
                            <input 
                              type="password" 
                              value={confirmNewPassword} 
                              onChange={e => setConfirmNewPassword(e.target.value)} 
                              placeholder="Repita a nova senha"
                            />
                          </div>
                          <div className="form-actions-settings">
                            <button className="btn-secondary" onClick={() => setPasswordChangeStep('verify')}>Voltar</button>
                            <button className="btn primary" onClick={handleFinalChange}>Atualizar Senha</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="history-view">
                      <p className="muted">Últimos acessos à sua conta.</p>
                      <ul className="history-list">
                        <li>
                          <span className="h-date">14/05/2026 11:45</span>
                          <span className="h-ip">IP: 192.168.1.1</span>
                          <span className="h-device">Chrome - Windows</span>
                        </li>
                        <li>
                          <span className="h-date">13/05/2026 09:20</span>
                          <span className="h-ip">IP: 192.168.1.1</span>
                          <span className="h-device">Mobile App - Android</span>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'pagamento' && (
              <div className="settings-tab-pane">
                <h4>Métodos de Pagamento</h4>
                <p className="muted">Gerencie suas formas de recebimento e pagamento.</p>
                <div className="empty-state-settings">
                  <p>Nenhum método cadastrado.</p>
                  <button className="btn-secondary">Adicionar Cartão ou Pix</button>
                </div>
              </div>
            )}

            {activeTab === 'associacao' && (
              <div className="settings-tab-pane">
                <h4>Status da Associação</h4>
                <div className="plan-card-premium">
                  <div className="plan-info">
                    <span className="plan-badge">Plano Grátis</span>
                    <h5>Membro da Comunidade</h5>
                    <p>Acesso limitado a recursos básicos.</p>
                  </div>
                  <button className="btn primary">Upgrade para Premium</button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}


