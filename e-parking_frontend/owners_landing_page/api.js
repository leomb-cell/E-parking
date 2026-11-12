async function request(metodo, caminho, dados) {
  const opcoes = {
    method: metodo,
    headers: {},
  };

  // Só enviamos corpo quando há dados (POST e PUT)
  if (dados) {
    opcoes.headers["Content-Type"] = "application/json";
    opcoes.body = JSON.stringify(dados);
  }

  const resposta = await fetch(API_URL + caminho, opcoes);

  if (!resposta.ok) {
    const erro = new Error(
      "O servidor respondeu com o status " + resposta.status,
    );
    erro.status = resposta.status;
    throw erro;
  }

  if (resposta.status === 204) {
    return null;
  }


  return resposta.json();
}

// lista todos os usuários (GET /users)
async function getEstados() {
  try {
    const estados = await request("GET", "/enderecos/estados/");

    if (estados === null) {
      return [];
    }

    return estados;
  } catch (error) {
    console.error("Erro ao buscar estados: ", error);
  }
}

// lista todos os municipios de um estado
async function getMunicipiosEstado(id_estado) {
  try {
    const municipios = await request(
      "GET",
      `/enderecos/estados/${id_estado}/municipios`,
    );

    if (municipios === null) {
      return [];
    }

    return municipios;
  } catch (error) {
    console.error("Erro ao buscar municipios deste estado: ", error);
  }
}

// crud de estacionamentos

// CREATE - cria um estacionamento (POST /estacionamentos)
async function createEstacionamento(dados) {
  try {
    return request("POST", "/estacionamentos", dados);
  } catch (error) {
    console.error("Erro ao criar estacionamento: ", error);
  }
}

// READ -  Lista todos os Estacionamentos de um usuario (GET /estacionamentos/:id)
async function getEstacionamentos(id) {
  const estacionamentos = await request(
    "GET",
    `/estacionamentos/usuario/${id}`,
  );

  if (estacionamentos === null) {
    return [];
  }

  return estacionamentos;
}

// READ - retorna um estacionamento (GET /estacionamentos/:id)
async function getEstacionamentoPorId(id) {
  try {
    const estacionamentos = await request("GET", `/estacionamentos/${id}`);

    if (estacionamentos === null) return [];

    return estacionamentos;
  } catch (error) {
    console.error("Erro ao buscar estacionamentos deste Usuario: ", error);
  }
}

// UPDATE - altera um estacionamento (PUT /estacionamentos/{id})
async function putEstacionamento(id, dados) {
  try {
    return request("PUT", `/estacionamentos/${id}`, dados);
  } catch (error) {
    console.error("Erro ao deletar estacionamento: ", error);
    throw error;
  }
}

// DELETE - exclui um usuário (DELETE /estacionamentos/{id})
async function deleteEstacionamento(id) {
  try {
    return request("DELETE", `/estacionamentos/${id}`);
  } catch (error) {
    console.error("Erro ao deletar estacionamento: ", error);
    throw error;
  }
}
