import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import PasswordRecoveryModal from '../components/PasswordRecoveryModal'
import logoImage from '../assets/LGI-brandlogo.png'

export default function Login(){
  const location = useLocation()
  const loginState = location.state as { credenciais?: string; senha?: string } | null
  const [cred, setCred] = useState(loginState?.credenciais || '')
  const [senha, setSenha] = useState(loginState?.senha || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showRecovery, setShowRecovery] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async () => {
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credenciais: cred, senha })
      })

      if (!res.ok) {
        setError('Credenciais ou Senha estão incorretas')
        return
      }

      const data = await res.json()
      // salva documento do usuário para consulta futura e redireciona
      try{ localStorage.setItem('documento', data.documento) }catch{}
      navigate('/main')
    } catch (e) {
      setError('Erro de conexão com o servidor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container-premium">
      <div className="login-brand-wrapper">
        <img src={logoImage} alt="LGI logo" className="login-brand-image" />
        <p className="login-subtitle">Acesso profissional à comunidade</p>
      </div>

      <form className="login-card-premium" onSubmit={e => { e.preventDefault(); handleLogin() }}>
        {error && (
          <div className="alert error" role="alert">{error}</div>
        )}

        <div className="login-input-group">
          <label className="login-input-label">Credenciais</label>
          <div className="login-input-wrapper">
            <input 
              className="login-input-premium" 
              value={cred} 
              onChange={e => setCred(e.target.value)} 
              type="text" 
              placeholder="Email ou usuário" 
              required
            />
            <svg className="login-input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
        </div>

        <div className="login-input-group">
          <label className="login-input-label">Senha</label>
          <div className="login-input-wrapper">
            <input 
              className="login-input-premium" 
              value={senha} 
              onChange={e => setSenha(e.target.value)} 
              type="password" 
              placeholder="Senha" 
              required
            />
            <svg className="login-input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
        </div>

        <button type="button" className="login-btn-google">
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.69a5.74 5.74 0 0 1-2.48 3.77v3.13h4.01c2.34-2.16 3.68-5.32 3.68-8.75z"/>
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.83-2.97c-1.08.73-2.48 1.16-4.1 1.16-3.15 0-5.81-2.13-6.76-5.01H1.13v3.22A12.013 12.013 0 0 0 12 24z"/>
            <path fill="#FBBC05" d="M5.24 14.27A7.19 7.19 0 0 1 4.8 12c0-.79.13-1.57.38-2.31V6.47H1.13A11.968 11.968 0 0 0 0 12c0 2.14.56 4.14 1.54 5.9l3.7-2.92v-.71z"/>
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0A12.013 12.013 0 0 0 1.13 6.47l3.71 2.92c.95-2.88 3.61-5.01 6.76-5.01z"/>
          </svg>
          Entrar com Google
        </button>

        <div className="login-divider">ou</div>

        <button type="submit" className="login-btn-primary" disabled={loading}>
          {loading ? <div className="login-spinner"></div> : 'Entrar na LGI'}
        </button>

        <div className="login-footer-links">
          <Link to="/register">Criar nova conta</Link>
          <button type="button" className="login-footer-btn-link" onClick={() => setShowRecovery(true)}>Esqueci minha senha</button>
        </div>
      </form>

      {showRecovery && <PasswordRecoveryModal onClose={() => setShowRecovery(false)} />}
    </div>
  )
}


