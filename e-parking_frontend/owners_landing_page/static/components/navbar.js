class CustomNavbar extends HTMLElement {
  constructor() {
    super();
    // Cria um Shadow DOM para isolar o estilo e o HTML do componente (opcional, mas recomendado)
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    // variaveis de atributo

    const activePage = this.getAttribute("active") || "inicio";
    const logoSrc = this.getAttribute("logo");
    const cssSrc = this.getAttribute("cssSrc");
    const base = this.getAttribute("base") || "./";

    // componente

    this.shadowRoot.innerHTML = `
      <!-- Importa o Bootstrap e ícones diretamente no componente para garantir que funcione isolado -->
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
      <link rel="stylesheet" href="${cssSrc}" />

      <!-- navbar -->
      <nav
        id="nav_bar"
        class="navbar navbar-expand-lg border-bottom border-body"
        class="navbar"
        data-bs-theme="dark"
      >
        <div class="container-fluid">
          <a class="navbar-brand" href="${base}index.html">
            <img
              src="${logoSrc}"
              alt="icone E-Parking"
              class="logo"
            />
          </a>
          <button
            class="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarSupportedContent">
            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
              <li class="nav-item">
                <a
                  class="nav-link"
                  aria-current="page"
                  href="${base}./pages/about_Us/about_Us.html"
                  ${activePage === "sobre" ? "active" : ""}"
                  >Sobre nós</a
                >
              </li>
              <li class="nav-item">
                <a
                  class="nav-link"
                  href="${base}./pages/meus_estacionamentos/meus_estacionamentos.html"
                  ${activePage === "estacionamento" ? "active" : ""}"
                  >Meus estacionamentos</a
                >
              </li>
              <li class="nav-item">
                <a
                  class="nav-link"
                  href="${base}./pages/relatorio/relatorio.html"
                  ${activePage === "financeiro" ? "active" : ""}"
                  >Financeiro</a
                >
              </li>
            </ul>
            <a id="login_btn" class="btn mx-2" href="${base}./pages/login/login.html"
              >Login</a
            >
            <a
              id="register_btn"
              class="btn"
              href="${base}./pages/register/resgister.html"
              >Cadastrar</a
            >
          </div>
        </div>
      </nav>
    `;
  }
}

// Define a nova tag HTML <custom-navbar>
customElements.define("custom-navbar", CustomNavbar);
