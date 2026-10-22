import type { Metadata } from "next";
import { RequestScreen } from "@/src/screens/request-screen";
export const metadata: Metadata = { title: "Request an expert visit | Fixauto", description: "Describe your car symptoms and request an expert assessment. Browser-local demo; appointment subject to confirmation." };
export default function NewCasePage() { return <RequestScreen />; }
