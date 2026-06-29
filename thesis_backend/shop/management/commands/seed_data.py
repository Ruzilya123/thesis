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

IMG = '/images/products'

PRODUCTS = [
    {
        'name': 'Эфиопия Иргачеффе',
        'category': 'Зерновой кофе',
        'roast': 'Светлая',
        'grind': 'В зёрнах',
        'origin': 'Эфиопия',
        'flavor': 'Жасмин, цитрус, мёд',
        'price': '890',
        'stock': 45,
        'weight': 250,
        'image': f'{IMG}/ethiopia.svg',
    },
    {
        'name': 'Кения Ньери',
        'category': 'Зерновой кофе',
        'roast': 'Светлая',
        'grind': 'В зёрнах',
        'origin': 'Кения',
        'flavor': 'Смородина, винные ноты',
        'price': '940',
        'stock': 38,
        'weight': 250,
        'image': f'{IMG}/kenya.svg',
    },
    {
        'name': 'Колумбия Уила',
        'category': 'Зерновой кофе',
        'roast': 'Средняя',
        'grind': 'В зёрнах',
        'origin': 'Колумбия',
        'flavor': 'Карамель, орех, шоколад',
        'price': '820',
        'stock': 40,
        'weight': 250,
        'image': f'{IMG}/colombia.svg',
    },
    {
        'name': 'Бразилия Сантос',
        'category': 'Зерновой кофе',
        'roast': 'Тёмная',
        'grind': 'В зёрнах',
        'origin': 'Бразилия',
        'flavor': 'Какао, орех, низкая кислотность',
        'price': '760',
        'stock': 52,
        'weight': 250,
        'image': f'{IMG}/brazil.svg',
    },
    {
        'name': 'Гватемала Антигуа',
        'category': 'Зерновой кофе',
        'roast': 'Средняя',
        'grind': 'В зёрнах',
        'origin': 'Гватемала',
        'flavor': 'Яблоко, мёд, цветы',
        'price': '880',
        'stock': 35,
        'weight': 250,
        'image': f'{IMG}/guatemala.svg',
    },
    {
        'name': 'Перу Чанчамайо',
        'category': 'Зерновой кофе',
        'roast': 'Средняя',
        'grind': 'В зёрнах',
        'origin': 'Перу',
        'flavor': 'Орех, какао, сливки',
        'price': '800',
        'stock': 30,
        'weight': 250,
        'image': f'{IMG}/peru.svg',
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
        'image': f'{IMG}/house-blend.svg',
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
        'image': f'{IMG}/guatemala-filter.svg',
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
        'image': f'{IMG}/drip-ethiopia.svg',
    },
    {
        'name': 'Дрип-набор «Ассорти»',
        'category': 'Дрип-пакеты',
        'roast': 'Средняя',
        'grind': 'Фильтр',
        'origin': 'Смесь',
        'flavor': '5 сортов в одном наборе',
        'price': '650',
        'stock': 50,
        'weight': 300,
        'image': f'{IMG}/drip-assorti.svg',
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
        'image': f'{IMG}/capsules.svg',
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
        'image': f'{IMG}/gift-set.svg',
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
        'image': f'{IMG}/v60.svg',
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
        'image': f'{IMG}/grinder.svg',
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
        'image': f'{IMG}/tshirt.svg',
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

        PromoCode.objects.update_or_create(
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

        Product.objects.exclude(name__in=[p['name'] for p in PRODUCTS]).update(is_active=False)

        if not User.objects.filter(username='admin').exists():
            admin = User.objects.create_superuser(
                username='admin', email='admin@double-b.ru', password='admin123'
            )
            from shop.models import LoyaltyAccount
            LoyaltyAccount.objects.get_or_create(
                user=admin, defaults={'level': LoyaltyLevel.objects.first()}
            )
            self.stdout.write(self.style.SUCCESS('Админ: admin / admin123'))

        silver = LoyaltyLevel.objects.get(name='Серебро')
        demo_user = User.objects.filter(username='demo').first()
        if not demo_user:
            demo_user = User.objects.create_user(
                username='demo', email='demo@double-b.ru', password='demo123'
            )
            from shop.models import LoyaltyAccount, UserProfile
            UserProfile.objects.create(
                user=demo_user, phone='+79001234567', full_name='Иван Петров', consent_personal_data=True
            )
            LoyaltyAccount.objects.create(
                user=demo_user, balance=Decimal('1500'), level=silver
            )
            self.stdout.write(self.style.SUCCESS('Демо-покупатель: demo / demo123 (1500 бонусов)'))
        else:
            from shop.models import LoyaltyAccount, UserProfile
            UserProfile.objects.update_or_create(
                user=demo_user,
                defaults={'phone': '+79001234567', 'full_name': 'Иван Петров', 'consent_personal_data': True},
            )
            LoyaltyAccount.objects.update_or_create(
                user=demo_user,
                defaults={'balance': Decimal('1500'), 'level': silver},
            )

        self.stdout.write(self.style.SUCCESS('Данные успешно загружены!'))
