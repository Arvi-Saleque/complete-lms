import { FeeRecordForm } from "@/components/admin/fee-record-form";
import { PageHeader } from "@/components/admin/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { createFeeRecordAction } from "@/lib/actions";
import { createClient } from "@/lib/supabase/server";

function feeFormError(code?: string) {
  if (code === "duplicate-fee") {
    return "This fee record already exists for this student, fee type, month, and session.";
  }
  return undefined;
}

export default async function NewFeePage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const supabase = await createClient();
  const [{ data: students }, { data: feeTypes }] = await Promise.all([
    supabase.from("students").select("id,name,roll,classes(name)").eq("status", "active").order("name"),
    supabase.from("fee_types").select("*").eq("is_active", true).order("name")
  ]);
  const studentRows = (students ?? []) as any[];
  const feeTypeRows = (feeTypes ?? []) as any[];

  return (
    <>
      <PageHeader
        title="Create Fee Record"
        description="Assign a dynamic fee to a student. Amount can come from the selected fee type."
      />
      <Card>
        <CardContent className="pt-4">
          {feeFormError(resolvedSearchParams.error) ? (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {feeFormError(resolvedSearchParams.error)}
            </div>
          ) : null}
          <FeeRecordForm
            action={createFeeRecordAction}
            students={studentRows}
            feeTypes={feeTypeRows}
          />
        </CardContent>
      </Card>
    </>
  );
}
