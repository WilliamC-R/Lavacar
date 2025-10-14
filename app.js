const page = document.body?.dataset.page;

const today = new Date();
const todayISO = today.toISOString().split("T")[0];

const clientState = {
  timeSlots: Array.from({ length: 14 }, (_, index) => `${String(8 + index).padStart(2, "0")}:00`),
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
      password: "1234",
      email: "marcos.lopes@example.com",
      name: "Marcos Lopes",
      vehicle: { plate: "QWE-9876", model: "SUV Volvo XC40" },
      plans: [
        { name: "Premium", price: "R$ 129/mês", renewDate: "20/07", status: "Ativo" },
      ],
      bookings: [],
      payments: [
        { date: "10/07", service: "Lavagem premium", value: 129.9, status: "Pago" },
        { date: "02/07", service: "Plano Premium", value: 129.9, status: "Pago" },
      ],
    },
    {
      cpf: "98765432100",
      password: "4567",
      email: "juliana.reis@example.com",
      name: "Juliana Reis",
      vehicle: { plate: "HJK-5521", model: "Sedã Toyota Corolla" },
      plans: [
        { name: "Express", price: "R$ 79/mês", renewDate: "12/07", status: "Ativo" },
      ],
      bookings: [],
      payments: [
        { date: "08/07", service: "Higienização + ozônio", value: 189.9, status: "Pendente" },
        { date: "08/06", service: "Plano Express", value: 79.9, status: "Pago" },
      ],
    },
  ],
};

const bookingState = {
  selectedSlot: null,
  slots: Array.from({ length: 14 }, (_, index) => ({
    time: `${String(8 + index).padStart(2, "0")}:00`,
    status: "available",
  })),
  items: [],
};

const teamState = {
  appointments: [],
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

const STORAGE_KEYS = {
  customers: "lavacar_customers",
  loggedCpf: "lavacar_logged_cpf",
  loginMessage: "lavacar_login_message",
  bookings: "lavacar_bookings",
};

function getStorage(type) {
  if (typeof window === "undefined") return null;
  return type === "local" ? window.localStorage : window.sessionStorage;
}

function loadPersistedBookings() {
  const storage = getStorage("local");
  if (!storage) return;
  const stored = storage.getItem(STORAGE_KEYS.bookings);
  if (!stored) return;
  try {
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return;
    bookingState.items = parsed
      .map((entry) => {
        if (!entry || typeof entry !== "object") return null;
        const time = typeof entry.time === "string" ? entry.time : null;
        if (!time) return null;
        const cpf = typeof entry.cpf === "string" ? entry.cpf : "";
        const name = typeof entry.name === "string" ? entry.name : "";
        const service = typeof entry.service === "string" ? entry.service : "";
        const plate = typeof entry.plate === "string" ? entry.plate : "";
        const date = typeof entry.date === "string" ? entry.date : todayISO;
        const status = typeof entry.status === "string" ? entry.status : "Agendado";
        const id = entry.id || `${date}-${time}-${cpf}`;
        return { id, cpf, name, service, plate, time, date, status };
      })
      .filter(Boolean);
  } catch (error) {
    console.error("Não foi possível carregar agendamentos persistidos.", error);
  }
}

function persistBookings() {
  const storage = getStorage("local");
  if (!storage) return;
  storage.setItem(STORAGE_KEYS.bookings, JSON.stringify(bookingState.items));
}

function syncSlotsWithBookings() {
  const bookedToday = new Set(
    bookingState.items
      .filter((item) => item.date === todayISO)
      .map((item) => item.time)
  );

  bookingState.slots.forEach((slot) => {
    slot.status = bookedToday.has(slot.time) ? "booked" : "available";
    if (bookingState.selectedSlot === slot.time && slot.status === "booked") {
      bookingState.selectedSlot = null;
    }
  });
}

function getBookingsByCpf(cpf) {
  if (!cpf) return [];
  return bookingState.items.filter((item) => item.cpf === cpf);
}

function refreshCustomerBookings() {
  clientState.customers.forEach((customer) => {
    customer.bookings = getBookingsByCpf(customer.cpf);
  });
}

function syncTeamAppointments() {
  teamState.appointments = bookingState.items
    .slice()
    .sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateA - dateB;
    });
}

function loadPersistedCustomers() {
  const storage = getStorage("local");
  if (!storage) return;
  const stored = storage.getItem(STORAGE_KEYS.customers);
  if (!stored) return;
  try {
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return;
    const knownCpfs = new Set(clientState.customers.map((customer) => customer.cpf));
    parsed.forEach((customer) => {
      if (!customer || typeof customer.cpf !== "string") return;
      if (knownCpfs.has(customer.cpf)) return;
      clientState.customers.push(customer);
      knownCpfs.add(customer.cpf);
    });
  } catch (error) {
    console.error("Não foi possível carregar clientes persistidos.", error);
  }
}

function persistCustomers() {
  const storage = getStorage("local");
  if (!storage) return;
  storage.setItem(STORAGE_KEYS.customers, JSON.stringify(clientState.customers));
}

loadPersistedBookings();
loadPersistedCustomers();
refreshCustomerBookings();
syncSlotsWithBookings();
syncTeamAppointments();

function setLoggedCustomerCpf(cpf) {
  const storage = getStorage("session");
  if (!storage) return;
  if (!cpf) {
    storage.removeItem(STORAGE_KEYS.loggedCpf);
    return;
  }
  storage.setItem(STORAGE_KEYS.loggedCpf, cpf);
}

function getLoggedCustomerCpf() {
  const storage = getStorage("session");
  if (!storage) return null;
  return storage.getItem(STORAGE_KEYS.loggedCpf);
}

function clearLoggedCustomerCpf() {
  const storage = getStorage("session");
  if (!storage) return;
  storage.removeItem(STORAGE_KEYS.loggedCpf);
}

function setLoginMessage(name) {
  const storage = getStorage("session");
  if (!storage) return;
  if (!name) {
    storage.removeItem(STORAGE_KEYS.loginMessage);
    return;
  }
  storage.setItem(STORAGE_KEYS.loginMessage, name);
}

function consumeLoginMessage() {
  const storage = getStorage("session");
  if (!storage) return null;
  const message = storage.getItem(STORAGE_KEYS.loginMessage);
  if (message) {
    storage.removeItem(STORAGE_KEYS.loginMessage);
  }
  return message;
}

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

function sanitizeCpf(value) {
  return value.replace(/\D/g, "");
}

function sanitizePlate(value) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function formatDateToBR(value) {
  if (!value || typeof value !== "string") return "—";
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) {
    return value;
  }
  return `${day}/${month}/${year}`;
}

function maskCpf(value) {
  if (!value) return "";
  const digits = sanitizeCpf(value);
  if (digits.length !== 11) {
    return value;
  }
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
}

function initLanding() {
  const form = document.querySelector("#quickBookingForm");
  const timeSlotsList = document.querySelector("#timeSlotsList");
  const serviceSelect = document.querySelector("#bookingService");
  const selectedSlotInfo = document.querySelector("#selectedSlotInfo");
  const planGrid = document.querySelector("#planCards");
  const tipsList = document.querySelector("#tipsList");

  if (!form || !timeSlotsList || !serviceSelect) {
    return;
  }

  syncSlotsWithBookings();

  function renderServices() {
    serviceSelect.innerHTML = '<option value="">Selecione</option>';
    clientState.services.forEach((service) => {
      const option = document.createElement("option");
      option.value = service.name;
      option.textContent = `${service.icon} ${service.name}`;
      serviceSelect.appendChild(option);
    });
  }

  function updateSelectedSlotInfo() {
    if (!selectedSlotInfo) return;
    if (bookingState.selectedSlot) {
      selectedSlotInfo.textContent = `Horário selecionado: ${bookingState.selectedSlot}`;
      selectedSlotInfo.classList.remove("is-muted");
    } else {
      selectedSlotInfo.textContent = "Nenhum horário selecionado.";
      selectedSlotInfo.classList.add("is-muted");
    }
  }

  function renderTimeSlots() {
    timeSlotsList.innerHTML = "";
    bookingState.slots.forEach((slot) => {
      const li = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.time = slot.time;
      button.textContent = slot.time;
      const isSelected = bookingState.selectedSlot === slot.time;
      button.className = `slot slot--${slot.status}${isSelected ? " slot--selected" : ""}`;
      if (slot.status === "booked") {
        button.disabled = true;
      }
      li.appendChild(button);
      timeSlotsList.appendChild(li);
    });
    updateSelectedSlotInfo();
  }

  function renderPlans() {
    if (!planGrid) return;
    planGrid.innerHTML = "";
    clientState.planCatalog.forEach((plan) => {
      const article = document.createElement("article");
      article.className = "card plan-card";
      article.innerHTML = `
        <header>
          <span class="card__label">${plan.name}</span>
          <h3>${plan.price}</h3>
        </header>
        <ul class="plan-card__benefits">
          ${plan.benefits.map((benefit) => `<li>${benefit}</li>`).join("")}
        </ul>
        <footer>
          <span class="plan-card__trend">Popularidade: ${plan.trend}%</span>
        </footer>
      `;
      planGrid.appendChild(article);
    });
  }

  function renderTips() {
    if (!tipsList) return;
    tipsList.innerHTML = "";
    clientState.tips.forEach((tip) => {
      const li = document.createElement("li");
      li.textContent = tip;
      tipsList.appendChild(li);
    });
  }

  timeSlotsList.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-time]");
    if (!button) return;
    const time = button.dataset.time;
    const slot = bookingState.slots.find((item) => item.time === time);
    if (!slot || slot.status === "booked") {
      return;
    }
    bookingState.selectedSlot = time;
    renderTimeSlots();
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const cpf = sanitizeCpf(formData.get("cpf") || "");
    const name = (formData.get("name") || "").trim();
    const plate = sanitizePlate(formData.get("plate") || "");
    const service = formData.get("service") || "";
    const slot = bookingState.selectedSlot;

    if (cpf.length !== 11) {
      showToast("Informe um CPF válido com 11 dígitos.");
      return;
    }

    if (!name) {
      showToast("Informe o nome do cliente.");
      return;
    }

    if (!plate || plate.length < 6) {
      showToast("Informe uma placa válida.");
      return;
    }

    if (!service) {
      showToast("Selecione o tipo de lavagem.");
      return;
    }

    if (!slot) {
      showToast("Selecione um horário disponível na grade.");
      return;
    }

    const slotEntry = bookingState.slots.find((item) => item.time === slot);
    if (!slotEntry || slotEntry.status === "booked") {
      showToast("Horário indisponível. Escolha outro horário.");
      syncSlotsWithBookings();
      renderTimeSlots();
      return;
    }

    const booking = {
      id: `${Date.now()}-${slot}`,
      cpf,
      name,
      plate,
      service,
      time: slot,
      date: todayISO,
      status: "Agendado",
    };

    bookingState.items.push(booking);
    persistBookings();
    syncSlotsWithBookings();
    refreshCustomerBookings();
    syncTeamAppointments();

    const customer = clientState.customers.find((item) => item.cpf === cpf);
    if (customer) {
      if (!customer.name) {
        customer.name = name;
      }
      if (!customer.vehicle) {
        customer.vehicle = { plate, model: "" };
      } else if (!customer.vehicle.plate) {
        customer.vehicle.plate = plate;
      }
      customer.bookings = getBookingsByCpf(cpf);
      persistCustomers();
    }

    bookingState.selectedSlot = null;
    form.reset();
    renderTimeSlots();

    const confirmationMessage = customer
      ? `Agendamento confirmado para ${slot}. Consulte seu histórico na área do cliente.`
      : `Agendamento confirmado para ${slot}. Cadastre-se na área do cliente para acompanhar.`;
    showToast(confirmationMessage);
  });

  renderServices();
  renderTimeSlots();
  renderPlans();
  renderTips();
  updateSelectedSlotInfo();
}

function initCliente() {
  const profileCard = document.querySelector("#profileCard");
  const loginReminderCard = document.querySelector("#loginReminderCard");
  const profileName = document.querySelector("#profileName");
  const profileCpf = document.querySelector("#profileCpf");
  const profilePlans = document.querySelector("#profilePlans");
  const profileLastBooking = document.querySelector("#profileLastBooking");
  const logoutButton = document.querySelector("#logoutButton");
  const activePlansList = document.querySelector("#activePlansList");
  const activePlansCard = document.querySelector("#activePlansCard");
  const bookingsTable = document.querySelector("#customerBookings tbody");
  const bookingsCard = document.querySelector("#bookingsCard");

  if (!activePlansList || !bookingsTable) {
    return;
  }

  const storedCpf = getLoggedCustomerCpf();
  if (storedCpf) {
    const customer = clientState.customers.find((item) => item.cpf === storedCpf);
    if (customer) {
      loggedCustomer = customer;
    } else {
      clearLoggedCustomerCpf();
    }
  }

  function updateAccessCards() {
    if (profileCard) {
      profileCard.hidden = !loggedCustomer;
    }
    if (loginReminderCard) {
      loginReminderCard.hidden = !!loggedCustomer;
    }
  }

  function renderBookings() {
    bookingsTable.innerHTML = "";
    if (!loggedCustomer) {
      bookingsCard?.classList.add("is-muted");
      const tr = document.createElement("tr");
      tr.className = "empty-row";
      tr.innerHTML =
        '<td colspan="4">Acesse sua conta na <a href="autenticacao.html">área de autenticação</a> para visualizar seus agendamentos.</td>';
      bookingsTable.appendChild(tr);
      return;
    }

    bookingsCard?.classList.remove("is-muted");

    const customerBookings = getBookingsByCpf(loggedCustomer.cpf);
    if (!customerBookings.length) {
      const tr = document.createElement("tr");
      tr.className = "empty-row";
      tr.innerHTML = '<td colspan="4">Nenhum agendamento registrado até o momento.</td>';
      bookingsTable.appendChild(tr);
      return;
    }

    customerBookings
      .slice()
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateB - dateA;
      })
      .forEach((booking) => {
        const tr = document.createElement("tr");
        const badgeClass =
          booking.status === "Concluído"
            ? "badge--available"
            : booking.status === "Cancelado"
            ? "badge--danger"
            : "badge--pending";
        tr.innerHTML = `
          <td>${formatDateToBR(booking.date)}</td>
          <td>${booking.time}</td>
          <td>${booking.service}</td>
          <td><span class="badge ${badgeClass}">${booking.status}</span></td>
        `;
        bookingsTable.appendChild(tr);
      });
  }

  function renderActivePlans() {
    activePlansList.innerHTML = "";
    if (!loggedCustomer) {
      activePlansCard?.classList.add("is-muted");
      activePlansList.innerHTML =
        '<li class="empty-state">Entre na sua conta para acompanhar os planos ativos.</li>';
      return;
    }

    activePlansCard?.classList.remove("is-muted");

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

  function updateProfile() {
    if (!profileCard || !profileName || !profileCpf || !profilePlans) {
      return;
    }

    if (!loggedCustomer) {
      profileName.textContent = "";
      profileCpf.textContent = "";
      profilePlans.textContent = "0";
      if (profileLastBooking) {
        profileLastBooking.textContent = "—";
      }
      return;
    }

    profileName.textContent = loggedCustomer.name;
    profileCpf.textContent = maskCpf(loggedCustomer.cpf);
    profilePlans.textContent = String(loggedCustomer.plans.length);

    if (profileLastBooking) {
      const customerBookings = getBookingsByCpf(loggedCustomer.cpf);
      const latestBooking = customerBookings
        .slice()
        .sort((a, b) => {
          const dateA = new Date(`${a.date}T${a.time}`);
          const dateB = new Date(`${b.date}T${b.time}`);
          return dateB - dateA;
        })[0];

      profileLastBooking.textContent = latestBooking
        ? `${formatDateToBR(latestBooking.date)} • ${latestBooking.time}`
        : "Nenhum registro";
    }
  }

  logoutButton?.addEventListener("click", () => {
    loggedCustomer = null;
    clearLoggedCustomerCpf();
    setLoginMessage(null);
    updateAccessCards();
    renderActivePlans();
    renderBookings();
    updateProfile();
    showToast("Sessão encerrada com sucesso.");
  });

  updateAccessCards();
  renderActivePlans();
  renderBookings();
  updateProfile();

  const loginMessage = consumeLoginMessage();
  if (loginMessage && loggedCustomer) {
    const firstName = loginMessage.split(" ")[0];
    showToast(`Bem-vindo(a), ${firstName}!`);
  }
}

function initAuth() {
  const loginForm = document.querySelector("#authLoginForm");
  const signupForm = document.querySelector("#signupForm");

  if (!loginForm) {
    return;
  }

  const storedCpf = getLoggedCustomerCpf();
  if (storedCpf) {
    const customer = clientState.customers.find((item) => item.cpf === storedCpf);
    if (customer) {
      loggedCustomer = customer;
      setLoginMessage(customer.name);
      showToast("Você já está autenticado. Redirecionando para o portal...");
      setTimeout(() => {
        window.location.href = "cliente.html";
      }, 600);
      return;
    }
    clearLoggedCustomerCpf();
  }

  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(loginForm);
    const cpf = sanitizeCpf(formData.get("cpf") || "");
    const password = (formData.get("password") || "").trim();

    if (cpf.length !== 11) {
      showToast("Informe um CPF válido com 11 dígitos.");
      return;
    }

    if (!/^\d{4}$/.test(password)) {
      showToast("A senha precisa conter exatamente 4 dígitos.");
      return;
    }

    const customer = clientState.customers.find(
      (item) => item.cpf === cpf && item.password === password
    );

    if (!customer) {
      showToast("CPF ou senha inválidos. Tente novamente.");
      return;
    }

    loggedCustomer = customer;
    setLoggedCustomerCpf(customer.cpf);
    setLoginMessage(customer.name);
    loginForm.reset();
    window.location.href = "cliente.html";
  });

  signupForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(signupForm);
    const name = (formData.get("name") || "").trim();
    const cpf = sanitizeCpf(formData.get("cpf") || "");
    const email = (formData.get("email") || "").trim();

    if (!name || !email || cpf.length !== 11) {
      showToast("Preencha nome, CPF e e-mail válidos para o cadastro.");
      return;
    }

    const emailPattern = /^[\w-.]+@[\w-]+\.[A-Za-z]{2,}$/;
    if (!emailPattern.test(email)) {
      showToast("Informe um e-mail válido.");
      return;
    }

    const alreadyExists = clientState.customers.some((item) => item.cpf === cpf);
    if (alreadyExists) {
      showToast("Este CPF já possui cadastro. Faça o login.");
      return;
    }

    const generatedPassword = String(Math.floor(1000 + Math.random() * 9000));
    const newCustomer = {
      cpf,
      password: generatedPassword,
      name,
      email,
      vehicle: null,
      plans: [],
      bookings: [],
      payments: [],
    };

    clientState.customers.push(newCustomer);
    refreshCustomerBookings();
    persistCustomers();
    showToast(
      `Cadastro realizado! Enviamos sua senha para ${email}. Senha: ${generatedPassword}.`
    );
    signupForm.reset();
  });
}

function initEquipe() {
  const appointmentsTable = document.querySelector("#teamAppointments tbody");
  const paymentsTable = document.querySelector("#teamPayments tbody");
  const inventoryTable = document.querySelector("#inventoryTable tbody");
  const notesContainer = document.querySelector("#teamNotes");

  if (!appointmentsTable) return;

  function renderAppointments() {
    appointmentsTable.innerHTML = "";
    if (!teamState.appointments.length) {
      const tr = document.createElement("tr");
      tr.className = "empty-row";
      tr.innerHTML = '<td colspan="7">Nenhum agendamento registrado para hoje.</td>';
      appointmentsTable.appendChild(tr);
      return;
    }

    teamState.appointments.forEach((appointment) => {
      const tr = document.createElement("tr");
      const statusClass =
        appointment.status === "Concluído"
          ? "badge--available"
          : appointment.status === "Cancelado"
          ? "badge--danger"
          : "badge--pending";
      tr.innerHTML = `
        <td>${formatDateToBR(appointment.date)}</td>
        <td>${appointment.time}</td>
        <td>${appointment.name || "—"}</td>
        <td>${appointment.service}</td>
        <td>${appointment.plate || "—"}</td>
        <td>
          <span class="badge ${statusClass}">${appointment.status}</span>
        </td>
        <td>
          <button type="button" data-id="${appointment.id}" ${appointment.status === "Concluído" ? "disabled" : ""}>
            ${appointment.status === "Concluído" ? "Finalizado" : "Concluir"}
          </button>
        </td>
      `;
      appointmentsTable.appendChild(tr);
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

  appointmentsTable.parentElement.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-id]");
    if (!button) return;
    const appointmentId = button.dataset.id;
    const appointment = teamState.appointments.find((item) => item.id === appointmentId);
    if (!appointment || appointment.status === "Concluído") return;
    appointment.status = "Concluído";
    const original = bookingState.items.find((item) => item.id === appointmentId);
    if (original) {
      original.status = "Concluído";
    }
    persistBookings();
    refreshCustomerBookings();
    syncTeamAppointments();
    renderAppointments();
    showToast(`Agendamento das ${appointment.time} concluído.`);
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

  renderAppointments();
  renderInventory();
  renderPayments();
  renderNotes();
}

if (page === "landing") {
  initLanding();
} else if (page === "cliente") {
  initCliente();
} else if (page === "auth") {
  initAuth();
} else if (page === "equipe") {
  initEquipe();
}
