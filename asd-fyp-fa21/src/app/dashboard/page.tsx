import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsChart } from "@/components/stats-chart";
import { WeeklyChart } from "@/components/weekly-chart";
import { PatientsTable } from "@/components/patients-table";

async function getDashboardData() {
  // artifical delay to test the loading state 
  // await new Promise((res) => setTimeout(res, 3000));

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
      asd_patients: 0,
      non_asd_patients: 0,
      success: false,
    };
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData();
  const totalPredictions = data.eeg_records + data.facial_records;

  return (
      <div className="flex flex-col gap-6 p-6">
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
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
          <Card>
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
          <Card>
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
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                ASD Patients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.asd_patients}</div>
              <p className="text-xs text-muted-foreground">
                Non-ASD: {data.non_asd_patients}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Stats and Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <StatsChart data={data} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>ASD Diagnosis - Week</CardTitle>
            </CardHeader>
            <CardContent>
              <WeeklyChart data={data} />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Patients List</CardTitle>
          </CardHeader>
          <CardContent>
            <PatientsTable />
          </CardContent>
        </Card>
      </div>
  );
}
