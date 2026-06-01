"use client";

import {
  useCallback,
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent,
  type FocusEvent,
  type InputEvent as ReactInputEvent,
  type KeyboardEvent,
  type RefObject
} from "react";
import { useBanglaInputMode } from "@/lib/bangla/bangla-input-mode";
import {
  applyBijoyKey,
  convertBijoyPaste,
  shouldApplyBijoyKey
} from "@/lib/bangla/bijoy-keyboard";

export type BanglaFieldOptions<Element extends HTMLInputElement | HTMLTextAreaElement> = {
  defaultValue?: string | number | readonly string[];
  detectBijoyPaste?: boolean;
  onBeforeInput?: (event: ReactInputEvent<Element>) => void;
  onBlur?: (event: FocusEvent<Element>) => void;
  onChange?: (event: ChangeEvent<Element>) => void;
  onKeyDown?: (event: KeyboardEvent<Element>) => void;
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
  onBeforeInput,
  onBlur,
  onChange,
  onKeyDown,
  onPaste,
  value
}: BanglaFieldOptions<Element>) {
  const fieldRef = useRef<Element>(null);
  const [mode] = useBanglaInputMode();
  const [fieldValue, setFieldValue] = useState(() => textValue(value ?? defaultValue));

  const currentFieldValue = value === undefined ? fieldValue : textValue(value);

  const commitValue = useCallback((element: Element, nextValue: string, caret: number) => {
    const descriptor = Object.getOwnPropertyDescriptor(
      element instanceof HTMLTextAreaElement
        ? HTMLTextAreaElement.prototype
        : HTMLInputElement.prototype,
      "value"
    );

    if (descriptor?.set) {
      descriptor.set.call(element, nextValue);
    } else {
      element.value = nextValue;
    }
    setFieldValue(nextValue);
    element.dispatchEvent(new Event("input", { bubbles: true }));

    const restoreCaret = () => {
      try {
        element.setSelectionRange(caret, caret);
      } catch {
        // Some input types do not expose text selection.
      }
    };

    restoreCaret();

    if (typeof requestAnimationFrame === "function") {
      requestAnimationFrame(restoreCaret);
    }
  }, []);

  const insertText = useCallback(
    (element: Element, text: string) => {
      const selectionStart = element.selectionStart ?? element.value.length;
      const selectionEnd = element.selectionEnd ?? selectionStart;
      const nextValue =
        element.value.slice(0, selectionStart) + text + element.value.slice(selectionEnd);

      commitValue(element, nextValue, selectionStart + text.length);
    },
    [commitValue]
  );

  return {
    fieldProps: {
      onBeforeInput: (event: ReactInputEvent<Element>) => {
        onBeforeInput?.(event);
        if (event.defaultPrevented || mode !== "bijoy") return;

        const nativeEvent = event.nativeEvent as InputEvent;
        if (
          nativeEvent.isComposing ||
          nativeEvent.inputType !== "insertText" ||
          !nativeEvent.data ||
          nativeEvent.data.length !== 1
        ) {
          return;
        }

        const element = event.currentTarget;
        const selectionStart = element.selectionStart ?? element.value.length;
        const selectionEnd = element.selectionEnd ?? selectionStart;
        const next = applyBijoyKey(element.value, nativeEvent.data, selectionStart, selectionEnd);
        if (!next) return;

        event.preventDefault();
        commitValue(element, next.value, next.caret);
      },
      onBlur: (event: FocusEvent<Element>) => {
        onBlur?.(event);
      },
      onChange: (event: ChangeEvent<Element>) => {
        setFieldValue(event.currentTarget.value);
        onChange?.(event);
      },
      onKeyDown: (event: KeyboardEvent<Element>) => {
        onKeyDown?.(event);
        if (
          mode !== "bijoy" ||
          !shouldApplyBijoyKey({
            altKey: event.altKey,
            ctrlKey: event.ctrlKey,
            defaultPrevented: event.defaultPrevented,
            isComposing: event.nativeEvent.isComposing,
            key: event.key,
            metaKey: event.metaKey
          })
        ) {
          return;
        }

        const element = event.currentTarget;
        const selectionStart = element.selectionStart ?? element.value.length;
        const selectionEnd = element.selectionEnd ?? selectionStart;
        const next = applyBijoyKey(element.value, event.key, selectionStart, selectionEnd);
        if (!next) return;

        event.preventDefault();
        commitValue(element, next.value, next.caret);
      },
      onPaste: (event: ClipboardEvent<Element>) => {
        onPaste?.(event);
        if (event.defaultPrevented || mode !== "bijoy" || !detectBijoyPaste) return;

        const pastedText = event.clipboardData.getData("text");
        const converted = convertBijoyPaste(pastedText);
        if (converted !== pastedText) {
          event.preventDefault();
          insertText(event.currentTarget, converted);
        }
      },
      ref: fieldRef as RefObject<Element>,
      value: currentFieldValue
    }
  };
}

export function BanglaInputHelp() {
  return (
    <p className="text-xs text-muted-foreground">
      Choose Unicode or BIJOY once from Bangla typing. Bangla entries are saved as Unicode.
    </p>
  );
}
