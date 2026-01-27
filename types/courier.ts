export interface User {
    id: number;
    firstName: string | null;
    lastName: string | null;
    phone: string;
    email: string | null;
    role: string;
    photo?: {
        id?: string;
        url: string;
    };
}

export interface CourierStats {
    id: number;
    username: string | null;
    lastname: string | null;
    totaldeliverymansum: string; // From API it comes as string "279.6000..."
    completedorderscount: string;
    canceledorderscount: string;
    onShift: boolean;
}

export interface CourierShop {
    id: number;
    name: string;
}

export interface CourierOrder {
    id: number;
    createdAt: string;
    status: string;
    isCancelled: boolean;
    paymentMethod: string;
    subtotalPrice: number;
    totalPrice: number;
    deliveryCost: number;
    deliveryCommission: number;
    deliveryRate: number;
    discountAmount: number;
    shop: string | CourierShop;
}

export interface CourierPayoutStats {
    orderCount: number;
    totalDeliveryRate: number;
    totalDeliveryCommissionSum: number;
    totalSubtotalPrice?: number;
}

export interface CourierDetail {
    id: number;
    createdAt: string;
    commission: number;
    rate: number;
    onShift: boolean;
    deliveryType: string;
    payoutDates?: {
        dateFrom: string;
        dateTo: string;
    };
    payoutStats?: CourierPayoutStats;
    user: User;
    orders: CourierOrder[];
    meta?: {
        totalCount: number;
        totalPages: number;
    };
}
