import { useState } from "react";

interface Slide {
  id: number;
  img: string;
}

export function CarouselSlider({ slides }: { slides: Slide[] }) {
  const [index, setIndex] = useState(0);

  return (
    <div className="relative w-48 h-48 overflow-hidden rounded-xl border border-white/10">
      <img
        src={slides[index]?.img}
        alt=""
        className="h-full w-full object-cover transition-all duration-300"
      />
      <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
        {slides.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setIndex(i)}
            className={`h-1.5 w-1.5 rounded-full ${i === index ? "bg-primary" : "bg-white/40"}`}
          />
        ))}
      </div>
      <button
        onClick={() => setIndex((index - 1 + slides.length) % slides.length)}
        className="absolute left-1 top-1/2 -translate-y-1/2 rounded-full bg-black/40 px-2 py-1 text-white text-xs"
      >
        ‹
      </button>
      <button
        onClick={() => setIndex((index + 1) % slides.length)}
        className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-black/40 px-2 py-1 text-white text-xs"
      >
        ›
      </button>
    </div>
  );
}
