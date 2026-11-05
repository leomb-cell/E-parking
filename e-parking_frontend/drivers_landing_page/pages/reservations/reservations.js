// Minhas reservas: CRUD local das reservas do motorista logado.
// Read: lista os cards. Update: edita data, horário e duração. Delete: cancela a reserva.
// (O Create acontece na página de pagamento.)

const user = getLoggedUser();
const reservationList = document.getElementById("reservationList");
const reservationTemplate = document.getElementById("reservationTemplate");
const pageMessage = document.getElementById("pageMessage");
const subtitle = document.getElementById("subtitle");

renderSessionLinks(document.getElementById("sessionLinks"), "../../");

function isFinished(reservation) {
  return isDateTimeInPast(reservation.date, reservation.time);
}

function editErrors(form) {
  const dateInput = form.querySelector('[name="date"]');
  const timeInput = form.querySelector('[name="time"]');
  const date = dateInput.value;
  const time = timeInput.value;

  let dateMessage = "";
  if (!date) dateMessage = "Escolha a data.";
  else if (date < todayISO()) dateMessage = "A data já passou.";

  let timeMessage = "";
  if (!time) timeMessage = "Escolha o horário.";
  else if (date === todayISO() && isDateTimeInPast(date, time)) timeMessage = "Esse horário já passou.";

  return [[dateInput, dateMessage], [timeInput, timeMessage]];
}

function fillCard(card, reservation) {
  card.querySelector(".parking-name").textContent = reservation.parkingName;
  card.querySelector(".address").textContent = reservation.address;
  card.querySelector(".date").textContent = formatDate(reservation.date);
  card.querySelector(".time").textContent = reservation.time;
  card.querySelector(".hours").textContent = formatDuration(reservation.hours);
  card.querySelector(".payment").textContent = reservation.paymentMethod;
  card.querySelector(".code").textContent = reservation.code;
  card.querySelector(".total").textContent = formatCurrency(reservation.total);
  card.querySelector(".view").href = `../confirmation/confirmation.html?id=${reservation.id}`;

  const status = card.querySelector(".status");
  const finished = isFinished(reservation);
  status.textContent = finished ? "Concluída" : "Confirmada";
  status.classList.toggle("finished", finished);
  card.querySelector(".edit").hidden = finished;
}

function createReservationCard(reservation) {
  const card = reservationTemplate.content.firstElementChild.cloneNode(true);
  const editForm = card.querySelector(".edit-form");
  const confirmDelete = card.querySelector(".confirm-delete");
  const dateInput = editForm.querySelector('[name="date"]');
  const timeInput = editForm.querySelector('[name="time"]');
  const hoursSelect = editForm.querySelector('[name="hours"]');
  const editTotal = card.querySelector(".edit-total");

  fillCard(card, reservation);

  function updateEditTotal() {
    editTotal.textContent = `Novo total: ${formatCurrency(reservation.price * Number(hoursSelect.value))}`;
  }

  card.querySelector(".edit").addEventListener("click", () => {
    confirmDelete.hidden = true;
    editForm.hidden = false;
    dateInput.min = todayISO();
    dateInput.value = reservation.date;
    timeInput.value = reservation.time;
    hoursSelect.value = String(reservation.hours);
    updateEditTotal();
    dateInput.focus();
  });

  hoursSelect.addEventListener("change", updateEditTotal);

  card.querySelector(".cancel-edit").addEventListener("click", () => {
    clearFieldErrors(editForm);
    editForm.hidden = true;
  });

  editForm.addEventListener("submit", event => {
    event.preventDefault();
    if (!validateFields(editForm, editErrors(editForm))) return;

    const hours = Number(hoursSelect.value);
    updateReservation(reservation.id, {
      date: dateInput.value,
      time: timeInput.value,
      hours,
      total: reservation.price * hours
    });
    renderReservations();
    showMessage(pageMessage, `Reserva ${reservation.code} atualizada.`, "success");
  });

  card.querySelector(".delete").addEventListener("click", () => {
    editForm.hidden = true;
    confirmDelete.hidden = false;
  });

  card.querySelector(".confirm-no").addEventListener("click", () => {
    confirmDelete.hidden = true;
  });

  card.querySelector(".confirm-yes").addEventListener("click", () => {
    deleteReservation(reservation.id);
    renderReservations();
    showMessage(pageMessage, `Reserva ${reservation.code} cancelada.`, "success");
  });

  return card;
}

function renderReservations() {
  const reservations = getUserReservations(user.email);
  reservationList.replaceChildren(...reservations.map(createReservationCard));
  document.getElementById("emptyState").hidden = reservations.length > 0;

  const total = reservations.length;
  subtitle.textContent = total
    ? `Você tem ${total === 1 ? "1 reserva" : `${total} reservas`}. Consulte, altere ou cancele quando precisar.`
    : "Consulte, altere ou cancele suas reservas de estacionamento.";
}

if (user) {
  renderReservations();
} else {
  document.getElementById("loginRequired").hidden = false;
}
