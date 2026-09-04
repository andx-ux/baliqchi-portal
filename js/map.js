document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. ЛОГИКА ФИЛЬТРА МЕСТ
    // ==========================================
    const typeFilter = document.getElementById('typeFilter');
    const locationCards = document.querySelectorAll('.location-card');

    if (typeFilter && locationCards.length > 0) {
        typeFilter.addEventListener('change', (e) => {
            applyFilter(e.target.value);
        });
    }

    function applyFilter(filterValue) {
        locationCards.forEach(card => {
            const match = filterValue === 'all' || card.getAttribute('data-type') === filterValue;
            card.style.display = match ? 'block' : 'none';

            const marker = card._marker;
            if (!marker) return;
            if (match) {
                if (!map.hasLayer(marker)) marker.addTo(map);
            } else {
                if (map.hasLayer(marker)) map.removeLayer(marker);
            }
        });
    }

    // ==========================================
    // 2. КНОПКИ "ПОСТРОИТЬ МАРШРУТ" (внешняя ссылка на Google Maps)
    // ==========================================
    const routeButtons = document.querySelectorAll('.location-card .admin-btn');

    routeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const card = e.target.closest('.location-card');
            const title = card.querySelector('.loc-title').textContent;
            const searchQuery = encodeURIComponent(title + " Azerbaijan");
            const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${searchQuery}`;
            window.open(googleMapsUrl, '_blank');
        });
    });

    // ==========================================
    // 3. ЖИВАЯ КАРТА (Leaflet + OpenStreetMap)
    // ==========================================
    const mapContainer = document.getElementById('leafletMap');
    if (!mapContainer || typeof L === 'undefined') return;

    const TYPE_COLORS = {
        pulsuz: '#28a745',
        pullu: '#e0a800',
        deniz: '#0f4c75',
        qoruq: '#dc3545'
    };
    const TYPE_LABELS = {
        pulsuz: '🏕️ Ödənişsiz',
        pullu: '💰 Pullu',
        deniz: '🌊 Dəniz ovu',
        qoruq: '⛔ Qoruq / Qadağandır'
    };

    // scrollWheelZoom söndürülüb — səhifəni scroll edərkən xəritənin qəflətən
    // yaxınlaşmaması üçün. Xəritəyə klikləyəndə aktivləşir.
    const map = L.map('leafletMap', { scrollWheelZoom: false }).setView([40.1, 47.6], 7);

    map.on('click', () => map.scrollWheelZoom.enable());
    mapContainer.addEventListener('mouseleave', () => map.scrollWheelZoom.disable());

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> müəllifləri'
    }).addTo(map);

    locationCards.forEach(card => {
        const lat = parseFloat(card.getAttribute('data-lat'));
        const lng = parseFloat(card.getAttribute('data-lng'));
        if (Number.isNaN(lat) || Number.isNaN(lng)) return;

        const type = card.getAttribute('data-type');
        const title = card.querySelector('.loc-title').textContent;
        const fishLine = card.querySelectorAll('.loc-text')[0]?.textContent || '';

        const marker = L.circleMarker([lat, lng], {
            radius: 9,
            color: '#fff',
            weight: 2,
            fillColor: TYPE_COLORS[type] || '#0f4c75',
            fillOpacity: 0.9
        });

        marker.bindPopup(`
            <div style="font-family: inherit; min-width: 180px;">
                <b style="color:#1b4332;">${title}</b><br>
                <span style="font-size:12px;">${TYPE_LABELS[type] || ''}</span><br>
                <span style="font-size:12px;">${fishLine}</span>
            </div>
        `);

        marker.on('click', () => {
            highlightCard(card);
        });

        marker.addTo(map);
        card._marker = marker;

        // Клик по карточке (кроме кнопки маршрута) — перелетаем к метке на карте
        card.addEventListener('click', (e) => {
            if (e.target.closest('button')) return;
            map.flyTo([lat, lng], 11, { duration: 0.75 });
            marker.openPopup();
        });
        card.style.cursor = 'pointer';
    });

    function highlightCard(card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        card.style.boxShadow = '0 0 0 3px var(--accent)';
        setTimeout(() => { card.style.boxShadow = ''; }, 1500);
    }
});
