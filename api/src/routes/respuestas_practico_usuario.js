import { Router } from 'express';
import { run } from '../db.js';
import Joi from 'joi';
import oracledb from 'oracledb';

const r = Router();

const schema = Joi.object({
  pregunta_practico_id_pregunta_practico: Joi.number().integer().required(),
  examen_id_examen: Joi.number().integer().required(),
  nota: Joi.number().min(0).required()
});

r.get('/', async (_req, res) => {
  const { rows } = await run('SELECT * FROM RESPUESTA_PRACTICO_USUARIO ORDER BY ID_RESPUESTA_PRACTICO DESC');
  res.json(rows);
});

r.post('/', async (req, res) => {
  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const sql = `INSERT INTO RESPUESTA_PRACTICO_USUARIO (
     ID_RESPUESTA_PRACTICO, PREGUNTA_PRACTICO_ID_PREGUNTA_PRACTICO, EXAMEN_ID_EXAMEN, NOTA
  ) VALUES (NULL, :P, :E, :N)
  RETURNING ID_RESPUESTA_PRACTICO INTO :OUT_ID`;

  const result = await run(sql, {
    P: value.pregunta_practico_id_pregunta_practico,
    E: value.examen_id_examen,
    N: value.nota,
    OUT_ID: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
  });

  res.status(201).json({ id: result.outBinds.OUT_ID[0], ...value });
});

export default r;
