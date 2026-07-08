"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitBusinessProfile } from "@/actions/business";
import { Button } from "@/components/ui/button";

export default function BusinessProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    const formData = new FormData(e.target);
    const data = {
      name: formData.get("name"),
      address: formData.get("address"),
      phone: formData.get("phone")
    };

    const res = await submitBusinessProfile(data);
    if (res.success) {
      router.push("/pending-approval");
    } else {
      setError(res.error);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-background p-8 shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">Create Business Profile</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Tell us about your mess to get started.
          </p>
        </div>
        
        {error && <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">Business Name</label>
              <input id="name" name="name" type="text" required className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="E.g., Annapurna Mess" />
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-1">Phone Number</label>
              <input id="phone" name="phone" type="tel" required className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="10-digit number" />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium mb-1">Complete Address</label>
              <textarea id="address" name="address" required rows={3} className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="Building, Street, City" />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Submitting..." : "Submit Profile"}
          </Button>
        </form>
      </div>
    </div>
  );
}
