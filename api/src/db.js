import oracledb from 'oracledb';

const config = {
  user: process.env.DB_USER || 'APPUSER',
  password: process.env.DB_PASSWORD || 'AppUser123',
  connectString: process.env.DB_CONNECTSTRING || 'oracle-db:1521/XEPDB1',
  poolMin: 1, poolMax: 5, poolIncrement: 1
};

let pool;
export async function initPool() {
  if (!pool) pool = await oracledb.createPool(config);
}

export async function run(sql, binds = {}, opts = {}) {
  const conn = await oracledb.getConnection();
  try {
    const res = await conn.execute(sql, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
      autoCommit: true,
      ...opts
    });
    return res;
  } finally {
    await conn.close();
  }
}
