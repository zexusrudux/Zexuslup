const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const app = express();
app.use(express.json());
app.use(express.static('public'));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// crear tablas si no existen
(async()=>{
  await pool.query(`
    CREATE TABLE IF NOT EXISTS perfiles (
      id TEXT PRIMARY KEY,
      nombre TEXT UNIQUE,
      foto TEXT,
      lat DOUBLE PRECISION,
      lng DOUBLE PRECISION,
      edad TEXT,
      rol TEXT,
      bio TEXT,
      gustos TEXT,
      altura TEXT,
      creado TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS mensajes (
      id SERIAL PRIMARY KEY,
      key TEXT,
      de TEXT,
      texto TEXT,
      hora BIGINT
    );
  `);
  console.log('Tablas listas');
})();

app.get('/api/cerca', async (req,res)=>{
  if(req.query.clave !== '7M2026') return res.status(401).json([]);
  const {rows} = await pool.query('SELECT * FROM perfiles');
  const lat = parseFloat(req.query.lat), lng = parseFloat(req.query.lng);
  const conDist = rows.map(p=>{
    const d = Math.sqrt(Math.pow(p.lat-lat,2)+Math.pow(p.lng-lng,2))*111;
    return {...p, _d:d};
  }).sort((a,b)=>a._d-b._d);
  res.json(conDist);
});

app.post('/api/registro', async (req,res)=>{
  const p = req.body;
  await pool.query(`
    INSERT INTO perfiles (id,nombre,foto,lat,lng,edad,rol,bio,gustos,altura)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    ON CONFLICT (id) DO UPDATE SET nombre=$2,foto=$3,lat=$4,lng=$5,edad=$6,rol=$7,bio=$8,gustos=$9,altura=$10
  `,[p.id,p.nombre,p.foto,p.lat,p.lng,p.edad||'',p.rol||'',p.bio||'',p.gustos||'',p.altura||'']);
  res.json({ok:true});
});

app.get('/api/mensajes/:key', async (req,res)=>{
  const {rows} = await pool.query('SELECT * FROM mensajes WHERE key=$1 ORDER BY hora ASC',[req.params.key]);
  res.json(rows);
});

app.post('/api/mensajes/:key', async (req,res)=>{
  await pool.query('INSERT INTO mensajes (key,de,texto,hora) VALUES ($1,$2,$3,$4)',[req.params.key,req.body.de,req.body.text,Date.now()]);
  res.json({ok:true});
});

const port = process.env.PORT || 3000;
app.listen(port, ()=>console.log('7M con Postgres en '+port));
