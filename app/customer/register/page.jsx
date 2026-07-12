"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { registerCustomerProfile } from "@/actions/user";
import { getApprovedBusinesses } from "@/actions/business";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCheck } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";

export default function CustomerRegisterPage() {
  const router = useRouter();
  const { user: clerkUser, isLoaded } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [businesses, setBusinesses] = useState([]);
  const [fetchingMesses, setFetchingMesses] = useState(true);

  useEffect(() => {
    async function loadMesses() {
      try {
        const res = await getApprovedBusinesses();
        if (res.success) {
          setBusinesses(res.businesses);
        } else {
          toast.error(res.error || "Failed to load approved messes list.");
        }
      } catch (err) {
        toast.error("Error loading messes list.");
      } finally {
        setFetchingMesses(false);
      }
    }
    loadMesses();
  }, []);

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.target);
    const data = {
      name: formData.get("name"),
      phone: formData.get("phone"),
      messId: formData.get("messId"),
      requestedPlan: formData.get("requestedPlan"),
    };

    if (!data.messId) {
      setError("Please select a mess to request joining.");
      setLoading(false);
      return;
    }

    const res = await registerCustomerProfile(data);
    if (res.success) {
      router.push("/pending-approval");
    } else {
      setError(res.error || "Failed to submit registration request.");
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background p-4 sm:p-6 lg:p-8">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-indigo-50 via-background to-background" />
      <div className="absolute top-1/2 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-200/20 blur-3xl" />

      <Card className="w-full max-w-md border shadow-2xl bg-card/70 backdrop-blur-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 mb-2">
            <UserCheck className="h-6 w-6" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">Customer Registration</CardTitle>
          <CardDescription>
            Join your mess by completing your profile.
          </CardDescription>
        </CardHeader>
        
        {error && (
          <div className="mx-6 rounded-md bg-destructive/15 p-3 text-sm text-destructive font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                defaultValue={clerkUser?.fullName || ""}
                placeholder="Enter your full name"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                required
                placeholder="10-digit phone number"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="messId">Select Mess (Mess Name & ID)</Label>
              {fetchingMesses ? (
                <div className="flex h-10 w-full items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent mr-2" />
                  Loading available messes...
                </div>
              ) : (
                <select
                  id="messId"
                  name="messId"
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">-- Choose Mess --</option>
                  {businesses.map((biz) => (
                    <option key={biz.id} value={biz.uniqueId}>
                      {biz.name} ({biz.uniqueId})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="requestedPlan">Select Preferred Subscription Plan</Label>
              <select
                id="requestedPlan"
                name="requestedPlan"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="Basic (30 Meals)">Basic (30 Meals - ₹1800)</option>
                <option value="Monthly (56 Meals)">Monthly (56 Meals - ₹3200)</option>
                <option value="Premium (90 Meals)">Premium (90 Meals - ₹5000)</option>
                <option value="Custom">Custom / Other Plan</option>
              </select>
            </div>
          </CardContent>

          <CardFooter className="pt-2">
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium" disabled={loading}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Submitting Registration...
                </span>
              ) : (
                "Submit Request"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
