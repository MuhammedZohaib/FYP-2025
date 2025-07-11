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

// Custom color scheme
const COLORS = {
  leftHemisphere: "#4F46E5", // Indigo
  rightHemisphere: "#EC4899", // Pink
  average: "#10B981", // Emerald
  coherence: "#8B5CF6", // Purple
  leftHover: "#6366F1", // Lighter indigo
  rightHover: "#F472B6", // Lighter pink
  coherenceHover: "#A78BFA", // Lighter purple
  text: "#E5E7EB", // Light gray for text
  axisLabel: "#D1D5DB", // Slightly darker gray for axis labels
  gridLines: "rgba(229, 231, 235, 0.1)", // Very light gray with low opacity for grid
};

interface EEGAnalysisChartsProps {
  eegData: {
    patient_id: string;
    doctor_id: string;
    created_at: string;
    updated_at: string;
    delta_F_sx: number;
    delta_F_dx: number;
    theta_F_sx: number;
    theta_F_dx: number;
    low_alpha_F_sx: number;
    low_alpha_F_dx: number;
    high_alpha_F_sx: number;
    high_alpha_F_dx: number;
    beta_F_sx: number;
    beta_F_dx: number;
    gamma_F_sx: number;
    gamma_F_dx: number;
    prediction_result_in_probability: number;
    predicted_probabilities: number[];
    prediction_result_in_encoded_category: number;
    prediction_result_in_category: string;
    group: number;
    time_point: number;
    _id: string;
  } | null;
}

const formatPower = (value: number) => {
  return typeof value === "number" ? value.toFixed(2) : "0.00";
};

const formatCoherence = (value: number) => {
  return typeof value === "number" ? (value * 100).toFixed(1) + "%" : "0.0%";
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-black/80 p-2 rounded-lg border border-gray-700 shadow-lg">
      <p className="text-gray-200 font-medium mb-1">{label}</p>
      {payload.map((entry: any, index: number) => (
        <p key={index} style={{ color: entry.color }} className="text-sm">
          {entry.name}:{" "}
          {typeof entry.value === "number"
            ? entry.dataKey === "coherence"
              ? formatCoherence(entry.value)
              : formatPower(entry.value)
            : "N/A"}
        </p>
      ))}
    </div>
  );
};

export function EEGAnalysisCharts({ eegData }: EEGAnalysisChartsProps) {
  const [activeTab, setActiveTab] = useState("distribution");

  if (!eegData) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center text-gray-400">
        No EEG data available
      </div>
    );
  }

  // Validate and normalize data values
  const normalizeValue = (value: any): number => {
    return typeof value === "number" && !isNaN(value) ? value : 0;
  };

  // Generate distribution data from actual EEG data
  const generateDistributionData = () => {
    return [
      {
        name: "Delta",
        left: normalizeValue(eegData.delta_F_sx),
        right: normalizeValue(eegData.delta_F_dx),
      },
      {
        name: "Theta",
        left: normalizeValue(eegData.theta_F_sx),
        right: normalizeValue(eegData.theta_F_dx),
      },
      {
        name: "Low α",
        left: normalizeValue(eegData.low_alpha_F_sx),
        right: normalizeValue(eegData.low_alpha_F_dx),
      },
      {
        name: "High α",
        left: normalizeValue(eegData.high_alpha_F_sx),
        right: normalizeValue(eegData.high_alpha_F_dx),
      },
      {
        name: "Beta",
        left: normalizeValue(eegData.beta_F_sx),
        right: normalizeValue(eegData.beta_F_dx),
      },
      {
        name: "Gamma",
        left: normalizeValue(eegData.gamma_F_sx),
        right: normalizeValue(eegData.gamma_F_dx),
      },
    ];
  };

  // Generate power spectral density data from actual EEG data
  const generatePSDData = () => {
    return [
      {
        name: "Delta",
        left: normalizeValue(eegData.delta_F_sx),
        right: normalizeValue(eegData.delta_F_dx),
        avg:
          (normalizeValue(eegData.delta_F_sx) +
            normalizeValue(eegData.delta_F_dx)) /
          2,
      },
      {
        name: "Theta",
        left: normalizeValue(eegData.theta_F_sx),
        right: normalizeValue(eegData.theta_F_dx),
        avg:
          (normalizeValue(eegData.theta_F_sx) +
            normalizeValue(eegData.theta_F_dx)) /
          2,
      },
      {
        name: "Low α",
        left: normalizeValue(eegData.low_alpha_F_sx),
        right: normalizeValue(eegData.low_alpha_F_dx),
        avg:
          (normalizeValue(eegData.low_alpha_F_sx) +
            normalizeValue(eegData.low_alpha_F_dx)) /
          2,
      },
      {
        name: "High α",
        left: normalizeValue(eegData.high_alpha_F_sx),
        right: normalizeValue(eegData.high_alpha_F_dx),
        avg:
          (normalizeValue(eegData.high_alpha_F_sx) +
            normalizeValue(eegData.high_alpha_F_dx)) /
          2,
      },
      {
        name: "Beta",
        left: normalizeValue(eegData.beta_F_sx),
        right: normalizeValue(eegData.beta_F_dx),
        avg:
          (normalizeValue(eegData.beta_F_sx) +
            normalizeValue(eegData.beta_F_dx)) /
          2,
      },
      {
        name: "Gamma",
        left: normalizeValue(eegData.gamma_F_sx),
        right: normalizeValue(eegData.gamma_F_dx),
        avg:
          (normalizeValue(eegData.gamma_F_sx) +
            normalizeValue(eegData.gamma_F_dx)) /
          2,
      },
    ];
  };

  // Generate coherence data from actual EEG data
  const generateCoherenceData = () => {
    const calculateCoherence = (left: number, right: number) => {
      const normalizedLeft = normalizeValue(left);
      const normalizedRight = normalizeValue(right);

      if (normalizedLeft === 0 || normalizedRight === 0) return 0;
      const min = Math.min(normalizedLeft, normalizedRight);
      const max = Math.max(normalizedLeft, normalizedRight);
      return min / max; // Normalized between 0 and 1
    };

    return [
      {
        name: "Delta",
        coherence: calculateCoherence(eegData.delta_F_sx, eegData.delta_F_dx),
      },
      {
        name: "Theta",
        coherence: calculateCoherence(eegData.theta_F_sx, eegData.theta_F_dx),
      },
      {
        name: "Low α",
        coherence: calculateCoherence(
          eegData.low_alpha_F_sx,
          eegData.low_alpha_F_dx
        ),
      },
      {
        name: "High α",
        coherence: calculateCoherence(
          eegData.high_alpha_F_sx,
          eegData.high_alpha_F_dx
        ),
      },
      {
        name: "Beta",
        coherence: calculateCoherence(eegData.beta_F_sx, eegData.beta_F_dx),
      },
      {
        name: "Gamma",
        coherence: calculateCoherence(eegData.gamma_F_sx, eegData.gamma_F_dx),
      },
    ];
  };

  // Prepare chart data
  const distributionData = generateDistributionData();
  const psdData = generatePSDData();
  const coherenceData = generateCoherenceData();

  // Check if we have any valid data to display
  const hasValidData = distributionData.some((d) => d.left > 0 || d.right > 0);

  if (!hasValidData) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center text-gray-400">
        No valid EEG data available for visualization
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <Tabs defaultTab="distribution" onChange={setActiveTab}>
        <TabsNav>
          <TabTrigger id="distribution">Frequency Band Distribution</TabTrigger>
          <TabTrigger id="psd">Power Spectral Density</TabTrigger>
          <TabTrigger id="coherence">Hemispheric Coherence</TabTrigger>
        </TabsNav>

        <TabContent id="distribution">
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={distributionData}
                margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={COLORS.gridLines}
                />
                <XAxis
                  dataKey="name"
                  label={{
                    value: "Frequency Bands",
                    position: "bottom",
                    offset: 20,
                    style: { fill: COLORS.axisLabel },
                  }}
                  tick={{ fill: COLORS.text }}
                />
                <YAxis
                  label={{
                    value: "Power (μV²)",
                    angle: -90,
                    position: "insideLeft",
                    offset: -10,
                    style: { fill: COLORS.axisLabel },
                  }}
                  tick={{ fill: COLORS.text }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ color: COLORS.text }}
                  formatter={(value) => (
                    <span style={{ color: COLORS.text }}>{value}</span>
                  )}
                />
                <Bar
                  dataKey="left"
                  fill={COLORS.leftHemisphere}
                  name="Left Hemisphere"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="right"
                  fill={COLORS.rightHemisphere}
                  name="Right Hemisphere"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </TabContent>

        <TabContent id="psd">
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={psdData}
                margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={COLORS.gridLines}
                />
                <XAxis
                  dataKey="name"
                  label={{
                    value: "Frequency Bands",
                    position: "bottom",
                    offset: 20,
                    style: { fill: COLORS.axisLabel },
                  }}
                  tick={{ fill: COLORS.text }}
                />
                <YAxis
                  label={{
                    value: "Power (μV²)",
                    angle: -90,
                    position: "insideLeft",
                    offset: -10,
                    style: { fill: COLORS.axisLabel },
                  }}
                  tick={{ fill: COLORS.text }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ color: COLORS.text }}
                  formatter={(value) => (
                    <span style={{ color: COLORS.text }}>{value}</span>
                  )}
                />
                <Line
                  type="monotone"
                  dataKey="left"
                  stroke={COLORS.leftHemisphere}
                  strokeWidth={2}
                  dot={{ fill: COLORS.leftHemisphere }}
                  name="Left Hemisphere"
                />
                <Line
                  type="monotone"
                  dataKey="right"
                  stroke={COLORS.rightHemisphere}
                  strokeWidth={2}
                  dot={{ fill: COLORS.rightHemisphere }}
                  name="Right Hemisphere"
                />
                <Line
                  type="monotone"
                  dataKey="avg"
                  stroke={COLORS.average}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: COLORS.average }}
                  name="Average"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </TabContent>

        <TabContent id="coherence">
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={coherenceData}
                margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={COLORS.gridLines}
                />
                <XAxis
                  dataKey="name"
                  label={{
                    value: "Frequency Bands",
                    position: "bottom",
                    offset: 20,
                    style: { fill: COLORS.axisLabel },
                  }}
                  tick={{ fill: COLORS.text }}
                />
                <YAxis
                  label={{
                    value: "Coherence Index",
                    angle: -90,
                    position: "insideLeft",
                    offset: -10,
                    style: { fill: COLORS.axisLabel },
                  }}
                  tick={{ fill: COLORS.text }}
                  domain={[0, 1]}
                  tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ color: COLORS.text }}
                  formatter={(value) => (
                    <span style={{ color: COLORS.text }}>{value}</span>
                  )}
                />
                <Bar
                  dataKey="coherence"
                  fill={COLORS.coherence}
                  name="Hemispheric Coherence"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </TabContent>
      </Tabs>
    </div>
  );
}
