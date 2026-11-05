import { Router } from "express";
import estacionamentos from "../../repositories/proprietarios/estacionamentos.js";

const router = Router();

// novo estacionamento
router.post("/", async (req, res) => {
  const {
    id_proprietario,
    id_endereco,
    nome,
    num_alvara,
    validade_alvara,
    hr_abertura,
    hr_fechamento,
    qtd_vagas_comum,
    qtd_vagas_pcd,
    qtd_vagas_idoso,
  } = req.body;

  // Verificando a validade dos dados recebidos pelo request

  if (!nome || typeof nome !== "string" || nome.trim() === "") {
    return res.status(400).json({ error: "O campo nome precisa ser válido!" });
  }
  if (!num_alvara) {
    return res
      .status(400)
      .json({ error: "O campo num_alvara precisa ser válido!" });
  }
  if (!validade_alvara) {
    return res
      .status(400)
      .json({ error: "O campo validade_alvara precisa ser válido!" });
  }
  if (!hr_abertura) {
    return res
      .status(400)
      .json({ error: "O campo hr_abertura precisa ser válido!" });
  }
  if (!hr_fechamento) {
    return res
      .status(400)
      .json({ error: "O campo hr_fechamento precisa ser válido!" });
  }
  if (!id_proprietario || !id_endereco) {
    return res
      .status(400)
      .json({
        error: "Os campos id_proprietario e id_endereco são obrigatórios!",
      });
  }

  try {
    const data = {
      id_proprietario: Number(id_proprietario),
      id_endereco: Number(id_endereco),
      nome: nome.trim(),
      num_alvara: num_alvara,
      validade_alvara: new Date(validade_alvara), // Converte para objeto Date do JS
      hr_abertura: new Date(`1970-01-01T${hr_abertura}Z`), // Formato compatível com @db.Time do Prisma
      hr_fechamento: new Date(`1970-01-01T${hr_fechamento}Z`),
      qtd_vagas_comum: qtd_vagas_comum ? Number(qtd_vagas_comum) : 0,
      qtd_vagas_pcd: qtd_vagas_pcd ? Number(qtd_vagas_pcd) : 0,
      qtd_vagas_idoso: qtd_vagas_idoso ? Number(qtd_vagas_idoso) : 0,
    };

    const result = await estacionamentos.create(data);

    return res.status(201).json(result);
  } catch (error) {
    if (error.code === "P2002") {
      return res
        .status(409)
        .json({
          error:
            "Já existe um estacionamento cadastrado com este alvará ou dados duplicados.",
        });
    }
    console.error(error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// todos os estacionamentos
router.get("/", async (req, res) => {});

// um estacionamento especifico pelo id
router.get("/:id", async (req, res) => {});

// update
router.put("/:id", async (req, res) => {});

// delete
router.delete("/:id", async (req, res) => {});

// Tarifas
router.post("/tarifas/:id", async (rec, res) => {});

export default router;