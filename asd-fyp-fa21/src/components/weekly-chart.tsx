"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface WeeklyChartProps {
  data: {
    asd_patients: number;
    non_asd_patients: number;
  };
}

export function WeeklyChart({ data }: WeeklyChartProps) {
  // Create sample weekly data based on the total numbers
  // In a real app, you would fetch actual weekly data from your API
  const weeklyData = [
    {
      day: "Mon",
      asd: Math.round(data.asd_patients * 0.15),
      nonAsd: Math.round(data.non_asd_patients * 0.12),
    },
    {
      day: "Tue",
      asd: Math.round(data.asd_patients * 0.18),
      nonAsd: Math.round(data.non_asd_patients * 0.15),
    },
    {
      day: "Wed",
      asd: Math.round(data.asd_patients * 0.22),
      nonAsd: Math.round(data.non_asd_patients * 0.18),
    },
    {
      day: "Thu",
      asd: Math.round(data.asd_patients * 0.17),
      nonAsd: Math.round(data.non_asd_patients * 0.2),
    },
    {
      day: "Fri",
      asd: Math.round(data.asd_patients * 0.14),
      nonAsd: Math.round(data.non_asd_patients * 0.22),
    },
    {
      day: "Sat",
      asd: Math.round(data.asd_patients * 0.08),
      nonAsd: Math.round(data.non_asd_patients * 0.08),
    },
    {
      day: "Sun",
      asd: Math.round(data.asd_patients * 0.06),
      nonAsd: Math.round(data.non_asd_patients * 0.05),
    },
  ];

  return (
    <ChartContainer
      config={{
        asd: {
          label: "ASD Patients",
          color: "hsl(var(--chart-1))",
        },
        nonAsd: {
          label: "Non-ASD Patients",
          color: "hsl(var(--chart-2))",
        },
      }}
      className="h-[300px]"
    >
      <BarChart
        data={weeklyData}
        margin={{
          top: 30,
          right: 20,
          left: 50,
          bottom: 30,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="day"
          label={{
            value: "Day of Week",
            position: "bottom",
            offset: 20,
          }}
        />
        <YAxis
          label={{
            value: "Number of Patients",
            angle: -90,
            position: "insideLeft",
            offset: -10,
          }}
        />
        <Legend verticalAlign="top" height={36} iconType="rect" />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar
          dataKey="asd"
          name="ASD Patients"
          fill="var(--color-asd)"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="nonAsd"
          name="Non-ASD Patients"
          fill="var(--color-nonAsd)"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ChartContainer>
  );
}
