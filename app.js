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

const STORAGE_KEYS = {
  customers: "lavacar_customers",
  loggedCpf: "lavacar_logged_cpf",
  loginMessage: "lavacar_login_message",
};

function getStorage(type) {
  if (typeof window === "undefined") return null;
  return type === "local" ? window.localStorage : window.sessionStorage;
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

loadPersistedCustomers();

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

function maskCpf(value) {
  if (!value) return "";
  const digits = sanitizeCpf(value);
  if (digits.length !== 11) {
    return value;
  }
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
}

function initCliente() {
  const profileCard = document.querySelector("#profileCard");
  const loginReminderCard = document.querySelector("#loginReminderCard");
  const profileName = document.querySelector("#profileName");
  const profileCpf = document.querySelector("#profileCpf");
  const profilePlans = document.querySelector("#profilePlans");
  const profileLastPayment = document.querySelector("#profileLastPayment");
  const logoutButton = document.querySelector("#logoutButton");
  const activePlansList = document.querySelector("#activePlansList");
  const activePlansCard = document.querySelector("#activePlansCard");
  const paymentsTable = document.querySelector("#customerPayments tbody");
  const historyCard = document.querySelector("#historyCard");

  if (!activePlansList || !paymentsTable) {
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

  function renderPayments() {
    paymentsTable.innerHTML = "";
    if (!loggedCustomer) {
      historyCard?.classList.add("is-muted");
      const tr = document.createElement("tr");
      tr.className = "empty-row";
      tr.innerHTML =
        '<td colspan="4">Acesse sua conta na <a href="autenticacao.html">área de autenticação</a> para visualizar o histórico.</td>';
      paymentsTable.appendChild(tr);
      return;
    }

    historyCard?.classList.remove("is-muted");

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
          : "badge--danger";
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
      if (profileLastPayment) {
        profileLastPayment.textContent = "—";
      }
      return;
    }

    profileName.textContent = loggedCustomer.name;
    profileCpf.textContent = maskCpf(loggedCustomer.cpf);
    profilePlans.textContent = String(loggedCustomer.plans.length);

    if (profileLastPayment) {
      const latestPayment = [...loggedCustomer.payments]
        .sort((a, b) => {
          const [dayA, monthA] = a.date.split("/").map(Number);
          const [dayB, monthB] = b.date.split("/").map(Number);
          const dateA = new Date(today.getFullYear(), monthA - 1, dayA);
          const dateB = new Date(today.getFullYear(), monthB - 1, dayB);
          return dateB - dateA;
        })[0];

      profileLastPayment.textContent = latestPayment
        ? `${latestPayment.date} • ${formatCurrency(latestPayment.value)}`
        : "Nenhum registro";
    }
  }

  logoutButton?.addEventListener("click", () => {
    loggedCustomer = null;
    clearLoggedCustomerCpf();
    setLoginMessage(null);
    updateAccessCards();
    renderActivePlans();
    renderPayments();
    updateProfile();
    showToast("Sessão encerrada com sucesso.");
  });

  updateAccessCards();
  renderActivePlans();
  renderPayments();
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
    persistCustomers();
    showToast(
      `Cadastro realizado! Enviamos sua senha para ${email}. Senha: ${generatedPassword}.`
    );
    signupForm.reset();
  });
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
} else if (page === "auth") {
  initAuth();
} else if (page === "equipe") {
  initEquipe();
}
