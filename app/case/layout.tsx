import type { ReactNode } from "react";
import { CaseShell } from "@/src/components/case-shell";

export default function CaseLayout({ children }: { children: ReactNode }) {
  return <CaseShell>{children}</CaseShell>;
}
