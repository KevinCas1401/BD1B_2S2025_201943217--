import { Router } from 'express';
import { run } from '../db.js';
import Joi from 'joi';
import oracledb from 'oracledb';

const r = Router();

const schema = Joi.object({
  ubicacion_escuela_id_escuela: Joi.number().integer().required(),
  ubicacion_centro_id_centro:   Joi.number().integer().required(),
  municipio_id_municipio:       Joi.number().integer().required(),
  municipio_departamento_id_departamento: Joi.number().integer().required(),
  fecha: Joi.date().required(),
  tipo_tramite:  Joi.string().max(50).allow(null, ''),
  tipo_licencia: Joi.string().max(10).allow(null, ''),
  nombre_completo: Joi.string().max(200).allow(null, ''),
  genero: Joi.string().max(20).allow(null, '')
});

r.get('/', async (_req, res) => {
  const { rows } = await run('SELECT * FROM REGISTRO ORDER BY ID_REGISTRO DESC');
  res.json(rows);
});

r.post('/', async (req, res) => {
  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const sql = `INSERT INTO REGISTRO (
      ID_REGISTRO,
      UBICACION_ESCUELA_ID_ESCUELA,
      UBICACION_CENTRO_ID_CENTRO,
      MUNICIPIO_ID_MUNICIPIO,
      MUNICIPIO_DEPARTAMENTO_ID_DEPARTAMENTO,
      FECHA, TIPO_TRAMITE, TIPO_LICENCIA, NOMBRE_COMPLETO, GENERO
    ) VALUES (
      NULL, :UE, :UC, :MUNI, :DEPTO, :FECHA, :TRAM, :LIC, :NOMBRE, :GEN
    ) RETURNING ID_REGISTRO INTO :OUT_ID`;

  const binds = {
    UE: value.ubicacion_escuela_id_escuela,
    UC: value.ubicacion_centro_id_centro,
    MUNI: value.municipio_id_municipio,
    DEPTO: value.municipio_departamento_id_departamento,
    FECHA: new Date(value.fecha),
    TRAM: value.tipo_tramite ?? null,
    LIC:  value.tipo_licencia ?? null,
    NOMBRE: value.nombre_completo ?? null,
    GEN: value.genero ?? null,
    OUT_ID: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
  };

  const result = await run(sql, binds);
  res.status(201).json({ id: result.outBinds.OUT_ID[0], ...value });
});

export default r;
