const Perfil = {
  ver(p) {
    App.viendo = p;
    const modal = document.getElementById('modal');
    modal.innerHTML = `
      <div style="background:#111;padding:14px;display:flex;align-items:center;gap:12px;position:sticky;top:0;z-index:2;border-bottom:1px solid #222">
        <div onclick="Perfil.cerrar()" style="width:36px;height:36px;background:#222;border-radius:50%;display:grid;place-items:center">✕</div>
        <b>Perfil</b>
      </div>
      <div style="text-align:center;padding:22px 18px;background:#0e0e0e">
        <img src="${p.foto}" style="width:120px;height:120px;border-radius:50%;object-fit:cover;border:3px solid #222">
        <h2 style="margin:14px 0 4px">${p.nombre} • 22</h2>
        <span style="color:#0f0;font-size:12px">📍 ${p._d?.toFixed(2)} km • En Valladolid</span>
        <div style="margin:12px 0">${(p.gustos||'').split(',').map(g=>g.trim()?`<span class="tag">${g.trim()}</span>`:'').join('')}</div>
        <p style="color:#aaa;font-size:13px;margin-top:10px;line-height:1.4">${p.bio||'Sin bio'}</p>
        <button onclick="Chat.abrirChatLimpio()" style="margin-top:18px;background:#fff">💬 Enviar mensaje</button>
        <button onclick="Favs.toggle('${p.nombre}')" style="background:#1e1e1e;color:#fff;border:1px solid #333">★ Guardar</button>
      </div>
      <div style="padding:14px">
        <div class="info-row"><span>💬</span><div><b>Bio</b><br><small>${p.bio||'Sin bio'}</small></div></div>
        <div class="info-row"><span>🔥</span><div><b>Rol</b><br><small>${p.rol||'Vers'}</small></div></div>
        <div style="margin-top:18px"><b style="font-size:11px;color:#555">ÁLBUM</b><div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-top:8px"><img src="${p.foto}" style="width:100%;height:100px;object-fit:cover;border-radius:12px"><div style="background:#1a1a1a;border-radius:12px;display:grid;place-items:center;color:#444">+3</div></div></div>
      </div>
    `;
    modal.style.display='block'; document.body.style.overflow='hidden';
  },
  cerrar(){ document.getElementById('modal').style.display='none'; document.body.style.overflow='auto'; },
  renderMiPerfil(){ /* igual que antes */ const yo=App.yo; const div=document.getElementById('tab-perfil'); if(!yo) return; div.innerHTML=`<div style="padding:18px;text-align:center"><img src="${yo.foto}" style="width:100px;height:100px;border-radius:50%"><h2 style="margin-top:10px">${yo.nombre}</h2><p style="color:#666;font-size:11px">${yo.lat.toFixed(4)}, ${yo.lng.toFixed(4)}</p><textarea id="editBio">${yo.bio||''}</textarea><input id="editGustos" value="${yo.gustos||''}"><input id="editFoto" value="${yo.foto||''}"><button onclick="Perfil.guardar()">Guardar</button><button onclick="Perfil.actualizarGPS()" style="background:#0f0;color:#000">📍 Actualizar GPS</button><button onclick="localStorage.clear();location.reload()" style="background:#222;color:#fff">Salir</button></div>`; },
  async guardar(){ App.yo.bio=document.getElementById('editBio').value; App.yo.gustos=document.getElementById('editGustos').value; App.yo.foto=document.getElementById('editFoto').value; localStorage.setItem('yo7M',JSON.stringify(App.yo)); await API.registro(App.yo); alert('Guardado ✓'); },
  async actualizarGPS(){ const pos=await new Promise((r,j)=>navigator.geolocation.getCurrentPosition(r,j,{enableHighAccuracy:true})).catch(()=>null); if(!pos) return alert('Activa GPS'); App.yo.lat=pos.coords.latitude; App.yo.lng=pos.coords.longitude; localStorage.setItem('yo7M',JSON.stringify(App.yo)); await API.registro(App.yo); alert('GPS actualizado'); Mapa.init(App.yo.lat,App.yo.lng); }
};
const Favs={ get(){return JSON.parse(localStorage.getItem('favs7M')||'[]')}, toggle(n){let f=this.get(); f=f.includes(n)?f.filter(x=>x!==n):[...f,n]; localStorage.setItem('favs7M',JSON.stringify(f)); alert(f.includes(n)?'Fav':'Quitado'); this.render();}, async render(){const div=document.getElementById('favs'); if(!div) return; const favs=this.get(); if(!favs.length){div.innerHTML='<p style="color:#555;padding:20px;text-align:center">Sin favs</p>';return;} div.innerHTML=''; const todos=await API.cerca(App.yo.lat,App.yo.lng); todos.filter(p=>favs.includes(p.nombre)).forEach(p=>{const el=document.createElement('div'); el.className='card'; el.innerHTML=`<img src="${p.foto}"><div style="padding:5px"><b>${p.nombre}</b><br><span style="color:#0f0;font-size:10px">${p._d.toFixed(2)} km</span></div>`; el.onclick=()=>Perfil.ver(p); div.appendChild(el);}); } };
