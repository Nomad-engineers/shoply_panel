export interface ShopOrder {
    id: number;
    createdAt: string;
    status: string;
    isCancelled: boolean;
    canceledBy: string | null;
    paymentMethod: string;
    subtotalPrice: number;
    totalPrice: number;
    deliveryCost: number;
    dailyOrderNumber: number;
    deliveredAt: string | null;
    commissionService: number;
    deliveryCommission: number;
    deliveryRate: number;
    comment: string;
    discountAmount: number;
    promocodeId: number | null;
    promocode: {
        id: number;
        createdAt: string;
        type: string;
        valueForType: number;
        usageLimit: number | null;
        validUntil: string | null;
        useMultiple: boolean;
        payFromShop: boolean;
        name: string;
        minSum: number;
    } | null;
}

export interface Shop {
    id: number;
    createdAt: string;
    name: string;
    description: string;
    workTimeStart: string;
    workTimeEnd: string;
    supportPhone: string;
    deliveryCost: number;
    commissionService: number;
    freeDeliveryThreshold: number;
    isPublic: boolean;
    telegramChatId: string | null;
    telegramTopicId: number | null;
    orders: ShopOrder[];
    photo: {
        id: string;
        url: string;
        filename_download: string;
    } | null;
}

export interface ShopStats {
    id: number;
    name: string;
    orderCount: number;
    revenue: number;
    serviceIncome: number;
    photoUrl: string | null;
    photo?: any;
}

export interface PromocodeDto {
    promocodeName: string;
    valueForType: number;
}

export interface OrdersStatsDto {
    notCompletedOrdersCount: number;
    completedOrdersCount: number;
    canceledOrdersCount: number;
}

export interface FinansShopDto {
    cashTotal: string;
    sbpTotal: string;
    total: string;
    totalDiscount: string;
}

export interface ShopOrdersResponse {
    orders: ShopOrder[];
    promocodes: PromocodeDto[];
    ordersCount: OrdersStatsDto;
    finansShop: FinansShopDto;
    totalDeliveryPrice?: string;
    shopName?: string;
}
