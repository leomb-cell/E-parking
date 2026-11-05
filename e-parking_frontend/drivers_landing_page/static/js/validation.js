// Validações de formulário e exibição das mensagens de erro abaixo de cada campo.

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function isValidEmail(email) {
  return EMAIL_REGEX.test(email.trim());
}

// Confere os dois dígitos verificadores do CPF.
function isValidCpf(cpf) {
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return false;

  for (let length = 9; length < 11; length++) {
    let sum = 0;
    for (let i = 0; i < length; i++) {
      sum += Number(digits[i]) * (length + 1 - i);
    }
    const checkDigit = ((sum * 10) % 11) % 10;
    if (checkDigit !== Number(digits[length])) return false;
  }
  return true;
}

// Data de hoje no formato do <input type="date"> (AAAA-MM-DD), no fuso do usuário.
function todayISO() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 10);
}

function isDateTimeInPast(date, time) {
  return new Date(`${date}T${time || "23:59"}`) < new Date();
}

// Validade do cartão no formato MM/AA, aceita até o último dia do mês informado.
function isValidCardExpiry(expiry) {
  const match = /^(\d{2})\/(\d{2})$/.exec(expiry);
  if (!match) return false;
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  if (month < 1 || month > 12) return false;
  const firstDayAfterExpiry = new Date(year, month, 1);
  return firstDayAfterExpiry > new Date();
}

/* ---------- Máscaras ---------- */

function maskCpf(value) {
  return value
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function maskCardNumber(value) {
  return value.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ");
}

function maskCardExpiry(value) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

function applyMask(input, maskFunction) {
  input.addEventListener("input", () => {
    input.value = maskFunction(input.value);
  });
}

/* ---------- Mensagens de erro ---------- */

function showFieldError(input, message) {
  const field = input.closest(".field");
  field.classList.add("has-error");
  input.setAttribute("aria-invalid", "true");

  let error = field.querySelector(".field-error");
  if (!error) {
    error = document.createElement("small");
    error.className = "field-error";
    field.appendChild(error);
  }
  error.textContent = message;
}

function clearFieldErrors(form) {
  form.querySelectorAll(".field-error").forEach(error => error.remove());
  form.querySelectorAll(".has-error").forEach(field => field.classList.remove("has-error"));
  form.querySelectorAll("[aria-invalid]").forEach(input => input.removeAttribute("aria-invalid"));
}

// Recebe pares [campo, mensagem]. Mensagem vazia significa campo válido.
// Mostra todos os erros de uma vez, foca o primeiro campo inválido e devolve true se estiver tudo certo.
function validateFields(form, checks) {
  clearFieldErrors(form);
  const invalidInputs = checks.filter(([, message]) => message);
  invalidInputs.forEach(([input, message]) => showFieldError(input, message));
  if (invalidInputs.length) invalidInputs[0][0].focus();
  return invalidInputs.length === 0;
}

// Mostra uma mensagem geral (sucesso ou erro) em um elemento já existente na página.
function showMessage(element, text, type = "error") {
  element.textContent = text;
  element.className = `form-message ${type}`;
  element.hidden = false;
}

// Assim que o usuário mexe em um campo com erro, a mensagem daquele campo some.
document.addEventListener("input", event => {
  const field = event.target.closest(".field.has-error");
  if (!field) return;
  field.classList.remove("has-error");
  field.querySelector(".field-error")?.remove();
  event.target.removeAttribute("aria-invalid");
});
