import { useState } from "react";

export function MorphingButton({
  buttonText,
  onSubmit,
}: {
  buttonText: string;
  onSubmit: () => void;
}) {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");

  const handleClick = () => {
    if (state !== "idle") return;
    setState("loading");
    setTimeout(() => {
      setState("done");
      onSubmit();
      setTimeout(() => setState("idle"), 1500);
    }, 900);
  };

  return (
    <button
      onClick={handleClick}
      className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-black transition-all duration-300 active:scale-95"
      style={{ width: state === "idle" ? "160px" : "48px", borderRadius: "999px" }}
    >
      {state === "idle" && buttonText}
      {state === "loading" && "..."}
      {state === "done" && "✓"}
    </button>
  );
}
