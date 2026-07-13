"use client";

import { useState, useEffect } from "react";
import { getScannerQRData } from "@/actions/meals";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, Clock, RefreshCw, CheckCircle2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export default function AdminQRConsolePage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeMealType, setActiveMealType] = useState("LUNCH");

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getScannerQRData();
      if (res.success) {
        setData(res);
      } else {
        toast.error(res.error || "Failed to load scanner details.");
      }
    } catch (e) {
      toast.error("Error fetching scanner details.");
    } finally {
      setLoading(false);
    }
  };

  // Clock effect & active meal type auto detection
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      const hours = now.getHours();
      let detectedMeal = "LUNCH";
      if (hours >= 6 && hours < 11) detectedMeal = "BREAKFAST";
      else if (hours >= 11 && hours < 16) detectedMeal = "LUNCH";
      else if (hours >= 16 && hours < 23) detectedMeal = "DINNER";
      else detectedMeal = "CLOSED";

      setActiveMealType(detectedMeal);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Initial data load
  useEffect(() => {
    loadData();
    // Auto-refresh logs every 8 seconds for a live-like feel
    const logPoll = setInterval(() => {
      loadData();
    }, 8000);
    return () => clearInterval(logPoll);
  }, []);

  if (loading && !data) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        <p className="text-muted-foreground">Initializing live QR console...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <ShieldAlert className="h-12 w-12 text-destructive" />
        <h3 className="text-xl font-bold">Failed to initialize</h3>
        <Button onClick={loadData}>Retry</Button>
      </div>
    );
  }

  const qrPayload = data.uniqueId;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrPayload)}`;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dine Check-In QR Console</h1>
          <p className="text-muted-foreground">Display this QR code for customers to scan and log their meals.</p>
        </div>
        <Button 
          variant="outline" 
          onClick={loadData}
          disabled={loading}
          className="gap-2 border-indigo-300 text-indigo-700 hover:bg-indigo-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Force Refresh
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-5">
        {/* QR Display Card (3 columns) */}
        <Card className="md:col-span-3 shadow-xl border-2 border-indigo-100 flex flex-col justify-between overflow-hidden">
          <CardHeader className="bg-indigo-50/50 border-b pb-4 text-center">
            <CardTitle className="text-lg font-bold text-indigo-900 flex items-center justify-center gap-2">
              <QrCode className="h-5 w-5 text-indigo-600 animate-pulse" /> {data.name}
            </CardTitle>
            <CardDescription className="text-indigo-950 font-medium">Mess ID: {data.uniqueId}</CardDescription>
          </CardHeader>
          
          <CardContent className="flex flex-col items-center justify-center py-8 space-y-6">
            {/* Live QR */}
            <div className="bg-white p-4 rounded-3xl shadow-lg border-2 border-indigo-50">
              <img 
                src={qrCodeUrl} 
                alt="Mess QR Code"
                className="w-56 h-56 object-contain"
              />
            </div>

            {/* Details indicator */}
            <div className="text-center space-y-1.5 w-full max-w-xs">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                ACTIVE MEAL: {activeMealType}
              </div>
              
              <p className="text-[10px] font-mono text-muted-foreground select-all bg-muted px-3 py-1 rounded-lg">
                Mess ID Payload: {qrPayload}
              </p>
            </div>
          </CardContent>

          {/* Footer warning */}
          <div className="bg-neutral-50 p-4 border-t text-center text-xs text-muted-foreground">
            Customers must scan this code using the <span className="font-semibold text-indigo-700">Scan QR</span> option in their diner app.
          </div>
        </Card>

        {/* Live Logs Card (2 columns) */}
        <div className="md:col-span-2 space-y-6">
          {/* Clock Card */}
          <Card className="shadow-md bg-neutral-900 text-white border-none">
            <CardContent className="py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Clock className="h-5 w-5 text-indigo-400" />
                <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">Live System Clock</span>
              </div>
              <span className="text-lg font-mono font-bold tracking-widest text-indigo-300">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </CardContent>
          </Card>

          {/* Check-ins Tracker */}
          <Card className="shadow-md h-[360px] flex flex-col justify-between">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                Live Check-ins
              </CardTitle>
              <CardDescription>Real-time diner check-in confirmations</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto pt-4">
              {data.logs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-xs border border-dashed rounded-xl h-full flex flex-col items-center justify-center">
                  No check-ins recorded yet today.
                </div>
              ) : (
                <div className="space-y-4">
                  {data.logs.map((log) => (
                    <div key={log.id} className="flex justify-between items-start border-b pb-3 last:border-0 last:pb-0 text-xs">
                      <div>
                        <span className="font-bold text-neutral-900 block">
                          {log.user.name || log.user.email}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center gap-0.5 font-bold text-[9px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full mb-1">
                          <CheckCircle2 className="h-2.5 w-2.5" /> Checked
                        </span>
                        <span className="block text-[10px] font-mono text-muted-foreground">{log.mealType}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
