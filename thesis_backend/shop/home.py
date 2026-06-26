from django.http import HttpResponse

def home(request):
    html = """
    <!DOCTYPE html>
    <html lang="ru">
    <head><meta charset="utf-8"><title>Double B API</title>
    <style>body{font-family:Segoe UI,sans-serif;max-width:640px;margin:60px auto;padding:0 20px;color:#3d2314}
    h1{color:#3d2314}a{color:#c8956c;font-weight:600}.box{background:#f7f4f0;padding:20px;border-radius:12px;margin:20px 0}
    code{background:#fff;padding:2px 6px;border-radius:4px}</style></head>
    <body>
    <h1>Double B — сервер API</h1>
    <p>Это <strong>бэкенд</strong> (Django). Интерфейс магазина открывается на другом адресе.</p>
    <div class="box">
      <p><strong>Откройте магазин:</strong> <a href="http://localhost:5173">http://localhost:5173</a></p>
      <p>Запуск фронтенда: <code>cd thesis-front</code> → <code>npm run dev</code></p>
    </div>
    <p><a href="/admin/">Django Admin</a> · <a href="/api/products/">API каталога</a></p>
    </body></html>
    """
    return HttpResponse(html)
