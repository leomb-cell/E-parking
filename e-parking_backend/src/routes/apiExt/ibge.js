import { Router } from "express";
import ibge from "../../repositories/apiExt/ibge.js";

const router = Router();

router.post("/estados", async (req, res) => {
  try {
    const dadosIbge = await fetch(
      "https://servicodados.ibge.gov.br/api/v1/localidades/estados",
    );
    const estados = await dadosIbge.json();

    // feedback visual de inicio

    console.log(`Processando ${estados.length} estados do IBGE...`);

    const result = await ibge.sincEstados(estados);

    // feedback de conclusão

    console.log(`${estados.length} Estados sincronizados com sucesso.`);

    return res.status(201).json(result);
  } catch (error) {
    console.error("Erro ao sincronizar estados:", error);
    return res.status(500).json({ error: "Erro ao sincronizar estados." });
  }
});

router.post("/municipios", async (req, res) => {
  try {
    // 1. Busca TODOS os municípios do Brasil de uma única vez
    const dadosIbge = await fetch(
      "https://servicodados.ibge.gov.br/api/v1/localidades/municipios",
    );
    const municipios = await dadosIbge.json();

    // feedback visual de inicio

    console.log(`Processando ${municipios.length} municípios do IBGE...`);

    const result = await ibge.sincMunicipios(municipios);

    // feedback de conclusão

    console.log(`${municipios.length} Municípios sincronizados com sucesso.`);

    return res.status(201).json(result);
  } catch (error) {
    console.error("Erro ao sincronizar municípios:", error);
    return res.status(500).json({ error: "Erro ao sincronizar municípios." });
  }
});

export default router;
