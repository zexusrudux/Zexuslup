const Chat = {
  abrir() {
    document.getElementById('chatBox').style.display = 'block';
    const btn = document.getElementById('btnMsg');
    if (btn) btn.style.display = 'none';
    this.cargarMensajes();
    // auto refresco cada 3 seg
    if (this.interval) clearInterval(this.interval);
    this.interval = setInterval(() => this.cargarMensajes(), 3000);
  },

  async cargarMensajes() {
    if (!App.viendo) return;
    const key = [App.yo.nombre, App.viendo.nombre].sort().join('-');
    const msgs = await API.getMensajes(key).catch(() => []);
    
    const div = document.getElementById('mensajes');
    if (!div) return;
    
    div.innerHTML = '';
    if (!msgs.length) {
      div.innerHTML = '<p style="color:#555;text-align:center;padding:20px">Sé el primero en escribir 👋</p>';
      return;
    }
    
    msgs.forEach(m => {
      const clase = m.de === App.yo.nombre ? 'me' : 'other';
      div.innerHTML += `<div class="msg ${clase}"><b style="font-size:10px">${m.de}</b><br>${m.texto}</div>`;
    });
    
    div.scrollTop = div.scrollHeight;
  },

  async enviar() {
    const input = document.getElementById('txtMsg');
    const txt = input.value.trim();
    if (!txt || !App.viendo) return;
    
    const key = [App.yo.nombre, App.viendo.nombre].sort().join('-');
    input.value = '';
    
    // mensaje optimista
    const div = document.getElementById('mensajes');
    div.innerHTML += `<div class="msg me"><b style="font-size:10px">${App.yo.nombre}</b><br>${txt}</div>`;
    div.scrollTop = div.scrollHeight;
    
    await API.sendMensaje(key, App.yo.nombre, txt);
    await this.cargarMensajes();
    await this.cargarLista();
  },

  // Carga la lista de conversaciones en la pestaña CHATS
  async cargarLista() {
    const cont = document.getElementById('listaChats');
    if (!cont) return;
    
    cont.innerHTML = '<p style="text-align:center;color:#555;padding:20px">Cargando chats...</p>';
    
    try {
      const chats = await API.misChats(App.yo.nombre);
      
      if (!chats.length) {
        cont.innerHTML = '<p style="text-align:center;color:#555;padding:30px">Aún no hay chats.<br><br>Ve a CERCA y escríbele a alguien<br>para que aparezca aquí.</p>';
        return;
      }
      
      cont.innerHTML = '';
      // necesitamos info de fotos
      const todos = await API.cerca(App.yo.lat, App.yo.lng);
      
      chats.forEach(c => {
        const otroNombre = c.key.split('-').find(n => n !== App.yo.nombre);
        const perfil = todos.find(p => p.nombre === otroNombre) || { foto: `https://i.pravatar.cc/100?u=${otroNombre}`, nombre: otroNombre };
        
        const el = document.createElement('div');
        el.className = 'chat-item';
        el.innerHTML = `
          <img src="${perfil.foto}" onerror="this.src='https://i.pravatar.cc/100'">
          <div style="flex:1">
            <b>${otroNombre}</b><br>
            <span style="font-size:11px;color:#888">${(c.ultimo||'').slice(0,35)}</span>
          </div>
          <div style="text-align:right">
            <div style="font-size:10px;color:#0f0">${c.total} msgs</div>
            <div style="font-size:9px;color:#555">${new Date(c.hora).toLocaleTimeString()}</div>
          </div>
        `;
        el.onclick = () => this.abrirDesdeLista(otroNombre);
        cont.appendChild(el);
      });
      
    } catch (e) {
      cont.innerHTML = `<p style="color:#555;padding:20px">Error cargando chats: ${e.message}</p>`;
    }
  },

  async abrirDesdeLista(nombreOtro) {
    // buscar perfil
    const todos = await API.cerca(App.yo.lat, App.yo.lng);
    let p = todos.find(x => x.nombre === nombreOtro);
    
    if (!p) {
      // si no existe perfil (borrado) creamos uno fake para poder chatear
      p = { nombre: nombreOtro, foto: `https://i.pravatar.cc/400?u=${nombreOtro}`, _d: 0, bio: '', gustos: '' };
    }
    
    Perfil.ver(p);
    setTimeout(() => this.abrir(), 200);
    App.go('cerca', document.querySelector('.menu div'));
    document.getElementById('modal').style.display = 'block';
  }
};
