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

const chartConfig = {
  total: {
    label: "Total",
    color: "hsl(var(--chart-1))",
  },
  restaurantsTotal: {
    label: "Restaurantes",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export const Comparison = ({ data }) => {
  return (
    <ChartContainer config={chartConfig} className="max-h-[300px]">
      <BarChart accessibilityLayer data={data} layout="vertical" height={300}>
        <CartesianGrid horizontal={false} />
        <YAxis
          dataKey="type"
          type="category"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
          hide
        />
        <XAxis dataKey="total" type="number" hide />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="line" />}
        />
        <Bar
          dataKey="total"
          layout="vertical"
          fill="#c2410c"
          radius={4}
          height={100}
        >
          <LabelList
            dataKey="total"
            position="insideLeft"
            offset={8}
            className="fill-white"
            fontSize={12}
            height={50}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
};
