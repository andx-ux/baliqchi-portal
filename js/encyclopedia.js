import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDRAOw6pZ_XtsmnRXYFK6eWS9Pvj_cxA58",
    authDomain: "baliqchi-news.firebaseapp.com",
    projectId: "baliqchi-news",
    storageBucket: "baliqchi-news.firebasestorage.app",
    messagingSenderId: "475640842113",
    appId: "1:475640842113:web:c24072ed827974f3890a80"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const fishGrid = document.getElementById('fishGrid');
const loadingText = document.getElementById('loadingText');
const searchInput = document.getElementById('fishSearch');

async function loadEncyclopedia() {
    try {
        // Сортировка рыб по алфавиту
        const q = query(collection(db, "encyclopedia"), orderBy("title", "asc"));
        const querySnapshot = await getDocs(q);

        loadingText.style.display = "none";

        if (querySnapshot.empty) {
            fishGrid.innerHTML = "<p>Hələ heç bir məlumat yoxdur. Admin paneldən əlavə edin.</p>";
            return;
        }

        // Рисуем карточки
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const item = document.createElement('div');
            item.className = 'card fish-card';
            item.style.padding = '0';
            item.style.overflow = 'hidden';

            // Сохраняем имя рыбы в атрибут для поиска
            item.setAttribute('data-name', data.title.toLowerCase());

            item.innerHTML = `
                <img src="${data.image}" alt="${data.title}" style="width: 100%; height: 200px; object-fit: cover; display: block;">
                <div style="padding: 15px;">
                    <h3 style="color: var(--secondary); margin-bottom: 10px;">🐟 ${data.title}</h3>
                    <p style="font-size: 13px; color: var(--text-dark); white-space: pre-line;">${data.text}</p>
                </div>
            `;
            fishGrid.appendChild(item);
        });

        // Оживляем поиск после того, как карточки загрузились
        const fishCards = document.querySelectorAll('.fish-card');
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase().trim();
            fishCards.forEach(card => {
                const name = card.getAttribute('data-name');
                if (name.includes(term)) {
                    card.style.display = "block";
                } else {
                    card.style.display = "none";
                }
            });
        });

    } catch (error) {
        console.error("Xəta:", error);
        loadingText.innerHTML = "Xəta baş verdi. İnternet bağlantınızı yoxlayın.";
    }
}

// Запускаем загрузку рыб при открытии страницы
loadEncyclopedia();