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

// Базovые məlumatlar — hər zaman göstərilir, admin panelindən əlavə olunan yeni balıqlar bunların üstünə gəlir
const STATIC_FISH = [
    { title: "Sazan (Çəki)", emoji: "🐟", image: "img/sazan.jpg", region: "Kür, su anbarları", bait: "Qarğıdalı, xəmir, qurd", season: "May - Oktyabr", text: "Ən geniş yayılmış balıqlardan biridir. Palçıqlı və sakit dib suları sevir, dan və axşam saatlarında daha aktivdir." },
    { title: "Kütüm", emoji: "🐠", image: "img/kutum.jpg", region: "Xəzər dənizi, Kür mənsəbi", bait: "Qurd, krevet", season: "Fevral - Aprel (kürü dövrü)", text: "Azərbaycanın ən qiymətli balıqlarından biri. Bahar aylarında kürü tökmək üçün çaylara qalxır, bu dövrdə ovu tənzimlənir." },
    { title: "Qızılüzgəc (Karas)", emoji: "🐡", image: "img/karas.jpg", region: "Göllər, su anbarları", bait: "Duz xəmiri, qurd", season: "Bütün il", text: "Sakit, palçıqlı sularda yaşayan dözümlü balıqdır. Hətta soyuq aylarda belə zəif də olsa clev verir." },
    { title: "Ağ amur", emoji: "🐟", image: "img/ag-amur.jpg", region: "Kür çayı, su anbarları", bait: "Yaşıl otlar, qarğıdalı", season: "İyun - Sentyabr", text: "Bitki mənşəli yem sevən iri balıqdır. İsti aylarda səthə yaxın, sudakı bitkilərin yanında axtarılmalıdır." },
    { title: "Qayabalığı (Qalınalın)", emoji: "🐠", image: "img/qayabaligi.jpg", region: "Dağ çayları (Quba, Qəbələ)", bait: "Qurd, həşərat təqlidi", season: "Aprel - Oktyabr", text: "Sürətli axarlı, daşlı dib olan dağ çaylarını sevir. Günorta saatlarında daha aktiv olur." },
    { title: "Forel (Alabalığı)", emoji: "🎣", image: "img/forel.jpg", region: "Dağ çayları, soyuq bulaqlar", bait: "Süni milçək, qurd", season: "Sentyabr - May (soyuq aylar)", text: "Soyuq və təmiz suları sevən qiymətli balıqdır. İsti yay aylarında aktivliyi kəskin azalır." },
    { title: "Külmə / Vobla", emoji: "🐟", image: "img/kulme-vobla.jpg", region: "Xəzər sahili, Kür mənsəbi", bait: "Qurd, çörək xəmiri", season: "Mart - May", text: "Kiçik, lakin çox sayda tutulan sahil balığıdır. Sürü halında hərəkət etdiyi üçün bir yerdə uzun müddət clev verə bilər." },
    { title: "Şəmayı", emoji: "🐠", image: "img/shemayi.jpg", region: "Kür çayı, su anbarları", bait: "Xırda qurd, milçək", season: "May - Avqust", text: "Parlaq gümüşü rəngli, sürətli üzən kiçik balıqdır. Səthə yaxın suda, gün doğuşunda daha fəaldır." },
    { title: "Şirbit (Usaç)", emoji: "🐡", image: "img/shirbit.jpg", region: "Kür və Araz çayları", bait: "Qurd, xərçəngkimilər", season: "May - Sentyabr", text: "Axar suların dibində, daşların arasında yaşayan güclü balıqdır. Axşam saatlarında ovu daha uğurlu olur." },
    { title: "Kefal", emoji: "🐟", image: "img/kefal.jpg", region: "Xəzər dənizi sahilləri", bait: "Duz xəmiri, çörək", season: "İyun - Oktyabr", text: "Dəniz sahillərində sürü halında üzən sürətli balıqdır. Sakit hava şəraitində sahilə yaxınlaşır." },
    { title: "Çapaq (Лещ)", emoji: "🐡", image: "img/chapaq.jpg", region: "Kür, su anbarları", bait: "Qarğıdalı, qurd, xəmir", season: "Aprel - Oktyabr", text: "Dərin və sakit sularda yaşayan, gecə və dan vaxtı fəallaşan klassik göl balığıdır." },
    { title: "Nərə (Ştrelin)", emoji: "🦈", image: "img/nere.jpg", region: "Xəzər dənizi", bait: "Qorunur / ovu qadağandır", season: "—", text: "Xəzərin əfsanəvi nəhəng balığıdır. Populyasiyası kəskin azaldığı üçün ovu qanunla qadağandır və ya ciddi şəkildə tənzimlənir — yalnız məlumat üçün." },
    { title: "Som", emoji: "🐋", image: "img/som.jpg", region: "Kür çayı, dərin su anbarları", bait: "Canlı balıqcıq, qurbağa təqlidi", season: "May - Sentyabr (isti gecələr)", text: "Çayın ən iri yırtıcılarından biridir. Adətən gecə vaxtı, dərin çuxurlarda ovlanır, güclü ləvazimat tələb edir." },
    { title: "Xramulya", emoji: "🐠", region: "Quba, Qusar dağ çayları", bait: "Yosun, xırda həşərat", season: "Aprel - Oktyabr", text: "Dağ çaylarının sürətli axarlarında yaşayan, daş üzərindəki yosunlarla qidalanan balıqdır." }
];

const GRADIENTS = [
    "linear-gradient(135deg,#0f4c75,#3282b8)",
    "linear-gradient(135deg,#1b4332,#2d6a4f)",
    "linear-gradient(135deg,#0077b6,#00b4d8)",
    "linear-gradient(135deg,#ff8c00,#ffb703)",
    "linear-gradient(135deg,#2b2d42,#5c6bc0)",
    "linear-gradient(135deg,#264653,#2a9d8f)"
];

function renderFishCard(data, index) {
    const item = document.createElement('div');
    item.className = 'card fish-card';
    item.style.padding = '0';
    item.style.overflow = 'hidden';
    item.setAttribute('data-name', data.title.toLowerCase());

    const media = data.image
        ? `<img class="fish-photo" src="${data.image}" alt="${data.title}" loading="lazy">`
        : `<div class="fish-photo-placeholder" style="background:${GRADIENTS[index % GRADIENTS.length]}">${data.emoji || '🐟'}</div>`;

    const tags = [];
    if (data.region) tags.push(`<span class="fish-tag">📍 ${data.region}</span>`);
    if (data.bait) tags.push(`<span class="fish-tag">🪱 ${data.bait}</span>`);
    if (data.season) tags.push(`<span class="fish-tag fish-tag-season">📅 ${data.season}</span>`);

    item.innerHTML = `
        ${media}
        <div style="padding: 15px;">
            <h3 style="color: var(--secondary); margin-bottom: 10px;">${data.emoji ? data.emoji + ' ' : '🐟 '}${data.title}</h3>
            <div style="margin-bottom: 8px;">${tags.join('')}</div>
            <p style="font-size: 13px; color: var(--text-dark); white-space: pre-line;">${data.text}</p>
        </div>
    `;
    return item;
}

function enableSearch() {
    const fishCards = document.querySelectorAll('.fish-card');
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase().trim();
        fishCards.forEach(card => {
            const name = card.getAttribute('data-name');
            card.style.display = name.includes(term) ? 'block' : 'none';
        });
    });
}

async function loadEncyclopedia() {
    loadingText.style.display = "none";

    // 1. Всегда рисуем базовый набор рыб — энциклопедия никогда не пустая
    STATIC_FISH.forEach((fish, i) => fishGrid.appendChild(renderFishCard(fish, i)));

    // 2. Дotягиваем дополнительные записи, добавленные через админ-панель
    try {
        const q = query(collection(db, "encyclopedia"), orderBy("title", "asc"));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc, i) => {
            fishGrid.appendChild(renderFishCard(doc.data(), STATIC_FISH.length + i));
        });
    } catch (error) {
        console.error("Əlavə balıq məlumatları yüklənmədi:", error);
    }

    enableSearch();
}

loadEncyclopedia();
