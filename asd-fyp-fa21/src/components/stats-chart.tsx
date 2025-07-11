"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface StatsChartProps {
  data: {
    eeg_records: number;
    facial_records: number;
    asd_patients: number;
    non_asd_patients: number;
  };
}

export function StatsChart({ data }: StatsChartProps) {
  const chartData = [
    {
      name: "Jan",
      eeg: data.eeg_records * 0.2,
      facial: data.facial_records * 0.1,
    },
    {
      name: "Feb",
      eeg: data.eeg_records * 0.3,
      facial: data.facial_records * 0.2,
    },
    {
      name: "Mar",
      eeg: data.eeg_records * 0.4,
      facial: data.facial_records * 0.3,
    },
    {
      name: "Apr",
      eeg: data.eeg_records * 0.5,
      facial: data.facial_records * 0.4,
    },
    {
      name: "May",
      eeg: data.eeg_records * 0.7,
      facial: data.facial_records * 0.6,
    },
    {
      name: "Jun",
      eeg: data.eeg_records * 0.9,
      facial: data.facial_records * 0.8,
    },
    { name: "Jul", eeg: data.eeg_records, facial: data.facial_records },
  ];

  return (
    <ChartContainer
      config={{
        eeg: {
          label: "EEG Records",
          color: "hsl(var(--chart-1))",
        },
        facial: {
          label: "Facial Records",
          color: "hsl(var(--chart-2))",
        },
      }}
      className="h-[300px]"
    >
      <AreaChart
        data={chartData}
        margin={{
          top: 20,
          right: 20,
          left: 0,
          bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Area
          type="monotone"
          dataKey="eeg"
          stroke="var(--color-eeg)"
          fill="var(--color-eeg)"
          fillOpacity={0.3}
        />
        <Area
          type="monotone"
          dataKey="facial"
          stroke="var(--color-facial)"
          fill="var(--color-facial)"
          fillOpacity={0.3}
        />
      </AreaChart>
    </ChartContainer>
  );
}
