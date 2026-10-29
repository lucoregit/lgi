import React, { useState } from 'react';

interface PasswordRecoveryModalProps {
  onClose: () => void;
}

export default function PasswordRecoveryModal({ onClose }: PasswordRecoveryModalProps) {
  const [step, setStep] = useState(1); // 1: Email, 2: Code, 3: New Password
  const [cred, setCred] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleRequestCode = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credenciais: cred })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erro ao solicitar código');
      } else {
        setMessage(data.message);
        setStep(2);
      }
    } catch (e) {
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/verify-recovery-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credenciais: cred, code })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Código inválido');
      } else {
        setStep(3);
      }
    } catch (e) {
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/reset-password-recovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credenciais: cred, code, novaSenha: newPassword })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erro ao resetar senha');
      } else {
        alert('Senha alterada com sucesso!');
        onClose();
      }
    } catch (e) {
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Recuperar Senha</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        {error && <div className="alert error">{error}</div>}
        {message && step === 2 && <div className="alert success">{message}</div>}

        {step === 1 && (
          <div className="modal-body">
            <p>Informe seu email ou documento para receber o código de 6 dígitos.</p>
            <label className="label">Email ou Documento</label>
            <input 
              className="input" 
              value={cred} 
              onChange={e => setCred(e.target.value)} 
              placeholder="ex: joao@email.com"
            />
            <button className="btn primary" onClick={handleRequestCode} disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar Código'}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="modal-body">
            <p>Insira o código de 6 dígitos enviado para seu email.</p>
            <div className="code-input-container">
               <input 
                className="input text-center" 
                style={{ fontSize: '24px', letterSpacing: '8px', textAlign: 'center' }}
                value={code} 
                onChange={e => setCode(e.target.value.substring(0, 6))} 
                maxLength={6}
                placeholder="000000"
              />
            </div>
            <button className="btn primary" onClick={handleVerifyCode} disabled={loading}>
              {loading ? 'Verificando...' : 'Verificar Código'}
            </button>
            <button className="btn-link" onClick={() => setStep(1)} style={{ marginTop: '10px' }}>
              Voltar
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="modal-body">
            <p>Digite sua nova senha.</p>
            <label className="label">Nova Senha</label>
            <input 
              className="input" 
              type="password"
              value={newPassword} 
              onChange={e => setNewPassword(e.target.value)} 
              placeholder="Minimo 6 caracteres"
            />
            <button className="btn primary" onClick={handleResetPassword} disabled={loading}>
              {loading ? 'Salvando...' : 'Alterar Senha'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


