import { useState } from "react";

interface Agent {
  id: string;
  name: string;
  icon: React.ReactNode;
}

export function SelectAIAgent({ agents }: { agents: Agent[] }) {
  const [selected, setSelected] = useState(agents[0]?.id);

  return (
    <div className="flex gap-3">
      {agents.map((agent) => (
        <button
          key={agent.id}
          onClick={() => setSelected(agent.id)}
          className={`flex flex-col items-center gap-2 rounded-xl border px-5 py-4 transition-all ${
            selected === agent.id
              ? "border-primary bg-primary/10 scale-105"
              : "border-white/10 bg-white/5 hover:bg-white/10"
          }`}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
            {agent.icon}
          </div>
          <span className="text-xs font-medium text-white/80">{agent.name}</span>
        </button>
      ))}
    </div>
  );
}
