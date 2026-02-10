import { redirect } from "next/navigation";

// Root page - redirects to /en
export default function RootPage() {
    redirect("/en");
}
