import { Router } from 'express';
import { run } from '../db.js';

const r = Router();

r.get('/estadisticas', async (_req, res) => {
  const sql = `
    SELECT c.nombre AS centro,
           e.nombre AS escuela,
           COUNT(v.id_examen) AS total_examenes,
           ROUND(AVG(NVL(v.punteo_teorico,0)), 2)  AS promedio_teorico,
           ROUND(AVG(NVL(v.punteo_practico,0)), 2) AS promedio_practico,
           SUM(CASE WHEN v.resultado = 'APROBADO' THEN 1 ELSE 0 END) AS total_aprobados
    FROM   vw_examen_punteos v
    JOIN   centro c   ON c.id_centro = v.centro_id_centro
    JOIN   escuela e  ON e.id_escuela = v.escuela_id_escuela
    GROUP  BY c.nombre, e.nombre
    ORDER  BY c.nombre, e.nombre`;
  const { rows } = await run(sql);
  res.json(rows);
});

r.get('/ranking', async (_req, res) => {
  const sql = `
    SELECT v.nombre_completo, v.tipo_licencia, v.genero, v.fecha,
           v.punteo_teorico, v.punteo_practico, v.punteo_total, v.resultado,
           c.nombre AS centro, e.nombre AS escuela
    FROM   vw_examen_punteos v
    JOIN   centro c  ON c.id_centro = v.centro_id_centro
    JOIN   escuela e ON e.id_escuela = v.escuela_id_escuela
    ORDER BY CASE WHEN v.resultado = 'APROBADO' THEN 0 ELSE 1 END,
             v.punteo_total DESC,
             v.fecha DESC`;
  const { rows } = await run(sql);
  res.json(rows);
});

r.get('/pregunta-dificil', async (_req, res) => {
  const sql = `
    SELECT *
    FROM   vw_pregunta_aciertos
    WHERE  total_respuestas > 0
    ORDER  BY pct_aciertos ASC
    FETCH FIRST 1 ROWS ONLY`;
  const { rows } = await run(sql);
  res.json(rows[0] || { message: 'No hay respuestas registradas' });
});

export default r;
