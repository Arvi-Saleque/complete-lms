"use client";

import { Keyboard } from "lucide-react";
import {
  banglaInputModes,
  type BanglaInputMode,
  useBanglaInputMode
} from "@/lib/bangla/bangla-input-mode";

function modeLabel(mode: BanglaInputMode) {
  return mode === "unicode" ? "Unicode" : "BIJOY Paste Only";
}

export function BanglaInputModeToggle() {
  const [mode, setMode] = useBanglaInputMode();

  return (
    <div className="space-y-2 px-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Keyboard className="h-4 w-4" />
        <span>Bangla typing</span>
      </div>
      <div className="grid grid-cols-2 rounded-md border bg-background p-1">
        {banglaInputModes.map((item) => (
          <button
            aria-pressed={mode === item}
            className={
              mode === item
                ? "rounded-sm bg-secondary px-2 py-1.5 text-sm font-medium text-foreground"
                : "rounded-sm px-2 py-1.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
            }
            key={item}
            onClick={() => setMode(item)}
            type="button"
          >
            {modeLabel(item)}
          </button>
        ))}
      </div>
    </div>
  );
}
