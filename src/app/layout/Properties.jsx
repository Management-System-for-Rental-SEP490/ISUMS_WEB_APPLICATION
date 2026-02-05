import React, { useState } from 'react';
import { Building2, MapPin, Users, Zap, Droplet, Flame, Plus, Search, Filter, MoreVertical, Edit, Trash2, Eye } from 'lucide-react';
import PropertyCard from '../../components/dashboard/PropertyCard';

export default function Properties() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const properties = [
    { id: 1, name: 'Vinhomes Central Park', address: '208 Nguyễn Hữu Cảnh', status: 'Cảnh Báo', statusColor: 'red', occupancy: '30/32', occupancyPercent: 94, electricity: { value: '8.5k', unit: 'kWh' }, water: { value: '4.8k', unit: 'm³' }, gas: { value: '680', unit: 'kg' } },
    { id: 2, name: 'Masteri Thảo Điền', address: '159 Xa lộ Hà Nội', status: 'Tốt Ưu', statusColor: 'green', occupancy: '24/24', occupancyPercent: 100, electricity: { value: '6.2k', unit: 'kWh' }, water: { value: '3.1k', unit: 'm³' }, gas: { value: '420', unit: 'kg' } },
    { id: 3, name: 'Saigon Pearl', address: '92 Nguyễn Hữu Cảnh', status: 'Cao', statusColor: 'orange', occupancy: '25/28', occupancyPercent: 89, electricity: { value: '7.8k', unit: 'kWh' }, water: { value: '3.8k', unit: 'm³' }, gas: { value: '560', unit: 'kg' } },
    { id: 4, name: 'Landmark 81', address: '720A Điện Biên Phủ', status: 'Tốt Ưu', statusColor: 'green', occupancy: '42/48', occupancyPercent: 88, electricity: { value: '12.4k', unit: 'kWh' }, water: { value: '5.2k', unit: 'm³' }, gas: { value: '890', unit: 'kg' } },
    { id: 5, name: 'The Nassim', address: '234 Nguyễn Văn Cừ', status: 'Tốt Ưu', statusColor: 'green', occupancy: '18/20', occupancyPercent: 90, electricity: { value: '5.1k', unit: 'kWh' }, water: { value: '2.9k', unit: 'm³' }, gas: { value: '380', unit: 'kg' } },
    { id: 6, name: 'Sunrise City', address: '123 Nguyễn Lương Bằng', status: 'Cảnh Báo', statusColor: 'red', occupancy: '35/40', occupancyPercent: 88, electricity: { value: '9.2k', unit: 'kWh' }, water: { value: '4.5k', unit: 'm³' }, gas: { value: '720', unit: 'kg' } },
  ];

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || property.statusColor === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Quản Lý Bất Động Sản</h2>
          <p className="text-gray-600">Tổng cộng {properties.length} bất động sản</p>
        </div>
        <button className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm flex items-center gap-2 hover:bg-teal-700 transition">
          <Plus className="w-4 h-4" />
          Thêm Bất Động Sản
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc địa chỉ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="green">Tốt Ưu</option>
              <option value="orange">Cao</option>
              <option value="red">Cảnh Báo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Danh Sách Bất Động Sản ({filteredProperties.length})</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProperties.map(property => (
            <div key={property.id} className="relative group">
              <PropertyCard property={property} />
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-white rounded-lg shadow-lg p-1 flex gap-1">
                  <button className="p-2 hover:bg-gray-100 rounded" title="Xem chi tiết">
                    <Eye className="w-4 h-4 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded" title="Chỉnh sửa">
                    <Edit className="w-4 h-4 text-blue-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded" title="Xóa">
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {filteredProperties.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Không tìm thấy bất động sản nào</p>
          </div>
        )}
      </div>
    </div>
  );
}
