from decimal import Decimal
from datetime import date

from django.db import transaction
from django.utils import timezone

from .models import (
    LoyaltyAccount,
    LoyaltyTransaction,
    Order,
    OrderItem,
    Payment,
    Product,
    PromoCode,
)


class OrderCalculator:
    """Расчёт стоимости заказа с промокодом и бонусами (лимит 50%)."""

    BONUS_LIMIT_PERCENT = Decimal('50')

    def __init__(self, items, delivery_cost, promo_code=None, bonus_to_use=Decimal('0'), earn_percent=Decimal('5')):
        self.items = items
        self.delivery_cost = Decimal(delivery_cost)
        self.promo_code = promo_code
        self.bonus_to_use = Decimal(bonus_to_use)
        self.earn_percent = Decimal(earn_percent)

    def calculate(self):
        subtotal = Decimal('0')
        for item in self.items:
            subtotal += Decimal(str(item['price'])) * int(item['quantity'])

        discount = self._promo_discount(subtotal)
        after_discount = max(subtotal - discount, Decimal('0'))

        max_bonus = (after_discount * self.BONUS_LIMIT_PERCENT / Decimal('100')).quantize(Decimal('0.01'))
        bonus_used = min(self.bonus_to_use, max_bonus, after_discount)
        after_bonus = after_discount - bonus_used

        total = after_bonus + self.delivery_cost
        bonus_earned = (after_bonus * self.earn_percent / Decimal('100')).quantize(Decimal('0.01'))

        return {
            'subtotal': subtotal.quantize(Decimal('0.01')),
            'discount': discount.quantize(Decimal('0.01')),
            'bonus_used': bonus_used.quantize(Decimal('0.01')),
            'delivery_cost': self.delivery_cost.quantize(Decimal('0.01')),
            'total': total.quantize(Decimal('0.01')),
            'bonus_earned': bonus_earned,
        }

    def _promo_discount(self, subtotal):
        if not self.promo_code or not self.promo_code.is_active:
            return Decimal('0')
        today = date.today()
        if self.promo_code.valid_from and today < self.promo_code.valid_from:
            return Decimal('0')
        if self.promo_code.valid_to and today > self.promo_code.valid_to:
            return Decimal('0')
        if self.promo_code.discount_type == PromoCode.DISCOUNT_PERCENT:
            return (subtotal * self.promo_code.discount_value / Decimal('100')).quantize(Decimal('0.01'))
        return min(self.promo_code.discount_value, subtotal)


def get_active_promo(code):
    if not code:
        return None
    try:
        promo = PromoCode.objects.get(code__iexact=code.strip(), is_active=True)
    except PromoCode.DoesNotExist:
        return None
    today = date.today()
    if promo.valid_from and today < promo.valid_from:
        return None
    if promo.valid_to and today > promo.valid_to:
        return None
    return promo


def get_earn_percent(user):
    account = getattr(user, 'loyalty', None)
    if account and account.level:
        return account.level.earn_percent
    return Decimal('5')


@transaction.atomic
def create_order(user, items_data, delivery_method, recipient_name, recipient_phone,
                 address_text, payment_method, promo_code_str='', use_bonuses=False):
    products = {}
    order_items = []
    for row in items_data:
        product = Product.objects.select_for_update().get(pk=row['product_id'], is_active=True)
        qty = int(row['quantity'])
        if qty <= 0:
            raise ValueError('Количество должно быть больше нуля')
        if product.stock < qty:
            raise ValueError(f'Недостаточно товара «{product.name}» на складе')
        products[product.id] = product
        order_items.append({
            'product': product,
            'quantity': qty,
            'price': product.price,
        })

    promo = get_active_promo(promo_code_str)
    bonus_to_use = Decimal('0')
    if use_bonuses and hasattr(user, 'loyalty'):
        bonus_to_use = user.loyalty.balance

    calc_items = [{'price': i['price'], 'quantity': i['quantity']} for i in order_items]
    calc = OrderCalculator(
        calc_items,
        delivery_method.cost,
        promo,
        bonus_to_use,
        get_earn_percent(user),
    ).calculate()

    if use_bonuses and calc['bonus_used'] > 0:
        account = user.loyalty
        if account.balance < calc['bonus_used']:
            raise ValueError('Недостаточно бонусов')

    order = Order.objects.create(
        user=user,
        delivery_method=delivery_method,
        recipient_name=recipient_name,
        recipient_phone=recipient_phone,
        address_text=address_text,
        payment_method=payment_method,
        promo_code=promo,
        subtotal=calc['subtotal'],
        discount=calc['discount'],
        bonus_used=calc['bonus_used'],
        delivery_cost=calc['delivery_cost'],
        total=calc['total'],
        bonus_earned=calc['bonus_earned'],
    )

    for item in order_items:
        OrderItem.objects.create(
            order=order,
            product=item['product'],
            quantity=item['quantity'],
            price_at_order=item['price'],
        )
        product = products[item['product'].id]
        product.stock -= item['quantity']
        product.save(update_fields=['stock'])

    Payment.objects.create(order=order, amount=order.total, status=Payment.STATUS_PENDING)
    return order


@transaction.atomic
def process_payment(order):
    if order.status != Order.STATUS_NEW:
        raise ValueError('Заказ уже обработан')

    payment = order.payment
    payment.status = Payment.STATUS_SUCCESS
    payment.transaction_id = f'DEMO-{order.id}-{int(timezone.now().timestamp())}'
    payment.save()

    order.status = Order.STATUS_PAID
    order.save(update_fields=['status', 'updated_at'])

    account, _ = LoyaltyAccount.objects.get_or_create(user=order.user)
    if order.bonus_used > 0:
        account.balance -= order.bonus_used
        LoyaltyTransaction.objects.create(
            account=account,
            amount=order.bonus_used,
            transaction_type=LoyaltyTransaction.TYPE_SPEND,
            order=order,
            comment='Списание при оплате заказа',
        )
    if order.bonus_earned > 0:
        account.balance += order.bonus_earned
        LoyaltyTransaction.objects.create(
            account=account,
            amount=order.bonus_earned,
            transaction_type=LoyaltyTransaction.TYPE_EARN,
            order=order,
            comment='Начисление за заказ',
        )
    account.save()
    return payment
