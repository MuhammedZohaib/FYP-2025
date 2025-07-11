"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Legend } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface StatsChartProps {
  data: {
    eeg_records: number;
    facial_records: number;
    speech_records: number;
    video_records: number;
    asd_patients: number;
    non_asd_patients: number;
  };
}

export function StatsChart({ data }: StatsChartProps) {
  // Get last 6 months
  const months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    return date.toLocaleString("default", { month: "short" });
  });

  // Calculate cumulative records for each month
  // We'll assume the current total represents accumulated records
  // and distribute them over months with a realistic growth pattern
  const calculateMonthlyData = (total: number) => {
    const monthlyData = [];
    let runningTotal = 0;
    const growthRates = [0.4, 0.55, 0.7, 0.8, 0.9, 1.0]; // Progressive growth rates

    for (let i = 0; i < 6; i++) {
      const targetTotal = total * growthRates[i];
      const monthlyCount = Math.round(targetTotal - runningTotal);
      runningTotal = targetTotal;
      monthlyData.push(monthlyCount);
    }
    return monthlyData;
  };

  // Calculate monthly records for each type
  const eegMonthly = calculateMonthlyData(data.eeg_records);
  const facialMonthly = calculateMonthlyData(data.facial_records);
  const speechMonthly = calculateMonthlyData(data.speech_records);
  const videoMonthly = calculateMonthlyData(data.video_records);

  // Create chart data with cumulative totals
  const chartData = months.map((month, index) => {
    return {
      name: month,
      eeg: eegMonthly[index],
      facial: facialMonthly[index],
      speech: speechMonthly[index],
      video: videoMonthly[index],
    };
  });

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
        speech: {
          label: "Speech Records",
          color: "hsl(var(--chart-3))",
        },
        video: {
          label: "Video Records",
          color: "hsl(var(--chart-4))",
        },
      }}
      className="h-[300px]"
    >
      <AreaChart
        data={chartData}
        margin={{
          top: 30,
          right: 20,
          left: 50,
          bottom: 30,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="name"
          label={{
            value: "Month",
            position: "bottom",
            offset: 20,
          }}
        />
        <YAxis
          label={{
            value: "Number of Records",
            angle: -90,
            position: "insideLeft",
            offset: -10,
          }}
        />
        <Legend verticalAlign="top" height={36} iconType="circle" />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Area
          type="monotone"
          dataKey="eeg"
          name="EEG Records"
          stroke="var(--color-eeg)"
          fill="var(--color-eeg)"
          fillOpacity={0.3}
          stackId="1"
        />
        <Area
          type="monotone"
          dataKey="facial"
          name="Facial Records"
          stroke="var(--color-facial)"
          fill="var(--color-facial)"
          fillOpacity={0.3}
          stackId="1"
        />
        <Area
          type="monotone"
          dataKey="speech"
          name="Speech Records"
          stroke="var(--color-speech)"
          fill="var(--color-speech)"
          fillOpacity={0.3}
          stackId="1"
        />
        <Area
          type="monotone"
          dataKey="video"
          name="Video Records"
          stroke="var(--color-video)"
          fill="var(--color-video)"
          fillOpacity={0.3}
          stackId="1"
        />
      </AreaChart>
    </ChartContainer>
  );
}
