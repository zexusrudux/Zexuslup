const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });

app.use(express.json());
app.use(require('cors')());
app.use(express.static('public')); // tu frontend

// Ruta de prueba
app.get('/', (req,res)=> res.send('API Cerca 7M corriendo - 18+'));

// Perfiles cerca (ejemplo sin BD aún, luego conectas Postgres)
app.get('/api/cerca', (req,res)=>{
  const { lat, lng } = req.query;
  // aqui iria tu query a Postgres: SELECT * WHERE distancia < 5km
  res.json([
    { id:1, nombre:"Alex", distancia:"0.3 km", lat: parseFloat(lat)+0.001 },
    { id:2, nombre:"Mau", distancia:"0.8 km", lat: parseFloat(lat)+0.002 }
  ]);
});

io.on('connection', socket => {
  console.log('conectado');
  socket.on('mensaje', data => io.emit('mensaje', data));
});

http.listen(10000, ()=> console.log('Listo en puerto 10000'));
