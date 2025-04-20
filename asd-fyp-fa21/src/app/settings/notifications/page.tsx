"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Bell, Mail, MessageSquare, Smartphone, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Notification setting type
type NotificationSetting = {
  id: string;
  title: string;
  description: string;
  emailEnabled: boolean;
  pushEnabled: boolean;
  inAppEnabled: boolean;
  category: "account" | "records" | "system";
};

export default function NotificationsPage() {
  // Mock notification settings
  const [notificationSettings, setNotificationSettings] = useState<
    NotificationSetting[]
  >([
    {
      id: "security-alerts",
      title: "Security Alerts",
      description:
        "Get notified when there's suspicious activity on your account",
      emailEnabled: true,
      pushEnabled: true,
      inAppEnabled: true,
      category: "account",
    },
    {
      id: "login-attempts",
      title: "Login Attempts",
      description: "Get notified when there's a new login to your account",
      emailEnabled: true,
      pushEnabled: false,
      inAppEnabled: true,
      category: "account",
    },
    {
      id: "new-records",
      title: "New Patient Records",
      description: "Get notified when new patient records are added",
      emailEnabled: true,
      pushEnabled: true,
      inAppEnabled: true,
      category: "records",
    },
    {
      id: "processed-analysis",
      title: "Processing Complete",
      description: "Get notified when analysis processing is complete",
      emailEnabled: true,
      pushEnabled: true,
      inAppEnabled: true,
      category: "records",
    },
    {
      id: "system-updates",
      title: "System Updates",
      description: "Get notified about system updates and maintenance",
      emailEnabled: true,
      pushEnabled: false,
      inAppEnabled: true,
      category: "system",
    },
    {
      id: "appointments",
      title: "Appointment Reminders",
      description: "Get reminders about upcoming appointments",
      emailEnabled: true,
      pushEnabled: true,
      inAppEnabled: true,
      category: "system",
    },
  ]);

  // Handle notification setting toggle
  function toggleNotificationSetting(
    id: string,
    type: "email" | "push" | "inApp",
    value: boolean
  ) {
    setNotificationSettings(
      notificationSettings.map((setting) =>
        setting.id === id
          ? {
              ...setting,
              [type === "email"
                ? "emailEnabled"
                : type === "push"
                ? "pushEnabled"
                : "inAppEnabled"]: value,
            }
          : setting
      )
    );

    toast.success(
      `${value ? "Enabled" : "Disabled"} ${type} notifications for ${
        notificationSettings.find((s) => s.id === id)?.title
      }`
    );
  }

  // Handle disabling all notifications
  function disableAllNotifications() {
    setNotificationSettings(
      notificationSettings.map((setting) => ({
        ...setting,
        emailEnabled: false,
        pushEnabled: false,
        inAppEnabled: false,
      }))
    );
    toast.success("All notifications disabled");
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Notification Settings</h3>
          <p className="text-sm text-muted-foreground">
            Manage how you receive notifications from the system.
          </p>
        </div>
        <Button variant="outline" onClick={disableAllNotifications}>
          Disable All
        </Button>
      </div>

      {/* Email Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            <span>Email Notifications</span>
          </CardTitle>
          <CardDescription>
            Manage your email notification preferences.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notificationSettings
              .filter((setting) => setting.category === "account")
              .map((setting) => (
                <div
                  key={`email-${setting.id}`}
                  className="flex items-center justify-between py-2"
                >
                  <div>
                    <p className="font-medium">{setting.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {setting.description}
                    </p>
                  </div>
                  <Switch
                    checked={setting.emailEnabled}
                    onCheckedChange={(checked: boolean) =>
                      toggleNotificationSetting(setting.id, "email", checked)
                    }
                  />
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Push Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            <span>Push Notifications</span>
          </CardTitle>
          <CardDescription>
            Manage your push notification preferences.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notificationSettings
              .filter((setting) => setting.category === "records")
              .map((setting) => (
                <div
                  key={`push-${setting.id}`}
                  className="flex items-center justify-between py-2"
                >
                  <div>
                    <p className="font-medium">{setting.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {setting.description}
                    </p>
                  </div>
                  <Switch
                    checked={setting.pushEnabled}
                    onCheckedChange={(checked: boolean) =>
                      toggleNotificationSetting(setting.id, "push", checked)
                    }
                  />
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* In-App Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <span>System Notifications</span>
          </CardTitle>
          <CardDescription>
            Manage your system notification preferences.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notificationSettings
              .filter((setting) => setting.category === "system")
              .map((setting) => (
                <div
                  key={`in-app-${setting.id}`}
                  className="flex items-center justify-between py-2"
                >
                  <div>
                    <p className="font-medium">{setting.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {setting.description}
                    </p>
                  </div>
                  <Switch
                    checked={setting.inAppEnabled}
                    onCheckedChange={(checked: boolean) =>
                      toggleNotificationSetting(setting.id, "inApp", checked)
                    }
                  />
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Notification Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            <span>Notification Schedule</span>
          </CardTitle>
          <CardDescription>
            Set your preferred notification delivery times.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center border border-dashed rounded-md">
            <h4 className="text-sm font-medium">Coming Soon</h4>
            <p className="mt-1 text-sm text-muted-foreground">
              The ability to schedule when you receive notifications is coming
              soon.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
