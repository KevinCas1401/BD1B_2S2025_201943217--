ALTER SESSION SET CURRENT_SCHEMA = APPUSER;

CREATE OR REPLACE VIEW VW_PUNTEO_TEORICO AS
SELECT ru.examen_id_examen AS id_examen,
       LEAST(COUNT(CASE WHEN ru.respuesta = p.respuesta THEN 1 END) * 4, 100) AS punteo_teorico
FROM   respuesta_usuario ru
JOIN   preguntas p ON p.id_pregunta = ru.pregunta_id_pregunta
GROUP  BY ru.examen_id_examen;

CREATE OR REPLACE VIEW VW_PUNTEO_PRACTICO AS
SELECT rpu.examen_id_examen AS id_examen,
       LEAST(SUM(rpu.nota), 100) AS punteo_practico
FROM   respuesta_practico_usuario rpu
GROUP  BY rpu.examen_id_examen;

CREATE OR REPLACE VIEW VW_EXAMEN_PUNTEOS AS
SELECT e.id_examen,
       r.id_registro,
       r.nombre_completo,
       r.tipo_licencia,
       r.genero,
       r.fecha,
       u.escuela_id_escuela,
       u.centro_id_centro,
       te.punteo_teorico,
       pr.punteo_practico,
       (NVL(te.punteo_teorico,0) + NVL(pr.punteo_practico,0)) AS punteo_total,
       CASE WHEN NVL(te.punteo_teorico,0) >= 70 AND NVL(pr.punteo_practico,0) >= 70
            THEN 'APROBADO' ELSE 'REPROBADO' END AS resultado
FROM   examen e
JOIN   registro r ON r.id_registro = e.registro_id_registro
JOIN   ubicacion u ON (u.escuela_id_escuela = e.registro_id_escuela AND u.centro_id_centro = e.registro_id_centro)
LEFT   JOIN vw_punteo_teorico te  ON te.id_examen = e.id_examen
LEFT   JOIN vw_punteo_practico pr ON pr.id_examen = e.id_examen;

CREATE OR REPLACE VIEW VW_PREGUNTA_ACIERTOS AS
SELECT p.id_pregunta,
       p.res1, p.res2, p.res3, p.res4, p.respuesta AS correcta,
       COUNT(*) AS total_respuestas,
       SUM(CASE WHEN ru.respuesta = p.respuesta THEN 1 ELSE 0 END) AS total_aciertos,
       ROUND(CASE WHEN COUNT(*) = 0 THEN 0 ELSE (SUM(CASE WHEN ru.respuesta = p.respuesta THEN 1 ELSE 0 END) * 100.0) / COUNT(*) END, 2) AS pct_aciertos
FROM   preguntas p
LEFT   JOIN respuesta_usuario ru ON ru.pregunta_id_pregunta = p.id_pregunta
GROUP  BY p.id_pregunta, p.res1, p.res2, p.res3, p.res4, p.respuesta;
