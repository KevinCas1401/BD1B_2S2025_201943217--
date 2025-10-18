import { Router } from 'express';
import { run } from '../db.js';
import Joi from 'joi';

const r = Router();

const bodySchema = Joi.object({
  registro_id_escuela: Joi.number().integer().required(),
  registro_id_centro: Joi.number().integer().required(),
  registro_municipio_id_municipio: Joi.number().integer().required(),
  registro_municipio_departamento_id_departamento: Joi.number().integer().required(),
  registro_id_registro: Joi.number().integer().required(),
  correlativo_id_correlativo: Joi.number().integer().required()
});

r.get('/', async (_req, res) => {
  const { rows } = await run('SELECT * FROM EXAMEN ORDER BY ID_EXAMEN DESC');
  res.json(rows);
});

r.post('/', async (req, res) => {
  const { error, value } = bodySchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const sql = `INSERT INTO EXAMEN (
    ID_EXAMEN,
    REGISTRO_ID_ESCUELA, REGISTRO_ID_CENTRO,
    REGISTRO_MUNICIPIO_ID_MUNICIPIO,
    REGISTRO_MUNICIPIO_DEPARTAMENTO_ID_DEPARTAMENTO,
    REGISTRO_ID_REGISTRO,
    CORRELATIVO_ID_CORRELATIVO
  ) VALUES (
    NULL, :REGISTRO_ID_ESCUELA, :REGISTRO_ID_CENTRO,
    :REGISTRO_MUNICIPIO_ID_MUNICIPIO,
    :REGISTRO_MUNICIPIO_DEPARTAMENTO_ID_DEPARTAMENTO,
    :REGISTRO_ID_REGISTRO,
    :CORRELATIVO_ID_CORRELATIVO
  )`;
  await run(sql, value);
  res.status(201).json({ message: 'Creado' });
});

export default r;
