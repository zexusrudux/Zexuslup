const App = {
  yo: JSON.parse(localStorage.getItem('yo7M') || 'null'),
  viendo: null,

  async login() {
    const clave = document.getElementById('clave').value.trim();
    if (clave !== '7M2026') return alert('Clave incorrecta bro');

    const nombre = document.getElementById('nombre').value.trim();
    if (!nombre) return alert('Pon tu nombre');
    if (nombre.length < 3) return alert('Nombre muy corto');

    // Pedimos GPS real, no random
    let lat = 20.6896, lng = -88.2014;
    try {
      const pos = await new Promise((res, rej) => {
        navigator.geolocation.getCurrentPosition(res, rej, { enableHighAccuracy: true, timeout: 8000 });
      });
      lat = pos.coords.latitude;
      lng = pos.coords.longitude;
    } catch {
      alert('Activa el GPS para calcular distancia real, usaremos centro de Valladolid por ahora');
    }

    const fotoInput = document.getElementById('foto').value.trim();
    const foto = fotoInput || `https://i.pravatar.cc/500?u=${encodeURIComponent(nombre)}`;

    this.yo = {
      id: Date.now().toString(),
      nombre,
      foto,
      lat,
      lng,
      edad: '22',
      rol: 'Vers',
      bio: 'En 7M buscando algo tranqui en Valladolid',
      gustos: 'gym, chelas, playa'
    };

    localStorage.setItem('yo7M', JSON.stringify(this.yo));
    await API.registro(this.yo);
    this.iniciar();
  },

  iniciar() {
    document.getElementById('login').style.display = 'none';
    document.getElementById('main').style.display = 'block';
    Mapa.init(this.yo.lat, this.yo.lng);
    Cerca.cargar();
    Perfil.renderMiPerfil();
    Chat.cargarLista();
    Favs.render();
  },

  go(tab, el) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.getElementById('tab-' + tab).classList.add('active');
    
    document.querySelectorAll('.menu div').forEach(m => m.classList.remove('active'));
    el.classList.add('active');
    
    document.getElementById('titulo').textContent = tab.toUpperCase();
    
    if (tab === 'cerca') { 
      Cerca.cargar(); 
      setTimeout(() => Mapa.refresh(), 200);
    }
    if (tab === 'chats') Chat.cargarLista();
    if (tab === 'favs') Favs.render();
    if (tab === 'perfil') Perfil.renderMiPerfil();
  }
};

// Auto-login si ya existe
if (App.yo) {
  App.iniciar();
          }
