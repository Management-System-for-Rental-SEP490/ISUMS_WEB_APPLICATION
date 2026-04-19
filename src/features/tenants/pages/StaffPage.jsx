import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Search, Plus, X, UserCog } from "lucide-react";
import { toast } from "react-toastify";
import { getStaffs, createStaff } from "../api/users.api";
import { LoadingSpinner } from "../../../components/shared/Loading";

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
      style={{
        background: "linear-gradient(135deg, #3bb582 0%, #2096d8 100%)",
      }}
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
      <div
        className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
        style={{ background: iconBg }}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.8}
          style={{ color: iconColor }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
        </svg>
      </div>
      <div>
        <p
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: "#5A7A6E" }}
        >
          {label}
        </p>
        <p
          className="text-2xl font-heading font-bold leading-tight"
          style={{ color: "#1E2D28" }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function EmptyState({ hasSearch }) {
  return (
    <div className="py-16 flex flex-col items-center gap-3 text-center">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{ background: "#EAF4F0", border: "1px solid #C4DED5" }}
      >
        <UserCog className="w-7 h-7" style={{ color: "#3bb582" }} />
      </div>
      <p className="font-semibold" style={{ color: "#1E2D28" }}>
        {hasSearch
          ? "Không tìm thấy nhân viên phù hợp"
          : "Chưa có nhân viên nào"}
      </p>
      <p className="text-sm" style={{ color: "#5A7A6E" }}>
        {hasSearch
          ? "Thử thay đổi từ khóa tìm kiếm"
          : 'Nhấn "Thêm nhân viên" để bắt đầu'}
      </p>
    </div>
  );
}

function CreateStaffModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    identityNumber: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !form.name ||
      !form.email ||
      !form.phoneNumber ||
      !form.identityNumber
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    setLoading(true);
    try {
      await createStaff(form);
      toast.success(
        "Tạo nhân viên thành công! Thông tin đăng nhập sẽ được gửi qua email " +
          form.email +
          " cho nhân viên sửa chữa",
      );
      onCreated();
    } catch (err) {
      toast.error(err.message || "Tạo nhân viên thất bại.");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    {
      label: "Họ và tên",
      name: "name",
      type: "text",
      placeholder: "Nguyễn Văn A",
    },
    {
      label: "Email",
      name: "email",
      type: "email",
      placeholder: "example@isums.vn",
    },
    {
      label: "Số điện thoại",
      name: "phoneNumber",
      type: "text",
      placeholder: "0901 234 567",
    },
    {
      label: "Số CCCD",
      name: "identityNumber",
      type: "text",
      placeholder: "012345678901",
    },
  ];

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center z-[1100]"
      style={{ background: "rgba(0,0,0,0.35)" }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6 relative"
        style={{
          background: "#FFFFFF",
          border: "1px solid #C4DED5",
          boxShadow: "0 10px 40px -10px rgba(32,150,216,0.20)",
        }}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(59,181,130,0.12)" }}
            >
              <UserCog className="w-4.5 h-4.5" style={{ color: "#3bb582" }} />
            </div>
            <h3 className="text-base font-bold" style={{ color: "#1E2D28" }}>
              Thêm nhân viên kỹ thuật
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg transition"
            onMouseEnter={(e) => (e.currentTarget.style.background = "#EAF4F0")}
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <X className="w-4 h-4" style={{ color: "#5A7A6E" }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map(({ label, name, type, placeholder }) => (
            <div key={name}>
              <label
                className="block text-xs font-semibold mb-1.5"
                style={{ color: "#5A7A6E" }}
              >
                {label}
              </label>
              <input
                type={type}
                name={name}
                value={form[name]}
                onChange={handleChange}
                placeholder={placeholder}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition"
                style={{
                  background: "#EAF4F0",
                  border: "1px solid #C4DED5",
                  color: "#1E2D28",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.background = "#fff";
                  e.currentTarget.style.borderColor = "#3bb582";
                  e.currentTarget.style.boxShadow =
                    "0 0 0 3px rgba(59,181,130,0.12)";
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
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#EAF4F0")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition"
              style={{
                background: "linear-gradient(135deg, #3bb582 0%, #2096d8 100%)",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Đang tạo..." : "Tạo nhân viên"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}

export default function StaffPage() {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const fetchStaffs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getStaffs();
      setStaffList(Array.isArray(data) ? data : (data?.items ?? []));
    } catch (err) {
      setError(err.message || "Không thể tải danh sách nhân viên.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffs();
  }, []);

  const filtered = staffList.filter(
    (s) =>
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2
            className="font-heading text-3xl font-bold"
            style={{ color: "#1E2D28" }}
          >
            Nhân Viên
          </h2>
          <p className="text-sm mt-0.5" style={{ color: "#5A7A6E" }}>
            Quản lý danh sách nhân viên kỹ thuật
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 text-white rounded-full text-sm font-semibold transition shadow-sm self-start md:self-auto"
          style={{
            background: "linear-gradient(135deg, #3bb582 0%, #2096d8 100%)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          <Plus className="w-4 h-4" />
          Thêm nhân viên
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div
          className="rounded-2xl px-4 py-3 flex items-center gap-3"
          style={{
            background: "#FFFFFF",
            border: "1px solid rgba(217,95,75,0.3)",
          }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(217,95,75,0.08)" }}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              style={{ color: "#D95F4B" }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <p
            className="text-sm font-semibold flex-1"
            style={{ color: "#D95F4B" }}
          >
            {error}
          </p>
          <button
            type="button"
            onClick={fetchStaffs}
            className="text-xs font-semibold underline underline-offset-2"
            style={{ color: "#D95F4B" }}
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          label="Tổng nhân viên"
          value={staffList.length}
          iconBg="rgba(59,181,130,0.12)"
          iconColor="#3bb582"
          iconPath="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
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
        style={{
          background: "#FFFFFF",
          border: "1px solid #C4DED5",
          boxShadow: "0 4px 20px -2px rgba(59,181,130,0.08)",
        }}
      >
        <div className="relative max-w-md">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            style={{ color: "#5A7A6E" }}
          />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-full text-sm outline-none transition"
            style={{
              background: "#EAF4F0",
              border: "1px solid #C4DED5",
              color: "#1E2D28",
            }}
            onFocus={(e) => {
              e.currentTarget.style.background = "#ffffff";
              e.currentTarget.style.borderColor = "#3bb582";
              e.currentTarget.style.boxShadow =
                "0 0 0 3px rgba(59,181,130,0.12)";
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
        <div
          className="rounded-2xl px-8 py-16 flex flex-col items-center gap-4"
          style={{ background: "#FFFFFF", border: "1px solid #C4DED5" }}
        >
          <LoadingSpinner
            size="lg"
            showLabel
            label="Đang tải danh sách nhân viên..."
          />
        </div>
      ) : (
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "#FFFFFF",
            border: "1px solid #C4DED5",
            boxShadow: "0 4px 20px -2px rgba(59,181,130,0.08)",
          }}
        >
          {filtered.length === 0 ? (
            <EmptyState hasSearch={!!search} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr
                    style={{
                      borderBottom: "1px solid #C4DED5",
                      background: "#EAF4F0",
                    }}
                  >
                    <th
                      className="text-center px-4 py-3.5 text-xs font-semibold uppercase tracking-wide w-12"
                      style={{ color: "#5A7A6E" }}
                    >
                      STT
                    </th>
                    <th
                      className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wide"
                      style={{ color: "#5A7A6E" }}
                    >
                      Nhân viên
                    </th>
                    <th
                      className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wide"
                      style={{ color: "#5A7A6E" }}
                    >
                      Email
                    </th>
                    <th
                      className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wide"
                      style={{ color: "#5A7A6E" }}
                    >
                      Số điện thoại
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((staff, idx) => (
                    <tr
                      key={staff.id}
                      className="transition"
                      style={{
                        borderBottom:
                          idx < filtered.length - 1
                            ? "1px solid rgba(196,222,213,0.4)"
                            : "none",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#F0FAF6")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <td
                        className="px-4 py-3.5 text-center text-xs font-medium"
                        style={{ color: "#5A7A6E" }}
                      >
                        {idx + 1}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar name={staff.name} />
                          <p
                            className="font-semibold"
                            style={{ color: "#1E2D28" }}
                          >
                            {staff.name}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <a
                          href={`mailto:${staff.email}`}
                          style={{ color: "#2096d8" }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.textDecoration = "underline")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.textDecoration = "none")
                          }
                        >
                          {staff.email}
                        </a>
                      </td>
                      <td className="px-5 py-3.5">
                        {staff.phoneNumber ? (
                          <span
                            className="font-mono text-xs px-2 py-0.5 rounded"
                            style={{ background: "#EAF4F0", color: "#1E4A38" }}
                          >
                            {staff.phoneNumber}
                          </span>
                        ) : (
                          <span
                            className="text-xs italic"
                            style={{ color: "#5A7A6E" }}
                          >
                            Chưa có
                          </span>
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
        <CreateStaffModal
          onClose={() => setShowModal(false)}
          onCreated={() => {
            setShowModal(false);
            fetchStaffs();
          }}
        />
      )}
    </div>
  );
}
