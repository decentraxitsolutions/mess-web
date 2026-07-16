"use client";

import { useState } from "react";
import { updateBusinessSettings } from "@/actions/settings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Settings, Save, Clock, QrCode, Receipt, Store, Info, CheckCircle2 } from "lucide-react";

export default function SettingsClient({ initialSettings }) {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState(initialSettings);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleToggleChange = (e) => {
    const { name, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await updateBusinessSettings(settings);
      if (res.success) {
        toast.success("Settings saved successfully!");
      } else {
        toast.error(res.error || "Failed to save settings");
      }
    } catch (err) {
      toast.error(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 font-sans">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="h-7 w-7 text-indigo-600 animate-spin-slow" /> Mess Settings
        </h1>
        <p className="text-muted-foreground">Manage your mess profile, QR code check-ins, timing rules, and invoicing parameters.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Profile Settings */}
        <Card className="shadow-md border border-indigo-100">
          <CardHeader className="bg-indigo-50/30 border-b pb-4">
            <CardTitle className="text-md font-bold text-indigo-950 flex items-center gap-2">
              <Store className="h-4 w-4 text-indigo-600" /> Mess Profile Settings
            </CardTitle>
            <CardDescription>Update your public identity details and contact information.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="uniqueId" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Mess Unique ID (System Locked)
              </Label>
              <Input
                id="uniqueId"
                value={settings.uniqueId}
                disabled
                className="bg-neutral-50 font-mono text-indigo-600 font-bold border-neutral-200"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Mess Name
              </Label>
              <Input
                id="name"
                name="name"
                value={settings.name}
                onChange={handleInputChange}
                required
                placeholder="e.g. Annapurna Mess"
                className="border-neutral-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Phone Number
              </Label>
              <Input
                id="phone"
                name="phone"
                value={settings.phone}
                onChange={handleInputChange}
                required
                placeholder="e.g. 9876543210"
                className="border-neutral-200"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Address / Location
              </Label>
              <Input
                id="address"
                name="address"
                value={settings.address}
                onChange={handleInputChange}
                placeholder="e.g. Landmark, Near College Campus, City"
                className="border-neutral-200"
              />
            </div>
          </CardContent>
        </Card>

        {/* QR Scanner Settings */}
        <Card className="shadow-md border border-indigo-100">
          <CardHeader className="bg-indigo-50/30 border-b pb-4">
            <CardTitle className="text-md font-bold text-indigo-950 flex items-center gap-2">
              <QrCode className="h-4 w-4 text-indigo-600" /> QR & Check-In Control
            </CardTitle>
            <CardDescription>Control customer access to dine log check-ins and Dine Pass duration.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border bg-indigo-50/20 border-indigo-100">
              <div className="space-y-1">
                <span className="font-bold text-indigo-950 text-sm block">Allow Customer Check-Ins</span>
                <span className="text-xs text-muted-foreground max-w-lg block">
                  When enabled, customers can scan the mess QR code or confirm check-ins manually. When disabled, the mess is flagged as CLOSED and checks are blocked.
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="qrScanEnabled"
                  checked={settings.qrScanEnabled}
                  onChange={handleToggleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            <div className="space-y-2 max-w-xs pt-2">
              <Label htmlFor="dinePassDurationMins" className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                Dine Pass Validity (Minutes)
              </Label>
              <Input
                id="dinePassDurationMins"
                name="dinePassDurationMins"
                type="number"
                min="1"
                required
                value={settings.dinePassDurationMins}
                onChange={handleInputChange}
                className="border-neutral-200"
              />
              <span className="text-[10px] text-muted-foreground block">
                The duration (in minutes) a diner's green Dine Pass verification screen remains displayable on their dashboard after check-in.
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Meal Time Settings */}
        <Card className="shadow-md border border-indigo-100">
          <CardHeader className="bg-indigo-50/30 border-b pb-4">
            <CardTitle className="text-md font-bold text-indigo-950 flex items-center gap-2">
              <Clock className="h-4 w-4 text-indigo-600" /> Meal Time Windows
            </CardTitle>
            <CardDescription>Configure meal durations. Scans during these ranges are classified automatically.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="bg-amber-50/40 border border-amber-200/80 rounded-xl p-3.5 text-xs text-amber-900 flex gap-2.5">
              <Info className="h-4.5 w-4.5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold">Meal Assignment Rules:</p>
                <p className="text-muted-foreground leading-relaxed">
                  When a customer scans the QR code, the check-in is logged under the active slot based on their time. If the current time does not fall into any window, the check-in will be blocked automatically to prevent off-hour scans.
                </p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              
              {/* Breakfast Window */}
              <div className="p-4 rounded-xl border border-neutral-100 bg-neutral-50/50 space-y-3">
                <div className="flex items-center justify-between font-bold text-xs text-neutral-800 uppercase tracking-wide border-b pb-2">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" /> Breakfast Slot
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      name="breakfastEnabled"
                      checked={settings.breakfastEnabled}
                      onChange={handleToggleChange}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-neutral-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>
                <div className={`space-y-2 text-xs transition-opacity duration-200 ${!settings.breakfastEnabled ? "opacity-40 pointer-events-none" : ""}`}>
                  <div>
                    <Label htmlFor="breakfastStart" className="text-neutral-500">Start Time</Label>
                    <Input
                      id="breakfastStart"
                      name="breakfastStart"
                      type="time"
                      value={settings.breakfastStart}
                      onChange={handleInputChange}
                      required={settings.breakfastEnabled}
                      className="h-9 mt-1 bg-white border-neutral-200"
                    />
                  </div>
                  <div>
                    <Label htmlFor="breakfastEnd" className="text-neutral-500">End Time</Label>
                    <Input
                      id="breakfastEnd"
                      name="breakfastEnd"
                      type="time"
                      value={settings.breakfastEnd}
                      onChange={handleInputChange}
                      required={settings.breakfastEnabled}
                      className="h-9 mt-1 bg-white border-neutral-200"
                    />
                  </div>
                </div>
              </div>

              {/* Lunch Window */}
              <div className="p-4 rounded-xl border border-neutral-100 bg-neutral-50/50 space-y-3">
                <div className="flex items-center justify-between font-bold text-xs text-neutral-800 uppercase tracking-wide border-b pb-2">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" /> Lunch Slot
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      name="lunchEnabled"
                      checked={settings.lunchEnabled}
                      onChange={handleToggleChange}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-neutral-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-500"></div>
                  </label>
                </div>
                <div className={`space-y-2 text-xs transition-opacity duration-200 ${!settings.lunchEnabled ? "opacity-40 pointer-events-none" : ""}`}>
                  <div>
                    <Label htmlFor="lunchStart" className="text-neutral-500">Start Time</Label>
                    <Input
                      id="lunchStart"
                      name="lunchStart"
                      type="time"
                      value={settings.lunchStart}
                      onChange={handleInputChange}
                      required={settings.lunchEnabled}
                      className="h-9 mt-1 bg-white border-neutral-200"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lunchEnd" className="text-neutral-500">End Time</Label>
                    <Input
                      id="lunchEnd"
                      name="lunchEnd"
                      type="time"
                      value={settings.lunchEnd}
                      onChange={handleInputChange}
                      required={settings.lunchEnabled}
                      className="h-9 mt-1 bg-white border-neutral-200"
                    />
                  </div>
                </div>
              </div>

              {/* Dinner Window */}
              <div className="p-4 rounded-xl border border-neutral-100 bg-neutral-50/50 space-y-3">
                <div className="flex items-center justify-between font-bold text-xs text-neutral-800 uppercase tracking-wide border-b pb-2">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-violet-500" /> Dinner Slot
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      name="dinnerEnabled"
                      checked={settings.dinnerEnabled}
                      onChange={handleToggleChange}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-neutral-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-violet-500"></div>
                  </label>
                </div>
                <div className={`space-y-2 text-xs transition-opacity duration-200 ${!settings.dinnerEnabled ? "opacity-40 pointer-events-none" : ""}`}>
                  <div>
                    <Label htmlFor="dinnerStart" className="text-neutral-500">Start Time</Label>
                    <Input
                      id="dinnerStart"
                      name="dinnerStart"
                      type="time"
                      value={settings.dinnerStart}
                      onChange={handleInputChange}
                      required={settings.dinnerEnabled}
                      className="h-9 mt-1 bg-white border-neutral-200"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dinnerEnd" className="text-neutral-500">End Time</Label>
                    <Input
                      id="dinnerEnd"
                      name="dinnerEnd"
                      type="time"
                      value={settings.dinnerEnd}
                      onChange={handleInputChange}
                      required={settings.dinnerEnabled}
                      className="h-9 mt-1 bg-white border-neutral-200"
                    />
                  </div>
                </div>
              </div>

            </div>
          </CardContent>
        </Card>

        {/* Invoice & Billing Settings */}
        <Card className="shadow-md border border-indigo-100">
          <CardHeader className="bg-indigo-50/30 border-b pb-4">
            <CardTitle className="text-md font-bold text-indigo-950 flex items-center gap-2">
              <Receipt className="h-4 w-4 text-indigo-600" /> Invoicing & Tax Rules
            </CardTitle>
            <CardDescription>Setup default parameters for generated billing invoices.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="defaultGst" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Default GST Tax Rate (%)
              </Label>
              <Input
                id="defaultGst"
                name="defaultGst"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={settings.defaultGst}
                onChange={handleInputChange}
                required
                placeholder="e.g. 5.00"
                className="border-neutral-200"
              />
              <span className="text-[10px] text-muted-foreground mt-1 block">
                Calculated automatically on base price during invoice builds.
              </span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="invoiceDueDays" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Payment Grace Buffer (Days)
              </Label>
              <Input
                id="invoiceDueDays"
                name="invoiceDueDays"
                type="number"
                min="0"
                value={settings.invoiceDueDays}
                onChange={handleInputChange}
                required
                placeholder="e.g. 7"
                className="border-neutral-200"
              />
              <span className="text-[10px] text-muted-foreground mt-1 block">
                Number of days allowed from invoice assignment to payment due date.
              </span>
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="upiId" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                UPI ID for Diner Payments
              </Label>
              <Input
                id="upiId"
                name="upiId"
                type="text"
                value={settings.upiId || ""}
                onChange={handleInputChange}
                placeholder="e.g. business@upi or owner@okaxis"
                className="border-neutral-200 font-mono"
              />
              <span className="text-[10px] text-muted-foreground mt-1 block">
                If provided, invoices will automatically display a scannable payment QR code generated for this UPI ID.
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Submit Footer */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold gap-2 shadow-lg shadow-indigo-200 px-6 h-10"
          >
            {loading ? (
              "Saving changes..."
            ) : (
              <>
                <Save className="h-4.5 w-4.5" /> Save Mess Settings
              </>
            )}
          </Button>
        </div>

      </form>
    </div>
  );
}
