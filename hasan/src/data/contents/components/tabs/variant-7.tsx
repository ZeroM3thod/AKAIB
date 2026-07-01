import { useState } from "react";

const TABS = ["Overview", "Details", "Settings"];

export default function Tabs7() {
  const [active, setActive] = useState(0);
  return (
    <div className="flex gap-1 rounded-lg border border-white/10 bg-white/5 p-1">
      {TABS.map((tab, i) => (
        <button
          key={tab}
          onClick={() => setActive(i)}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            active === i ? "bg-primary text-black" : "text-white/60 hover:text-white"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
