import { CheckCircle2, Clock } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { checkUser } from "@/lib/checkUser";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PendingApprovalPage() {
  const user = await checkUser();

  if (!user) {
    redirect("/");
  }

  // Redirect if they are already active
  if (user.status === "ACTIVE") {
    if (user.role === "CLIENT_ADMIN") {
      redirect("/dashboard");
    } else if (user.role === "CUSTOMER") {
      redirect("/customer/dashboard");
    }
  }

  if (user.role === "CUSTOMER" && !user.businessId) {
    redirect("/customer/register");
  }

  const isCustomer = user.role === "CUSTOMER";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 p-4">
      <div className="mx-auto max-w-md text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-amber-100 p-4 animate-pulse">
            <Clock className="h-12 w-12 text-amber-600" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {isCustomer ? "Registration Pending" : "Profile Under Review"}
        </h1>
        
        <p className="text-lg text-muted-foreground">
          {isCustomer 
            ? "Your customer profile has been submitted. The Mess Owner is currently reviewing your request." 
            : "Your business profile has been submitted successfully. Our Super Admin team is currently reviewing your details."
          }
        </p>
        
        <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-lg text-left space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" /> Next Steps
          </h3>
          <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
            {isCustomer ? (
              <>
                <li>Wait for the Mess Owner to approve your registration.</li>
                <li>They will assign a subscription plan to your account.</li>
                <li>You will receive access to your QR code and dashboard once approved.</li>
              </>
            ) : (
              <>
                <li>We will verify your business details.</li>
                <li>A unique Mess ID will be assigned to your account.</li>
                <li>You will be able to access your dashboard once approved.</li>
              </>
            )}
          </ul>
        </div>

        <div className="pt-4 flex flex-col items-center gap-2">
          <span className="text-sm text-muted-foreground">Logged in as {user.email}</span>
          <div className="flex gap-4 items-center">
            <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "h-10 w-10" } }} />
          </div>
        </div>
      </div>
    </div>
  );
}
