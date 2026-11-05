// Funções compartilhadas entre as páginas: localStorage (usuários, sessão e reservas) e formatação.
// O localStorage faz o papel do banco de dados até a integração com a API na Sprint 3.

const STORAGE_KEYS = {
  users: "eparking_users",
  session: "eparking_session",
  reservations: "eparking_reservations"
};

function readList(key) {
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function saveList(key, list) {
  localStorage.setItem(key, JSON.stringify(list));
}

/* ---------- Usuários e sessão ---------- */

function findUserByEmail(email) {
  const normalizedEmail = email.trim().toLowerCase();
  return readList(STORAGE_KEYS.users).find(user => user.email === normalizedEmail) || null;
}

function createUser(user) {
  const users = readList(STORAGE_KEYS.users);
  users.push({ ...user, email: user.email.trim().toLowerCase() });
  saveList(STORAGE_KEYS.users, users);
}

function startSession(email) {
  localStorage.setItem(STORAGE_KEYS.session, email.trim().toLowerCase());
}

function endSession() {
  localStorage.removeItem(STORAGE_KEYS.session);
}

function getLoggedUser() {
  const email = localStorage.getItem(STORAGE_KEYS.session);
  return email ? findUserByEmail(email) : null;
}

/* ---------- Reservas (CRUD local) ---------- */

function getUserReservations(email) {
  return readList(STORAGE_KEYS.reservations)
    .filter(reservation => reservation.userEmail === email)
    .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));
}

function findReservation(id) {
  return readList(STORAGE_KEYS.reservations).find(reservation => reservation.id === id) || null;
}

function createReservation(data) {
  const reservations = readList(STORAGE_KEYS.reservations);
  const reservation = {
    ...data,
    id: String(Date.now()),
    code: generateReservationCode(),
    createdAt: new Date().toISOString()
  };
  reservations.push(reservation);
  saveList(STORAGE_KEYS.reservations, reservations);
  return reservation;
}

function updateReservation(id, changes) {
  const reservations = readList(STORAGE_KEYS.reservations).map(reservation =>
    reservation.id === id ? { ...reservation, ...changes } : reservation
  );
  saveList(STORAGE_KEYS.reservations, reservations);
}

function deleteReservation(id) {
  const reservations = readList(STORAGE_KEYS.reservations).filter(reservation => reservation.id !== id);
  saveList(STORAGE_KEYS.reservations, reservations);
}

function generateReservationCode() {
  const randomNumber = Math.floor(10000 + Math.random() * 90000);
  return `EP-${new Date().getFullYear()}-${randomNumber}`;
}

/* ---------- Formatação ---------- */

function formatCurrency(value) {
  return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(isoDate) {
  if (!isoDate) return "—";
  const [year, month, day] = isoDate.split("-");
  return day ? `${day}/${month}/${year}` : isoDate;
}

function formatDuration(hours) {
  return Number(hours) === 1 ? "1 hora" : `${hours} horas`;
}

/* ---------- Cabeçalho ---------- */

// Troca os links "Entrar/Cadastrar" pelo nome do usuário logado, "Minhas reservas" e "Sair".
// rootPath é o caminho até a pasta drivers_landing_page ("" no index, "../../" nas páginas).
function renderSessionLinks(container, rootPath, linkClass = "") {
  const user = getLoggedUser();
  if (!container || !user) return;

  const firstName = user.name.split(" ")[0];
  const greeting = document.createElement("span");
  greeting.className = "user-greeting";
  greeting.textContent = `Olá, ${firstName}`;

  const reservationsLink = document.createElement("a");
  reservationsLink.href = `${rootPath}pages/reservations/reservations.html`;
  reservationsLink.textContent = "Minhas reservas";

  const logoutLink = document.createElement("a");
  logoutLink.href = `${rootPath}index.html`;
  logoutLink.textContent = "Sair";
  logoutLink.addEventListener("click", endSession);

  if (linkClass) {
    reservationsLink.className = linkClass;
    logoutLink.className = linkClass;
  }

  container.replaceChildren(greeting, reservationsLink, logoutLink);
}
