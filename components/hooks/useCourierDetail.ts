"use client";

import { useState, useEffect, useCallback } from "react";
import { CourierDetail } from "@/types/courier";
import { useAuth } from "./useLogin";

interface UseCourierDetailProps {
    id: number;
    periodType?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    pageSize?: number;
}

export const useCourierDetail = ({
    id,
    periodType,
    dateFrom,
    dateTo,
    page = 1,
    pageSize = 20,
}: UseCourierDetailProps) => {
    const [data, setData] = useState<CourierDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { fetchWithSession, refreshSession } = useAuth(
        process.env.NEXT_PUBLIC_DIRECTUS_URL,
    );

    const fetchDetail = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        setError(null);
        try {
            const queryParams = new URLSearchParams();
            if (periodType) queryParams.set("periodType", periodType);
            if (dateFrom) queryParams.set("dateFrom", dateFrom);
            if (dateTo) queryParams.set("dateTo", dateTo);
            queryParams.set("page", String(page));
            queryParams.set("pageSize", String(pageSize));

            const profilePromise = fetchWithSession(
                `${process.env.NEXT_PUBLIC_API_URL}/admin/deliveryMan/${id}`,
                () => localStorage.getItem("access_token"),
                refreshSession,
            );

            // Skip payouts fetch if it's 'period' mode and no dates are provided
            const shouldFetchPayouts = periodType !== 'period' || !!dateFrom;

            let profileRes: Response;
            let payoutsRes: Response | null = null;

            if (shouldFetchPayouts) {
                const [pRes, payRes] = await Promise.all([
                    profilePromise,
                    fetchWithSession(
                        `${process.env.NEXT_PUBLIC_API_URL}/admin/delivery/${id}/payouts?${queryParams.toString()}`,
                        () => localStorage.getItem("access_token"),
                        refreshSession,
                    )
                ]);
                profileRes = pRes;
                payoutsRes = payRes;
            } else {
                profileRes = await profilePromise;
            }

            if (!profileRes.ok) {
                const text = await profileRes.text();
                throw new Error(`Profile fetch failed (${profileRes.status}): ${text}`);
            }

            let payoutsData: any = { orders: [], stats: undefined, date: undefined, meta: undefined };
            if (payoutsRes) {
                if (!payoutsRes.ok) {
                    const text = await payoutsRes.text();
                    throw new Error(`Payouts fetch failed (${payoutsRes.status}): ${text}`);
                }
                const json = await payoutsRes.json();
                payoutsData = json.data || json;
            }

            const profileJson = await profileRes.json();
            const profile = profileJson.data || profileJson;

            setData({
                ...profile,
                orders: payoutsData.orders || [],
                payoutDates: payoutsData.date,
                payoutStats: payoutsData.stats,
                meta: payoutsData.meta ? {
                    totalCount: payoutsData.meta.totalCount || payoutsData.meta.total || 0,
                    totalPages: payoutsData.meta.totalPages || payoutsData.meta.pages || 0,
                } : undefined,
            });
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    }, [id, periodType, dateFrom, dateTo, page, pageSize, fetchWithSession, refreshSession]);

    useEffect(() => {
        fetchDetail();
    }, [id, fetchDetail]);

    return { courier: data, loading, error, refetch: fetchDetail };
};
