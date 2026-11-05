import prisma from "../../db.js";

class EstacionamentosRepository {
  // Classe de Estacionamentos para interação com o banco de dados,
  // sem verificação de token e autenticação por simplicidade temporaria

  // cria um usuario

  create = (data) => prisma.estacionamentos.create({ data });

  // Seleciona todos os estacionamentos

  readAll = () => {};

  // seleciona um estacionamento em especifico pelo id

  read = (id_usuario) => {};

  // atualiza um usuario

  update = (id, data) => {};

  // remove/deleta um usuario

  delete = (id) => {};

  // adiciona tarifas
  newTarfifa = (id) => {};
}

export default new EstacionamentosRepository();
