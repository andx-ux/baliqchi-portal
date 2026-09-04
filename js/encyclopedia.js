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
    { title: "Sazan (Çəki)", emoji: "🐟", image: "img/sazan.jpg", region: "Kür, su anbarları", bait: "Qarğıdalı, xəmir, qurd", season: "May - Oktyabr", text: "Ən geniş yayılmış balıqlardan biridir. Palçıqlı və sakit dib suları sevir, dan və axşam saatlarında daha aktivdir.", rod: "Fider udliş, 3.3-3.9 m, test 60-100 q", tackle: "Fider montajı (yem qabı + tel qapaq) və ya \"tük\" (hair rig) montaj", lure: "Bişmiş qarğıdalı, boyl, xəmir, qurd", chum: "Qarğıdalılı şirin fider yemi + jom" },
    { title: "Kütüm", emoji: "🐠", image: "img/kutum.jpg", region: "Xəzər dənizi, Kür mənsəbi", bait: "Qurd, krevet", season: "Fevral - Aprel (kürü dövrü)", text: "Azərbaycanın ən qiymətli balıqlarından biri. Bahar aylarında kürü tökmək üçün çaylara qalxır, bu dövrdə ovu tənzimlənir.", rod: "Fider və ya poplavok udliş, 3.6-4.2 m", tackle: "Nazik uducu ilə həssas fider montajı (çox ehtiyatlı balıqdır)", lure: "Qurd, krevet, midiya əti", chum: "Xırda fraksiyalı yüngül yem" },
    { title: "Qızılüzgəc (Karas)", emoji: "🐡", image: "img/karas.jpg", region: "Göllər, su anbarları", bait: "Duz xəmiri, qurd", season: "Bütün il", text: "Sakit, palçıqlı sularda yaşayan dözümlü balıqdır. Hətta soyuq aylarda belə zəif də olsa clev verir.", rod: "Poplavok udliş, 4-5 m, və ya yüngül fider", tackle: "Yüngül poplavok montajı, xırda qarmaq", lure: "Opariş, qurd, xəmir", chum: "Tünd rəngli çörək qırıntısı + jom" },
    { title: "Ağ amur", emoji: "🐟", image: "img/ag-amur.jpg", region: "Kür çayı, su anbarları", bait: "Yaşıl otlar, qarğıdalı", season: "İyun - Sentyabr", text: "Bitki mənşəli yem sevən iri balıqdır. İsti aylarda səthə yaxın, sudakı bitkilərin yanında axtarılmalıdır.", rod: "Karp udliş, test 2.75-3.5 lb", tackle: "Method fider və ya donka montajı", lure: "Qarğıdalı, təzə ot/qamış yarpağı, xiyar", chum: "Yaşıl bitki tərkibli yem, doğranmış yosun" },
    { title: "Qayabalığı (Qalınalın)", emoji: "🐠", image: "img/qayabaligi.jpg", region: "Dağ çayları (Quba, Qəbələ)", bait: "Qurd, həşərat təqlidi", season: "Aprel - Oktyabr", text: "Sürətli axarlı, daşlı dib olan dağ çaylarını sevir. Günorta saatlarında daha aktiv olur.", rod: "Yüngül spinning (ultralight), 1.8-2.1 m", tackle: "Xırda fırlanan bleşnə və ya axar suda poplavok montajı", lure: "Qurd, çəyirtkə, xırda bleşnə", chum: "Adətən tələb olunmur (güclü axar su)" },
    { title: "Forel (Alabalığı)", emoji: "🎣", image: "img/forel.jpg", region: "Dağ çayları, soyuq bulaqlar", bait: "Süni milçək, qurd", season: "Sentyabr - May (soyuq aylar)", text: "Soyuq və təmiz suları sevən qiymətli balıqdır. İsti yay aylarında aktivliyi kəskin azalır.", rod: "Ultralight spinning, 1.8-2.4 m, test 2-10 q, ya da fly-fishing", tackle: "Kiçik yırtıcı bleşnə/vobler və ya süni milçək montajı", lure: "Silikon tvister, opariş, süni milçək", chum: "İstifadə olunmur" },
    { title: "Külmə / Vobla", emoji: "🐟", image: "img/kulme-vobla.jpg", region: "Xəzər sahili, Kür mənsəbi", bait: "Qurd, çörək xəmiri", season: "Mart - May", text: "Kiçik, lakin çox sayda tutulan sahil balığıdır. Sürü halında hərəkət etdiyi üçün bir yerdə uzun müddət clev verə bilər.", rod: "Poplavok/matç udliş, 4-5 m", tackle: "Yüngül poplavok montajı, xırda qarmaq", lure: "Motıl, opariş, xəmir", chum: "Xırda fraksiyalı yüngül yem" },
    { title: "Şəmayı", emoji: "🐠", image: "img/shemayi.jpg", region: "Kür çayı, su anbarları", bait: "Xırda qurd, milçək", season: "May - Avqust", text: "Parlaq gümüşü rəngli, sürətli üzən kiçik balıqdır. Səthə yaxın suda, gün doğuşunda daha fəaldır.", rod: "Maxovoy poplavok udliş, 4-6 m", tackle: "Yüngül poplavok, xırda qarmaq (№16-18)", lure: "Opariş, milçək, xırda qurd", chum: "Az miqdarda çörək qırıntısı" },
    { title: "Şirbit (Usaç)", emoji: "🐡", image: "img/shirbit.jpg", region: "Kür və Araz çayları", bait: "Qurd, xərçəngkimilər", season: "May - Sentyabr", text: "Axar suların dibində, daşların arasında yaşayan güclü balıqdır. Axşam saatlarında ovu daha uğurlu olur.", rod: "Orta-ağır fider, 3.6 m, test 80-120 q", tackle: "Ağır fider kormuşkası və ya donka (güclü axar üçün)", lure: "Qurd, pellets, qarğıdalı", chum: "Yüksək proteinli fider yemi" },
    { title: "Kefal", emoji: "🐟", image: "img/kefal.jpg", region: "Xəzər dənizi sahilləri", bait: "Duz xəmiri, çörək", season: "İyun - Oktyabr", text: "Dəniz sahillərində sürü halında üzən sürətli balıqdır. Sakit hava şəraitində sahilə yaxınlaşır.", rod: "Dəniz serf udlişi, 3.6-4.2 m", tackle: "Yüngül dəniz donka/poplavok montajı", lure: "Çörək, krevet, dəniz qurdu (nereis)", chum: "Torpaqla qarışdırılmış çörək qırıntısı (yavaş dib batır)" },
    { title: "Çapaq (Лещ)", emoji: "🐡", image: "img/chapaq.jpg", region: "Kür, su anbarları", bait: "Qarğıdalı, qurd, xəmir", season: "Aprel - Oktyabr", text: "Dərin və sakit sularda yaşayan, gecə və dan vaxtı fəallaşan klassik göl balığıdır.", rod: "Fider udliş, 3.6-3.9 m, test 40-80 q", tackle: "Klassik fider montajı və ya \"tük\" montaj", lure: "Qurd+opariş \"sendviç\", perlovka", chum: "Tünd fider yemi (kakao/jom əlavəli)" },
    { title: "Nərə (Ştrelin)", emoji: "🦈", image: "img/nere.jpg", region: "Xəzər dənizi", bait: "Qorunur / ovu qadağandır", season: "—", text: "Xəzərin əfsanəvi nəhəng balığıdır. Populyasiyası kəskin azaldığı üçün ovu qanunla qadağandır və ya ciddi şəkildə tənzimlənir — yalnız məlumat üçün.", rod: "—", tackle: "Ovu qanunla qadağandır", lure: "—", chum: "—" },
    { title: "Som", emoji: "🐋", image: "img/som.jpg", region: "Kür çayı, dərin su anbarları", bait: "Canlı balıqcıq, qurbağa təqlidi", season: "May - Sentyabr (isti gecələr)", text: "Çayın ən iri yırtıcılarından biridir. Adətən gecə vaxtı, dərin çuxurlarda ovlanır, güclü ləvazimat tələb edir.", rod: "Güclü som udlişi (kastinq), test 100-300 q", tackle: "Kvok + donka montajı, və ya iri cig-silikon", lure: "Canlı balıqcıq, qurbağa, toyuq qaraciyəri, midiya əti", chum: "Adətən tələb olunmur — kvok səsi balığı cəlb edir" },
    { title: "Xramulya", emoji: "🐠", region: "Quba, Qusar dağ çayları", bait: "Yosun, xırda həşərat", season: "Aprel - Oktyabr", text: "Dağ çaylarının sürətli axarlarında yaşayan, daş üzərindəki yosunlarla qidalanan balıqdır.", rod: "Yüngül spinning və ya maxovoy udliş", tackle: "Axar suda yüngül poplavok montajı", lure: "Yosun tikəsi, opariş, xırda həşərat", chum: "Adətən tələb olunmur" }
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

    const gearRows = [];
    if (data.rod) gearRows.push(`<div class="fish-gear-row"><span class="fish-gear-ico">🎣</span><span><b>Udilişə:</b> ${data.rod}</span></div>`);
    if (data.tackle) gearRows.push(`<div class="fish-gear-row"><span class="fish-gear-ico">🧵</span><span><b>Snast:</b> ${data.tackle}</span></div>`);
    if (data.lure) gearRows.push(`<div class="fish-gear-row"><span class="fish-gear-ico">🪱</span><span><b>Yem:</b> ${data.lure}</span></div>`);
    if (data.chum) gearRows.push(`<div class="fish-gear-row"><span class="fish-gear-ico">🌾</span><span><b>Yemləmə (prikormka):</b> ${data.chum}</span></div>`);
    const gear = gearRows.length ? `<div class="fish-gear">${gearRows.join('')}</div>` : '';

    item.innerHTML = `
        ${media}
        <div style="padding: 15px;">
            <h3 style="color: var(--secondary); margin-bottom: 10px;">${data.emoji ? data.emoji + ' ' : '🐟 '}${data.title}</h3>
            <div style="margin-bottom: 8px;">${tags.join('')}</div>
            <p style="font-size: 13px; color: var(--text-dark); white-space: pre-line;">${data.text}</p>
            ${gear}
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
