import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import { getFirestore, collection, query, orderBy, getDocs } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";

// Ваши настройки Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDRAOw6pZ_XtsmnRXYFK6eWS9Pvj_cxA58",
    authDomain: "baliqchi-news.firebaseapp.com",
    projectId: "baliqchi-news",
    messagingSenderId: "475640842113",
    appId: "1:475640842113:web:c24072ed827974f3890a80"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener('DOMContentLoaded', async () => {
    const track = document.getElementById('sliderTracks');
    const prevBtn = document.getElementById('prevSlideBtn');
    const nextBtn = document.getElementById('nextSlideBtn');

    if (!track) return;

    try {
        // Запрашиваем все публикации из категории "gallery"
        const galleryRef = collection(db, "gallery");
        const qGallery = query(galleryRef, orderBy("timestamp", "desc"));
        const snapshot = await getDocs(qGallery);

        track.innerHTML = ""; // Очищаем надпись "Загрузка..."

        if (snapshot.empty) {
            track.innerHTML = `<div class="slide"><div class="slide-text"><h3>Hələ heç nə yoxdur</h3><p>İlk şəkli admin paneldən əlavə edin.</p></div></div>`;
        } else {
            // Рисуем каждый слайд из базы данных
            snapshot.forEach(doc => {
                const data = doc.data();
                // Обратите внимание на ${data.text} — сюда попадут ссылки на YouTube из вашего редактора!
                track.innerHTML += `
                    <div class="slide">
                        <img src="${data.image}" alt="${data.title}">
                        <div class="slide-text">
                            <h3>🐟 ${data.title}</h3>
                            <div style="font-size: 14px; margin-top: 5px;">${data.text}</div>
                        </div>
                    </div>
                `;
            });
        }

        // ЗАПУСКАЕМ ЛОГИКУ СЛАЙДЕРА ТОЛЬКО ПОСЛЕ ЗАГРУЗКИ КАРТИНОК
        initSlider();

    } catch (error) {
        console.error("Xəta baş verdi:", error);
        track.innerHTML = "<p style='text-align:center; color:red; padding: 20px;'>Məlumatları yükləmək mümkün olmadı.</p>";
    }

    // Та самая логика слайдера, которая была у вас
    function initSlider() {
        let currentSlide = 0;
        const slides = document.querySelectorAll('.slide');

        // Если картинка всего одна, прячем кнопки перелистывания
        if (slides.length <= 1) {
            if(prevBtn) prevBtn.style.display = 'none';
            if(nextBtn) nextBtn.style.display = 'none';
            return;
        }

        function moveSlide(step) {
            currentSlide += step;
            if (currentSlide >= slides.length) currentSlide = 0;
            if (currentSlide < 0) currentSlide = slides.length - 1;
            track.style.transform = `translateX(-${currentSlide * 100}%)`;
        }

        if (prevBtn) prevBtn.addEventListener('click', () => moveSlide(-1));
        if (nextBtn) nextBtn.addEventListener('click', () => moveSlide(1));

        setInterval(() => {
            moveSlide(1);
        }, 5000);
    }
});