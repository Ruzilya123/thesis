from django.conf import settings
from django.contrib.auth.models import User
from django.db import models


class Category(models.Model):
    name = models.CharField('Название', max_length=120)
    parent = models.ForeignKey(
        'self', null=True, blank=True, on_delete=models.SET_NULL, related_name='children'
    )

    class Meta:
        verbose_name = 'Категория'
        verbose_name_plural = 'Категории'
        ordering = ['name']

    def __str__(self):
        return self.name


class RoastLevel(models.Model):
    name = models.CharField('Степень обжарки', max_length=60)

    class Meta:
        verbose_name = 'Степень обжарки'
        verbose_name_plural = 'Степени обжарки'

    def __str__(self):
        return self.name


class GrindType(models.Model):
    name = models.CharField('Тип помола', max_length=60)

    class Meta:
        verbose_name = 'Тип помола'
        verbose_name_plural = 'Типы помола'

    def __str__(self):
        return self.name


class Product(models.Model):
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='products')
    name = models.CharField('Название', max_length=200)
    description = models.TextField('Описание', blank=True)
    flavor_profile = models.CharField('Вкусовой профиль', max_length=200, blank=True)
    origin = models.CharField('Страна происхождения', max_length=100, blank=True)
    price = models.DecimalField('Цена', max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField('Остаток', default=0)
    roast = models.ForeignKey(
        RoastLevel, null=True, blank=True, on_delete=models.SET_NULL, related_name='products'
    )
    grind = models.ForeignKey(
        GrindType, null=True, blank=True, on_delete=models.SET_NULL, related_name='products'
    )
    weight_grams = models.PositiveIntegerField('Вес упаковки, г', default=250)
    image_url = models.URLField('Изображение', blank=True)
    is_active = models.BooleanField('Активен', default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Товар'
        verbose_name_plural = 'Товары'
        ordering = ['name']

    def __str__(self):
        return self.name


class DeliveryMethod(models.Model):
    name = models.CharField('Способ доставки', max_length=120)
    cost = models.DecimalField('Стоимость', max_digits=8, decimal_places=2, default=0)
    estimated_days = models.PositiveSmallIntegerField('Срок, дней', default=3)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Способ доставки'
        verbose_name_plural = 'Способы доставки'

    def __str__(self):
        return self.name


class PromoCode(models.Model):
    DISCOUNT_PERCENT = 'percent'
    DISCOUNT_FIXED = 'fixed'
    DISCOUNT_TYPES = [
        (DISCOUNT_PERCENT, 'Процент'),
        (DISCOUNT_FIXED, 'Фиксированная сумма'),
    ]

    code = models.CharField('Код', max_length=40, unique=True)
    discount_type = models.CharField(max_length=10, choices=DISCOUNT_TYPES, default=DISCOUNT_PERCENT)
    discount_value = models.DecimalField('Значение скидки', max_digits=8, decimal_places=2)
    valid_from = models.DateField(null=True, blank=True)
    valid_to = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Промокод'
        verbose_name_plural = 'Промокоды'

    def __str__(self):
        return self.code


class LoyaltyLevel(models.Model):
    name = models.CharField('Уровень', max_length=60)
    earn_percent = models.DecimalField('Процент начисления', max_digits=4, decimal_places=2)

    class Meta:
        verbose_name = 'Уровень лояльности'
        verbose_name_plural = 'Уровни лояльности'

    def __str__(self):
        return self.name


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone = models.CharField('Телефон', max_length=20, blank=True)
    full_name = models.CharField('ФИО', max_length=200, blank=True)
    consent_personal_data = models.BooleanField('Согласие на обработку ПДн', default=False)

    class Meta:
        verbose_name = 'Профиль покупателя'
        verbose_name_plural = 'Профили покупателей'

    def __str__(self):
        return self.full_name or self.user.username


class Address(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='addresses')
    city = models.CharField('Город', max_length=100)
    street = models.CharField('Улица', max_length=200)
    apartment = models.CharField('Квартира/офис', max_length=20, blank=True)
    postal_code = models.CharField('Индекс', max_length=10, blank=True)
    is_default = models.BooleanField('По умолчанию', default=False)

    class Meta:
        verbose_name = 'Адрес доставки'
        verbose_name_plural = 'Адреса доставки'

    def __str__(self):
        return f'{self.city}, {self.street}'


class Order(models.Model):
    STATUS_NEW = 'new'
    STATUS_PAID = 'paid'
    STATUS_PROCESSING = 'processing'
    STATUS_SHIPPED = 'shipped'
    STATUS_DELIVERED = 'delivered'
    STATUS_CANCELLED = 'cancelled'
    STATUSES = [
        (STATUS_NEW, 'Новый'),
        (STATUS_PAID, 'Оплачен'),
        (STATUS_PROCESSING, 'В сборке'),
        (STATUS_SHIPPED, 'Отправлен'),
        (STATUS_DELIVERED, 'Доставлен'),
        (STATUS_CANCELLED, 'Отменён'),
    ]

    user = models.ForeignKey(User, on_delete=models.PROTECT, related_name='orders')
    status = models.CharField(max_length=20, choices=STATUSES, default=STATUS_NEW)
    delivery_method = models.ForeignKey(
        DeliveryMethod, on_delete=models.PROTECT, related_name='orders'
    )
    recipient_name = models.CharField('Получатель', max_length=200)
    recipient_phone = models.CharField('Телефон', max_length=20)
    address_text = models.CharField('Адрес доставки', max_length=300)
    payment_method = models.CharField('Способ оплаты', max_length=40, default='card')
    promo_code = models.ForeignKey(
        PromoCode, null=True, blank=True, on_delete=models.SET_NULL, related_name='orders'
    )
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    bonus_used = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    delivery_cost = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    bonus_earned = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Заказ'
        verbose_name_plural = 'Заказы'
        ordering = ['-created_at']

    def __str__(self):
        return f'Заказ #{self.id}'


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField('Количество', default=1)
    price_at_order = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        verbose_name = 'Позиция заказа'
        verbose_name_plural = 'Позиции заказа'

    def __str__(self):
        return f'{self.product.name} x{self.quantity}'


class Payment(models.Model):
    STATUS_PENDING = 'pending'
    STATUS_SUCCESS = 'success'
    STATUS_FAILED = 'failed'
    STATUSES = [
        (STATUS_PENDING, 'Ожидает'),
        (STATUS_SUCCESS, 'Успешно'),
        (STATUS_FAILED, 'Ошибка'),
    ]

    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='payment')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUSES, default=STATUS_PENDING)
    transaction_id = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Платёж'
        verbose_name_plural = 'Платежи'


class LoyaltyAccount(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='loyalty')
    balance = models.DecimalField('Баланс бонусов', max_digits=10, decimal_places=2, default=0)
    level = models.ForeignKey(
        LoyaltyLevel, on_delete=models.PROTECT, related_name='accounts', null=True, blank=True
    )

    class Meta:
        verbose_name = 'Бонусный счёт'
        verbose_name_plural = 'Бонусные счета'


class LoyaltyTransaction(models.Model):
    TYPE_EARN = 'earn'
    TYPE_SPEND = 'spend'
    TYPES = [(TYPE_EARN, 'Начисление'), (TYPE_SPEND, 'Списание')]

    account = models.ForeignKey(LoyaltyAccount, on_delete=models.CASCADE, related_name='transactions')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_type = models.CharField(max_length=10, choices=TYPES)
    order = models.ForeignKey(Order, null=True, blank=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)
    comment = models.CharField(max_length=200, blank=True)

    class Meta:
        verbose_name = 'Транзакция лояльности'
        verbose_name_plural = 'Транзакции лояльности'
        ordering = ['-created_at']
