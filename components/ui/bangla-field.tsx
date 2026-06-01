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
  type MouseEvent,
  type RefObject
} from "react";
import { useBanglaInputMode } from "@/lib/bangla/bangla-input-mode";
import {
  applyBijoyKeyWithState,
  type BijoyTokenState,
  handleBijoyPaste,
  shouldApplyBijoyKey
} from "@/lib/bangla/bijoy-keyboard";

export type BanglaFieldOptions<Element extends HTMLInputElement | HTMLTextAreaElement> = {
  defaultValue?: string | number | readonly string[];
  detectBijoyPaste?: boolean;
  onBeforeInput?: (event: ReactInputEvent<Element>) => void;
  onBlur?: (event: FocusEvent<Element>) => void;
  onClick?: (event: MouseEvent<Element>) => void;
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
  onClick,
  onChange,
  onKeyDown,
  onPaste,
  value
}: BanglaFieldOptions<Element>) {
  const fieldRef = useRef<Element>(null);
  const bijoyTokenRef = useRef<BijoyTokenState | null>(null);
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

  const resetBijoyToken = useCallback(() => {
    bijoyTokenRef.current = null;
  }, []);

  const applyLiveBijoyKey = useCallback(
    (element: Element, key: string, event?: Parameters<typeof applyBijoyKeyWithState>[5]) => {
      const selectionStart = element.selectionStart ?? element.value.length;
      const selectionEnd = element.selectionEnd ?? selectionStart;
      const next = applyBijoyKeyWithState(
        element.value,
        key,
        selectionStart,
        selectionEnd,
        bijoyTokenRef.current,
        event
      );

      if (!next) return null;

      bijoyTokenRef.current = next.state;
      commitValue(element, next.value, next.caret);
      return next;
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

        const next = applyLiveBijoyKey(event.currentTarget, nativeEvent.data);
        if (!next) return;

        event.preventDefault();
      },
      onBlur: (event: FocusEvent<Element>) => {
        resetBijoyToken();
        onBlur?.(event);
      },
      onClick: (event: MouseEvent<Element>) => {
        resetBijoyToken();
        onClick?.(event);
      },
      onChange: (event: ChangeEvent<Element>) => {
        setFieldValue(event.currentTarget.value);
        onChange?.(event);
      },
      onKeyDown: (event: KeyboardEvent<Element>) => {
        onKeyDown?.(event);
        if (mode !== "bijoy") return;

        const shouldApply = shouldApplyBijoyKey({
          altKey: event.altKey,
          ctrlKey: event.ctrlKey,
          defaultPrevented: event.defaultPrevented,
          isComposing: event.nativeEvent.isComposing,
          key: event.key,
          metaKey: event.metaKey
        });

        if (!shouldApply) {
          resetBijoyToken();
          return;
        }

        const next = applyLiveBijoyKey(event.currentTarget, event.key, {
          altKey: event.altKey,
          ctrlKey: event.ctrlKey,
          defaultPrevented: event.defaultPrevented,
          isComposing: event.nativeEvent.isComposing,
          key: event.key,
          metaKey: event.metaKey
        });
        if (!next) return;

        event.preventDefault();
      },
      onPaste: (event: ClipboardEvent<Element>) => {
        onPaste?.(event);
        if (event.defaultPrevented || mode !== "bijoy" || !detectBijoyPaste) return;

        resetBijoyToken();
        const pastedText = event.clipboardData.getData("text");
        const selectionStart =
          event.currentTarget.selectionStart ?? event.currentTarget.value.length;
        const selectionEnd = event.currentTarget.selectionEnd ?? selectionStart;
        const next = handleBijoyPaste(
          event.currentTarget.value,
          pastedText,
          selectionStart,
          selectionEnd
        );

        if (next.value !== event.currentTarget.value) {
          event.preventDefault();
          commitValue(event.currentTarget, next.value, next.caret);
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
