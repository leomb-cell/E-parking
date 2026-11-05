import prisma from "../../db.js";

class EstacionamentosRepository {
  // Classe de Estacionamentos para interação com o banco de dados,
  // sem verificação de token e autenticação por simplicidade temporaria

  // cria um usuario

  async create(data) {
    const {
      cep,
      logradouro,
      numero,
      bairro,
      id_municipio,
      latitude,
      longitude,
      id_proprietario,
      nome,
      num_alvara,
      validade_alvara,
      hr_abertura,
      hr_fechamento,
      qtd_vagas_comum,
      qtd_vagas_pcd,
      qtd_vagas_idoso,
    } = data;

    // 1. Primeiro cria o endereço
    const novoEndereco = await prisma.enderecos.create({
      data: {
        cep: cep,
        logradouro: logradouro,
        numero: numero,
        bairro: bairro,
        id_municipio: id_municipio,
        latitude: latitude,
        longitude: longitude,
      },
    });

    const result = await prisma.estacionamentos.create({
      data: {
        nome: nome,
        id_proprietario: id_proprietario,
        id_endereco: novoEndereco.id_endereco,
        hr_abertura: new Date(`1970-01-01T${hr_abertura}:00.000Z`),
        hr_fechamento: new Date(`1970-01-01T${hr_fechamento}:00.000Z`),
        num_alvara: num_alvara,
        validade_alvara: validade_alvara,
        qtd_vagas_comum: qtd_vagas_comum,
        qtd_vagas_pcd: qtd_vagas_pcd,
        qtd_vagas_idoso: qtd_vagas_idoso,
      },
    });

    return result;
  }

  // Seleciona todos os estacionamentos

  async readAll() {}

  // seleciona um estacionamento em especifico pelo id

  async read() {}

  // atualiza um usuario

  async update() {}

  // remove/deleta um usuario

  async delete() {}

  // adiciona tarifas
  async newTarfifa() {}
}

export default new EstacionamentosRepository();
