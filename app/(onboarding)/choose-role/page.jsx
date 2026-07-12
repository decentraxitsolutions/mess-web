"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setUserRole } from "@/actions/user";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChefHat, User } from "lucide-react";
import { useUser } from "@clerk/nextjs";

export default function ChooseRolePage() {
  const router = useRouter();
  const { user: clerkUser, isLoaded } = useUser();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [error, setError] = useState("");

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  const handleRoleSelection = async (role) => {
    setLoading(true);
    setError("");
    setSelectedRole(role);

    // Call checkUser via Clerk or directly set user role in db.
    // Wait, we need the internal user ID, which we get by looking up the clerkUserId.
    // Let's implement a backend action to handle role assignment for the currently logged-in Clerk user.
    // Since our setUserRole takes internal userId, let's adjust setUserRole to use the logged-in Clerk user automatically!
    // Yes! Let's check: in actions/user.js:
    // setUserRole(userId, role) - checks if the user is authorized. We can modify setUserRole in actions/user.js
    // to find the user by their Clerk ID, so we don't have to pass their internal ID.
    // Let's modify setUserRole to read the current clerk user inside the server action.
    const res = await setUserRole(role);
    if (res.success) {
      if (role === "CLIENT_ADMIN") {
        router.push("/business-profile");
      } else {
        router.push("/customer/register");
      }
    } else {
      setError(res.error || "Failed to update role. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background py-12 px-4 sm:px-6 lg:px-8">
      {/* Background decorations */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-indigo-50 via-background to-background" />
      <div className="absolute top-1/2 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-200/20 blur-3xl" />

      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
            <ChefHat className="h-6 w-6" />
          </div>
          <h2 className="mt-6 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Welcome to <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">MessApp</span>
          </h2>
          <p className="mt-3 text-lg text-muted-foreground">
            Let's customize your experience. Select your role to get started.
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-destructive/15 p-4 text-sm text-destructive text-center font-medium">
            {error}
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Client Admin Option */}
          <Card 
            className={`group relative overflow-hidden border-2 cursor-pointer transition-all duration-300 hover:shadow-xl hover:border-indigo-600 ${selectedRole === "CLIENT_ADMIN" ? "border-indigo-600 ring-2 ring-indigo-600/20 bg-indigo-50/10" : "border-border bg-card"}`}
            onClick={() => !loading && handleRoleSelection("CLIENT_ADMIN")}
          >
            <CardHeader className="space-y-1 pb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white mb-2">
                <ChefHat className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl font-bold group-hover:text-indigo-600 transition-colors">Mess Owner</CardTitle>
              <CardDescription className="text-sm">
                Register your business, define meal packages, print bills, and track daily scans.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 text-xs text-muted-foreground">
              Select this to manage your hostel, PG, or commercial mess operations.
            </CardContent>
            {loading && selectedRole === "CLIENT_ADMIN" && (
              <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
              </div>
            )}
          </Card>

          {/* Customer Option */}
          <Card 
            className={`group relative overflow-hidden border-2 cursor-pointer transition-all duration-300 hover:shadow-xl hover:border-indigo-600 ${selectedRole === "CUSTOMER" ? "border-indigo-600 ring-2 ring-indigo-600/20 bg-indigo-50/10" : "border-border bg-card"}`}
            onClick={() => !loading && handleRoleSelection("CUSTOMER")}
          >
            <CardHeader className="space-y-1 pb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white mb-2">
                <User className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl font-bold group-hover:text-blue-600 transition-colors">Mess Customer</CardTitle>
              <CardDescription className="text-sm">
                Scan your QR code for meals, check daily menus, view bills, and track meal history.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 text-xs text-muted-foreground">
              Select this if you eat at an approved mess and want to track your plan.
            </CardContent>
            {loading && selectedRole === "CUSTOMER" && (
              <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
