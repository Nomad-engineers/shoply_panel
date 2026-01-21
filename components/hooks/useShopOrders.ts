import { useState, useEffect } from "react";
import { useAuth } from "./useLogin";
import { ShopOrdersResponse } from "@/types/shop";

interface FetchShopOrdersParams {
    id: number;
    periodType?: "day" | "week" | "month" | "halfYear" | "year" | "period";
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    pageSize?: number;
    isPublic?: boolean;
}

export const useShopOrders = (initialParams: FetchShopOrdersParams) => {
    const { refreshSession, fetchWithSession } = useAuth(
        process.env.NEXT_PUBLIC_DIRECTUS_URL
    );
    const [data, setData] = useState<ShopOrdersResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchOrdersData = async (params: FetchShopOrdersParams) => {
        setLoading(true);
        setError(null);

        try {
            let url = `${process.env.NEXT_PUBLIC_API_URL}/admin/shop/${params.id}/orders`;

            const queryParams = new URLSearchParams();
            if (params.periodType) {
                queryParams.append("periodType", params.periodType);
            }
            if (params.dateFrom) {
                queryParams.append("dateFrom", params.dateFrom);
            }
            if (params.dateTo) {
                queryParams.append("dateTo", params.dateTo);
            }
            if (params.page !== undefined) {
                queryParams.append("page", params.page.toString());
            }
            if (params.pageSize !== undefined) {
                queryParams.append("pageSize", params.pageSize.toString());
            }
            if (params.isPublic !== undefined) {
                queryParams.append("isPublic", params.isPublic.toString());
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
            if (!res.ok) throw new Error("Ошибка при получении заказов магазина");
            const response = await res.json();
            setData(response.data);
        } catch (e: any) {
            setError(e.message);
            setData(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrdersData(initialParams);
    }, [initialParams.id]);

    return { data, loading, error, refetch: fetchOrdersData };
};
