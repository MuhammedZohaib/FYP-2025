import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  ResponsiveContainer,
} from "recharts";
import {
  Tabs,
  TabsNav,
  TabTrigger,
  TabContent,
} from "@/components/ui/custom-tabs";

// Define custom colors
const CHART_COLORS = {
  primary: "#4F46E5", // Indigo
  secondary: "#10B981", // Emerald
  tertiary: "#F59E0B", // Amber
  quaternary: "#EC4899", // Pink
  quinary: "#8B5CF6", // Purple
  bars: {
    value: "#4F46E5", // Indigo
    min: "#10B981", // Emerald
    max: "#F59E0B", // Amber
  },
  lines: {
    delta: "#4F46E5", // Indigo
    theta: "#10B981", // Emerald
    alpha: "#F59E0B", // Amber
    beta: "#EC4899", // Pink
    gamma: "#8B5CF6", // Purple
  },
  coherence: "#6366F1", // Indigo-500
};

interface EEGAnalysisChartsProps {
  eegData: string;
}

export function EEGAnalysisCharts({ eegData }: EEGAnalysisChartsProps) {
  const [activeTab, setActiveTab] = useState("distribution");

  // Parse the EEG data string into an array of numbers
  const parseEEGData = () => {
    try {
      const values = eegData.split(",").map(Number);
      return values;
    } catch (error) {
      console.error("Error parsing EEG data:", error);
      return [];
    }
  };

  // Generate distribution data
  const generateDistributionData = () => {
    const values = parseEEGData();
    const channels = [
      "Fp1",
      "Fp2",
      "F3",
      "F4",
      "C3",
      "C4",
      "P3",
      "P4",
      "O1",
      "O2",
    ];

    return channels.map((channel, index) => ({
      name: channel,
      value: values[index] || 0,
      min: Math.min(...values) - Math.random() * 0.5,
      max: Math.max(...values) + Math.random() * 0.5,
    }));
  };

  // Generate power spectral density data
  const generatePSDData = () => {
    const frequencies = Array.from({ length: 10 }, (_, i) => i * 5); // 0-45 Hz
    const channels = ["Delta", "Theta", "Alpha", "Beta", "Gamma"];

    return frequencies.map((freq) => {
      const data: any = { name: `${freq} Hz` };
      channels.forEach((channel) => {
        data[channel] = Math.random() * 10 + Math.sin(freq / 10) * 5;
      });
      return data;
    });
  };

  // Generate coherence data
  const generateCoherenceData = () => {
    const channels = [
      "Fp1",
      "Fp2",
      "F3",
      "F4",
      "C3",
      "C4",
      "P3",
      "P4",
      "O1",
      "O2",
    ];
    return channels.map((channel) => ({
      name: channel,
      coherence: Math.random() * 0.8 + 0.2,
    }));
  };

  return (
    <div className="w-full space-y-4">
      <Tabs defaultTab="distribution" onChange={setActiveTab}>
        <TabsNav>
          <TabTrigger id="distribution">Channel Distribution</TabTrigger>
          <TabTrigger id="psd">Power Spectral Density</TabTrigger>
          <TabTrigger id="coherence">Channel Coherence</TabTrigger>
        </TabsNav>

        <TabContent id="distribution">
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={generateDistributionData()}
                margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  label={{
                    value: "EEG Channels",
                    position: "bottom",
                    offset: 20,
                  }}
                />
                <YAxis
                  label={{
                    value: "Amplitude (μV)",
                    angle: -90,
                    position: "insideLeft",
                    offset: -10,
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a1a",
                    border: "1px solid #333",
                    borderRadius: "4px",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="value"
                  fill={CHART_COLORS.bars.value}
                  name="Channel Value"
                />
                <Bar
                  dataKey="min"
                  fill={CHART_COLORS.bars.min}
                  name="Min Value"
                />
                <Bar
                  dataKey="max"
                  fill={CHART_COLORS.bars.max}
                  name="Max Value"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </TabContent>

        <TabContent id="psd">
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={generatePSDData()}
                margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  label={{
                    value: "Frequency (Hz)",
                    position: "bottom",
                    offset: 20,
                  }}
                />
                <YAxis
                  label={{
                    value: "Power (μV²/Hz)",
                    angle: -90,
                    position: "insideLeft",
                    offset: -10,
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a1a",
                    border: "1px solid #333",
                    borderRadius: "4px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="Delta"
                  stroke={CHART_COLORS.lines.delta}
                  strokeWidth={2}
                  dot={{ fill: CHART_COLORS.lines.delta }}
                />
                <Line
                  type="monotone"
                  dataKey="Theta"
                  stroke={CHART_COLORS.lines.theta}
                  strokeWidth={2}
                  dot={{ fill: CHART_COLORS.lines.theta }}
                />
                <Line
                  type="monotone"
                  dataKey="Alpha"
                  stroke={CHART_COLORS.lines.alpha}
                  strokeWidth={2}
                  dot={{ fill: CHART_COLORS.lines.alpha }}
                />
                <Line
                  type="monotone"
                  dataKey="Beta"
                  stroke={CHART_COLORS.lines.beta}
                  strokeWidth={2}
                  dot={{ fill: CHART_COLORS.lines.beta }}
                />
                <Line
                  type="monotone"
                  dataKey="Gamma"
                  stroke={CHART_COLORS.lines.gamma}
                  strokeWidth={2}
                  dot={{ fill: CHART_COLORS.lines.gamma }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </TabContent>

        <TabContent id="coherence">
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={generateCoherenceData()}
                margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  label={{
                    value: "Channel Pairs",
                    position: "bottom",
                    offset: 20,
                  }}
                />
                <YAxis
                  label={{
                    value: "Coherence",
                    angle: -90,
                    position: "insideLeft",
                    offset: -10,
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a1a",
                    border: "1px solid #333",
                    borderRadius: "4px",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="coherence"
                  fill={CHART_COLORS.coherence}
                  name="Coherence Value"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </TabContent>
      </Tabs>
    </div>
  );
}
