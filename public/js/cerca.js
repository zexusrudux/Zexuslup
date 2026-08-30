const Cerca = {
  async cargar(){
    const lista=document.getElementById('lista');
    lista.innerHTML='Cargando...';
    const data = await API.cerca(App.yo.lat, App.yo.lng);
    const otros = data.filter(p=>p.nombre!==App.yo.nombre);
    lista.innerHTML='';
    otros.forEach(p=>{
      const el=document.createElement('div');
      el.className='card';
      el.innerHTML=`<img src="${p.foto}"><div style="padding:5px"><b style="font-size:11px">${p.nombre}</b><br><span style="font-size:10px;color:#0f0">${p._d.toFixed(2)} km</span></div>`;
      el.onclick=()=>Perfil.ver(p);
      lista.appendChild(el);
      Mapa.addPin(p);
    });
  }
};
