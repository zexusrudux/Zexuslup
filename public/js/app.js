const App = {
  yo: JSON.parse(localStorage.getItem('yo7M')||'null'),
  viendo: null,

  async login(){
    const clave=document.getElementById('clave').value;
    if(clave!=='7M2026') return alert('Clave mal');
    const nombre=document.getElementById('nombre').value;
    if(!nombre) return alert('Nombre');
    
    // AQUÍ ESTABA EL ERROR: usábamos random, ahora GPS real
    const pos = await new Promise((res,rej)=>{
      navigator.geolocation.getCurrentPosition(p=>res(p), e=>rej(e), {enableHighAccuracy:true});
    }).catch(()=>null);

    const lat = pos ? pos.coords.latitude : 20.6896;
    const lng = pos ? pos.coords.longitude : -88.2014;

    const foto=document.getElementById('foto').value||`https://i.pravatar.cc/400?u=${nombre}`;
    this.yo={id:Date.now().toString(),nombre,foto,lat,lng,rol:'Vers',bio:'En 7M',gustos:'tranqui'};
    localStorage.setItem('yo7M',JSON.stringify(this.yo));
    await API.registro(this.yo);
    this.iniciar();
  },

  iniciar(){
    document.getElementById('login').style.display='none';
    document.getElementById('main').style.display='block';
    Mapa.init(this.yo.lat,this.yo.lng);
    Cerca.cargar();
    Perfil.renderMiPerfil();
    Chat.cargarLista();
  },

  go(tab,el){
    document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
    document.getElementById('tab-'+tab).classList.add('active');
    document.querySelectorAll('.menu div').forEach(m=>m.classList.remove('active'));
    el.classList.add('active');
    document.getElementById('titulo').textContent=tab.toUpperCase();
    if(tab==='cerca') Cerca.cargar();
    if(tab==='chats') Chat.cargarLista();
    if(tab==='perfil') Perfil.renderMiPerfil();
  }
};

if(App.yo) App.iniciar();
