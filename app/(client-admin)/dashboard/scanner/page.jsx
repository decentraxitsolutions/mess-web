"use client";

import { useState, useRef, useEffect } from "react";
import { recordMealAttendance } from "@/actions/meals";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QrCode, ShieldAlert, Sparkles, CheckCircle, AlertTriangle, Play, Pause } from "lucide-react";
import { toast } from "sonner";

export default function ScannerPage() {
  const [loading, setLoading] = useState(false);
  const [mealType, setMealType] = useState("AUTO");
  
  // Simulated Viewfinder States
  const [isScanning, setIsScanning] = useState(true);
  const [manualInput, setManualInput] = useState("");
  
  // Feedback States
  const [feedback, setFeedback] = useState(null); // { success: boolean, message: string }
  const feedbackTimeout = useRef(null);

  // Play audio beep sound on scan success
  const playBeep = (success = true) => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(success ? 880 : 330, ctx.currentTime); // High pitch for success, low for error
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      setTimeout(() => osc.stop(), success ? 150 : 300);
    } catch (e) {
      console.log("Audio not supported / initialized");
    }
  };

  const handleScanSubmit = async (val) => {
    if (!val) return;
    setLoading(true);
    setFeedback(null);
    if (feedbackTimeout.current) clearTimeout(feedbackTimeout.current);

    try {
      const res = await recordMealAttendance(val, mealType);
      if (res.success) {
        playBeep(true);
        setFeedback({
          success: true,
          message: `Check-in Successful! Diner: ${res.dinerName}. Meal: ${res.mealType}. Remaining: ${res.remainingMeals}/${res.totalMeals} meals.`
        });
        toast.success(`Scan recorded for ${res.dinerName}!`);
        setManualInput("");
      } else {
        playBeep(false);
        setFeedback({
          success: false,
          message: res.error || "Attendance check-in failed."
        });
        toast.error(res.error || "Failed to log attendance");
      }
    } catch (e) {
      playBeep(false);
      setFeedback({
        success: false,
        message: e.message
      });
      toast.error(e.message);
    } finally {
      setLoading(false);
      // Clear feedback after 6 seconds
      feedbackTimeout.current = setTimeout(() => {
        setFeedback(null);
      }, 6000);
    }
  };

  const handleManualCheckIn = (e) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    handleScanSubmit(manualInput.trim());
  };

  // Clean up timers
  useEffect(() => {
    return () => {
      if (feedbackTimeout.current) clearTimeout(feedbackTimeout.current);
    };
  }, []);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">QR Attendance Scanner</h1>
        <p className="text-muted-foreground">Scan customer QR codes to validate and deduct meals automatically.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Scanner Viewfinder Box */}
        <Card className="overflow-hidden shadow-xl border bg-card">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle>Attendance Console</CardTitle>
              <CardDescription>Viewfinder simulator for diner QR codes</CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => setIsScanning(!isScanning)}
            >
              {isScanning ? <Pause className="h-4 w-4 text-amber-600" /> : <Play className="h-4 w-4 text-emerald-600" />}
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center p-6 bg-neutral-900 border-y border-neutral-800">
            {/* Viewfinder Graphic */}
            <div className="relative flex h-64 w-64 flex-col items-center justify-center rounded-2xl border-4 border-neutral-700 bg-neutral-950 overflow-hidden shadow-inner">
              {/* Scan target corners */}
              <div className="absolute top-2 left-2 h-6 w-6 border-t-4 border-l-4 border-indigo-500 rounded-tl" />
              <div className="absolute top-2 right-2 h-6 w-6 border-t-4 border-r-4 border-indigo-500 rounded-tr" />
              <div className="absolute bottom-2 left-2 h-6 w-6 border-b-4 border-l-4 border-indigo-500 rounded-bl" />
              <div className="absolute bottom-2 right-2 h-6 w-6 border-b-4 border-r-4 border-indigo-500 rounded-br" />

              {/* Animated laser line */}
              {isScanning && (
                <div className="absolute left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent animate-bounce" style={{ animationDuration: "2s" }} />
              )}

              <QrCode className={`h-24 w-24 text-neutral-700 transition-all ${isScanning ? "animate-pulse" : "opacity-30"}`} />
              
              <div className="absolute bottom-4 bg-black/60 px-3 py-1 rounded text-[10px] text-indigo-400 font-mono tracking-wider font-semibold">
                {isScanning ? "SCANNING FOR DIGITS..." : "SCANNER STANDBY"}
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-card text-xs text-muted-foreground py-3 flex justify-between">
            <span>Camera input enabled</span>
            <span className="flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-indigo-500" /> Auto-deduct active
            </span>
          </CardFooter>
        </Card>

        {/* Scan Controls & Manual Input */}
        <div className="space-y-6">
          {/* Meal Configuration Card */}
          <Card className="shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Meal Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="scan-meal-type">Assigned Meal Event</Label>
                <select
                  id="scan-meal-type"
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none"
                >
                  <option value="AUTO">Auto Detect by Hour</option>
                  <option value="BREAKFAST">Force Breakfast (6 AM - 11 AM)</option>
                  <option value="LUNCH">Force Lunch (11 AM - 4 PM)</option>
                  <option value="DINNER">Force Dinner (4 PM - 11 PM)</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Manual Input Form */}
          <Card className="shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Manual Search Check-In</CardTitle>
              <CardDescription>Input Diner ID or Clerk ID to record attendance manually.</CardDescription>
            </CardHeader>
            <form onSubmit={handleManualCheckIn}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="manual-id">Diner ID / Email</Label>
                  <Input 
                    id="manual-id" 
                    value={manualInput} 
                    onChange={(e) => setManualInput(e.target.value)} 
                    placeholder="Enter email or Diner ID" 
                    required 
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end pt-2">
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium w-full sm:w-auto" disabled={loading}>
                  {loading ? "Validating Check-In..." : "Check-in Diner"}
                </Button>
              </CardFooter>
            </form>
          </Card>

          {/* Verification Status Alert */}
          {feedback && (
            <div className={`p-4 rounded-xl border flex items-start gap-3 shadow-lg animate-in fade-in slide-in-from-bottom-2 ${
              feedback.success 
                ? "bg-green-50 border-green-200 text-green-800" 
                : "bg-red-50 border-red-200 text-red-800"
            }`}>
              {feedback.success ? (
                <CheckCircle className="h-6 w-6 text-green-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="h-6 w-6 text-red-600 shrink-0 mt-0.5" />
              )}
              <div>
                <h4 className="font-bold text-sm">{feedback.success ? "Check-In Success" : "Scan Error"}</h4>
                <p className="text-xs mt-1 leading-relaxed">{feedback.message}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
