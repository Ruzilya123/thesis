from django.contrib import admin
from django.contrib.auth.models import User

from .models import (
    Address,
    Category,
    DeliveryMethod,
    GrindType,
    LoyaltyAccount,
    LoyaltyLevel,
    LoyaltyTransaction,
    Order,
    OrderItem,
    Payment,
    Product,
    PromoCode,
    RoastLevel,
    UserProfile,
)


class UserProfileInline(admin.StackedInline):
    model = UserProfile
    extra = 0


class UserAdmin(admin.ModelAdmin):
    inlines = [UserProfileInline]
    list_display = ('username', 'email', 'is_staff')


admin.site.unregister(User)
admin.site.register(User, UserAdmin)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'parent')
    search_fields = ('name',)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'price', 'stock', 'is_active')
    list_filter = ('category', 'roast', 'grind', 'is_active')
    search_fields = ('name', 'origin')


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('product', 'quantity', 'price_at_order')


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'status', 'total', 'created_at')
    list_filter = ('status', 'created_at')
    inlines = [OrderItemInline]
    readonly_fields = ('subtotal', 'discount', 'bonus_used', 'delivery_cost', 'total', 'bonus_earned')


admin.site.register(RoastLevel)
admin.site.register(GrindType)
admin.site.register(DeliveryMethod)
admin.site.register(PromoCode)
admin.site.register(LoyaltyLevel)
admin.site.register(Address)
admin.site.register(Payment)
admin.site.register(LoyaltyAccount)
admin.site.register(LoyaltyTransaction)

admin.site.site_header = 'Double B — администрирование'
admin.site.site_title = 'Double B Admin'
