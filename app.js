const page = document.body?.dataset.page;

const today = new Date();
const todayISO = today.toISOString().split("T")[0];

const clientState = {
  timeSlots: ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"],
  services: [
    {
      name: "Lavagem express",
      description: "Exterior completo com acabamento em microfibra e proteção rápida.",
      icon: "🚘",
      duration: "45 min",
    },
    {
      name: "Lavagem premium",
      description: "Interior detalhado, hidratação de plásticos e enceramento cristal.",
      icon: "✨",
      duration: "90 min",
    },
    {
      name: "Higienização + ozônio",
      description: "Remoção de odores, tratamento antibacteriano e purificação de ar.",
      icon: "🌀",
      duration: "120 min",
    },
    {
      name: "Proteção cerâmica",
      description: "Blindagem avançada da pintura com garantia de 12 meses.",
      icon: "🛡️",
      duration: "180 min",
    },
  ],
  plans: [
    {
      name: "Express",
      price: "R$ 79/mês",
      benefits: ["2 lavagens express", "Lembretes automáticos", "10% OFF em adicionais"],
      active: 86,
    },
    {
      name: "Premium",
      price: "R$ 129/mês",
      benefits: ["4 lavagens premium", "Vaga prioritária", "Aplicação de cera trimestral"],
      active: 54,
    },
    {
      name: "Black",
      price: "R$ 199/mês",
      benefits: ["6 lavações completas", "Busca e entrega", "Relatório fotográfico"],
      active: 27,
    },
  ],
  payments: [
    { date: "10/07", service: "Lavagem premium", value: 129.9, status: "Pago" },
    { date: "08/07", service: "Higienização + ozônio", value: 189.9, status: "Pendente" },
    { date: "06/07", service: "Proteção cerâmica", value: 449.9, status: "Pago" },
  ],
  tips: [
    "Mantenha o veículo coberto para preservar o brilho por mais tempo.",
    "Use produtos neutros para limpar o painel e evitar manchas.",
    "Faça aspiração quinzenal para reduzir desgaste do estofado.",
    "Aplique protetor UV nos plásticos para evitar ressecamento.",
  ],
  bookings: [
    {
      name: "Marcos Lopes",
      plate: "QWE-9876",
      service: "Lavagem premium",
      payment: "Cartão",
      date: todayISO,
      time: "09:00",
    },
    {
      name: "Juliana Reis",
      plate: "HJK-5521",
      service: "Higienização + ozônio",
      payment: "Pix",
      date: todayISO,
      time: "14:00",
    },
  ],
};

const teamState = {
  metrics: [
    { label: "Serviços finalizados", value: 8, detail: "+2 vs ontem" },
    { label: "Em execução", value: 3, detail: "Equipe completa" },
    { label: "Pendências", value: 2, detail: "Pagamentos aguardando" },
  ],
  tasks: [
    {
      id: 1,
      title: "SUV - Lavagem premium",
      time: "08:00",
      responsible: "Ana",
      status: "Em andamento",
    },
    {
      id: 2,
      title: "Sedã - Proteção cerâmica",
      time: "10:30",
      responsible: "Carlos",
      status: "Aguardando",
    },
    {
      id: 3,
      title: "Pickup - Higienização",
      time: "14:30",
      responsible: "João",
      status: "Planejado",
    },
  ],
  payments: [
    {
      id: 1,
      client: "Marcos Lopes",
      service: "Lavagem premium",
      value: 129.9,
      status: "Pendente",
    },
    {
      id: 2,
      client: "Juliana Reis",
      service: "Higienização + ozônio",
      value: 189.9,
      status: "Aguardando",
    },
  ],
  inventory: [
    { id: 1, item: "Shampoo automotivo", quantity: "12 un.", status: "OK" },
    { id: 2, item: "Panos microfibra", quantity: "22 un.", status: "Reposição" },
    { id: 3, item: "Cera líquida", quantity: "5 un.", status: "Crítico" },
  ],
  notes: [
    { message: "Reunião rápida às 11h para revisar metas da semana.", author: "Supervisão" },
    { message: "Registrar fotos do antes/depois no app interno.", author: "Qualidade" },
  ],
};

const reservations = new Map();
const planSubscriptions = new Set();
let extraPlanCount = 0;

function showToast(message) {
  const toast = document.querySelector("#toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(showToast.timeoutId);
  showToast.timeoutId = setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2800);
}

function formatCurrency(value) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function toDisplayDate(value) {
  const [year, month, day] = value.split("-");
  return `${day}/${month}`;
}

function initCliente() {
  const availabilityList = document.querySelector("#availabilityList");
  const bookingForm = document.querySelector("#bookingForm");
  const bookingTimeSelect = document.querySelector("#bookingTime");
  const bookingServiceSelect = document.querySelector("#bookingService");
  const bookingDateInput = document.querySelector("#bookingDate");
  const bookingList = document.querySelector("#bookingList");
  const paymentsTable = document.querySelector("#customerPayments tbody");
  const tipsList = document.querySelector("#tipsList");
  const servicesGrid = document.querySelector("#servicesGrid");
  const plansGrid = document.querySelector("#plansGrid");
  const activePlansEl = document.querySelector("#activePlans");
  const todayBookingsEl = document.querySelector("#todayBookings");

  if (!availabilityList) return;

  bookingDateInput.min = todayISO;
  bookingDateInput.value = todayISO;

  clientState.services.forEach((service) => {
    const option = document.createElement("option");
    option.value = service.name;
    option.textContent = `${service.name} • ${service.duration}`;
    bookingServiceSelect.appendChild(option);
  });

  function renderServices() {
    servicesGrid.innerHTML = "";
    clientState.services.forEach((service) => {
      const card = document.createElement("article");
      card.className = "service-card";
      card.innerHTML = `
        <div class="service-card__icon">${service.icon}</div>
        <strong>${service.name}</strong>
        <span>${service.description}</span>
        <small class="service-card__duration">Duração média: ${service.duration}</small>
      `;
      servicesGrid.appendChild(card);
    });
  }

  function renderPlans() {
    plansGrid.innerHTML = "";
    clientState.plans.forEach((plan) => {
      const card = document.createElement("article");
      card.className = "plan-card";
      card.innerHTML = `
        <h3>${plan.name}</h3>
        <p class="plan-card__price">${plan.price}</p>
        <ul>
          ${plan.benefits.map((benefit) => `<li>${benefit}</li>`).join("")}
        </ul>
        <button type="button" data-plan="${plan.name}">Assinar plano</button>
        <small class="plan-card__active">${plan.active} clientes ativos</small>
      `;
      plansGrid.appendChild(card);
    });
  }

  function renderAvailability(date) {
    availabilityList.innerHTML = "";
    clientState.timeSlots.forEach((slot) => {
      const key = `${date}|${slot}`;
      const isBooked =
        reservations.has(key) ||
        clientState.bookings.some((booking) => booking.date === date && booking.time === slot);
      const li = document.createElement("li");
      li.innerHTML = `
        <span>${slot}</span>
        <span class="badge ${isBooked ? "badge--danger" : "badge--available"}">
          ${isBooked ? "Reservado" : "Disponível"}
        </span>
      `;
      availabilityList.appendChild(li);
    });
  }

  function renderTimeOptions(date) {
    bookingTimeSelect.innerHTML = '<option value="">Selecione</option>';
    clientState.timeSlots.forEach((slot) => {
      const key = `${date}|${slot}`;
      const isBooked =
        reservations.has(key) ||
        clientState.bookings.some((booking) => booking.date === date && booking.time === slot);
      const option = document.createElement("option");
      option.value = slot;
      option.textContent = slot;
      if (isBooked) {
        option.disabled = true;
      }
      bookingTimeSelect.appendChild(option);
    });
  }

  function renderBookings() {
    bookingList.innerHTML = "";
    const allBookings = [...clientState.bookings];
    reservations.forEach((booking) => {
      allBookings.push(booking);
    });
    allBookings
      .sort((a, b) => {
        if (a.date === b.date) {
          return a.time.localeCompare(b.time);
        }
        return a.date.localeCompare(b.date);
      })
      .forEach((booking) => {
        const li = document.createElement("li");
        li.className = "booking-item";
        li.innerHTML = `
          <strong>${booking.service}</strong>
          <div class="booking-item__meta">
            <span>${booking.name} • ${booking.plate}</span>
            <span>${toDisplayDate(booking.date)} às ${booking.time}</span>
          </div>
        `;
        bookingList.appendChild(li);
      });
  }

  function renderPayments() {
    paymentsTable.innerHTML = "";
    clientState.payments.forEach((payment) => {
      const tr = document.createElement("tr");
      const badgeClass =
        payment.status === "Pago"
          ? "badge--available"
          : payment.status === "Pendente"
          ? "badge--pending"
          : "";
      tr.innerHTML = `
        <td>${payment.date}</td>
        <td>${payment.service}</td>
        <td>${formatCurrency(payment.value)}</td>
        <td><span class="badge ${badgeClass}">${payment.status}</span></td>
      `;
      paymentsTable.appendChild(tr);
    });
  }

  function renderTips() {
    tipsList.innerHTML = "";
    clientState.tips.forEach((tip) => {
      const li = document.createElement("li");
      li.textContent = tip;
      tipsList.appendChild(li);
    });
  }

  function updateMetrics() {
    const basePlans = clientState.plans.reduce((acc, plan) => acc + plan.active, 0);
    activePlansEl.textContent = basePlans + extraPlanCount;

    const todays = clientState.bookings.filter((booking) => booking.date === todayISO).length;
    let extraToday = 0;
    reservations.forEach((booking) => {
      if (booking.date === todayISO) {
        extraToday += 1;
      }
    });
    todayBookingsEl.textContent = todays + extraToday;
  }

  bookingForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(bookingForm);
    const data = Object.fromEntries(formData.entries());
    const key = `${data.date}|${data.time}`;

    if (!data.time) {
      showToast("Selecione um horário disponível");
      return;
    }

    if (reservations.has(key) || clientState.bookings.some((b) => b.date === data.date && b.time === data.time)) {
      showToast("Este horário já foi reservado");
      return;
    }

    const booking = {
      name: data.name.trim(),
      plate: data.plate.trim().toUpperCase(),
      service: data.service,
      payment: data.payment,
      date: data.date,
      time: data.time,
    };

    reservations.set(key, booking);
    bookingForm.reset();
    bookingDateInput.value = data.date;
    renderAvailability(data.date);
    renderTimeOptions(data.date);
    renderBookings();
    updateMetrics();
    showToast("Agendamento confirmado!");
  });

  bookingDateInput.addEventListener("change", (event) => {
    const selectedDate = event.target.value;
    renderAvailability(selectedDate);
    renderTimeOptions(selectedDate);
  });

  plansGrid.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-plan]");
    if (!button) return;
    const planName = button.dataset.plan;
    if (planSubscriptions.has(planName)) {
      showToast("Plano já está ativo para este cliente");
      return;
    }
    planSubscriptions.add(planName);
    extraPlanCount += 1;
    updateMetrics();
    showToast(`Plano ${planName} ativado com sucesso!`);
  });

  renderServices();
  renderPlans();
  renderAvailability(todayISO);
  renderTimeOptions(todayISO);
  renderBookings();
  renderPayments();
  renderTips();
  updateMetrics();
}

function initEquipe() {
  const metricsContainer = document.querySelector("#teamMetrics");
  const tasksList = document.querySelector("#tasksList");
  const paymentsTable = document.querySelector("#teamPayments tbody");
  const inventoryTable = document.querySelector("#inventoryTable tbody");
  const notesContainer = document.querySelector("#teamNotes");

  if (!metricsContainer) return;

  function renderMetrics() {
    metricsContainer.innerHTML = "";
    teamState.metrics.forEach((metric) => {
      const tile = document.createElement("article");
      tile.className = "metric-tile";
      tile.innerHTML = `
        <span>${metric.label}</span>
        <strong>${metric.value}</strong>
        <small>${metric.detail}</small>
      `;
      metricsContainer.appendChild(tile);
    });
  }

  function renderTasks() {
    tasksList.innerHTML = "";
    teamState.tasks.forEach((task) => {
      const li = document.createElement("li");
      li.className = "task-item";
      const statusClass =
        task.status === "Concluído"
          ? "badge--available"
          : task.status === "Em andamento"
          ? "badge--pending"
          : "badge--danger";
      li.innerHTML = `
        <div class="task-item__info">
          <strong>${task.title}</strong>
          <span class="task-item__meta">${task.time} • ${task.responsible}</span>
        </div>
        <div class="task-item__actions">
          <span class="badge ${statusClass}">${task.status}</span>
          <button type="button" data-id="${task.id}" ${task.status === "Concluído" ? "disabled" : ""}>
            Concluir
          </button>
        </div>
      `;
      tasksList.appendChild(li);
    });
  }

  function renderPayments() {
    paymentsTable.innerHTML = "";
    teamState.payments.forEach((payment) => {
      const tr = document.createElement("tr");
      const statusClass =
        payment.status === "Confirmado"
          ? "badge--available"
          : payment.status === "Pendente"
          ? "badge--danger"
          : "badge--pending";
      tr.innerHTML = `
        <td>${payment.client}</td>
        <td>${payment.service}</td>
        <td>${formatCurrency(payment.value)}</td>
        <td><span class="badge ${statusClass}">${payment.status}</span></td>
        <td>
          <button type="button" data-id="${payment.id}" ${payment.status === "Confirmado" ? "disabled" : ""}>
            Confirmar
          </button>
        </td>
      `;
      paymentsTable.appendChild(tr);
    });
  }

  function renderInventory() {
    inventoryTable.innerHTML = "";
    teamState.inventory.forEach((item) => {
      const tr = document.createElement("tr");
      const statusClass =
        item.status === "OK"
          ? "badge--available"
          : item.status === "Reposição"
          ? "badge--pending"
          : "badge--danger";
      tr.innerHTML = `
        <td>${item.item}</td>
        <td>${item.quantity}</td>
        <td><span class="badge ${statusClass}">${item.status}</span></td>
        <td>
          <button type="button" data-id="${item.id}">
            Solicitar
          </button>
        </td>
      `;
      inventoryTable.appendChild(tr);
    });
  }

  function renderNotes() {
    notesContainer.innerHTML = "";
    teamState.notes.forEach((note) => {
      const div = document.createElement("div");
      div.className = "bulletin__note";
      div.innerHTML = `
        <span>${note.message}</span>
        <small>${note.author}</small>
      `;
      notesContainer.appendChild(div);
    });
  }

  tasksList.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-id]");
    if (!button) return;
    const taskId = Number(button.dataset.id);
    const task = teamState.tasks.find((item) => item.id === taskId);
    if (!task || task.status === "Concluído") return;
    task.status = "Concluído";
    showToast(`Tarefa ${task.title} concluída!`);
    renderTasks();
  });

  paymentsTable.parentElement.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-id]");
    if (!button) return;
    const paymentId = Number(button.dataset.id);
    const payment = teamState.payments.find((item) => item.id === paymentId);
    if (!payment || payment.status === "Confirmado") return;
    payment.status = "Confirmado";
    showToast(`Pagamento de ${payment.client} confirmado.`);
    renderPayments();
  });

  inventoryTable.parentElement.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-id]");
    if (!button) return;
    const itemId = Number(button.dataset.id);
    const item = teamState.inventory.find((entry) => entry.id === itemId);
    if (!item) return;
    item.status = "Solicitado";
    showToast(`Reforço de ${item.item} solicitado.`);
    renderInventory();
  });

  renderMetrics();
  renderTasks();
  renderPayments();
  renderInventory();
  renderNotes();
}

if (page === "cliente") {
  initCliente();
} else if (page === "equipe") {
  initEquipe();
}
