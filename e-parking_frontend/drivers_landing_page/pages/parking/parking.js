// Detalhes do estacionamento: carrega os dados pelo id da URL, calcula o total e valida a reserva.

const params = new URLSearchParams(location.search);
const parking = findParking(params.get("id")) || PARKINGS[0];

const bookingForm = document.getElementById("bookingForm");
const dateInput = document.getElementById("date");
const timeInput = document.getElementById("time");
const hoursSelect = document.getElementById("hours");

function renderParking() {
  document.title = `${parking.name} | E-Parking`;
  document.getElementById("parkingName").textContent = parking.name;
  document.getElementById("address").textContent = parking.address;
  document.getElementById("rating").textContent = `★ ${parking.rating.toFixed(1)} · ${ratingLabel(parking.rating)}`;
  document.getElementById("description").textContent = parking.description;
  document.getElementById("priceText").textContent = formatCurrency(parking.price);

  const chipTexts = [`${parking.spots} vagas disponíveis`, ...parking.features];
  const chips = chipTexts.map(text => {
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.textContent = text;
    return chip;
  });
  document.getElementById("chips").replaceChildren(...chips);
}

function updateSummary() {
  const hours = Number(hoursSelect.value);
  document.getElementById("durationText").textContent = hours ? formatDuration(hours) : "—";
  document.getElementById("totalText").textContent = hours ? formatCurrency(parking.price * hours) : "—";
}

function dateError(date) {
  if (!date) return "Escolha a data da reserva.";
  if (date < todayISO()) return "A data já passou.";
  return "";
}

function timeError(date, time) {
  if (!time) return "Escolha o horário de entrada.";
  if (date === todayISO() && isDateTimeInPast(date, time)) return "Esse horário já passou.";
  return "";
}

renderParking();

// Mantém a data e o horário que o motorista escolheu na busca.
dateInput.min = todayISO();
dateInput.value = params.get("date") || todayISO();
timeInput.value = params.get("time") || "";

const backQuery = new URLSearchParams(location.search);
backQuery.delete("id");
document.getElementById("backLink").href = `../results/results.html?${backQuery}`;

hoursSelect.addEventListener("change", updateSummary);
updateSummary();

bookingForm.addEventListener("submit", event => {
  event.preventDefault();

  const date = dateInput.value;
  const time = timeInput.value;

  const isValid = validateFields(bookingForm, [
    [dateInput, dateError(date)],
    [timeInput, timeError(date, time)],
    [hoursSelect, hoursSelect.value ? "" : "Escolha o tempo de permanência."]
  ]);
  if (!isValid) return;

  const query = new URLSearchParams({ id: parking.id, date, time, hours: hoursSelect.value });
  location.href = `../payment/payment.html?${query}`;
});
