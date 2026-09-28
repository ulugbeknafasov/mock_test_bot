from datetime import datetime, timedelta, timezone

from telegram.request import HTTPXRequest

from telegram import (
    Update,
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    WebAppInfo,
)

from telegram.ext import (
    ApplicationBuilder,
    CommandHandler,
    ContextTypes,
    CallbackQueryHandler,
    MessageHandler,
    filters,
)

from config import BOT_TOKEN, ADMIN_ID

from database import (
    init_database,
    save_user,
    get_user,
    get_full_name,
    set_full_name,

    get_pending_payments,
    get_payment,
    approve_payment,
    reject_payment,
    set_pro_user,

    get_pro_plans,
    get_pro_plan,
    set_pro_plan_price,

    get_user_pending_payment,
    save_payment_proof,

    get_payment_card,
    set_payment_card,
    delete_payment_card,
    get_connection,
    is_admin,
    get_admins,
    add_admin,
    remove_admin,
    confirm_full_name,
    is_name_confirmed,
)


# =========================================================
# TEST HOLATI — YANGILASH
# =========================================================

async def refresh_test_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    if not query:
        return

    await query.answer("Yangilanmoqda...")

    try:
        test_id = int((query.data or "").split(":", 1)[1])
    except (ValueError, IndexError):
        await query.answer("Test ID noto‘g‘ri.", show_alert=True)
        return

    connection = get_connection()
    try:
        cursor = connection.cursor()

        cursor.execute("SELECT * FROM mock_tests WHERE id = ?", (test_id,))
        test = cursor.fetchone()

        if not test:
            await query.answer("Test topilmadi.", show_alert=True)
            return

        if int(test["creator_id"]) != int(query.from_user.id):
            await query.answer("Bu test sizga tegishli emas.", show_alert=True)
            return

        cursor.execute(
            "SELECT COUNT(*) AS total FROM mock_test_participants WHERE test_id = ?",
            (test_id,)
        )
        row = cursor.fetchone()
        participants = int(row["total"] or 0)

        ends_at = str(test["ends_at"])
        try:
            end = datetime.fromisoformat(ends_at.replace("Z", "+00:00"))
            if end.tzinfo is None:
                end = end.replace(tzinfo=timezone.utc)
            remaining_seconds = max(0, int((end - datetime.now(timezone.utc)).total_seconds()))
        except Exception:
            remaining_seconds = 0

        days, rem = divmod(remaining_seconds, 86400)
        hours, rem = divmod(rem, 3600)
        minutes, seconds = divmod(rem, 60)

        if days:
            remaining = f"{days} kun {hours} soat"
        elif hours:
            remaining = f"{hours} soat {minutes} daqiqa"
        else:
            remaining = f"{minutes} daqiqa {seconds} soniya"

        finished = remaining_seconds <= 0

        if finished:
            status = "🏁 Test tugagan"
            keyboard = InlineKeyboardMarkup([
                [InlineKeyboardButton("⬅️ Admin panel", callback_data="admin_panel")]
            ])
        else:
            status = f"⏳ Tugashiga: {remaining}"
            keyboard = InlineKeyboardMarkup([
                [InlineKeyboardButton("🔄 Yangilash", callback_data=f"refresh_test:{test_id}")]
            ])

        text = (
            "🎉 <b>Test muvaffaqiyatli yaratildi!</b>\n\n"
            f"📝 Test kodi: <b>{test['code']}</b>\n"
            f"📢 Kanal: <b>{test['channel']}</b>\n"
            f"❓ Savollar: <b>{test['question_count']} ta</b>\n"
            f"⏱ Davomiyligi: <b>{test['duration_minutes']} daqiqa</b>\n\n"
            f"👥 Javob berganlar: <b>{participants} ta</b>\n"
            f"{status}\n\n"
            "Test ishtirokchilar uchun tayyor. ✅"
        )

        await query.edit_message_text(
            text,
            parse_mode="HTML",
            reply_markup=keyboard
        )
    finally:
        connection.close()


# =========================================================
# ASOSIY MENYU
# =========================================================

def get_main_keyboard(user_id):

    buttons = [
        [
            InlineKeyboardButton(
                "🧪 Test boshlash",
                web_app=WebAppInfo(
                    url="https://ulugbeknafasov.github.io/mock-test-miniapp/"
                )
            )
        ],
        [
            InlineKeyboardButton(
                "➕ Test yaratish",
                web_app=WebAppInfo(
                    url="https://ulugbeknafasov.github.io/mock-test-create/"
                )
            )
        ]
    ]

    if is_admin(user_id):
        buttons.append([
            InlineKeyboardButton(
                "⚙️ Boshqarish",
                callback_data="admin_panel"
            )
        ])

    return InlineKeyboardMarkup(buttons)


# =========================================================
# START / ISM-FAMILIYA
# =========================================================

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user
    telegram_id = user.id

    # Yangi foydalanuvchi uchun Telegram ma'lumotlarini saqlaymiz,
    # lekin asosiy ism sifatida full_name ishlatiladi.
    existing_name = get_full_name(telegram_id)
    confirmed = is_name_confirmed(telegram_id)

    if existing_name and confirmed:
        # Mavjud foydalanuvchini Telegram ma'lumotlari bilan yangilaymiz,
        # ammo full_name ni o'zgartirmaymiz.
        save_user(
            telegram_id=telegram_id,
            username=user.username,
            first_name=user.first_name or "",
            last_name=user.last_name or "",
            full_name=existing_name,
        )

        await update.message.reply_text(
            f"👋 Assalomu alaykum, <b>{existing_name}</b>!\n\n"
            "📋 Test ishlash yoki test yaratish uchun "
            "quyidagi tugmalardan foydalaning:",
            parse_mode="HTML",
            reply_markup=get_main_keyboard(telegram_id)
        )
        return

    # Birinchi kirishda ism-familiya so'raladi.
    context.user_data["waiting_for"] = "full_name"

    await update.message.reply_text(
        "👋 Assalomu alaykum!\n\n"
        "📝 Botdan foydalanish uchun ism va familiyangizni "
        "bir xabarda yuboring.\n\n"
        "Masalan:\n"
        "<code>Ulug‘bek Nafasov</code>",
        parse_mode="HTML"
    )


async def full_name_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Birinchi kirishda yoki keyinchalik ism-familiya kiritilganda saqlaydi."""
    if not update.message or not update.message.text:
        return

    if context.user_data.get("waiting_for") != "full_name":
        return

    user = update.effective_user
    telegram_id = user.id
    full_name = update.message.text.strip()

    if len(full_name) < 2 or len(full_name) > 100:
        await update.message.reply_text(
            "❌ Ism-familiya noto‘g‘ri.\n\n"
            "Iltimos, ism va familiyangizni qaytadan kiriting."
        )
        return

    # Juda bo'sh/raqamlardan iborat ismni qabul qilmaymiz.
    if not any(ch.isalpha() for ch in full_name):
        await update.message.reply_text(
            "❌ Ism-familiya faqat to‘g‘ri matn ko‘rinishida bo‘lishi kerak."
        )
        return

    save_user(
        telegram_id=telegram_id,
        username=user.username,
        first_name=user.first_name or "",
        last_name=user.last_name or "",
        full_name=full_name,
    )
    confirm_full_name(telegram_id, full_name)

    context.user_data.pop("waiting_for", None)

    await update.message.reply_text(
        f"✅ Ism-familiyangiz saqlandi: <b>{full_name}</b>\n\n"
        "🎉 Endi botdan foydalanishingiz mumkin.",
        parse_mode="HTML",
        reply_markup=get_main_keyboard(telegram_id)
    )


# =========================================================
# ADMIN PANEL
# =========================================================


async def admin_panel(
    update: Update,
    context: ContextTypes.DEFAULT_TYPE
):

    query = update.callback_query

    if not is_admin(query.from_user.id):
        await query.answer(
            "❌ Sizda ruxsat yo'q!",
            show_alert=True
        )
        return

    await query.answer()

    buttons = [
        [
            InlineKeyboardButton(
                "📊 Statistika",
                callback_data="admin_statistics"
            )
        ],
        [
            InlineKeyboardButton(
                "👥 Foydalanuvchilar",
                callback_data="admin_users"
            )
        ],
        [
            InlineKeyboardButton(
                "📝 Testlar",
                callback_data="admin_tests"
            )
        ],
        [
            InlineKeyboardButton(
                "💳 To'lovlar",
                callback_data="admin_payments"
            )
        ],
        [
            InlineKeyboardButton(
                "⭐️ PRO",
                callback_data="admin_pro"
            )
        ],
        [
            InlineKeyboardButton(
                "💳 Karta sozlamalari",
                callback_data="payment_card_settings"
            )
        ],
        [
            InlineKeyboardButton(
                "📢 Reklama",
                callback_data="admin_broadcast"
            )
        ],
        [
            InlineKeyboardButton(
                "👨‍💼 Adminlar",
                callback_data="admin_admins"
            )
        ],
    ]

    await query.message.reply_text(
        "⚙️ <b>Boshqaruv paneli</b>\n\n"
        "Kerakli bo'limni tanlang:",
        parse_mode="HTML",
        reply_markup=InlineKeyboardMarkup(buttons)
    )


# =========================================================
# ADMIN STATISTIKA
# =========================================================

async def admin_statistics(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    if not is_admin(query.from_user.id):
        await query.answer("❌ Ruxsat yo‘q!", show_alert=True)
        return
    await query.answer()
    con = get_connection(); cur = con.cursor()
    cur.execute("SELECT COUNT(*) AS n FROM users"); users = cur.fetchone()["n"]
    cur.execute("SELECT COUNT(*) AS n FROM mock_tests"); tests = cur.fetchone()["n"]
    cur.execute("SELECT COUNT(*) AS n FROM mock_test_participants"); submissions = cur.fetchone()["n"]
    cur.execute("SELECT COUNT(*) AS n FROM pro_users WHERE pro_until IS NOT NULL AND pro_until > CURRENT_TIMESTAMP"); pro = cur.fetchone()["n"]
    cur.execute("SELECT COUNT(*) AS n FROM pro_payments WHERE status IN ('pending','proof_received')"); pending = cur.fetchone()["n"]
    con.close()
    await query.message.reply_text(
        "📊 <b>STATISTIKA</b>\n\n"
        f"👥 Foydalanuvchilar: <b>{users}</b> ta\n"
        f"⭐ Faol PRO: <b>{pro}</b> ta\n"
        f"📝 Yaratilgan testlar: <b>{tests}</b> ta\n"
        f"📨 Topshirilgan testlar: <b>{submissions}</b> ta\n"
        f"💳 Kutilayotgan to‘lovlar: <b>{pending}</b> ta",
        parse_mode="HTML",
        reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("⬅️ Orqaga", callback_data="admin_panel")]])
    )


# =========================================================
# ADMIN FOYDALANUVCHILAR
# =========================================================

async def admin_users(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    if not is_admin(query.from_user.id):
        await query.answer("❌ Ruxsat yo‘q!", show_alert=True); return
    await query.answer()
    con=get_connection(); cur=con.cursor()
    cur.execute("SELECT telegram_id, full_name, username, created_at FROM users ORDER BY id DESC LIMIT 25")
    rows=cur.fetchall(); con.close()
    if not rows:
        text="👥 <b>FOYDALANUVCHILAR</b>\n\nHozircha foydalanuvchilar yo‘q."
    else:
        parts=["👥 <b>FOYDALANUVCHILAR</b>", ""]
        for i,r in enumerate(rows,1):
            name=(r["full_name"] or "Ism kiritilmagan").strip()
            uname=f"@{r['username']}" if r["username"] else "username yo‘q"
            parts.append(f"{i}. <b>{name}</b>\n   🆔 <code>{r['telegram_id']}</code> • {uname}")
        text="\n".join(parts)
    await query.message.reply_text(text, parse_mode="HTML", reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("⬅️ Orqaga", callback_data="admin_panel")]]))


# =========================================================
# ADMIN TESTLAR
# =========================================================

async def admin_tests(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    if not is_admin(query.from_user.id):
        await query.answer("❌ Ruxsat yo'q!", show_alert=True)
        return
    await query.answer()

    connection = get_connection()
    cursor = connection.cursor()
    cursor.execute("""
        SELECT t.id, t.code, t.channel, t.duration_minutes,
               t.question_count, t.created_at, t.ends_at, t.status,
               COUNT(p.id) AS participants
        FROM mock_tests t
        LEFT JOIN mock_test_participants p ON p.test_id = t.id
        GROUP BY t.id
        ORDER BY t.id DESC
        LIMIT 20
    """)
    tests = cursor.fetchall()
    connection.close()

    if not tests:
        await query.message.reply_text(
            "📝 <b>Testlarni boshqarish</b>\n\n❌ Hozircha testlar yo'q.",
            parse_mode="HTML",
            reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("⬅️ Orqaga", callback_data="admin_panel")]])
        )
        return

    text = "📝 <b>Testlarni boshqarish</b>\n\n"
    buttons = []
    now = datetime.now(timezone.utc)

    for test in tests:
        try:
            end = datetime.fromisoformat(str(test["ends_at"]).replace("Z", "+00:00"))
            if end.tzinfo is None:
                end = end.replace(tzinfo=timezone.utc)
            active = end > now
        except Exception:
            active = test["status"] == "active"

        status = "🟢 Faol" if active else "🔴 Tugagan"
        text += (
            f"🔑 <b>{test['code']}</b> — {status}\n"
            f"📢 {test['channel']} | ❓ {test['question_count']} ta | 👥 {test['participants']} ta\n\n"
        )
        buttons.append([
            InlineKeyboardButton(
                f"🗑 {test['code']} ni o'chirish",
                callback_data=f"admin_test_delete:{test['id']}"
            )
        ])

    buttons.append([
        InlineKeyboardButton("🔄 Yangilash", callback_data="admin_tests"),
        InlineKeyboardButton("⬅️ Orqaga", callback_data="admin_panel")
    ])

    await query.message.reply_text(
        text,
        parse_mode="HTML",
        reply_markup=InlineKeyboardMarkup(buttons)
    )


async def admin_test_delete(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    if not is_admin(query.from_user.id):
        await query.answer("❌ Ruxsat yo'q!", show_alert=True)
        return
    await query.answer()

    try:
        test_id = int(query.data.split(":", 1)[1])
    except (IndexError, ValueError):
        await query.message.reply_text("❌ Test ID noto'g'ri.")
        return

    connection = get_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT id, code, channel, question_count FROM mock_tests WHERE id = ?", (test_id,))
    test = cursor.fetchone()
    connection.close()

    if not test:
        await query.message.reply_text("❌ Test topilmadi.")
        return

    await query.message.reply_text(
        "⚠️ <b>Testni o'chirish</b>\n\n"
        f"🔑 Test kodi: <b>{test['code']}</b>\n"
        f"📢 Kanal: {test['channel']}\n"
        f"❓ Savollar: {test['question_count']} ta\n\n"
        "❗ Test va unga tegishli ishtirokchilar natijalari ham o'chiriladi.\n\n"
        "Rostdan ham o'chirasizmi?",
        parse_mode="HTML",
        reply_markup=InlineKeyboardMarkup([[
            InlineKeyboardButton("✅ Ha, o'chirish", callback_data=f"admin_test_delete_confirm:{test_id}"),
            InlineKeyboardButton("❌ Bekor qilish", callback_data="admin_tests")
        ]])
    )


async def admin_test_delete_confirm(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    if not is_admin(query.from_user.id):
        await query.answer("❌ Ruxsat yo'q!", show_alert=True)
        return
    await query.answer()

    try:
        test_id = int(query.data.split(":", 1)[1])
    except (IndexError, ValueError):
        await query.message.reply_text("❌ Test ID noto'g'ri.")
        return

    connection = get_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT code FROM mock_tests WHERE id = ?", (test_id,))
    test = cursor.fetchone()
    if not test:
        connection.close()
        await query.message.reply_text("❌ Test topilmadi yoki allaqachon o'chirilgan.")
        return

    code = test["code"]
    cursor.execute("DELETE FROM mock_test_participants WHERE test_id = ?", (test_id,))
    cursor.execute("DELETE FROM mock_tests WHERE id = ?", (test_id,))
    connection.commit()
    connection.close()

    await query.message.reply_text(
        "🗑 <b>Test o'chirildi!</b>\n\n"
        f"🔑 Test kodi: <b>{code}</b>\n"
        "👥 Ishtirokchilar javoblari va natijalari ham o'chirildi.",
        parse_mode="HTML",
        reply_markup=InlineKeyboardMarkup([[
            InlineKeyboardButton("📝 Testlar", callback_data="admin_tests"),
            InlineKeyboardButton("⬅️ Orqaga", callback_data="admin_panel")
        ]])
    )

# =========================================================
# ADMINLAR
# =========================================================

async def admin_admins(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query=update.callback_query
    if not is_admin(query.from_user.id):
        await query.answer("❌ Ruxsat yo‘q!", show_alert=True); return
    await query.answer()
    rows=get_admins()
    parts=["👨‍💼 <b>ADMINLAR</b>",""]
    buttons=[]
    for r in rows:
        role=r["role"] or "admin"
        parts.append(f"🆔 <code>{r['telegram_id']}</code> — <b>{role}</b>")
        if int(r["telegram_id"]) != int(ADMIN_ID):
            buttons.append([InlineKeyboardButton(f"🗑 O‘chirish {r['telegram_id']}", callback_data=f"admin_remove:{r['telegram_id']}")])
    buttons.append([InlineKeyboardButton("➕ Admin qo‘shish", callback_data="admin_add")])
    buttons.append([InlineKeyboardButton("⬅️ Orqaga", callback_data="admin_panel")])
    await query.message.reply_text("\n".join(parts), parse_mode="HTML", reply_markup=InlineKeyboardMarkup(buttons))


async def admin_add_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query=update.callback_query
    if query.from_user.id != ADMIN_ID:
        await query.answer("Faqat asosiy admin qo‘sha oladi.", show_alert=True); return
    await query.answer()
    context.user_data["waiting_for"]="admin_id"
    await query.message.reply_text("➕ Yangi adminning Telegram ID raqamini yuboring:")


async def admin_remove_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query=update.callback_query
    if query.from_user.id != ADMIN_ID:
        await query.answer("Faqat asosiy admin o‘chira oladi.", show_alert=True); return
    try: target=int(query.data.split(":",1)[1])
    except: await query.answer("ID noto‘g‘ri",show_alert=True); return
    ok=remove_admin(target)
    await query.answer("✅ O‘chirildi" if ok else "❌ O‘chirib bo‘lmadi", show_alert=True)
    await admin_admins(update, context)


# =========================================================
# REKLAMA
# =========================================================

async def admin_broadcast(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query=update.callback_query
    if not is_admin(query.from_user.id):
        await query.answer("❌ Ruxsat yo‘q!", show_alert=True); return
    await query.answer()
    context.user_data["waiting_for"]="broadcast"
    await query.message.reply_text("📢 Reklama matnini yuboring. U barcha ro‘yxatdan o‘tgan foydalanuvchilarga yuboriladi.\n\n❌ Bekor qilish: /start")


# =========================================================
# PRO BOSHQARUVI
# =========================================================

async def admin_pro(
    update: Update,
    context: ContextTypes.DEFAULT_TYPE
):

    query = update.callback_query

    if not is_admin(query.from_user.id):
        await query.answer(
            "❌ Ruxsat yo'q!",
            show_alert=True
        )
        return

    await query.answer()

    plans = get_pro_plans(active_only=False)

    text = "⭐️ <b>PRO boshqaruvi</b>\n\n"

    buttons = []

    for plan in plans:

        duration = plan["duration_days"]
        price = plan["price"]
        active = plan["active"]

        status = "🟢" if active else "🔴"

        text += (
            f"{status} ⭐ <b>{duration} kun</b> — "
            f"<b>{price:,} so'm</b>\n"
        )

        buttons.append([
            InlineKeyboardButton(
                f"💰 {duration} kun narxi",
                callback_data=f"pro_price:{plan['id']}"
            )
        ])

    text += (
        "\n💡 Har bir tarifning narxini "
        "alohida o'zgartirishingiz mumkin."
    )

    buttons.append([
        InlineKeyboardButton(
            "🔄 Yangilash",
            callback_data="admin_pro"
        )
    ])

    buttons.append([
        InlineKeyboardButton(
            "⬅️ Orqaga",
            callback_data="admin_panel"
        )
    ])

    await query.message.reply_text(
        text,
        parse_mode="HTML",
        reply_markup=InlineKeyboardMarkup(buttons)
    )


# =========================================================
# PRO NARXINI O'ZGARTIRISH
# =========================================================

async def pro_price(
    update: Update,
    context: ContextTypes.DEFAULT_TYPE
):

    query = update.callback_query

    if not is_admin(query.from_user.id):
        await query.answer(
            "❌ Ruxsat yo'q!",
            show_alert=True
        )
        return

    await query.answer()

    try:
        plan_id = int(
            query.data.split(":")[1]
        )
    except (IndexError, ValueError):

        await query.message.reply_text(
            "❌ Tarif ID noto'g'ri."
        )

        return

    plan = get_pro_plan(plan_id)

    if not plan:

        await query.message.reply_text(
            "❌ Tarif topilmadi."
        )

        return

    context.user_data["waiting_for"] = "pro_plan_price"
    context.user_data["pro_plan_id"] = plan_id

    await query.message.reply_text(
        "💰 <b>PRO tarif narxi</b>\n\n"
        f"⭐ Tarif: <b>{plan['duration_days']} kun</b>\n"
        f"💵 Hozirgi narx: "
        f"<b>{plan['price']:,} so'm</b>\n\n"
        "Yangi narxni kiriting.\n\n"
        "Masalan:\n"
        "<code>10000</code>",
        parse_mode="HTML"
    )


# =========================================================
# KARTA SOZLAMALARI
# =========================================================

async def payment_card_settings(
    update: Update,
    context: ContextTypes.DEFAULT_TYPE
):

    query = update.callback_query

    if not is_admin(query.from_user.id):
        await query.answer(
            "❌ Ruxsat yo'q!",
            show_alert=True
        )
        return

    await query.answer()

    card = get_payment_card()

    if card and card["card_number"]:

        card_number = card["card_number"]
        card_holder = card["card_holder"] or "—"
        bank_name = card["bank_name"] or "—"

        text = (
            "💳 <b>Karta sozlamalari</b>\n\n"
            f"💳 Karta: <code>{card_number}</code>\n"
            f"👤 Karta egasi: <b>{card_holder}</b>\n"
            f"🏦 Bank: <b>{bank_name}</b>\n\n"
            "Quyidagi tugmalar orqali boshqarishingiz mumkin."
        )

    else:

        text = (
            "💳 <b>Karta sozlamalari</b>\n\n"
            "❌ Hozircha karta ma'lumotlari kiritilmagan.\n\n"
            "Foydalanuvchilar PRO sotib olayotganda "
            "ushbu karta ma'lumotlarini ko'radi."
        )

    buttons = [
        [
            InlineKeyboardButton(
                "➕ / ✏️ Karta qo'shish",
                callback_data="payment_card_edit"
            )
        ],
        [
            InlineKeyboardButton(
                "🗑 Karta ma'lumotlarini o'chirish",
                callback_data="payment_card_delete"
            )
        ],
        [
            InlineKeyboardButton(
                "⬅️ Orqaga",
                callback_data="admin_panel"
            )
        ]
    ]

    await query.message.reply_text(
        text,
        parse_mode="HTML",
        reply_markup=InlineKeyboardMarkup(buttons)
    )


# =========================================================
# KARTA KIRITISH
# =========================================================

async def payment_card_edit(
    update: Update,
    context: ContextTypes.DEFAULT_TYPE
):

    query = update.callback_query

    if not is_admin(query.from_user.id):
        await query.answer(
            "❌ Ruxsat yo'q!",
            show_alert=True
        )
        return

    await query.answer()

    context.user_data["waiting_for"] = "card_number"

    await query.message.reply_text(
        "💳 <b>Karta raqami</b>\n\n"
        "Karta raqamini yuboring.\n\n"
        "Masalan:\n"
        "<code>8600 1234 5678 9012</code>",
        parse_mode="HTML"
    )


# =========================================================
# KARTA O'CHIRISH
# =========================================================

async def payment_card_delete(
    update: Update,
    context: ContextTypes.DEFAULT_TYPE
):

    query = update.callback_query

    if not is_admin(query.from_user.id):
        await query.answer(
            "❌ Ruxsat yo'q!",
            show_alert=True
        )
        return

    await query.answer()

    delete_payment_card()

    await query.message.reply_text(
        "✅ <b>Karta ma'lumotlari o'chirildi.</b>",
        parse_mode="HTML"
    )


# =========================================================
# ADMIN TEXT HANDLER
# =========================================================

async def admin_text_handler(
    update: Update,
    context: ContextTypes.DEFAULT_TYPE
):

    waiting_for = context.user_data.get("waiting_for")
    text = update.message.text.strip()

    # Ism-familiya barcha foydalanuvchilar uchun ishlaydi.
    if waiting_for == "full_name":
        user = update.effective_user
        if len(text) < 2 or len(text) > 100 or not any(ch.isalpha() for ch in text):
            await update.message.reply_text("❌ Ism-familiya noto‘g‘ri. Qaytadan kiriting.")
            return
        save_user(
            telegram_id=user.id,
            username=user.username,
            first_name=user.first_name or "",
            last_name=user.last_name or "",
            full_name=text,
        )
        confirm_full_name(user.id, text)
        context.user_data.pop("waiting_for", None)
        await update.message.reply_text(
            f"✅ Ism-familiyangiz saqlandi: <b>{text}</b>\n\n🎉 Endi botdan foydalanishingiz mumkin.",
            parse_mode="HTML",
            reply_markup=get_main_keyboard(user.id)
        )
        return

    if not is_admin(update.effective_user.id):
        return

    # -----------------------------------------------------
    # ADMIN QO‘SHISH
    # -----------------------------------------------------
    if waiting_for == "admin_id":
        if not text.isdigit():
            await update.message.reply_text("❌ Telegram ID faqat raqam bo‘lishi kerak.")
            return
        target=int(text)
        if add_admin(target):
            context.user_data.pop("waiting_for", None)
            await update.message.reply_text(f"✅ <code>{target}</code> admin qilindi.", parse_mode="HTML")
        else:
            context.user_data.pop("waiting_for", None)
            await update.message.reply_text("⚠️ Bu foydalanuvchi allaqachon admin.")
        return

    # -----------------------------------------------------
    # REKLAMA
    # -----------------------------------------------------
    if waiting_for == "broadcast":
        context.user_data.pop("waiting_for", None)
        con=get_connection(); cur=con.cursor()
        cur.execute("SELECT telegram_id FROM users")
        ids=[int(r["telegram_id"]) for r in cur.fetchall()]
        con.close()
        sent=0; failed=0
        for uid in ids:
            try:
                await context.bot.send_message(chat_id=uid, text=text)
                sent += 1
            except Exception:
                failed += 1
        await update.message.reply_text(f"📢 Reklama yakunlandi.\n\n✅ Yuborildi: {sent}\n❌ Yuborilmadi: {failed}")
        return

    # -----------------------------------------------------
    # PRO NARXI
    # -----------------------------------------------------

    if waiting_for == "pro_plan_price":

        if not text.isdigit():

            await update.message.reply_text(
                "❌ Faqat raqam kiriting."
            )

            return

        price = int(text)

        if price <= 0:

            await update.message.reply_text(
                "❌ Narx 0 dan katta bo'lishi kerak."
            )

            return

        if price > 100000000:

            await update.message.reply_text(
                "❌ Narx juda katta."
            )

            return

        plan_id = context.user_data.get(
            "pro_plan_id"
        )

        if not plan_id:

            await update.message.reply_text(
                "❌ Tarif aniqlanmadi."
            )

            context.user_data.clear()

            return

        plan = get_pro_plan(plan_id)

        if not plan:

            await update.message.reply_text(
                "❌ Tarif topilmadi."
            )

            context.user_data.clear()

            return

        success = set_pro_plan_price(
            plan_id,
            price
        )

        context.user_data.pop(
            "waiting_for",
            None
        )

        context.user_data.pop(
            "pro_plan_id",
            None
        )

        if not success:

            await update.message.reply_text(
                "❌ Narxni o'zgartirib bo'lmadi."
            )

            return

        await update.message.reply_text(
            "✅ <b>Tarif narxi o'zgartirildi!</b>\n\n"
            f"⭐ Tarif: <b>{plan['duration_days']} kun</b>\n"
            f"💰 Yangi narx: <b>{price:,} so'm</b>",
            parse_mode="HTML"
        )

        return

    # -----------------------------------------------------
    # KARTA RAQAMI
    # -----------------------------------------------------

    if waiting_for == "card_number":

        context.user_data["card_number"] = text

        context.user_data["waiting_for"] = "card_holder"

        await update.message.reply_text(
            "👤 <b>Karta egasi</b>\n\n"
            "Karta egasining ism-familiyasini yuboring.\n\n"
            "Masalan:\n"
            "<code>ULUGBEK NAFASOV</code>",
            parse_mode="HTML"
        )

        return

    # -----------------------------------------------------
    # KARTA EGASI
    # -----------------------------------------------------

    if waiting_for == "card_holder":

        context.user_data["card_holder"] = text

        context.user_data["waiting_for"] = "bank_name"

        await update.message.reply_text(
            "🏦 <b>Bank nomi</b>\n\n"
            "Bank nomini yuboring.\n\n"
            "Masalan:\n"
            "<code>UZCARD</code>",
            parse_mode="HTML"
        )

        return

    # -----------------------------------------------------
    # BANK NOMI
    # -----------------------------------------------------

    if waiting_for == "bank_name":

        card_number = context.user_data.get(
            "card_number"
        )

        card_holder = context.user_data.get(
            "card_holder"
        )

        bank_name = text

        if not card_number or not card_holder:

            await update.message.reply_text(
                "❌ Karta ma'lumotlari to'liq emas."
            )

            context.user_data.clear()

            return

        set_payment_card(
            card_number=card_number,
            card_holder=card_holder,
            bank_name=bank_name
        )

        context.user_data.clear()

        await update.message.reply_text(
            "✅ <b>Karta muvaffaqiyatli saqlandi!</b>\n\n"
            f"💳 Karta: <code>{card_number}</code>\n"
            f"👤 Egasi: <b>{card_holder}</b>\n"
            f"🏦 Bank: <b>{bank_name}</b>",
            parse_mode="HTML"
        )

        return


# =========================================================
# TO'LOVLAR
# =========================================================

async def admin_payments(
    update: Update,
    context: ContextTypes.DEFAULT_TYPE
):

    query = update.callback_query

    if not is_admin(query.from_user.id):

        await query.answer(
            "❌ Sizda ruxsat yo'q!",
            show_alert=True
        )

        return

    await query.answer()

    payments = get_pending_payments()

    proof_payments = [
        p for p in payments
        if p["status"] == "proof_received"
        and p["proof_file_id"]
    ]

    if not proof_payments:

        await query.message.reply_text(
            "💳 <b>To'lovlar</b>\n\n"
            "⏳ Hozircha tekshiriladigan "
            "to'lov cheki yo'q.",
            parse_mode="HTML"
        )

        return

    for payment in proof_payments:

        payment_id = payment["id"]
        telegram_id = payment["telegram_id"]
        amount = payment["amount"]
        duration_days = payment["duration_days"]

        buttons = [[
            InlineKeyboardButton(
                "✅ Tasdiqlash",
                callback_data=f"approve_payment:{payment_id}"
            ),
            InlineKeyboardButton(
                "❌ Rad etish",
                callback_data=f"reject_payment:{payment_id}"
            )
        ]]

        text = (
            "💳 <b>PRO to'lov cheki</b>\n\n"
            f"🆔 To'lov ID: <code>{payment_id}</code>\n"
            f"👤 Telegram ID: <code>{telegram_id}</code>\n"
            f"💰 Summa: <b>{amount:,} so'm</b>\n"
            f"⭐️ Tarif: <b>{duration_days} kun</b>\n\n"
            "📷 Chek yuborilgan.\n"
            "Quyidagi tugmalardan birini tanlang."
        )

        if payment["proof_type"] == "photo":

            await context.bot.send_photo(
                chat_id=ADMIN_ID,
                photo=payment["proof_file_id"],
                caption=text,
                parse_mode="HTML",
                reply_markup=InlineKeyboardMarkup(buttons)
            )

        else:

            await context.bot.send_document(
                chat_id=ADMIN_ID,
                document=payment["proof_file_id"],
                caption=text,
                parse_mode="HTML",
                reply_markup=InlineKeyboardMarkup(buttons)
            )


# =========================================================
# FOYDALANUVCHI CHEK YUBORADI
# =========================================================

async def payment_proof_handler(
    update: Update,
    context: ContextTypes.DEFAULT_TYPE
):

    user = update.effective_user

    if user.id == ADMIN_ID:
        return

    payment = get_user_pending_payment(
        user.id
    )

    if not payment:
        return

    if payment["status"] != "pending":
        return

    proof_file_id = None
    proof_type = None
    proof_caption = None

    if update.message.photo:

        proof_file_id = update.message.photo[-1].file_id
        proof_type = "photo"
        proof_caption = update.message.caption or ""

    elif update.message.document:

        proof_file_id = update.message.document.file_id
        proof_type = "document"
        proof_caption = update.message.caption or ""

    else:

        await update.message.reply_text(
            "📷 Iltimos, to'lov chekini "
            "rasm yoki fayl ko'rinishida yuboring."
        )

        return

    success = save_payment_proof(
        payment_id=payment["id"],
        proof_file_id=proof_file_id,
        proof_type=proof_type,
        proof_caption=proof_caption
    )

    if not success:

        await update.message.reply_text(
            "❌ Chekni qabul qilib bo'lmadi. "
            "Iltimos, qayta urinib ko'ring."
        )

        return

    await update.message.reply_text(
        "✅ <b>To'lov cheki qabul qilindi!</b>\n\n"
        f"🆔 To'lov ID: <code>{payment['id']}</code>\n\n"
        "⏳ Admin tekshiruvini kuting.\n"
        "Tasdiqlangandan keyin PRO avtomatik faollashadi.",
        parse_mode="HTML"
    )

    buttons = [[
        InlineKeyboardButton(
            "✅ Tasdiqlash",
            callback_data=f"approve_payment:{payment['id']}"
        ),
        InlineKeyboardButton(
            "❌ Rad etish",
            callback_data=f"reject_payment:{payment['id']}"
        )
    ]]

    admin_text = (
        "💳 <b>Yangi PRO to'lov cheki!</b>\n\n"
        f"🆔 To'lov ID: <code>{payment['id']}</code>\n"
        f"👤 Telegram ID: <code>{payment['telegram_id']}</code>\n"
        f"💰 Summa: <b>{payment['amount']:,} so'm</b>\n"
        f"⭐️ Tarif: <b>{payment['duration_days']} kun</b>\n\n"
        "📷 Chekni tekshiring."
    )

    if proof_type == "photo":

        await context.bot.send_photo(
            chat_id=ADMIN_ID,
            photo=proof_file_id,
            caption=admin_text,
            parse_mode="HTML",
            reply_markup=InlineKeyboardMarkup(buttons)
        )

    else:

        await context.bot.send_document(
            chat_id=ADMIN_ID,
            document=proof_file_id,
            caption=admin_text,
            parse_mode="HTML",
            reply_markup=InlineKeyboardMarkup(buttons)
        )


# =========================================================
# TO'LOVNI TASDIQLASH
# =========================================================

async def approve_payment_callback(
    update: Update,
    context: ContextTypes.DEFAULT_TYPE
):

    query = update.callback_query

    if not is_admin(query.from_user.id):

        await query.answer(
            "❌ Ruxsat yo'q!",
            show_alert=True
        )

        return

    await query.answer()

    try:

        payment_id = int(
            query.data.split(":")[1]
        )

    except (IndexError, ValueError):

        await query.message.reply_text(
            "❌ To'lov ID noto'g'ri."
        )

        return

    payment = get_payment(
        payment_id
    )

    if not payment:

        await query.message.reply_text(
            "❌ To'lov topilmadi."
        )

        return

    if (
        payment["status"] != "proof_received"
        or not payment["proof_file_id"]
    ):

        await query.answer(
            "❌ Avval to'lov chekini oling!",
            show_alert=True
        )

        return

    success = approve_payment(
        payment_id,
        ADMIN_ID
    )

    if not success:

        await query.answer(
            "⚠️ Bu to'lov allaqachon ko'rib chiqilgan.",
            show_alert=True
        )

        return

    now = datetime.now(
        timezone.utc
    )

    pro_until = (
        now +
        timedelta(
            days=payment["duration_days"]
        )
    )

    set_pro_user(
        telegram_id=payment["telegram_id"],
        pro_until=pro_until.isoformat()
    )

    new_caption = (
        "✅ <b>PRO to'lov tasdiqlandi!</b>\n\n"
        f"🆔 To'lov ID: <code>{payment_id}</code>\n"
        f"👤 Telegram ID: <code>{payment['telegram_id']}</code>\n"
        f"💰 Summa: <b>{payment['amount']:,} so'm</b>\n"
        f"⭐️ PRO: <b>{payment['duration_days']} kun</b>\n\n"
        "PRO foydalanuvchiga faollashtirildi."
    )

    try:

        await query.message.edit_caption(
            caption=new_caption,
            parse_mode="HTML"
        )

    except Exception:

        pass

    try:

        await context.bot.send_message(
            chat_id=payment["telegram_id"],
            text=(
                "🎉 <b>PRO faollashtirildi!</b>\n\n"
                f"⭐️ Tarif: <b>{payment['duration_days']} kun</b>\n"
                f"📅 Tugash sanasi: "
                f"<b>{pro_until.strftime('%Y-%m-%d %H:%M')}</b>\n\n"
                "Endi test yaratishingiz mumkin."
            ),
            parse_mode="HTML"
        )

    except Exception as error:

        print(
            "⚠️ Foydalanuvchiga xabar yuborilmadi:",
            error
        )


# =========================================================
# TO'LOVNI RAD ETISH
# =========================================================

async def reject_payment_callback(
    update: Update,
    context: ContextTypes.DEFAULT_TYPE
):

    query = update.callback_query

    if not is_admin(query.from_user.id):

        await query.answer(
            "❌ Ruxsat yo'q!",
            show_alert=True
        )

        return

    await query.answer()

    try:

        payment_id = int(
            query.data.split(":")[1]
        )

    except (IndexError, ValueError):

        await query.message.reply_text(
            "❌ To'lov ID noto'g'ri."
        )

        return

    payment = get_payment(
        payment_id
    )

    if not payment:

        await query.message.reply_text(
            "❌ To'lov topilmadi."
        )

        return

    if (
        payment["status"] != "proof_received"
        or not payment["proof_file_id"]
    ):

        await query.answer(
            "❌ Chek mavjud emas.",
            show_alert=True
        )

        return

    success = reject_payment(
        payment_id
    )

    if not success:

        await query.answer(
            "⚠️ Bu to'lov allaqachon ko'rib chiqilgan.",
            show_alert=True
        )

        return

    try:

        await query.message.edit_caption(
            caption=(
                "❌ <b>PRO to'lov rad etildi.</b>\n\n"
                f"🆔 To'lov ID: <code>{payment_id}</code>\n"
                f"👤 Telegram ID: "
                f"<code>{payment['telegram_id']}</code>"
            ),
            parse_mode="HTML"
        )

    except Exception:

        pass

    try:

        await context.bot.send_message(
            chat_id=payment["telegram_id"],
            text=(
                "❌ <b>PRO to'lovingiz rad etildi.</b>\n\n"
                f"🆔 To'lov ID: <code>{payment_id}</code>\n\n"
                "Iltimos, to'lov chekini tekshirib, "
                "qayta yuboring."
            ),
            parse_mode="HTML"
        )

    except Exception as error:

        print(
            "⚠️ Foydalanuvchiga xabar yuborilmadi:",
            error
        )


# =========================================================
# MAIN
# =========================================================

def main():

    if not BOT_TOKEN:

        raise RuntimeError(
            "BOT_TOKEN topilmadi!"
        )

    init_database()

    telegram_request = HTTPXRequest(
        connect_timeout=60.0,
        read_timeout=60.0,
        write_timeout=60.0,
        pool_timeout=60.0,
    )

    updates_request = HTTPXRequest(
        connect_timeout=60.0,
        read_timeout=70.0,
        write_timeout=60.0,
        pool_timeout=60.0,
    )

    application = (
        ApplicationBuilder()
        .token(BOT_TOKEN)
        .request(telegram_request)
        .get_updates_request(updates_request)
        .build()
    )

    # START
    application.add_handler(
        CommandHandler(
            "start",
            start
        )
    )

    # TEST HOLATI YANGILASH
    application.add_handler(CallbackQueryHandler(refresh_test_callback, pattern=r"^refresh_test:\d+$"))

    # ADMIN PANEL
    application.add_handler(
        CallbackQueryHandler(
            admin_panel,
            pattern="^admin_panel$"
        )
    )

    # ADMIN BO‘LIMLARI
    application.add_handler(CallbackQueryHandler(admin_statistics, pattern="^admin_statistics$"))
    application.add_handler(CallbackQueryHandler(admin_users, pattern="^admin_users$"))
    application.add_handler(CallbackQueryHandler(admin_tests, pattern="^admin_tests$"))
    application.add_handler(CallbackQueryHandler(admin_test_delete, pattern=r"^admin_test_delete:\d+$"))
    application.add_handler(CallbackQueryHandler(admin_test_delete_confirm, pattern=r"^admin_test_delete_confirm:\d+$"))
    application.add_handler(CallbackQueryHandler(admin_broadcast, pattern="^admin_broadcast$"))
    application.add_handler(CallbackQueryHandler(admin_admins, pattern="^admin_admins$"))
    application.add_handler(CallbackQueryHandler(admin_add_callback, pattern="^admin_add$"))
    application.add_handler(CallbackQueryHandler(admin_remove_callback, pattern=r"^admin_remove:\d+$"))

    # PRO
    application.add_handler(
        CallbackQueryHandler(
            admin_pro,
            pattern="^admin_pro$"
        )
    )

    application.add_handler(
        CallbackQueryHandler(
            pro_price,
            pattern=r"^pro_price:\d+$"
        )
    )

    # KARTA
    application.add_handler(
        CallbackQueryHandler(
            payment_card_settings,
            pattern="^payment_card_settings$"
        )
    )

    application.add_handler(
        CallbackQueryHandler(
            payment_card_edit,
            pattern="^payment_card_edit$"
        )
    )

    application.add_handler(
        CallbackQueryHandler(
            payment_card_delete,
            pattern="^payment_card_delete$"
        )
    )

    # TO'LOVLAR
    application.add_handler(
        CallbackQueryHandler(
            admin_payments,
            pattern="^admin_payments$"
        )
    )

    application.add_handler(
        CallbackQueryHandler(
            approve_payment_callback,
            pattern=r"^approve_payment:\d+$"
        )
    )

    application.add_handler(
        CallbackQueryHandler(
            reject_payment_callback,
            pattern=r"^reject_payment:\d+$"
        )
    )

    # ADMIN MATNLARI
    application.add_handler(
        MessageHandler(
            filters.TEXT & ~filters.COMMAND,
            admin_text_handler
        )
    )

    # TO'LOV CHEKLARI
    application.add_handler(
        MessageHandler(
            filters.PHOTO | filters.Document.ALL,
            payment_proof_handler
        )
    )

    print("🤖 Bot ishga tushdi...")

    application.run_polling()


# =========================================================
# ISHGA TUSHIRISH
# =========================================================

if __name__ == "__main__":
    main()