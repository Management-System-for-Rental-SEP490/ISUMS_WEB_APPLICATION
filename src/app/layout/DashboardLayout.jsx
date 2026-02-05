import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/dashboard/Sidebar';
import AlertsList from '../../components/dashboard/AlertsList';
import ChartSection from '../../components/dashboard/ChartSection';
import PropertyCard from '../../components/dashboard/PropertyCard';
import StatsCard from '../../components/dashboard/StatsCard';
// Import các page components
import Properties from './Properties';
import Utilities from './Utilities';
import Tenants from './Tenants';
import ContractsPage from '../../features/contracts/pages/ContractsPage';
import Reports from './Reports';
import Notifications from './Notifications';
import Settings from './Settings';
import { authActions } from "../../features/auth/store/auth.store";
import {
  Search, Menu, X, MapPin, 
  Building2, Users, TrendingUp, DollarSign, Zap, Droplet, Flame, 
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth >= 1024);
  const [activeTab, setActiveTab] = useState('electricity');
  
  // State quản lý việc chuyển trang trên Sidebar
  const [activeMenu, setActiveMenu] = useState('dashboard');

  const stats = [
    { title: 'Tổng Bất Động Sản', value: '18', subtitle: 'Quận 1, 2, 7, Bình Thạnh', change: '12.5%', isIncrease: true, icon: Building2, color: 'teal' },
    { title: 'Khách Thuê', value: '234', subtitle: '97.2% tỷ lệ lấp đầy', change: '3.8%', isIncrease: true, icon: Users, color: 'green' },
    { title: 'Tiết Kiệm Năng Lượng', value: '15.2%', subtitle: 'so với tháng trước', change: '15.2%', isIncrease: true, icon: TrendingUp, color: 'yellow' },
    { title: 'Tiết Kiệm Chi Phí', value: '₫45.8M', subtitle: 'Tháng này', change: '8.4%', isIncrease: true, icon: DollarSign, color: 'blue' }
  ];

  const alerts = [
    { id: 1, property: 'Vinhomes Central Park', issue: 'Phát hiện điện năng bất thường', severity: 'critical', time: '2 phút trước', icon: Zap },
    { id: 2, property: 'Masteri Thảo Điền', issue: 'Phát hiện rò rỉ nước', severity: 'warning', time: '15 phút trước', icon: Droplet },
    { id: 3, property: 'Saigon Pearl', issue: 'Tiêu thụ gas cao', severity: 'warning', time: '1 giờ trước', icon: Flame },
    { id: 4, property: 'Landmark 81', issue: 'Sắp chạm giới hạn công suất', severity: 'warning', time: '3 giờ trước', icon: Zap }
  ];

  const properties = [
    { id: 1, name: 'Vinhomes Central Park', address: '208 Nguyễn Hữu Cảnh', status: 'Cảnh Báo', statusColor: 'red', occupancy: '30/32', occupancyPercent: 94, electricity: { value: '8.5k', unit: 'kWh' }, water: { value: '4.8k', unit: 'm³' }, gas: { value: '680', unit: 'kg' } },
    { id: 2, name: 'Masteri Thảo Điền', address: '159 Xa lộ Hà Nội', status: 'Tốt Ưu', statusColor: 'green', occupancy: '24/24', occupancyPercent: 100, electricity: { value: '6.2k', unit: 'kWh' }, water: { value: '3.1k', unit: 'm³' }, gas: { value: '420', unit: 'kg' } },
    { id: 3, name: 'Saigon Pearl', address: '92 Nguyễn Hữu Cảnh', status: 'Cao', statusColor: 'orange', occupancy: '25/28', occupancyPercent: 89, electricity: { value: '7.8k', unit: 'kWh' }, water: { value: '3.8k', unit: 'm³' }, gas: { value: '560', unit: 'kg' } },
    { id: 4, name: 'Landmark 81', address: '720A Điện Biên Phủ', status: 'Tốt Ưu', statusColor: 'green', occupancy: '42/48', occupancyPercent: 88, electricity: { value: '12.4k', unit: 'kWh' }, water: { value: '5.2k', unit: 'm³' }, gas: { value: '890', unit: 'kg' } }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Đóng menu"
          onClick={() => setIsSidebarOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/40 z-30"
        />
      )}

      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={() => setIsSidebarOpen((v) => !v)}
        onLogout={() => {
          authActions.logout();
          navigate('/login');
        }} 
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
      />  
      
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Toggle chỉ dành cho mobile để header gọn hơn */}
            <button
              type="button"
              onClick={() => setIsSidebarOpen((v) => !v)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              aria-label={isSidebarOpen ? 'Đóng menu' : 'Mở menu'}
            >
              {isSidebarOpen ? <X className="w-6 h-6 text-gray-600" /> : <Menu className="w-6 h-6 text-gray-600" />}
            </button>
            <h1 className="text-xl font-bold text-gray-900">
              {activeMenu === 'dashboard' ? 'Trang chủ' : 
               activeMenu === 'properties' ? 'Bất Động Sản' :
               activeMenu === 'utilities' ? 'Tiện Ích' :
               activeMenu === 'tenants' ? 'Khách Thuê' :
               activeMenu === 'contracts' ? 'Quản lý hợp đồng' :
               activeMenu === 'reports' ? 'Báo Cáo' :
               activeMenu === 'notifications' ? 'Thông Báo' :
               activeMenu === 'settings' ? 'Cài Đặt' : activeMenu}
            </h1>
          </div>  

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-4 py-2 w-64">
              <Search className="w-5 h-5 text-gray-400 mr-2" />
              <input type="text" placeholder="Tìm kiếm..." className="bg-transparent outline-none text-sm w-full" />
            </div>
            <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center text-white font-semibold">A</div>
          </div>
        </header>

        <main className="flex-1 p-6">
          {/* Render content dựa trên activeMenu */}
          {activeMenu === 'dashboard' && (
            <>
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">Xin chào, Admin 👋</h2>
                  <p className="text-gray-600">Quản lý tiện ích thông minh</p>
                </div>
                <div className="flex gap-3">
                  <button className="px-4 py-2 border rounded-lg text-sm flex items-center gap-2"><MapPin size={16}/> Bản đồ</button>
                  <button className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm">Thêm Bất Động Sản</button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((s, i) => <StatsCard key={i} {...s} />)}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2"><ChartSection activeTab={activeTab} setActiveTab={setActiveTab} /></div>
                <AlertsList alerts={alerts} />
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <h3 className="text-lg font-semibold mb-6">Danh Sách Bất Động Sản</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                  {properties.map(p => <PropertyCard key={p.id} property={p} />)}
                </div>
              </div>
            </>
          )}
          
          {activeMenu === 'properties' && <Properties />}
          {activeMenu === 'utilities' && <Utilities />}
          {activeMenu === 'tenants' && <Tenants />}
          {activeMenu === 'contracts' && <ContractsPage onNavigateMenu={setActiveMenu} />}
          {activeMenu === 'reports' && <Reports />}
          {activeMenu === 'notifications' && <Notifications />}
          {activeMenu === 'settings' && <Settings />}
        </main>
      </div>
    </div>
  );
}