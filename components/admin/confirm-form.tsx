"use client";

import { type ReactNode, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export function ConfirmForm({
  action,
  firstMessage,
  secondMessage,
  children,
  className
}: {
  action: (formData: FormData) => void | Promise<void>;
  firstMessage: string;
  secondMessage: string;
  children: ReactNode;
  className?: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const confirmedRef = useRef(false);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  function closeModal() {
    confirmedRef.current = false;
    setOpen(false);
    setStep(1);
  }

  function submitConfirmed() {
    confirmedRef.current = true;
    setOpen(false);
    formRef.current?.requestSubmit();
  }

  return (
    <>
      <form
        action={action}
        className={className}
        ref={formRef}
        onSubmit={(event) => {
          if (confirmedRef.current) {
            confirmedRef.current = false;
            return;
          }

          event.preventDefault();
          setOpen(true);
          setStep(1);
        }}
      >
        {children}
      </form>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4">
          <div className="w-full max-w-lg rounded-lg border bg-card shadow-xl">
            <div className="border-b p-5">
              <p className="text-lg font-semibold">
                {step === 1 ? "Confirm action" : "Final confirmation"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                This action can affect related records.
              </p>
            </div>
            <div className="space-y-4 p-5">
              <div className="rounded-md border bg-secondary/50 p-4">
                <p className="text-sm font-semibold">What will happen</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {step === 1 ? firstMessage : secondMessage}
                </p>
              </div>
              <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                Related child records may also be deleted or changed, for example fees,
                payments, attendance, marks, subject links, notes, or custom field values.
              </div>
            </div>
            <div className="flex flex-col-reverse gap-2 border-t p-5 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              {step === 1 ? (
                <Button type="button" onClick={() => setStep(2)}>
                  Continue
                </Button>
              ) : (
                <Button type="button" variant="destructive" onClick={submitConfirmed}>
                  Confirm final action
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
