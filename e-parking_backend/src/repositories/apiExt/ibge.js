import prisma from "../../db.js";

class EstacionamentosRepository {
  async sincEstados(data) {
    for (const est of data) {
      // 1. Verifica se o estado já existe pelo codigo_ibge
      const estadoExistente = await prisma.estados.findUnique({
        where: { codigo_ibge: est.id },
      });

      if (estadoExistente) {
        // 2. Se existe, atualiza
        await prisma.estados.update({
          where: { codigo_ibge: est.id },
          data: {
            nome: est.nome,
            uf: est.sigla,
          },
        });
      } else {
        // 3. Se não existe, cria um novo
        await prisma.estados.create({
          data: {
            codigo_ibge: est.id,
            nome: est.nome,
            uf: est.sigla,
          },
        });
      }
    }
  }

  async sincMunicipios(municipios) {
    for (const municipio of municipios) {
      // Proteção contra municípios que não possuem microrregião preenchida na API

      const ufIbge = municipio.microrregiao?.mesorregiao?.UF;

      if (!ufIbge) {
        console.warn(
          `Município ignorado por falta de dados de UF: ${municipio.nome} (ID: ${municipio.id})`,
        );
        continue;
      }

      const codigoIbgeEstado = ufIbge.id;

      const estadoBanco = await prisma.estados.findUnique({
        where: { codigo_ibge: codigoIbgeEstado },
      });

      //   verifica se o municipio existe ou não previamente
      if (estadoBanco) {
        const municipioExistente = await prisma.municipios.findUnique({
          where: { codigo_ibge: municipio.id },
        });

        if (municipioExistente) {
          // Se existe, atualiza
          await prisma.municipios.update({
            where: { codigo_ibge: municipio.id },
            data: {
              nome: municipio.nome,
              id_estado: estadoBanco.id_estado,
            },
          });
        } else {
          // Se não existe, cria um novo
          await prisma.municipios.create({
            data: {
              codigo_ibge: municipio.id,
              nome: municipio.nome,
              id_estado: estadoBanco.id_estado,
            },
          });
        }
      }
    }
  }
}

export default new EstacionamentosRepository();
