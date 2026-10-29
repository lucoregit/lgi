import React, { useEffect, useState } from 'react';

// ─── Dados mocados de atendimentos agendados (baseados no Controle de Serviços) ───
// const scheduledAppointments = [
//   {
//     id: 1,
//     client: 'Gabriel',
//     service: 'Consultoria de Interiores',
//     date: '2026-05-20',
//     time: '10:00',
//     duration: 90,
//     price: 'R$ 300,00',
//     status: 'scheduled',
//   },
//   {
//     id: 2,
//     client: 'Marcos Santos',
//     service: 'Jardinagem e Podagem',
//     date: '2026-05-22',
//     time: '09:00',
//     duration: 120,
//     price: 'R$ 250,00',
//     status: 'scheduled',
//   },
//   {
//     id: 3,
//     client: 'Beatriz Melo',
//     service: 'Limpeza Pós-Obra',
//     date: '2026-05-25',
//     time: '08:30',
//     duration: 180,
//     price: 'R$ 500,00',
//     status: 'scheduled',
//   },
//   {
//     id: 4,
//     client: 'Mariana Costa',
//     service: 'Manutenção Elétrica',
//     date: '2026-05-24',
//     time: '14:00',
//     duration: 60,
//     price: 'R$ 200,00',
//     status: 'confirmed',
//   },
//   {
//     id: 5,
//     client: 'João Oliveira',
//     service: 'Instalação de Chuveiro',
//     date: '2026-05-24',
//     time: '16:30',
//     duration: 60,
//     price: 'R$ 120,00',
//     status: 'in-progress',
//   },
//   {
//     id: 6,
//     client: 'Rafael Almeida',
//     service: 'Reparo Elétrico',
//     date: '2026-05-27',
//     time: '11:00',
//     duration: 90,
//     price: 'R$ 175,00',
//     status: 'scheduled',
//   },
//   {
//     id: 7,
//     client: 'Camila Torres',
//     service: 'Pintura de Sala',
//     date: '2026-05-29',
//     time: '08:00',
//     duration: 240,
//     price: 'R$ 380,00',
//     status: 'scheduled',
//   },
// ];

interface Appointment {
  id: number;
  client: string;
  service: string;
  date: string;
  time: string;
  duration: number;
  price: string;
  status: 'scheduled' | 'confirmed' | 'in-progress' | string;
  statusServico?: number | null;
}

interface TimeSlot {
  time: string;
  type: 'free' | 'booked';
  appointment: Appointment | null;
  isStart: boolean;
}

// Gera todos os slots de horário de um dia (07:00 → 20:00, a cada 30min)
function generateTimeSlots(date: string, appointmentsList: Appointment[]): TimeSlot[] {
  const appointments = appointmentsList.filter(a => a.date === date);
  const slots: TimeSlot[] = [];

  for (let h = 7; h <= 19; h++) {
    for (let m = 0; m < 60; m += 30) {
      const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      const slotMinutes = h * 60 + m;

    const occupying = appointments.find(a => {
      if (!a.time || typeof a.time !== 'string') {
        return false; 
      }

      const [ah, am] = a.time.split(':').map(Number);
      const start = ah * 60 + am;
      const end = start + (a.duration || 60);
      return slotMinutes >= start && slotMinutes < end;
    });

      if (occupying) {
        const [ah, am] = occupying.time.split(':').map(Number);
        const isStartSlot = ah === h && am === m;
        slots.push({
          time: timeStr,
          type: 'booked' as const,
          appointment: occupying,
          isStart: isStartSlot,
        });
      } else {
        slots.push({
          time: timeStr,
          type: 'free' as const,
          appointment: null,
          isStart: false,
        });
      }
    }
  }
  return slots;
}

// ─── Componente do Calendário ───────────────────────────────────────────────────
function ServiceCalendar({ refreshKey }: { refreshKey: number }) {
  const today = new Date(2026, 4, 24); // maio 2026 (mês base do projeto)
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 4, 1));
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [appointmentsFromBackend, setAppointmentsFromBackend] = useState<Appointment[]>([]);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDay = new Date(year, month, 1).getDay(); // 0=Dom
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  useEffect(() => {
  const fetchAppointments = async () => {
    try {
      const queryYear = currentMonth.getFullYear();
      const queryMonth = currentMonth.getMonth() + 1;
      const prestadorId = localStorage.getItem('documento');
      if (!prestadorId) return;

      const response = await fetch(`/api/appointments?year=${queryYear}&month=${queryMonth}&prestadorId=${prestadorId}`);
      
      if (!response.ok) {
        console.error("O servidor retornou um erro: " + response.status);
        setAppointmentsFromBackend([]);
        return;
      }

      const data = await response.json();
      
      if (Array.isArray(data)) {
        setAppointmentsFromBackend(data);
      } else {
        setAppointmentsFromBackend([]);
      }

    } catch (error) {
      console.error("Erro de conexão com o banco:", error);
      setAppointmentsFromBackend([]);
    }
  };

  fetchAppointments();
}, [currentMonth, refreshKey]);

  const visibleAppointments = appointmentsFromBackend.filter(a =>
    a.statusServico == null || a.statusServico === 2 || a.statusServico === 4
  );

  // Dias com serviço agendado no mês atual
  const bookedDays = new Set(
    visibleAppointments
      .filter(a => {
        const d = new Date(a.date + 'T12:00:00');
        return d.getFullYear() === year && d.getMonth() === month;
      })
      .map(a => parseInt(a.date.split('-')[2], 10))
  );

  const prevMonth = () =>
    setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () =>
    setCurrentMonth(new Date(year, month + 1, 1));

  const handleDayClick = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDay(dateStr);
    setModalOpen(true);
  };

  const todayDay = today.getFullYear() === year && today.getMonth() === month
    ? today.getDate()
    : -1;

  // Montar grade do calendário
  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);
  while (calendarCells.length % 7 !== 0) calendarCells.push(null);

const slots = selectedDay ? generateTimeSlots(selectedDay, visibleAppointments) : [];
  const selectedAppointments = selectedDay
    ? visibleAppointments.filter(a => a.date === selectedDay)
    : [];

  const formatSelectedDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  const handleAgendarServico = async (slotTime: string): Promise<void> => {
  // Pega o CPF/CNPJ do cliente logado no localStorage
  const clienteLogado = localStorage.getItem("documento"); 
  
  if (!clienteLogado) {
    alert("Você precisa estar logado para agendar um serviço!");
    return;
  }

  // Criamos o objeto seguindo à risca a sua interface 'Appointment'
  // O pre_id e o client vão como string/documento conforme a estrutura do seu projeto
  const novoPedido: Omit<Appointment, 'id'> = {
    client: clienteLogado,               // documento do cliente logado
    service: "Manutenção Geral",        // Nome do serviço
    date: selectedDay as string,         // Data selecionada ("YYYY-MM-DD")
    time: slotTime,                     // Horário do slot ("HH:MM")
    duration: 60,                       // Tempo em minutos (number)
    price: "150.00",                    // Valor (string)
    status: "2"                         // Mantido como string "2" (Pendente) para o mapeamento
  };

  try {
    const response = await fetch("/api/appointments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(novoPedido),
    });

    if (response.ok) {
      const pedidoSalvo: Appointment = await response.json();
      
      // Atualiza o estado tipado do React adicionando o novo agendamento vindo do Java
      setAppointmentsFromBackend((prev: Appointment[]) => [...prev, pedidoSalvo]);
      
      alert("Solicitação de agendamento enviada! Aguarde o aceite do prestador.");
      setModalOpen(false);
    } else {
      alert("Erro ao solicitar agendamento no servidor.");
    }
  } catch (error) {
    console.error("Erro ao conectar com o backend Java:", error);
    alert("Não foi possível conectar ao servidor.");
  }
};

  return (
    <>
      <div className="finance-card service-calendar-card">
        {/* Cabeçalho do calendário */}
        <div className="cal-header">
          <div className="cal-title-group">
            <div className="cal-icon-wrapper">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <h4 className="cal-title">Agenda de Atendimentos</h4>
          </div>
          <div className="cal-legend">
            <span className="cal-legend-dot booked"></span>
            <span className="cal-legend-label">Com serviço</span>
          </div>
        </div>

        {/* Navegação de mês */}
        <div className="cal-nav">
          <button className="cal-nav-btn" onClick={prevMonth} aria-label="Mês anterior">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <span className="cal-month-label">{monthNames[month]} {year}</span>
          <button className="cal-nav-btn" onClick={nextMonth} aria-label="Próximo mês">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* Nomes dos dias */}
        <div className="cal-grid cal-weekdays">
          {dayNames.map(d => (
            <div key={d} className="cal-weekday">{d}</div>
          ))}
        </div>

        {/* Células dos dias */}
        <div className="cal-grid cal-days">
          {calendarCells.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} className="cal-cell empty" />;
            }
            const isToday = day === todayDay;
            const isBooked = bookedDays.has(day);
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isPast = new Date(dateStr + 'T23:59:59') < today && !isToday;

            return (
              <button
                key={day}
                className={`cal-cell cal-day-btn${isToday ? ' today' : ''}${isBooked ? ' booked' : ''}${isPast ? ' past' : ''}`}
                onClick={() => handleDayClick(day)}
                aria-label={`Dia ${day}${isBooked ? ', tem serviço agendado' : ''}`}
              >
                <span className="cal-day-num">{day}</span>
                {isBooked && <span className="cal-booked-dot" />}
              </button>
            );
          })}
        </div>

        {/* Contagem do mês */}
        <div className="cal-footer-info">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>
            {bookedDays.size > 0
              ? `${bookedDays.size} dia${bookedDays.size > 1 ? 's' : ''} com atendimento em ${monthNames[month]}`
              : `Nenhum atendimento em ${monthNames[month]}`}
          </span>
          {bookedDays.size > 0 && (
            <>
              <span className="cal-footer-dot">·</span>
              <span className="cal-footer-ocupados">
                {visibleAppointments.reduce((s, a) => s + Math.ceil((a.duration || 60) / 30), 0)} horários ocupados
              </span>
            </>
          )}
        </div>
      </div>

      {/* Modal de horários */}
      {modalOpen && selectedDay && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="cal-modal-container" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="cal-modal-header">
              <div className="cal-modal-title-group">
                <div className="cal-modal-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div>
                  <h3 className="cal-modal-title">Horários do Dia</h3>
                  <p className="cal-modal-date">{formatSelectedDate(selectedDay)}</p>
                </div>
              </div>
              <button className="cal-modal-close" onClick={() => setModalOpen(false)} aria-label="Fechar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Resumo dos agendamentos do dia */}
            {selectedAppointments.length > 0 && (
              <div className="cal-modal-appointments">
                <span className="cal-modal-section-label">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  Atendimentos agendados ({selectedAppointments.length})
                </span>
                {selectedAppointments.map(ap => (
                  <div key={ap.id} className="cal-appointment-chip">
                    <div className="cal-chip-time">
                      <span className="cal-chip-hour">{ap.time}</span>
                      <span className="cal-chip-duration">{ap.duration}min</span>
                    </div>
                    <div className="cal-chip-info">
                      <span className="cal-chip-client">{ap.client}</span>
                      <span className="cal-chip-service">{ap.service}</span>
                    </div>
                    <span className="cal-chip-price">{ap.price}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Grade de horários */}
            <div className="cal-modal-body">
              <span className="cal-modal-section-label">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                Grade de Horários (07:00 – 20:00)
              </span>

              <div className="cal-slots-legend">
                <div className="cal-slot-legend-item">
                  <span className="cal-slot-dot free" />
                  <span>Livre</span>
                </div>
                <div className="cal-slot-legend-item">
                  <span className="cal-slot-dot busy" />
                  <span>Ocupado</span>
                </div>
              </div>

<div className="cal-slots-grid">
  {slots.map((slot: TimeSlot, idx: number) => (
    <div
      key={idx}
      className={`cal-slot${slot.type === 'booked' ? ' booked' : ' free'}${slot.isStart ? ' start' : ''}`}
      onClick={() => {
        if (slot.type === 'free') {
          const confirma = window.confirm(`Deseja solicitar o agendamento para às ${slot.time}?`);
          if (confirma) {
            handleAgendarServico(slot.time);
          }
        }
      }}
      style={{ cursor: slot.type === 'free' ? 'pointer' : 'not-allowed' }}
      title={
        slot.type === 'booked' && slot.appointment
          ? `${slot.appointment.client} – ${slot.appointment.service}`
          : 'Horário disponível para agendamento'
      }
    >
      <span className="cal-slot-time">{slot.time}</span>
      {slot.type === 'booked' && slot.isStart && slot.appointment && (
        <span className="cal-slot-label">
          {slot.appointment.client.split(' ')[0]}
        </span>
      )}
      {slot.type === 'free' && (
        <span className="cal-slot-free-label">Disponível</span>
      )}
    </div>
  ))}
</div>
            </div>

            {/* Footer */}
            <div className="cal-modal-footer">
              <div className="cal-modal-stats">
                <div className="cal-modal-stat">
                  <span className="cal-modal-stat-value free-count">
                    {slots.filter(s => s.type === 'free').length}
                  </span>
                  <span className="cal-modal-stat-label">Livres</span>
                </div>
                <div className="cal-modal-stat-divider" />
                <div className="cal-modal-stat">
                  <span className="cal-modal-stat-value booked-count">
                    {slots.filter(s => s.type === 'booked').length}
                  </span>
                  <span className="cal-modal-stat-label">Ocupados</span>
                </div>
                <div className="cal-modal-stat-divider" />
                <div className="cal-modal-stat">
                  <span className="cal-modal-stat-value">
                    {selectedAppointments.length}
                  </span>
                  <span className="cal-modal-stat-label">Serviços</span>
                </div>
              </div>
              <button className="cal-modal-close-btn" onClick={() => setModalOpen(false)}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Componente principal ───────────────────────────────────────────────────────
export default function FinanceiraTab() {
  const [subTab, setSubTab] = useState<'consumidor' | 'prestador'>('consumidor');
  const [period, setPeriod] = useState('1'); // '1', '3', '12' months
  const [servicesExpanded, setServicesExpanded] = useState(false);
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [controleData, setControleData] = useState<any>(null);
  const [loadingControle, setLoadingControle] = useState(false);
  const [selectedPossivel, setSelectedPossivel] = useState<any>(null);
  const [acaoLoading, setAcaoLoading] = useState(false);
  const [calendarRefreshKey, setCalendarRefreshKey] = useState(0);
  const [minhasSolicitacoes, setMinhasSolicitacoes] = useState<any[]>([]);
  const [loadingSolicitacoes, setLoadingSolicitacoes] = useState(false);

  useEffect(() => {
    if (subTab === 'prestador') {
      fetchControle();
    } else {
      fetchMinhasSolicitacoes();
    }
  }, [subTab]);

  async function fetchMinhasSolicitacoes() {
    setLoadingSolicitacoes(true);
    try {
      const doc = localStorage.getItem('documento');
      if (!doc) return;
      const res = await fetch(`/api/appointments/minhas-solicitacoes/${doc}`);
      if (res.ok) {
        const data = await res.json();
        setMinhasSolicitacoes(data);
      }
    } catch (err) {
      console.error('Erro ao buscar solicitacoes', err);
    } finally {
      setLoadingSolicitacoes(false);
    }
  }

  async function fetchControle() {
    setLoadingControle(true);
    try {
      const doc = localStorage.getItem('documento');
      if (!doc) return;
      const res = await fetch(`/api/appointments/controle/${doc}`);
      if (res.ok) {
        const data = await res.json();
        setControleData(data);
      }
    } catch (err) {
      console.error('Erro ao buscar controle de servicos', err);
    } finally {
      setLoadingControle(false);
    }
  }

  function buildServiceTopics(data: any) {
    if (!data) return [];

    const fmt = (item: any, type: string) => {
      let displayDate = '';
      const d = item.date ? new Date(item.date + 'T12:00:00') : null;
      const pad = (n: number) => String(n).padStart(2, '0');

      if (type === 'possiveis') {
        displayDate = d ? `Solicitado em ${pad(d.getDate())}/${pad(d.getMonth() + 1)}` : '';
      } else if (type === 'hoje') {
        displayDate = `Hoje às ${item.time || ''}`;
      } else if (type === 'agendados') {
        displayDate = d ? `${pad(d.getDate())}/${pad(d.getMonth() + 1)} às ${item.time || ''}` : (item.time || '');
      } else if (type === 'recusados') {
        displayDate = d ? `Recusado em ${pad(d.getDate())}/${pad(d.getMonth() + 1)}` : '';
      }

      return {
        client: item.client,
        service: item.service,
        date: displayDate,
        price: item.price,
        status: type === 'possiveis' ? 'pending' : type === 'hoje' ? 'confirmed' : type === 'agendados' ? 'scheduled' : 'rejected',
        statusLabel: type === 'possiveis' ? 'Pendente' : type === 'hoje' ? 'Hoje' : type === 'agendados' ? 'Agendado' : 'Recusado',
        _raw: type === 'possiveis' ? item : null
      };
    };

    return [
      { id: 'possiveis', label: 'Possíveis Atendimentos', color: 'blue', count: data.possiveis?.length || 0, items: (data.possiveis || []).map((i: any) => fmt(i, 'possiveis')) },
      { id: 'hoje', label: 'Atendimentos para Hoje', color: 'green', count: data.hoje?.length || 0, items: (data.hoje || []).map((i: any) => fmt(i, 'hoje')) },
      { id: 'agendados', label: 'Atendimentos Agendados', color: 'purple', count: data.agendados?.length || 0, items: (data.agendados || []).map((i: any) => fmt(i, 'agendados')) },
      { id: 'recusados', label: 'Atendimentos Recusados', color: 'red', count: data.recusados?.length || 0, items: (data.recusados || []).map((i: any) => fmt(i, 'recusados')) },
    ];
  }

  const serviceTopics = buildServiceTopics(controleData);

  return (
    <div className="finance-container">
      <div className="sub-tab-selector">
        <button 
          className={subTab === 'consumidor' ? 'active' : ''} 
          onClick={() => setSubTab('consumidor')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: 8}}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          Consumidor
        </button>
        <button 
          className={subTab === 'prestador' ? 'active' : ''} 
          onClick={() => setSubTab('prestador')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: 8}}><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
          Prestador
        </button>
      </div>

      <div className="finance-content">
        {subTab === 'consumidor' ? (
          <div className="finance-section">
            <div className="finance-card balance">
              <div className="card-header-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1v22m5-18H9a4 4 0 0 0 0 8h6a4 4 0 0 1 0 8H7"/></svg>
              </div>
              <h3>Gastos Totais</h3>
              <p className="amount">R$ 0,00</p>
              <small className="muted">Últimos 30 dias</small>
            </div>
            
            <div className="finance-card">
              <h4>Serviços em Aberto</h4>
              {loadingSolicitacoes ? (
                <p className="muted">Carregando...</p>
              ) : minhasSolicitacoes.length === 0 ? (
                <div className="empty-state-mini">
                  <p>Nenhum serviço sendo executado no momento.</p>
                </div>
              ) : (
                <div className="solicitacoes-list">
                  {[...minhasSolicitacoes].sort((a, b) => (a.statusServico || 3) - (b.statusServico || 3)).map((s: any) => {
                    const statusMap: Record<number, { label: string; cls: string }> = {
                      1: { label: 'Pendente', cls: 'pendente' },
                      2: { label: 'Aceito', cls: 'aceito' },
                      3: { label: 'Recusado', cls: 'recusado' },
                    };
                    const st = statusMap[s.statusServico] || { label: 'Desconhecido', cls: '' };
                    return (
                      <div key={s.id} className="solicitacao-item">
                        <div className="solicitacao-info">
                          <span className="solicitacao-service">{s.service}</span>
                          <span className="solicitacao-prestador">{s.prestador}</span>
                          <span className="solicitacao-data">{s.date ? new Date(s.date + 'T12:00:00').toLocaleDateString('pt-BR') : ''} {s.time ? `às ${s.time}` : ''}</span>
                          <span className="solicitacao-price">{s.price}</span>
                        </div>
                        <span className={`solicitacao-status ${st.cls}`}>{st.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="finance-card history">
              <h4>Histórico de Contratações</h4>
              <div className="transaction-list">
                <p className="muted text-center" style={{padding: '20px 0'}}>Nenhuma contratação realizada ainda.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="finance-section">
            <div className="finance-header-with-filter">
              <h3 className="section-title">Controle de Ganhos</h3>
              <select 
                className="period-select" 
                value={period} 
                onChange={(e) => setPeriod(e.target.value)}
              >
                <option value="1">Último mês</option>
                <option value="3">Últimos 3 meses</option>
                <option value="12">Últimos 12 meses</option>
              </select>
            </div>

            <div className="finance-cards-row">
              <div className="finance-card mini-stats">
                <div className="card-header-icon blue">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1v22m5-18H9a4 4 0 0 0 0 8h6a4 4 0 0 1 0 8H7"/></svg>
                </div>
                <h3>Ganhos Totais</h3>
                <p className="amount-sm">R$ 0,00</p>
              </div>

              <div className="finance-card mini-stats">
                <div className="card-header-icon orange">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/></svg>
                </div>
                <h3>Serviços Agendados</h3>
                <p className="amount-sm">{serviceTopics.find(t => t.id === 'agendados')?.count || 0}</p>
              </div>

              <div className="finance-card mini-stats">
                <div className="card-header-icon green">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1v22m5-18H9a4 4 0 0 0 0 8h6a4 4 0 0 1 0 8H7"/></svg>
                </div>
                <h3>Saldos a Receber</h3>
                <p className="amount-sm green">
                  {(() => {
                    const items = [...(controleData?.hoje || []), ...(controleData?.agendados || [])];
                    const total = items.reduce((acc: number, i: any) => {
                      if (!i.price) return acc;
                      const cleaned = String(i.price).replace(/^R\$\s*/, '').replace(/\./g, '').replace(',', '.');
                      const val = parseFloat(cleaned);
                      return acc + (isNaN(val) ? 0 : val);
                    }, 0);
                    return total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                  })()}
                </p>
              </div>
            </div>

            {/* Controle de Serviços Collapsible Card */}
            <div className="services-control-card">
              <div 
                className="services-control-header"
                onClick={() => setServicesExpanded(!servicesExpanded)}
              >
                <div className="services-header-title">
                  <div className="services-icon-wrapper">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </div>
                  <h3>Controle de Serviços</h3>
                </div>
                <div className="services-header-right">
                  <span className="total-badge">
                    {serviceTopics.reduce((acc, t) => acc + t.count, 0)} no total
                  </span>
                  <svg 
                    className={`chevron-icon ${servicesExpanded ? 'expanded' : ''}`} 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>

              {servicesExpanded && (
                <div className="services-control-content">
                  {loadingControle ? (
                    <div style={{padding: '20px', textAlign: 'center', color: 'var(--muted)'}}>Carregando...</div>
                  ) : serviceTopics.length === 0 ? (
                    <div style={{padding: '20px', textAlign: 'center', color: 'var(--muted)'}}>Nenhum serviço encontrado.</div>
                  ) : (
                  <div className="services-topics-list">
                    {serviceTopics.map((topic) => (
                      <React.Fragment key={topic.id}>
                        <div 
                          className={`service-topic-item ${activeTopic === topic.id ? 'active' : ''}`}
                          onClick={() => setActiveTopic(activeTopic === topic.id ? null : topic.id)}
                        >
                          <div className="topic-left">
                            <span className={`topic-bullet ${topic.color}`}></span>
                            <span className="topic-name">{topic.label}</span>
                          </div>
                          <div className="topic-right">
                            <span className={`topic-badge ${topic.color}`}>{topic.count}</span>
                            <svg 
                              style={{ 
                                transition: 'transform 0.2s', 
                                transform: activeTopic === topic.id ? 'rotate(180deg)' : 'none',
                                color: 'var(--muted)'
                              }} 
                              width="16" 
                              height="16" 
                              viewBox="0 0 24 24" 
                              fill="none" 
                              stroke="currentColor" 
                              strokeWidth="2" 
                              strokeLinecap="round" 
                              strokeLinejoin="round"
                            >
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          </div>
                        </div>

                        {activeTopic === topic.id && (
                          <div className="topic-details-panel">
                            <span className="details-panel-header">Lista de {topic.label}</span>
                            <div className="detail-items-list">
                              {topic.items.map((item: any, index: number) => (
                                <div
                                  key={index}
                                  className={'detail-item-card' + (topic.id === 'possiveis' ? ' clickable' : '')}
                                  onClick={() => topic.id === 'possiveis' && item._raw && setSelectedPossivel(item._raw)}
                                >
                                  <div className="detail-item-info">
                                    <span className="detail-item-client">{item.client}</span>
                                    <span className="detail-item-service">{item.service}</span>
                                    <span className="detail-item-date">{item.date}</span>
                                  </div>
                                  <div className="detail-item-meta">
                                    <span className="detail-item-price">{item.price}</span>
                                    <span className={`detail-item-status ${item.status}`}>
                                      {item.statusLabel}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal de detalhes do possível atendimento */}
            {selectedPossivel && (
              <div className="possivel-modal-overlay" onClick={() => setSelectedPossivel(null)}>
                <div className="possivel-modal" onClick={e => e.stopPropagation()}>
                  <button className="possivel-modal-close" onClick={() => setSelectedPossivel(null)}>&times;</button>
                  <h3>Detalhes do Pedido</h3>

                  <div className="possivel-modal-section">
                    <h4>Cliente</h4>
                    <p><strong>Nome:</strong> {selectedPossivel.client}</p>
                    {selectedPossivel.clientAge != null && <p><strong>Idade:</strong> {selectedPossivel.clientAge} anos</p>}
                    {selectedPossivel.clientCity && <p><strong>Cidade:</strong> {selectedPossivel.clientCity}</p>}
                    <p>
                      <strong>Credibilidade:</strong>{' '}
                      <span className={'cred-badge ' + (selectedPossivel.clientCred === 'Verificado' ? 'verified' : selectedPossivel.clientCred === 'Alta' ? 'alta' : 'media')}>
                        {selectedPossivel.clientCred || 'N/A'}
                      </span>
                    </p>
                  </div>

                  <div className="possivel-modal-section">
                    <h4>Serviço</h4>
                    <p><strong>Serviço:</strong> {selectedPossivel.service}</p>
                    <p><strong>Data:</strong> {selectedPossivel.date ? new Date(selectedPossivel.date + 'T12:00:00').toLocaleDateString('pt-BR') : '-'}</p>
                    <p><strong>Horário:</strong> {selectedPossivel.time || '-'}</p>
                    <p><strong>Preço:</strong> {selectedPossivel.price}</p>
                  </div>

                  <div className="possivel-modal-actions">
                    <button
                      className="acao-btn aceitar"
                      disabled={acaoLoading}
                      onClick={async () => {
                        setAcaoLoading(true);
                        try {
                          await fetch(`/api/appointments/${selectedPossivel.id}/status-servico`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ statusServico: 2 })
                          });
                          setSelectedPossivel(null);
                          fetchControle();
                          setCalendarRefreshKey(k => k + 1);
                        } catch (err) {
                          console.error(err);
                        } finally {
                          setAcaoLoading(false);
                        }
                      }}
                    >
                      {acaoLoading ? 'Aguarde...' : 'Aceitar'}
                    </button>
                    <button
                      className="acao-btn recusar"
                      disabled={acaoLoading}
                      onClick={async () => {
                        setAcaoLoading(true);
                        try {
                          await fetch(`/api/appointments/${selectedPossivel.id}/status-servico`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ statusServico: 3 })
                          });
                          setSelectedPossivel(null);
                          fetchControle();
                          setCalendarRefreshKey(k => k + 1);
                        } catch (err) {
                          console.error(err);
                        } finally {
                          setAcaoLoading(false);
                        }
                      }}
                    >
                      {acaoLoading ? 'Aguarde...' : 'Recusar'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="finance-card history">
              <h4>Histórico de Atividades</h4>
              <div className="transaction-list">
                <p className="muted text-center" style={{padding: '20px 0'}}>Nenhuma atividade registrada no período selecionado.</p>
              </div>
            </div>

            {/* Calendário de Agenda */}
            <ServiceCalendar refreshKey={calendarRefreshKey} />
          </div>
        )}
      </div>
    </div>
  );
}


