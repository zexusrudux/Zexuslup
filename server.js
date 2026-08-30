const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static('public'));

// CONEXIÓN A POSTGRES DE RENDER
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

// CREAR TABLAS SI NO EXISTEN
(async () => {
  try {
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
    console.log('✅ Tablas listas - Postgres conectado');
  } catch (e) {
    console.log('❌ Error DB:', e.message);
  }
})();

// MIDDLEWARE CLAVE
function checkClave(req, res, next) {
  const clave = req.query.clave || req.body?.clave;
  if (clave !== '7M2026') return res.status(401).json({ error: 'clave mal' });
  next();
}

// API: CERCA - ORDENADO DEL MÁS CERCA AL MÁS LEJOS
app.get('/api/cerca', checkClave, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM perfiles');
    const lat = parseFloat(req.query.lat) || 20.6896;
    const lng = parseFloat(req.query.lng) || -88.2014;

    const conDist = rows.map(p => {
      // distancia haversine simple en km
      const dLat = (p.lat - lat) * Math.PI / 180;
      const dLon = (p.lng - lng) * Math.PI / 180;
      const a = Math.sin(dLat/2)**2 + Math.cos(lat*Math.PI/180)*Math.cos(p.lat*Math.PI/180)*Math.sin(dLon/2)**2;
      const d = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return { ...p, _d: d };
    }).sort((a,b) => a._d - b._d);

    res.json(conDist);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// API: REGISTRO / ACTUALIZAR PERFIL
app.post('/api/registro', async (req, res) => {
  try {
    const p = req.body;
    if (!p.nombre) return res.status(400).json({ error: 'falta nombre' });

    await pool.query(`
      INSERT INTO perfiles (id,nombre,foto,lat,lng,edad,rol,bio,gustos,altura)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      ON CONFLICT (id) DO UPDATE SET 
        nombre=$2, foto=$3, lat=$4, lng=$5, edad=$6, rol=$7, bio=$8, gustos=$9, altura=$10
    `,[p.id, p.nombre, p.foto, p.lat, p.lng, p.edad||'', p.rol||'Vers', p.bio||'', p.gustos||'', p.altura||'']);

    // también por si cambia de ID pero mismo nombre
    await pool.query(`
      INSERT INTO perfiles (id,nombre,foto,lat,lng,edad,rol,bio,gustos,altura)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      ON CONFLICT (nombre) DO UPDATE SET 
        id=$1, foto=$3, lat=$4, lng=$5, edad=$6, rol=$7, bio=$8, gustos=$9, altura=$10
    `,[p.id, p.nombre, p.foto, p.lat, p.lng, p.edad||'', p.rol||'Vers', p.bio||'', p.gustos||'', p.altura||'']);

    res.json({ ok: true });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: e.message });
  }
});

// API: VER MENSAJES DE UN CHAT
app.get('/api/mensajes/:key', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM mensajes WHERE key=$1 ORDER BY hora ASC', [req.params.key]);
    res.json(rows);
  } catch (e) {
    res.status(500).json([]);
  }
});

// API: ENVIAR MENSAJE
app.post('/api/mensajes/:key', async (req, res) => {
  try {
    if (req.body.clave && req.body.clave !== '7M2026') return res.status(401).json({ error: 'clave' });
    await pool.query('INSERT INTO mensajes (key,de,texto,hora) VALUES ($1,$2,$3,$4)', [req.params.key, req.body.de, req.body.text, Date.now()]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// API: LISTA DE MIS CHATS (para pestaña CHATS)
app.get('/api/mischats', checkClave, async (req, res) => {
  try {
    const yo = req.query.yo;
    const { rows } = await pool.query(`SELECT * FROM mensajes WHERE key LIKE $1 ORDER BY hora DESC`, [`%${yo}%`]);
    
    // agrupar por key y quedarnos con el último mensaje
    const map = {};
    rows.forEach(r => {
      if (!map[r.key]) {
        map[r.key] = { key: r.key, ultimo: r.texto, hora: r.hora, total: 1 };
      } else {
        map[r.key].total++;
      }
    });
    res.json(Object.values(map).sort((a,b)=>b.hora-a.hora));
  } catch (e) {
    res.json([]);
  }
});

// FRONT
app.get('*', (req,res)=>{
  res.sendFile(path.join(__dirname,'public','index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('7M corriendo en puerto '+port));
