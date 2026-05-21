import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logoImage from '../assets/LGI-brandlogo.png'

type RegisterPayload = {
  nome: string
  documento: string
  dataNasc: string
  email: string
  senha: string
}

export default function Register() {
  const [nome, setNome] = useState('')
  const [documento, setDocumento] = useState('')
  const [dataNasc, setDataNasc] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [senha2, setSenha2] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (senha !== senha2) {
      setError('As senhas não coincidem')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('http://localhost:8080/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, documento, dataNasc, email, senha } as RegisterPayload),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        setError(data?.message || 'Falha ao criar a conta')
        return
      }

      setSuccess('Conta criada com sucesso! Você será redirecionado para o login.')
      setTimeout(() => navigate('/'), 1200)
    } catch (err) {
      setError('Erro de conexão com o servidor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container-premium">
      <div className="login-brand-wrapper">
        <img src={logoImage} alt="LGI logo" className="login-brand-image" />
        <p className="login-subtitle">Cadastro profissional na comunidade</p>
      </div>

      <form className="login-card-premium" onSubmit={handleRegister}>
        {error && <div className="alert error" role="alert">{error}</div>}
        {success && <div className="alert success" role="status">{success}</div>}

        <div className="login-input-group">
          <label className="login-input-label">Nome completo</label>
          <div className="login-input-wrapper">
            <input
              className="login-input-premium"
              value={nome}
              onChange={e => setNome(e.target.value)}
              type="text"
              placeholder="Nome completo"
              required
            />
          </div>
        </div>

        <div className="login-input-group">
          <label className="login-input-label">Documento</label>
          <div className="login-input-wrapper">
            <input
              className="login-input-premium"
              value={documento}
              onChange={e => setDocumento(e.target.value)}
              type="text"
              placeholder="CPF ou CNPJ"
              required
            />
          </div>
        </div>

        <div className="login-input-group">
          <label className="login-input-label">Data de Nasc.</label>
          <div className="login-input-wrapper">
            <input
              className="login-input-premium"
              value={dataNasc}
              onChange={e => setDataNasc(e.target.value)}
              type="date"
              required
            />
          </div>
        </div>

        <div className="login-input-group">
          <label className="login-input-label">E-mail</label>
          <div className="login-input-wrapper">
            <input
              className="login-input-premium"
              value={email}
              onChange={e => setEmail(e.target.value)}
              type="email"
              placeholder="Email"
              required
            />
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
          </div>
        </div>

        <div className="login-input-group">
          <label className="login-input-label">Verificar senha</label>
          <div className="login-input-wrapper">
            <input
              className="login-input-premium"
              value={senha2}
              onChange={e => setSenha2(e.target.value)}
              type="password"
              placeholder="Repita a senha"
              required
            />
          </div>
        </div>

        <button type="submit" className="login-btn-primary" disabled={loading}>
          {loading ? <div className="login-spinner"></div> : 'Criar nova conta'}
        </button>

        <div className="login-footer-links">
          <Link to="/">Voltar ao login</Link>
        </div>
      </form>
    </div>
  )
}
