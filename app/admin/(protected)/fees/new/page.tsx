import { FeeRecordForm } from "@/components/admin/fee-record-form";
import { PageHeader } from "@/components/admin/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { createFeeRecordAction } from "@/lib/actions";
import { createClient } from "@/lib/supabase/server";

export default async function NewFeePage() {
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
