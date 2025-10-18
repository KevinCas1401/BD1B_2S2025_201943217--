import { Router } from 'express';
import { run } from '../db.js';
import Joi from 'joi';
import oracledb from 'oracledb';

const r = Router();

const schema = Joi.object({
  pregunta_texto: Joi.string().max(500).required(),
  punteo: Joi.number().min(0).required()
});

r.get('/', async (_req, res) => {
  const { rows } = await run('SELECT * FROM PREGUNTAS_PRACTICO ORDER BY ID_PREGUNTA_PRACTICO');
  res.json(rows);
});

r.get('/:id', async (req, res) => {
  const { rows } = await run(
    'SELECT * FROM PREGUNTAS_PRACTICO WHERE ID_PREGUNTA_PRACTICO = :id',
    { id: Number(req.params.id) }
  );
  if (!rows.length) return res.status(404).json({ message: 'Pregunta práctico no encontrada' });
  res.json(rows[0]);
});

r.post('/', async (req, res) => {
  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const sql = `INSERT INTO PREGUNTAS_PRACTICO (ID_PREGUNTA_PRACTICO, PREGUNTA_TEXTO, PUNTEO)
               VALUES (NULL, :pt, :p)
               RETURNING ID_PREGUNTA_PRACTICO INTO :out_id`;

  const result = await run(sql, {
    pt: value.pregunta_texto,
    p: value.punteo,
    out_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
  });

  res.status(201).json({ id: result.outBinds.out_id[0], ...value });
});

r.put('/:id', async (req, res) => {
  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { rowsAffected } = await run(
    `UPDATE PREGUNTAS_PRACTICO
     SET PREGUNTA_TEXTO = :pt, PUNTEO = :p
     WHERE ID_PREGUNTA_PRACTICO = :id`,
    { id: Number(req.params.id), pt: value.pregunta_texto, p: value.punteo }
  );
  if (!rowsAffected) return res.status(404).json({ message: 'Pregunta práctico no encontrada' });
  res.json({ id: Number(req.params.id), ...value });
});

r.delete('/:id', async (req, res) => {
  const { rowsAffected } = await run(
    'DELETE FROM PREGUNTAS_PRACTICO WHERE ID_PREGUNTA_PRACTICO = :id',
    { id: Number(req.params.id) }
  );
  if (!rowsAffected) return res.status(404).json({ message: 'Pregunta práctico no encontrada' });
  res.status(204).end();
});

export default r;
