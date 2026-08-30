const Mapa = {
  map: null,
  miMarker: null,
  pins: [],

  init(lat, lng) {
    // Si ya existe, lo reinicia
    if (this.map) {
      this.map.remove();
      this.map = null;
    }

    setTimeout(() => {
      this.map = L.map('map').setView([lat, lng], 14);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '7M'
      }).addTo(this.map);

      this.miMarker = L.marker([lat, lng], {
        icon: L.divIcon({ className: 'mi-pin', html: '◉', iconSize: [20,20] })
      }).addTo(this.map).bindPopup('Tú estás aquí');

      // invalidar tamaño por si estaba oculto
      setTimeout(() => this.map.invalidateSize(), 300);
    }, 400);
  },

  addPin(p) {
    if (!this.map) return;
    const marker = L.marker([p.lat, p.lng]).addTo(this.map);
    marker.bindPopup(`${p.nombre} - ${p._d.toFixed(2)} km`);
    marker.on('click', () => Perfil.ver(p));
    this.pins.push(marker);
  },

  clearPins() {
    this.pins.forEach(m => this.map.removeLayer(m));
    this.pins = [];
  },

  refresh() {
    if (this.map) this.map.invalidateSize();
  }
};
