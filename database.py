import sqlite3
from pathlib import Path

from config import DATABASE_PATH, ADMIN_ID


# =========================================================
# DATABASE CONNECTION
# =========================================================

def get_connection():

    db_path = Path(DATABASE_PATH)

    db_path.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    connection = sqlite3.connect(
        db_path
    )

    connection.row_factory = sqlite3.Row

    return connection


# =========================================================
# DATABASE INIT
# =========================================================

def init_database():

    connection = get_connection()
    cursor = connection.cursor()

    # =====================================================
    # USERS
    # =====================================================

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            telegram_id INTEGER UNIQUE NOT NULL,
            username TEXT,
            first_name TEXT,
            last_name TEXT,
            full_name TEXT DEFAULT '',
            name_confirmed INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # =====================================================
    # USERS MIGRATION — FULL NAME
    # =====================================================

    cursor.execute("PRAGMA table_info(users)")
    user_columns = {row["name"] for row in cursor.fetchall()}

    if "full_name" not in user_columns:
        cursor.execute("ALTER TABLE users ADD COLUMN full_name TEXT DEFAULT ''")

    if "name_confirmed" not in user_columns:
        cursor.execute("ALTER TABLE users ADD COLUMN name_confirmed INTEGER DEFAULT 0")

    # Eski first_name + last_name ma'lumotlarini bir marta full_name ga o'tkazish.
    cursor.execute("""
        UPDATE users
        SET full_name = TRIM(
            COALESCE(first_name, '') || ' ' || COALESCE(last_name, '')
        )
        WHERE (full_name IS NULL OR TRIM(full_name) = '')
          AND (
              COALESCE(first_name, '') <> ''
              OR COALESCE(last_name, '') <> ''
          )
    """)

    # =====================================================
    # ADMINS
    # =====================================================

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS admins (
            telegram_id INTEGER PRIMARY KEY,
            role TEXT DEFAULT 'admin',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cursor.execute("""
        INSERT OR IGNORE INTO admins (telegram_id, role)
        VALUES (?, 'super_admin')
    """, (ADMIN_ID,))

    # =====================================================
    # PRO USERS
    # =====================================================

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS pro_users (
            telegram_id INTEGER PRIMARY KEY,
            pro_until TIMESTAMP,
            tests_today INTEGER DEFAULT 0,
            test_date TEXT
        )
    """)

    # =====================================================
    # ESKI PRO SETTINGS
    # =====================================================

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS pro_settings (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            price INTEGER DEFAULT 0,
            duration_days INTEGER DEFAULT 30
        )
    """)

    cursor.execute("""
        INSERT OR IGNORE INTO pro_settings (
            id,
            price,
            duration_days
        )
        VALUES (
            1,
            0,
            30
        )
    """)

    # =====================================================
    # PRO PLANS
    # =====================================================

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS pro_plans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            duration_days INTEGER UNIQUE NOT NULL,
            price INTEGER DEFAULT 0,
            active INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # 7 kun
    cursor.execute("""
        INSERT OR IGNORE INTO pro_plans (
            duration_days,
            price,
            active
        )
        VALUES (
            7,
            0,
            1
        )
    """)

    # 30 kun
    cursor.execute("""
        INSERT OR IGNORE INTO pro_plans (
            duration_days,
            price,
            active
        )
        VALUES (
            30,
            0,
            1
        )
    """)

    # 90 kun
    cursor.execute("""
        INSERT OR IGNORE INTO pro_plans (
            duration_days,
            price,
            active
        )
        VALUES (
            90,
            0,
            1
        )
    """)

    # =====================================================
    # PRO PAYMENTS
    # =====================================================

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS pro_payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,

            telegram_id INTEGER NOT NULL,

            amount INTEGER NOT NULL,

            duration_days INTEGER NOT NULL,

            status TEXT DEFAULT 'pending',

            plan_id INTEGER,

            proof_file_id TEXT,

            proof_type TEXT,

            proof_caption TEXT,

            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

            proof_received_at TIMESTAMP,

            approved_at TIMESTAMP,

            approved_by INTEGER
        )
    """)

    # =====================================================
    # ESKI DATABASE MIGRATION
    # =====================================================

    cursor.execute("""
        PRAGMA table_info(pro_payments)
    """)

    columns = [
        row["name"]
        for row in cursor.fetchall()
    ]

    if "plan_id" not in columns:

        cursor.execute("""
            ALTER TABLE pro_payments
            ADD COLUMN plan_id INTEGER
        """)

    if "proof_file_id" not in columns:

        cursor.execute("""
            ALTER TABLE pro_payments
            ADD COLUMN proof_file_id TEXT
        """)

    if "proof_type" not in columns:

        cursor.execute("""
            ALTER TABLE pro_payments
            ADD COLUMN proof_type TEXT
        """)

    if "proof_caption" not in columns:

        cursor.execute("""
            ALTER TABLE pro_payments
            ADD COLUMN proof_caption TEXT
        """)

    if "proof_received_at" not in columns:

        cursor.execute("""
            ALTER TABLE pro_payments
            ADD COLUMN proof_received_at TIMESTAMP
        """)

    # =====================================================
    # PAYMENT CARD
    # =====================================================

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS payment_card (
            id INTEGER PRIMARY KEY CHECK (id = 1),

            card_number TEXT,

            card_holder TEXT,

            bank_name TEXT,

            updated_at TIMESTAMP
                DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cursor.execute("""
        INSERT OR IGNORE INTO payment_card (
            id,
            card_number,
            card_holder,
            bank_name
        )
        VALUES (
            1,
            NULL,
            NULL,
            NULL
        )
    """)

    # =====================================================
    # SAVE
    # =====================================================

    connection.commit()
    connection.close()


# =========================================================
# USERS
# =========================================================

def get_user(telegram_id):

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT *
        FROM users
        WHERE telegram_id = ?
        """,
        (telegram_id,)
    )

    user = cursor.fetchone()

    connection.close()

    return user


def save_user(
    telegram_id,
    username=None,
    first_name="",
    last_name="",
    full_name=None
):
    """
    Foydalanuvchini saqlaydi.
    full_name berilsa — asosiy ism-familiya sifatida saqlanadi.
    Eski kodlar first_name/last_name bilan chaqirsa ham ishlaydi.
    """
    connection = get_connection()
    cursor = connection.cursor()

    if full_name is None:
        full_name = f"{first_name or ''} {last_name or ''}".strip()

    cursor.execute(
        """
        INSERT INTO users (
            telegram_id,
            username,
            first_name,
            last_name,
            full_name
        )
        VALUES (?, ?, ?, ?, ?)

        ON CONFLICT(telegram_id)
        DO UPDATE SET
            username = excluded.username,
            first_name = excluded.first_name,
            last_name = excluded.last_name,
            full_name = CASE
                WHEN excluded.full_name IS NOT NULL
                     AND TRIM(excluded.full_name) <> ''
                THEN excluded.full_name
                ELSE users.full_name
            END
        """,
        (
            telegram_id,
            username,
            first_name or "",
            last_name or "",
            full_name or ""
        )
    )

    connection.commit()
    connection.close()


def get_full_name(telegram_id):
    """Foydalanuvchining yagona saqlangan ism-familiyasini qaytaradi."""
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT full_name
        FROM users
        WHERE telegram_id = ?
        """,
        (telegram_id,)
    )

    row = cursor.fetchone()
    connection.close()

    if not row:
        return ""

    return (row["full_name"] or "").strip()


def is_name_confirmed(telegram_id):
    connection = get_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT name_confirmed FROM users WHERE telegram_id = ?", (telegram_id,))
    row = cursor.fetchone()
    connection.close()
    return bool(row and row["name_confirmed"])


def confirm_full_name(telegram_id, full_name):
    full_name = str(full_name or "").strip()
    if len(full_name) < 2 or len(full_name) > 100 or not any(ch.isalpha() for ch in full_name):
        return False
    connection = get_connection()
    cursor = connection.cursor()
    cursor.execute("""
        UPDATE users SET full_name = ?, name_confirmed = 1 WHERE telegram_id = ?
    """, (full_name, telegram_id))
    changed = cursor.rowcount
    connection.commit()
    connection.close()
    return changed > 0


def set_full_name(telegram_id, full_name):
    """Profil orqali ism-familiyani yangilaydi."""
    full_name = str(full_name or "").strip()

    if len(full_name) < 2 or len(full_name) > 100:
        return False

    connection = get_connection()
    cursor = connection.cursor()

    # Foydalanuvchi hali users jadvalida bo‘lmasa ham ismni saqlaymiz.
    cursor.execute(
        """
        INSERT INTO users (telegram_id, username, first_name, last_name, full_name)
        VALUES (?, '', '', '', ?)
        ON CONFLICT(telegram_id)
        DO UPDATE SET
            full_name = excluded.full_name,
            name_confirmed = 1
        """,
        (telegram_id, full_name)
    )

    connection.commit()
    connection.close()

    return True




# =========================================================
# ADMIN HELPERS
# =========================================================

def is_admin(telegram_id):
    if int(telegram_id) == int(ADMIN_ID):
        return True
    connection = get_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT 1 FROM admins WHERE telegram_id = ?", (telegram_id,))
    row = cursor.fetchone()
    connection.close()
    return row is not None


def get_admins():
    connection = get_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT * FROM admins ORDER BY created_at ASC")
    rows = cursor.fetchall()
    connection.close()
    return rows


def add_admin(telegram_id, role="admin"):
    connection = get_connection()
    cursor = connection.cursor()
    cursor.execute("INSERT OR IGNORE INTO admins (telegram_id, role) VALUES (?, ?)", (int(telegram_id), role))
    changed = cursor.rowcount
    connection.commit()
    connection.close()
    return changed > 0


def remove_admin(telegram_id):
    if int(telegram_id) == int(ADMIN_ID):
        return False
    connection = get_connection()
    cursor = connection.cursor()
    cursor.execute("DELETE FROM admins WHERE telegram_id = ?", (int(telegram_id),))
    changed = cursor.rowcount
    connection.commit()
    connection.close()
    return changed > 0


# =========================================================
# PRO USER
# =========================================================

def set_pro_user(
    telegram_id,
    pro_until
):

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        INSERT INTO pro_users (
            telegram_id,
            pro_until,
            tests_today,
            test_date
        )
        VALUES (
            ?,
            ?,
            0,
            NULL
        )

        ON CONFLICT(telegram_id)
        DO UPDATE SET
            pro_until = excluded.pro_until
        """,
        (
            telegram_id,
            pro_until
        )
    )

    connection.commit()
    connection.close()


def get_pro_user(telegram_id):

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT *
        FROM pro_users
        WHERE telegram_id = ?
        """,
        (telegram_id,)
    )

    pro_user = cursor.fetchone()

    connection.close()

    return pro_user


# =========================================================
# ESKI PRO SETTINGS
# =========================================================

def get_pro_settings():

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT *
        FROM pro_settings
        WHERE id = 1
        """
    )

    settings = cursor.fetchone()

    connection.close()

    return settings


def set_pro_price(price):

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        UPDATE pro_settings
        SET price = ?
        WHERE id = 1
        """,
        (price,)
    )

    connection.commit()
    connection.close()


def set_pro_duration(days):

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        UPDATE pro_settings
        SET duration_days = ?
        WHERE id = 1
        """,
        (days,)
    )

    connection.commit()
    connection.close()


# =========================================================
# PRO PLANS
# =========================================================

def get_pro_plans(
    active_only=True
):

    connection = get_connection()
    cursor = connection.cursor()

    if active_only:

        cursor.execute(
            """
            SELECT *
            FROM pro_plans
            WHERE active = 1
            ORDER BY duration_days ASC
            """
        )

    else:

        cursor.execute(
            """
            SELECT *
            FROM pro_plans
            ORDER BY duration_days ASC
            """
        )

    plans = cursor.fetchall()

    connection.close()

    return plans


def get_pro_plan(plan_id):

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT *
        FROM pro_plans
        WHERE id = ?
        """,
        (plan_id,)
    )

    plan = cursor.fetchone()

    connection.close()

    return plan


def get_pro_plan_by_duration(
    duration_days
):

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT *
        FROM pro_plans
        WHERE duration_days = ?
        """,
        (duration_days,)
    )

    plan = cursor.fetchone()

    connection.close()

    return plan


def set_pro_plan_price(
    plan_id,
    price
):

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        UPDATE pro_plans
        SET price = ?
        WHERE id = ?
        """,
        (
            price,
            plan_id
        )
    )

    changed = cursor.rowcount

    connection.commit()
    connection.close()

    return changed > 0


def set_pro_plan_duration(
    plan_id,
    duration_days
):

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT id
        FROM pro_plans
        WHERE duration_days = ?
        AND id != ?
        """,
        (
            duration_days,
            plan_id
        )
    )

    existing = cursor.fetchone()

    if existing:

        connection.close()

        return False

    cursor.execute(
        """
        UPDATE pro_plans
        SET duration_days = ?
        WHERE id = ?
        """,
        (
            duration_days,
            plan_id
        )
    )

    changed = cursor.rowcount

    connection.commit()
    connection.close()

    return changed > 0


def set_pro_plan_active(
    plan_id,
    active
):

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        UPDATE pro_plans
        SET active = ?
        WHERE id = ?
        """,
        (
            1 if active else 0,
            plan_id
        )
    )

    changed = cursor.rowcount

    connection.commit()
    connection.close()

    return changed > 0


# =========================================================
# PRO PAYMENT
# =========================================================

def create_pro_payment(
    telegram_id,
    amount,
    duration_days,
    plan_id=None
):

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        INSERT INTO pro_payments (
            telegram_id,
            amount,
            duration_days,
            status,
            plan_id
        )
        VALUES (
            ?,
            ?,
            ?,
            'pending',
            ?
        )
        """,
        (
            telegram_id,
            amount,
            duration_days,
            plan_id
        )
    )

    payment_id = cursor.lastrowid

    connection.commit()
    connection.close()

    return payment_id


def get_payment(payment_id):

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT *
        FROM pro_payments
        WHERE id = ?
        """,
        (payment_id,)
    )

    payment = cursor.fetchone()

    connection.close()

    return payment


def get_pending_payments():

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT *
        FROM pro_payments
        WHERE status IN (
            'pending',
            'proof_received'
        )
        ORDER BY id DESC
        """
    )

    payments = cursor.fetchall()

    connection.close()

    return payments


def get_user_pending_payment(
    telegram_id
):

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT *
        FROM pro_payments
        WHERE
            telegram_id = ?
            AND status IN (
                'pending',
                'proof_received'
            )
        ORDER BY id DESC
        LIMIT 1
        """,
        (telegram_id,)
    )

    payment = cursor.fetchone()

    connection.close()

    return payment


# =========================================================
# PAYMENT PROOF
# =========================================================

def save_payment_proof(
    payment_id,
    proof_file_id,
    proof_type,
    proof_caption=None
):

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        UPDATE pro_payments
        SET
            proof_file_id = ?,
            proof_type = ?,
            proof_caption = ?,
            proof_received_at = CURRENT_TIMESTAMP,
            status = 'proof_received'
        WHERE
            id = ?
            AND status = 'pending'
        """,
        (
            proof_file_id,
            proof_type,
            proof_caption,
            payment_id
        )
    )

    changed = cursor.rowcount

    connection.commit()
    connection.close()

    return changed > 0


def has_payment_proof(
    payment_id
):

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT proof_file_id
        FROM pro_payments
        WHERE id = ?
        """,
        (payment_id,)
    )

    result = cursor.fetchone()

    connection.close()

    if not result:
        return False

    return bool(
        result["proof_file_id"]
    )


# =========================================================
# APPROVE PAYMENT
# =========================================================

def approve_payment(
    payment_id,
    admin_id
):

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        UPDATE pro_payments
        SET
            status = 'approved',
            approved_at = CURRENT_TIMESTAMP,
            approved_by = ?
        WHERE
            id = ?
            AND status = 'proof_received'
            AND proof_file_id IS NOT NULL
        """,
        (
            admin_id,
            payment_id
        )
    )

    changed = cursor.rowcount

    connection.commit()
    connection.close()

    return changed > 0


# =========================================================
# REJECT PAYMENT
# =========================================================

def reject_payment(
    payment_id
):

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        UPDATE pro_payments
        SET
            status = 'rejected'
        WHERE
            id = ?
            AND status = 'proof_received'
        """,
        (payment_id,)
    )

    changed = cursor.rowcount

    connection.commit()
    connection.close()

    return changed > 0


# =========================================================
# PAYMENT CARD
# =========================================================

def get_payment_card():

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT *
        FROM payment_card
        WHERE id = 1
        """
    )

    card = cursor.fetchone()

    connection.close()

    return card


def set_payment_card(
    card_number,
    card_holder,
    bank_name
):

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        INSERT INTO payment_card (
            id,
            card_number,
            card_holder,
            bank_name
        )
        VALUES (
            1,
            ?,
            ?,
            ?
        )

        ON CONFLICT(id)
        DO UPDATE SET
            card_number = excluded.card_number,
            card_holder = excluded.card_holder,
            bank_name = excluded.bank_name,
            updated_at = CURRENT_TIMESTAMP
        """,
        (
            card_number,
            card_holder,
            bank_name
        )
    )

    connection.commit()
    connection.close()


def delete_payment_card():

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        UPDATE payment_card
        SET
            card_number = NULL,
            card_holder = NULL,
            bank_name = NULL,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = 1
        """
    )

    connection.commit()
    connection.close()

def cancel_pro_payment(payment_id, telegram_id):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        UPDATE pro_payments
        SET status = 'cancelled'
        WHERE id = ?
          AND telegram_id = ?
          AND status = 'pending'
    """, (payment_id, telegram_id))

    changed = cursor.rowcount

    connection.commit()
    connection.close()

    return changed > 0

# =========================================================
# END
# =========================================================