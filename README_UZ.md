# Mock Test Bot — yangilangan fayllar

## Fayllar

- `bot.py` — Telegram bot, boshqaruv paneli va majburiy obuna boshqaruvi.
- `database.py` — SQLite ma'lumotlar bazasi, ism-familiya tekshiruvi va majburiy kanallar jadvali.
- `server.py` — Flask API, test yaratish, javoblarni saqlash, baholash va PDF natijalar.
- `creator.html` — test yaratuvchi Mini App.
- `participant.html` — test ishlovchi Mini App.
- `formula-editor.js` — matematika, fizika, kimyo va biologiya uchun umumiy formula muharriri.
- `config.py` — konfiguratsiya.
- `requirements.txt` — Python kutubxonalari.
- `.env.example` — kerakli muhit o'zgaruvchilari namunasi.

## Muhim o'zgarishlar

1. Ism-familiya aynan ikki so'z bo'lishi va har bir so'zda kamida 3 ta harf bo'lishi tekshiriladi. O'zbekcha O‘/G‘ apostroflari qabul qilinadi.
2. Test yaratishda fan tanlanadi: Matematika, Fizika, Kimyo yoki Biologiya. Ushbu test turi 45 savolga sozlangan.
3. 36–45-savollarning `a)` va `b)` qismlari alohida baholanadi. Umumiy hisobda 35 ta oddiy javob + 20 ta alohida qism = 55 ta baholanadigan javob birligi.
4. PDF natijada to'g'ri javoblar soni va 55 ta javob birligi ko'rsatiladi. Telegram yakuniy xabarida ham shu hisob ishlatiladi.
5. Yaratuvchi va ishtirokchi Mini App'larda tanlangan fanga mos formula muharriri mavjud. Formula muharriri MathLive kutubxonasini CDN orqali yuklaydi; internet kerak.
6. Boshqaruv panelida majburiy obuna kanallarini qo'shish/o'chirish mumkin. Bot har bir kanalga admin bo'lishi kerak. Bot /start va server API so'rovlarida obunani tekshiradi.
7. Mavjud SQLite jadval ma'lumotlari o'chirilmaydi; `subject` va majburiy kanallar uchun jadvallar/migratsiyalar qo'shiladi.

## O'rnatish

1. Fayllarni bitta loyiha papkasiga joylashtiring.
2. `.env.example` faylidan `.env` nusxa yarating va `BOT_TOKEN`, `ADMIN_ID` qiymatlarini kiriting.
3. `pip install -r requirements.txt` bajaring.
4. Render server xizmatida `server.py` ishga tushiriladi. Render muhitida `BOT_TOKEN` va `ADMIN_ID` albatta sozlangan bo'lsin.
5. GitHub Pages'dagi test yaratish repo'siga `creator.html` faylini `index.html` nomi bilan va `formula-editor.js` faylini yoniga joylang.
6. GitHub Pages'dagi test ishlash repo'siga `participant.html` faylini `index.html` nomi bilan va `formula-editor.js` faylini yoniga joylang.
7. Telegram botni har bir majburiy kanalga administrator qilib qo'shing. So'ng botda **Boshqarish → Majburiy obuna → Kanal qo'shish** bo'limidan kanal username yoki ID sini kiriting.

## Eslatma

- `DATABASE_PATH` qiymati mavjud bazangiz joylashgan manzilga mos bo'lishi kerak. Mavjud `mock_test.db` faylini o'chirmang yoki yangisi bilan almashtirmang.
- `creator.html` va `participant.html` ichidagi API manzili hozir `https://mock-test-bot-fkw8.onrender.com` qilib qo'yilgan. Agar Render domeningiz boshqa bo'lsa, ikkala HTML fayldagi `API_BASE` qiymatini o'zgartiring.
- Test 45 savol sifatida yaratiladi. 36–45-savollarning ikkita javob qismi alohida hisoblanadi.
- Formula muharriridagi tugmalar formulani LaTeX ko'rinishida javob maydoniga kiritadi; yaratuvchi va ishtirokchi bir xil muharrirdan foydalanadi.
