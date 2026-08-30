const express = require('express');
const path = require('path');
const app = express();
app.use(express.json());
app.use(express.static('public'));

let perfiles = []; // aquí después va Postgres
let mensajes = {};

app.get('/api/cerca', (req,res)=>{
  const {lat,lng,clave} = req.query;
  if(clave !== '7M2026') return res.status(401).json([]);
  // calcula distancia y ordena
  const conDist = perfiles.map(p=>{
    const d = Math.sqrt(Math.pow(p.lat-lat,2)+Math.pow(p.lng-lng,2))*111;
    return {...p, _d:d};
  }).sort((a,b)=>a._d-b._d);
  res.json(conDist);
});

app.post('/api/registro', (req,res)=>{
  const p = req.body;
  perfiles = perfiles.filter(x=>x.nombre!==p.nombre);
  perfiles.push(p);
  res.json({ok:true});
});

app.get('/api/mensajes/:key', (req,res)=> res.json(mensajes[req.params.key]||[]));
app.post('/api/mensajes/:key', (req,res)=>{
  if(!mensajes[req.params.key]) mensajes[req.params.key]=[];
  mensajes[req.params.key].push(req.body);
  res.json({ok:true});
});

const port = process.env.PORT || 3000;
app.listen(port, ()=>console.log('7M corriendo en '+port));
