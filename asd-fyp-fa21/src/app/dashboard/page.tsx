import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsChart } from "@/components/stats-chart";
import { WeeklyChart } from "@/components/weekly-chart";
import { PatientsTable } from "@/components/patients-table";

export default function DashboardPage() {
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
            <div className="text-2xl font-bold">584</div>
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
            <div className="text-2xl font-bold">279</div>
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
            <div className="text-2xl font-bold">279</div>
            <p className="text-xs text-muted-foreground">Total Predictions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ASD Patients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">590</div>
            <p className="text-xs text-muted-foreground">Total Predictions</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Stats and Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <StatsChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>ASD Diagnosis - Week</CardTitle>
          </CardHeader>
          <CardContent>
            <WeeklyChart />
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
