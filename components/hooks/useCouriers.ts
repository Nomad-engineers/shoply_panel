"use client";

import { useState, useEffect, useCallback } from "react";
import { CourierStats } from "@/types/courier";
import { useAuth } from "./useLogin";

interface UseCouriersProps {
    page?: number;
    pageSize?: number;
    search?: string;
    activeOnly?: boolean;
    dateFrom?: string;
    dateTo?: string;
    periodType?: string;
}

export const useCouriers = (initialProps: UseCouriersProps = {}) => {
    const [data, setData] = useState<CourierStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { fetchWithSession, refreshSession } = useAuth(
        process.env.NEXT_PUBLIC_DIRECTUS_URL,
    );
    const [meta, setMeta] = useState({ totalCount: 0, totalPages: 0 });

    const fetchCouriers = useCallback(
        async (props: UseCouriersProps = {}) => {
            setLoading(true);
            setError(null);
            try {
                const queryParams = new URLSearchParams();
                queryParams.set("page", String(props.page || 1));
                queryParams.set("pageSize", String(props.pageSize || 20));
                queryParams.set("relations", "orders,user");

                // Note: /admin/delivery/list does not support date filtering params, 
                // so we won't send dateFrom/dateTo/periodType to the backend.
                // We will filter orders on the client side instead.

                const url = `${process.env.NEXT_PUBLIC_API_URL}/admin/delivery/list?${queryParams.toString()}`;

                const res = await fetchWithSession(
                    url,
                    () => localStorage.getItem("access_token"),
                    refreshSession,
                );

                if (!res.ok) {
                    throw new Error(`Failed to fetch couriers: ${res.statusText}`);
                }

                const json = await res.json();
                const rawUsers = (json.data || json) as any[];

                // Helper to check if date is in range
                const isInRange = (dateStr: string) => {
                    if (!props.dateFrom && !props.dateTo) return true;
                    const d = new Date(dateStr).getTime();
                    const from = props.dateFrom ? new Date(props.dateFrom).getTime() : 0;
                    // If dateTo is provided, use it; otherwise, if it's a specific day (like 'day' period), 
                    // effective end is start of next day or just check logic. 
                    // However, `dateTo` is usually passed for range. 
                    // For single 'dateFrom' (like 'month' start), logic depends on how app uses it.
                    // Let's assume standard inclusive check if param exists.

                    if (props.dateFrom && d < from) return false;

                    if (props.dateTo) {
                        const to = new Date(props.dateTo).getTime();
                        // Usually dateTo is inclusive or end of day. 
                        // To be safe, let's assume strict comparison if provided.
                        if (d > to) return false;
                    }

                    return true;
                };

                // Filter orders first, then map stats
                const couriers: CourierStats[] = rawUsers.map((user) => {
                    const allOrders = (user.orders || []) as any[];
                    // Filter orders by date range if provided
                    const orders = allOrders.filter(o => isInRange(o.createdAt));

                    const completedOrders = orders.filter((o: any) => o.status === 'completed');
                    const canceledOrders = orders.filter((o: any) => o.isCancelled || o.status === 'canceled');

                    const totalEarnings = completedOrders.reduce((sum: number, order: any) => {
                        return sum + (Number(order.deliveryRate) || 0);
                    }, 0);

                    return {
                        id: user.id,
                        username: user.user?.firstName || user.firstName,
                        lastname: user.user?.lastName || user.lastName,
                        totaldeliverymansum: String(totalEarnings), // This is now period-specific earnings
                        completedorderscount: String(completedOrders.length), // Period-specific count
                        canceledorderscount: String(canceledOrders.length), // Period-specific count
                        onShift: !!user.onShift,
                    };
                });

                setData(couriers);

                if (json.meta) {
                    setMeta({
                        totalCount: json.meta.totalCount || json.meta.total || 0,
                        totalPages: json.meta.totalPages || json.meta.pages || 0,
                    });
                }
            } catch (err: any) {
                setError(err.message || "Something went wrong");
            } finally {
                setLoading(false);
            }
        },
        [fetchWithSession, refreshSession],
    );

    useEffect(() => {
        fetchCouriers(initialProps);
    }, [initialProps.dateFrom, initialProps.dateTo, initialProps.periodType, initialProps.page]);

    return { couriers: data, meta, loading, error, refetch: fetchCouriers };
};
