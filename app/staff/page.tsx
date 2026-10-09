import { StaffWorkspaceScreen } from "@/src/screens/staff-workspace-screen";
export default async function StaffPage({ searchParams }: { searchParams: Promise<{ caseId?: string | string[] }> }) {
  const params = await searchParams;
  return <StaffWorkspaceScreen initialCaseId={typeof params.caseId === "string" ? params.caseId : undefined} />;
}
