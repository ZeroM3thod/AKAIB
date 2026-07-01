export function KnobSlider({
  value,
  onChange,
  min,
  max,
  size = 200,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  size?: number;
}) {
  const pct = (value - min) / (max - min);
  const angle = pct * 270 - 135;

  return (
    <div className="flex flex-col items-center gap-4" style={{ width: size, height: size }}>
      <div
        className="relative flex items-center justify-center rounded-full border-2 border-white/10 bg-white/5"
        style={{ width: size * 0.6, height: size * 0.6 }}
      >
        <div
          className="absolute top-2 h-4 w-1 rounded-full bg-primary"
          style={{ transform: `rotate(${angle}deg)`, transformOrigin: "50% calc(50vw)" }}
        />
        <span className="text-2xl font-bold text-white tabular-nums">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-primary"
      />
    </div>
  );
}
