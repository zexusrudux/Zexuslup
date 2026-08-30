const Perfil = {
  // Ver perfil de otro
  ver(p) {
    App.viendo = p;
    const modal = document.getElementById('modal');
    
    modal.innerHTML = `
      <div class="perfil-header">
        <img src="${p.foto}" onerror="this.src='https://i.pravatar.cc/400'">
        <div class="back" onclick="Perfil.cerrar()">✕ Cerrar</div>
      </div>
      <div style="padding:15px">
        <h2>${p.nombre}</h2>
        <div style="margin:8px 0">${(p.gustos||'').split(',').map(g=>g.trim()?`<span class="tag">${g.trim()}</span>`:'').join('')}</div>
        <p style="color:#aaa;font-size:14px;margin:10px 0">${p.bio||'Sin bio'}</p>
        <p style="color:#0f0;font-size:12px">📍 ${p._d ? p._d.toFixed(2)+' km de ti' : ''} - Valladolid</p>
        
        <button id="btnMsg" onclick="Chat.abrir()">💬 Enviar mensaje</button>
        <button onclick="Favs.toggle('${p.nombre}')" style="background:#222;color:#fff;margin-top:6px">⭐ Guardar en favs</button>
        
        <div id="chatBox" style="display:none">
          <div id="mensajes" class="chat-box"></div>
          <div class="chat-input">
            <input id="txtMsg" placeholder="Escribe...">
            <button onclick="Chat.enviar()" style="width:80px">Enviar</button>
          </div>
        </div>
      </div>
    `;
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    Chat.cargarMensajes();
  },

  cerrar() {
    document.getElementById('modal').style.display = 'none';
    document.body.style.overflow = 'auto';
    App.viendo = null;
  },

  // Mi propio perfil en pestaña PERFIL
  renderMiPerfil() {
    const yo = App.yo;
    const div = document.getElementById('tab-perfil');
    if (!yo) return;
    
    div.innerHTML = `
      <div style="height:240px;background:#222"><img src="${yo.foto}" style="width:100%;height:100%;object-fit:cover"></div>
      <div style="padding:15px">
        <h2>${yo.nombre}</h2>
        <p style="color:#666;font-size:11px">Lat: ${yo.lat.toFixed(5)} Lng: ${yo.lng.toFixed(5)} - ubicación real GPS</p>
        <textarea id="editBio" placeholder="Tu bio">${yo.bio||''}</textarea>
        <input id="editGustos" value="${yo.gustos||''}" placeholder="gustos: gym, chelas...">
        <input id="editFoto" value="${yo.foto||''}" placeholder="Link foto nueva">
        <button onclick="Perfil.guardar()">Guardar perfil</button>
        <button onclick="Perfil.actualizarGPS()" style="background:#0f0;color:#000">📍 Actualizar mi ubicación real</button>
        <button onclick="localStorage.clear();location.reload()" style="background:#222;color:#fff">Salir</button>
      </div>
    `;
  },

  async guardar() {
    App.yo.bio = document.getElementById('editBio').value;
    App.yo.gustos = document.getElementById('editGustos').value;
    App.yo.foto = document.getElementById('editFoto').value;
    localStorage.setItem('yo7M', JSON.stringify(App.yo));
    await API.registro(App.yo);
    alert('Guardado ✓');
  },

  async actualizarGPS() {
    const pos = await new Promise((res, rej) => {
      navigator.geolocation.getCurrentPosition(p => res(p), e => rej(e), { enableHighAccuracy: true });
    }).catch(() => null);

    if (!pos) return alert('No se pudo obtener GPS, activa ubicación');

    App.yo.lat = pos.coords.latitude;
    App.yo.lng = pos.coords.longitude;
    localStorage.setItem('yo7M', JSON.stringify(App.yo));
    await API.registro(App.yo);
    alert(`Ubicación actualizada: ${App.yo.lat.toFixed(4)}, ${App.yo.lng.toFixed(4)}`);
    Mapa.init(App.yo.lat, App.yo.lng);
  }
};

// Favs simple con localStorage
const Favs = {
  get() { return JSON.parse(localStorage.getItem('favs7M')||'[]'); },
  toggle(nombre) {
    let favs = this.get();
    if (favs.includes(nombre)) {
      favs = favs.filter(n=>n!==nombre);
      alert('Quitado de favs');
    } else {
      favs.push(nombre);
      alert('Guardado en favs ⭐');
    }
    localStorage.setItem('favs7M', JSON.stringify(favs));
    this.render();
  },
  async render() {
    const div = document.getElementById('favs');
    if(!div) return;
    const favs = this.get();
    if (!favs.length) { div.innerHTML = '<p style="color:#555;padding:20px;text-align:center">Sin favs aún</p>'; return; }
    div.innerHTML = '';
    // cargar todos para filtrar
    const todos = await API.cerca(App.yo.lat, App.yo.lng);
    todos.filter(p=>favs.includes(p.nombre)).forEach(p=>{
      const el=document.createElement('div');
      el.className='card';
      el.innerHTML=`<img src="${p.foto}"><div style="padding:5px"><b>${p.nombre}</b><br><span style="color:#0f0;font-size:10px">${p._d.toFixed(2)} km</span></div>`;
      el.onclick=()=>Perfil.ver(p);
      div.appendChild(el);
    });
  }
};
