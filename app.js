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
  planCatalog: [
    {
      name: "Express",
      price: "R$ 79/mês",
      benefits: ["2 lavagens express", "Lembretes automáticos", "10% OFF em adicionais"],
      trend: 86,
    },
    {
      name: "Premium",
      price: "R$ 129/mês",
      benefits: ["4 lavagens premium", "Vaga prioritária", "Aplicação de cera trimestral"],
      trend: 54,
    },
    {
      name: "Black",
      price: "R$ 199/mês",
      benefits: ["6 lavações completas", "Busca e entrega", "Relatório fotográfico"],
      trend: 27,
    },
  ],
  tips: [
    "Mantenha o veículo coberto para preservar o brilho por mais tempo.",
    "Use produtos neutros para limpar o painel e evitar manchas.",
    "Faça aspiração quinzenal para reduzir desgaste do estofado.",
    "Aplique protetor UV nos plásticos para evitar ressecamento.",
  ],
  customers: [
    {
      cpf: "12345678901",
      password: "123",
      name: "Marcos Lopes",
      vehicle: { plate: "QWE-9876", model: "SUV Volvo XC40" },
      plans: [
        { name: "Premium", price: "R$ 129/mês", renewDate: "20/07", status: "Ativo" },
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
      ],
      payments: [
        { date: "10/07", service: "Lavagem premium", value: 129.9, status: "Pago" },
        { date: "02/07", service: "Plano Premium", value: 129.9, status: "Pago" },
      ],
    },
    {
      cpf: "98765432100",
      password: "456",
      name: "Juliana Reis",
      vehicle: { plate: "HJK-5521", model: "Sedã Toyota Corolla" },
      plans: [
        { name: "Express", price: "R$ 79/mês", renewDate: "12/07", status: "Ativo" },
      ],
      bookings: [
        {
          name: "Juliana Reis",
          plate: "HJK-5521",
          service: "Higienização + ozônio",
          payment: "Pix",
          date: todayISO,
          time: "14:00",
        },
      ],
      payments: [
        { date: "08/07", service: "Higienização + ozônio", value: 189.9, status: "Pendente" },
        { date: "08/06", service: "Plano Express", value: 79.9, status: "Pago" },
      ],
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

let loggedCustomer = null;

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

function sanitizeCpf(value) {
  return value.replace(/\D/g, "");
}

function maskCpf(value) {
  if (!value) return "";
  const digits = sanitizeCpf(value);
  if (digits.length !== 11) {
    return value;
  }
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
}

function getAllBookings() {
  return clientState.customers.flatMap((customer) => customer.bookings);
}

function getNextBooking(customer) {
  if (!customer || !customer.bookings.length) return null;
  const upcoming = [...customer.bookings].sort((a, b) => {
    if (a.date === b.date) {
      return a.time.localeCompare(b.time);
    }
    return a.date.localeCompare(b.date);
  });
  const nowISO = today.toISOString().split("T")[0];
  return (
    upcoming.find((booking) => booking.date >= nowISO) ||
    upcoming[0]
  );
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
  const activePlansList = document.querySelector("#activePlansList");
  const activePlansCard = document.querySelector("#activePlansCard");
  const activePlansEl = document.querySelector("#activePlans");
  const todayBookingsEl = document.querySelector("#todayBookings");
  const loginForm = document.querySelector("#loginForm");
  const loginCard = document.querySelector("#loginCard");
  const profileCard = document.querySelector("#profileCard");
  const profileName = document.querySelector("#profileName");
  const profileCpf = document.querySelector("#profileCpf");
  const profilePlans = document.querySelector("#profilePlans");
  const profileNextBooking = document.querySelector("#profileNextBooking");
  const logoutButton = document.querySelector("#logoutButton");
  const bookingNameInput = document.querySelector("#bookingName");
  const bookingPlateInput = document.querySelector("#bookingPlate");

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

  function toggleBookingForm(isLocked) {
    if (!bookingForm) return;
    bookingForm.classList.toggle("is-locked", isLocked);
    bookingForm.querySelectorAll("input, select, button").forEach((element) => {
      if (element.id === "bookingName") {
        element.readOnly = !!loggedCustomer;
      }
      if (element.id === "bookingPlate") {
        element.readOnly = false;
      }
      element.disabled = isLocked && element.type !== "hidden";
    });
  }

  function renderPlans() {
    plansGrid.innerHTML = "";
    clientState.planCatalog.forEach((plan) => {
      const card = document.createElement("article");
      card.className = "plan-card";
      const isActive = loggedCustomer?.plans.some((userPlan) => userPlan.name === plan.name);
      card.innerHTML = `
        <h3>${plan.name}</h3>
        <p class="plan-card__price">${plan.price}</p>
        <ul>
          ${plan.benefits.map((benefit) => `<li>${benefit}</li>`).join("")}
        </ul>
        <button type="button" data-plan="${plan.name}" ${isActive ? "disabled" : ""}>
          ${isActive ? "Plano ativo" : "Assinar plano"}
        </button>
        <small class="plan-card__active">${plan.trend} clientes ativos</small>
      `;
      plansGrid.appendChild(card);
    });
    plansGrid
      .querySelectorAll("button[data-plan]")
      .forEach((button) => button.classList.toggle("is-disabled", !loggedCustomer));
  }

  function renderAvailability(date) {
    availabilityList.innerHTML = "";
    const bookings = getAllBookings();
    clientState.timeSlots.forEach((slot) => {
      const key = `${date}|${slot}`;
      const isBooked = bookings.some((booking) => booking.date === date && booking.time === slot);
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
    const bookings = getAllBookings();
    clientState.timeSlots.forEach((slot) => {
      const isBooked = bookings.some((booking) => booking.date === date && booking.time === slot);
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
    if (!loggedCustomer) {
      const li = document.createElement("li");
      li.className = "empty-state";
      li.textContent = "Faça login para visualizar seus agendamentos.";
      bookingList.appendChild(li);
      return;
    }

    if (!loggedCustomer.bookings.length) {
      const li = document.createElement("li");
      li.className = "empty-state";
      li.textContent = "Nenhum agendamento cadastrado ainda.";
      bookingList.appendChild(li);
      return;
    }

    [...loggedCustomer.bookings]
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
            <span>${booking.plate}</span>
            <span>${toDisplayDate(booking.date)} às ${booking.time}</span>
          </div>
        `;
        bookingList.appendChild(li);
      });
  }

  function renderPayments() {
    paymentsTable.innerHTML = "";
    if (!loggedCustomer) {
      const tr = document.createElement("tr");
      tr.className = "empty-row";
      tr.innerHTML = '<td colspan="4">Faça login para visualizar seu histórico.</td>';
      paymentsTable.appendChild(tr);
      return;
    }

    if (!loggedCustomer.payments.length) {
      const tr = document.createElement("tr");
      tr.className = "empty-row";
      tr.innerHTML = '<td colspan="4">Nenhum pagamento registrado até o momento.</td>';
      paymentsTable.appendChild(tr);
      return;
    }

    loggedCustomer.payments.forEach((payment) => {
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

  function renderActivePlans() {
    if (!activePlansList || !activePlansCard) return;
    activePlansList.innerHTML = "";
    if (!loggedCustomer) {
      activePlansList.innerHTML = '<li class="empty-state">Faça login para acompanhar seus planos.</li>';
      activePlansCard.classList.add("is-muted");
      return;
    }
    activePlansCard.classList.remove("is-muted");

    if (!loggedCustomer.plans.length) {
      activePlansList.innerHTML = '<li class="empty-state">Nenhum plano ativo no momento.</li>';
      return;
    }

    loggedCustomer.plans.forEach((plan) => {
      const li = document.createElement("li");
      li.className = "active-plan";
      li.innerHTML = `
        <div>
          <strong>${plan.name}</strong>
          <span>${plan.price}</span>
        </div>
        <div class="active-plan__meta">
          <span class="badge badge--available">${plan.status}</span>
          <span>Renova em ${plan.renewDate}</span>
        </div>
      `;
      activePlansList.appendChild(li);
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
    activePlansEl.textContent = loggedCustomer?.plans.length ?? 0;
    if (!loggedCustomer) {
      todayBookingsEl.textContent = "0";
      return;
    }
    const todays = loggedCustomer.bookings.filter((booking) => booking.date === todayISO).length;
    todayBookingsEl.textContent = todays;
  }

  function updateProfile() {
    if (
      !profileCard ||
      !profileName ||
      !profileCpf ||
      !profilePlans ||
      !profileNextBooking ||
      !loggedCustomer
    ) {
      return;
    }
    profileName.textContent = loggedCustomer.name;
    profileCpf.textContent = maskCpf(loggedCustomer.cpf);
    profilePlans.textContent = loggedCustomer.plans.length;
    const nextBooking = getNextBooking(loggedCustomer);
    if (nextBooking) {
      profileNextBooking.textContent = `${toDisplayDate(nextBooking.date)} às ${nextBooking.time}`;
    } else {
      profileNextBooking.textContent = "Sem agendamentos";
    }
    if (bookingNameInput) bookingNameInput.value = loggedCustomer.name;
    if (bookingPlateInput) bookingPlateInput.value = loggedCustomer.vehicle?.plate ?? "";
  }

  function resetProfile() {
    if (!profileCard) return;
    profileName.textContent = "";
    profileCpf.textContent = "";
    profilePlans.textContent = "0";
    profileNextBooking.textContent = "Sem agendamentos";
    if (bookingForm) bookingForm.reset();
    if (bookingDateInput) {
      bookingDateInput.value = todayISO;
      renderTimeOptions(todayISO);
    }
  }

  function requireAuthentication(message) {
    if (loggedCustomer) return false;
    showToast(message);
    return true;
  }

  bookingForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (requireAuthentication("Faça login para criar um agendamento.")) {
      return;
    }
    const formData = new FormData(bookingForm);
    const data = Object.fromEntries(formData.entries());
    const key = `${data.date}|${data.time}`;

    if (!data.time) {
      showToast("Selecione um horário disponível");
      return;
    }

    const bookings = getAllBookings();
    if (bookings.some((b) => b.date === data.date && b.time === data.time)) {
      showToast("Este horário já foi reservado");
      return;
    }

    const booking = {
      name: loggedCustomer.name,
      plate: data.plate.trim().toUpperCase(),
      service: data.service,
      payment: data.payment,
      date: data.date,
      time: data.time,
    };

    loggedCustomer.bookings.push(booking);
    bookingForm.reset();
    bookingDateInput.value = data.date;
    renderAvailability(data.date);
    renderTimeOptions(data.date);
    renderBookings();
    updateMetrics();
    updateProfile();
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
    if (requireAuthentication("Faça login para gerenciar seus planos.")) {
      return;
    }
    const planName = button.dataset.plan;
    if (loggedCustomer.plans.some((plan) => plan.name === planName)) {
      showToast("Plano já está ativo para este cliente");
      return;
    }
    const catalogPlan = clientState.planCatalog.find((plan) => plan.name === planName);
    if (!catalogPlan) return;
    const renewalDate = new Date();
    renewalDate.setMonth(renewalDate.getMonth() + 1);
    const renewDate = renewalDate
      .toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      })
      .split("/")
      .slice(0, 2)
      .join("/");
    loggedCustomer.plans.push({
      name: catalogPlan.name,
      price: catalogPlan.price,
      renewDate,
      status: "Ativo",
    });
    renderPlans();
    renderActivePlans();
    updateMetrics();
    updateProfile();
    showToast(`Plano ${planName} ativado com sucesso!`);
  });

  loginForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(loginForm);
    const cpf = sanitizeCpf(formData.get("cpf") || "");
    const password = (formData.get("password") || "").trim();
    const customer = clientState.customers.find(
      (item) => item.cpf === cpf && item.password === password
    );
    if (!customer) {
      showToast("CPF ou senha inválidos. Tente novamente.");
      return;
    }
    loggedCustomer = customer;
    if (loginCard) loginCard.hidden = true;
    if (profileCard) profileCard.hidden = false;
    toggleBookingForm(false);
    renderBookings();
    renderPayments();
    renderPlans();
    renderActivePlans();
    updateMetrics();
    updateProfile();
    renderAvailability(bookingDateInput.value);
    showToast(`Bem-vindo(a), ${customer.name.split(" ")[0]}!`);
  });

  logoutButton?.addEventListener("click", () => {
    loggedCustomer = null;
    if (profileCard) profileCard.hidden = true;
    if (loginCard) loginCard.hidden = false;
    toggleBookingForm(true);
    resetProfile();
    renderBookings();
    renderPayments();
    renderPlans();
    renderActivePlans();
    updateMetrics();
    renderAvailability(bookingDateInput.value);
    showToast("Sessão encerrada com sucesso.");
  });

  toggleBookingForm(true);
  renderServices();
  renderPlans();
  renderAvailability(todayISO);
  renderTimeOptions(todayISO);
  renderBookings();
  renderPayments();
  renderActivePlans();
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
