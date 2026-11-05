// Cadastro do motorista: valida os campos e salva o usuário no localStorage.

const registerForm = document.getElementById("registerForm");
const fullNameInput = document.getElementById("fullName");
const cpfInput = document.getElementById("cpf");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");

// Se o motorista veio de uma página que exige login, guarda para onde ele deve voltar.
const nextPage = new URLSearchParams(location.search).get("next");
const nextQuery = nextPage ? `&next=${encodeURIComponent(nextPage)}` : "";
if (nextPage) {
  document.getElementById("loginLink").href = `../login/login.html?next=${encodeURIComponent(nextPage)}`;
  document.getElementById("loginLinkBottom").href = `../login/login.html?next=${encodeURIComponent(nextPage)}`;
}

applyMask(cpfInput, maskCpf);

function emailError(email) {
  if (!isValidEmail(email)) return "Informe um e-mail válido.";
  if (findUserByEmail(email)) return "Este e-mail já está cadastrado.";
  return "";
}

registerForm.addEventListener("submit", event => {
  event.preventDefault();

  const fullName = fullNameInput.value.trim().replace(/\s+/g, " ");
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  const isValid = validateFields(registerForm, [
    [fullNameInput, fullName.split(" ").length < 2 ? "Informe seu nome e sobrenome." : ""],
    [cpfInput, isValidCpf(cpfInput.value) ? "" : "CPF inválido. Confira os números."],
    [emailInput, emailError(email)],
    [passwordInput, password.length < 6 ? "A senha precisa ter pelo menos 6 caracteres." : ""],
    [confirmPasswordInput, confirmPasswordInput.value === password && password ? "" : "As senhas não são iguais."]
  ]);
  if (!isValid) return;

  // Senha guardada só para simular o login no navegador; na Sprint 3 a autenticação passa para a API.
  createUser({ name: fullName, cpf: cpfInput.value, email, password });
  location.href = `../login/login.html?registered=1&email=${encodeURIComponent(email)}${nextQuery}`;
});
