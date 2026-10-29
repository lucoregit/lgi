import React from 'react'

import { useNavigate } from 'react-router-dom'

type Props = {
  id: string | number
  name: string
  cover: string
  avatar: string
  rating: number
  service?: string
  description?: string
  qualidade?: number
  credibilidade?: string
}

export default function CardPrestador({ id, name, cover, avatar, rating, service, description, qualidade, credibilidade }: Props){
  const navigate = useNavigate()
  const stars = Array.from({length:5}).map((_,i)=> i < Math.round(rating) ? '★' : '☆')

  return (
    <article className="card card-prestador">
      <div className="card-cover-wrapper">
        <img className="card-cover" src={cover} alt={`Capa de ${name}`} />

        <div className="avatar-wrapper" aria-hidden>
          <img className="avatar" src={avatar} alt={`${name} avatar`} />
        </div>
      </div>

      <div className="card-body">
        <div className="card-header-inline">
          <div className="card-title">{name}</div>
          {service && <div className="card-profession">{service}</div>}
        </div>
        {description && <div className="card-desc">{description}</div>}
        <div className="card-rating" aria-label={`Avaliação ${rating} de 5`}>
          {stars.join(' ')}
        </div>

        {(qualidade !== undefined || credibilidade) && (
          <div className="card-qual-cred">
            {qualidade !== undefined && (
              <span className="card-qual-stars">
                {[1,2,3,4,5].map(s => (
                  <span key={s} className={s <= Math.round(qualidade || 0) ? 'star filled' : 'star'}>★</span>
                ))}
              </span>
            )}
            {credibilidade && (
              <span className={`cred-badge ${credibilidade.toLowerCase()}`}>
                {credibilidade}
              </span>
            )}
          </div>
        )}

        <div className="card-actions">
          <button className="card-btn" onClick={()=> navigate(`/prestador/${id}`, { state: { provider: { id, name, cover, avatar, rating, service, description, qualidade, credibilidade } } })}>Ver</button>
        </div>
      </div>
    </article>
  )
}


