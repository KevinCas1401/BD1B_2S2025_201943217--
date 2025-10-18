import { Router } from 'express';
import { run } from '../db.js';
import Joi from 'joi';
import oracledb from 'oracledb';  

const r = Router();

r.get('/', async (req, res) => {
  const { rows } = await run('SELECT * FROM CENTRO ORDER BY ID_CENTRO');
  res.json(rows);
});

r.get('/:id', async (req, res) => {
  const { rows } = await run('SELECT * FROM CENTRO WHERE ID_CENTRO = :id', { id: Number(req.params.id) });
  if (!rows.length) return res.status(404).json({ message: 'Centro no encontrado' });
  res.json(rows[0]);
});

r.post('/', async (req, res) => {
  const schema = Joi.object({ nombre: Joi.string().max(100).required() });
  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const sql = `INSERT INTO CENTRO (ID_CENTRO, NOMBRE)
               VALUES (NULL, :nombre)
               RETURNING ID_CENTRO INTO :out_id`;

  const result = await run(sql, {
    nombre: value.nombre,
    out_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
  });

  res.status(201).json({ id: result.outBinds.out_id[0], nombre: value.nombre });
});

r.put('/:id', async (req, res) => {
  const schema = Joi.object({ nombre: Joi.string().max(100).required() });
  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { rowsAffected } = await run(
    'UPDATE CENTRO SET NOMBRE = :nombre WHERE ID_CENTRO = :id',
    { id: Number(req.params.id), nombre: value.nombre }
  );

  if (!rowsAffected) return res.status(404).json({ message: 'Centro no encontrado' });
  res.json({ id: Number(req.params.id), nombre: value.nombre });
});

r.delete('/:id', async (req, res) => {
  const { rowsAffected } = await run('DELETE FROM CENTRO WHERE ID_CENTRO = :id', { id: Number(req.params.id) });
  if (!rowsAffected) return res.status(404).json({ message: 'Centro no encontrado' });
  res.status(204).end();
});

export default r;
