import express from 'express';
import 'dotenv/config';
import prisma from './db.js';

// rotas

import estacionamentosRoutes from './routes/proprietarios/estacionamentos.js';
import ibgeRoutes from './routes/apiExt/ibge.js';

const app = express();

const port = process.env.PORT || 3001;

app.use(express.json());

// registro de prefixios das rotas

app.use('/estacionamentos', estacionamentosRoutes);

app.use('/ibge', ibgeRoutes);

app.use((err, req, res, next) => {
  if (err.code === 'P2025')
    return res.status(404).json({ error: 'Registry not found' });

  if (err.code === 'P2003')
    return res.status(409).json({ error: 'Foreign key constraint: check the relationships' });

  if (err.type === 'entity.parse.failed')
    return res.status(400).json({ error: 'Invalid JSON' });

  console.error(err);

  res.status(500).json({ error: 'Internal server error' });
});

const server = app.listen(port, () => {
    console.log(`Servidor executando na porta ${port}`);
});

process.on('SIGINT', async () => {
    server.close();
    await prisma.$disconnect();
    process.exit(0);
});
