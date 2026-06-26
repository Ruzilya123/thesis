FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends libpq-dev gcc postgresql-client \
    && rm -rf /var/lib/apt/lists/*

COPY thesis_backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY thesis_backend/ .

EXPOSE 8000

CMD ["gunicorn", "thesis_backend.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "2"]
