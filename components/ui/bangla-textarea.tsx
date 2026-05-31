"use client";

import * as React from "react";
import { BanglaFieldControls, useBanglaField } from "@/components/ui/bangla-field";
import { cn } from "@/lib/utils";

export interface BanglaTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  detectBijoyPaste?: boolean;
  showBijoyControls?: boolean;
  wrapperClassName?: string;
}

export const BanglaTextarea = React.forwardRef<HTMLTextAreaElement, BanglaTextareaProps>(
  (
    {
      className,
      defaultValue,
      detectBijoyPaste,
      onBlur,
      onChange,
      onPaste,
      showBijoyControls = true,
      value,
      wrapperClassName,
      ...props
    },
    forwardedRef
  ) => {
    const { controls, fieldProps } = useBanglaField<HTMLTextAreaElement>({
      defaultValue,
      detectBijoyPaste,
      onBlur,
      onChange,
      onPaste,
      value
    });

    React.useImperativeHandle(forwardedRef, () => fieldProps.ref.current as HTMLTextAreaElement);

    return (
      <div className={wrapperClassName}>
        <textarea
          className={cn(
            "min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring",
            className
          )}
          {...props}
          {...fieldProps}
        />
        {showBijoyControls ? <BanglaFieldControls {...controls} /> : null}
      </div>
    );
  }
);
BanglaTextarea.displayName = "BanglaTextarea";
