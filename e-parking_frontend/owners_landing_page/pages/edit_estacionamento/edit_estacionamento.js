// Selecionando elementos do formulário de edição
const formulario = document.getElementById("formulario");
const estacionamentoIdInput = document.getElementById("estacionamento_id");
const nome = document.getElementById("nome");
const cep = document.getElementById("cep");
const estado = document.getElementById("id_estado");
const municipio = document.getElementById("id_municipio");
const bairro = document.getElementById("bairro");
const logradouro = document.getElementById("logradouro");
const numero = document.getElementById("numero");
const num_alvara = document.getElementById("num_alvara");
const validade_alvara = document.getElementById("validade_alvara");
const hr_abertura = document.getElementById("hr_abertura");
const hr_fechamento = document.getElementById("hr_fechamento");
const qtd_vagas_comum = document.getElementById("qtd_vagas_comum");
const qtd_vagas_pcd = document.getElementById("qtd_vagas_pcd");
const qtd_vagas_idoso = document.getElementById("qtd_vagas_idoso");

// Funções de apoio

async function carregarEstados() {
  if (!estado) return;

  try {
    const estados = await getEstados();
    estado.innerHTML =
      '<option value="" disabled selected>Selecione um estado...</option>';

    estados.forEach((est) => {
      const option = document.createElement("option");
      option.value = est.id_estado;
      option.textContent = est.nome;
      estado.appendChild(option);
    });
  } catch (error) {
    console.error("Erro ao carregar estados:", error);
  }
}

async function carregarMunicipios(id_estado) {
  if (!municipio) return;

  municipio.innerHTML =
    '<option value="" disabled selected>Carregando municípios...</option>';

  try {
    const municipios = await getMunicipiosEstado(id_estado);
    municipio.innerHTML =
      '<option value="" disabled selected>Selecione um município...</option>';

    municipios.forEach((muni) => {
      const option = document.createElement("option");
      option.value = muni.id_municipio || muni.id;
      option.textContent = muni.nome;
      municipio.appendChild(option);
    });
  } catch (error) {
    console.error("Erro ao carregar municípios:", error);
    municipio.innerHTML =
      '<option value="" disabled selected>Erro ao carregar municípios</option>';
  }
}

// Função auxiliar segura para extrair HH:mm de qualquer formato (String ou Data ISO)
function formatarHorario(valorHorario) {
  if (!valorHorario) return "";

  // Se vier no formato ISO (ex: "1970-01-01T08:00:00.000Z")
  if (typeof valorHorario === "string" && valorHorario.includes("T")) {
    const partes = valorHorario.split("T")[1]; // Pega "08:00:00.000Z"
    return partes.slice(0, 5); // Retorna "08:00"
  }

  // Se vier como string simples (ex: "08:00:00" ou "08:00")
  if (typeof valorHorario === "string") {
    return valorHorario.slice(0, 5);
  }

  return "";
}

// Buscar os dados do estacionamento pelo ID da URL e preencher os inputs

async function carregarDadosEstacionamento() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    console.error("ID não encontrado...");
    window.location.href = "../meus_estacionamentos/meus_estacionamentos.html";
    return;
  }

  if (estacionamentoIdInput) estacionamentoIdInput.value = id;

  try {
    // Carrega os estados primeiro para montar o select
    await carregarEstados();

    // Busca os dados do estacionamento na API
    const estacionamento = await getEstacionamentoPorId(id);

    if (!estacionamento) {
      console.error("Estacionamento não encontrado.");
      return;
    }

    // Atalho para o endereço e para o município retornado do plural
    const end = estacionamento.enderecos || {};
    const muni = end.municipios || {};

    // LOG DE DEPÓSITO: Veja o que aparece no F12 do navegador
    console.log("Dados do Endereço:", end);
    console.log("Dados do Município:", muni);
    console.log("ID do Estado encontrado:", muni.id_estado);
    console.log("ID do Município encontrado:", end.id_municipio);

    // Preenchendo os campos com os dados retornados
    nome.value = estacionamento.nome ? estacionamento.nome : "";

    cep.value = end.cep ? end.cep : "";

    bairro.value = end.bairro ? end.bairro : "";

    logradouro.value = end.logradouro ? end.logradouro : "";

    numero.value = end.numero ? end.numero : "";

    num_alvara.value = estacionamento.num_alvara
      ? estacionamento.num_alvara
      : "";

    hr_abertura.value = formatarHorario(estacionamento.hr_abertura);

    hr_fechamento.value = formatarHorario(estacionamento.hr_fechamento);

    qtd_vagas_comum.value = estacionamento.qtd_vagas_comum
      ? estacionamento.qtd_vagas_comum
      : "";

    qtd_vagas_pcd.value = estacionamento.qtd_vagas_pcd
      ? estacionamento.qtd_vagas_pcd
      : "";

    qtd_vagas_idoso.value = estacionamento.qtd_vagas_idoso
      ? estacionamento.qtd_vagas_idoso
      : "";

    // Validade do Alvará (Input type="date" espera formato YYYY-MM-DD)
    if (estacionamento.validade_alvara) {
      validade_alvara.value = estacionamento.validade_alvara.slice(0, 10);
    } else {
      validade_alvara.value = "";
    }

    // Tratamento seguro do Estado e Município com conversão para String
    if (muni && muni.id_estado && estado) {
      const idEstadoStr = String(muni.id_estado);
      estado.value = idEstadoStr;
      await carregarMunicipios(idEstadoStr);

      if (municipio && end.id_municipio) {
        municipio.value = String(end.id_municipio);
      }
    }
  } catch (error) {
    console.error("Erro ao carregar dados para edição:", error);
    alert("Não foi possível carregar as informações do estacionamento.");
  }
}

// Atualizar o estacionamento

async function atualizarEstacionamento(e) {
  e.preventDefault();

  const id = estacionamentoIdInput ? estacionamentoIdInput.value : "";
  if (!id) return;

  const dadosAtualizados = {
    nome: nome.value.trim(),
    id_proprietario: 1, // Valor mock
    cep: cep.value.replace(/\D/g, ""),
    logradouro: logradouro.value.trim(),
    numero: numero.value.trim(),
    bairro: bairro.value.trim(),
    id_municipio: parseInt(municipio.value) || 1,
    latitude: -27.5954, // Valor mock
    longitude: -48.548, // Valor mock
    num_alvara: num_alvara.value.trim(),
    validade_alvara: validade_alvara.value
      ? new Date(validade_alvara.value).toISOString()
      : null,
    hr_abertura: hr_abertura.value,
    hr_fechamento: hr_fechamento.value,
    qtd_vagas_comum: parseInt(qtd_vagas_comum.value) || 0,
    qtd_vagas_pcd: parseInt(qtd_vagas_pcd.value) || 0,
    qtd_vagas_idoso: parseInt(qtd_vagas_idoso.value) || 0,
  };

  try {
    await putEstacionamento(id, dadosAtualizados);
    alert("Estacionamento atualizado com sucesso!");

    // Redireciona para meus estacionamentos
    window.location.href = "../meus_estacionamentos/meus_estacionamentos.html";
  } catch (error) {
    console.error("Erro ao atualizar estacionamento:", error);
    alert("Ocorreu um erro ao salvar as alterações.");
  }
}

// Inicialização das funcoes e dados da pagina ao terminar de carregar

document.addEventListener("DOMContentLoaded", () => {
  carregarDadosEstacionamento();

  if (estado) {
    estado.addEventListener("change", (e) => {
      carregarMunicipios(e.target.value);
    });
  }

  if (formulario) {
    formulario.addEventListener("submit", atualizarEstacionamento);
  }
});
