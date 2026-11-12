import { Router } from "express";
import EstacionamentosRepository from "../../repositories/proprietarios/estacionamentos.js";

const router = Router();

// novo estacionamento
router.post("/", async (req, res) => {
  try {
    const {
      nome,
      id_proprietario,
      cep,
      logradouro,
      numero,
      bairro,
      id_municipio,
      num_alvara,
      validade_alvara,
      hr_abertura,
      hr_fechamento,
      qtd_vagas_comum,
      qtd_vagas_pcd,
      qtd_vagas_idoso,
    } = req.body;

    // Exemplo de validação simples para garantir que os principais campos vieram
    if (
      !nome ||
      !id_proprietario ||
      !cep ||
      !logradouro ||
      !numero ||
      !bairro ||
      !id_municipio ||
      !num_alvara ||
      !validade_alvara ||
      !hr_abertura ||
      !hr_fechamento ||
      !qtd_vagas_comum ||
      !qtd_vagas_pcd ||
      !qtd_vagas_idoso
    ) {
      return res.status(400).json({
        error:
          "Preencha todos os campos obrigatórios do estacionamento e do endereço.",
      });
    }

    // Chama o repositório passando o req.body inteiro (que já contém todas as propriedades desestruturadas acima)
    const resultado = await EstacionamentosRepository.create(req.body);

    return res.status(201).json({
      message: "Estacionamento cadastrado com sucesso!",
      estacionamento: resultado,
    });
  } catch (error) {
    console.error("Erro ao cadastrar estacionamento:", error);
    return res
      .status(500)
      .json({ error: "Erro interno ao cadastrar estacionamento." });
  }
});

// todos os estacionamentos
router.get("/", async (req, res) => {
  return res.status(200).json({ msg: "todos os estacionamentos" });
});

// todos os estacionamentos de um usuario
router.get("/usuario/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await EstacionamentosRepository.readUserEstacionamentos(id);
    return res.status(201).json(result);
  } catch (error) {
    console.error("Erro ao cadastrar estacionamento:", error);
    return res
      .status(500)
      .json({ error: "Erro interno ao buscar estacionamentos." });
  }
});

// um estacionamento especifico pelo id
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await EstacionamentosRepository.readEstacionamento(id);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Erro ao cadastrar estacionamento:", error);
    return res
      .status(500)
      .json({ error: "Erro interno ao buscar estacionamentos." });
  }
});

// update
router.put("/:id", async (req, res) => {
  try {
    const {
      nome,
      id_proprietario,
      cep,
      logradouro,
      numero,
      bairro,
      id_municipio,
      num_alvara,
      validade_alvara,
      hr_abertura,
      hr_fechamento,
      qtd_vagas_comum,
      qtd_vagas_pcd,
      qtd_vagas_idoso,
    } = req.body;

    const {id} = req.params;

    // Exemplo de validação simples para garantir que os principais campos vieram
    if (
      !nome ||
      !id_proprietario ||
      !cep ||
      !logradouro ||
      !numero ||
      !bairro ||
      !id_municipio ||
      !num_alvara ||
      !validade_alvara ||
      !hr_abertura ||
      !hr_fechamento ||
      !qtd_vagas_comum ||
      !qtd_vagas_pcd ||
      !qtd_vagas_idoso
    ) {
      return res.status(400).json({
        error:
          "Preencha todos os campos obrigatórios do estacionamento e do endereço.",
      });
    }

    // Chama o repositório passando o req.body inteiro (que já contém todas as propriedades desestruturadas acima)
    const resultado = await EstacionamentosRepository.update(id,req.body);

    return res.status(200).json({
      message: "Estacionamento atualizado com sucesso!",
      estacionamento: resultado,
    });
  } catch (error) {
    console.error("Erro ao atualizar estacionamento:", error);
    return res
      .status(500)
      .json({ error: "Erro interno ao atualizar estacionamento." });
  }
});

// delete
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await EstacionamentosRepository.delete(id);
    return res.status(204).send();
  } catch (error) {
    console.error("Erro ao deletar estacionamento:", error);
    return res
      .status(500)
      .json({ error: "Erro interno ao deletar estacionamentos." });
  }
});

// Tarifas
router.post("/tarifas/:id", async (rec, res) => {
  return res.status(200).json({ msg: "Tarifas estacionamentos" });
});

export default router;
