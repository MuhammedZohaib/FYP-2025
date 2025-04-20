"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Key,
  ShieldAlert,
  LockKeyhole,
  Smartphone,
  LogOut,
  Laptop,
  Smartphone as MobileIcon,
  Trash2,
} from "lucide-react";

// Password change form schema
const passwordFormSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, { message: "Current password is required" }),
    newPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .regex(/[A-Z]/, {
        message: "Password must contain at least one uppercase letter",
      })
      .regex(/[a-z]/, {
        message: "Password must contain at least one lowercase letter",
      })
      .regex(/[0-9]/, { message: "Password must contain at least one number" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type PasswordFormValues = z.infer<typeof passwordFormSchema>;

// Device session type
type Session = {
  id: string;
  device: string;
  browser: string;
  location: string;
  ip: string;
  lastActive: Date;
  current: boolean;
};

export default function SecuritySettingsPage() {
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showTwoFactorQR, setShowTwoFactorQR] = useState(false);

  // Mock sessions data
  const [sessions, setSessions] = useState<Session[]>([
    {
      id: "1",
      device: "Desktop",
      browser: "Chrome",
      location: "Karachi, Pakistan",
      ip: "192.168.1.1",
      lastActive: new Date(),
      current: true,
    },
    {
      id: "2",
      device: "Mobile",
      browser: "Safari",
      location: "Islamabad, Pakistan",
      ip: "192.168.1.2",
      lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      current: false,
    },
    {
      id: "3",
      device: "Tablet",
      browser: "Firefox",
      location: "Lahore, Pakistan",
      ip: "192.168.1.3",
      lastActive: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      current: false,
    },
  ]);

  // Initialize password form
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Handle password change
  function onPasswordSubmit(data: PasswordFormValues) {
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      console.log("Password updated:", data);
      toast.success("Password changed successfully!");
      passwordForm.reset();
      setIsLoading(false);
    }, 1000);
  }

  // Handle 2FA toggle
  function handleTwoFactorToggle(checked: boolean) {
    setTwoFactorEnabled(checked);
    if (checked) {
      setShowTwoFactorQR(true);
      toast.success("Two-factor authentication enabled!");
    } else {
      setShowTwoFactorQR(false);
      toast.success("Two-factor authentication disabled!");
    }
  }

  // Handle session termination
  function terminateSession(sessionId: string) {
    // Filter out the terminated session
    setSessions(sessions.filter((session) => session.id !== sessionId));
    toast.success("Session terminated successfully!");
  }

  // Handle all sessions termination except current
  function terminateAllSessions() {
    // Keep only current session
    setSessions(sessions.filter((session) => session.current));
    toast.success("All other sessions terminated successfully!");
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium">Security Settings</h3>
        <p className="text-sm text-muted-foreground">
          Manage your account security settings and active sessions.
        </p>
      </div>

      {/* Password Change */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LockKeyhole className="h-5 w-5" />
            <span>Change Password</span>
          </CardTitle>
          <CardDescription>
            Update your account password to keep your account secure.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...passwordForm}>
            <form
              onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
              className="space-y-4"
            >
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Password must be at least 8 characters and include
                      uppercase, lowercase letters and numbers.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Password"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            <span>Two-Factor Authentication</span>
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account by enabling
            two-factor authentication.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Enable Two-Factor Authentication</p>
              <p className="text-sm text-muted-foreground">
                Require a verification code when logging in.
              </p>
            </div>
            <Switch
              checked={twoFactorEnabled}
              onCheckedChange={handleTwoFactorToggle}
            />
          </div>

          {showTwoFactorQR && (
            <div className="mt-4 space-y-4">
              <div className="p-4 border rounded-md">
                <p className="mb-4 text-sm">
                  Scan this QR code with your authenticator app (like Google
                  Authenticator, Authy, or Microsoft Authenticator).
                </p>
                <div className="w-48 h-48 mx-auto bg-gray-200 flex items-center justify-center">
                  <p className="text-sm text-gray-500">QR Code Placeholder</p>
                </div>
                <p className="mt-4 text-sm text-center">
                  Or enter this code manually:{" "}
                  <span className="font-mono font-bold">
                    ABCD EFGH IJKL MNOP
                  </span>
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Verification Code</p>
                <div className="flex gap-2">
                  <Input placeholder="Enter verification code" />
                  <Button>Verify</Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5" />
            <span>Active Sessions</span>
          </CardTitle>
          <CardDescription>
            Manage your active sessions across different devices.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={terminateAllSessions}
              disabled={sessions.length <= 1}
              className="flex items-center gap-1"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign out of all other sessions</span>
            </Button>
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Device</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {session.device === "Desktop" ? (
                          <Laptop className="h-4 w-4" />
                        ) : (
                          <MobileIcon className="h-4 w-4" />
                        )}
                        <div>
                          <p className="font-medium">{session.device}</p>
                          <p className="text-xs text-muted-foreground">
                            {session.browser} • {session.ip}
                          </p>
                        </div>
                        {session.current && (
                          <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                            Current
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{session.location}</TableCell>
                    <TableCell>
                      {format(session.lastActive, "dd MMM yyyy, HH:mm")}
                    </TableCell>
                    <TableCell className="text-right">
                      {session.current ? (
                        <Button variant="ghost" size="sm" disabled>
                          Current
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => terminateSession(session.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Account Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            <span>API Keys & Credentials</span>
          </CardTitle>
          <CardDescription>
            Manage your API keys and application credentials.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center border border-dashed rounded-md">
            <h4 className="text-sm font-medium">No API Keys Created</h4>
            <p className="mt-1 text-sm text-muted-foreground">
              You haven't created any API keys yet.
            </p>
            <Button variant="outline" className="mt-4">
              Create API Key
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
