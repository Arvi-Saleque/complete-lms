"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent,
  type FocusEvent,
  type RefObject
} from "react";
import {
  convertBijoyToUnicode,
  looksLikeBijoyText
} from "@/lib/bangla/bijoy-to-unicode";

type BanglaMode = "unicode" | "bijoy";

export type BanglaFieldOptions<Element extends HTMLInputElement | HTMLTextAreaElement> = {
  defaultValue?: string | number | readonly string[];
  detectBijoyPaste?: boolean;
  onBlur?: (event: FocusEvent<Element>) => void;
  onChange?: (event: ChangeEvent<Element>) => void;
  onPaste?: (event: ClipboardEvent<Element>) => void;
  showBijoyControls?: boolean;
  value?: string | number | readonly string[];
};

function textValue(value: string | number | readonly string[] | undefined) {
  if (Array.isArray(value)) return value.join(",");
  return String(value ?? "");
}

export function useBanglaField<Element extends HTMLInputElement | HTMLTextAreaElement>({
  defaultValue,
  detectBijoyPaste = true,
  onBlur,
  onChange,
  onPaste,
  value
}: BanglaFieldOptions<Element>) {
  const fieldRef = useRef<Element>(null);
  const [mode, setMode] = useState<BanglaMode>("unicode");
  const [fieldValue, setFieldValue] = useState(() => textValue(value ?? defaultValue));
  const [showPasteWarning, setShowPasteWarning] = useState(false);

  const currentFieldValue = value === undefined ? fieldValue : textValue(value);

  const convertCurrentValue = useCallback(
    (force = false) => {
      const currentValue = fieldRef.current?.value ?? currentFieldValue;
      const converted = convertBijoyToUnicode(currentValue, { force });

      if (fieldRef.current) fieldRef.current.value = converted;
      setFieldValue(converted);
      setShowPasteWarning(false);
      return converted;
    },
    [currentFieldValue]
  );

  useEffect(() => {
    const form = fieldRef.current?.form;
    if (!form) return;

    const handleSubmit = () => {
      if (mode === "bijoy") convertCurrentValue(true);
    };

    form.addEventListener("submit", handleSubmit, true);
    return () => form.removeEventListener("submit", handleSubmit, true);
  }, [convertCurrentValue, mode]);

  return {
    controls: {
      convert: () => convertCurrentValue(mode === "bijoy"),
      mode,
      setMode,
      showPasteWarning
    },
    fieldProps: {
      onBlur: (event: FocusEvent<Element>) => {
        if (mode === "bijoy") convertCurrentValue(true);
        onBlur?.(event);
      },
      onChange: (event: ChangeEvent<Element>) => {
        setFieldValue(event.currentTarget.value);
        onChange?.(event);
      },
      onPaste: (event: ClipboardEvent<Element>) => {
        if (detectBijoyPaste) {
          setShowPasteWarning(looksLikeBijoyText(event.clipboardData.getData("text")));
        }
        onPaste?.(event);
      },
      ref: fieldRef as RefObject<Element>,
      value: currentFieldValue
    }
  };
}

export function BanglaFieldControls({
  convert,
  mode,
  setMode,
  showPasteWarning
}: {
  convert: () => string;
  mode: BanglaMode;
  setMode: (mode: BanglaMode) => void;
  showPasteWarning: boolean;
}) {
  return (
    <div className="mt-1.5 space-y-1.5">
      <div className="flex flex-wrap items-center gap-1 text-xs">
        <span className="mr-1 text-muted-foreground">Bangla input:</span>
        {(["unicode", "bijoy"] as const).map((item) => (
          <button
            aria-pressed={mode === item}
            className={
              mode === item
                ? "rounded-md border bg-secondary px-2 py-1 font-medium text-foreground"
                : "rounded-md border bg-background px-2 py-1 text-muted-foreground hover:bg-secondary"
            }
            key={item}
            onClick={() => setMode(item)}
            type="button"
          >
            {item === "unicode" ? "Unicode" : "BIJOY"}
          </button>
        ))}
        <button
          className="rounded-md px-2 py-1 font-medium text-primary hover:bg-secondary"
          onClick={convert}
          type="button"
        >
          Convert BIJOY → Unicode
        </button>
      </div>
      {showPasteWarning ? (
        <p className="text-xs text-muted-foreground">
          This looks like BIJOY text. Convert to Unicode?{" "}
          <button className="font-medium text-primary" onClick={convert} type="button">
            Convert now
          </button>
        </p>
      ) : null}
    </div>
  );
}

export function BanglaInputHelp() {
  return (
    <p className="text-xs text-muted-foreground">
      Use Unicode Bangla normally. If your office types with BIJOY, enable BIJOY mode or paste and
      convert before saving.
    </p>
  );
}
