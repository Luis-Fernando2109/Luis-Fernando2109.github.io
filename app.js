// DADOS SIMULADOS (MOCK) PARA TESTE IMEDIATO NO NAVEGADOR
let usuarioAtual = null; // { nome, papel }

const eventosMock = [
  { id: '1', dia: 3, titulo: '07:30 Matemática', tipo: 'aula' },
  { id: '2', dia: 4, titulo: '10:00 Português', tipo: 'aula' },
  { id: '3', dia: 12, titulo: '07:30 Prova de Matemática', tipo: 'prova' },
  { id: '4', dia: 14, titulo: '08:00 Feira de Ciências', tipo: 'atividade' },
  { id: '5', dia: 18, titulo: '10:00 Prova de Português', tipo: 'prova' },
  { id: '6', dia: 20, titulo: 'Feriado Municipal', tipo: 'feriado' },
  { id: '7', dia: 25, titulo: '⚡ AULA VAGA: História', tipo: 'vaga' } // Aula livre para professor pegar
];

// ELEMANTOS DOM
const loginScreen = document.getElementById('login-screen');
const appScreen = document.getElementById('app');
const formLogin = document.getElementById('form-login');
const userRoleBadge = document.getElementById('user-role-badge');
const userNameDisplay = document.getElementById('user-name-display');
const btnLogout = document.getElementById('btn-logout');
const calendarBody = document.getElementById('calendar-body');

// 1. INICIALIZAÇÃO E LOGIN
formLogin.addEventListener('submit', (e) => {
  e.preventDefault();
  const nome = document.getElementById('login-nome').value;
  const papel = document.getElementById('login-papel').value;

  usuarioAtual = { nome, papel };

  // Atualizar Interface
  userNameDisplay.textContent = nome;
  userRoleBadge.textContent = papel;
  
  loginScreen.classList.add('hidden');
  appScreen.classList.remove('hidden');

  configurarPermissoesPorPapel(papel);
  renderizarCalendario();
});

btnLogout.addEventListener('click', () => {
  usuarioAtual = null;
  appScreen.classList.add('hidden');
  loginScreen.classList.remove('hidden');
});

// 2. REGRAS DE NEGÓCIO E PERMISSÕES (O ponto alto para explicar ao professor)
function configurarPermissoesPorPapel(papel) {
  // Esconde todas as ações por padrão
  document.querySelectorAll('.actions-group button').forEach(btn => btn.classList.add('hidden'));

  if (papel === 'aluno') {
    document.getElementById('btn-feedback').classList.remove('hidden');
  } 
  else if (papel === 'professor') {
    document.getElementById('btn-novo-evento').classList.remove('hidden');
    document.getElementById('btn-pegar-aula').classList.remove('hidden');
  } 
  else if (papel === 'gestor') {
    document.getElementById('btn-novo-evento').classList.remove('hidden');
    document.getElementById('btn-aprovar-trocas').classList.remove('hidden');
    document.getElementById('btn-bloquear-horario').classList.remove('hidden');
  } 
  else if (papel === 'admin') {
    document.getElementById('btn-novo-evento').classList.remove('hidden');
    document.getElementById('btn-aprovar-trocas').classList.remove('hidden');
    document.getElementById('btn-admin-aviso').classList.remove('hidden');
    document.getElementById('btn-feedback').classList.remove('hidden');
  }
}

// 3. RENDERIZAÇÃO DO CALENDÁRIO (Agosto 2026 - 31 Dias)
function renderizarCalendario() {
  calendarBody.innerHTML = '';

  // Espaços vazios antes do dia 1 (Agosto 2026 começa no Sábado)
  for (let i = 0; i < 6; i++) {
    const emptyCell = document.createElement('div');
    emptyCell.className = 'day-cell empty';
    emptyCell.style.opacity = '0.3';
    calendarBody.appendChild(emptyCell);
  }

  // Dias de 1 a 31
  for (let dia = 1; dia <= 31; dia++) {
    const dayCell = document.createElement('div');
    dayCell.className = `day-cell ${dia === 31 ? 'current-day' : ''}`;
    
    dayCell.innerHTML = `<div class="day-number">${dia}</div>`;

    // Filtra e adiciona os eventos daquele dia
    const eventosDoDia = eventosMock.filter(e => e.dia === dia);
    eventosDoDia.forEach(evt => {
      const evtDiv = document.createElement('div');
      evtDiv.className = `event-item event-${evt.tipo}`;
      evtDiv.textContent = evt.titulo;
      
      // Clique no evento para ação de troca (Caso seja aula vaga)
      evtDiv.onclick = () => interagirComEvento(evt);

      dayCell.appendChild(evtDiv);
    });

    calendarBody.appendChild(dayCell);
  }
}

// 4. MODAL E AÇÕES
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
document.getElementById('modal-close').onclick = () => modal.classList.add('hidden');

function abrirModal(titulo, htmlConteudo) {
  modalTitle.textContent = titulo;
  modalBody.innerHTML = htmlConteudo;
  modal.classList.remove('hidden');
}

// Ação: Professor quer pegar aula vaga
document.getElementById('btn-pegar-aula')?.addEventListener('click', () => {
  abrirModal('Solicitar Aula Vaga', `
    <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">
      Selecione uma aula marcada como vaga para solicitar substituição à coordenação.
    </p>
    <label>Aula Disponível</label>
    <select id="select-aula-vaga">
      <option>Dia 25 - 13:00 História (2º Ano A)</option>
    </select>
    <button class="btn btn-primary" onclick="confirmarSolicitacaoTroca()">Enviar Solicitação para Gestor</button>
  `);
});

// Ação: Aluno reportando problema
document.getElementById('btn-feedback')?.addEventListener('click', () => {
  abrirModal('Reportar Problema / Sugestão', `
    <label>Tipo de Relato</label>
    <select>
      <option value="problema">Problema no Horário/Horário Incorreto</option>
      <option value="sugestao">Sugestão para o Sistema</option>
    </select>
    <label>Descrição</label>
    <textarea rows="4" placeholder="Explique detalhadamente o imprevisto..."></textarea>
    <button class="btn btn-primary" onclick="alert('Relato enviado com sucesso aos admins!'); modal.classList.add('hidden');">Enviar Feedback</button>
  `);
});

// Ação: Gestor bloqueando quadra / evento geral
document.getElementById('btn-bloquear-horario')?.addEventListener('click', () => {
  abrirModal('Bloquear Horário (Atividade Especial)', `
    <label>Local / Motivo</label>
    <input type="text" placeholder="Ex: Apresentação na Quadra" />
    <label>Horários Afetados</label>
    <input type="text" placeholder="Ex: 5º e 6º Horário" />
    <button class="btn btn-primary" onclick="alert('Aviso enviado e turmas notificadas!'); modal.classList.add('hidden');">Notificar Todos e Bloquear</button>
  `);
});

function confirmarSolicitacaoTroca() {
  alert('Solicitação enviada com sucesso! A coordenação (Gestor) irá avaliar e confirmar a troca.');
  modal.classList.add('hidden');
}

function interagirComEvento(evt) {
  if (evt.tipo === 'vaga' && usuarioAtual.papel === 'professor') {
    if (confirm(`Deseja solicitar o preenchimento da aula vaga: "${evt.titulo}"?`)) {
      alert('Solicitação encaminhada ao Gestor!');
    }
  } else {
    alert(`Evento: ${evt.titulo}`);
  }
}