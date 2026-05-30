import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Search, Plus, X, Briefcase } from "lucide-react";
import { toast } from "react-toastify";
import { getManagers, createManager } from "../api/users.api";
import { LoadingSpinner } from "../../../components/shared/Loading";

/**
 * Managers directory page — mirrors the StaffPage layout so the
 * sidebar feels consistent between Khách thuê / Nhân viên / Quản lý.
 *
 * Managers are the regional operations contacts who get the
 * escalation calls (DTMF=2 / NO_ANSWER) — see the routing matrix
 * in NotificationDispatchService. Landlord (the property owner)
 * lives in a separate role and isn't listed here.
 */

function Avatar({ name = "" }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0].toUpperCase())
    .join("");
  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
      style={{ background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" }}
    >
      {initials || "?"}
    </div>
  );
}

function StatCard({ label, value, iconPath, iconBg, iconColor }) {
  return (
    <div
      className="rounded-2xl px-5 py-4 flex items-center gap-4 transition-all duration-300 hover:-translate-y-1"
      style={{
        background: "#FFFFFF",
        border: "1px solid #C4DED5",
        boxShadow: "0 4px 20px -2px rgba(59,181,130,0.10)",
      }}
    >
      <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: iconBg }}>
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} style={{ color: iconColor }}>
          <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
        </svg>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#5A7A6E" }}>{label}</p>
        <p className="text-2xl font-heading font-bold leading-tight" style={{ color: "#1E2D28" }}>{value}</p>
      </div>
    </div>
  );
}

function EmptyState({ hasSearch }) {
  return (
    <div className="py-16 flex flex-col items-center gap-3 text-center">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "#FEF3C7", border: "1px solid #FDE68A" }}>
        <Briefcase className="w-7 h-7" style={{ color: "#d97706" }} />
      </div>
      <p className="font-semibold" style={{ color: "#1E2D28" }}>
        {hasSearch ? "Không tìm thấy quản lý phù hợp" : "Chưa có quản lý nào"}
      </p>
      <p className="text-sm" style={{ color: "#5A7A6E" }}>
        {hasSearch ? "Thử thay đổi từ khóa tìm kiếm" : 'Nhấn "Thêm quản lý" để bắt đầu'}
      </p>
    </div>
  );
}

function CreateManagerModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phoneNumber: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phoneNumber) {
      toast.error("Vui lòng điền tên, email và số điện thoại.");
      return;
    }
    setLoading(true);
    try {
      // identityNumber omitted — BE accepts it as nullable/optional and
      // the manager role doesn't legally require it (unlike technical
      // staff who handle physical assets).
      await createManager(form);
      toast.success(
        `Tạo quản lý thành công! Thông tin đăng nhập đã gửi tới ${form.email}.`
      );
      onCreated();
    } catch (err) {
      toast.error(err.message || "Tạo quản lý thất bại.");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { label: "Họ và tên",     name: "name",        type: "text",  placeholder: "Nguyễn Văn A" },
    { label: "Email",          name: "email",       type: "email", placeholder: "manager@isums.vn" },
    { label: "Số điện thoại",  name: "phoneNumber", type: "text",  placeholder: "0901 234 567" },
  ];

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center z-[1100]" style={{ background: "rgba(0,0,0,0.35)" }}>
      <div
        className="w-full max-w-md rounded-2xl p-6 relative"
        style={{
          background: "#FFFFFF",
          border: "1px solid #C4DED5",
          boxShadow: "0 10px 40px -10px rgba(245,158,11,0.20)",
        }}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(245,158,11,0.15)" }}>
              <Briefcase className="w-4.5 h-4.5" style={{ color: "#d97706" }} />
            </div>
            <h3 className="text-base font-bold" style={{ color: "#1E2D28" }}>Thêm quản lý vùng</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg transition"
            onMouseEnter={(e) => (e.currentTarget.style.background = "#EAF4F0")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <X className="w-4 h-4" style={{ color: "#5A7A6E" }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map(({ label, name, type, placeholder }) => (
            <div key={name}>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#5A7A6E" }}>{label}</label>
              <input
                type={type}
                name={name}
                value={form[name]}
                onChange={handleChange}
                placeholder={placeholder}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition"
                style={{ background: "#EAF4F0", border: "1px solid #C4DED5", color: "#1E2D28" }}
                onFocus={(e) => {
                  e.currentTarget.style.background = "#fff";
                  e.currentTarget.style.borderColor = "#f59e0b";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(245,158,11,0.15)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.background = "#EAF4F0";
                  e.currentTarget.style.borderColor = "#C4DED5";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>
          ))}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition"
              style={{ border: "1px solid #C4DED5", color: "#5A7A6E" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#EAF4F0")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >Hủy</button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition"
              style={{
                background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Đang tạo..." : "Tạo quản lý"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

export default function ManagersPage() {
  const [list, setList]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [search, setSearch]   = useState("");
  const [showModal, setModal] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getManagers();
      setList(Array.isArray(data) ? data : (data?.items ?? []));
    } catch (err) {
      setError(err.message || "Không thể tải danh sách quản lý.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const filtered = list.filter(
    (s) =>
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="font-heading text-3xl font-bold" style={{ color: "#1E2D28" }}>Quản Lý</h2>
          <p className="text-sm mt-0.5" style={{ color: "#5A7A6E" }}>
            Quản lý vùng — tiếp nhận cảnh báo escalation khi tenant không phản hồi
          </p>
        </div>
        <button
          onClick={() => setModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 text-white rounded-full text-sm font-semibold transition shadow-sm self-start md:self-auto"
          style={{ background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          <Plus className="w-4 h-4" /> Thêm quản lý
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-2xl px-4 py-3 flex items-center gap-3" style={{ background: "#FFFFFF", border: "1px solid rgba(217,95,75,0.3)" }}>
          <p className="text-sm font-semibold flex-1" style={{ color: "#D95F4B" }}>{error}</p>
          <button
            type="button"
            onClick={fetchAll}
            className="text-xs font-semibold underline underline-offset-2"
            style={{ color: "#D95F4B" }}
          >Thử lại</button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          label="Tổng quản lý"
          value={list.length}
          iconBg="rgba(245,158,11,0.15)"
          iconColor="#d97706"
          iconPath="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
        <StatCard
          label="Kết quả tìm kiếm"
          value={filtered.length}
          iconBg="rgba(32,150,216,0.12)"
          iconColor="#2096d8"
          iconPath="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </div>

      {/* Search */}
      <div
        className="rounded-2xl px-4 py-3"
        style={{ background: "#FFFFFF", border: "1px solid #C4DED5", boxShadow: "0 4px 20px -2px rgba(59,181,130,0.08)" }}
      >
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "#5A7A6E" }} />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-full text-sm outline-none transition"
            style={{ background: "#EAF4F0", border: "1px solid #C4DED5", color: "#1E2D28" }}
            onFocus={(e) => {
              e.currentTarget.style.background = "#ffffff";
              e.currentTarget.style.borderColor = "#f59e0b";
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(245,158,11,0.15)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.background = "#EAF4F0";
              e.currentTarget.style.borderColor = "#C4DED5";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="rounded-2xl px-8 py-16 flex flex-col items-center gap-4" style={{ background: "#FFFFFF", border: "1px solid #C4DED5" }}>
          <LoadingSpinner size="lg" showLabel label="Đang tải danh sách quản lý..." />
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: "#FFFFFF", border: "1px solid #C4DED5", boxShadow: "0 4px 20px -2px rgba(59,181,130,0.08)" }}>
          {filtered.length === 0 ? (
            <EmptyState hasSearch={!!search} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid #C4DED5", background: "#EAF4F0" }}>
                    <th className="text-center px-4 py-3.5 text-xs font-semibold uppercase tracking-wide w-12" style={{ color: "#5A7A6E" }}>STT</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wide" style={{ color: "#5A7A6E" }}>Quản lý</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wide" style={{ color: "#5A7A6E" }}>Email</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wide" style={{ color: "#5A7A6E" }}>Số điện thoại</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((m, idx) => (
                    <tr
                      key={m.id}
                      className="transition"
                      style={{ borderBottom: idx < filtered.length - 1 ? "1px solid rgba(196,222,213,0.4)" : "none" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#FEF9E7")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td className="px-4 py-3.5 text-center text-xs font-medium" style={{ color: "#5A7A6E" }}>{idx + 1}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar name={m.name} />
                          <p className="font-semibold" style={{ color: "#1E2D28" }}>{m.name}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <a
                          href={`mailto:${m.email}`}
                          style={{ color: "#2096d8" }}
                          onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                          onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                        >
                          {m.email}
                        </a>
                      </td>
                      <td className="px-5 py-3.5">
                        {m.phoneNumber ? (
                          <span className="font-mono text-xs px-2 py-0.5 rounded" style={{ background: "#FEF3C7", color: "#92400E" }}>
                            {m.phoneNumber}
                          </span>
                        ) : (
                          <span className="text-xs italic" style={{ color: "#5A7A6E" }}>Chưa có</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <CreateManagerModal
          onClose={() => setModal(false)}
          onCreated={() => { setModal(false); fetchAll(); }}
        />
      )}
    </div>
  );
}
