import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import {
    getFirestore, collection, addDoc, getDocs, query, orderBy,
    doc, updateDoc, arrayUnion, arrayRemove
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";
import {
    getAuth, onAuthStateChanged, signInWithEmailAndPassword,
    createUserWithEmailAndPassword, signOut
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";

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
const auth = getAuth(app);

const FISH_NAMES = [
    "Sazan", "Kütüm", "Qızılüzgəc (Karas)", "Ağ amur", "Qayabalığı (Qalınalın)",
    "Forel (Alabalığı)", "Külmə / Vobla", "Şəmayı", "Şirbit (Usaç)", "Kefal",
    "Çapaq", "Som", "Xramulya"
];

const REGIONS = [
    "Bakı və Abşeron", "Sumqayıt və Novxanı", "Xaçmaz (Nabran)", "Quba və Qusar",
    "Şamaxı", "Qəbələ", "Mingəçevir", "Yevlax", "Gəncə", "Şəmkir",
    "Qazax və Ağstafa", "Sabirabad", "İmişli", "Şirvan", "Neftçala",
    "Masallı", "Lənkəran", "Astara", "Qarabağ", "Zəngilan"
];

let currentUser = null;

const authCard = document.getElementById('authCard');
const userBar = document.getElementById('userBar');
const userEmailLbl = document.getElementById('userEmailLbl');
const newCatchCard = document.getElementById('newCatchCard');
const catchesGrid = document.getElementById('catchesGrid');

// Заполняем список рыб и регионов
const fishList = document.getElementById('fishNameList');
FISH_NAMES.forEach(n => {
    const o = document.createElement('option');
    o.value = n;
    fishList.appendChild(o);
});

const regionSelect = document.getElementById('catchRegion');
REGIONS.forEach(r => {
    const o = document.createElement('option');
    o.value = r;
    o.textContent = r;
    regionSelect.appendChild(o);
});

// ==========================================
// АВТОРИЗАЦИЯ (вход / регистрация одной формой)
// ==========================================
let authMode = 'login';
const authSubmitBtn = document.getElementById('authSubmitBtn');
const authToggleBtn = document.getElementById('authToggleModeBtn');
const authError = document.getElementById('authError');
const authEmail = document.getElementById('authEmail');
const authPassword = document.getElementById('authPassword');

function renderAuthMode() {
    authSubmitBtn.textContent = authMode === 'login' ? 'Daxil ol' : 'Qeydiyyatdan keç';
    authToggleBtn.textContent = authMode === 'login'
        ? 'Hesabınız yoxdur? Qeydiyyatdan keçin'
        : 'Artıq hesabınız var? Daxil olun';
    authError.style.display = 'none';
}
renderAuthMode();

authToggleBtn.addEventListener('click', () => {
    authMode = authMode === 'login' ? 'register' : 'login';
    renderAuthMode();
});

function translateAuthError(code) {
    const map = {
        'auth/email-already-in-use': 'Bu email artıq qeydiyyatdan keçib. Daxil olmağa cəhd edin.',
        'auth/invalid-email': 'Email düzgün formatda deyil.',
        'auth/weak-password': 'Şifrə ən azı 6 simvol olmalıdır.',
        'auth/wrong-password': 'Email və ya şifrə səhvdir.',
        'auth/user-not-found': 'Email və ya şifrə səhvdir.',
        'auth/invalid-credential': 'Email və ya şifrə səhvdir.',
        'auth/missing-password': 'Şifrəni daxil edin.'
    };
    return map[code] || 'Xəta baş verdi. Yenidən cəhd edin.';
}

authSubmitBtn.addEventListener('click', async () => {
    const email = authEmail.value.trim();
    const password = authPassword.value;
    if (!email || !password) return;

    authSubmitBtn.disabled = true;
    try {
        if (authMode === 'login') {
            await signInWithEmailAndPassword(auth, email, password);
        } else {
            await createUserWithEmailAndPassword(auth, email, password);
        }
        authEmail.value = '';
        authPassword.value = '';
    } catch (e) {
        authError.textContent = translateAuthError(e.code);
        authError.style.display = 'block';
    }
    authSubmitBtn.disabled = false;
});

document.getElementById('logoutBtn2').addEventListener('click', () => signOut(auth));

onAuthStateChanged(auth, (user) => {
    currentUser = user;
    authCard.style.display = user ? 'none' : 'block';
    userBar.style.display = user ? 'flex' : 'none';
    newCatchCard.style.display = user ? 'block' : 'none';
    if (user) userEmailLbl.textContent = user.email;
    renderCatches();
});

// ==========================================
// Превью картинки по ссылке
// ==========================================
const imageUrlInput = document.getElementById('catchImageUrl');
const imagePreviewContainer = document.getElementById('catchImagePreviewContainer');
const imagePreview = document.getElementById('catchImagePreview');

imageUrlInput.addEventListener('input', () => {
    const url = imageUrlInput.value.trim();
    if (url !== "") {
        imagePreview.src = url;
        imagePreviewContainer.style.display = 'block';
    } else {
        imagePreview.src = '';
        imagePreviewContainer.style.display = 'none';
    }
});
imagePreview.addEventListener('error', () => {
    imagePreviewContainer.style.display = 'none';
});

// ==========================================
// ПУБЛИКАЦИЯ НОВОГО ОТЧЁТА
// ==========================================
const publishCatchBtn = document.getElementById('publishCatchBtn');
publishCatchBtn.addEventListener('click', async () => {
    if (!currentUser) return;

    const species = document.getElementById('catchSpecies').value.trim();
    const weightRaw = document.getElementById('catchWeight').value.trim();
    const region = document.getElementById('catchRegion').value;
    const bait = document.getElementById('catchBait').value.trim();
    const image = document.getElementById('catchImageUrl').value.trim();
    const note = document.getElementById('catchNote').value.trim();

    if (!species || !image) {
        alert('Balıq növü və şəklin linki mütləqdir!');
        return;
    }

    publishCatchBtn.disabled = true;
    publishCatchBtn.textContent = 'Dərc edilir...';

    try {
        await addDoc(collection(db, 'catches'), {
            species,
            weight: weightRaw ? Number(weightRaw) : null,
            region: region || '',
            bait: bait || '',
            image,
            note: note || '',
            authorEmail: currentUser.email,
            authorUid: currentUser.uid,
            timestamp: Date.now(),
            likedBy: [],
            comments: []
        });

        document.getElementById('catchSpecies').value = '';
        document.getElementById('catchWeight').value = '';
        document.getElementById('catchRegion').value = '';
        document.getElementById('catchBait').value = '';
        document.getElementById('catchImageUrl').value = '';
        document.getElementById('catchNote').value = '';
        imagePreviewContainer.style.display = 'none';

        await renderCatches();
    } catch (e) {
        alert('Xəta: ' + e.message);
    }

    publishCatchBtn.disabled = false;
    publishCatchBtn.textContent = 'Dərc et';
});

// ==========================================
// ЛЕНТА ОТЧЁТОВ
// ==========================================
function timeAgo(ts) {
    const diffMin = Math.floor((Date.now() - ts) / 60000);
    if (diffMin < 1) return 'indicə';
    if (diffMin < 60) return diffMin + ' dəq əvvəl';
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return diffHr + ' saat əvvəl';
    return Math.floor(diffHr / 24) + ' gün əvvəl';
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
}

const expandedComments = new Set();

function renderCatchCard(id, data) {
    const card = document.createElement('div');
    card.className = 'card catch-card';
    card.style.padding = '0';
    card.style.overflow = 'hidden';

    const likedBy = data.likedBy || [];
    const comments = data.comments || [];
    const liked = !!(currentUser && likedBy.includes(currentUser.uid));

    const tags = [];
    if (data.region) tags.push(`<span class="fish-tag">📍 ${escapeHtml(data.region)}</span>`);
    if (data.bait) tags.push(`<span class="fish-tag">🪱 ${escapeHtml(data.bait)}</span>`);

    const commentsHtml = comments.map(c =>
        `<div class="catch-comment"><b>${escapeHtml(c.authorEmail)}:</b> ${escapeHtml(c.text)}</div>`
    ).join('');

    const commentForm = currentUser
        ? `<div class="catch-comment-form">
                <input type="text" placeholder="Şərh yazın..." class="catch-comment-input" data-id="${id}">
                <button class="catch-comment-submit" data-id="${id}">Göndər</button>
           </div>`
        : `<p style="font-size:12px; color:var(--text-light); margin-top: 8px;">Şərh yazmaq üçün daxil olun.</p>`;

    card.innerHTML = `
        <img class="fish-photo" src="${data.image}" alt="${escapeHtml(data.species)}" loading="lazy">
        <div style="padding: 15px;">
            <h3 style="color: var(--secondary); margin-bottom: 8px;">🐟 ${escapeHtml(data.species)}${data.weight ? ' — ' + escapeHtml(data.weight) + ' kq' : ''}</h3>
            <div style="margin-bottom: 8px;">${tags.join('')}</div>
            ${data.note ? `<p style="font-size: 13px; color: var(--text-dark); margin-bottom: 10px;">${escapeHtml(data.note)}</p>` : ''}
            <p style="font-size: 11px; color: var(--text-light); margin-bottom: 10px;">👤 ${escapeHtml(data.authorEmail || 'Anonim')} · ${timeAgo(data.timestamp)}</p>
            <div class="catch-actions">
                <button class="catch-like-btn ${liked ? 'liked' : ''}" data-id="${id}">${liked ? '❤️' : '🤍'} <span>${likedBy.length}</span></button>
                <button class="catch-comment-toggle" data-id="${id}">💬 <span>${comments.length}</span></button>
            </div>
            <div class="catch-comments" id="comments-${id}" style="display:${expandedComments.has(id) ? 'flex' : 'none'};">
                ${commentsHtml}
                ${commentForm}
            </div>
        </div>
    `;

    card.querySelector('.catch-like-btn').addEventListener('click', () => toggleLike(id, likedBy));
    card.querySelector('.catch-comment-toggle').addEventListener('click', () => {
        const el = document.getElementById(`comments-${id}`);
        const isHidden = el.style.display === 'none';
        el.style.display = isHidden ? 'flex' : 'none';
        if (isHidden) expandedComments.add(id); else expandedComments.delete(id);
    });
    const submitBtn = card.querySelector('.catch-comment-submit');
    if (submitBtn) submitBtn.addEventListener('click', () => addComment(id));

    return card;
}

async function toggleLike(id, likedBy) {
    if (!currentUser) { alert('Bəyənmək üçün daxil olun.'); return; }
    const ref = doc(db, 'catches', id);
    try {
        if (likedBy.includes(currentUser.uid)) {
            await updateDoc(ref, { likedBy: arrayRemove(currentUser.uid) });
        } else {
            await updateDoc(ref, { likedBy: arrayUnion(currentUser.uid) });
        }
        await renderCatches();
    } catch (e) {
        console.error(e);
    }
}

async function addComment(id) {
    if (!currentUser) return;
    const input = document.querySelector(`.catch-comment-input[data-id="${id}"]`);
    const text = input.value.trim();
    if (!text) return;
    const ref = doc(db, 'catches', id);
    try {
        await updateDoc(ref, {
            comments: arrayUnion({ text, authorEmail: currentUser.email, timestamp: Date.now() })
        });
        await renderCatches();
    } catch (e) {
        console.error(e);
    }
}

async function renderCatches() {
    try {
        const q = query(collection(db, 'catches'), orderBy('timestamp', 'desc'));
        const snap = await getDocs(q);
        catchesGrid.innerHTML = '';
        if (snap.empty) {
            catchesGrid.innerHTML = '<p style="text-align:center; color:var(--text-light); grid-column: 1/-1;">Hələ heç bir ov hesabatı yoxdur. İlk siz olun!</p>';
            return;
        }
        snap.forEach(docSnap => {
            catchesGrid.appendChild(renderCatchCard(docSnap.id, docSnap.data()));
        });
    } catch (e) {
        catchesGrid.innerHTML = '<p style="text-align:center; color:red;">Məlumatları yükləmək mümkün olmadı.</p>';
        console.error(e);
    }
}

renderCatches();
