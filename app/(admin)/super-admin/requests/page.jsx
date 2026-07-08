import { getPendingBusinesses } from "@/actions/business";
import RequestCard from "./RequestCard";

export const dynamic = "force-dynamic";

export default async function SuperAdminRequestsPage() {
  const pendingRequests = await getPendingBusinesses();

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Business Requests</h1>
        <p className="text-muted-foreground mt-2">
          Review and approve pending mess profile requests.
        </p>
      </div>

      {pendingRequests.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
          No pending requests at the moment.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pendingRequests.map((business) => (
            <RequestCard key={business.id} business={business} />
          ))}
        </div>
      )}
    </div>
  );
}
