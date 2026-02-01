import { redirect } from "next/navigation";
import { routing } from "@/i18n/routing";

interface Props {
    params: Promise<{ id: string }>;
}

// Root project detail page - redirects to default locale with prefix
// With localePrefix: "always", all pages must have a locale prefix
export default async function RootProjectPage({ params }: Props) {
    const { id } = await params;
    redirect(`/${routing.defaultLocale}/projects/${id}`);
}
