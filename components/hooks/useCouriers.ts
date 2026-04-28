"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { CourierStats } from "@/types/courier";
import { useAuth } from "./useLogin";

interface UseCouriersProps {
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
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { fetchWithSession, refreshSession } = useAuth();
    const [meta, setMeta] = useState({ totalCount: 0, totalPages: 0 });
    const currentPageRef = useRef(1);
    const hasMoreRef = useRef(true);

    const fetchPage = useCallback(
        async (props: UseCouriersProps, page: number, append: boolean) => {
            if (append) {
                setLoadingMore(true);
            } else {
                setLoading(true);
            }
            setError(null);

            try {
                const pageSize = props.pageSize || 50;
                const queryParams = new URLSearchParams();
                queryParams.set("page", String(page));
                queryParams.set("pageSize", String(pageSize));
                queryParams.set("relations", "orders,user");
                queryParams.set("sort", JSON.stringify({ id: "DESC" }));

                if (props.search) {
                    const searchId = parseInt(props.search);
                    const isId = !isNaN(searchId);

                    const searchObj = {
                        or: [
                            { user: { firstName: { like: props.search } } },
                            { user: { lastName: { like: props.search } } },
                            ...(isId ? [{ id: searchId }] : [])
                        ]
                    };
                    queryParams.set("search", JSON.stringify(searchObj));
                }

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

                const isInRange = (dateStr: string) => {
                    if (!props.dateFrom && !props.dateTo) return true;
                    const d = new Date(dateStr).getTime();
                    const from = props.dateFrom ? new Date(props.dateFrom).getTime() : 0;
                    if (props.dateFrom && d < from) return false;
                    if (props.dateTo) {
                        const to = new Date(props.dateTo).getTime();
                        if (d > to) return false;
                    }
                    return true;
                };

                const couriers: CourierStats[] = rawUsers.map((user) => {
                    const allOrders = (user.orders || []) as any[];
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
                        totaldeliverymansum: String(totalEarnings),
                        completedorderscount: String(completedOrders.length),
                        canceledorderscount: String(canceledOrders.length),
                        onShift: !!user.onShift,
                        ordersLength: orders.length
                    };
                });

                if (json.meta) {
                    const totalCount = json.meta.totalCount || json.meta.total || 0;
                    const pSize = pageSize;
                    const totalPages = json.meta.totalPages || json.meta.pages || Math.ceil(totalCount / pSize);
                    setMeta({ totalCount, totalPages });
                    hasMoreRef.current = page < totalPages;
                } else {
                    // If no meta, check if we got less than pageSize items
                    hasMoreRef.current = couriers.length >= pageSize;
                }

                if (append) {
                    setData(prev => [...prev, ...couriers]);
                } else {
                    setData(couriers);
                }

                currentPageRef.current = page;
            } catch (err: any) {
                setError(err.message || "Something went wrong");
            } finally {
                setLoading(false);
                setLoadingMore(false);
            }
        },
        [fetchWithSession, refreshSession],
    );

    // Reset and fetch first page when filters change
    useEffect(() => {
        currentPageRef.current = 1;
        hasMoreRef.current = true;
        fetchPage(initialProps, 1, false);
    }, [initialProps.dateFrom, initialProps.dateTo, initialProps.periodType, initialProps.pageSize, initialProps.search]);

    const loadMore = useCallback(() => {
        if (loadingMore || loading || !hasMoreRef.current) return;
        const nextPage = currentPageRef.current + 1;
        fetchPage(initialProps, nextPage, true);
    }, [fetchPage, initialProps, loadingMore, loading]);

    return {
        couriers: data,
        meta,
        loading,
        loadingMore,
        error,
        hasMore: hasMoreRef.current,
        loadMore,
        refetch: () => {
            currentPageRef.current = 1;
            hasMoreRef.current = true;
            fetchPage(initialProps, 1, false);
        },
    };
};
