from decimal import Decimal

from django.contrib.auth.models import User
from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import (
    Address,
    Category,
    DeliveryMethod,
    GrindType,
    Order,
    Product,
    RoastLevel,
)
from .serializers import (
    AddressSerializer,
    AdminOrderStatusSerializer,
    CategorySerializer,
    DeliveryMethodSerializer,
    GrindTypeSerializer,
    LoyaltyAccountSerializer,
    OrderCalculateSerializer,
    OrderCreateSerializer,
    OrderSerializer,
    ProductDetailSerializer,
    ProductListSerializer,
    PromoValidateSerializer,
    RegisterSerializer,
    RoastLevelSerializer,
    UserSerializer,
)
from .services import create_order, process_payment


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None


class RoastLevelListView(generics.ListAPIView):
    queryset = RoastLevel.objects.all()
    serializer_class = RoastLevelSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None


class GrindTypeListView(generics.ListAPIView):
    queryset = GrindType.objects.all()
    serializer_class = GrindTypeSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Product.objects.filter(is_active=True).select_related('category', 'roast', 'grind')
    permission_classes = [permissions.AllowAny]

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProductDetailSerializer
        return ProductListSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        category = self.request.query_params.get('category')
        roast = self.request.query_params.get('roast')
        grind = self.request.query_params.get('grind')
        search = self.request.query_params.get('search')
        if category:
            qs = qs.filter(category_id=category)
        if roast:
            qs = qs.filter(roast_id=roast)
        if grind:
            qs = qs.filter(grind_id=grind)
        if search:
            qs = qs.filter(name__icontains=search)
        return qs


class DeliveryMethodListView(generics.ListAPIView):
    queryset = DeliveryMethod.objects.filter(is_active=True)
    serializer_class = DeliveryMethodSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None


class PromoValidateView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PromoValidateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        promo = serializer.validated_data['promo']
        return Response({
            'code': promo.code,
            'discount_type': promo.discount_type,
            'discount_value': promo.discount_value,
            'discount': serializer.validated_data['discount'],
            'subtotal': serializer.validated_data['subtotal'],
        })


class OrderCalculateView(APIView):
    def post(self, request):
        serializer = OrderCalculateSerializer(data=request.data, context={'user': request.user})
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data['calculation'])


class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    http_method_names = ['get', 'post', 'head', 'options']

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related('items__product')

    def get_serializer_class(self):
        if self.action == 'create':
            return OrderCreateSerializer
        return OrderSerializer

    def create(self, request, *args, **kwargs):
        serializer = OrderCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        try:
            delivery = DeliveryMethod.objects.get(pk=data['delivery_method_id'], is_active=True)
            order = create_order(
                user=request.user,
                items_data=data['items'],
                delivery_method=delivery,
                recipient_name=data['recipient_name'],
                recipient_phone=data['recipient_phone'],
                address_text=data['address_text'],
                payment_method=data['payment_method'],
                promo_code_str=data.get('promo_code', ''),
                use_bonuses=data.get('use_bonuses', False),
            )
        except (DeliveryMethod.DoesNotExist, Product.DoesNotExist):
            return Response({'detail': 'Некорректные данные заказа'}, status=status.HTTP_400_BAD_REQUEST)
        except ValueError as exc:
            return Response({'detail': str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def pay(self, request, pk=None):
        order = self.get_object()
        try:
            payment = process_payment(order)
        except ValueError as exc:
            return Response({'detail': str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        return Response({
            'order': OrderSerializer(order).data,
            'payment_status': payment.status,
            'transaction_id': payment.transaction_id,
        })


class LoyaltyView(generics.RetrieveAPIView):
    serializer_class = LoyaltyAccountSerializer

    def get_object(self):
        return self.request.user.loyalty


class AddressViewSet(viewsets.ModelViewSet):
    serializer_class = AddressSerializer

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class AdminOrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all().select_related('user', 'delivery_method').prefetch_related('items__product')
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAdminUser]
    http_method_names = ['get', 'patch', 'head', 'options']

    def get_serializer_class(self):
        if self.action in ('partial_update', 'update'):
            return AdminOrderStatusSerializer
        return OrderSerializer

    @action(detail=False, methods=['get'])
    def stats(self, request):
        orders = Order.objects.filter(status=Order.STATUS_PAID)
        total_revenue = sum(o.total for o in orders) or Decimal('0')
        return Response({
            'orders_count': orders.count(),
            'total_revenue': total_revenue,
            'products_count': Product.objects.filter(is_active=True).count(),
        })
