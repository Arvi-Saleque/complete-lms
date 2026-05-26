import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/form";
import { getAdminLanguage } from "@/lib/i18n-server";
import { translator } from "@/lib/i18n";
import { pageHref, totalPages } from "@/lib/pagination";

export async function Pagination({
  pathname,
  searchParams,
  page,
  count
}: {
  pathname: string;
  searchParams: Record<string, string | undefined>;
  page: number;
  count: number | null | undefined;
}) {
  const t = translator(await getAdminLanguage());
  const pages = totalPages(count);
  if (pages <= 1) return null;
  const visiblePages = Array.from({ length: pages }, (_, index) => index + 1).filter(
    (item) => item === 1 || item === pages || Math.abs(item - page) <= 2
  );

  return (
    <div className="flex flex-col gap-3 border-t p-3 text-sm lg:flex-row lg:items-center lg:justify-between">
      <span className="text-muted-foreground">
        {t("Page {page} of {pages}", { page, pages })}
      </span>
      <div className="flex flex-wrap items-center gap-2">
        <form action={pathname} className="flex items-center gap-2">
          {Object.entries(searchParams).map(([key, value]) =>
            value && key !== "page" ? (
              <input key={key} name={key} type="hidden" value={value} />
            ) : null
          )}
          <span className="text-muted-foreground">{t("Go to")}</span>
          <Select className="h-8 w-24" name="page" defaultValue={String(page)}>
            {Array.from({ length: pages }, (_, index) => index + 1).map((item) => (
              <option key={item} value={item}>
                {t("Page {page}", { page: item })}
              </option>
            ))}
          </Select>
          <Button size="sm" type="submit" variant="secondary">
            {t("Go")}
          </Button>
        </form>
        <div className="flex flex-wrap gap-1">
          <Button asChild size="sm" variant="outline">
            <Link href={pageHref(pathname, searchParams, Math.max(page - 1, 1))}>
              {t("Previous")}
            </Link>
          </Button>
          {visiblePages.map((item, index) => {
            const previous = visiblePages[index - 1];
            return (
              <span className="flex items-center gap-1" key={item}>
                {previous && item - previous > 1 ? (
                  <span className="px-1 text-muted-foreground">...</span>
                ) : null}
                <Button
                  asChild
                  size="sm"
                  variant={item === page ? "default" : "outline"}
                >
                  <Link href={pageHref(pathname, searchParams, item)}>{item}</Link>
                </Button>
              </span>
            );
          })}
          <Button asChild size="sm" variant="outline">
            <Link href={pageHref(pathname, searchParams, Math.min(page + 1, pages))}>
              {t("Next")}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
