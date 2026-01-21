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

                if (props.dateFrom) queryParams.set("dateFrom", props.dateFrom);
                if (props.dateTo) queryParams.set("dateTo", props.dateTo);
                if (props.periodType) queryParams.set("periodType", props.periodType);

                const url = `${process.env.NEXT_PUBLIC_API_URL}/admin/deliveryMan?${queryParams.toString()}`;

                const res = await fetchWithSession(
                    url,
                    () => localStorage.getItem("access_token"),
                    refreshSession,
                );

                if (!res.ok) {
                    throw new Error(`Failed to fetch couriers: ${res.statusText}`);
                }

                const json = await res.json();
                const couriers = (json.data || json) as CourierStats[];
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
