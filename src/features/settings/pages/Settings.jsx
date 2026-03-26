import React, { useState, useEffect } from "react";
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Globe,
  CreditCard,
  Save,
  Key,
  Mail,
  Phone,
  Building2,
} from "lucide-react";
import keycloak from "../../../keycloak";
import { useAuthStore } from "../../auth/store/auth.store";

const ROLE_LABELS = {
  LANDLORD: "Chủ nhà",
  MANAGER: "Quản lý",
};

function getRoleLabel(roles = []) {
  for (const role of roles) {
    if (ROLE_LABELS[role]) return ROLE_LABELS[role];
  }
  return roles[0] ?? "Người dùng";
}

export default function Settings() {
  const { profile, roles } = useAuthStore();
  const [activeTab, setActiveTab] = useState("profile");
  const getUserInfo = () => {
    const token = keycloak?.tokenParsed;
    return {
      name: token?.name || profile?.name || "Chưa có tên",
      email: token?.email || profile?.email || "Chưa có email",
      phone: token?.phone_number || token?.phone || "Chưa có SĐT",
      position: token?.position || token?.job_title || getRoleLabel(roles),
      username: token?.preferred_username || "admin",
      avatar: (token?.name || profile?.name || "A").charAt(0).toUpperCase(),
    };
  };

  const [formData, setFormData] = useState({
    profile: getUserInfo(),
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      criticalAlerts: true,
      weeklyReports: true,
      monthlyReports: true,
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: "30",
      passwordExpiry: "90",
    },
    system: {
      language: "vi",
      timezone: "Asia/Ho_Chi_Minh",
      dateFormat: "DD/MM/YYYY",
      currency: "VND",
    },
  });

  const tabs = [
    { id: "profile", label: "Hồ Sơ", icon: User },
    { id: "notifications", label: "Thông Báo", icon: Bell },
    { id: "security", label: "Bảo Mật", icon: Shield },
    { id: "system", label: "Hệ Thống", icon: Globe },
  ];

  // Cập nhật thông tin từ Keycloak khi component mount
  useEffect(() => {
    if (keycloak?.authenticated) {
      const userInfo = getUserInfo();
      setFormData((prev) => ({
        ...prev,
        profile: userInfo,
      }));
    }
  }, [keycloak?.authenticated, keycloak?.tokenParsed]);

  const handleShow = async () => {
    try {
      if (keycloak?.authenticated) {
        await keycloak.updateToken(30);
      }
      console.log(keycloak?.authenticated);
      console.log(keycloak?.token);
      console.log(keycloak?.tokenParsed);
    } catch (e) {
      console.error("Failed to refresh token", e);
    }
  };
  const handleInputChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleSave = () => {
    alert("Đã lưu cài đặt thành công!");
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Thông Tin Cá Nhân</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-20 h-20 bg-teal-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {formData.profile.avatar}
            </div>
            <div>
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition">
                Thay đổi ảnh đại diện
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Họ và tên
              </label>
              <input
                type="text"
                value={formData.profile.name}
                onChange={(e) =>
                  handleInputChange("profile", "name", e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên đăng nhập
              </label>
              <input
                type="text"
                value={formData.profile.username}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.profile.email}
                onChange={(e) =>
                  handleInputChange("profile", "email", e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số điện thoại
              </label>
              <input
                type="tel"
                value={formData.profile.phone}
                onChange={(e) =>
                  handleInputChange("profile", "phone", e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chức vụ
              </label>
              <input
                type="text"
                value={formData.profile.position}
                onChange={(e) =>
                  handleInputChange("profile", "position", e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Cài Đặt Thông Báo</h3>
        <div className="space-y-4">
          {Object.entries(formData.notifications).map(([key, value]) => (
            <div
              key={key}
              className="flex items-center justify-between py-3 border-b border-gray-200 last:border-0"
            >
              <div>
                <label className="text-sm font-medium text-gray-900">
                  {key === "emailNotifications" && "Thông báo qua Email"}
                  {key === "smsNotifications" && "Thông báo qua SMS"}
                  {key === "criticalAlerts" && "Cảnh báo khẩn cấp"}
                  {key === "weeklyReports" && "Báo cáo hàng tuần"}
                  {key === "monthlyReports" && "Báo cáo hàng tháng"}
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  {key === "emailNotifications" && "Nhận thông báo qua email"}
                  {key === "smsNotifications" &&
                    "Nhận thông báo qua tin nhắn SMS"}
                  {key === "criticalAlerts" &&
                    "Nhận cảnh báo ngay lập tức cho các sự cố khẩn cấp"}
                  {key === "weeklyReports" && "Nhận báo cáo tổng hợp hàng tuần"}
                  {key === "monthlyReports" &&
                    "Nhận báo cáo tổng hợp hàng tháng"}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) =>
                    handleInputChange("notifications", key, e.target.checked)
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Bảo Mật Tài Khoản</h3>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Xác thực hai yếu tố
            </label>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Bảo vệ tài khoản của bạn bằng mã xác thực
              </p>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.security.twoFactorAuth}
                  onChange={(e) =>
                    handleInputChange(
                      "security",
                      "twoFactorAuth",
                      e.target.checked,
                    )
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thời gian hết phiên (phút)
            </label>
            <select
              value={formData.security.sessionTimeout}
              onChange={(e) =>
                handleInputChange("security", "sessionTimeout", e.target.value)
              }
              className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="15">15 phút</option>
              <option value="30">30 phút</option>
              <option value="60">1 giờ</option>
              <option value="120">2 giờ</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thời hạn mật khẩu (ngày)
            </label>
            <select
              value={formData.security.passwordExpiry}
              onChange={(e) =>
                handleInputChange("security", "passwordExpiry", e.target.value)
              }
              className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="30">30 ngày</option>
              <option value="60">60 ngày</option>
              <option value="90">90 ngày</option>
              <option value="180">180 ngày</option>
            </select>
          </div>
          <div>
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm flex items-center gap-2 hover:bg-gray-50 transition">
              <Key className="w-4 h-4" />
              Đổi mật khẩu
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSystemTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Cài Đặt Hệ Thống</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ngôn ngữ
            </label>
            <select
              value={formData.system.language}
              onChange={(e) =>
                handleInputChange("system", "language", e.target.value)
              }
              className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Múi giờ
            </label>
            <select
              value={formData.system.timezone}
              onChange={(e) =>
                handleInputChange("system", "timezone", e.target.value)
              }
              className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh (GMT+7)</option>
              <option value="UTC">UTC (GMT+0)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Định dạng ngày
            </label>
            <select
              value={formData.system.dateFormat}
              onChange={(e) =>
                handleInputChange("system", "dateFormat", e.target.value)
              }
              className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tiền tệ
            </label>
            <select
              value={formData.system.currency}
              onChange={(e) =>
                handleInputChange("system", "currency", e.target.value)
              }
              className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="VND">VND (₫)</option>
              <option value="USD">USD ($)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return renderProfileTab();
      case "notifications":
        return renderNotificationsTab();
      case "security":
        return renderSecurityTab();
      case "system":
        return renderSystemTab();
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm flex items-center gap-2 hover:bg-teal-700 transition"
        >
          <Save className="w-4 h-4" />
          Lưu Thay Đổi
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl p-1 shadow-sm border">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg transition ${
                  activeTab === tab.id
                    ? "bg-teal-100 text-teal-700 font-semibold"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
}
