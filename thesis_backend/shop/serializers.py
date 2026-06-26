from decimal import Decimal

from django.contrib.auth.models import User
from rest_framework import serializers

from .models import (
    Address,
    Category,
    DeliveryMethod,
    GrindType,
    LoyaltyAccount,
    LoyaltyTransaction,
    Order,
    OrderItem,
    Product,
    PromoCode,
    RoastLevel,
    UserProfile,
)
from .services import OrderCalculator, get_active_promo, get_earn_percent


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    phone = serializers.CharField(required=False, allow_blank=True)
    full_name = serializers.CharField(required=False, allow_blank=True)
    consent_personal_data = serializers.BooleanField()

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'phone', 'full_name', 'consent_personal_data')

    def validate_consent_personal_data(self, value):
        if not value:
            raise serializers.ValidationError('Необходимо согласие на обработку персональных данных')
        return value

    def create(self, validated_data):
        phone = validated_data.pop('phone', '')
        full_name = validated_data.pop('full_name', '')
        consent = validated_data.pop('consent_personal_data')
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data, password=password)
        UserProfile.objects.create(
            user=user, phone=phone, full_name=full_name, consent_personal_data=consent
        )
        from .models import LoyaltyLevel, LoyaltyAccount
        level = LoyaltyLevel.objects.first()
        LoyaltyAccount.objects.create(user=user, level=level)
        return user


class UserSerializer(serializers.ModelSerializer):
    phone = serializers.CharField(source='profile.phone', required=False, allow_blank=True)
    full_name = serializers.CharField(source='profile.full_name', required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'phone', 'full_name')


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('id', 'name', 'parent')


class RoastLevelSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoastLevel
        fields = ('id', 'name')


class GrindTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = GrindType
        fields = ('id', 'name')


class ProductListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    roast_name = serializers.CharField(source='roast.name', read_only=True)
    grind_name = serializers.CharField(source='grind.name', read_only=True)

    class Meta:
        model = Product
        fields = (
            'id', 'name', 'description', 'flavor_profile', 'origin', 'price', 'stock',
            'weight_grams', 'image_url', 'category', 'category_name', 'roast', 'roast_name',
            'grind', 'grind_name',
        )


class ProductDetailSerializer(ProductListSerializer):
    pass


class DeliveryMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryMethod
        fields = ('id', 'name', 'cost', 'estimated_days')


class PromoValidateSerializer(serializers.Serializer):
    code = serializers.CharField()
    items = serializers.ListField(child=serializers.DictField(), allow_empty=True)
    delivery_cost = serializers.DecimalField(max_digits=8, decimal_places=2, default=0)

    def validate(self, data):
        promo = get_active_promo(data['code'])
        if not promo:
            raise serializers.ValidationError({'code': 'Промокод недействителен'})
        calc = OrderCalculator(data.get('items', []), data.get('delivery_cost', 0), promo)
        result = calc.calculate()
        data['promo'] = promo
        data['discount'] = result['discount']
        data['subtotal'] = result['subtotal']
        return data


class OrderCalculateSerializer(serializers.Serializer):
    items = serializers.ListField(child=serializers.DictField())
    delivery_method_id = serializers.IntegerField()
    promo_code = serializers.CharField(required=False, allow_blank=True, default='')
    use_bonuses = serializers.BooleanField(default=False)

    def validate(self, data):
        delivery = DeliveryMethod.objects.get(pk=data['delivery_method_id'], is_active=True)
        promo = get_active_promo(data.get('promo_code', ''))
        user = self.context.get('user')
        bonus = Decimal('0')
        if data.get('use_bonuses') and user and hasattr(user, 'loyalty'):
            bonus = user.loyalty.balance
        earn = get_earn_percent(user) if user and user.is_authenticated else Decimal('5')
        calc = OrderCalculator(data['items'], delivery.cost, promo, bonus, earn)
        data['calculation'] = calc.calculate()
        data['delivery_method'] = delivery
        return data


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = OrderItem
        fields = ('id', 'product', 'product_name', 'quantity', 'price_at_order')


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    delivery_method_name = serializers.CharField(source='delivery_method.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Order
        fields = (
            'id', 'status', 'status_display', 'recipient_name', 'recipient_phone', 'address_text',
            'payment_method', 'subtotal', 'discount', 'bonus_used', 'delivery_cost', 'total',
            'bonus_earned', 'delivery_method', 'delivery_method_name', 'items', 'created_at',
        )


class OrderCreateSerializer(serializers.Serializer):
    items = serializers.ListField(child=serializers.DictField())
    delivery_method_id = serializers.IntegerField()
    recipient_name = serializers.CharField(max_length=200)
    recipient_phone = serializers.CharField(max_length=20)
    address_text = serializers.CharField(max_length=300)
    payment_method = serializers.CharField(max_length=40, default='card')
    promo_code = serializers.CharField(required=False, allow_blank=True, default='')
    use_bonuses = serializers.BooleanField(default=False)


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ('id', 'city', 'street', 'apartment', 'postal_code', 'is_default')


class LoyaltyTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = LoyaltyTransaction
        fields = ('id', 'amount', 'transaction_type', 'comment', 'created_at', 'order')


class LoyaltyAccountSerializer(serializers.ModelSerializer):
    level_name = serializers.CharField(source='level.name', read_only=True)
    earn_percent = serializers.DecimalField(
        source='level.earn_percent', max_digits=4, decimal_places=2, read_only=True
    )
    transactions = LoyaltyTransactionSerializer(many=True, read_only=True)

    class Meta:
        model = LoyaltyAccount
        fields = ('balance', 'level_name', 'earn_percent', 'transactions')


class AdminOrderStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ('status',)
