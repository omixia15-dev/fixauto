import type { ReactNode } from "react";
import { CaseShell } from "@/src/components/case-shell";

export default async function CustomerCaseLayout({ children, params }: {
  children: ReactNode;
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  return <CaseShell caseId={caseId}>{children}</CaseShell>;
}
