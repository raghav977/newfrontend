"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings, User, Shield, Bell, Database } from "lucide-react";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    siteName: "UPAAYAX",
    siteDescription: "Your trusted service marketplace",
    maintenanceMode: false,
    emailNotifications: true,
    smsNotifications: false,
    autoApproveServices: false,
    maxServicesPerProvider: 10,
    commissionRate: 5,
  });

  const handleSave = () => {
    // Handle save logic here
    console.log("Saving settings:", settings);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Settings className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Admin Settings</h1>
            <p className="text-muted-foreground">Manage your platform settings and configurations</p>
          </div>
        </div>

        <div className="grid gap-6">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                General Settings
              </CardTitle>
              <CardDescription>
                Basic platform information and configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={settings.siteName}
                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteDescription">Site Description</Label>
                  <Input
                    id="siteDescription"
                    value={settings.siteDescription}
                    onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="maintenanceMode"
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
                />
                <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>
                Configure notification preferences for users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="emailNotifications"
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                />
                <Label htmlFor="emailNotifications">Email Notifications</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="smsNotifications"
                  checked={settings.smsNotifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, smsNotifications: checked })}
                />
                <Label htmlFor="smsNotifications">SMS Notifications</Label>
              </div>
            </CardContent>
          </Card>

          {/* Service Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Service Settings
              </CardTitle>
              <CardDescription>
                Configure service approval and limits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="autoApproveServices"
                  checked={settings.autoApproveServices}
                  onCheckedChange={(checked) => setSettings({ ...settings, autoApproveServices: checked })}
                />
                <Label htmlFor="autoApproveServices">Auto-approve Services</Label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxServices">Max Services per Provider</Label>
                  <Input
                    id="maxServices"
                    type="number"
                    value={settings.maxServicesPerProvider}
                    onChange={(e) => setSettings({ ...settings, maxServicesPerProvider: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="commissionRate">Commission Rate (%)</Label>
                  <Input
                    id="commissionRate"
                    type="number"
                    value={settings.commissionRate}
                    onChange={(e) => setSettings({ ...settings, commissionRate: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Database Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Settings
              </CardTitle>
              <CardDescription>
                Database maintenance and backup options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button variant="outline">Backup Database</Button>
                <Button variant="outline">Optimize Database</Button>
                <Button variant="destructive">Clear Cache</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} className="bg-primary">
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
