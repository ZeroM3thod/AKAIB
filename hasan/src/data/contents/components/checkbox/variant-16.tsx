import { useState } from "react";

export default function Checkbox16() {
  const [checked, setChecked] = useState(true);
  return (
    <button
      onClick={() => setChecked(!checked)}
      className={`flex h-8 w-8 items-center justify-center rounded-md border transition-colors ${
        checked ? "border-primary bg-primary" : "border-white/20 bg-white/5"
      }`}
    >
      {checked && (
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-black" fill="none" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
    </button>
  );
}
