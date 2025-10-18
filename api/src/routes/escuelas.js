import { Router } from 'express';
import { run } from '../db.js';
import Joi from 'joi';
import oracledb from 'oracledb';

const r = Router();

// GET: todas
r.get('/', async (req, res) => {
  const { rows } = await run('SELECT * FROM ESCUELA ORDER BY ID_ESCUELA');
  res.json(rows);
});

// GET: por id
r.get('/:id', async (req, res) => {
  const { rows } = await run(
    'SELECT * FROM ESCUELA WHERE ID_ESCUELA = :id',
    { id: Number(req.params.id) }
  );
  if (!rows.length) return res.status(404).json({ message: 'Escuela no encontrada' });
  res.json(rows[0]);
});

// POST: crear
r.post('/', async (req, res) => {
  const schema = Joi.object({
    nombre: Joi.string().max(150).required(),
    direccion: Joi.string().max(200).allow(null, ''),
    acuerdo: Joi.string().max(100).allow(null, '')
  });
  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const sql = `INSERT INTO ESCUELA (ID_ESCUELA, NOMBRE, DIRECCION, ACUERDO)
               VALUES (NULL, :nombre, :direccion, :acuerdo)
               RETURNING ID_ESCUELA INTO :out_id`;

  const result = await run(sql, {
    nombre: value.nombre,
    direccion: value.direccion ?? null,
    acuerdo: value.acuerdo ?? null,
    out_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
  });

  res.status(201).json({
    id: result.outBinds.out_id[0],
    nombre: value.nombre,
    direccion: value.direccion ?? null,
    acuerdo: value.acuerdo ?? null
  });
});

// PUT: actualizar
r.put('/:id', async (req, res) => {
  const schema = Joi.object({
    nombre: Joi.string().max(150).required(),
    direccion: Joi.string().max(200).allow(null, ''),
    acuerdo: Joi.string().max(100).allow(null, '')
  });
  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { rowsAffected } = await run(
    `UPDATE ESCUELA
     SET NOMBRE = :nombre, DIRECCION = :direccion, ACUERDO = :acuerdo
     WHERE ID_ESCUELA = :id`,
    {
      id: Number(req.params.id),
      nombre: value.nombre,
      direccion: value.direccion ?? null,
      acuerdo: value.acuerdo ?? null
    }
  );

  if (!rowsAffected) return res.status(404).json({ message: 'Escuela no encontrada' });
  res.json({
    id: Number(req.params.id),
    nombre: value.nombre,
    direccion: value.direccion ?? null,
    acuerdo: value.acuerdo ?? null
  });
});

// DELETE: eliminar
r.delete('/:id', async (req, res) => {
  const { rowsAffected } = await run(
    'DELETE FROM ESCUELA WHERE ID_ESCUELA = :id',
    { id: Number(req.params.id) }
  );
  if (!rowsAffected) return res.status(404).json({ message: 'Escuela no encontrada' });
  res.status(204).end();
});

export default r;
