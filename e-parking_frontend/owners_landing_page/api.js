async function request(metodo, caminho, dados) {
  const opcoes = {
    method: metodo,
    headers: {}
  };

  // Só enviamos corpo quando há dados (POST e PUT)
  if (dados) {
    opcoes.headers["Content-Type"] = "application/json";
    opcoes.body = JSON.stringify(dados);
  }

  const resposta = await fetch(API_URL + caminho, opcoes);

  // O fetch não trata 401, 404 ou 500 como erro: verificamos nós mesmos
  if (!resposta.ok) {
    const erro = new Error(
      "O servidor respondeu com o status " + resposta.status,
    );
    erro.status = resposta.status; // guardamos o status para usar depois
    throw erro;
  }

  // 204 (No Content) significa sucesso SEM corpo: não há JSON para ler
  if (resposta.status === 204) {
    return null;
  }

  return resposta.json();
}

// lista todos os usuários (GET /users)
async function getEstados() {
  const estados = await request("GET", "/enderecos/estados/");

  if (estados === null) {
    return [];
  }

  return estados;
}

// lista todos os municipios de um estado
async function getMunicipiosEstado(id_estado) {
  const municipios = await request(
    "GET",
    `/enderecos/estados/${id_estado}/municipios`,
  );

  if (municipios === null) {
    return [];
  }

  return municipios;
}

// crud de estacionamentos

// cria um estacionamento (POST /estacionamentos)
async function createEstacionamento(dados) {
  return request("POST", "/estacionamentos", dados);
}

// Lista todos os Estacionamentos de um usuario (GET /estacionamentos/:id)
async function getEstacionamentos(id) {
  const estacionamentos = await request("GET", `/usuarios/estacionamentos/${id}`);

  if (estacionamentos === null) {
    return [];
  }

  return estacionamentos;
}

// retorna um estacionamento (GET /estacionamentos/:id)
async function getEstacionamentoPorId(id) {
  const estacionamentos = await request("GET", `/estacionamentos/${id}`);

  if (estacionamentos === null) {
    return [];
  }

  return estacionamentos;
}

// altera um estacionamento (PUT /estacionamentos/{id})
async function putEstacionamento(id, dados) {
  return request("PUT", `/estacionamentos/${id}` , dados);
}

// exclui um usuário (DELETE /estacionamentos/{id})
async function deleteEstacionamento(id) {
return request("DELETE", `/estacionamentos/${id}`);
}
