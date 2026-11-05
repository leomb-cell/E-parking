class CustomFooter extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    const logoSrc = this.getAttribute("logo") || "";
    const cssSrc = this.getAttribute("cssSrc") || "";
    const base = this.getAttribute("base") || "./";

    this.shadowRoot.innerHTML = `
      <!-- Importa o Bootstrap e ícones diretamente no componente -->
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
      <link rel="stylesheet" href="${cssSrc}" />

      <footer
        id="foo_ter"
        class="d-flex flex-wrap justify-content-between align-items-center px-3 py-3 border-top bg-custom-blue text-white"
        data-bs-theme="dark"
      >
        <p id="flori_tm" class="col-md-4 mb-0 text-body-secondary">
          © 2026 E-Parking, Inc
        </p>

        <a
          href="${base}index.html"
          class="col-md-4 d-flex align-items-center justify-content-center mb-3 mb-md-0 me-md-auto link-body-emphasis text-decoration-none"
          aria-label="Bootstrap"
        >
          <img
            src="${logoSrc}"
            id="logo_footer"
            class="logo"
            alt="logo"
            height="40"
          />
        </a>

        <ul id="footer_nav" class="nav col-md-4 justify-content-end gap-3">
          <li class="nav-item">
            <a
              href="${base}index.html"
              class="nav-link px-2 text-body-secondary"
              >Início</a
            >
          </li>
          <li class="nav-item">
            <a
              href="${base}pages/about_Us/about_Us.html"
              class="nav-link px-2 text-body-secondary"
              >Sobre nós</a
            >
          </li>
          <li class="nav-item">
            <a
              href="${base}pages/meus_estacionamentos/meus_estacionamentos.html"
              class="nav-link px-2 text-body-secondary"
              >Meus estacionamentos</a
            >
          </li>
        </ul>
      </footer>

      <style>
        .bg-custom-blue { background-color: #123b5d !important; }
      </style>
    `;
  }
}

// Define a nova tag HTML <custom-footer>
customElements.define("custom-footer", CustomFooter);