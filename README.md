[README_UZ (2).md](https://github.com/user-attachments/files/34234310/README_UZ.2.md)
# Mock Test Bot — yangilangan fayllar

## Almashtiriladigan fayllar
1. `server.py`
2. `formula-editor.js`
3. `desktop/mock-test-create/index.html`
4. `mini app/test/index.html`

`database.py`, `bot.py`, `config.py`, `requirements.txt` va Render sozlamalariga o‘zgartirish kiritilmadi.

## Nimalar o‘zgardi
- Test kodi kiritilgach 250 ms kutib, serverdan mavjudligi tekshiriladi.
- `/api/check-test-code` endpoint qo‘shildi.
- Testni saqlash vaqtida ham takroriy kod tekshiriladi.
- SQLite migratsiyasi `answer_format` ustunini eski bazaga xavfsiz qo‘shadi.
- Katta-kichik harf farqisiz yagona kod uchun unique expression index yaratiladi.
- Kodni tekshirish va INSERT `BEGIN IMMEDIATE` tranzaksiyasi bilan himoyalangan.
- Test yaratishda `answer_format=dtm_45` saqlanadi; qatnashuvchi API fan va javob formatini qaytaradi.
- 36–45-savollar ikki qismli javob bo‘lib qoladi.
- Matematika/fizika uchun umumiy 8 ustunli ko‘k formulalar klaviaturasi; kimyo/biologiya uchun harf-raqam, yuqori/pastki indeks va zaryad belgilarini kiritish klaviaturasi qo‘shildi.

## Joylashtirish
GitHub’dagi aynan shu yo‘llardagi fayllarni mos ravishda almashtiring. Yangi fayl qo‘shish shart emas.
Render’dagi mavjud Build Command, Start Command va Environment Variables qiymatlarini o‘zgartirmang. `server.py` avvalgi start usulida ishlashi kerak.

## Ma’lumotlar bazasi bo‘yicha ehtiyot chorasi
Deploydan oldin ishlayotgan SQLite bazangizning alohida nusxasini oling. `server.py` ishga tushganda `subject`/`answer_format` migratsiyasi va unique index avtomatik bajariladi; mavjud qatorlar o‘chirilmaydi.
Arxivdagi `mock_test.db` faylini Render’dagi bazangiz ustiga ko‘chirmang. `config.py` standart holatda `database/mock_test.db` yo‘lidan foydalanadi, arxivdagi DB esa loyiha ildizida joylashgan.

Render Free’da lokal fayl tizimi doimiy emas: servis uxlaganda, qayta ishga tushganda yoki deploy bo‘lganda SQLite’dagi yozuvlar yo‘qolishi mumkin. Free Web Service 15 daqiqa kiruvchi trafik bo‘lmasa uxlaydi va uyg‘onishi taxminan bir daqiqa oladi. Shu sababli deploydan avval va muntazam ravishda DB backup oling; doimiy saqlash uchun tashqi/managed ma’lumotlar bazasi kerak bo‘ladi.
