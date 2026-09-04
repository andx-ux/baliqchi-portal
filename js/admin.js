import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";

// Yalnız bu email(lər) admin panelinə daxil ola bilər.
// QEYD: Bu, yalnız görüntü səviyyəsində qorumadır — əsas qorumanı
// Firebase Console-da Firestore Security Rules ilə etmək lazımdır.
const ADMIN_EMAILS = ["anaris0909@gmail.com"];

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

// ИНИЦИАЛИЗАЦИЯ ВИЗУАЛЬНОГО РЕДАКТОРА
const quill = new Quill('#editor-container', {
    theme: 'snow',
    placeholder: 'Məlumat və təsvir (Напишите красиво: со списками, абзацами и жирным шрифтом...)'
});

// Проверка входа администратора
onAuthStateChanged(auth, (user) => {
    const isAdmin = !!user && ADMIN_EMAILS.includes(user.email);

    if (user && !isAdmin) {
        // İcazəsiz hesab daxil olmağa çalışıb — dərhal çıxarırıq
        signOut(auth);
        document.getElementById('loginError').textContent = "Bu hesabın admin panelinə girişi yoxdur.";
        document.getElementById('loginError').style.display = 'block';
        return;
    }

    document.getElementById('loginScreen').style.display = isAdmin ? 'none' : 'block';
    document.getElementById('adminScreen').style.display = isAdmin ? 'block' : 'none';
});

// Авторизация
document.getElementById('loginBtn').addEventListener('click', () => {
    document.getElementById('loginError').textContent = "Məlumat yalnışdır";
    signInWithEmailAndPassword(auth, document.getElementById('adminEmail').value, document.getElementById('adminPassword').value)
        .catch(() => document.getElementById('loginError').style.display = 'block');
});

// Выход
document.getElementById('logoutBtn').addEventListener('click', () => signOut(auth));

// ==========================================
// Мгновенное превью картинки по ссылке
// ==========================================
const imageUrlInput = document.getElementById('postImageUrl');
const imagePreviewContainer = document.getElementById('imagePreviewContainer');
const imagePreview = document.getElementById('imagePreview');

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
// ПУБЛИКАЦИЯ
// ==========================================
document.getElementById('publishBtn').addEventListener('click', async () => {
    const category = document.getElementById('postCategory').value;
    const title = document.getElementById('postTitle').value.trim();
    const imageUrlInputVal = document.getElementById('postImageUrl').value.trim();
    
    // БЕРЕМ ТЕКСТ ИЗ РЕДАКТОРА ВМЕСТЕ С ФОРМАТИРОВАНИЕМ (HTML-тегами)
    const text = quill.root.innerHTML;

    // Проверяем, не пустой ли редактор (Quill по умолчанию оставляет пустой абзац)
    if (!title || quill.getText().trim().length === 0) {
        return alert("Başlıq və mətn mütləqdir!");
    }

    const btn = document.getElementById('publishBtn');
    btn.textContent = "Dərc edilir... (Публикация...)";
    btn.disabled = true;

    const defaultImage = "https://images.unsplash.com/photo-1544265691-032a22fa9cb1?auto=format&fit=crop&w=600&q=80";
    const finalImageUrl = imageUrlInputVal !== "" ? imageUrlInputVal : defaultImage;

    try {
        await addDoc(collection(db, category), {
            title: title,
            image: finalImageUrl,
            text: text, // Сохраняем готовую верстку
            date: new Date().toLocaleDateString('az-AZ'),
            timestamp: Date.now(),
            views: Math.floor(Math.random() * 50) + 10
        });

        // Очистка всех полей после успеха
        document.getElementById('postTitle').value = "";
        document.getElementById('postImageUrl').value = "";
        quill.root.innerHTML = ""; // Очищаем редактор
        
        imagePreview.src = "";
        imagePreviewContainer.style.display = "none";
        
        btn.textContent = "Dərc et (Опубликовать)";
        btn.disabled = false;
        
        const successMsg = document.getElementById('successMsg');
        successMsg.style.display = "block";
        setTimeout(() => successMsg.style.display = "none", 3000);

    } catch (error) {
        alert("Xəta: " + error.message);
        btn.textContent = "Dərc et (Опубликовать)";
        btn.disabled = false;
    }
});