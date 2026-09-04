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
const newsContainer = document.getElementById('newsContainer');
const loadingText = document.getElementById('loadingText');

async function loadNews() {
    try {
        // Запрашиваем новости, отсортированные по времени (от новых к старым)
        const q = query(collection(db, "news"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);

        loadingText.style.display = "none";

        if (querySnapshot.empty) {
            newsContainer.innerHTML = "<p>Hələ heç bir xəbər yoxdur. (Новостей пока нет).</p>";
            return;
        }

        querySnapshot.forEach((doc) => {
            const data = doc.data();

            // Убираем HTML-теги перед обрезкой, чтобы не разорвать разметку из редактора
            const plainText = data.text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
            const excerpt = plainText.length > 80 ? plainText.substring(0, 80) + '...' : plainText;

            // Создаем карточку новости (очищенную от встроенных стилей)
            const newsItem = document.createElement('div');
            newsItem.className = 'news-item';
            newsItem.innerHTML = `
                <div class="news-img" style="background: url('${data.image}') center/cover;"></div>
                <div class="news-content">
                    <h4>${data.title}</h4>
                    <span>🗓️ ${data.date} | 👁️ ${data.views} baxış</span>
                    <p class="news-desc">${excerpt}</p>
                </div>
            `;
            newsContainer.appendChild(newsItem);
        });
    } catch (error) {
        console.error("Xəta:", error);
        loadingText.innerHTML = "Xəbərləri yükləmək mümkün olmadı. İnternet bağlantınızı yoxlayın.";
    }
}

// Запускаем загрузку при открытии страницы
loadNews();