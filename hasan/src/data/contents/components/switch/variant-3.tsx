import { useState } from "react";

export default function Switch3() {
  const [on, setOn] = useState(true);
  return (
    <button
      onClick={() => setOn(!on)}
      className={`relative h-7 w-12 rounded-full transition-colors ${on ? "bg-primary" : "bg-white/20"}`}
    >
      <div
        className="absolute top-1 h-5 w-5 rounded-full bg-white transition-all"
        style={{ left: on ? "26px" : "4px" }}
      />
    </button>
  );
}
