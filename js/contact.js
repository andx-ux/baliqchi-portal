import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";

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

const form = document.getElementById('contactForm');
const successMsg = document.getElementById('contactSuccessMsg');
const errorMsg = document.getElementById('contactErrorMsg');
const submitBtn = document.getElementById('contactSubmitBtn');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    successMsg.style.display = 'none';
    errorMsg.style.display = 'none';

    const name = document.getElementById('contactName').value.trim();
    const email = document.getElementById('contactEmail').value.trim();
    const message = document.getElementById('contactMessage').value.trim();

    if (!name || !email || !message) return;

    submitBtn.disabled = true;
    submitBtn.textContent = "Göndərilir...";

    try {
        await addDoc(collection(db, "messages"), {
            name,
            email,
            message,
            timestamp: Date.now()
        });

        form.reset();
        successMsg.style.display = 'block';
    } catch (error) {
        console.error("Mesaj göndərilmədi:", error);
        errorMsg.style.display = 'block';
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Göndər";
    }
});
