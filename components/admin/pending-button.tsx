"use client";

import { useFormStatus } from "react-dom";
import { Button, type ButtonProps } from "@/components/ui/button";

type PendingButtonProps = ButtonProps & {
  pendingLabel: string;
};

export function PendingButton({
  children,
  disabled,
  pendingLabel,
  ...props
}: PendingButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending || disabled} {...props}>
      {pending ? pendingLabel : children}
    </Button>
  );
}
