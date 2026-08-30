const API = {
  clave: '7M2026',
  async cerca(lat,lng){
    return fetch(`/api/cerca?lat=${lat}&lng=${lng}&clave=${this.clave}`).then(r=>r.json());
  },
  async registro(p){
    return fetch('/api/registro',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(p)}).then(r=>r.json());
  },
  async getMensajes(key){
    return fetch(`/api/mensajes/${key}`).then(r=>r.json());
  },
  async sendMensaje(key,de,text){
    return fetch(`/api/mensajes/${key}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({de,text,clave:this.clave})});
  },
  async misChats(yo){
    return fetch(`/api/mischats?yo=${encodeURIComponent(yo)}&clave=${this.clave}`).then(r=>r.json());
  }
};
