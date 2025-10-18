import { Router } from 'express';
import { run } from '../db.js';
import Joi from 'joi';
import oracledb from 'oracledb';

const r = Router();

const schema = Joi.object({
  pregunta_id_pregunta: Joi.number().integer().required(),
  examen_id_examen: Joi.number().integer().required(),
  respuesta: Joi.number().integer().min(1).max(4).required()
});

r.get('/', async (_req, res) => {
  const { rows } = await run('SELECT * FROM RESPUESTA_USUARIO ORDER BY ID_RESPUESTA_USUARIO DESC');
  res.json(rows);
});

r.post('/', async (req, res) => {
  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const sql = `INSERT INTO RESPUESTA_USUARIO (
     ID_RESPUESTA_USUARIO, PREGUNTA_ID_PREGUNTA, EXAMEN_ID_EXAMEN, RESPUESTA
  ) VALUES (NULL, :P, :E, :R)
  RETURNING ID_RESPUESTA_USUARIO INTO :OUT_ID`;

  const result = await run(sql, {
    P: value.pregunta_id_pregunta,
    E: value.examen_id_examen,
    R: value.respuesta,
    OUT_ID: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
  });

  res.status(201).json({ id: result.outBinds.OUT_ID[0], ...value });
});

export default r;
