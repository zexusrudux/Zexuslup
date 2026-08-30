const Perfil = {
  ver(p) {
    App.viendo = p;
    const modal = document.getElementById('modal');
    modal.innerHTML = `
      <div style="background:#111;padding:14px;display:flex;align-items:center;gap:12px;position:sticky;top:0;z-index:2;border-bottom:1px solid #222">
        <div onclick="Perfil.cerrar()" style="width:36px;height:36px;background:#222;border-radius:50%;display:grid;place-items:center;cursor:pointer">✕</div>
        <b>Perfil</b>
      </div>
      <div style="text-align:center;padding:22px 18px;background:#0e0e0e">
        <img src="${p.foto}" style="width:120px;height:120px;border-radius:50%;object-fit:cover;border:3px solid #222">
        <h2 style="margin:14px 0 4px">${p.nombre} • ${p.edad||22}</h2>
        <span style="color:#0f0;font-size:12px">📍 ${p._d?.toFixed(2)} km • ${p.rol||'Vers'} • ${p.altura||''}</span>
        <div style="margin:12px 0">${(p.gustos||'').split(',').map(g=>g.trim()?`<span class="tag">${g.trim()}</span>`:'').join('')}</div>
        <p style="color:#aaa;font-size:13px;margin-top:10px;line-height:1.4">${p.bio||'Sin bio'}</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:14px;text-align:left;background:#151515;padding:12px;border-radius:12px;border:1px solid #222">
          <small><b>Rol:</b> ${p.rol||'-'}</small><small><b>Edad:</b> ${p.edad||'-'}</small>
          <small><b>Altura:</b> ${p.altura||'-'}</small><small><b>Peso:</b> ${p.peso||'-'}</small>
          <small style="grid-column:1/3"><b>Busca:</b> ${p.busca||'-'}</small>
        </div>
        <button onclick="Chat.abrirChatLimpio()" style="margin-top:18px;background:#fff">💬 Mensaje</button>
        <button onclick="Favs.toggle('${p.nombre}')" style="background:#1e1e1e;color:#fff;border:1px solid #333">★ Guardar</button>
      </div>
      <div style="padding:14px">
        <b style="font-size:11px;color:#555">ÁLBUM</b>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-top:8px">
          <img src="${p.foto}" style="width:100%;height:100px;object-fit:cover;border-radius:12px">
          ${(p.album||[]).map(f=>`<img src="${f}" style="width:100%;height:100px;object-fit:cover;border-radius:12px">`).join('')}
        </div>
      </div>
    `;
    modal.style.display='block'; document.body.style.overflow='hidden';
  },
  cerrar(){ document.getElementById('modal').style.display='none'; document.body.style.overflow='auto'; },

  renderMiPerfil(){
    const yo=App.yo; if(!yo) return;
    const div=document.getElementById('tab-perfil');
    div.innerHTML=`
      <div style="padding:18px;max-width:400px;margin:auto">
        <div style="text-align:center">
          <div style="position:relative;width:110px;height:110px;margin:auto">
            <img id="myFotoPrev" src="${yo.foto}" style="width:110px;height:110px;border-radius:50%;object-fit:cover;border:3px solid #333">
            <label for="inputFotoPerfil" style="position:absolute;bottom:0;right:0;background:#fff;color:#000;width:32px;height:32px;border-radius:50%;display:grid;place-items:center;font-size:16px;cursor:pointer;border:2px solid #000">📷</label>
          </div>
          <input id="inputFotoPerfil" type="file" accept="image/*" style="display:none" onchange="Perfil.subirFotoPerfil(this)">
          <h2 style="margin:12px 0 2px">${yo.nombre}</h2>
          <small style="color:#0f0">${yo.lat.toFixed(4)}, ${yo.lng.toFixed(4)} • ${yo._d!==undefined?'':'GPS activo'}</small>
        </div>

        <div style="margin-top:18px;display:grid;gap:10px">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
            <input id="editEdad" placeholder="Edad" value="${yo.edad||''}">
            <input id="editRol" placeholder="Rol (Activo/Pasivo/Vers)" value="${yo.rol||''}">
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
            <input id="editAltura" placeholder="Altura ej 1.75" value="${yo.altura||''}">
            <input id="editPeso" placeholder="Peso ej 75kg" value="${yo.peso||''}">
          </div>
          <input id="editBusca" placeholder="Qué buscas?" value="${yo.busca||''}">
          <textarea id="editBio" placeholder="Bio" style="min-height:70px">${yo.bio||''}</textarea>
          <input id="editGustos" placeholder="Gustos separados por coma" value="${yo.gustos||''}">

          <label style="font-size:11px;color:#666;margin-top:8px">ÁLBUM PRIVADO (3 fotos max)</label>
          <input id="inputAlbum" type="file" multiple accept="image/*" onchange="Perfil.previewAlbumPropio(this)">
          <div id="myAlbumPrev" style="display:flex;gap:6px;overflow-x:auto">${(yo.album||[]).map(f=>`<img src="${f}" style="width:60px;height:60px;border-radius:10px;object-fit:cover">`).join('')}</div>

          <button onclick="Perfil.guardar()">💾 Guardar perfil</button>
          <button onclick="Perfil.actualizarGPS()" style="background:#0f0;color:#000">📍 Actualizar mi GPS real</button>
          <button onclick="localStorage.clear();location.reload()" style="background:#1a1a1a;color:#666;border:1px solid #222">Salir / Borrar cuenta</button>
        </div>
      </div>
    `;
  },

  async subirFotoPerfil(input){
    const file=input.files[0]; if(!file) return;
    if(file.size> 2_500_000) return alert('Foto muy pesada, max 2.5MB');
    const b64=await new Promise(r=>{const fr=new FileReader(); fr.onload=e=>r(e.target.result); fr.readAsDataURL(file);});
    document.getElementById('myFotoPrev').src=b64;
    App.yo.foto=b64; // preview inmediato
  },

  previewAlbumPropio(input){
    const files=Array.from(input.files).slice(0,3);
    const div=document.getElementById('myAlbumPrev'); div.innerHTML='';
    App.yo.albumTemp=[];
    files.forEach(file=>{
      const url=URL.createObjectURL(file);
      div.innerHTML+=`<img src="${url}" style="width:60px;height:60px;border-radius:10px;object-fit:cover">`;
      // convertir a base64 para guardar
      const fr=new FileReader(); fr.onload=e=>App.yo.albumTemp.push(e.target.result); fr.readAsDataURL(file);
    });
  },

  async guardar(){
    App.yo.edad=document.getElementById('editEdad').value;
    App.yo.rol=document.getElementById('editRol').value;
    App.yo.altura=document.getElementById('editAltura').value;
    App.yo.peso=document.getElementById('editPeso').value;
    App.yo.busca=document.getElementById('editBusca').value;
    App.yo.bio=document.getElementById('editBio').value;
    App.yo.gustos=document.getElementById('editGustos').value;
    if(App.yo.albumTemp && App.yo.albumTemp.length) App.yo.album=App.yo.albumTemp;

    localStorage.setItem('yo7M', JSON.stringify(App.yo));
    await API.registro(App.yo);
    alert('Perfil actualizado ✓ ya se ve con tu foto');
    Cerca.cargar();
  },
  async actualizarGPS(){
    const pos=await new Promise((r,j)=>navigator.geolocation.getCurrentPosition(r,j,{enableHighAccuracy:true})).catch(()=>null);
    if(!pos) return alert('Activa GPS');
    App.yo.lat=pos.coords.latitude; App.yo.lng=pos.coords.longitude;
    localStorage.setItem('yo7M', JSON.stringify(App.yo));
    await API.registro(App.yo);
    alert('GPS actualizado'); Mapa.init(App.yo.lat, App.yo.lng);
  }
};

const Favs={ get(){return JSON.parse(localStorage.getItem('favs7M')||'[]')}, toggle(n){let f=this.get(); f=f.includes(n)?f.filter(x=>x!==n):[...f,n]; localStorage.setItem('favs7M',JSON.stringify(f)); alert(f.includes(n)?'Fav':'Quitado'); this.render();}, async render(){const div=document.getElementById('favs'); if(!div) return; const favs=this.get(); if(!favs.length){div.innerHTML='<p style="color:#555;padding:20px;text-align:center">Sin favs</p>';return;} div.innerHTML=''; const todos=await API.cerca(App.yo.lat,App.yo.lng); todos.filter(p=>favs.includes(p.nombre)).forEach(p=>{const el=document.createElement('div'); el.className='card'; el.innerHTML=`<img src="${p.foto}"><div style="padding:5px"><b>${p.nombre}</b><br><span style="color:#0f0;font-size:10px">${p._d.toFixed(2)} km</span></div>`; el.onclick=()=>Perfil.ver(p); div.appendChild(el);}); } };
