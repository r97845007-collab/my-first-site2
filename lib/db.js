import mysql from "mysql2/promise";

const getPool = () => {
  if (!globalThis.__dbPool) {
    globalThis.__dbPool = mysql.createPool({
      host: process.env.MYSQL_HOST,
      port: Number(process.env.MYSQL_PORT || 3306),
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      connectionLimit: 5,
    });
  }
  return globalThis.__dbPool;
};

export const query = async (sql, params = []) => {
  const [rows] = await getPool().execute(sql, params);
  return rows;
};
