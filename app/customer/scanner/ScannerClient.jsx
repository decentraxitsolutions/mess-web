"use client";

import { useState, useRef, useEffect } from "react";
import { recordCustomerSelfCheckIn } from "@/actions/meals";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { QrCode, ShieldAlert, CheckCircle, AlertTriangle, Scan, Keyboard, Calendar, Clock, Award } from "lucide-react";
import { toast } from "sonner";
import { Html5Qrcode } from "html5-qrcode";

export default function ScannerClient({ messUniqueId, messName, initialActivePass }) {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(
    initialActivePass ? { success: true, ...initialActivePass } : null
  );
  const [useManualInput, setUseManualInput] = useState(false);
  const [scanSessionKey, setScanSessionKey] = useState(0);
  
  const qrScannerRef = useRef(null);
  const isProcessingRef = useRef(false);
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
          dinerName: res.dinerName,
          mealType: res.mealType,
          timestamp: res.timestamp,
          remainingMeals: res.remainingMeals,
          totalMeals: res.totalMeals,
          businessName: res.businessName
        });
        toast.success(`Check-in verified successfully!`);
      } else {
        playBeep(false);
        setFeedback({
          success: false,
          error: res.error || "Meal check-in failed."
        });
        toast.error(res.error || "Check-in failed");
        // Reset processing locks on failure so they can try again
        isProcessingRef.current = false;
        setScanSessionKey((k) => k + 1);
      }
    } catch (e) {
      playBeep(false);
      setFeedback({
        success: false,
        error: e.message
      });
      toast.error(e.message);
      isProcessingRef.current = false;
      setScanSessionKey((k) => k + 1);
    } finally {
      setLoading(false);
    }
  };

  const handleManualCheckInSubmit = (e) => {
    e.preventDefault();
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    handleSelfCheckIn(messUniqueId);
  };

  // Camera scanner hook
  useEffect(() => {
    if (useManualInput || (feedback && feedback.success)) {
      return;
    }

    const html5QrCode = new Html5Qrcode("reader");
    qrScannerRef.current = html5QrCode;

    const startScanner = async () => {
      try {
        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 15,
            qrbox: { width: 220, height: 220 }
          },
          async (decodedText) => {
            if (isProcessingRef.current) return;
            isProcessingRef.current = true;

            try {
              if (html5QrCode.isScanning) {
                await html5QrCode.stop();
              }
            } catch (stopErr) {
              console.log("Stop failed during callback", stopErr);
            }

            handleSelfCheckIn(decodedText);
          },
          (errorMessage) => {}
        );
      } catch (err) {
        console.error("Camera access failed", err);
        toast.error("Could not access camera. Please use manual check-in fallback.");
      }
    };

    startScanner();

    return () => {
      if (html5QrCode.isScanning) {
        html5QrCode.stop().catch(err => console.log("Stop in cleanup failed", err));
      }
    };
  }, [useManualInput, scanSessionKey]);

  return (
    <div className="space-y-6 max-w-xl mx-auto font-sans">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Scan className="h-7 w-7 text-indigo-600 animate-pulse" /> Self Check-In Scanner
        </h1>
        <p className="text-muted-foreground">Scan your mess owner's QR code screen to log your meal.</p>
      </div>

      {/* RENDER DINE PASS CONFIRMATION CARD ON SUCCESS */}
      {feedback && feedback.success ? (
        <Card className="border-4 border-emerald-500 rounded-3xl bg-emerald-50/50 p-6 text-center space-y-6 shadow-2xl relative overflow-hidden max-w-md mx-auto">
          <div className="absolute inset-0 border-8 border-emerald-400 opacity-20 animate-pulse rounded-2xl pointer-events-none" />
          
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg animate-bounce">
            <CheckCircle className="h-10 w-10" />
          </div>
          
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full shadow-sm">
              <Award className="h-3.5 w-3.5" /> Verified Dine Pass
            </span>
            <h2 className="text-2xl font-extrabold text-emerald-950 mt-3">{feedback.dinerName}</h2>
            <p className="text-xs font-semibold text-emerald-800">{feedback.businessName}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 border-y border-emerald-200/80 py-4 text-left text-xs text-emerald-900">
            <div>
              <span className="text-[10px] text-emerald-700 block uppercase font-bold tracking-wider mb-0.5">Meal Checked</span>
              <span className="font-extrabold text-sm uppercase tracking-wide flex items-center gap-1 text-emerald-950">
                ● {feedback.mealType}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-emerald-700 block uppercase font-bold tracking-wider mb-0.5">Check-in Time</span>
              <span className="font-mono font-bold text-sm text-emerald-950">
                {new Date(feedback.timestamp).toLocaleTimeString("en-US", { timeZone: "Asia/Kolkata", hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center text-xs font-semibold text-emerald-800 pt-2">
            <span>Thalis Remaining Balance:</span>
            <span className="text-base font-bold text-emerald-950">{feedback.remainingMeals} / {feedback.totalMeals}</span>
          </div>

          <CardFooter className="p-0 pt-4 flex gap-2">
            <Button 
              onClick={() => {
                setFeedback(null);
                isProcessingRef.current = false;
                setScanSessionKey((k) => k + 1);
              }} 
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white border-none shadow-lg shadow-emerald-200 font-semibold"
            >
              Done / Scan Next Meal
            </Button>
          </CardFooter>
        </Card>
      ) : (
        /* SCANNING AND CODE INPUT FORMS */
        <Card className="overflow-hidden border-2 border-indigo-100 shadow-xl bg-card">
          
          {!useManualInput ? (
            <div className="relative bg-neutral-950 aspect-[4/3] flex flex-col items-center justify-center overflow-hidden">
              <div 
                id="reader" 
                className="absolute inset-0 w-full h-full [&_video]:object-cover [&_video]:w-full [&_video]:h-full" 
              />
              <div className="absolute inset-0 pointer-events-none z-10">
                <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse" />
                <div className="absolute top-8 left-8 w-8 h-8 border-t-4 border-l-4 border-indigo-500 rounded-tl-md" />
                <div className="absolute top-8 right-8 w-8 h-8 border-t-4 border-r-4 border-indigo-500 rounded-tr-md" />
                <div className="absolute bottom-8 left-8 w-8 h-8 border-b-4 border-l-4 border-indigo-500 rounded-bl-md" />
                <div className="absolute bottom-8 right-8 w-8 h-8 border-b-4 border-r-4 border-indigo-500 rounded-br-md" />
              </div>
            </div>
          ) : (
            <div className="bg-indigo-50/30 border-b p-6 text-center space-y-2">
              <Calendar className="h-8 w-8 mx-auto text-indigo-600 animate-pulse" />
              <h3 className="font-bold text-indigo-900 text-sm">One-Tap Quick Check-In</h3>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                No dropdown choices needed. Simply click below to check in at your registered mess.
              </p>
            </div>
          )}

          <CardContent className="pt-6 space-y-4">
            {/* Feedback Display for Failures */}
            {feedback && !feedback.success && (
              <div className="p-4 rounded-xl border flex gap-3 text-xs bg-red-50 border-red-200 text-red-900">
                <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm mb-0.5">Check-in Blocked</p>
                  <p className="leading-relaxed font-medium">{feedback.error}</p>
                </div>
              </div>
            )}

            {/* Mode Switcher */}
            <div className="flex gap-2 justify-center border-b pb-4">
              <Button
                type="button"
                variant={!useManualInput ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setUseManualInput(false);
                  isProcessingRef.current = false;
                  setFeedback(null);
                }}
                className="gap-1.5"
              >
                <Scan className="h-4 w-4" /> Live Camera Scan
              </Button>
              <Button
                type="button"
                variant={useManualInput ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setUseManualInput(true);
                  isProcessingRef.current = false;
                  setFeedback(null);
                }}
                className="gap-1.5"
              >
                <Keyboard className="h-4 w-4" /> One-Tap Confirm
              </Button>
            </div>

            {/* Form displays */}
            {useManualInput && (
              <form onSubmit={handleManualCheckInSubmit} className="space-y-6 pt-2">
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

                <div className="bg-amber-50/50 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-900 flex gap-2">
                  <Clock className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    Note: A strict <span className="font-bold">3-hour window protection</span> prevents double meal deductions.
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold gap-2 shadow-lg shadow-indigo-200 h-10 text-sm"
                >
                  {loading ? "Verifying..." : `Confirm Check-In at ${messName}`}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
