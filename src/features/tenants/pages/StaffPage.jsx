import React, { useState } from 'react';
import { UserCog, Search, Plus, Phone, Mail, Shield, MoreVertical, Sparkles } from 'lucide-react';

const MOCK_STAFF = [
  { id: 1, name: 'Nguyễn Văn An', role: 'Kỹ thuật viên', phone: '0901 234 567', email: 'an.nguyen@isums.vn', status: 'active', avatar: 'A' },
  { id: 2, name: 'Trần Thị Bình', role: 'Quản lý tòa nhà', phone: '0912 345 678', email: 'binh.tran@isums.vn', status: 'active', avatar: 'B' },
  { id: 3, name: 'Lê Minh Cường', role: 'Kỹ thuật viên', phone: '0923 456 789', email: 'cuong.le@isums.vn', status: 'inactive', avatar: 'C' },
  { id: 4, name: 'Phạm Thu Dung', role: 'Hỗ trợ khách hàng', phone: '0934 567 890', email: 'dung.pham@isums.vn', status: 'active', avatar: 'D' },
];

const ROLE_STYLE = {
  'Kỹ thuật viên':     { bg: "rgba(32,150,216,0.10)",  color: "#2096d8" },
  'Quản lý tòa nhà':   { bg: "rgba(59,181,130,0.10)",  color: "#3bb582" },
  'Hỗ trợ khách hàng': { bg: "rgba(59,181,130,0.08)",  color: "#1E4A38" },
};

export default function StaffPage() {
  const [search, setSearch] = useState('');

  const filtered = MOCK_STAFF.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.role.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount   = MOCK_STAFF.filter(s => s.status === 'active').length;
  const inactiveCount = MOCK_STAFF.filter(s => s.status === 'inactive').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "rgba(59,181,130,0.12)" }}>
              <Sparkles className="w-3.5 h-3.5" style={{ color: "#3bb582" }} />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#3bb582" }}>Nhân viên</span>
          </div>
          <h2 className="font-heading text-3xl font-bold" style={{ color: "#1E2D28" }}>Nhân Viên</h2>
          <p className="text-sm mt-1" style={{ color: "#5A7A6E" }}>{MOCK_STAFF.length} nhân viên trong hệ thống</p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2.5 text-white rounded-full text-sm font-semibold transition shadow-sm"
          style={{ background: "linear-gradient(135deg, #3bb582 0%, #2096d8 100%)" }}
          onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}
        >
          <Plus className="w-4 h-4" />
          Thêm nhân viên
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: "Tổng nhân viên", value: MOCK_STAFF.length, iconBg: "rgba(59,181,130,0.12)", iconColor: "#3bb582" },
          { label: "Đang hoạt động", value: activeCount, iconBg: "rgba(59,181,130,0.12)", iconColor: "#3bb582" },
          { label: "Tạm ngừng",      value: inactiveCount, iconBg: "rgba(217,95,75,0.08)", iconColor: "#D95F4B" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl px-5 py-4 flex items-center gap-3 transition-all duration-300 hover:-translate-y-1"
            style={{ background: "#FAFFFE", border: "1px solid #C4DED5", boxShadow: "0 4px 20px -2px rgba(59,181,130,0.10)" }}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: s.iconBg }}>
              <UserCog className="w-4.5 h-4.5" style={{ color: s.iconColor }} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#5A7A6E" }}>{s.label}</p>
              <p className="text-2xl font-heading font-bold" style={{ color: "#1E2D28" }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div
        className="rounded-2xl px-4 py-3"
        style={{ background: "#FAFFFE", border: "1px solid #C4DED5", boxShadow: "0 4px 20px -2px rgba(59,181,130,0.08)" }}
      >
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "#5A7A6E" }} />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc vai trò..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-full text-sm outline-none transition"
            style={{ background: "#EAF4F0", border: "1px solid #C4DED5", color: "#1E2D28" }}
            onFocus={e => { e.currentTarget.style.background = "#ffffff"; e.currentTarget.style.borderColor = "#3bb582"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,181,130,0.12)"; }}
            onBlur={e => { e.currentTarget.style.background = "#EAF4F0"; e.currentTarget.style.borderColor = "#C4DED5"; e.currentTarget.style.boxShadow = "none"; }}
          />
        </div>
      </div>

      {/* Table */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "#FAFFFE", border: "1px solid #C4DED5", boxShadow: "0 4px 20px -2px rgba(59,181,130,0.08)" }}
      >
        <div className="px-5 py-4" style={{ borderBottom: "1px solid #C4DED5" }}>
          <h3 className="font-semibold" style={{ color: "#1E2D28" }}>Danh Sách Nhân Viên ({filtered.length})</h3>
        </div>
        <div>
          {filtered.map((staff, idx) => {
            const roleStyle = ROLE_STYLE[staff.role] ?? { bg: "#EAF4F0", color: "#5A7A6E" };
            return (
              <div
                key={staff.id}
                className="flex items-center gap-4 px-5 py-4 transition"
                style={{ borderBottom: idx < filtered.length - 1 ? "1px solid rgba(196,222,213,0.4)" : "none" }}
                onMouseEnter={e => e.currentTarget.style.background = "#F0FAF6"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #3bb582 0%, #2096d8 100%)" }}
                >
                  {staff.avatar}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-semibold text-sm" style={{ color: "#1E2D28" }}>{staff.name}</p>
                    <span
                      className="px-2 py-0.5 rounded-full text-[11px] font-medium"
                      style={{ background: roleStyle.bg, color: roleStyle.color }}
                    >
                      {staff.role}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs" style={{ color: "#5A7A6E" }}>
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{staff.phone}</span>
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{staff.email}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                    style={staff.status === 'active'
                      ? { background: "rgba(59,181,130,0.10)", color: "#3bb582" }
                      : { background: "rgba(90,122,110,0.08)", color: "#5A7A6E" }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: staff.status === 'active' ? "#3bb582" : "#5A7A6E" }}
                    />
                    {staff.status === 'active' ? 'Hoạt động' : 'Tạm ngừng'}
                  </span>
                  <button
                    className="p-1.5 rounded-lg transition"
                    onMouseEnter={e => e.currentTarget.style.background = "#EAF4F0"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <MoreVertical className="w-4 h-4" style={{ color: "#5A7A6E" }} />
                  </button>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-12">
              <UserCog className="w-12 h-12 mx-auto mb-3" style={{ color: "#C4DED5" }} />
              <p className="text-sm" style={{ color: "#5A7A6E" }}>Không tìm thấy nhân viên nào</p>
            </div>
          )}
        </div>
      </div>

      {/* Coming soon notice */}
      <div
        className="flex items-start gap-3 p-4 rounded-2xl text-sm"
        style={{ background: "rgba(59,181,130,0.06)", border: "1px solid rgba(59,181,130,0.25)", color: "#1E4A38" }}
      >
        <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "#3bb582" }} />
        <p>Tính năng phân quyền và tạo tài khoản nhân viên đang được phát triển.</p>
      </div>
    </div>
  );
}
