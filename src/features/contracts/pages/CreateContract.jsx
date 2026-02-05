import React, { useMemo, useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';

export default function CreateContract({ onCancel, onCreated }) {
  const todayISO = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const [form, setForm] = useState({
    contractNumber: '',
    tenantName: '',
    tenantPhone: '',
    tenantEmail: '',
    landlordName: '',
    landlordPhone: '',
    landlordEmail: '',
    propertyName: '',
    unit: '',
    startDate: todayISO,
    endDate: '',
    paymentType: 'monthly',
    rent: '',
    deposit: '',
    autoRenew: true,
    terms: '',
    notes: '',
  });

  const update = (key) => (e) => {
    const value = e?.target?.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const canSubmit =
    form.contractNumber.trim() &&
    form.tenantName.trim() &&
    form.landlordName.trim() &&
    form.propertyName.trim() &&
    form.startDate &&
    form.endDate &&
    String(form.rent).trim();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    // TODO: tích hợp API thật sau
    onCreated?.(form);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Tạo Hợp Đồng</h2>
          <p className="text-gray-600">Nhập thông tin người thuê, chủ cho thuê và điều kiện hợp đồng</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm flex items-center gap-2 hover:bg-gray-50 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </button>
          <button
            type="submit"
            form="create-contract-form"
            disabled={!canSubmit}
            className="px-4 py-2 bg-teal-600 disabled:bg-teal-300 text-white rounded-lg text-sm flex items-center gap-2 hover:bg-teal-700 disabled:hover:bg-teal-300 transition"
          >
            <Save className="w-4 h-4" />
            Lưu hợp đồng
          </button>
        </div>
      </div>

      <form id="create-contract-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Thông tin chung */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Thông tin chung</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Số hợp đồng *</label>
              <input
                value={form.contractNumber}
                onChange={update('contractNumber')}
                placeholder="VD: HD-2026-001"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hình thức thanh toán</label>
              <select
                value={form.paymentType}
                onChange={update('paymentType')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="monthly">Hàng tháng</option>
                <option value="quarterly">Hàng quý</option>
                <option value="yearly">Hàng năm</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ngày bắt đầu *</label>
              <input
                type="date"
                value={form.startDate}
                onChange={update('startDate')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ngày kết thúc *</label>
              <input
                type="date"
                value={form.endDate}
                onChange={update('endDate')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="md:col-span-2 flex items-center justify-between border border-gray-200 rounded-lg px-4 py-3">
              <div>
                <p className="text-sm font-medium text-gray-900">Tự động gia hạn</p>
                <p className="text-xs text-gray-500">Tự động gia hạn khi đến ngày kết thúc (nếu được phép)</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.autoRenew}
                  onChange={update('autoRenew')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Bên thuê */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Thông tin người thuê</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Họ tên người thuê *</label>
              <input
                value={form.tenantName}
                onChange={update('tenantName')}
                placeholder="Nguyễn Văn A"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
              <input
                value={form.tenantPhone}
                onChange={update('tenantPhone')}
                placeholder="090xxxxxxx"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={form.tenantEmail}
                onChange={update('tenantEmail')}
                placeholder="tenant@email.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Chủ cho thuê */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Thông tin chủ cho thuê</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Họ tên chủ cho thuê *</label>
              <input
                value={form.landlordName}
                onChange={update('landlordName')}
                placeholder="Trần Thị B"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
              <input
                value={form.landlordPhone}
                onChange={update('landlordPhone')}
                placeholder="090xxxxxxx"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={form.landlordEmail}
                onChange={update('landlordEmail')}
                placeholder="landlord@email.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Bất động sản */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Bất động sản cho thuê</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tên bất động sản *</label>
              <input
                value={form.propertyName}
                onChange={update('propertyName')}
                placeholder="Vinhomes Central Park"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Căn/Phòng</label>
              <input
                value={form.unit}
                onChange={update('unit')}
                placeholder="A101"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Tài chính */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Tài chính</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tiền thuê/tháng (VND) *</label>
              <input
                inputMode="numeric"
                value={form.rent}
                onChange={update('rent')}
                placeholder="15000000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tiền cọc (VND)</label>
              <input
                inputMode="numeric"
                value={form.deposit}
                onChange={update('deposit')}
                placeholder="30000000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Điều khoản */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Điều kiện / Điều khoản hợp đồng</h3>
          <textarea
            value={form.terms}
            onChange={update('terms')}
            placeholder="Nhập điều khoản, nghĩa vụ, phí phát sinh, quy định thanh toán..."
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú</label>
            <textarea
              value={form.notes}
              onChange={update('notes')}
              placeholder="Ghi chú nội bộ (không bắt buộc)"
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>
      </form>
    </div>
  );
}
