import prisma from "../../db.js";

class enderecosRepository {
  // busca todos os estados do banco
  async getEstados() {
    const estados = prisma.estados.findMany();
    return estados;
  }

  // busca todos os municipios do banco
  async getMunicipios() {
    const municipios = prisma.municipios.findMany();
    return municipios;
  }

  // busca todos os municipios de um estado do banco
  async getMunicipiosEstado(id) {
    const municipios = prisma.municipios.findMany({
        where: {
            id_estado: Number(id)
        }
    });
    return municipios;
  }
}

export default new enderecosRepository();
