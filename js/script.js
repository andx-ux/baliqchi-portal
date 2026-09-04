document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. БОКОВОЕ МЕНЮ (РАБОТАЕТ НА ВСЕХ СТРАНИЦАХ)
    // ==========================================
    const menuBtn = document.getElementById('menuBtn');
    const mainNav = document.getElementById('mainNav');

    if (menuBtn && mainNav) {
        menuBtn.addEventListener('click', () => {
            mainNav.classList.toggle('open');

            if (mainNav.classList.contains('open')) {
                menuBtn.innerHTML = '✕';
            } else {
                menuBtn.innerHTML = '☰';
            }
        });
    }

    // ==========================================
    // 2. ПОГОДА И КАЛЕНДАРЬ КЛЕВА (ТОЛЬКО ДЛЯ ГЛАВНОЙ СТРАНИЦЫ)
    // ==========================================
    const regionSelect = document.getElementById('regionSelect');

    if (regionSelect) {
        const weatherLocation = document.getElementById('weatherLocation');
        const tempVal = document.getElementById('tempVal');
        const pressureVal = document.getElementById('pressureVal');
        const windVal = document.getElementById('windVal');

        const prevDayBtn = document.getElementById('prevDayBtn');
        const nextDayBtn = document.getElementById('nextDayBtn');
        const currentDateDisplay = document.getElementById('currentDateDisplay');
        const catchTableBody = document.getElementById('catchTableBody');
        const moonVal = document.getElementById('moonVal');
        const moonIcon = document.getElementById('moonIcon');

        const regions = {
            baku: { lat: 40.4093, lon: 49.8671, name: "Bakı və Abşeron" },
            sumqayit: { lat: 40.5897, lon: 49.6686, name: "Sumqayıt və Novxanı" },
            pirallahi: { lat: 40.4723, lon: 50.3167, name: "Pirallahı və Gürgən" },
            khachmaz: { lat: 41.4715, lon: 48.8105, name: "Xaçmaz (Nabran sahilləri)" },
            quba: { lat: 41.3611, lon: 48.5134, name: "Quba və Qusar çayları" },
            shamaxi: { lat: 40.6303, lon: 48.6414, name: "Şamaxı (Qızmeydan)" },
            gabala: { lat: 40.9804, lon: 47.8486, name: "Qəbələ (Nohur gölü)" },
            mingechevir: { lat: 40.7639, lon: 47.0595, name: "Mingəçevir (Su anbarı)" },
            yevlax: { lat: 40.6183, lon: 47.1501, name: "Yevlax (Kür çayı)" },
            ganja: { lat: 40.6828, lon: 46.3606, name: "Gəncə zonası" },
            shamkir: { lat: 40.8298, lon: 46.0178, name: "Şəmkir Su Anbarı" },
            gazakh: { lat: 41.0933, lon: 45.3660, name: "Qazax və Ağstafa" },
            sabirabad: { lat: 40.0135, lon: 48.4795, name: "Sabirabad (Kür və Araz)" },
            imishli: { lat: 39.8687, lon: 48.0601, name: "İmişli (Sarısu gölü)" },
            shirvan: { lat: 39.9328, lon: 48.9162, name: "Şirvan (Hacıqabul gölü)" },
            neftchala: { lat: 39.3563, lon: 49.2467, name: "Neftçala (Kürün mənsəbi)" },
            masalli: { lat: 39.0341, lon: 48.6655, name: "Masallı (Viləşçay)" },
            lenkaran: { lat: 38.7523, lon: 48.8511, name: "Lənkəran zonası" },
            astara: { lat: 38.4560, lon: 48.8750, name: "Astara (Dəniz / Çay)" },
            karabakh: { lat: 40.3015, lon: 46.8202, name: "Qarabağ (Suqovuşan)" },
            zangilan: { lat: 39.0833, lon: 46.6167, name: "Zəngilan (Araz çayı)" }
        };

        async function loadWeatherData(regionKey) {
            const { lat, lon, name } = regions[regionKey];
            weatherLocation.textContent = name;
            tempVal.textContent = "Yüklənir...";

            try {
                const targetDateObj = new Date(baseDate);
                targetDateObj.setDate(baseDate.getDate() + dayOffset);
                
                const year = targetDateObj.getFullYear();
                const month = String(targetDateObj.getMonth() + 1).padStart(2, '0');
                const dayStr = String(targetDateObj.getDate()).padStart(2, '0');
                const isoDate = `${year}-${month}-${dayStr}`;

                // ИСПРАВЛЕНИЕ: Увеличили прогноз до 14 дней (forecast_days=14)
                const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,pressure_msl,wind_speed_10m&timezone=auto&past_days=1&forecast_days=14`);
                const data = await response.json();

                const targetTime = `${isoDate}T14:00`;
                let timeIndex = data.hourly.time.indexOf(targetTime);
                
                if (timeIndex === -1) {
                    timeIndex = data.hourly.time.findIndex(t => t.startsWith(isoDate));
                }
                if (timeIndex === -1) timeIndex = 0; 

                const temp = Math.round(data.hourly.temperature_2m[timeIndex]);
                const pressureHPa = data.hourly.pressure_msl[timeIndex];
                const pressureMmHg = Math.round(pressureHPa * 0.750062);
                const wind = Math.round(data.hourly.wind_speed_10m[timeIndex] * 1000 / 3600);

                tempVal.textContent = temp > 0 ? `+${temp}°C` : `${temp}°C`;
                pressureVal.textContent = pressureMmHg;
                if (windVal) windVal.textContent = `${wind} m/s`;

                updateSmartCalendar(temp, wind);

            } catch (error) {
                console.error("Hava məlumatı alına bilmədi", error);
                tempVal.textContent = "Xəta";
                updateSmartCalendar(25, 3);
            }
        }

        function updateSmartCalendar(currentTemp, currentWind) {
            catchTableBody.innerHTML = "";

            const fishes = [
                { name: "Sazan / Çəki", base: { m: 'good', d: 'normal', e: 'good' } },
                { name: "Ağ amur", base: { m: 'good', d: 'normal', e: 'good' } },
                { name: "Qayabalığı (Qalınalın)", base: { m: 'normal', d: 'good', e: 'normal' } },
                { name: "Forel (Alabalığı)", base: { m: 'good', d: 'bad', e: 'good' }, isColdWater: true },
                { name: "Külmə / Vobla", base: { m: 'normal', d: 'good', e: 'normal' } },
                { name: "Şəmayı", base: { m: 'good', d: 'good', e: 'normal' } },
                { name: "Şirbit (Usaç)", base: { m: 'normal', d: 'bad', e: 'good' } },
                { name: "Kefal", base: { m: 'normal', d: 'good', e: 'normal' } },
                { name: "Kütüm", base: { m: 'bad', d: 'bad', e: 'normal' }, isColdWater: true },
                { name: "Çapaq (Лещ)", base: { m: 'good', d: 'normal', e: 'good' } },
                { name: "Qızılüzgəc", base: { m: 'good', d: 'good', e: 'bad' } }
            ];

            fishes.forEach(fish => {
                let statusMorning = fish.base.m;
                let statusDay = fish.base.d;
                let statusEvening = fish.base.e;

                if (currentTemp >= 28) {
                    statusDay = 'bad';
                    if (fish.isColdWater) {
                        statusMorning = 'normal';
                        statusEvening = 'normal';
                    }
                }

                if (currentTemp < 15) {
                    if (fish.name.includes('amur') || fish.name.includes('Qayabalığı')) {
                        statusMorning = 'bad'; statusDay = 'bad'; statusEvening = 'bad';
                    }
                }

                if (currentWind > 6) {
                    if (statusMorning === 'good') statusMorning = 'normal';
                    if (statusDay === 'good') statusDay = 'normal';
                    if (statusEvening === 'good') statusEvening = 'normal';
                }

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${fish.name}</strong></td>
                    <td>${getBadge(statusMorning)}</td>
                    <td>${getBadge(statusDay)}</td>
                    <td>${getBadge(statusEvening)}</td>
                `;
                catchTableBody.appendChild(tr);
            });
        }

        // ИСПРАВЛЕНИЕ: Реальная фаза луны по дате вместо статичного "Bütöv ay"
        function updateMoonPhase(date) {
            if (!moonVal) return;

            const synodicMonth = 29.530588853;
            const knownNewMoon = Date.UTC(2000, 0, 6, 18, 14, 0); // известное новолуние
            const daysSince = (date.getTime() - knownNewMoon) / 86400000;
            const age = ((daysSince % synodicMonth) + synodicMonth) % synodicMonth;

            const phases = [
                { max: 1.84566, name: "Yeni ay", icon: "🌑" },
                { max: 5.53699, name: "Artan aypara", icon: "🌒" },
                { max: 9.22831, name: "Birinci rüb", icon: "🌓" },
                { max: 12.91963, name: "Artan qabarıq ay", icon: "🌔" },
                { max: 16.61096, name: "Bütöv ay", icon: "🌕" },
                { max: 20.30228, name: "Azalan qabarıq ay", icon: "🌖" },
                { max: 23.99361, name: "Sonuncu rüb", icon: "🌗" },
                { max: 27.68493, name: "Azalan aypara", icon: "🌘" },
                { max: synodicMonth, name: "Yeni ay", icon: "🌑" }
            ];

            const phase = phases.find(p => age <= p.max) || phases[phases.length - 1];
            moonVal.textContent = phase.name;
            if (moonIcon) moonIcon.textContent = phase.icon;
        }

        function getBadge(status) {
            if (status === 'good') return '<span class="indicator good">🟢 Əla</span>';
            if (status === 'normal') return '<span class="indicator normal">🟡 Normal</span>';
            return '<span class="indicator bad">🔴 Pis</span>';
        }

        regionSelect.addEventListener('change', (e) => {
            loadWeatherData(e.target.value);
        });

        let dayOffset = 0;
        const baseDate = new Date();

        function updateDate() {
            const targetDate = new Date(baseDate);
            targetDate.setDate(baseDate.getDate() + dayOffset);

            let suffix = "Proqnoz";
            if (dayOffset === 0) suffix = "Bugün";
            if (dayOffset === 1) suffix = "Sabah";
            if (dayOffset === -1) suffix = "Dünən";

            const months = [
                "Yanvar", "Fevral", "Mart", "Aprel", "May", "İyun",
                "İyul", "Avqust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"
            ];

            const day = targetDate.getDate();
            const monthName = months[targetDate.getMonth()];
            const year = targetDate.getFullYear();

            currentDateDisplay.textContent = `${day} ${monthName} ${year} (${suffix})`;
            updateMoonPhase(targetDate);

            // ИСПРАВЛЕНИЕ: Блокируем кнопки, если дошли до предела (от -1 до +13 дней)
            prevDayBtn.style.opacity = (dayOffset <= -1) ? '0.3' : '1';
            prevDayBtn.style.cursor = (dayOffset <= -1) ? 'not-allowed' : 'pointer';
            
            nextDayBtn.style.opacity = (dayOffset >= 13) ? '0.3' : '1';
            nextDayBtn.style.cursor = (dayOffset >= 13) ? 'not-allowed' : 'pointer';

            loadWeatherData(regionSelect.value);
        }

        prevDayBtn.addEventListener('click', () => {
            if (dayOffset > -1) { // Не даем уйти дальше "вчера"
                dayOffset--;
                updateDate();
            }
        });

        nextDayBtn.addEventListener('click', () => {
            if (dayOffset < 13) { // Не даем уйти дальше 14 дней вперед
                dayOffset++;
                updateDate();
            }
        });

        updateDate();
    }
});