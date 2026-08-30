const Chat = {
  albumFiles: [],
  previewAlbum(input){
    this.albumFiles = Array.from(input.files);
    const prev = document.getElementById('albumPreview');
    prev.innerHTML = '';
    this.albumFiles.forEach(file=>{
      const url = URL.createObjectURL(file);
      prev.innerHTML += `<div style="position:relative"><img src="${url}" style="width:70px;height:70px;object-fit:cover;border-radius:10px"><div onclick="this.parentElement.remove()" style="position:absolute;top:-5px;right:-5px;background:#000;border-radius:50%;width:18px;height:18px;display:grid;place-items:center;font-size:10px">✕</div></div>`;
    });
  },
  abrir(){
    document.getElementById('chatBox').style.display='block';
    const btn=document.getElementById('btnMsg'); if(btn) btn.style.display='none';
    this.cargarMensajes();
    if(this.interval) clearInterval(this.interval);
    this.interval=setInterval(()=>this.cargarMensajes(),2500);
  },
  async cargarMensajes(){
    if(!App.viendo) return;
    const key=[App.yo.nombre, App.viendo.nombre].sort().join('-');
    const msgs=await API.getMensajes(key).catch(()=>[]);
    const div=document.getElementById('mensajes'); if(!div) return;
    div.innerHTML='';
    msgs.forEach(m=>{
      const clase=m.de===App.yo.nombre?'me':'other';
      if(m.texto.startsWith('[IMG]')){
        const url=m.texto.replace('[IMG]','');
        div.innerHTML+=`<div class="msg ${clase}" style="padding:3px"><img src="${url}" style="max-width:200px;border-radius:12px;display:block" onclick="window.open('${url}')"></div>`;
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

    // Enviar fotos primero
    if(this.albumFiles.length>0){
      for(let file of this.albumFiles){
        const base64 = await this.toBase64(file);
        // subimos a free api (catbox) o guardamos base64 directo si es <1MB
        await API.sendMensaje(key, App.yo.nombre, `[IMG]${base64}`);
      }
      this.albumFiles=[]; document.getElementById('albumPreview').innerHTML=''; document.getElementById('fileAlbum').value='';
    }

    if(!txt) { if(this.albumFiles.length===0) await this.cargarMensajes(); return; }
    
    input.value='';
    await API.sendMensaje(key, App.yo.nombre, txt);
    await this.cargarMensajes(); await this.cargarLista();
  },
  toBase64(file){ return new Promise(res=>{ const r=new FileReader(); r.onload=e=>res(e.target.result); r.readAsDataURL(file); }); },
  async cargarLista(){
    const cont=document.getElementById('listaChats'); if(!cont) return;
    cont.innerHTML='<p style="text-align:center;color:#555;padding:20px">Cargando...</p>';
    try{
      const chats=await API.misChats(App.yo.nombre);
      if(!chats.length){ cont.innerHTML='<p style="text-align:center;color:#555;padding:30px">Sin chats aún</p>'; return; }
      cont.innerHTML=''; const todos=await API.cerca(App.yo.lat, App.yo.lng);
      chats.forEach(c=>{
        const otro=c.key.split('-').find(n=>n!==App.yo.nombre);
        const perfil=todos.find(p=>p.nombre===otro)||{foto:`https://i.pravatar.cc/100?u=${otro}`,nombre:otro};
        const ultimo = c.ultimo?.startsWith('[IMG]') ? '📷 Foto' : (c.ultimo||'').slice(0,30);
        const el=document.createElement('div'); el.className='chat-item';
        el.innerHTML=`<img src="${perfil.foto}"><div style="flex:1"><b>${otro}</b><br><span style="font-size:11px;color:#888">${ultimo}</span></div><div style="font-size:10px;color:#0f0">${c.total}</div>`;
        el.onclick=()=>this.abrirDesdeLista(otro); cont.appendChild(el);
      });
    }catch(e){ cont.innerHTML=`<p style="padding:20px;color:#555">Error ${e.message}</p>`}
  },
  async abrirDesdeLista(nombreOtro){
    const todos=await API.cerca(App.yo.lat, App.yo.lng);
    let p=todos.find(x=>x.nombre===nombreOtro)||{nombre:nombreOtro,foto:`https://i.pravatar.cc/400?u=${nombreOtro}`,_d:0,bio:'',gustos:''};
    Perfil.ver(p); setTimeout(()=>this.abrir(),200);
  }
};
