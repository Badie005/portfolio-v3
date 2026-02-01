import { redirect } from "next/navigation";
import { routing } from "@/i18n/routing";

// Root page - redirects to default locale with prefix
// With localePrefix: "always", all pages must have a locale prefix
export default function RootPage() {
  redirect(`/${routing.defaultLocale}`);
}
