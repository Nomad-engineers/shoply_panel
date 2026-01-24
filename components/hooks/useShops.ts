import { useState, useEffect } from "react";
import { useAuth } from "./useLogin";
import { Shop, ShopStats } from "@/types/shop";

interface FetchShopsParams {
    periodType?: "day" | "week" | "month" | "halfYear" | "year" | "period";
    dateFrom?: string;
    dateTo?: string;
    isPublic?: string;
    skip?: boolean;
}

export const useShops = (initialParams?: FetchShopsParams) => {
    const { refreshSession, fetchWithSession } = useAuth(
        process.env.NEXT_PUBLIC_DIRECTUS_URL
    );
    const [shops, setShops] = useState<Shop[]>([]);
    const [shopsStats, setShopsStats] = useState<ShopStats[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const calculateShopStats = (shopsData: Shop[]): ShopStats[] => {
        return shopsData.map((shop) => {
            // Filter only completed and non-cancelled orders
            const orders = shop.orders || [];
            const validOrders = orders.filter(
                (order) => order.status === "completed" && !order.isCancelled
            );

            const orderCount = validOrders.length;
            const revenue = validOrders.reduce(
                (sum, order) => sum + (Number(order.subtotalPrice) || 0),
                0
            );
            const serviceIncome = validOrders.reduce(
                (sum, order) => sum + (Number(order.commissionService) || 0),
                0
            );

            return {
                id: shop.id,
                name: shop.name,
                orderCount,
                revenue,
                serviceIncome,
                photoUrl: shop.photo?.url || null,
            };
        });
    };

    const fetchShopsData = async (params?: FetchShopsParams) => {
        if (params?.skip || (params === undefined && initialParams?.skip)) return;
        setLoading(true);
        setError(null);

        try {
            let url = `${process.env.NEXT_PUBLIC_API_URL}/admin/shops`;

            // Add query parameters if provided
            const queryParams = new URLSearchParams();
            if (params?.periodType) {
                queryParams.append("periodType", params.periodType);
            }
            if (params?.dateFrom) {
                queryParams.append("dateFrom", params.dateFrom);
            }
            if (params?.dateTo) {
                queryParams.append("dateTo", params.dateTo);
            }
            if (params?.isPublic) {
                queryParams.append("isPublic", params.isPublic);
            }

            const queryString = queryParams.toString();
            if (queryString) {
                url += `?${queryString}`;
            }

            const res = await fetchWithSession(
                url,
                () => localStorage.getItem("access_token"),
                refreshSession
            );
            if (!res.ok) throw new Error("Ошибка при получении магазинов");
            const response = await res.json();
            const shopsData = response.data || [];
            setShops(shopsData);
            setShopsStats(calculateShopStats(shopsData));
        } catch (e: any) {
            setError(e.message);
            setShops([]);
            setShopsStats([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (initialParams?.skip) return;
        fetchShopsData(initialParams);
    }, [initialParams?.skip]);

    return { shops, shopsStats, loading, error, refetch: fetchShopsData };
};
