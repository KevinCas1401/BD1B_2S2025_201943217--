
import { Router } from 'express';
import { run } from '../db.js';
import Joi from 'joi';
import oracledb from 'oracledb';

const r = Router();

r.get('/', async (_req, res) => {
  const { rows } = await run('SELECT * FROM DEPARTAMENTO ORDER BY ID_DEPARTAMENTO');
  res.json(rows);
});

r.get('/:id', async (req, res) => {
  const { rows } = await run(
    'SELECT * FROM DEPARTAMENTO WHERE ID_DEPARTAMENTO = :id',
    { id: Number(req.params.id) }
  );
  if (!rows.length) return res.status(404).json({ message: 'Departamento no encontrado' });
  res.json(rows[0]);
});

r.post('/', async (req, res) => {
  const schema = Joi.object({
    nombre: Joi.string().max(100).required(),
    codigo: Joi.number().integer().allow(null)
  });
  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const sql = `INSERT INTO DEPARTAMENTO (ID_DEPARTAMENTO, NOMBRE, CODIGO)
               VALUES (NULL, :nombre, :codigo)
               RETURNING ID_DEPARTAMENTO INTO :out_id`;
  const result = await run(sql, {
    nombre: value.nombre,
    codigo: value.codigo ?? null,
    out_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
  });
  res.status(201).json({ id: result.outBinds.out_id[0], ...value });
});

r.put('/:id', async (req, res) => {
  const schema = Joi.object({
    nombre: Joi.string().max(100).required(),
    codigo: Joi.number().integer().allow(null)
  });
  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { rowsAffected } = await run(
    'UPDATE DEPARTAMENTO SET NOMBRE = :nombre, CODIGO = :codigo WHERE ID_DEPARTAMENTO = :id',
    { id: Number(req.params.id), nombre: value.nombre, codigo: value.codigo ?? null }
  );
  if (!rowsAffected) return res.status(404).json({ message: 'Departamento no encontrado' });
  res.json({ id: Number(req.params.id), ...value });
});

r.delete('/:id', async (req, res) => {
  const { rowsAffected } = await run(
    'DELETE FROM DEPARTAMENTO WHERE ID_DEPARTAMENTO = :id',
    { id: Number(req.params.id) }
  );
  if (!rowsAffected) return res.status(404).json({ message: 'Departamento no encontrado' });
  res.status(204).end();
});

export default r;
