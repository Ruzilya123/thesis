# Развёртывание интернет-магазина Double B

Стек: **React + Django REST Framework + PostgreSQL + JWT + Docker**

## Быстрый старт (Docker)

```bash
cd project
docker compose up --build -d
```

После запуска:
- Магазин: http://localhost:3000
- API: http://localhost:8000/api/
- Django Admin: http://localhost:8000/admin/

**Учётные записи (создаются автоматически):**
| Роль | Логин | Пароль |
|------|-------|--------|
| Администратор | admin | admin123 |
| Покупатель (демо) | demo | demo123 |

**Промокоды:** `DOUBLEB10` (10%), `COFFEE500` (500 ₽)

---

## Локальная разработка (без Docker)

### 1. Бэкенд

```bash
cd thesis_backend
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_data
python manage.py runserver
```

API: http://localhost:8000/api/

### 2. Фронтенд

```bash
cd thesis-front
npm install
copy .env.example .env
npm run dev
```

Магазин: http://localhost:5173

---

## Создание базы данных PostgreSQL с нуля

### Вариант A — через Docker (рекомендуется для стенда)

1. Установите [Docker Desktop](https://www.docker.com/products/docker-desktop/).
2. В папке `project` выполните:
   ```bash
   docker compose up db -d
   ```
3. PostgreSQL поднимется с параметрами:
   - База: `doubleb_shop`
   - Пользователь: `doubleb`
   - Пароль: `doubleb_secret`
   - Порт: `5432`
4. Запустите бэкенд с переменными окружения (см. `thesis_backend/.env.example`):
   ```bash
   set DB_ENGINE=postgresql
   set DB_NAME=doubleb_shop
   set DB_USER=doubleb
   set DB_PASSWORD=doubleb_secret
   set DB_HOST=localhost
   set DB_PORT=5432
   python manage.py migrate
   python manage.py seed_data
   ```

### Вариант B — установка PostgreSQL на Windows

1. Скачайте PostgreSQL 16 с https://www.postgresql.org/download/windows/
2. Установите, запомните пароль суперпользователя `postgres`.
3. Откройте **pgAdmin** или **psql** и выполните:

```sql
-- Шаг 1: создать пользователя
CREATE USER doubleb WITH PASSWORD 'doubleb_secret';

-- Шаг 2: создать базу данных
CREATE DATABASE doubleb_shop OWNER doubleb ENCODING 'UTF8';

-- Шаг 3: выдать права
GRANT ALL PRIVILEGES ON DATABASE doubleb_shop TO doubleb;
```

4. Подключитесь к базе `doubleb_shop` и выполните:

```sql
GRANT ALL ON SCHEMA public TO doubleb;
```

5. Создайте файл `thesis_backend/.env`:

```
SECRET_KEY=your-secret-key
DEBUG=True
DB_ENGINE=postgresql
DB_NAME=doubleb_shop
DB_USER=doubleb
DB_PASSWORD=doubleb_secret
DB_HOST=localhost
DB_PORT=5432
```

6. Примените миграции Django (Django создаст все таблицы автоматически):

```bash
cd thesis_backend
venv\Scripts\activate
python manage.py migrate
python manage.py seed_data
```

### Вариант C — SQLite (только для разработки)

Если PostgreSQL не нужен, просто запустите без `DB_ENGINE=postgresql` — Django использует файл `db.sqlite3`.

---

## Структура БД (основные таблицы)

| Таблица | Назначение |
|---------|------------|
| auth_user | Покупатели и администраторы |
| shop_userprofile | Телефон, ФИО, согласие на ПДн |
| shop_category | Категории каталога |
| shop_product | Товары (цена, остаток, обжарка, помол) |
| shop_order | Заказы |
| shop_orderitem | Позиции заказа |
| shop_payment | Платежи |
| shop_loyaltyaccount | Бонусные счета |
| shop_loyaltytransaction | История бонусов |
| shop_promocode | Промокоды |
| shop_deliverymethod | Способы доставки |

---

## Развёртывание на стенде (учебный сервер)

1. Скопируйте папку `project` на сервер.
2. Установите Docker и Docker Compose.
3. Отредактируйте `docker-compose.yml`:
   - Замените `SECRET_KEY` на случайную строку.
   - Обновите `CORS_ALLOWED_ORIGINS` на URL стенда.
   - В `frontend.build.args.VITE_API_URL` укажите публичный URL API.
4. Запустите: `docker compose up --build -d`
5. Проверьте: `docker compose ps` — все 3 сервиса должны быть `running`.

### Резервное копирование БД

```bash
docker exec doubleb_db pg_dump -U doubleb doubleb_shop > backup.sql
```

### Восстановление

```bash
docker exec -i doubleb_db psql -U doubleb doubleb_shop < backup.sql
```

---

## API-эндпоинты

| Метод | URL | Описание |
|-------|-----|----------|
| POST | /api/auth/register/ | Регистрация |
| POST | /api/auth/login/ | JWT-авторизация |
| GET | /api/products/ | Каталог (фильтры: category, roast, grind, search) |
| POST | /api/orders/calculate/ | Расчёт суммы |
| POST | /api/orders/ | Создание заказа |
| POST | /api/orders/{id}/pay/ | Оплата (демо) |
| GET | /api/admin/orders/ | Заказы (только admin) |

---

## Функциональность (по дипломной работе)

- Каталог с фильтрами по категории, обжарке и помолу
- Корзина, промокоды, бонусы (лимит списания 50%)
- Оформление заказа с выбором доставки
- Демо-оплата (имитация ЮKassa)
- Личный кабинет с историей заказов и бонусами
- Админ-панель для обработки заказов
- Django Admin для управления каталогом
