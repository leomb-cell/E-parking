// Pagamento: mostra o resumo, valida o cartão e salva a reserva no localStorage (Create do CRUD).

const params = new URLSearchParams(location.search);
const parking = findParking(params.get("id")) || PARKINGS[0];
const reservationDate = params.get("date") || "";
const reservationTime = params.get("time") || "";
const reservationHours = Number(params.get("hours")) || 1;
const totalPrice = parking.price * reservationHours;

const paymentForm = document.getElementById("paymentForm");
const formMessage = document.getElementById("formMessage");
const cardFields = document.getElementById("cardFields");
const cardNameInput = document.getElementById("cardName");
const cardNumberInput = document.getElementById("cardNumber");
const cardExpiryInput = document.getElementById("cardExpiry");
const cardCvvInput = document.getElementById("cardCvv");
const methodButtons = document.querySelectorAll(".method");
const methodInfos = { "PIX": document.getElementById("pixInfo"), "No local": document.getElementById("localInfo") };

const loginUrl = `../login/login.html?next=${encodeURIComponent(`../payment/payment.html${location.search}`)}`;

let selectedMethod = "Cartão";

renderSessionLinks(document.getElementById("sessionLinks"), "../../");

function renderSummary() {
  document.getElementById("parkingName").textContent = parking.name;
  document.getElementById("address").textContent = parking.address;
  document.getElementById("date").textContent = formatDate(reservationDate);
  document.getElementById("time").textContent = reservationTime || "—";
  document.getElementById("hours").textContent = formatDuration(reservationHours);
  document.getElementById("price").textContent = formatCurrency(parking.price);
  document.getElementById("total").textContent = formatCurrency(totalPrice);
}

function selectMethod(button) {
  selectedMethod = button.dataset.method;
  methodButtons.forEach(other => {
    other.classList.toggle("active", other === button);
    other.setAttribute("aria-pressed", String(other === button));
  });
  cardFields.hidden = selectedMethod !== "Cartão";
  Object.entries(methodInfos).forEach(([method, info]) => {
    info.hidden = method !== selectedMethod;
  });
  clearFieldErrors(paymentForm);
}

function validateCard() {
  const cardDigits = cardNumberInput.value.replace(/\D/g, "");
  return validateFields(paymentForm, [
    [cardNameInput, cardNameInput.value.trim().length < 3 ? "Digite o nome como está no cartão." : ""],
    [cardNumberInput, cardDigits.length === 16 ? "" : "O número do cartão deve ter 16 dígitos."],
    [cardExpiryInput, isValidCardExpiry(cardExpiryInput.value) ? "" : "Validade inválida ou cartão vencido (use MM/AA)."],
    [cardCvvInput, /^\d{3}$/.test(cardCvvInput.value) ? "" : "O CVV deve ter 3 dígitos."]
  ]);
}

renderSummary();

const backQuery = new URLSearchParams({ id: parking.id, date: reservationDate, time: reservationTime });
document.getElementById("backLink").href = `../parking/parking.html?${backQuery}`;

applyMask(cardNumberInput, maskCardNumber);
applyMask(cardExpiryInput, maskCardExpiry);
applyMask(cardCvvInput, value => value.replace(/\D/g, "").slice(0, 3));

methodButtons.forEach(button => button.addEventListener("click", () => selectMethod(button)));

if (!getLoggedUser()) {
  const loginLink = document.createElement("a");
  loginLink.href = loginUrl;
  loginLink.textContent = "entre na sua conta";
  formMessage.replaceChildren("Para confirmar a reserva, ", loginLink, ".");
  formMessage.className = "form-message info";
  formMessage.hidden = false;
}

paymentForm.addEventListener("submit", event => {
  event.preventDefault();

  const user = getLoggedUser();
  if (!user) {
    location.href = loginUrl;
    return;
  }

  if (!reservationDate || !reservationTime) {
    showMessage(formMessage, "Os dados da reserva estão incompletos. Volte e escolha data e horário.");
    return;
  }

  if (selectedMethod === "Cartão" && !validateCard()) return;

  // Os dados do cartão não são salvos: guardamos só a forma de pagamento.
  const reservation = createReservation({
    userEmail: user.email,
    parkingId: parking.id,
    parkingName: parking.name,
    address: parking.address,
    date: reservationDate,
    time: reservationTime,
    hours: reservationHours,
    price: parking.price,
    total: totalPrice,
    paymentMethod: selectedMethod
  });

  location.href = `../confirmation/confirmation.html?id=${reservation.id}`;
});
