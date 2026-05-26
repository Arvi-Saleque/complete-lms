import Link from "next/link";
import { ConfirmForm } from "@/components/admin/confirm-form";
import { Pagination } from "@/components/admin/pagination";
import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/form";
import { EmptyState } from "@/components/ui/empty";
import { Table, Td, Th } from "@/components/ui/table";
import { deleteStudentAction } from "@/lib/actions";
import { getAdminTranslator } from "@/lib/i18n-server";
import { pageFromSearch, rangeForPage } from "@/lib/pagination";
import { createClient } from "@/lib/supabase/server";

export default async function StudentsPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; class?: string; status?: string; session?: string; page?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const t = await getAdminTranslator();
  const page = pageFromSearch(resolvedSearchParams.page);
  const { from, to } = rangeForPage(page);
  const supabase = await createClient();
  const [{ data: classes }, studentsResult] = await Promise.all([
    supabase.from("classes").select("id,name").eq("is_active", true).order("sort_order"),
    (() => {
      let query = supabase
        .from("students")
        .select("id,name,roll,session_year,status,classes(name),sections(name)", {
        count: "exact"
      })
        .order("created_at", { ascending: false })
        .range(from, to);
      if (resolvedSearchParams.q) {
        query = query.or(`name.ilike.%${resolvedSearchParams.q}%,roll.ilike.%${resolvedSearchParams.q}%`);
      }
      if (resolvedSearchParams.class) query = query.eq("class_id", resolvedSearchParams.class);
      if (resolvedSearchParams.status) query = query.eq("status", resolvedSearchParams.status);
      if (resolvedSearchParams.session) query = query.eq("session_year", resolvedSearchParams.session);
      return query;
    })()
  ]);
  const studentRows = (studentsResult.data ?? []) as any[];

  return (
    <>
      <PageHeader
        title={t("Students")}
        description={t("Search, filter, and open full student records.")}
        actionHref="/admin/students/new"
        actionLabel={t("Add student")}
      />
      <Card className="mb-4">
        <CardContent className="pt-4">
          <form className="grid gap-3 md:grid-cols-5">
            <Input name="q" placeholder={t("Search name or roll")} defaultValue={resolvedSearchParams.q ?? ""} />
            <Select name="class" defaultValue={resolvedSearchParams.class ?? ""}>
              <option value="">{t("All classes")}</option>
              {(classes ?? []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
            <Input name="session" placeholder={t("Session")} defaultValue={resolvedSearchParams.session ?? ""} />
            <Select name="status" defaultValue={resolvedSearchParams.status ?? ""}>
              <option value="">{t("All statuses")}</option>
              <option value="active">{t("Active")}</option>
              <option value="left">{t("Left")}</option>
              <option value="graduated">{t("Graduated")}</option>
            </Select>
            <Button type="submit">{t("Filter")}</Button>
          </form>
        </CardContent>
      </Card>
      {studentRows.length ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <thead>
                <tr>
                  <Th>{t("Name")}</Th>
                  <Th>{t("Roll")}</Th>
                  <Th>{t("Class")}</Th>
                  <Th>{t("Section")}</Th>
                  <Th>{t("Session")}</Th>
                  <Th>{t("Status")}</Th>
                  <Th>{t("Actions")}</Th>
                </tr>
              </thead>
              <tbody>
                {studentRows.map((student) => (
                  <tr key={student.id}>
                    <Td className="font-medium">{student.name}</Td>
                    <Td>{student.roll}</Td>
                    <Td>{student.classes?.name ?? "-"}</Td>
                    <Td>{student.sections?.name ?? "-"}</Td>
                    <Td>{student.session_year}</Td>
                    <Td>
                      <Badge value={student.status} />
                    </Td>
                    <Td>
                      <div className="flex flex-wrap gap-2">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/admin/students/${student.id}`}>{t("Details")}</Link>
                        </Button>
                        {student.status !== "left" ? (
                          <ConfirmForm
                            action={deleteStudentAction}
                            firstMessage={t("Mark {name} as left? Fees, payments, attendance, marks, and notes will be kept.", { name: student.name })}
                            secondMessage={t("Final confirmation: mark this student as left?")}
                          >
                            <input name="id" type="hidden" value={student.id} />
                            <Button size="sm" type="submit" variant="outline">
                              {t("Mark left")}
                            </Button>
                          </ConfirmForm>
                        ) : null}
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <Pagination
              count={studentsResult.count}
              page={page}
              pathname="/admin/students"
              searchParams={resolvedSearchParams}
            />
          </CardContent>
        </Card>
      ) : (
        <EmptyState message={t("No students found. Add a student or change the filters.")} />
      )}
    </>
  );
}
