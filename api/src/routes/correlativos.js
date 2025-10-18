import { Router } from 'express';
import { run } from '../db.js';
import Joi from 'joi';
import oracledb from 'oracledb';

const r = Router();

r.get('/', async (_req, res) => {
  const { rows } = await run('SELECT * FROM CORRELATIVO ORDER BY ID_CORRELATIVO DESC');
  res.json(rows);
});

r.post('/', async (req, res) => {
  const schema = Joi.object({
    fecha: Joi.date().required(),
    no_examen: Joi.number().integer().required()
  });
  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const sql = `INSERT INTO CORRELATIVO (ID_CORRELATIVO, FECHA, NO_EXAMEN)
               VALUES (NULL, :FECHA, :NO)
               RETURNING ID_CORRELATIVO INTO :OUT_ID`;
  const result = await run(sql, {
    FECHA: new Date(value.fecha),
    NO: value.no_examen,
    OUT_ID: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
  });
  res.status(201).json({ id: result.outBinds.OUT_ID[0], ...value });
});

export default r;
