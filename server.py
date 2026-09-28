from flask import Flask, jsonify, request
import sqlite3
import os
import sys
import subprocess
import threading
import time
import threading
from io import BytesIO
from flask_cors import CORS

import hashlib
import hmac
import json
import re
from datetime import datetime, timezone, timedelta
from urllib.parse import parse_qsl
from urllib.request import Request, urlopen
from urllib.parse import urlencode

from config import BOT_TOKEN, ADMIN_ID

from database import (
    init_database,
    get_pro_user,
    get_pro_plans,
    get_pro_plan,
    get_user_pending_payment,
    create_pro_payment,
    get_payment_card,
    cancel_pro_payment,
    get_payment,
    get_connection,
    get_full_name,
    set_full_name,
)

app = Flask(__name__)
CORS(app)
init_database()

def validate_telegram_data(init_data):
    if not init_data:
        return None
    try:
        data = dict(parse_qsl(init_data, keep_blank_values=True))
        received_hash = data.pop("hash", None)
        if not received_hash:
            return None
        data_check_string = "\n".join(
            f"{key}={value}" for key, value in sorted(data.items())
        )
        secret_key = hmac.new(
            b"WebAppData", BOT_TOKEN.encode(), hashlib.sha256
        ).digest()
        calculated_hash = hmac.new(
            secret_key, data_check_string.encode(), hashlib.sha256
        ).hexdigest()
        if not hmac.compare_digest(calculated_hash, received_hash):
            return None
        auth_date = int(data.get("auth_date", "0"))
        now = int(datetime.now(timezone.utc).timestamp())
        if now - auth_date > 86400:
            return None
        return data
    except Exception as error:
        print("Telegram initData validation error:", error)
        return None

def get_telegram_user_id():
    init_data = request.headers.get("X-Telegram-Init-Data")
    data = validate_telegram_data(init_data)
    if not data:
        return None
    try:
        user_data = json.loads(data.get("user", "{}"))
        return int(user_data["id"])
    except Exception:
        return None

def send_telegram_message(chat_id, text):
    """Send a normal text message from the bot to the user's Telegram chat."""
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
    payload = urlencode({
        "chat_id": str(chat_id),
        "text": text,
    }).encode("utf-8")
    req = Request(url, data=payload, method="POST")
    with urlopen(req, timeout=15) as response:
        body = json.loads(response.read().decode("utf-8"))
    return bool(body.get("ok"))

def send_telegram_message_with_keyboard(chat_id, text, keyboard):
    """Send a text message with an inline keyboard."""
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
    payload = json.dumps({
        "chat_id": str(chat_id),
        "text": text,
        "reply_markup": {
            "inline_keyboard": keyboard
        }
    }).encode("utf-8")
    req = Request(
        url,
        data=payload,
        method="POST",
        headers={"Content-Type": "application/json"}
    )
    with urlopen(req, timeout=15) as response:
        body = json.loads(response.read().decode("utf-8"))
    return bool(body.get("ok"))

def init_test_tables():
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS mock_tests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            creator_id INTEGER NOT NULL,
            code TEXT UNIQUE NOT NULL,
            channel TEXT NOT NULL,
            duration_minutes INTEGER NOT NULL,
            question_count INTEGER NOT NULL,
            answer_key_json TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            ends_at TIMESTAMP NOT NULL,
            status TEXT DEFAULT 'active'
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS mock_test_participants (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            test_id INTEGER NOT NULL,
            telegram_id INTEGER NOT NULL,
            submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(test_id, telegram_id)
        )
    """)

    connection.commit()
    connection.close()

init_test_tables()

def create_mock_test(creator_id, code, channel, duration, question_count, answer_key):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        "SELECT id FROM mock_tests WHERE UPPER(code) = ?",
        (code.upper(),)
    )
    if cursor.fetchone():
        connection.close()
        return None, "❌ Bu test kodi allaqachon ishlatilgan. Boshqa kod tanlang."

    created_at = datetime.now(timezone.utc)
    ends_at = created_at + timedelta(minutes=duration)

    try:
        cursor.execute("""
            INSERT INTO mock_tests (
                creator_id, code, channel, duration_minutes,
                question_count, answer_key_json, created_at, ends_at, status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')
        """, (
            creator_id,
            code,
            channel,
            duration,
            question_count,
            json.dumps(answer_key, ensure_ascii=False),
            created_at.isoformat(),
            ends_at.isoformat()
        ))
    except sqlite3.IntegrityError:
        connection.rollback()
        connection.close()
        return None, "❌ Bu test kodi allaqachon ishlatilgan. Boshqa kod tanlang."

    test_id = cursor.lastrowid
    connection.commit()
    connection.close()
    return test_id, None

def get_mock_test(test_id):
    connection = get_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT * FROM mock_tests WHERE id = ?", (test_id,))
    row = cursor.fetchone()
    connection.close()
    return row

def get_mock_test_by_code(code):
    connection = get_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT * FROM mock_tests WHERE code = ?", (code,))
    row = cursor.fetchone()
    connection.close()
    return row

def get_mock_test_stats(test_id):
    connection = get_connection()
    cursor = connection.cursor()
    cursor.execute("""
        SELECT COUNT(*) AS total
        FROM mock_test_participants
        WHERE test_id = ?
    """, (test_id,))
    total = int(cursor.fetchone()["total"])
    connection.close()
    return total

def format_remaining(ends_at):
    try:
        end = datetime.fromisoformat(str(ends_at))
        if end.tzinfo is None:
            end = end.replace(tzinfo=timezone.utc)
        diff = end - datetime.now(timezone.utc)
        seconds = max(0, int(diff.total_seconds()))
        days, rem = divmod(seconds, 86400)
        hours, rem = divmod(rem, 3600)
        minutes, secs = divmod(rem, 60)

        if days:
            return f"{days} kun {hours} soat"
        if hours:
            return f"{hours} soat {minutes} daqiqa"
        return f"{minutes} daqiqa {secs} soniya"
    except Exception:
        return "aniqlanmadi"

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "success": True,
        "status": "ok",
        "message": "Mock Test server ishlayapti"
    })

@app.route("/api/pro-status", methods=["GET"])
def pro_status():
    telegram_id = get_telegram_user_id()
    if not telegram_id:
        return jsonify({"success": False, "message": "Telegram foydalanuvchisi aniqlanmadi."}), 401
    if telegram_id == ADMIN_ID:
        return jsonify({"success": True, "pro": True, "admin": True, "message": "Admin"})
    pro_user = get_pro_user(telegram_id)
    if not pro_user or not pro_user["pro_until"]:
        return jsonify({"success": True, "pro": False, "admin": False})
    try:
        pro_date = datetime.fromisoformat(pro_user["pro_until"])
        if pro_date.tzinfo is None:
            pro_date = pro_date.replace(tzinfo=timezone.utc)
        if pro_date > datetime.now(timezone.utc):
            return jsonify({"success": True, "pro": True, "admin": False, "pro_until": pro_user["pro_until"]})
    except Exception:
        pass
    return jsonify({"success": True, "pro": False, "admin": False})

@app.route("/api/pro-plans", methods=["GET"])
def pro_plans():
    telegram_id = get_telegram_user_id()
    if not telegram_id:
        return jsonify({"success": False, "message": "Telegram foydalanuvchisi aniqlanmadi."}), 401
    result = [{
        "id": p["id"],
        "duration_days": p["duration_days"],
        "price": p["price"],
        "active": bool(p["active"])
    } for p in get_pro_plans(active_only=True)]
    return jsonify({"success": True, "plans": result})

@app.route("/api/pro-purchase", methods=["POST"])
def pro_purchase():
    telegram_id = get_telegram_user_id()
    if not telegram_id:
        return jsonify({"success": False, "message": "Telegram foydalanuvchisi aniqlanmadi."}), 401
    if telegram_id == ADMIN_ID:
        return jsonify({"success": False, "message": "Admin uchun PRO kerak emas."}), 400
    try:
        body = request.get_json(silent=True) or {}
        plan_id = int(body.get("plan_id"))
        plan = get_pro_plan(plan_id)
        if not plan:
            return jsonify({"success": False, "message": "Tarif topilmadi."}), 404
        if not plan["active"]:
            return jsonify({"success": False, "message": "Bu tarif hozir faol emas."}), 400
        amount = int(plan["price"])
        duration_days = int(plan["duration_days"])
        if amount <= 0:
            return jsonify({"success": False, "message": "Bu tarif uchun narx belgilanmagan."}), 400
        old_payment = get_user_pending_payment(telegram_id)
        if old_payment:
            return jsonify({
                "success": False, "code": "PENDING_PAYMENT",
                "message": "Sizda allaqachon kutilayotgan PRO to'lov mavjud.",
                "payment_id": old_payment["id"]
            }), 400
        payment_id = create_pro_payment(telegram_id, amount, duration_days, plan_id)
        card = get_payment_card()
        return jsonify({
            "success": True,
            "payment_id": payment_id,
            "amount": amount,
            "duration_days": duration_days,
            "card": {
                "card_number": card["card_number"] if card else None,
                "card_holder": card["card_holder"] if card else None,
                "bank_name": card["bank_name"] if card else None
            },
            "message": "To'lov yaratildi."
        })
    except Exception as error:
        print("PRO purchase error:", error)
        return jsonify({"success": False, "message": "PRO to'lov yaratishda xatolik yuz berdi."}), 500

@app.route("/api/pro-payment-paid", methods=["POST"])
def pro_payment_paid():
    telegram_id = get_telegram_user_id()
    if not telegram_id:
        return jsonify({"success": False, "message": "Telegram foydalanuvchisi aniqlanmadi."}), 401
    try:
        body = request.get_json(silent=True) or {}
        payment_id = int(body.get("payment_id"))
    except (TypeError, ValueError):
        return jsonify({"success": False, "message": "To'lov ID noto'g'ri."}), 400

    payment = get_payment(payment_id)
    if not payment or int(payment["telegram_id"]) != telegram_id:
        return jsonify({"success": False, "message": "To'lov topilmadi."}), 404
    if payment["status"] != "pending":
        return jsonify({"success": False, "message": "Bu to'lov uchun so'rov yuborilgan yoki yakunlangan."}), 400

    text = (
        "💳 To‘lov chekini yuboring.\n\n"
        f"🆔 To‘lov ID: {payment_id}\n"
        f"💰 Summa: {int(payment['amount']):,} so‘m\n"
        f"⭐ Muddat: {int(payment['duration_days'])} kun\n\n"
        "Iltimos, to‘lov chekini shu chatga rasm yoki fayl ko‘rinishida yuboring."
    )
    try:
        if not send_telegram_message(telegram_id, text):
            raise RuntimeError("Telegram API xabarni yubormadi")
    except Exception as error:
        print("Telegram payment prompt error:", error)
        return jsonify({"success": False, "message": "Bot xabar yubora olmadi. Birozdan keyin qayta urinib ko‘ring."}), 502

    return jsonify({"success": True, "message": "Chek yuborish haqida xabar bot chatiga yuborildi."})


@app.route("/api/create-test", methods=["POST"])
def create_test():
    telegram_id = get_telegram_user_id()
    if not telegram_id:
        return jsonify({
            "success": False,
            "message": "Telegram foydalanuvchisi aniqlanmadi."
        }), 401

    try:
        body = request.get_json(silent=True) or {}

        code = str(body.get("code", "")).strip().upper()
        channel = str(body.get("channel", "")).strip()
        duration = int(body.get("duration"))

        if not re.fullmatch(r"[A-Z0-9]{4,10}", code):
            return jsonify({
                "success": False,
                "message": "Test kodi faqat A–Z va 0–9 belgilaridan iborat, 4–10 ta belgili bo‘lishi kerak."
            }), 400
        question_count = int(body.get("question_count"))
        answer_key = body.get("answer_key") or {}

        if len(code) < 4 or len(code) > 10:
            return jsonify({
                "success": False,
                "message": "Test kodi 4–10 belgidan iborat bo‘lishi kerak."
            }), 400

        if duration <= 0:
            return jsonify({
                "success": False,
                "message": "Test davomiyligi noto‘g‘ri."
            }), 400

        if question_count <= 0:
            return jsonify({
                "success": False,
                "message": "Savollar soni noto‘g‘ri."
            }), 400

        missing = []
        for i in range(1, question_count + 1):
            value = answer_key.get(str(i), answer_key.get(i, ""))
            if 36 <= i <= 45:
                pair = _normalize_multi_answer(value)
                if len(pair) < 2 or not pair[0] or not pair[1]:
                    missing.append(str(i))
            elif not _normalize_answer(value):
                missing.append(str(i))
        if missing:
            return jsonify({
                "success": False,
                "message": "Ba'zi savollarga javob belgilanmagan."
            }), 400

        test_id, error_message = create_mock_test(
            telegram_id,
            code,
            channel,
            duration,
            question_count,
            answer_key
        )

        if error_message:
            return jsonify({
                "success": False,
                "message": error_message
            }), 409

        test = get_mock_test(test_id)
        remaining = format_remaining(test["ends_at"])

        text = (
            "🎉 TEST YARATILDI!\n\n"
            f"🔑 Test kodi: {code}\n"
            f"📢 Kanal: {channel}\n"
            f"📝 Savollar: {question_count} ta\n"
            f"⏱ Davomiyligi: {duration} daqiqa\n\n"
            "👥 Javob berganlar: 0 ta\n"
            f"⏳ Tugashiga: {remaining}\n\n"
            "Test faol. Holatni yangilash uchun pastdagi tugmani bosing."
        )

        keyboard = [[
            {
                "text": "🔄 Yangilash",
                "callback_data": f"refresh_test:{test_id}"
            }
        ]]

        try:
            send_telegram_message_with_keyboard(
                telegram_id,
                text,
                keyboard
            )
        except Exception as error:
            print("Test created notification error:", error)

        return jsonify({
            "success": True,
            "test_id": test_id,
            "code": code,
            "channel": channel,
            "duration": duration,
            "question_count": question_count,
            "ends_at": test["ends_at"]
        })

    except Exception as error:
        print("CREATE TEST ERROR:", error)
        return jsonify({
            "success": False,
            "message": "Test yaratishda server xatosi yuz berdi."
        }), 500


@app.route("/api/test-status/<int:test_id>", methods=["GET"])
def test_status(test_id):
    telegram_id = get_telegram_user_id()
    if not telegram_id:
        return jsonify({
            "success": False,
            "message": "Telegram foydalanuvchisi aniqlanmadi."
        }), 401

    test = get_mock_test(test_id)
    if not test:
        return jsonify({
            "success": False,
            "message": "Test topilmadi."
        }), 404

    if int(test["creator_id"]) != telegram_id and telegram_id != ADMIN_ID:
        return jsonify({
            "success": False,
            "message": "Bu test sizga tegishli emas."
        }), 403

    remaining = format_remaining(test["ends_at"])
    participants = get_mock_test_stats(test_id)

    try:
        end = datetime.fromisoformat(str(test["ends_at"]))
        if end.tzinfo is None:
            end = end.replace(tzinfo=timezone.utc)
        status = "finished" if end <= datetime.now(timezone.utc) else "active"
    except Exception:
        status = test["status"]

    return jsonify({
        "success": True,
        "test_id": test_id,
        "code": test["code"],
        "participants": participants,
        "remaining": remaining,
        "ends_at": test["ends_at"],
        "status": status
    })



# =========================
# PARTICIPANT / NATIJALAR API
# =========================

def _utc_now():
    return datetime.now(timezone.utc)


def _parse_dt(value):
    try:
        dt = datetime.fromisoformat(str(value))
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt
    except Exception:
        return None


def _test_finished(test):
    end = _parse_dt(test["ends_at"])
    return bool(end and end <= _utc_now())


def _normalize_answer(value):
    """Normalize one answer value for comparison."""
    if value is None:
        return ""
    return str(value).strip().upper()


def _normalize_multi_answer(value):
    """Normalize a two-part answer (used by questions 36–45)."""
    if isinstance(value, (list, tuple)):
        return [_normalize_answer(v) for v in value]
    if isinstance(value, dict):
        # Accept both {a: ..., b: ...} and {"1": ..., "2": ...}.
        first = value.get("a", value.get("1", ""))
        second = value.get("b", value.get("2", ""))
        return [_normalize_answer(first), _normalize_answer(second)]
    text = _normalize_answer(value)
    if not text:
        return []
    # Backward compatibility for old tests that may have stored two parts as A||B.
    if "||" in text:
        return [_normalize_answer(x) for x in text.split("||")[:2]]
    return [text]


def _answer_is_correct(question_number, given, right):
    """Return True when the participant's answer is fully correct."""
    n = int(question_number)
    if 36 <= n <= 45:
        given_parts = _normalize_multi_answer(given)
        right_parts = _normalize_multi_answer(right)
        return (
            len(given_parts) >= 2
            and len(right_parts) >= 2
            and bool(given_parts[0])
            and bool(given_parts[1])
            and given_parts[0] == right_parts[0]
            and given_parts[1] == right_parts[1]
        )
    return bool(_normalize_answer(given)) and bool(_normalize_answer(right)) and _normalize_answer(given) == _normalize_answer(right)


def _grade(score):
    score = float(score)
    if score >= 70:
        return "A+"
    if score >= 65:
        return "A"
    if score >= 60:
        return "B+"
    if score >= 55:
        return "B"
    if score >= 50:
        return "C+"
    if score >= 46:
        return "C"
    return "NC"


def _load_answer_key(test):
    try:
        raw = json.loads(test["answer_key_json"] or "{}")
        result = {}
        for k, v in raw.items():
            key = str(k)
            # Keep 36–45 as a two-part answer. Other questions remain single-answer.
            if 36 <= int(key) <= 45:
                result[key] = _normalize_multi_answer(v)
            else:
                result[key] = _normalize_answer(v)
        return result
    except Exception:
        return {}


def ensure_participant_tables():
    """Create/upgrade participant tables without removing existing data."""
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS participant_profiles (
            telegram_id INTEGER PRIMARY KEY,
            full_name TEXT NOT NULL DEFAULT '',
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cursor.execute("PRAGMA table_info(mock_tests)")
    test_columns = {row["name"] for row in cursor.fetchall()}
    for name, definition in {
        "finalized_at": "TIMESTAMP",
        "creator_results_sent_at": "TIMESTAMP",
        "creator_stats_sent_at": "TIMESTAMP",
        "creator_final_message_sent_at": "TIMESTAMP",
    }.items():
        if name not in test_columns:
            cursor.execute(f"ALTER TABLE mock_tests ADD COLUMN {name} {definition}")

    cursor.execute("PRAGMA table_info(mock_test_participants)")
    columns = {row["name"] for row in cursor.fetchall()}
    additions = {
        "answers_json": "TEXT",
        "correct_count": "INTEGER DEFAULT 0",
        "percent": "REAL DEFAULT 0",
        "score": "REAL DEFAULT 0",
        "grade": "TEXT DEFAULT 'NC'",
        "result_sent_at": "TIMESTAMP",
    }
    for name, definition in additions.items():
        if name not in columns:
            cursor.execute(f"ALTER TABLE mock_test_participants ADD COLUMN {name} {definition}")

    connection.commit()
    connection.close()


ensure_participant_tables()


def _calculate_scores_locked(connection, test):
    """Calculate final dynamic scores. Caller owns the DB connection."""
    cursor = connection.cursor()
    answer_key = _load_answer_key(test)
    question_count = int(test["question_count"] or len(answer_key))
    if question_count <= 0:
        return []

    cursor.execute(
        "SELECT * FROM mock_test_participants WHERE test_id = ? ORDER BY id ASC",
        (test["id"],)
    )
    participants = cursor.fetchall()
    if not participants:
        return []

    correct_by_question = {str(i): 0 for i in range(1, question_count + 1)}
    parsed_answers = {}
    correct_counts = {}

    for participant in participants:
        try:
            answers = json.loads(participant["answers_json"] or "{}")
            if not isinstance(answers, dict):
                answers = {}
        except Exception:
            answers = {}
        parsed_answers[participant["id"]] = answers

        correct = 0
        for i in range(1, question_count + 1):
            key = str(i)
            given = answers.get(key, answers.get(i, ""))
            right = answer_key.get(key, "")
            if _answer_is_correct(i, given, right):
                correct += 1
                correct_by_question[key] += 1
        correct_counts[participant["id"]] = correct

    total_participants = len(participants)
    coefficients = {}
    for i in range(1, question_count + 1):
        fraction = correct_by_question[str(i)] / total_participants
        coefficients[str(i)] = 2.0 - fraction

    total_possible = sum(coefficients.values()) or 1.0
    results = []

    for participant in participants:
        earned = 0.0
        answers = parsed_answers[participant["id"]]
        for i in range(1, question_count + 1):
            key = str(i)
            given = answers.get(key, answers.get(i, ""))
            right = answer_key.get(key, "")
            if _answer_is_correct(i, given, right):
                earned += coefficients[key]

        correct_count = correct_counts[participant["id"]]
        # Umumiy ball dinamik koeffitsiyent bo‘yicha 0–100 oralig‘ida.
        score = (earned / total_possible) * 100
        # Milliy sertifikat uslubida: 65 ball = 100%. 65 dan yuqori ham 100%.
        percent = min(100.0, max(0.0, (score / 65.0) * 100.0))
        grade = _grade(score)

        cursor.execute("""
            UPDATE mock_test_participants
            SET correct_count = ?, percent = ?, score = ?, grade = ?
            WHERE id = ?
        """, (correct_count, round(percent, 2), round(score, 2), grade, participant["id"]))

        results.append({
            "id": participant["id"],
            "telegram_id": int(participant["telegram_id"]),
            "submitted_at": participant["submitted_at"],
            "correct_count": correct_count,
            "percent": round(percent, 2),
            "score": round(score, 2),
            "grade": grade,
        })

    # Higher score first; correct count is the deterministic tie-breaker.
    results.sort(key=lambda x: (x["score"], x["correct_count"]), reverse=True)
    for rank, item in enumerate(results, 1):
        item["rank"] = rank
    return results


def _telegram_send_document(chat_id, file_bytes, filename, caption=""):
    """Send a PDF to Telegram without requiring the Telegram Python package."""
    boundary = "----MockTestBoundary7MA"
    parts = []
    parts.append((
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="chat_id"\r\n\r\n'
        f"{chat_id}\r\n"
    ).encode())
    if caption:
        parts.append((
            f"--{boundary}\r\n"
            f'Content-Disposition: form-data; name="caption"\r\n\r\n'
            f"{caption}\r\n"
        ).encode("utf-8"))
    parts.append((
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="document"; filename="{filename}"\r\n'
        f"Content-Type: application/pdf\r\n\r\n"
    ).encode("utf-8"))
    body = b"".join(parts) + file_bytes + f"\r\n--{boundary}--\r\n".encode()
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendDocument"
    req = Request(url, data=body, method="POST", headers={
        "Content-Type": f"multipart/form-data; boundary={boundary}"
    })
    with urlopen(req, timeout=30) as response:
        data = json.loads(response.read().decode("utf-8"))
    return bool(data.get("ok"))


def _creator_pdf_results(test, results):
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import A4, landscape
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.enums import TA_CENTER
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
    from reportlab.lib.units import mm

    buf = BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=landscape(A4), leftMargin=8*mm, rightMargin=8*mm,
                            topMargin=9*mm, bottomMargin=9*mm)
    styles = getSampleStyleSheet()
    title = ParagraphStyle("Title2", parent=styles["Title"], alignment=TA_CENTER, fontSize=15, leading=18)
    normal = ParagraphStyle("Small", parent=styles["Normal"], fontSize=7.2, leading=8.5)
    story = [Paragraph("NATIJALAR", title), Spacer(1, 3*mm),
             Paragraph(f"Test kodi: <b>{test['code']}</b> &nbsp;&nbsp; Savollar: <b>{test['question_count']}</b> &nbsp;&nbsp; Ishtirokchilar: <b>{len(results)}</b>", normal),
             Spacer(1, 4*mm)]
    data = [["№", "Ism familiya", "Umumiy ball", "Foiz", "Daraja"]]
    for i, item in enumerate(results, 1):
        connection = get_connection(); cur = connection.cursor()
        cur.execute("SELECT full_name FROM users WHERE telegram_id = ?", (item["telegram_id"],))
        row = cur.fetchone(); connection.close()
        name = (row["full_name"] if row else "") or "Ism familiya kiritilmagan"
        data.append([str(i), name, f"{item['score']:.2f}", f"{item['percent']:.2f}%", item['grade']])

    table = Table(data, repeatRows=1, colWidths=[10*mm, 75*mm, 35*mm, 30*mm, 25*mm])
    ts = [
        ("BACKGROUND", (0,0), (-1,0), colors.HexColor("#1f2937")),
        ("TEXTCOLOR", (0,0), (-1,0), colors.white),
        ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
        ("FONTSIZE", (0,0), (-1,-1), 7),
        ("GRID", (0,0), (-1,-1), 0.35, colors.HexColor("#b8bec8")),
        ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
        ("ALIGN", (0,0), (0,-1), "CENTER"),
        ("ALIGN", (2,1), (-1,-1), "CENTER"),
        ("ROWBACKGROUNDS", (0,1), (-1,-1), [colors.white, colors.HexColor("#f7f8fa")]),
        ("TOPPADDING", (0,0), (-1,-1), 4), ("BOTTOMPADDING", (0,0), (-1,-1), 4),
    ]
    grade_bg = {"A+":"#dcfce7", "A":"#ecfdf5", "B+":"#dbeafe", "B":"#fef3c7", "C+":"#ffedd5", "C":"#fee2e2", "NC":"#f3f4f6"}
    for r, item in enumerate(results, 1):
        ts.append(("BACKGROUND", (4,r), (4,r), colors.HexColor(grade_bg.get(item["grade"], "#f3f4f6"))))
    table.setStyle(TableStyle(ts))
    story.append(table)
    doc.build(story)
    return buf.getvalue()


def _creator_pdf_statistics(test, results):
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.enums import TA_CENTER
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, PageBreak
    from reportlab.lib.units import mm
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    answer_key = _load_answer_key(test)
    question_count = int(test["question_count"])
    total = len(results)
    grade_order = ["A+", "A", "B+", "B", "C+", "C", "NC"]
    grade_counts = {g: 0 for g in grade_order}
    for r in results: grade_counts[r["grade"]] = grade_counts.get(r["grade"], 0) + 1

    correct_counts = [0] * question_count
    for r in results:
        connection = get_connection(); cur = connection.cursor()
        cur.execute("SELECT answers_json FROM mock_test_participants WHERE id = ?", (r["id"],))
        row = cur.fetchone(); connection.close()
        try: answers = json.loads(row["answers_json"] or "{}") if row else {}
        except Exception: answers = {}
        for i in range(1, question_count + 1):
            if _answer_is_correct(i, answers.get(str(i), ""), answer_key.get(str(i), "")):
                correct_counts[i-1] += 1

    # Average time from creation to submission.
    created = _parse_dt(test["created_at"])
    times = []
    if created:
        for r in results:
            submitted = _parse_dt(r["submitted_at"])
            if submitted:
                times.append(max(0, (submitted - created).total_seconds()))
    avg_time = sum(times)/len(times) if times else 0
    avg_result = sum(r["percent"] for r in results)/total if total else 0
    highest = max((r["score"] for r in results), default=0)
    lowest = min((r["score"] for r in results), default=0)

    chart = BytesIO()
    fig = plt.figure(figsize=(8.5, 3.5))
    ax = fig.add_axes([0.08, 0.18, 0.89, 0.72])
    ax.bar(range(1, question_count + 1), correct_counts)
    ax.set_title("Har bir savol bo‘yicha to‘g‘ri javoblar soni")
    ax.set_xlabel("Savollar")
    ax.set_ylabel("To‘g‘ri javoblar soni")
    ax.set_xticks(range(1, question_count + 1))
    ax.grid(axis="y", alpha=0.25)
    fig.savefig(chart, format="png", dpi=150)
    plt.close(fig)
    chart.seek(0)

    buf = BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4, leftMargin=12*mm, rightMargin=12*mm, topMargin=12*mm, bottomMargin=12*mm)
    styles = getSampleStyleSheet()
    title = ParagraphStyle("StatTitle", parent=styles["Title"], alignment=TA_CENTER, fontSize=16)
    small = ParagraphStyle("StatSmall", parent=styles["Normal"], fontSize=9, leading=12)
    story = [Paragraph("STATISTIKALAR", title), Spacer(1, 4*mm)]

    grade_data = [["Daraja", "Ishtirokchilar"]] + [[g, str(grade_counts[g])] for g in grade_order]
    gt = Table(grade_data, colWidths=[45*mm, 45*mm])
    gt.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,0),colors.HexColor("#1f2937")),("TEXTCOLOR",(0,0),(-1,0),colors.white),
                            ("GRID",(0,0),(-1,-1),0.4,colors.grey),("ALIGN",(1,0),(1,-1),"CENTER"),
                            ("FONTSIZE",(0,0),(-1,-1),9)]))
    story += [Paragraph("1. Darajalar taqsimoti", styles["Heading2"]), gt, Spacer(1, 5*mm)]

    avg_min = int(avg_time // 60); avg_sec = int(avg_time % 60)
    overall = [
        ["Test kodi", str(test["code"])], ["Jami qatnashchilar", str(total)], ["Yakunlaganlar", str(total)],
        ["O‘rtacha vaqt", f"{avg_min} daqiqa {avg_sec} soniya"], ["O‘rtacha natija", f"{avg_result:.2f}%"],
        ["Eng yuqori ball", f"{highest:.2f}"], ["Eng past ball", f"{lowest:.2f}"],
    ]
    ot = Table(overall, colWidths=[55*mm, 80*mm])
    ot.setStyle(TableStyle([("GRID",(0,0),(-1,-1),0.4,colors.grey),("FONTNAME",(0,0),(0,-1),"Helvetica-Bold"),
                            ("FONTSIZE",(0,0),(-1,-1),9),("BACKGROUND",(0,0),(0,-1),colors.HexColor("#f1f5f9"))]))
    story += [Paragraph("2. Umumiy statistika", styles["Heading2"]), ot, Spacer(1, 5*mm),
              Paragraph("3. Har bir savol bo‘yicha berilgan ball", styles["Heading2"])]
    points_data = [["Savol", "To‘g‘ri javoblar", "Koeffitsiyent"]]
    for i, c in enumerate(correct_counts, 1):
        coeff = 2.0 - (c / total) if total else 2.0
        points_data.append([str(i), str(c), f"{coeff:.4f}"])
    pt = Table(points_data, repeatRows=1, colWidths=[25*mm, 40*mm, 45*mm])
    pt.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,0),colors.HexColor("#1f2937")),("TEXTCOLOR",(0,0),(-1,0),colors.white),
                            ("GRID",(0,0),(-1,-1),0.3,colors.grey),("ALIGN",(0,0),(-1,-1),"CENTER"),("FONTSIZE",(0,0),(-1,-1),8)]))
    story += [pt, Spacer(1, 5*mm), Paragraph("4. Har bir savol bo‘yicha to‘g‘ri javoblar grafigi", styles["Heading2"]),
              Image(chart, width=180*mm, height=74*mm)]

    easiest = sorted(range(1, question_count+1), key=lambda i: correct_counts[i-1], reverse=True)[:5]
    hardest = sorted(range(1, question_count+1), key=lambda i: correct_counts[i-1])[:5]
    story += [Spacer(1, 3*mm), Paragraph(
        "Eng oson savollar: " + ", ".join(f"{i}-savol ({correct_counts[i-1]} ta)" for i in easiest) +
        "<br/>Eng qiyin savollar: " + ", ".join(f"{i}-savol ({correct_counts[i-1]} ta)" for i in hardest), small)]
    doc.build(story)
    return buf.getvalue()


def _load_final_results(test_id):
    connection = get_connection(); cursor = connection.cursor()
    cursor.execute("SELECT * FROM mock_tests WHERE id=?", (test_id,))
    test = cursor.fetchone()
    if not test:
        connection.close(); return None, []
    cursor.execute("""
        SELECT id, telegram_id, submitted_at, correct_count, percent, score, grade
        FROM mock_test_participants WHERE test_id=?
        ORDER BY score DESC, correct_count DESC, id ASC
    """, (test_id,))
    rows = cursor.fetchall(); connection.close()
    results=[]
    for rank,row in enumerate(rows,1):
        results.append({"id":int(row["id"]),"telegram_id":int(row["telegram_id"]),"submitted_at":row["submitted_at"],
                        "correct_count":int(row["correct_count"] or 0),"percent":float(row["percent"] or 0),
                        "score":float(row["score"] or 0),"grade":row["grade"] or "NC","rank":rank})
    return test, results


def _deliver_finished_test(test_id):
    """Retry-safe delivery for a finished test. Database flags prevent duplicates."""
    test, results = _load_final_results(test_id)
    if not test or str(test["status"]) != "finished":
        return False
    total = len(results)

    for item in results:
        connection=get_connection(); cursor=connection.cursor()
        cursor.execute("SELECT result_sent_at FROM mock_test_participants WHERE id=?", (item["id"],))
        row=cursor.fetchone(); connection.close()
        if row and row["result_sent_at"]:
            continue
        try:
            name=get_full_name(item["telegram_id"]) or "Ishtirokchi"
            text=(
                "🏁 TEST YAKUNLANDI!\n\n"
                f"📝 Test: {test['code']}\n\n"
                f"👤 Ishtirokchi: {name}\n\n"
                "📊 NATIJA\n\n"
                f"✅ To‘g‘ri javoblar: {item['correct_count']} ta\n"
                f"❌ Noto‘g‘ri javoblar: {int(test['question_count'])-item['correct_count']} ta\n\n"
                f"📈 Natija: {item['percent']:.2f}%\n"
                f"⭐ Ball: {item['score']:.2f}\n\n"
                f"🏆 Daraja: {item['grade']}\n\n"
                f"🥇 Reytingdagi o‘rningiz: {item['rank']}-o‘rin\n"
                f"👥 Jami qatnashchilar: {total} ta\n\n"
                "━━━━━━━━━━━━━━\n"
                f"📌 Test kodi: {test['code']}"
            )
            if send_telegram_message(item["telegram_id"], text):
                connection=get_connection(); cursor=connection.cursor()
                cursor.execute("UPDATE mock_test_participants SET result_sent_at=CURRENT_TIMESTAMP WHERE id=?", (item["id"],))
                connection.commit(); connection.close()
        except Exception as error:
            print(f"⚠️ Natija xabari yuborilmadi ({item['telegram_id']}): {error}")

    # Creator's final overview message is sent once and tracked for retry safety.
    try:
        connection=get_connection(); cursor=connection.cursor()
        cursor.execute("SELECT creator_final_message_sent_at FROM mock_tests WHERE id=?", (test_id,)); row=cursor.fetchone(); connection.close()
        if not row or not row["creator_final_message_sent_at"]:
            if send_telegram_message(test["creator_id"],
                f"🏁 Test yakunlandi!\n\n📝 Test: {test['code']}\n👥 Qatnashchilar: {total} ta\n\n"
                "📄 1-PDF — NATIJALAR\n📊 2-PDF — STATISTIKALAR\n\nPDF fayllar quyida yuboriladi."):
                connection=get_connection(); cursor=connection.cursor(); cursor.execute("UPDATE mock_tests SET creator_final_message_sent_at=CURRENT_TIMESTAMP WHERE id=?", (test_id,)); connection.commit(); connection.close()
    except Exception as error:
        print("⚠️ Creator yakuniy xabari yuborilmadi:", error)

    try:
        connection=get_connection(); cursor=connection.cursor(); cursor.execute("SELECT creator_results_sent_at FROM mock_tests WHERE id=?", (test_id,)); row=cursor.fetchone(); connection.close()
        if not row or not row["creator_results_sent_at"]:
            pdf=_creator_pdf_results(test, results)
            if _telegram_send_document(test["creator_id"], pdf, f"NATIJALAR_{test['code']}.pdf", f"📄 1-PDF — NATIJALAR\n📝 Test: {test['code']}"):
                connection=get_connection(); cursor=connection.cursor(); cursor.execute("UPDATE mock_tests SET creator_results_sent_at=CURRENT_TIMESTAMP WHERE id=?", (test_id,)); connection.commit(); connection.close()
    except Exception as error:
        print("⚠️ 1-PDF yuborilmadi:", error)

    try:
        connection=get_connection(); cursor=connection.cursor(); cursor.execute("SELECT creator_stats_sent_at FROM mock_tests WHERE id=?", (test_id,)); row=cursor.fetchone(); connection.close()
        if not row or not row["creator_stats_sent_at"]:
            pdf=_creator_pdf_statistics(test, results)
            if _telegram_send_document(test["creator_id"], pdf, f"STATISTIKALAR_{test['code']}.pdf", f"📊 2-PDF — STATISTIKALAR\n📝 Test: {test['code']}"):
                connection=get_connection(); cursor=connection.cursor(); cursor.execute("UPDATE mock_tests SET creator_stats_sent_at=CURRENT_TIMESTAMP WHERE id=?", (test_id,)); connection.commit(); connection.close()
    except Exception as error:
        print("⚠️ 2-PDF yuborilmadi:", error)

    return True


def _finalize_test(test_id):
    """Close an expired active test once, then deliver results/PDFs with retry-safe flags."""
    connection = get_connection()
    try:
        connection.execute("BEGIN IMMEDIATE")
        cursor = connection.cursor()
        cursor.execute("SELECT * FROM mock_tests WHERE id=?", (test_id,))
        test = cursor.fetchone()
        if not test:
            connection.rollback(); return False
        if str(test["status"]) == "finished":
            connection.commit()
            return _deliver_finished_test(test_id)
        if not _test_finished(test):
            connection.commit(); return False

        _calculate_scores_locked(connection, test)
        cursor.execute("""
            UPDATE mock_tests
            SET status='finished', finalized_at=COALESCE(finalized_at,CURRENT_TIMESTAMP)
            WHERE id=? AND status='active'
        """, (test_id,))
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()

    return _deliver_finished_test(test_id)


def _finalize_due_tests():
    connection=get_connection(); cursor=connection.cursor()
    cursor.execute("SELECT id FROM mock_tests WHERE status='active'")
    active_ids=[int(r["id"]) for r in cursor.fetchall()]
    cursor.execute("""
        SELECT id FROM mock_tests
        WHERE status='finished'
          AND (creator_results_sent_at IS NULL OR creator_stats_sent_at IS NULL OR creator_final_message_sent_at IS NULL
               OR EXISTS (SELECT 1 FROM mock_test_participants p WHERE p.test_id=mock_tests.id AND p.result_sent_at IS NULL))
    """)
    pending_ids=[int(r["id"]) for r in cursor.fetchall()]
    connection.close()
    for test_id in active_ids + [x for x in pending_ids if x not in active_ids]:
        try:
            _finalize_test(test_id)
        except Exception as error:
            print(f"⚠️ Test #{test_id} checker xatosi: {error}")


def _checker_worker():
    print("🤖 Avtomatik Mock Checker ishga tushdi...")
    while True:
        try:
            _finalize_due_tests()
        except Exception as error:
            print("⚠️ Checker umumiy xatosi:", error)
        time.sleep(2)


@app.route("/api/participant/test/<code>", methods=["GET"])
def participant_test(code):
    telegram_id = get_telegram_user_id()
    if not telegram_id:
        return jsonify({"success": False, "message": "Telegram foydalanuvchisi aniqlanmadi."}), 401

    code = str(code or "").strip().upper()
    if not re.fullmatch(r"[A-Z0-9]{4,10}", code):
        return jsonify({"success": False, "message": "Bunday test topilmadi."}), 404

    connection = get_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT * FROM mock_tests WHERE UPPER(code) = ?", (code,))
    test = cursor.fetchone()
    connection.close()

    if not test:
        return jsonify({"success": False, "message": "Bunday test topilmadi."}), 404

    finished = _test_finished(test)
    remaining_seconds = 0
    end = _parse_dt(test["ends_at"])
    if end:
        remaining_seconds = max(0, int((end - _utc_now()).total_seconds()))

    connection = get_connection()
    cursor = connection.cursor()
    cursor.execute("""
        SELECT id, submitted_at, correct_count, percent, score, grade
        FROM mock_test_participants
        WHERE test_id = ? AND telegram_id = ?
    """, (test["id"], telegram_id))
    participant = cursor.fetchone()
    connection.close()

    return jsonify({
        "success": True,
        "test": {
            "id": test["id"],
            "code": test["code"],
            "channel": test["channel"],
            "duration_minutes": int(test["duration_minutes"]),
            "question_count": int(test["question_count"]),
            "created_at": test["created_at"],
            "ends_at": test["ends_at"],
            "remaining_seconds": remaining_seconds,
            "status": "finished" if finished else "active",
            "already_submitted": bool(participant),
        },
        "message": "Test vaqti tugagan." if finished else "Test topildi."
    })


@app.route("/api/participant/submit", methods=["POST"])
def participant_submit():
    telegram_id = get_telegram_user_id()
    if not telegram_id:
        return jsonify({"success": False, "message": "Telegram foydalanuvchisi aniqlanmadi."}), 401

    body = request.get_json(silent=True) or {}
    code = str(body.get("code", "")).strip().upper()
    answers = body.get("answers") or {}
    if not isinstance(answers, dict):
        return jsonify({"success": False, "message": "Javoblar formati noto‘g‘ri."}), 400

    connection = get_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT * FROM mock_tests WHERE UPPER(code) = ?", (code,))
    test = cursor.fetchone()
    if not test:
        connection.close()
        return jsonify({"success": False, "message": "Bunday test topilmadi."}), 404

    auto_submit = bool(body.get("auto_submit"))
    if _test_finished(test):
        end = _parse_dt(test["ends_at"])
        grace = (end + timedelta(seconds=15)) if end else None
        if not auto_submit or not grace or _utc_now() > grace:
            connection.close()
            return jsonify({"success": False, "message": "Test vaqti tugagan. Javob yuborish mumkin emas."}), 400

    cursor.execute(
        "SELECT id FROM mock_test_participants WHERE test_id = ? AND telegram_id = ?",
        (test["id"], telegram_id)
    )
    if cursor.fetchone():
        connection.close()
        return jsonify({"success": False, "message": "Siz bu testni allaqachon topshirgansiz."}), 409

    clean_answers = {str(k): _normalize_answer(v) for k, v in answers.items()}
    submitted_at = _utc_now().isoformat()
    try:
        cursor.execute("""
            INSERT INTO mock_test_participants
                (test_id, telegram_id, submitted_at, answers_json)
            VALUES (?, ?, ?, ?)
        """, (test["id"], telegram_id, submitted_at, json.dumps(clean_answers, ensure_ascii=False)))
    except sqlite3.IntegrityError:
        connection.rollback()
        connection.close()
        return jsonify({"success": False, "message": "Siz bu testni allaqachon topshirgansiz."}), 409

    connection.commit()
    connection.close()

    # Foydalanuvchiga Telegram orqali tasdiq xabari yuboramiz.
    # Bu xabar natija hisoblanganini anglatmaydi: yakuniy natija
    # test yopilgandan keyin barcha ishtirokchilar hisoblangach yuboriladi.
    try:
        full_name = get_full_name(telegram_id) or "Ishtirokchi"
        send_telegram_message(
            telegram_id,
            (
                "✅ Testni muvaffaqiyatli topshirdingiz!\n\n"
                f"📝 Test kodi: {test['code']}\n"
                f"👤 Ishtirokchi: {full_name}\n\n"
                "📊 Javoblaringiz qabul qilindi.\n"
                "⏳ Natijalarni kuting...\n\n"
                "Natijalar test yakunlangandan so‘ng barcha "
                "ishtirokchilar natijalari hisoblangach yuboriladi."
            )
        )
    except Exception as error:
        # Telegram xabari yuborilmasa ham javoblar bazada saqlanib qoladi.
        print("⚠️ Test topshirish xabari yuborilmadi:", error)

    # If this was the last-second automatic submission, finalize immediately when due.
    try:
        _finalize_due_tests()
    except Exception as error:
        print("⚠️ Submitdan keyingi checker xatosi:", error)

    return jsonify({
        "success": True,
        "message": "Testni muvaffaqiyatli topshirdingiz!",
        "result_ready": False,
        "test_code": test["code"],
    })


@app.route("/api/participant/results", methods=["GET"])
def participant_results():
    telegram_id = get_telegram_user_id()
    if not telegram_id:
        return jsonify({"success": False, "message": "Telegram foydalanuvchisi aniqlanmadi."}), 401

    _finalize_due_tests()
    connection = get_connection(); cursor = connection.cursor()
    cursor.execute("""
        SELECT p.id, p.test_id, p.submitted_at, p.correct_count, p.percent, p.score, p.grade,
               t.code, t.question_count, t.status
        FROM mock_test_participants p
        JOIN mock_tests t ON t.id = p.test_id
        WHERE p.telegram_id = ?
        ORDER BY p.id DESC
    """, (telegram_id,))
    rows = cursor.fetchall(); connection.close()

    results=[]
    for row in rows:
        item={"test_id":row["test_id"],"test_code":row["code"],"submitted_at":row["submitted_at"],
              "question_count":int(row["question_count"]),"status":"finished" if row["status"]=="finished" else "waiting"}
        if row["status"]=="finished":
            c=get_connection(); cur=c.cursor()
            cur.execute("""SELECT id, telegram_id, score, correct_count FROM mock_test_participants
                           WHERE test_id=? ORDER BY score DESC, correct_count DESC, id ASC""", (row["test_id"],))
            ranking=cur.fetchall(); c.close()
            rank=next((i for i,x in enumerate(ranking,1) if int(x["id"])==int(row["id"])), None)
            item.update({"correct_count":int(row["correct_count"] or 0),"percent":float(row["percent"] or 0),
                         "score":float(row["score"] or 0),"grade":row["grade"] or "NC","rank":rank,"total_participants":len(ranking)})
        else:
            item.update({"correct_count":None,"percent":None,"score":None,"grade":None,"rank":None,"total_participants":None})
        results.append(item)
    return jsonify({"success":True,"results":results})


@app.route("/api/participant/profile", methods=["GET", "POST"])
def participant_profile():
    telegram_id = get_telegram_user_id()
    if not telegram_id:
        return jsonify({"success": False, "message": "Telegram foydalanuvchisi aniqlanmadi."}), 401

    if request.method == "POST":
        body = request.get_json(silent=True) or {}
        full_name = str(body.get("full_name", "")).strip()

        if len(full_name) < 2 or len(full_name) > 100:
            return jsonify({"success": False, "message": "Ism familiyani to‘g‘ri kiriting."}), 400
        if not any(ch.isalpha() for ch in full_name):
            return jsonify({"success": False, "message": "Ism familiyani to‘g‘ri kiriting."}), 400

        # Profil nomi endi alohida participant_profiles jadvaliga emas,
        # umumiy users.full_name maydoniga saqlanadi.
        set_full_name(telegram_id, full_name)

        return jsonify({
            "success": True,
            "full_name": full_name,
            "message": "Profil saqlandi."
        })

    full_name = get_full_name(telegram_id) or ""
    return jsonify({"success": True, "full_name": full_name})

@app.route("/api/pro-cancel", methods=["POST"])
def pro_cancel():
    telegram_id = get_telegram_user_id()
    if not telegram_id:
        return jsonify({"success": False, "message": "Telegram foydalanuvchisi aniqlanmadi."}), 401
    payment = get_user_pending_payment(telegram_id)
    if not payment or payment["status"] != "pending":
        return jsonify({"success": False, "message": "Kutilayotgan PRO to'lov topilmadi yoki uni bekor qilib bo'lmaydi."}), 404
    if not cancel_pro_payment(payment["id"], telegram_id):
        return jsonify({"success": False, "message": "To'lovni bekor qilib bo'lmadi."}), 400
    return jsonify({"success": True, "message": "PRO to'lov bekor qilindi.", "payment_id": payment["id"]})

@app.route("/api/pro-pending", methods=["GET"])
def pro_pending():
    telegram_id = get_telegram_user_id()
    if not telegram_id:
        return jsonify({"success": False, "message": "Telegram foydalanuvchisi aniqlanmadi."}), 401
    payment = get_user_pending_payment(telegram_id)
    if not payment:
        return jsonify({"success": True, "pending": False})
    return jsonify({
        "success": True, "pending": True,
        "payment": {
            "id": payment["id"],
            "amount": payment["amount"],
            "duration_days": payment["duration_days"],
            "status": payment["status"],
            "proof_received": bool(payment["proof_file_id"])
        }
    })

if __name__ == "__main__":
    print("🌐 Server ishga tushdi...")

    port = int(os.environ.get("PORT", 5000))
    print(f"📡 Port: {port}")

    print("🤖 Telegram bot ishga tushirilmoqda...")

    subprocess.Popen(
        [sys.executable, "bot.py"],
        env=os.environ.copy()
    )

    print("✅ Telegram bot ishga tushirish buyrug'i berildi...")

    print("🤖 Checker: har 2 soniyada testlarni tekshiradi")
    threading.Thread(
        target=_checker_worker,
        daemon=True,
        name="mock-checker"
    ).start()

    app.run(
        host="0.0.0.0",
        port=port,
        debug=False,
        use_reloader=False
    )
