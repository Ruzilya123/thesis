from decimal import Decimal

from django.contrib.auth.models import User
from django.core.management.base import BaseCommand

from shop.models import (
    Category,
    DeliveryMethod,
    GrindType,
    LoyaltyLevel,
    Product,
    PromoCode,
    RoastLevel,
)


PRODUCTS = [
    {
        'name': 'Эфиопия Сидамо',
        'category': 'Зерновой кофе',
        'roast': 'Светлая',
        'grind': 'В зёрнах',
        'origin': 'Эфиопия',
        'flavor': 'Цитрус, жасмин, чай',
        'price': '890',
        'stock': 45,
        'weight': 250,
        'image': 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400',
    },
    {
        'name': 'Колумбия Супремо',
        'category': 'Зерновой кофе',
        'roast': 'Средняя',
        'grind': 'В зёрнах',
        'origin': 'Колумбия',
        'flavor': 'Карамель, орех, шоколад',
        'price': '950',
        'stock': 38,
        'weight': 250,
        'image': 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400',
    },
    {
        'name': 'Бразилия Сантос',
        'category': 'Зерновой кофе',
        'roast': 'Тёмная',
        'grind': 'В зёрнах',
        'origin': 'Бразилия',
        'flavor': 'Какао, орех, низкая кислотность',
        'price': '780',
        'stock': 52,
        'weight': 250,
        'image': 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
    },
    {
        'name': 'Кения AA',
        'category': 'Зерновой кофе',
        'roast': 'Средняя',
        'grind': 'В зёрнах',
        'origin': 'Кения',
        'flavor': 'Смородина, винные ноты',
        'price': '1020',
        'stock': 30,
        'weight': 250,
        'image': 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400',
    },
    {
        'name': 'Эспрессо-смесь House Blend',
        'category': 'Молотый кофе',
        'roast': 'Средняя',
        'grind': 'Эспрессо',
        'origin': 'Смесь',
        'flavor': 'Шоколад, карамель, орех',
        'price': '820',
        'stock': 40,
        'weight': 250,
        'image': 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400',
    },
    {
        'name': 'Фильтр Guatemala',
        'category': 'Молотый кофе',
        'roast': 'Светлая',
        'grind': 'Фильтр',
        'origin': 'Гватемала',
        'flavor': 'Яблоко, мёд, цветы',
        'price': '870',
        'stock': 35,
        'weight': 250,
        'image': 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400',
    },
    {
        'name': 'Дрип Ethiopia',
        'category': 'Дрип-пакеты',
        'roast': 'Светлая',
        'grind': 'Фильтр',
        'origin': 'Эфиопия',
        'flavor': 'Бергамот, персик',
        'price': '450',
        'stock': 80,
        'weight': 120,
        'image': 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400',
    },
    {
        'name': 'Капсулы Ristretto',
        'category': 'Капсулы',
        'roast': 'Тёмная',
        'grind': 'Эспрессо',
        'origin': 'Смесь',
        'flavor': 'Плотное тело, какао',
        'price': '590',
        'stock': 60,
        'weight': 50,
        'image': 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400',
    },
    {
        'name': 'Подарочный набор Barista',
        'category': 'Подарочные наборы',
        'roast': 'Средняя',
        'grind': 'В зёрнах',
        'origin': 'Смесь',
        'flavor': '3 сорта зерна + пуровер',
        'price': '3200',
        'stock': 15,
        'weight': 750,
        'image': 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400',
    },
    {
        'name': 'Пуровер V60',
        'category': 'Аксессуары',
        'roast': None,
        'grind': None,
        'origin': '',
        'flavor': 'Керамический пуровер для фильтр-кофе',
        'price': '2100',
        'stock': 25,
        'weight': 350,
        'image': 'https://images.unsplash.com/photo-1498804103079-a6351b050096?w=400',
    },
    {
        'name': 'Кофемолка ручная',
        'category': 'Аксессуары',
        'roast': None,
        'grind': None,
        'origin': '',
        'flavor': 'Стальные жернова, регулировка помола',
        'price': '4500',
        'stock': 12,
        'weight': 600,
        'image': 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=400',
    },
    {
        'name': 'Футболка Double B',
        'category': 'Мерч',
        'roast': None,
        'grind': None,
        'origin': '',
        'flavor': 'Хлопок, логотип бренда',
        'price': '1900',
        'stock': 40,
        'weight': 200,
        'image': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
    },
]


class Command(BaseCommand):
    help = 'Заполнение БД тестовыми данными Double B'

    def handle(self, *args, **options):
        self.stdout.write('Создание справочников...')

        for name in ['Светлая', 'Средняя', 'Тёмная']:
            RoastLevel.objects.get_or_create(name=name)

        for name in ['В зёрнах', 'Эспрессо', 'Фильтр']:
            GrindType.objects.get_or_create(name=name)

        categories = [
            'Зерновой кофе', 'Молотый кофе', 'Дрип-пакеты', 'Капсулы',
            'Подарочные наборы', 'Аксессуары', 'Мерч',
        ]
        cat_map = {}
        for name in categories:
            cat, _ = Category.objects.get_or_create(name=name)
            cat_map[name] = cat

        LoyaltyLevel.objects.get_or_create(name='Бронза', defaults={'earn_percent': Decimal('3')})
        LoyaltyLevel.objects.get_or_create(name='Серебро', defaults={'earn_percent': Decimal('5')})
        LoyaltyLevel.objects.get_or_create(name='Золото', defaults={'earn_percent': Decimal('7')})

        DeliveryMethod.objects.get_or_create(
            name='Курьер', defaults={'cost': Decimal('350'), 'estimated_days': 2}
        )
        DeliveryMethod.objects.get_or_create(
            name='Пункт выдачи', defaults={'cost': Decimal('200'), 'estimated_days': 3}
        )
        DeliveryMethod.objects.get_or_create(
            name='Самовывоз из кофейни', defaults={'cost': Decimal('0'), 'estimated_days': 1}
        )

        PromoCode.objects.get_or_create(
            code='DOUBLEB10',
            defaults={
                'discount_type': PromoCode.DISCOUNT_PERCENT,
                'discount_value': Decimal('10'),
                'is_active': True,
            },
        )
        PromoCode.objects.get_or_create(
            code='COFFEE500',
            defaults={
                'discount_type': PromoCode.DISCOUNT_FIXED,
                'discount_value': Decimal('500'),
                'is_active': True,
            },
        )

        for row in PRODUCTS:
            roast = RoastLevel.objects.filter(name=row['roast']).first() if row['roast'] else None
            grind = GrindType.objects.filter(name=row['grind']).first() if row['grind'] else None
            Product.objects.update_or_create(
                name=row['name'],
                defaults={
                    'category': cat_map[row['category']],
                    'description': f"Спешелти-кофе от Double B. {row['flavor']}",
                    'flavor_profile': row['flavor'],
                    'origin': row['origin'],
                    'price': Decimal(row['price']),
                    'stock': row['stock'],
                    'roast': roast,
                    'grind': grind,
                    'weight_grams': row['weight'],
                    'image_url': row['image'],
                    'is_active': True,
                },
            )

        if not User.objects.filter(username='admin').exists():
            admin = User.objects.create_superuser(
                username='admin', email='admin@double-b.ru', password='admin123'
            )
            from shop.models import LoyaltyAccount
            LoyaltyAccount.objects.get_or_create(
                user=admin, defaults={'level': LoyaltyLevel.objects.first()}
            )
            self.stdout.write(self.style.SUCCESS('Админ: admin / admin123'))

        if not User.objects.filter(username='demo').exists():
            demo = User.objects.create_user(
                username='demo', email='demo@double-b.ru', password='demo123'
            )
            from shop.models import LoyaltyAccount, UserProfile
            UserProfile.objects.create(
                user=demo, phone='+79001234567', full_name='Иван Петров', consent_personal_data=True
            )
            LoyaltyAccount.objects.create(
                user=demo, balance=Decimal('1500'), level=LoyaltyLevel.objects.get(name='Серебро')
            )
            self.stdout.write(self.style.SUCCESS('Демо-покупатель: demo / demo123 (1500 бонусов)'))

        self.stdout.write(self.style.SUCCESS('Данные успешно загружены!'))
