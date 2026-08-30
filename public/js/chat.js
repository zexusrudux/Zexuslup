const Chat = {
  albumFiles:[],
  previewAlbum(input){
    this.albumFiles=Array.from(input.files);
    const prev=document.getElementById('albumPreview'); 
    prev.innerHTML='';
    this.albumFiles.forEach(file=>{
      const url=URL.createObjectURL(file);
      prev.innerHTML+=`<div style="position:relative"><img src="${url}" style="width:65px;height:65px;object-fit:cover;border-radius:10px"><div onclick="this.parentElement.remove()" style="position:absolute;top:-6px;right:-6px;background:#fff;color:#000;width:18px;height:18px;border-radius:50%;display:grid;place-items:center;font-size:10px;cursor:pointer">✕</div></div>`;
    });
  },
  abrirChatLimpio(){
    if(!App.viendo) return alert('Error perfil');
    const p=App.viendo;
    // cerrar perfil, abrir chat limpio
    document.getElementById('modal').style.display='none';
    const header=document.getElementById('chatHeader');
    header.innerHTML=`<div onclick="Chat.cerrarChat()" style="width:36px;height:36px;background:#222;border-radius:50%;display:grid;place-items:center;cursor:pointer">←</div><img src="${p.foto}" style="width:36px;height:36px;border-radius:50%;object-fit:cover"><div style="flex:1"><b style="font-size:14px">${p.nombre}</b><br><span style="font-size:11px;color:#0f0">en línea</span></div>`;
    document.getElementById('modalChat').style.display='flex';
    this.cargarMensajes();
    if(this.interval) clearInterval(this.interval);
    this.interval=setInterval(()=>this.cargarMensajes(),2500);
  },
  cerrarChat(){
    document.getElementById('modalChat').style.display='none';
    document.getElementById('modal').style.display='block';
    if(this.interval) clearInterval(this.interval);
  },
  cerrarTodo(){
    document.getElementById('modalChat').style.display='none';
    document.getElementById('modal').style.display='none';
    document.body.style.overflow='auto';
    if(this.interval) clearInterval(this.interval);
  },
  async cargarMensajes(){
    if(!App.viendo) return;
    const key=[App.yo.nombre, App.viendo.nombre].sort().join('-');
    const msgs=await API.getMensajes(key).catch(()=>[]);
    const div=document.getElementById('mensajes'); 
    div.innerHTML='';
    if(!msgs.length) div.innerHTML='<p style="text-align:center;color:#444;padding:40px;font-size:13px">Sin mensajes<br>Di hola 👋</p>';
    msgs.forEach(m=>{
      const clase=m.de===App.yo.nombre?'me':'other';
      if(m.texto.startsWith('[IMG]')){
        div.innerHTML+=`<div class="msg ${clase}" style="padding:2px;background:transparent"><img src="${m.texto.replace('[IMG]','')}" style="max-width:220px;border-radius:14px;display:block"></div>`;
      } else {
        div.innerHTML+=`<div class="msg ${clase}">${m.texto}</div>`;
      }
    });
    div.scrollTop=div.scrollHeight;
  },
  async enviar(){
    const input=document.getElementById('txtMsg');
    const txt=input.value.trim();
    const key=[App.yo.nombre, App.viendo.nombre].sort().join('-');

    if(this.albumFiles.length>0){
      for(let file of this.albumFiles){
        const b64=await new Promise(r=>{const fr=new FileReader(); fr.onload=e=>r(e.target.result); fr.readAsDataURL(file);});
        await API.sendMensaje(key, App.yo.nombre, `[IMG]${b64}`);
      }
      this.albumFiles=[]; document.getElementById('albumPreview').innerHTML=''; document.getElementById('fileAlbum').value='';
    }
    if(txt){ input.value=''; await API.sendMensaje(key, App.yo.nombre, txt); }
    await this.cargarMensajes(); this.cargarLista();
  },
  async cargarLista(){
    const cont=document.getElementById('listaChats'); if(!cont) return;
    cont.innerHTML='<p style="text-align:center;color:#555;padding:20px">Cargando...</p>';
    try{
      const chats=await API.misChats(App.yo.nombre);
      if(!chats.length){cont.innerHTML='<p style="text-align:center;color:#555;padding:30px">Sin chats<br>Ve a CERCA y escribe</p>';return;}
      cont.innerHTML=''; const todos=await API.cerca(App.yo.lat, App.yo.lng);
      chats.forEach(c=>{
        const otro=c.key.split('-').find(n=>n!==App.yo.nombre);
        const perfil=todos.find(p=>p.nombre===otro)||{foto:`https://i.pravatar.cc/100?u=${otro}`,nombre:otro};
        const ultimo=c.ultimo?.startsWith('[IMG]')?'📷 Foto':(c.ultimo||'').slice(0,28);
        const el=document.createElement('div'); el.className='chat-item';
        el.innerHTML=`<img src="${perfil.foto}"><div style="flex:1"><b>${otro}</b><br><span style="font-size:11px;color:#888">${ultimo}</span></div><div style="font-size:10px;color:#0f0">${c.total}</div>`;
        el.onclick=()=>{ App.viendo={...perfil,nombre:otro,_d:perfil._d||0}; Chat.abrirChatLimpio(); };
        cont.appendChild(el);
      });
    }catch(e){cont.innerHTML=`Error ${e.message}`}
  }
};
