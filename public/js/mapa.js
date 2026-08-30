const Mapa = {
  map: null,
  markers: [],
  yoMarker: null,

  init(lat, lng) {
    if (this.map) {
      this.map.setView([lat, lng], 14);
      if (this.yoMarker) this.yoMarker.setLatLng([lat, lng]);
      return;
    }

    this.map = L.map('map', { zoomControl: false }).setView([lat, lng], 14);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© 7M'
    }).addTo(this.map);

    // Tu pin
    this.yoMarker = L.marker([lat, lng], {
      icon: L.divIcon({ className: 'mi-pin', html: '📍', iconSize: [20, 20] })
    }).addTo(this.map).bindPopup('Tú aquí');

    setTimeout(() => this.map.invalidateSize(), 500);
  },

  refresh() {
    if (this.map) this.map.invalidateSize();
  },

  mostrar(lista) {
    // Limpia markers viejos
    this.markers.forEach(m => this.map.removeLayer(m));
    this.markers = [];

    if (!this.map) return;

    lista.forEach(p => {
      if (!p.lat || !p.lng) return;
      
      const icon = L.divIcon({
        className: '',
        html: `<div style="width:42px;height:42px;border-radius:50%;border:2px solid #fff;overflow:hidden;box-shadow:0 0 8px #000;background:#222"><img src="${p.foto}" style="width:100%;height:100%;object-fit:cover" onerror="this.src='https://i.pravatar.cc/100?u=${p.nombre}'"></div><div style="background:#000;color:#fff;font-size:9px;padding:2px 5px;border-radius:10px;text-align:center;margin-top:2px;white-space:nowrap">${p.nombre.split(' ')[0]} • ${p._d?.toFixed(1)}km</div>`,
        iconSize: [50, 50],
        iconAnchor: [25, 50]
      });

      const m = L.marker([parseFloat(p.lat), parseFloat(p.lng)], { icon }).addTo(this.map);
      m.on('click', () => Perfil.ver(p));
      this.markers.push(m);
    });
  }
};
