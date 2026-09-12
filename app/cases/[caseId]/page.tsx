import { CustomerCaseScreen } from "@/src/screens/customer-case-screen";

export default async function CustomerCasePage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  return <CustomerCaseScreen caseId={caseId} />;
}
