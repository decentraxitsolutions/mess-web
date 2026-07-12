"use client";

import { useState, useRef, useEffect } from "react";
import { recordCustomerSelfCheckIn } from "@/actions/meals";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QrCode, ShieldAlert, Sparkles, CheckCircle, AlertTriangle, Scan, Keyboard } from "lucide-react";
import { toast } from "sonner";

export default function ScannerClient() {
  const [loading, setLoading] = useState(false);
  const [qrPayload, setQrPayload] = useState("");
  const [feedback, setFeedback] = useState(null); // { success: boolean, message: string }
  const [useManualInput, setUseManualInput] = useState(false);

  const feedbackTimeout = useRef(null);

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
        setQrPayload("");
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

  // Simulated scan button that mimics scanning a payload
  const handleSimulatedScan = () => {
    if (!qrPayload.trim()) {
      toast.error("Please enter or select a payload first.");
      return;
    }
    handleSelfCheckIn(qrPayload);
  };

  useEffect(() => {
    return () => {
      if (feedbackTimeout.current) clearTimeout(feedbackTimeout.current);
    };
  }, []);

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Scan className="h-7 w-7 text-indigo-600 animate-pulse" /> Self Check-In Scanner
        </h1>
        <p className="text-muted-foreground">Scan your mess owner's QR code screen to log your meal.</p>
      </div>

      {/* Main Scanner Console */}
      <Card className="overflow-hidden border-2 border-indigo-100 shadow-xl bg-card">
        {/* Scanner Viewfinder Area */}
        <div className="relative bg-neutral-950 aspect-[4/3] flex flex-col items-center justify-center p-4">
          
          {/* Laser scanning line */}
          <div className="absolute left-0 right-0 top-1/2 h-1 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse" />

          {/* Camera corners */}
          <div className="absolute top-8 left-8 w-8 h-8 border-t-4 border-l-4 border-indigo-500 rounded-tl-md" />
          <div className="absolute top-8 right-8 w-8 h-8 border-t-4 border-r-4 border-indigo-500 rounded-tr-md" />
          <div className="absolute bottom-8 left-8 w-8 h-8 border-b-4 border-l-4 border-indigo-500 rounded-bl-md" />
          <div className="absolute bottom-8 right-8 w-8 h-8 border-b-4 border-r-4 border-indigo-500 rounded-br-md" />

          {/* Icon / Helper inside viewfinder */}
          <div className="text-center text-white/40 space-y-2 pointer-events-none select-none max-w-xs">
            <Scan className="h-12 w-12 mx-auto text-indigo-400/30 animate-bounce" />
            <p className="text-xs">Hold your camera up to the Mess QR Code screen</p>
          </div>
        </div>

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

          {/* Input selection */}
          <div className="flex gap-2 justify-center border-b pb-4">
            <Button
              type="button"
              variant={!useManualInput ? "default" : "outline"}
              size="sm"
              onClick={() => setUseManualInput(false)}
              className="gap-1.5"
            >
              <Scan className="h-4 w-4" /> Camera Scan Simulation
            </Button>
            <Button
              type="button"
              variant={useManualInput ? "default" : "outline"}
              size="sm"
              onClick={() => setUseManualInput(true)}
              className="gap-1.5"
            >
              <Keyboard className="h-4 w-4" /> Manual Check-in Code
            </Button>
          </div>

          {/* Forms */}
          {!useManualInput ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="scan-simulate" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Simulated QR Decoded Payload
                </Label>
                <Input
                  id="scan-simulate"
                  value={qrPayload}
                  onChange={(e) => setQrPayload(e.target.value)}
                  placeholder="Paste the payload from admin screen (e.g. MESS-1001:2026-07-11:LUNCH)"
                  className="w-full text-xs font-mono"
                />
              </div>
              <Button
                onClick={handleSimulatedScan}
                disabled={loading || !qrPayload}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold gap-2 shadow-lg shadow-indigo-200"
              >
                {loading ? "Checking in..." : "Trigger Simulated Scan Check-in"}
              </Button>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); handleSelfCheckIn(qrPayload); }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="manual-code" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Diner Entry Code
                </Label>
                <Input
                  id="manual-code"
                  value={qrPayload}
                  onChange={(e) => setQrPayload(e.target.value)}
                  placeholder="E.g., MESS-1001:2026-07-11:LUNCH"
                  required
                  className="w-full uppercase font-mono text-center font-bold tracking-widest"
                />
              </div>
              <Button
                type="submit"
                disabled={loading || !qrPayload}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold gap-2 shadow-lg shadow-indigo-200"
              >
                {loading ? "Verifying..." : "Verify Entry Code"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
