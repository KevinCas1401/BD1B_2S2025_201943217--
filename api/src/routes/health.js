import { Router } from 'express';
import { run } from '../db.js';

const r = Router();
r.get('/', async (req, res) => {
  try {
    const { rows } = await run('SELECT 1 AS ok FROM dual');
    res.json({ status: 'ok', db: rows?.[0]?.OK === 1 });
  } catch (e) {
    res.status(500).json({ status: 'error', error: e.message });
  }
});
export default r;
