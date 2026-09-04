import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import { getFirestore, collection, query, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";

// Ваши настройки Firebase
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

async function loadLatestData() {
    try {
        // 1. ЗАГРУЖАЕМ 2 СВЕЖИЕ НОВОСТИ
        const newsRef = collection(db, "news");
        const qNews = query(newsRef, orderBy("timestamp", "desc"), limit(2));
        const newsSnapshot = await getDocs(qNews);

        const newsContainer = document.getElementById("latestNewsContainer");
        newsContainer.innerHTML = ""; // Убираем текст загрузки

        if (newsSnapshot.empty) {
            newsContainer.innerHTML = `
                <div class="empty-state">
                    <span class="empty-state-icon">📰</span>
                    Hələ xəbər yoxdur. Tezliklə ilk xəbər burada olacaq!
                </div>
            `;
        } else {
            newsSnapshot.forEach((doc) => {
                const data = doc.data();
                newsContainer.innerHTML += `
                    <div class="news-item">
                        <div class="news-img" style="background: url('${data.image}') center/cover; background-color: #ccc;"></div>
                        <div class="news-content">
                            <h4 style="margin:0 0 5px 0;">${data.title}</h4>
                            <span style="font-size: 11px; color: #6c757d;">🗓️ ${data.date} | 👁️ ${data.views} baxış</span><br>
                            <a href="news.html" class="news-link" style="color: #ff8c00; font-size: 12px; font-weight: bold;">Ətraflı oxu ➔</a>
                        </div>
                    </div>
                `;
            });
        }

        // 2. ЗАГРУЖАЕМ 4 ПОСЛЕДНИХ ОТЧЕТА (ГАЛЕРЕЯ)
        const galleryRef = collection(db, "gallery");
        const qGallery = query(galleryRef, orderBy("timestamp", "desc"), limit(4));
        const gallerySnapshot = await getDocs(qGallery);

        const galleryContainer = document.getElementById("latestGalleryContainer");
        galleryContainer.innerHTML = "";

        if (gallerySnapshot.empty) {
            galleryContainer.innerHTML = `
                <div class="empty-state">
                    <span class="empty-state-icon">📸</span>
                    Hələ şəkil yoxdur.
                    <a href="catches.html" class="empty-state-cta">🎣 İlk ov hesabatını sən paylaş ➔</a>
                </div>
            `;
        } else {
            gallerySnapshot.forEach((doc) => {
                const data = doc.data();
                galleryContainer.innerHTML += `
                    <div class="gallery-item" style="background: linear-gradient(to top, rgba(0,0,0,0.8), transparent), url('${data.image}') center/cover; background-color: #2c3e50;">
                        <span>📍 ${data.title}</span>
                    </div>
                `;
            });
        }

    } catch (error) {
        console.error("Xəta baş verdi:", error);
        const errorHtml = `
            <div class="empty-state is-error">
                <span class="empty-state-icon">⚠️</span>
                Məlumatları yükləmək mümkün olmadı. İnternet bağlantınızı yoxlayın.
            </div>
        `;
        const newsContainer = document.getElementById("latestNewsContainer");
        const galleryContainer = document.getElementById("latestGalleryContainer");
        if (newsContainer) newsContainer.innerHTML = errorHtml;
        if (galleryContainer) galleryContainer.innerHTML = errorHtml;
    }
}

// Запускаем загрузку, как только страница открылась
document.addEventListener("DOMContentLoaded", loadLatestData);