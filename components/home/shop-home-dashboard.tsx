"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/theme";
import { MenuIcon } from "@/components/icons/menu-icons";
import { OrdersChartCard } from "@/components/charts/orders-chart-card";
import { OrdersTodayCard } from "@/components/dashboard/orders-today-card";
import { OperationalRevenueCard } from "@/components/dashboard/operational-revenue-card";
import { PaymentMethodsCard } from "@/components/dashboard/payment-methods-card";
import { DashboardCard } from "@/components/admin/dashboard-card";
import { useAuthContext } from "@/components/providers/AuthProvider";
import { useShopRating } from "@/components/hooks/useShopRating";
import { useShopDashboardData } from "@/components/hooks/useShopDashboardData";
import type { ShopProducts, ShopTiming } from "@/components/hooks/useShopDashboardData";

function percentTrend(percent: number): { up: boolean; text: string; negative: boolean } {
  return {
    up: percent >= 0,
    text: `${percent >= 0 ? "+" : "-"}${Math.abs(percent)}%`,
    negative: percent < 0,
  };
}

function ProductsCard({ products }: { products: ShopProducts | null }) {
  return (
    <DashboardCard title='Товары' footer={<MoreLink />}>
      <div className='grid grid-cols-3 gap-3'>
        <div className='flex flex-col'>
          <span className='text-[12px] text-[#7F8DA1]'>Всего</span>
          <span className='text-[24px] font-bold leading-[28px] text-[#0E0F27]'>{products?.total ?? 0}</span>
          <Trend {...percentTrend(products?.totalPercent ?? 0)} />
        </div>
        <div className='flex flex-col'>
          <span className='text-[12px] text-[#7F8DA1]'>Добавили</span>
          <span className='text-[15px] font-bold leading-[20px] text-[#0E0F27]'>+{products?.added ?? 0}</span>
          <Trend {...percentTrend(products?.addedPercent ?? 0)} />
        </div>
        <div className='flex flex-col'>
          <span className='text-[12px] text-[#7F8DA1]'>SKU</span>
          <span className='text-[15px] font-bold leading-[20px] text-[#0E0F27]'>+{products?.sku ?? 0}</span>
        </div>
      </div>
      <div className='mt-3 grid grid-cols-3 gap-3 border-t border-[#F0F0F4] pt-3'>
        <div className='flex flex-col'>
          <span className='text-[12px] text-[#7F8DA1]'>Сред. наценка</span>
          <span className='text-[15px] font-bold leading-[20px] text-[#0E0F27]'>{products?.markupPercent ?? 0}%</span>
        </div>
        <div className='flex flex-col'>
          <span className='text-[12px] text-[#7F8DA1]'>В архиве</span>
          <span className='text-[15px] font-bold leading-[20px] text-[#0E0F27]'>{products?.archived ?? 0}</span>
        </div>
        <div className='flex flex-col'>
          <span className='text-[12px] text-[#7F8DA1]'>Нет в наличии</span>
          <span className='text-[15px] font-bold leading-[20px] text-[#0E0F27]'>{products?.outOfStock ?? 0}</span>
        </div>
      </div>
    </DashboardCard>
  );
}

function formatDate() {
  const now = new Date();
  const day = now.getDate();
  const month = now.toLocaleDateString("ru-RU", { month: "long" });
  return `${day} ${month}, ${now.getFullYear()}`;
}

function Trend({ up, text, negative, className }: { up: boolean; text: string; negative: boolean; className?: string }) {
  const color = negative ? "#F5462C" : "#55CB00";
  return (
    <span className={cn("inline-flex items-center gap-[2px] font-normal text-[12px] leading-[14px]", className)} style={{ color }}>
      <svg width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg' aria-hidden='true'>
        {up ? (
          <path d='M2.5 9.5L9.5 2.5M9.5 2.5H4M9.5 2.5V8' stroke={color} strokeWidth='1.4' strokeLinecap='round' strokeLinejoin='round' />
        ) : (
          <path d='M2.5 2.5L9.5 9.5M9.5 9.5H4M9.5 9.5V4' stroke={color} strokeWidth='1.4' strokeLinecap='round' strokeLinejoin='round' />
        )}
      </svg>
      {text}
    </span>
  );
}

function MoreLink() {
  return (
    <Link href='/reports' className='text-[13px] font-medium leading-[16px] text-[#2F80ED] hover:underline'>
      Подробнее
    </Link>
  );
}

function Sparkline({ points }: { points: string }) {
  const gradientId = `sparkline-gradient-${React.useId().replace(/:/g, "")}`;
  const gridV = Array.from({ length: 11 }, (_, i) => i * 21);
  const gridH = Array.from({ length: 7 }, (_, i) => i * 13);
  return (
    <svg viewBox='0 0 210 78' fill='none' xmlns='http://www.w3.org/2000/svg' className='h-auto w-full max-w-[210px]' aria-hidden='true'>
      <defs>
        <linearGradient id={gradientId} x1='0' y1='0' x2='210' y2='0' gradientUnits='userSpaceOnUse'>
          <stop stopColor='#55CB00' />
          <stop offset='0.5' stopColor='#F2C94C' />
          <stop offset='1' stopColor='#F24E1E' />
        </linearGradient>
      </defs>
      <g stroke='#E7E7EE' strokeWidth='1'>
        {gridV.map((x) => (
          <line key={`v${x}`} x1={x} y1='0' x2={x} y2='78' />
        ))}
        {gridH.map((y) => (
          <line key={`h${y}`} x1='0' y1={y} x2='210' y2={y} />
        ))}
      </g>
      <polyline
        points={points}
        stroke={`url(#${gradientId})`}
        strokeWidth='1.6'
        strokeLinecap='round'
        strokeLinejoin='round'
        fill='none'
      />
    </svg>
  );
}

function ActionButton({ icon, label, href, title }: { icon: string; label: string; href?: string; title?: string }) {
  const className = cn(
    "flex h-[42px] cursor-pointer items-center gap-2 rounded-full border border-[#ECECF3] bg-white px-[16px] text-[14px] font-medium leading-[18px] text-[#1C2533] shadow-[0_2px_8px_rgba(17,19,34,0.04)] transition-colors hover:bg-[#F8F8FA]"
  );
  const content = (
    <>
      <MenuIcon name={icon} className='h-6 w-6 shrink-0' />
      {label}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }
  return (
    <button type='button' className={className} title={title}>
      {content}
    </button>
  );
}

interface TimingView {
  value: string;
  trend: { up: boolean; text: string; negative: boolean };
  points: string;
  from: string;
  to: string;
}

function toTimingView(timing: ShopTiming | null): TimingView {
  const daily = timing?.daily ?? [];
  const values = daily.map((point) => point.minutes);
  const finite = values.filter((v): v is number => v != null);
  const min = finite.length ? Math.min(...finite) : 0;
  const max = finite.length ? Math.max(...finite) : 1;
  const span = max - min || 1;
  const points = values
    .map((v, i) => {
      const y = finite.length ? 74 - (((v ?? min) - min) / span) * 64 : 71;
      return `${i * 35},${Math.round(y)}`;
    })
    .join(" ");

  const diff =
    timing?.minutes != null && timing?.prevMinutes != null
      ? Math.round((timing.minutes - timing.prevMinutes) * 10) / 10
      : null;

  const fmt = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short" });
  const dayAgo = (n: number) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - n);
    return fmt.format(d).replace(".", "");
  };

  return {
    value: timing?.minutes != null ? `${Math.round(timing.minutes)} мин` : "—",
    trend: {
      up: diff != null && diff > 0,
      text: diff != null ? `${diff >= 0 ? "+" : "-"}${Math.abs(diff)} мин` : "—",
      negative: diff != null && diff > 0,
    },
    points,
    from: dayAgo(6),
    to: dayAgo(0),
  };
}

function TimingCard({ title, data, className }: { title: string; data: TimingView; className?: string }) {
  return (
    <DashboardCard
      title={title}
      className={className}
      footer={<MoreLink />}
    >
      <div className='flex items-start justify-between gap-2'>
        <div className='flex min-w-0 flex-col gap-1'>
          <span className='font-[Inter_Tight] text-[28px] font-bold leading-[30px] tracking-normal text-[#0E0F27]'>{data.value}</span>
          <Trend {...data.trend} />
        </div>
        <div className='flex w-full max-w-[210px] flex-col'>
          <Sparkline points={data.points} />
          <div className='mt-[4px] flex items-center justify-between gap-3 text-[11px] leading-none text-[#7F8DA1]'>
            <span>{data.from}</span>
            <span>{data.to}</span>
          </div>
        </div>
      </div>
    </DashboardCard>
  );
}

function RatingCard() {
  const { currentShopId } = useAuthContext();
  const { rating } = useShopRating(currentShopId ?? null);
  const maxCount = Math.max(...rating.bars.map((bar) => bar.count), 1);
  return (
    <DashboardCard title='Рейтинг магазина'>
      <div className='flex items-center gap-5'>
        <span className='flex h-[46px] items-center gap-2 rounded-[10px] bg-[#55CB00] px-3'>
          <svg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg' aria-hidden='true'>
            <path
              d='M7.91109 0.706815C8.35651 -0.235606 9.64349 -0.235605 10.0889 0.706816L11.9293 4.60078C12.1062 4.97501 12.4481 5.2344 12.8436 5.29441L16.959 5.91884C17.955 6.06996 18.3527 7.34805 17.632 8.08163L14.6541 11.1127C14.3679 11.404 14.2373 11.8237 14.3048 12.235L15.0078 16.5149C15.178 17.5507 14.1368 18.3406 13.2459 17.8515L9.56507 15.8308C9.21131 15.6366 8.78869 15.6366 8.43493 15.8308L4.75406 17.8515C3.86321 18.3406 2.82203 17.5507 2.99217 16.5149L3.69515 12.235C3.76271 11.8237 3.63211 11.404 3.34592 11.1127L0.368033 8.08162C-0.352678 7.34805 0.0450202 6.06996 1.04102 5.91884L5.15636 5.29441C5.55187 5.2344 5.89377 4.97501 6.07065 4.60078L7.91109 0.706815Z'
              fill='white'
            />
          </svg>
          <span className='text-[28px] font-bold leading-[30px] text-white'>{rating.score}</span>
        </span>
        <div className='flex flex-col'>
          <span className='text-[14px] leading-[18px] text-[#0E0F2780]'>Оценок</span>
          <span className='text-[14px] font-semibold leading-[16px] text-[#0E0F27]'>{rating.ratesCount}</span>
        </div>
        <div className='flex flex-col'>
          <span className='text-[14px] leading-[18px] text-[#0E0F2780]'>Отзывы</span>
          <span className='text-[14px] font-semibold leading-[16px] text-[#0E0F27]'>{rating.reviewsCount}</span>
        </div>
      </div>

      <div className='mt-4 flex flex-col gap-2'>
        {rating.bars.map((bar) => (
          <div key={bar.star} className='flex items-center gap-2'>
            <span className='w-[10px] text-right text-[12px] text-[#7F8DA1]'>{bar.star}</span>
            <div className='h-[8px] flex-1 overflow-hidden rounded-full bg-[#F0F0F4]'>
              <div className='h-full rounded-full' style={{ width: `${(bar.count / maxCount) * 100}%`, backgroundColor: bar.color }} />
            </div>
            <span className='w-[24px] text-right text-[12px] text-[#1C2533]'>{bar.count}</span>
          </div>
        ))}
      </div>

      <div className='mt-4 flex flex-col gap-3 border-t border-[#F0F0F4] pt-3'>
        {rating.tags.map((tag) => (
          <div key={tag.id} className='flex items-center gap-2'>
            {tag.imgId ? (
              <img
                src={`${process.env.NEXT_PUBLIC_API_URL}/files/${tag.imgId}`}
                alt=''
                className='h-[16px] w-[16px] rounded object-cover'
              />
            ) : null}
            <span className='flex-1 truncate text-[13px] text-[#1C2533]'>{tag.name}</span>
            <span className='text-[13px] font-bold text-[#0E0F27]'>{tag.count}</span>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}

export function ShopHomeDashboard() {
  const [dateLabel, setDateLabel] = React.useState("");
  const { currentShopId } = useAuthContext();
  const dashboard = useShopDashboardData(currentShopId ?? null);

  React.useEffect(() => {
    setDateLabel(formatDate());
  }, []);

  return (
    <div className='flex flex-col gap-5'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div className='flex flex-wrap gap-2'>
          <ActionButton icon='plus-green' label='Добавить товар' href='/categories/addProduct' />
          <ActionButton icon='worker-add' label='Добавить работника' title='Скоро' />
          <ActionButton icon='product-create' label='Создать товар' href='/categories/addProduct' />
        </div>
        <span className='text-[24px] font-bold leading-[28px] text-[#0E0F27]'>{dateLabel}</span>
      </div>

      <p className='text-[13px] text-[#7F8DA1]'>Основные</p>

      <div className='flex flex-col gap-[8px]'>
        <div className='flex flex-col gap-[8px] lg:flex-row'>
          <div className='flex min-w-0 flex-1 flex-col gap-[8px]'>
            <div className='grid grid-cols-1 gap-[8px] sm:grid-cols-3'>
              <OrdersTodayCard today={dashboard.today} />
              <TimingCard title='Среднее время сборки' data={toTimingView(dashboard.timings?.assembly ?? null)} />
              <TimingCard title='Среднее время подтверждения' data={toTimingView(dashboard.timings?.confirm ?? null)} />
            </div>

            <div className='grid grid-cols-1 gap-[8px] md:grid-cols-[1fr_2fr]'>
              <RatingCard />
              <OrdersChartCard
                title='График заказов за последние 14 дней'
                chart={dashboard.chart}
                chartTotals={dashboard.chartTotals}
                daysCount={14}
              />
            </div>
          </div>

          <div className='flex flex-col gap-[8px] lg:w-[320px]'>
            <OperationalRevenueCard revenue={dashboard.revenue} className='flex-1' />
            <PaymentMethodsCard payments={dashboard.payments} />
          </div>
        </div>

        <div className='flex gap-[8px]'>
          <div className='grid min-w-0 flex-1 grid-cols-1 gap-[8px] md:grid-cols-[1fr_2fr]'>
            <ProductsCard products={dashboard.products} />
          </div>
          <div className='hidden lg:block lg:w-[320px] shrink-0' />
        </div>
      </div>
    </div>
  );
}
