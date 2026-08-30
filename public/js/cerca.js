const Cerca = {
  async cargar(){
    const cont = document.getElementById('cerca');
    cont.innerHTML = '<p style="padding:20px;color:#555;text-align:center">Buscando cerca de ti... 📍</p>';
    try{
      if(!App.yo) return;
      const perfiles = await API.cerca(App.yo.lat, App.yo.lng);
      console.log('Perfiles recibidos:', perfiles);
      
      // Filtra solo quitarte a ti mismo
      let lista = perfiles.filter(p => p.nombre !== App.yo.nombre);
      
      if(!lista.length){
        cont.innerHTML = `<div style="padding:40px;text-align:center;color:#555">
          <div style="font-size:40px">📍</div>
          <p>No hay nadie más aún cerca de ti</p>
          <small>Lat: ${App.yo.lat.toFixed(4)} Lng: ${App.yo.lng.toFixed(4)}</small><br>
          <button onclick="Cerca.cargar()" style="margin-top:15px;width:auto;padding:8px 18px">Reintentar</button>
        </div>`;
        Mapa.mostrar(lista);
        return;
      }

      cont.innerHTML = '';
      lista.forEach(p=>{
        const d = (p._d!==undefined) ? `${p._d.toFixed(2)} km` : 'cerca';
        const el = document.createElement('div');
        el.className = 'card';
        el.innerHTML = `<img src="${p.foto}" onerror="this.src='https://i.pravatar.cc/300?u=${p.nombre}'"><div style="padding:6px"><b style="font-size:13px">${p.nombre}</b><br><span style="color:#0f0;font-size:10px">${d}</span></div>`;
        el.onclick = () => Perfil.ver(p);
        cont.appendChild(el);
      });
      Mapa.mostrar(lista);

    }catch(e){
      cont.innerHTML = `<p style="padding:20px;color:#f55;text-align:center">Error: ${e.message}<br><button onclick="Cerca.cargar()" style="width:auto;margin-top:10px">Reintentar</button></p>`;
      console.error(e);
    }
  }
};
