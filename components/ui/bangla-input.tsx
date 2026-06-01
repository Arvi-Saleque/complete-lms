"use client";

import * as React from "react";
import { useBanglaField } from "@/components/ui/bangla-field";
import { cn } from "@/lib/utils";

export interface BanglaInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  detectBijoyPaste?: boolean;
  showBijoyControls?: boolean;
  wrapperClassName?: string;
}

export const BanglaInput = React.forwardRef<HTMLInputElement, BanglaInputProps>(
  (
    {
      className,
      defaultValue,
      detectBijoyPaste,
      onBeforeInput,
      onBlur,
      onChange,
      onKeyDown,
      onPaste,
      showBijoyControls: _showBijoyControls,
      value,
      wrapperClassName,
      ...props
    },
    forwardedRef
  ) => {
    void _showBijoyControls;

    const { fieldProps } = useBanglaField<HTMLInputElement>({
      defaultValue,
      detectBijoyPaste,
      onBeforeInput,
      onBlur,
      onChange,
      onKeyDown,
      onPaste,
      value
    });

    React.useImperativeHandle(forwardedRef, () => fieldProps.ref.current as HTMLInputElement);

    return (
      <div className={wrapperClassName}>
        <input
          className={cn(
            "h-9 w-full rounded-md border bg-background px-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          {...props}
          {...fieldProps}
        />
      </div>
    );
  }
);
BanglaInput.displayName = "BanglaInput";
