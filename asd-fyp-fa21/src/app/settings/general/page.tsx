"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Upload,
  User,
  Moon,
  Sun,
  Globe,
  Check,
  AlignLeft,
  Accessibility,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";

// Form schema for profile settings
const profileFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  title: z.string().optional(),
  organization: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

// Default values for the form
const defaultValues: Partial<ProfileFormValues> = {
  name: "",
  email: "",
  title: "",
  organization: "",
};

// Add accessibility state
const [fontSizeValue, setFontSizeValue] = useState(16);
const [highContrast, setHighContrast] = useState(false);
const [dyslexiaFont, setDyslexiaFont] = useState(false);

export default function GeneralSettingsPage() {
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("en");

  // Initialize form
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
  });

  // Load user data (simulated)
  useState(() => {
    // Simulate fetching user data
    setTimeout(() => {
      form.reset({
        name: "John Doe",
        email: "john.doe@example.com",
        title: "Doctor",
        organization: "City Hospital",
      });
    }, 500);
  });

  // Add accessibility settings application
  useEffect(() => {
    // Apply font size to root HTML element
    document.documentElement.style.setProperty(
      "--font-size-base",
      `${fontSizeValue}px`
    );

    // Apply high contrast mode if enabled
    if (highContrast) {
      document.documentElement.classList.add("high-contrast");
    } else {
      document.documentElement.classList.remove("high-contrast");
    }

    // Apply dyslexia-friendly font if enabled
    if (dyslexiaFont) {
      document.documentElement.classList.add("dyslexia-font");
    } else {
      document.documentElement.classList.remove("dyslexia-font");
    }
  }, [fontSizeValue, highContrast, dyslexiaFont]);

  // Load accessibility settings
  useState(() => {
    // Simulate fetching accessibility settings
    setTimeout(() => {
      setFontSizeValue(16);
      setHighContrast(false);
      setDyslexiaFont(false);
    }, 500);
  });

  // Handle form submission
  function onSubmit(data: ProfileFormValues) {
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      console.log("Profile updated:", data);
      toast.success("Profile updated successfully!");
      setIsLoading(false);
    }, 1000);
  }

  // Handle appearance change
  function handleAppearanceChange(checked: boolean) {
    setDarkMode(checked);
    // Would normally update theme here
    toast.success(`Theme switched to ${checked ? "dark" : "light"} mode`);
  }

  // Handle language change
  function handleLanguageChange(value: string) {
    setLanguage(value);
    toast.success(
      `Language changed to ${
        value === "en" ? "English" : value === "es" ? "Spanish" : "Urdu"
      }`
    );
  }

  // Handle accessibility settings change
  function handleAccessibilityUpdate(settings: any) {
    // Simulate API call
    setTimeout(() => {
      console.log("Accessibility settings updated:", settings);
      toast.success("Accessibility settings updated successfully!");
    }, 1000);
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium">General Settings</h3>
        <p className="text-sm text-muted-foreground">
          Manage your personal settings and preferences.
        </p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your personal information and profile picture.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="/placeholder-avatar.jpg" alt="Profile" />
              <AvatarFallback className="bg-primary text-primary-foreground">
                <User className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <div>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <Upload className="h-4 w-4" />
                <span>Upload</span>
              </Button>
              <p className="mt-1 text-xs text-muted-foreground">
                JPEG, PNG or GIF. Max 2MB.
              </p>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Your email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Your job title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="organization"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization</FormLabel>
                      <FormControl>
                        <Input placeholder="Your organization" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Appearance Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Customize how the application looks on your device.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {darkMode ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
              <div>
                <p className="font-medium">Dark Mode</p>
                <p className="text-sm text-muted-foreground">
                  Toggle between light and dark theme
                </p>
              </div>
            </div>
            <Switch
              checked={darkMode}
              onCheckedChange={handleAppearanceChange}
            />
          </div>
        </CardContent>
      </Card>

      {/* Language Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Language</CardTitle>
          <CardDescription>
            Choose your preferred language for the application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Globe className="h-5 w-5" />
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-60">
                <SelectValue placeholder="Select a language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="ur">Urdu</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Add Accessibility Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Accessibility className="h-5 w-5" />
            <span>Accessibility</span>
          </CardTitle>
          <CardDescription>
            Customize your experience for better accessibility
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">Font Size</h4>
                <span className="text-sm text-muted-foreground">
                  {fontSizeValue}px
                </span>
              </div>
              <Slider
                defaultValue={[fontSizeValue]}
                min={12}
                max={24}
                step={1}
                onValueChange={(values: number[]) => {
                  setFontSizeValue(values[0]);
                  handleAccessibilityUpdate({ font_size: values[0] });
                }}
                className="py-2"
                data-testid="font-slider"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Adjust the base font size for easier reading
              </p>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium">High Contrast Mode</p>
                <p className="text-sm text-muted-foreground">
                  Enhance contrast for better visibility
                </p>
              </div>
              <Switch
                checked={highContrast}
                onCheckedChange={(checked: boolean) => {
                  setHighContrast(checked);
                  handleAccessibilityUpdate({ high_contrast: checked });
                }}
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium">Dyslexia-Friendly Font</p>
                <p className="text-sm text-muted-foreground">
                  Use a font designed for readers with dyslexia
                </p>
              </div>
              <Switch
                checked={dyslexiaFont}
                onCheckedChange={(checked: boolean) => {
                  setDyslexiaFont(checked);
                  handleAccessibilityUpdate({ dyslexia_font: checked });
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
