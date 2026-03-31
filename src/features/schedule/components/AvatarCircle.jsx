const PALETTES = [
  "from-teal-400 to-emerald-500",
  "from-blue-400 to-indigo-500",
  "from-amber-400 to-orange-500",
  "from-rose-400 to-pink-500",
  "from-violet-400 to-purple-500",
];

export default function AvatarCircle({ initials, index }) {
  return (
    <div
      className={`w-7 h-7 rounded-full bg-gradient-to-br ${PALETTES[index % PALETTES.length]} flex items-center justify-center text-white text-[10px] font-bold border-2 border-white flex-shrink-0`}
      style={{ marginLeft: index === 0 ? 0 : "-8px" }}
    >
      {initials}
    </div>
  );
}
