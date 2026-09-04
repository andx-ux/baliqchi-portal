document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. ЛОГИКА ФИЛЬТРА МЕСТ (Ваш исходный код)
    // ==========================================
    const typeFilter = document.getElementById('typeFilter');
    const locationCards = document.querySelectorAll('.location-card');

    if (typeFilter && locationCards.length > 0) {
        typeFilter.addEventListener('change', (e) => {
            const filterValue = e.target.value;
            locationCards.forEach(card => {
                if (filterValue === 'all') {
                    card.style.display = 'block';
                } else if (card.getAttribute('data-type') === filterValue) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }

    // ==========================================
    // 2. НОВАЯ ЛОГИКА: КНОПКИ "ПОСТРОИТЬ МАРШРУТ"
    // ==========================================
    // Находим все кнопки внутри карточек локаций
    const routeButtons = document.querySelectorAll('.location-card .admin-btn');
    
    routeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Находим карточку, внутри которой нажали кнопку
            const card = e.target.closest('.location-card');
            
            // Читаем название места прямо из заголовка карточки (тег h3)
            const title = card.querySelector('.loc-title').textContent;
            
            // Создаем точную ссылку на Google Maps 
            // (добавляем слово Azerbaijan, чтобы навигатор не улетел в другую страну)
            const searchQuery = encodeURIComponent(title + " Azerbaijan");
            const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${searchQuery}`;
            
            // Открываем маршрут в новой соседней вкладке
            window.open(googleMapsUrl, '_blank');
        });
    });
});