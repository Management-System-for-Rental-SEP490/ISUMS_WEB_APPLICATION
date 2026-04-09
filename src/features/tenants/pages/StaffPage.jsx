import React, { useState } from 'react';
import { UserCog, Search, Plus, Phone, Mail, Shield, MoreVertical } from 'lucide-react';

const MOCK_STAFF = [
  { id: 1, name: 'Nguyễn Văn An', role: 'Kỹ thuật viên', phone: '0901 234 567', email: 'an.nguyen@isums.vn', status: 'active', avatar: 'A' },
  { id: 2, name: 'Trần Thị Bình', role: 'Quản lý tòa nhà', phone: '0912 345 678', email: 'binh.tran@isums.vn', status: 'active', avatar: 'B' },
  { id: 3, name: 'Lê Minh Cường', role: 'Kỹ thuật viên', phone: '0923 456 789', email: 'cuong.le@isums.vn', status: 'inactive', avatar: 'C' },
  { id: 4, name: 'Phạm Thu Dung', role: 'Hỗ trợ khách hàng', phone: '0934 567 890', email: 'dung.pham@isums.vn', status: 'active', avatar: 'D' },
];

const ROLE_COLORS = {
  'Kỹ thuật viên': 'bg-blue-100 text-blue-700',
  'Quản lý tòa nhà': 'bg-teal-100 text-teal-700',
  'Hỗ trợ khách hàng': 'bg-purple-100 text-purple-700',
};

export default function StaffPage() {
  const [search, setSearch] = useState('');

  const filtered = MOCK_STAFF.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Nhân Viên</h2>
          <p className="text-gray-500 text-sm">{MOCK_STAFF.length} nhân viên trong hệ thống</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-semibold transition shadow-sm">
          <Plus className="w-4 h-4" />
          Thêm nhân viên
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Tổng nhân viên</p>
          <p className="text-2xl font-bold text-gray-900">{MOCK_STAFF.length}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Đang hoạt động</p>
          <p className="text-2xl font-bold text-teal-600">{MOCK_STAFF.filter(s => s.status === 'active').length}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Tạm ngừng</p>
          <p className="text-2xl font-bold text-gray-400">{MOCK_STAFF.filter(s => s.status === 'inactive').length}</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border shadow-sm p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc vai trò..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="p-5 border-b">
          <h3 className="font-semibold text-gray-900">Danh Sách Nhân Viên ({filtered.length})</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {filtered.map(staff => (
            <div key={staff.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {staff.avatar}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-semibold text-gray-900 text-sm">{staff.name}</p>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${ROLE_COLORS[staff.role] ?? 'bg-gray-100 text-gray-600'}`}>
                    {staff.role}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{staff.phone}</span>
                  <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{staff.email}</span>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                  staff.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${staff.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`} />
                  {staff.status === 'active' ? 'Hoạt động' : 'Tạm ngừng'}
                </span>
                <button className="p-1.5 hover:bg-gray-100 rounded-lg transition">
                  <MoreVertical className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-12">
              <UserCog className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Không tìm thấy nhân viên nào</p>
            </div>
          )}
        </div>
      </div>

      {/* Coming soon notice */}
      <div className="flex items-start gap-3 p-4 bg-teal-50 border border-teal-200 rounded-xl text-sm text-teal-700">
        <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <p>Tính năng phân quyền và tạo tài khoản nhân viên đang được phát triển.</p>
      </div>
    </div>
  );
}
