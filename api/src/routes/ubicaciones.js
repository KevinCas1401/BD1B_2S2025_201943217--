import { Router } from 'express';
import { run } from '../db.js';
import Joi from 'joi';

const r = Router();

// Lista
r.get('/', async (_req, res) => {
  const { rows } = await run(
    `SELECT u.ESCUELA_ID_ESCUELA, u.CENTRO_ID_CENTRO,
            e.NOMBRE AS ESCUELA, c.NOMBRE AS CENTRO
     FROM UBICACION u
     JOIN ESCUELA e ON e.ID_ESCUELA = u.ESCUELA_ID_ESCUELA
     JOIN CENTRO  c ON c.ID_CENTRO  = u.CENTRO_ID_CENTRO
     ORDER BY u.ESCUELA_ID_ESCUELA, u.CENTRO_ID_CENTRO`
  );
  res.json(rows);
});


r.get('/escuela/:idEscuela/centro/:idCentro', async (req, res) => {
  const { rows } = await run(
    `SELECT * FROM UBICACION
     WHERE ESCUELA_ID_ESCUELA = :es AND CENTRO_ID_CENTRO = :ce`,
    { es: Number(req.params.idEscuela), ce: Number(req.params.idCentro) }
  );
  if (!rows.length) return res.status(404).json({ message: 'Ubicación no encontrada' });
  res.json(rows[0]);
});

// Crear
r.post('/', async (req, res) => {
  const schema = Joi.object({
    escuela_id_escuela: Joi.number().integer().required(),
    centro_id_centro: Joi.number().integer().required()
  });
  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  await run(
    `INSERT INTO UBICACION (ESCUELA_ID_ESCUELA, CENTRO_ID_CENTRO)
     VALUES (:es, :ce)`,
    { es: value.escuela_id_escuela, ce: value.centro_id_centro }
  );
  res.status(201).json(value);
});

// Borrar
r.delete('/escuela/:idEscuela/centro/:idCentro', async (req, res) => {
  const { rowsAffected } = await run(
    `DELETE FROM UBICACION
     WHERE ESCUELA_ID_ESCUELA = :es AND CENTRO_ID_CENTRO = :ce`,
    { es: Number(req.params.idEscuela), ce: Number(req.params.idCentro) }
  );
  if (!rowsAffected) return res.status(404).json({ message: 'Ubicación no encontrada' });
  res.status(204).end();
});

export default r;
