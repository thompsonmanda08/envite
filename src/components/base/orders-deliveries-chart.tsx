"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import { useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";

import { SelectField } from "../ui/select-field";

type CurrencyKey = "ZMW" | "USD";
type OrdersVsDeliveries = {
  month: string;
  orders: number;
  deliveries: number;
};

export const description = "A linear line chart";

const chartData = [
  { month: "January", desktop: 186 },
  { month: "February", desktop: 305 },
  { month: "March", desktop: 237 },
  { month: "April", desktop: 73 },
  { month: "May", desktop: 209 },
  { month: "June", desktop: 214 },
];

const template = {
  USD: [
    { month: "January", orders: 186, delivered: 80 },
    { month: "February", orders: 305, delivered: 200 },
    { month: "March", orders: 237, delivered: 200 },
    { month: "April", orders: 73, delivered: 200 },
    { month: "May", orders: 209, delivered: 200 },
    { month: "June", orders: 214, delivered: 200 },
  ],

  ZMW: [
    { month: "January", orders: 186, delivered: 0 },
    { month: "February", orders: 305, delivered: 0 },
    { month: "March", orders: 237, delivered: 0 },
    { month: "April", orders: 73, delivered: 0 },
    { month: "May", orders: 209, delivered: 0 },
    { month: "June", orders: 214, delivered: 0 },
  ],
};

const chartConfig = {
  orders: {
    label: "Total Orders",
    color: "var(--chart-1)",
  },
  delivered: {
    label: "Delivered",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function OrdersVsDeliveredChart({
  chartData,
}: {
  chartData: Record<CurrencyKey, OrdersVsDeliveries[]>;
}) {
  const [currency, setCurrency] = useState<CurrencyKey>("USD");

  return (
    <Card className="relative max-w-lg md:max-w-full">
      <CardHeader className="flex flex-row justify-between w-full gap-2 ">
        <div className="flex flex-col flex-1 w-full">
          <CardTitle className="text-sm lg:text-base">
            Shop performance
          </CardTitle>
          <CardDescription className="text-xs lg:text-sm">
            Your total orders vs delivered orders
          </CardDescription>
        </div>
        <SelectField
          className="bg-black text-white"
          classNames={{
            wrapper: "scale-75 md:scale-100 w-max z-10",
          }}
          defaultValue={currency}
          options={[
            { id: "ZMW", name: "ZMW", value: "ZMW" },
            { id: "USD", name: "USD", value: "USD" },
          ]}
          value={currency}
          onValueChange={(value) => setCurrency(value as CurrencyKey)}
        />
      </CardHeader>
      <CardContent>
        <ChartContainer className="p-2" config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartData[currency]}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              axisLine={false}
              dataKey="month"
              tickFormatter={(value) => value.slice(0, 3)}
              tickLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              content={<ChartTooltipContent hideLabel />}
              cursor={false}
            />
            <Line
              dataKey="orders"
              dot={true}
              stroke="var(--color-orders)"
              strokeWidth={2}
              type="linear"
            />
            <Line
              dataKey="delivered"
              dot={true}
              stroke="var(--color-delivered)"
              strokeWidth={2}
              type="linear"
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        {(() => {
          const data = chartData[currency];
          const prev = data[data.length - 2]?.orders ?? 0;
          const curr = data[data.length - 1]?.orders ?? 0;
          const diff = curr - prev;
          const percent = prev === 0 ? 0 : (diff / prev) * 100;
          const isUp = percent >= 0;
          const Icon = isUp
            ? TrendingUp
            : // Use Lucide's TrendingDown icon if available, otherwise fallback to a down arrow
              (TrendingDown ?? (() => <span>↓</span>));

          return (
            <div
              className={`flex gap-2 leading-none font-medium text-muted-foreground`}
            >
              Orders are {isUp ? "up" : "down"} by{" "}
              <span
                className={cn(
                  "flex gap-2 items-center",
                  isUp ? "text-green-600" : "text-red-600",
                )}
              >
                {Math.abs(percent).toFixed(1)}%{" "}
                <Icon
                  className={cn(
                    "h-4 w-4",
                    isUp ? "text-green-600" : "text-red-600",
                  )}
                />
              </span>{" "}
              this month{" "}
            </div>
          );
        })()}
        <div className="text-muted-foreground leading-none">
          Showing total orders and deliveries for the last 6 months
        </div>
      </CardFooter>
    </Card>
  );
}
