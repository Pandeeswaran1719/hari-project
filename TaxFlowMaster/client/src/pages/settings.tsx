import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Building2,
  User,
  Bell,
  Database,
  Shield,
  Palette,
  Upload,
  Save,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertFirmSettingsSchema, type InsertFirmSettings, type FirmSettings } from "@shared/schema";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("firm");
  const [notificationSettings, setNotificationSettings] = useState({
    emailReminders: true,
    smsReminders: false,
    browserNotifications: true,
    weeklyReports: true,
    monthlyReports: true,
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: firmSettings, isLoading } = useQuery<FirmSettings>({
    queryKey: ["/api/settings"],
  });

  const form = useForm<InsertFirmSettings>({
    resolver: zodResolver(insertFirmSettingsSchema),
    defaultValues: {
      firmName: firmSettings?.firmName || "",
      contactPerson: firmSettings?.contactPerson || "",
      contactNumber: firmSettings?.contactNumber || "",
      email: firmSettings?.email || "",
      address: firmSettings?.address || "",
      gstin: firmSettings?.gstin || "",
      logo: firmSettings?.logo || "",
    },
  });

  // Update form when data loads
  useState(() => {
    if (firmSettings) {
      form.reset({
        firmName: firmSettings.firmName,
        contactPerson: firmSettings.contactPerson,
        contactNumber: firmSettings.contactNumber,
        email: firmSettings.email,
        address: firmSettings.address || "",
        gstin: firmSettings.gstin || "",
        logo: firmSettings.logo || "",
      });
    }
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (data: InsertFirmSettings) => apiRequest("put", "/api/settings", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Success",
        description: "Settings updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertFirmSettings) => {
    updateSettingsMutation.mutate(data);
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: value
    }));
    
    toast({
      title: "Notification Settings",
      description: `${key} ${value ? 'enabled' : 'disabled'}`,
    });
  };

  const handleBackupData = () => {
    toast({
      title: "Feature Coming Soon",
      description: "Data backup functionality will be available soon",
    });
  };

  const handleImportData = () => {
    toast({
      title: "Feature Coming Soon",
      description: "Data import functionality will be available soon",
    });
  };

  const handleLogoUpload = () => {
    toast({
      title: "Feature Coming Soon",
      description: "Logo upload functionality will be available soon",
    });
  };

  const tabItems = [
    { id: "firm", label: "Firm Profile", icon: Building2 },
    { id: "users", label: "User Management", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "data", label: "Data Management", icon: Database },
    { id: "security", label: "Security", icon: Shield },
    { id: "appearance", label: "Appearance", icon: Palette },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "firm":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Firm Information</h3>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firmName">Firm Name *</Label>
                    <Input
                      id="firmName"
                      {...form.register("firmName")}
                      className="mt-1"
                    />
                    {form.formState.errors.firmName && (
                      <p className="text-sm text-destructive mt-1">
                        {form.formState.errors.firmName.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="contactPerson">Contact Person *</Label>
                    <Input
                      id="contactPerson"
                      {...form.register("contactPerson")}
                      className="mt-1"
                    />
                    {form.formState.errors.contactPerson && (
                      <p className="text-sm text-destructive mt-1">
                        {form.formState.errors.contactPerson.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="contactNumber">Contact Number *</Label>
                    <Input
                      id="contactNumber"
                      {...form.register("contactNumber")}
                      className="mt-1"
                    />
                    {form.formState.errors.contactNumber && (
                      <p className="text-sm text-destructive mt-1">
                        {form.formState.errors.contactNumber.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      {...form.register("email")}
                      className="mt-1"
                    />
                    {form.formState.errors.email && (
                      <p className="text-sm text-destructive mt-1">
                        {form.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="gstin">GSTIN</Label>
                    <Input
                      id="gstin"
                      {...form.register("gstin")}
                      placeholder="22AAAAA0000A1Z5"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    {...form.register("address")}
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Firm Logo</Label>
                  <div className="mt-2 border-2 border-dashed border-muted rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Upload your firm logo (Max 2MB, PNG/JPG)
                    </p>
                    <Button type="button" variant="outline" onClick={handleLogoUpload}>
                      Choose File
                    </Button>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button 
                    type="submit" 
                    disabled={updateSettingsMutation.isPending}
                    className="flex items-center"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {updateSettingsMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        );

      case "users":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">User Management</h3>
              <Button>
                <User className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{firmSettings?.contactPerson || "Administrator"}</h4>
                    <p className="text-sm text-muted-foreground">{firmSettings?.email}</p>
                    <div className="flex items-center mt-2">
                      <Badge>Administrator</Badge>
                      <Badge variant="outline" className="ml-2">Active</Badge>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="text-center py-8 text-muted-foreground">
              <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Multi-user support coming soon!</p>
            </div>
          </div>
        );

      case "notifications":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Notification Preferences</h3>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Reminder Notifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Email Reminders</Label>
                      <p className="text-sm text-muted-foreground">Get email notifications for upcoming due dates</p>
                    </div>
                    <Switch
                      checked={notificationSettings.emailReminders}
                      onCheckedChange={(value) => handleNotificationChange("emailReminders", value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>SMS Reminders</Label>
                      <p className="text-sm text-muted-foreground">Get SMS notifications for urgent reminders</p>
                    </div>
                    <Switch
                      checked={notificationSettings.smsReminders}
                      onCheckedChange={(value) => handleNotificationChange("smsReminders", value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Browser Notifications</Label>
                      <p className="text-sm text-muted-foreground">Show desktop notifications in browser</p>
                    </div>
                    <Switch
                      checked={notificationSettings.browserNotifications}
                      onCheckedChange={(value) => handleNotificationChange("browserNotifications", value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Report Notifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Weekly Reports</Label>
                      <p className="text-sm text-muted-foreground">Receive weekly practice summary</p>
                    </div>
                    <Switch
                      checked={notificationSettings.weeklyReports}
                      onCheckedChange={(value) => handleNotificationChange("weeklyReports", value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Monthly Reports</Label>
                      <p className="text-sm text-muted-foreground">Receive monthly financial reports</p>
                    </div>
                    <Switch
                      checked={notificationSettings.monthlyReports}
                      onCheckedChange={(value) => handleNotificationChange("monthlyReports", value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "data":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Data Management</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center">
                    <Database className="w-4 h-4 mr-2" />
                    Backup Data
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Export all your data including clients, payments, and settings
                  </p>
                  <Button onClick={handleBackupData} className="w-full">
                    Download Backup
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center">
                    <Upload className="w-4 h-4 mr-2" />
                    Import Data
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Import data from backup or migrate from another system
                  </p>
                  <Button onClick={handleImportData} variant="outline" className="w-full">
                    Import Data
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base text-destructive flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Danger Zone
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  These actions are irreversible. Please proceed with caution.
                </p>
                <div className="space-y-3">
                  <Button variant="destructive" className="w-full">
                    Reset All Data
                  </Button>
                  <Button variant="outline" className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground">
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "security":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Security Settings</h3>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Password & Authentication</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Current Password</Label>
                  <Input type="password" className="mt-1" />
                </div>
                <div>
                  <Label>New Password</Label>
                  <Input type="password" className="mt-1" />
                </div>
                <div>
                  <Label>Confirm New Password</Label>
                  <Input type="password" className="mt-1" />
                </div>
                <Button>Update Password</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Two-Factor Authentication</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Button variant="outline">
                    Enable 2FA
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Login Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Current Session</p>
                      <p className="text-xs text-muted-foreground">Chrome on Windows • Now</p>
                    </div>
                    <Badge className="status-active">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "appearance":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Appearance & Display</h3>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Theme</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Dark mode support coming soon!
                </p>
                <div className="flex items-center space-x-4">
                  <Button variant="outline" className="flex-1">
                    Light Mode
                  </Button>
                  <Button variant="outline" className="flex-1" disabled>
                    Dark Mode
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Language & Region</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Language</Label>
                  <select className="w-full mt-1 px-3 py-2 border border-input rounded-md">
                    <option value="en">English</option>
                    <option value="hi" disabled>Hindi (Coming Soon)</option>
                  </select>
                </div>
                <div>
                  <Label>Currency</Label>
                  <select className="w-full mt-1 px-3 py-2 border border-input rounded-md">
                    <option value="inr">Indian Rupee (₹)</option>
                  </select>
                </div>
                <div>
                  <Label>Date Format</Label>
                  <select className="w-full mt-1 px-3 py-2 border border-input rounded-md">
                    <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                    <option value="mm/dd/yyyy">MM/DD/YYYY</option>
                    <option value="yyyy-mm-dd">YYYY-MM-DD</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return <div>Select a settings category</div>;
    }
  };

  return (
    <>
      <Header
        title="Settings"
        subtitle="Configure your practice management preferences"
        showQuickActions={false}
      />

      <main className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Settings Navigation */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-base">Settings</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <nav className="space-y-1">
                {tabItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-none border-0 text-left transition-colors ${
                        activeTab === item.id
                          ? "bg-primary/10 text-primary border-r-2 border-primary"
                          : "text-muted-foreground hover:bg-muted/50"
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-3" />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>

          {/* Settings Content */}
          <Card className="lg:col-span-3">
            <CardContent className="p-6">
              {isLoading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading settings...</p>
                </div>
              ) : (
                renderTabContent()
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
