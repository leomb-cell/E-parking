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

  async readAll() {
    try {
      const estacionamentos = await prisma.estacionamentos.findMany({
        include: {
          enderecos: {
            include: {
              municipios: true,
            },
          },
        },
      });
      return estacionamentos;
    } catch (error) {
      console.error("Erro ao buscar estacionamentos (repository):", error);
      throw error;
    }
  }

  // Seleciona todos os estacionamentos

  async readUserEstacionamentos(id) {
    try {
      const estacionamentos = await prisma.estacionamentos.findMany({
        where: {
          id_proprietario: Number(id),
        },
        include: {
          enderecos: {
            include: {
              municipios: true,
            },
          },
        },
      });
      return estacionamentos;
    } catch (error) {
      console.error(
        "Erro ao buscar estacionamentos do usuario (repository):",
        error,
      );
      throw error;
    }
  }

  // seleciona um estacionamento em especifico pelo id

  async readEstacionamento(id) {
    const result = await prisma.estacionamentos.findUnique({
      where: {
        id_estacionamento: Number(id),
      },
      include: {
        enderecos: {
          include: {
            municipios: true,
          },
        },
      },
    });
    return result;
  }

  // atualiza um usuario

  async update(id, dados) {
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
    } = dados;

    // recuperando o id do endereço

    const endereco = await this.readEstacionamento(id);

    const novoEndereco = await prisma.enderecos.update({
      where: {
        id_endereco: Number(endereco.id_endereco),
      },
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

    const result = await prisma.estacionamentos.update({
      where: {
        id_estacionamento: Number(id),
      },
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

  // remove/deleta um usuario

  async delete(id) {
    try {
      const result = await prisma.estacionamentos.delete({
        where: {
          id_estacionamento: Number(id),
        },
      });

      return result;
    } catch (error) {
      console.error("Erro ao deletar estacionamento (repository):", error);
      throw error;
    }
  }

  // adiciona tarifas
  async newTarfifa() {}
}

export default new EstacionamentosRepository();
