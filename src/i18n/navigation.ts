import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Create navigation utilities that are aware of the i18n routing
export const { Link, redirect, usePathname, useRouter, getPathname } =
    createNavigation(routing);
