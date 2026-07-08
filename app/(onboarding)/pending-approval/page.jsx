import { CheckCircle2, Clock } from "lucide-react";
import { UserButton, Show, SignInButton } from "@clerk/nextjs";

export default function PendingApprovalPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 p-4">
      <div className="mx-auto max-w-md text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-amber-100 p-4">
            <Clock className="h-12 w-12 text-amber-600" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Profile Under Review
        </h1>
        
        <p className="text-lg text-muted-foreground">
          Your business profile has been submitted successfully. Our Super Admin team is currently reviewing your details. 
        </p>
        
        <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm text-left space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" /> Next Steps
          </h3>
          <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
            <li>We will verify your business details.</li>
            <li>A unique Mess ID will be assigned to your account.</li>
            <li>You will be able to access your dashboard once approved.</li>
          </ul>
        </div>

        <div className="pt-4 flex justify-center gap-4">
          <Show when="signed-in">
            <div className="flex flex-col items-center gap-2">
              <span className="text-sm text-muted-foreground">Manage Account</span>
              <UserButton afterSignOutUrl="/" />
            </div>
          </Show>
        </div>
      </div>
    </div>
  );
}
