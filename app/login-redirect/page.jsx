import { checkUser } from "@/lib/checkUser";
import { getUserRedirectPathHelper } from "@/actions/user";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function LoginRedirectPage() {
  const user = await checkUser();
  const path = await getUserRedirectPathHelper(user);
  redirect(path);
}
