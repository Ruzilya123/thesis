import os

PRODUCTS = [
    ('ethiopia', 'Эфиопия', '#8B4513', '#D2691E'),
    ('kenya', 'Кения', '#2F4F4F', '#CD853F'),
    ('colombia', 'Колумбия', '#556B2F', '#BC8F8F'),
    ('brazil', 'Бразилия', '#654321', '#A0522D'),
    ('guatemala', 'Гватемала', '#4A3728', '#C4A882'),
    ('peru', 'Перу', '#3D2B1F', '#B8860B'),
    ('house-blend', 'House Blend', '#1a3a5c', '#c75b12'),
    ('guatemala-filter', 'Guatemala Filter', '#556B2F', '#DEB887'),
    ('drip-ethiopia', 'Drip Ethiopia', '#6B4226', '#F4A460'),
    ('drip-assorti', 'Дрип Ассорти', '#1a3a5c', '#e8a045'),
    ('capsules', 'Капсулы', '#333333', '#888888'),
    ('gift-set', 'Подарочный набор', '#1a3a5c', '#c75b12'),
    ('v60', 'V60', '#ffffff', '#1a3a5c'),
    ('grinder', 'Кофемолка', '#555555', '#aaaaaa'),
    ('tshirt', 'Мерч', '#1a3a5c', '#ffffff'),
]

ROOT = os.path.join(os.path.dirname(__file__), '..', 'thesis-front', 'public', 'images', 'products')
os.makedirs(ROOT, exist_ok=True)

for slug, label, c1, c2 in PRODUCTS:
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="{c1}"/>
      <stop offset="100%" stop-color="{c2}"/>
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="#f0f2f5"/>
  <rect x="110" y="60" width="180" height="280" rx="12" fill="url(#g)" stroke="#dddddd" stroke-width="2"/>
  <rect x="125" y="80" width="150" height="70" rx="6" fill="rgba(255,255,255,0.25)"/>
  <text x="200" y="125" text-anchor="middle" fill="#ffffff" font-family="Segoe UI,Arial,sans-serif" font-size="18" font-weight="700">Double B</text>
  <text x="200" y="200" text-anchor="middle" fill="#ffffff" font-family="Segoe UI,Arial,sans-serif" font-size="16" font-weight="600">{label}</text>
  <ellipse cx="200" cy="340" rx="90" ry="12" fill="rgba(0,0,0,0.08)"/>
</svg>"""
    path = os.path.join(ROOT, f'{slug}.svg')
    with open(path, 'w', encoding='utf-8') as f:
        f.write(svg)

print(f'Created {len(PRODUCTS)} images in {ROOT}')
