export default function UsersFilters({ searchTerm, onSearch }) {
  return (
    <div
      className="rounded-2xl px-4 py-3"
      style={{ background: "#FFFFFF", border: "1px solid #C4DED5", boxShadow: "0 4px 20px -2px rgba(59,181,130,0.08)" }}
    >
      <div className="relative max-w-sm">
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          style={{ color: "#5A7A6E" }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Tìm theo tên, email, số điện thoại..."
          className="w-full pl-10 pr-8 py-2 rounded-full text-sm outline-none transition"
          style={{ background: "#EAF4F0", border: "1px solid #C4DED5", color: "#1E2D28" }}
          onFocus={e => { e.currentTarget.style.background = "#ffffff"; e.currentTarget.style.borderColor = "#3bb582"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,181,130,0.12)"; }}
          onBlur={e => { e.currentTarget.style.background = "#EAF4F0"; e.currentTarget.style.borderColor = "#C4DED5"; e.currentTarget.style.boxShadow = "none"; }}
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => onSearch("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center transition"
            style={{ background: "#C4DED5", color: "#5A7A6E" }}
            onMouseEnter={e => e.currentTarget.style.background = "#3bb582"}
            onMouseLeave={e => e.currentTarget.style.background = "#C4DED5"}
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
