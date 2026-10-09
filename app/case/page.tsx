import { CasesScreen } from "@/src/screens/cases-screen";
export default async function CasesPage({ searchParams }: {
  searchParams: Promise<{ caseId?: string | string[] }>;
}) {
  const params = await searchParams;
  return <CasesScreen initialCaseId={typeof params.caseId === "string" ? params.caseId : undefined} />;
}
