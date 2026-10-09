import type { ReactNode } from "react";
import CaseLayout from "../../case/layout";

export default async function CustomerCaseLayout({ children, params }: {
  children: ReactNode;
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  return <CaseLayout caseId={caseId}>{children}</CaseLayout>;
}
