"use client";

import { useState } from "react";
import { approveBusiness, rejectBusiness } from "@/actions/business";
import { Button } from "@/components/ui/button";

export default function RequestCard({ business }) {
  const [loading, setLoading] = useState(false);
  const [uniqueId, setUniqueId] = useState(`MESS-${Math.floor(1000 + Math.random() * 9000)}`);

  const handleApprove = async () => {
    setLoading(true);
    await approveBusiness(business.id, uniqueId);
    setLoading(false);
  };

  const handleReject = async () => {
    setLoading(true);
    await rejectBusiness(business.id);
    setLoading(false);
  };

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col">
      <div className="p-6 flex-1 space-y-4">
        <div>
          <h3 className="font-semibold text-lg">{business.name}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Submitted by: {business.owner?.name || business.owner?.email}
          </p>
        </div>

        <div className="text-sm space-y-2">
          <div className="grid grid-cols-3 gap-2">
            <span className="text-muted-foreground font-medium">Phone:</span>
            <span className="col-span-2">{business.phone}</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <span className="text-muted-foreground font-medium">Address:</span>
            <span className="col-span-2">{business.address}</span>
          </div>
        </div>

        <div className="pt-4 border-t">
          <label className="text-xs font-medium text-muted-foreground block mb-1">
            Assign Unique Mess ID
          </label>
          <input
            type="text"
            value={uniqueId}
            onChange={(e) => setUniqueId(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="MESS-1234"
          />
        </div>
      </div>
      
      <div className="p-6 pt-0 flex gap-3">
        <Button 
          className="flex-1 bg-green-600 hover:bg-green-700 text-white" 
          onClick={handleApprove}
          disabled={loading || !uniqueId}
        >
          Approve
        </Button>
        <Button 
          variant="destructive"
          className="flex-1"
          onClick={handleReject}
          disabled={loading}
        >
          Reject
        </Button>
      </div>
    </div>
  );
}
