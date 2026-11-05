// Página inicial: valida a busca e mostra o usuário logado no cabeçalho.

const searchForm = document.getElementById("searchForm");
const destinationInput = document.getElementById("destination");
const dateInput = document.getElementById("date");
const timeInput = document.getElementById("time");

renderSessionLinks(document.getElementById("sessionLinks"), "", "");

// A data começa em hoje e o calendário não deixa escolher dias que já passaram.
dateInput.min = todayISO();
dateInput.value = todayISO();

function dateTimeError(date, time) {
  if (!date) return "Escolha a data.";
  if (date < todayISO()) return "A data já passou.";
  if (time && isDateTimeInPast(date, time)) return "Esse horário já passou.";
  return "";
}

searchForm.addEventListener("submit", event => {
  event.preventDefault();

  const destination = destinationInput.value.trim();
  const date = dateInput.value;
  const time = timeInput.value;

  const isValid = validateFields(searchForm, [
    [destinationInput, destination.length < 3 ? "Informe um destino com pelo menos 3 letras." : ""],
    [dateInput, dateTimeError(date, time)],
    [timeInput, time ? "" : "Escolha o horário."]
  ]);
  if (!isValid) return;

  const query = new URLSearchParams({ destination, date, time });
  location.href = `pages/results/results.html?${query}`;
});
