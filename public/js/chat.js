const Chat = {
  albumFiles:[],
  previewAlbum(input){
    this.albumFiles=Array.from(input.files);
    const prev=document.getElementById('albumPreview'); prev.innerHTML='';
    this.albumFiles.forEach(file=>{
      const url=URL.createObjectURL(file);
      prev.innerHTML+=`<div style="position:relative"><img src="${url}" style="width:65px;height:65px;object-fit:cover;border-radius:10px"><div onclick="this.parentElement.remove()" style="position:absolute;top:-6px;right:-6px;background:#000;width:18px;height:18px;border-radius:50%;display:grid;place-items:center;font-size:10px">✕</div></div>`;
    });
  },
  abrirChatLimpio(){
    const p=App.viendo;
    document.getElementById('modal').style.display='none';
    const header=document.getElementById('chatHeader');
    header.innerHTML=`<div onclick="Chat.cerrarChat()" style="width:36px;height:36px;background:#222;border-radius:50%;display:grid;place-items:center">←</div><img src="${p.foto}" style="width:36px;height:36px;border-radius:50%;object-fit:cover"><div style="flex:1"><b style="font-size:14px">${p.nombre}</b><br><span style="font-size:11px;color:#0f0">en línea</span></div><div>⋮</div>`;
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
  async cargarMensajes(){
    if(!App.viendo) return;
    const key=[App.yo.nombre, App.viendo.nombre].sort().join('-');
    const msgs=await API.getMensajes(key).catch(()=>[]);
    const div=document.getElementById('mensajes'); if(!div) return;
    div.innerHTML='';
    if(!msgs.length) div.innerHTML='<p style="text-align:center;color:#444;padding:40px;font-size:13px">Sin mensajes<br>Di hola 👋</p>';
    msgs.forEach(m=>{
      const clase=m.de===App.yo.nombre?'me':'other';
      if(m.texto.startsWith('[IMG]')){
        div.innerHTML+=`<div class="msg ${clase}" style="padding:3px;background:transparent"><img src="${m.texto.replace('[IMG]','')}" style="max-width:220px;border-radius:14px" onclick="window.open(this.src)"></div>`;
      } else {
        div.innerHTML+=`<div class="msg ${clase}">${m.texto}<div style="font-size:9px;opacity:.5;text-align:right;margin-top:3px">${new Date().toLocaleTimeString().slice(0,5)}</div></div>`;
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
    if(!txt && this.albumFiles.length===0){ await this.cargarMensajes(); return; }
    if(txt){ input.value=''; await API.sendMensaje(key, App.yo.nombre, txt); }
    await this.cargarMensajes(); await this.cargarLista();
  },
  async cargarLista(){ /* igual */ const cont=document.getElementById('listaChats'); if(!cont) return; cont.innerHTML='<p style="text-align:center;color:#555;padding:20px">Cargando...</p>'; try{ const chats=await API.misChats(App.yo.nombre); if(!chats.length){cont.innerHTML='<p style="text-align:center;color:#555;padding:30px">Sin chats</p>';return;} cont.innerHTML=''; const todos=await API.cerca(App.yo.lat, App.yo.lng); chats.forEach(c=>{const otro=c.key.split('-').find(n=>n!==App.yo.nombre); const perfil=todos.find(p=>p.nombre===otro)||{foto:`https://i.pravatar.cc/100?u=${otro}`,nombre:otro}; const ultimo=c.ultimo?.startsWith('[IMG]')?'📷 Foto':(c.ultimo||'').slice(0,28); const el=document.createElement('div'); el.className='chat-item'; el.innerHTML=`<img src="${perfil.foto}"><div style="flex:1"><b>${otro}</b><br><span style="font-size:11px;color:#888">${ultimo}</span></div><div style="font-size:10px;color:#0f0">${c.total}</div>`; el.onclick=async()=>{ App.viendo=perfil._d?perfil:{nombre:otro,foto:perfil.foto,_d:0}; Chat.abrirChatLimpio();}; cont.appendChild(el);}); }catch(e){cont.innerHTML=`Error ${e.message}`} },
  async abrirDesdeLista(nombreOtro){ const todos=await API.cerca(App.yo.lat, App.yo.lng); let p=todos.find(x=>x.nombre===nombreOtro)||{nombre:nombreOtro,foto:`https://i.pravatar.cc/400?u=${nombreOtro}`,_d:0}; App.viendo=p; this.abrirChatLimpio(); }
};
