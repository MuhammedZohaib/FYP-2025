import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsChart } from "@/components/stats-chart";
import { WeeklyChart } from "@/components/weekly-chart";
import { PatientsTable } from "@/components/patients-table";

async function getDashboardData() {
  try {
    const res = await fetch("http://localhost:8000/api/dashboard/data", {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch dashboard data");
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return {
      eeg_records: 0,
      facial_records: 0,
      speech_records: 0,
      video_records: 0,
      asd_patients: 0,
      non_asd_patients: 0,
      success: false,
    };
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData();
  const totalPredictions =
    data.eeg_records +
    data.facial_records +
    data.speech_records +
    data.video_records;

  return (
    <div className="flex flex-col gap-4 p-2 sm:p-4 md:p-6 w-full overflow-hidden">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 w-full">
        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Predictions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPredictions}</div>
            <p className="text-xs text-muted-foreground">Total Predictions</p>
          </CardContent>
        </Card>
        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              EEG Predictions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.eeg_records}</div>
            <p className="text-xs text-muted-foreground">Total Predictions</p>
          </CardContent>
        </Card>
        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Facial Predictions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.facial_records}</div>
            <p className="text-xs text-muted-foreground">Total Predictions</p>
          </CardContent>
        </Card>
        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Speech Predictions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.speech_records}</div>
            <p className="text-xs text-muted-foreground">Total Predictions</p>
          </CardContent>
        </Card>
        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Video Predictions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.video_records}</div>
            <p className="text-xs text-muted-foreground">Total Predictions</p>
          </CardContent>
        </Card>
        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ASD Patients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.asd_patients}</div>
            <p className="text-xs text-muted-foreground">
              Non-ASD: {data.non_asd_patients}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
        <Card className="w-full">
          <CardHeader className="p-4">
            <CardTitle className="text-base">Stats and Trends</CardTitle>
          </CardHeader>
          <CardContent className="p-0 h-[300px] overflow-hidden">
            <div className="w-full h-full px-2">
              <StatsChart data={data} />
            </div>
          </CardContent>
        </Card>
        <Card className="w-full">
          <CardHeader className="p-4">
            <CardTitle className="text-base">ASD Diagnosis - Week</CardTitle>
          </CardHeader>
          <CardContent className="p-0 h-[300px] overflow-hidden">
            <div className="w-full h-full px-2">
              <WeeklyChart data={data} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Patients Table */}
      <Card className="w-full">
        <CardHeader className="p-4">
          <CardTitle className="text-base">Patients List</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-hidden">
          <div className="w-full overflow-x-auto">
            <PatientsTable />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
