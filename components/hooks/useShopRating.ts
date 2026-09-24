import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthFetcher } from "../providers/QueryProvider";

export interface ShopRatingTag {
  id: number;
  name: string;
  imgId: string;
  count: number;
}

export interface ShopRatingBar {
  star: number;
  count: number;
  color: string;
}

export interface ShopRating {
  /** Средняя оценка магазина, например "4,9". */
  score: string;
  /** Количество оценок (reviewCount магазина). */
  ratesCount: number;
  /** Количество отзывов (meta.total из отзывов). */
  reviewsCount: number;
  /** Распределение оценок по звёздам 5..1. */
  bars: ShopRatingBar[];
  /** Теги отзывов с количеством («Хороший ассортимент» и т.п.). */
  tags: ShopRatingTag[];
}

const BAR_COLORS: Record<number, string> = {
  5: "#55CB00",
  4: "#55CB00",
  3: "#F2C94C",
  2: "#F2994A",
  1: "#F5462C",
};

interface ShopReviewsBody {
  data?: { rate: number }[];
  meta?: { total: number };
  tags?: ShopRatingTag[];
}

const PAGE_SIZE = 100;

/**
 * Рейтинг магазина для главной панели — из публичного GET /v2/shop/:shopId/review:
 * - средняя оценка считается по загруженным отзывам (до 100 последних);
 * - количество оценок/отзывов — meta.total;
 * - теги («Хороший ассортимент» и т.п.) — tags summary.
 */
export const useShopRating = (shopId: number | null) => {
  const fetcher = useAuthFetcher();
  const base = process.env.NEXT_PUBLIC_API_URL;

  const reviewsQuery = useQuery({
    queryKey: ["shop-rating", "reviews", shopId],
    queryFn: () => fetcher<ShopReviewsBody>(`${base}/v2/shop/${shopId}/review?page=1&pageSize=${PAGE_SIZE}`),
    enabled: !!shopId,
  });

  return useMemo(() => {
    const reviewsBody = reviewsQuery.data;
    const reviews = reviewsBody?.data ?? [];
    const reviewsTotal = reviewsBody?.meta?.total ?? 0;

    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sum = 0;
    for (const review of reviews) {
      const star = Math.min(5, Math.max(1, Math.round(review.rate)));
      counts[star] += 1;
      sum += star;
    }

    const score = reviews.length ? (sum / reviews.length).toFixed(1).replace(".", ",") : "—";

    const rating: ShopRating = {
      score,
      ratesCount: reviewsTotal,
      reviewsCount: reviewsTotal,
      bars: [5, 4, 3, 2, 1].map((star) => ({
        star,
        count: counts[star],
        color: BAR_COLORS[star],
      })),
      tags: reviewsBody?.tags ?? [],
    };

    return {
      rating,
      loading: reviewsQuery.isLoading,
      error: (reviewsQuery.error as Error | null)?.message ?? null,
    };
  }, [reviewsQuery.data, reviewsQuery.isLoading, shopId]);
};
