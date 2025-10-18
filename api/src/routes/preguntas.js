import { Router } from 'express';
import { run } from '../db.js';
import Joi from 'joi';
import oracledb from 'oracledb';

const r = Router();

const schema = Joi.object({
  pregunta_texto: Joi.string().max(500).required(),
  respuesta: Joi.number().integer().min(1).max(4).required(),
  res1: Joi.string().max(200).required(),
  res2: Joi.string().max(200).required(),
  res3: Joi.string().max(200).required(),
  res4: Joi.string().max(200).allow(null, '')
});

r.get('/', async (_req, res) => {
  const { rows } = await run('SELECT * FROM PREGUNTAS ORDER BY ID_PREGUNTA');
  res.json(rows);
});

r.get('/:id', async (req, res) => {
  const { rows } = await run('SELECT * FROM PREGUNTAS WHERE ID_PREGUNTA = :id', { id: Number(req.params.id) });
  if (!rows.length) return res.status(404).json({ message: 'Pregunta no encontrada' });
  res.json(rows[0]);
});

r.post('/', async (req, res) => {
  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const sql = `INSERT INTO PREGUNTAS (ID_PREGUNTA, PREGUNTA_TEXTO, RESPUESTA, RES1, RES2, RES3, RES4)
               VALUES (NULL, :pt, :r, :r1, :r2, :r3, :r4)
               RETURNING ID_PREGUNTA INTO :out_id`;

  const result = await run(sql, {
    pt: value.pregunta_texto, r: value.respuesta,
    r1: value.res1, r2: value.res2, r3: value.res3, r4: value.res4 ?? null,
    out_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
  });

  res.status(201).json({ id: result.outBinds.out_id[0], ...value });
});

r.put('/:id', async (req, res) => {
  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { rowsAffected } = await run(
    `UPDATE PREGUNTAS SET
       PREGUNTA_TEXTO = :pt, RESPUESTA = :r, RES1 = :r1, RES2 = :r2, RES3 = :r3, RES4 = :r4
     WHERE ID_PREGUNTA = :id`,
    {
      id: Number(req.params.id),
      pt: value.pregunta_texto, r: value.respuesta,
      r1: value.res1, r2: value.res2, r3: value.res3, r4: value.res4 ?? null
    }
  );
  if (!rowsAffected) return res.status(404).json({ message: 'Pregunta no encontrada' });
  res.json({ id: Number(req.params.id), ...value });
});

r.delete('/:id', async (req, res) => {
  const { rowsAffected } = await run('DELETE FROM PREGUNTAS WHERE ID_PREGUNTA = :id', { id: Number(req.params.id) });
  if (!rowsAffected) return res.status(404).json({ message: 'Pregunta no encontrada' });
  res.status(204).end();
});

export default r;
