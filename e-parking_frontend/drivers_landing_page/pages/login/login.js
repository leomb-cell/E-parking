// Login do motorista: confere e-mail e senha com os usuários salvos no localStorage e inicia a sessão.

const params = new URLSearchParams(location.search);
const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const formMessage = document.getElementById("formMessage");

// Só aceita voltar para páginas internas do site (ex.: ../payment/payment.html?...).
function nextPage() {
  const next = params.get("next");
  return next && /^\.\.\/[\w/.-]+\.html(\?.*)?$/.test(next) ? next : "../../index.html";
}

if (params.get("next")) {
  const registerHref = `../register/register.html?next=${encodeURIComponent(params.get("next"))}`;
  document.getElementById("registerLink").href = registerHref;
  document.getElementById("registerLinkBottom").href = registerHref;
}

if (params.get("registered")) {
  showMessage(formMessage, "Conta criada com sucesso! Entre com seu e-mail e senha.", "success");
  emailInput.value = params.get("email") || "";
  passwordInput.focus();
} else if (params.get("next")) {
  showMessage(formMessage, "Entre na sua conta para continuar.", "info");
}

loginForm.addEventListener("submit", event => {
  event.preventDefault();
  formMessage.hidden = true;

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  const isValid = validateFields(loginForm, [
    [emailInput, isValidEmail(email) ? "" : "Informe um e-mail válido."],
    [passwordInput, password ? "" : "Digite sua senha."]
  ]);
  if (!isValid) return;

  const user = findUserByEmail(email);
  if (!user || user.password !== password) {
    showMessage(formMessage, "E-mail ou senha incorretos.");
    return;
  }

  startSession(user.email);
  location.href = nextPage();
});
