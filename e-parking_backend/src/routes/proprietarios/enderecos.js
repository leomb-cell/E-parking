import { Router } from "express";
import enderecosRepository from "../../repositories/proprietarios/enderecos.js";

const router = Router();

// todos os estados
router.get("/estados", async (req, res) => {
  const estados = await enderecosRepository.getEstados();
  if (estados.length <= 0) {
    return res.status(400);
  } else {
    return res.json(estados);
  }
});

// todos os municipios
router.get("/municipios", async (req, res) => {
  const municipios = await enderecosRepository.getMunicipios();
  if (municipios.length <= 0) {
    return res.status(400);
  } else {
    return res.json(municipios);
  }
});

// todos os municipios de um estado
router.get("/estados/:id/municipios", async (req, res) => {
  const { id } = req.params;
  const municipios = await enderecosRepository.getMunicipiosEstado(id);
  if (municipios.length <= 0) {
    return res.status(400);
  } else {
    return res.json(municipios);
  }
});

export default router;
