# Запуск бэкенда и фронтенда Double B (Windows PowerShell)
$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "=== Double B: запуск серверов ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Бэкенд:  http://127.0.0.1:8000" -ForegroundColor Yellow
Write-Host "Магазин: http://127.0.0.1:5173  <-- ОТКРЫВАТЬ ЭТОТ АДРЕС" -ForegroundColor Green
Write-Host ""
Write-Host "Окна терминалов откроются отдельно. НЕ ЗАКРЫВАЙТЕ их во время работы!" -ForegroundColor Magenta
Write-Host ""

Start-Process powershell -ArgumentList @(
    "-NoExit", "-Command",
    "cd '$ProjectRoot\thesis_backend'; .\venv\Scripts\activate; python manage.py runserver"
)

Start-Sleep -Seconds 2

Start-Process powershell -ArgumentList @(
    "-NoExit", "-Command",
    "cd '$ProjectRoot\thesis-front'; npm run dev"
)

Write-Host "Готово. Подождите 5 секунд и откройте: http://127.0.0.1:5173" -ForegroundColor Green
