import 'dotenv/config';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { initPool } from './db.js';
import health from './routes/health.js';
import centros from './routes/centros.js';
import escuelas from './routes/escuelas.js';
import departamentos from './routes/departamentos.js';
import municipios from './routes/municipios.js';
import ubicaciones from './routes/ubicaciones.js';
import registros from './routes/registros.js';
import correlativos from './routes/correlativos.js';
import examenes from './routes/examenes.js';
import respUsuario from './routes/respuestas_usuario.js';
import respPractico from './routes/respuestas_practico_usuario.js';
import preguntas from './routes/preguntas.js';
import preguntasPractico from './routes/preguntas_practico.js';
import consultas from './routes/consultas.js';


const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/health', health);
app.use('/centros', centros);
app.use('/escuelas', escuelas);
app.use('/departamentos', departamentos);
app.use('/municipios', municipios);
app.use('/ubicaciones', ubicaciones);
app.use('/registros', registros);
app.use('/correlativos', correlativos);
app.use('/examenes', examenes);
app.use('/respuestas-usuario', respUsuario);
app.use('/respuestas-practico', respPractico);
app.use('/preguntas', preguntas);
app.use('/preguntas-practico', preguntasPractico);

app.use('/consultas', consultas);



const PORT = process.env.PORT || 3000;
initPool().then(() => {
  app.listen(PORT, () => console.log(`API lista en :${PORT}`));
}).catch(err => {
  console.error('Error iniciando pool Oracle:', err);
  process.exit(1);
});
