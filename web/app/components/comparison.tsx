"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { categoryToString, CURRENCY } from "@/utils";

const chartConfig = {
  total: {
    label: "Total",
  },
  restaurantsTotal: {
    label: "Restaurantes",
  },
} satisfies ChartConfig;

export const Comparison = ({ data }) => {
  return (
    <ChartContainer
      config={{}}
      className="radius-lg h-[350px] max-h-[350px] rounded-lg border
        bg-slate-900 p-5"
    >
      <BarChart accessibilityLayer data={data} layout="vertical" height={300}>
        <CartesianGrid horizontal={false} stroke="0" />
        <YAxis
          dataKey="type"
          type="category"
          tickLine={false}
          axisLine={false}
          width={80}
          tickFormatter={(item: string) => categoryToString[item] ?? item}
        />
        <XAxis
          dataKey="total"
          type="number"
          tickLine={false}
          axisLine={false}
          hide
        />
        {/* <ChartTooltip
          cursor={true}
          content={<ChartTooltipContent indicator="line" />}
        /> */}
        <Bar dataKey="total" layout="vertical" fill="#ef4444" radius={4}>
          <LabelList
            dataKey="total"
            position="insideLeft"
            offset={8}
            className="fill-white"
            fontSize={12}
            formatter={(item: number) => `${CURRENCY}${item}`}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
};
