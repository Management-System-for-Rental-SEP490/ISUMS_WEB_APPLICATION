import { useState } from "react";

const PALETTES = [
  "from-teal-400 to-emerald-500",
  "from-blue-400 to-indigo-500",
  "from-amber-400 to-orange-500",
  "from-rose-400 to-pink-500",
  "from-violet-400 to-purple-500",
];

export default function AvatarCircle({ initials, index, name }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative flex-shrink-0"
      style={{ marginLeft: index === 0 ? 0 : "-8px", zIndex: hovered ? 10 : 5 - index }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className={`w-7 h-7 rounded-full bg-gradient-to-br ${PALETTES[index % PALETTES.length]} flex items-center justify-center text-white text-[10px] font-bold border-2 border-white cursor-default transition-transform duration-150 ${hovered ? "scale-110" : ""}`}
      >
        {initials}
      </div>

      {hovered && name && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap pointer-events-none"
          style={{ background: "#1E2D28", color: "#ffffff", boxShadow: "0 4px 12px rgba(0,0,0,0.18)" }}
        >
          {name}
          <div
            className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0"
            style={{ borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderTop: "5px solid #1E2D28" }}
          />
        </div>
      )}
    </div>
  );
}
