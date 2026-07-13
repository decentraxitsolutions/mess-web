"use client";

import { useState, useRef, useEffect } from "react";
import { recordCustomerSelfCheckIn } from "@/actions/meals";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { QrCode, ShieldAlert, CheckCircle, AlertTriangle, Scan, Keyboard, Calendar } from "lucide-react";
import { toast } from "sonner";
import { Html5Qrcode } from "html5-qrcode";

export default function ScannerClient({ messUniqueId, messName }) {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null); // { success: boolean, message: string }
  const [useManualInput, setUseManualInput] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState("");

  const qrScannerRef = useRef(null);
  const feedbackTimeout = useRef(null);

  const todayDateStr = new Date().toISOString().split("T")[0];

  // Play audio beep sound on scan success/failure
  const playBeep = (success = true) => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(success ? 880 : 330, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      setTimeout(() => osc.stop(), success ? 150 : 300);
    } catch (e) {
      console.log("Audio play failed");
    }
  };

  const handleSelfCheckIn = async (payload) => {
    if (!payload.trim()) return;
    setLoading(true);
    setFeedback(null);
    if (feedbackTimeout.current) clearTimeout(feedbackTimeout.current);

    try {
      const res = await recordCustomerSelfCheckIn(payload.trim());
      if (res.success) {
        playBeep(true);
        setFeedback({
          success: true,
          message: `Check-in Successful! Meal: ${res.mealType}. Remaining balance: ${res.remainingMeals} / ${res.totalMeals} meals.`
        });
        toast.success(`Check-in verified successfully!`);
      } else {
        playBeep(false);
        setFeedback({
          success: false,
          message: res.error || "Meal check-in failed."
        });
        toast.error(res.error || "Check-in failed");
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
      // Auto-clear feedback after 8 seconds
      feedbackTimeout.current = setTimeout(() => {
        setFeedback(null);
      }, 8000);
    }
  };

  const handleManualCheckInSubmit = (e) => {
    e.preventDefault();
    if (!selectedMealType) {
      toast.error("Please select a meal period.");
      return;
    }
    const compiledPayload = `${messUniqueId}:${todayDateStr}:${selectedMealType}`;
    handleSelfCheckIn(compiledPayload);
  };

  // Camera scanner hook
  useEffect(() => {
    if (useManualInput) {
      // If switched to manual input, ensure camera is stopped
      if (qrScannerRef.current && qrScannerRef.current.isScanning) {
        qrScannerRef.current.stop().catch(err => console.log("Stop scanner error", err));
      }
      return;
    }

    const html5QrCode = new Html5Qrcode("reader");
    qrScannerRef.current = html5QrCode;

    // Wait short time to ensure DOM element is mounted
    const startScanner = async () => {
      try {
        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 15,
            qrbox: { width: 220, height: 220 }
          },
          (decodedText) => {
            // Found QR code!
            handleSelfCheckIn(decodedText);
          },
          (errorMessage) => {
            // Silent scanner search
          }
        );
      } catch (err) {
        console.error("Camera access failed", err);
        toast.error("Could not access camera. Please use manual entry fallback.");
      }
    };

    startScanner();

    return () => {
      if (html5QrCode.isScanning) {
        html5QrCode.stop().catch(err => console.log("Stop in cleanup failed", err));
      }
    };
  }, [useManualInput]);

  return (
    <div className="space-y-6 max-w-xl mx-auto font-sans">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Scan className="h-7 w-7 text-indigo-600 animate-pulse" /> Self Check-In Scanner
        </h1>
        <p className="text-muted-foreground">Scan your mess owner's QR code screen to log your meal.</p>
      </div>

      {/* Main Scanner Console */}
      <Card className="overflow-hidden border-2 border-indigo-100 shadow-xl bg-card">
        {/* Camera Viewfinder / Manual input wrapper */}
        {!useManualInput ? (
          <div className="relative bg-neutral-950 aspect-[4/3] flex flex-col items-center justify-center overflow-hidden">
            {/* Target element for html5-qrcode video */}
            <div 
              id="reader" 
              className="absolute inset-0 w-full h-full [&_video]:object-cover [&_video]:w-full [&_video]:h-full" 
            />

            {/* Simulated overlays on top of video */}
            <div className="absolute inset-0 pointer-events-none z-10">
              {/* Laser scanning line */}
              <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse" />

              {/* Camera corners */}
              <div className="absolute top-8 left-8 w-8 h-8 border-t-4 border-l-4 border-indigo-500 rounded-tl-md" />
              <div className="absolute top-8 right-8 w-8 h-8 border-t-4 border-r-4 border-indigo-500 rounded-tr-md" />
              <div className="absolute bottom-8 left-8 w-8 h-8 border-b-4 border-l-4 border-indigo-500 rounded-bl-md" />
              <div className="absolute bottom-8 right-8 w-8 h-8 border-b-4 border-r-4 border-indigo-500 rounded-br-md" />
            </div>
          </div>
        ) : (
          <div className="bg-indigo-50/30 border-b p-6 text-center space-y-2">
            <Calendar className="h-8 w-8 mx-auto text-indigo-600 animate-pulse" />
            <h3 className="font-bold text-indigo-900 text-sm">Select Option Check-In</h3>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Select your meal period slot below to quickly deduct a thali balance.
            </p>
          </div>
        )}

        <CardContent className="pt-6 space-y-4">
          {/* Feedback Display */}
          {feedback && (
            <div className={`p-4 rounded-xl border flex gap-3 text-xs ${
              feedback.success 
                ? "bg-green-50 border-green-200 text-green-900" 
                : "bg-red-50 border-red-200 text-red-900"
            }`}>
              {feedback.success ? (
                <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-bold text-sm mb-0.5">
                  {feedback.success ? "Check-in Confirmed" : "Deduction Failed"}
                </p>
                <p className="leading-relaxed font-medium">{feedback.message}</p>
              </div>
            </div>
          )}

          {/* Mode Switcher */}
          <div className="flex gap-2 justify-center border-b pb-4">
            <Button
              type="button"
              variant={!useManualInput ? "default" : "outline"}
              size="sm"
              onClick={() => setUseManualInput(false)}
              className="gap-1.5"
            >
              <Scan className="h-4 w-4" /> Live Camera Scan
            </Button>
            <Button
              type="button"
              variant={useManualInput ? "default" : "outline"}
              size="sm"
              onClick={() => setUseManualInput(true)}
              className="gap-1.5"
            >
              <Keyboard className="h-4 w-4" /> Dropdown Selection
            </Button>
          </div>

          {/* Form displays */}
          {useManualInput && (
            <form onSubmit={handleManualCheckInSubmit} className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="bg-neutral-50 p-2.5 rounded-lg border">
                  <span className="text-[10px] text-muted-foreground block uppercase font-bold">Registered Mess</span>
                  <span className="font-bold text-foreground block truncate mt-0.5">{messName}</span>
                  <span className="text-[10px] text-indigo-600 font-mono mt-0.5 block">{messUniqueId}</span>
                </div>
                <div className="bg-neutral-50 p-2.5 rounded-lg border">
                  <span className="text-[10px] text-muted-foreground block uppercase font-bold">Dine Date</span>
                  <span className="font-bold text-foreground block mt-0.5">{new Date().toLocaleDateString()}</span>
                  <span className="text-[10px] text-muted-foreground mt-0.5 block">{todayDateStr}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meal-dropdown" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Select Meal Period
                </Label>
                <select
                  id="meal-dropdown"
                  value={selectedMealType}
                  onChange={(e) => setSelectedMealType(e.target.value)}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">-- Choose Meal Period --</option>
                  <option value="BREAKFAST">BREAKFAST (6:00 AM - 11:00 AM)</option>
                  <option value="LUNCH">LUNCH (11:00 AM - 4:00 PM)</option>
                  <option value="DINNER">DINNER (4:00 PM - 11:00 PM)</option>
                </select>
              </div>

              <Button
                type="submit"
                disabled={loading || !selectedMealType}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold gap-2 shadow-lg shadow-indigo-200"
              >
                {loading ? "Checking in..." : "Verify & Deduct Meal"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
