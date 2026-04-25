import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Select } from "antd";
import { toast } from "react-toastify";
import {
  User,
  Bell,
  Shield,
  Globe,
  Save,
  Key,
} from "lucide-react";
import keycloak from "../../../keycloak";
import { useAuthStore } from "../../auth/store/auth.store";
import { useLanguageStore, languageActions } from "../../../store/languageStore";
import { updateUserLanguage } from "../../auth/api/auth.api";

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
  const { t } = useTranslation("common");
  const { profile, roles } = useAuthStore();
  const currentLanguage = useLanguageStore((s) => s.language);
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
      language: currentLanguage,
      timezone: "Asia/Ho_Chi_Minh",
      dateFormat: "DD/MM/YYYY",
      currency: "VND",
    },
  });

  const tabs = [
    { id: "profile", label: t("settings.tabs.profile"), icon: User },
    { id: "notifications", label: t("settings.tabs.notifications"), icon: Bell },
    { id: "security", label: t("settings.tabs.security"), icon: Shield },
    { id: "system", label: t("settings.tabs.system"), icon: Globe },
  ];

  useEffect(() => {
    if (keycloak?.authenticated) {
      const userInfo = getUserInfo();
      setFormData((prev) => ({ ...prev, profile: userInfo }));
    }
  }, [keycloak?.authenticated, keycloak?.tokenParsed]);

  // Sync language dropdown when store changes externally
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      system: { ...prev.system, language: currentLanguage },
    }));
  }, [currentLanguage]);

  const handleInputChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const selectedLang = formData.system.language;
      await updateUserLanguage(selectedLang);
      languageActions.setLanguage(selectedLang);
      toast.success(t("settings.saveSuccess"));
    } catch {
      toast.error(t("settings.saveError"));
    } finally {
      setSaving(false);
    }
  };

  const notificationLabels = {
    emailNotifications: {
      label: t("settings.notifications.email"),
      desc: t("settings.notifications.emailDesc"),
    },
    smsNotifications: {
      label: t("settings.notifications.sms"),
      desc: t("settings.notifications.smsDesc"),
    },
    criticalAlerts: {
      label: t("settings.notifications.critical"),
      desc: t("settings.notifications.criticalDesc"),
    },
    weeklyReports: {
      label: t("settings.notifications.weekly"),
      desc: t("settings.notifications.weeklyDesc"),
    },
    monthlyReports: {
      label: t("settings.notifications.monthly"),
      desc: t("settings.notifications.monthlyDesc"),
    },
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div className="rounded-2xl p-6" style={{ background: "#FFFFFF", border: "1px solid #C4DED5", boxShadow: "0 4px 20px -2px rgba(59,181,130,0.08)" }}>
        <h3 className="text-lg font-semibold mb-4">{t("settings.profile.title")}</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold" style={{ background: "linear-gradient(135deg, #3bb582 0%, #2096d8 100%)" }}>
              {formData.profile.avatar}
            </div>
            <div>
              <button className="px-4 py-2 rounded-full text-sm transition"
                style={{ border: "1px solid #C4DED5", color: "#5A7A6E" }}
                onMouseEnter={e => e.currentTarget.style.background = "#EAF4F0"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                {t("settings.profile.changeAvatar")}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "#1E2D28" }}>
                {t("settings.profile.name")}
              </label>
              <input
                type="text"
                value={formData.profile.name}
                onChange={(e) => handleInputChange("profile", "name", e.target.value)}
                className="w-full px-4 py-2 rounded-xl outline-none transition" style={{ border: "1px solid #C4DED5", background: "#ffffff", color: "#1E2D28" }}
                onFocus={e => { e.currentTarget.style.borderColor = "#3bb582"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,181,130,0.12)"; }}
                onBlur={e => { e.currentTarget.style.borderColor = "#C4DED5"; e.currentTarget.style.boxShadow = "none"; }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "#1E2D28" }}>
                {t("settings.profile.username")}
              </label>
              <input
                type="text"
                value={formData.profile.username}
                readOnly
                className="w-full px-4 py-2 rounded-xl" style={{ border: "1px solid #C4DED5", background: "#EAF4F0", color: "#5A7A6E" }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "#1E2D28" }}>
                {t("settings.profile.email")}
              </label>
              <input
                type="email"
                value={formData.profile.email}
                onChange={(e) => handleInputChange("profile", "email", e.target.value)}
                className="w-full px-4 py-2 rounded-xl outline-none transition" style={{ border: "1px solid #C4DED5", background: "#ffffff", color: "#1E2D28" }}
                onFocus={e => { e.currentTarget.style.borderColor = "#3bb582"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,181,130,0.12)"; }}
                onBlur={e => { e.currentTarget.style.borderColor = "#C4DED5"; e.currentTarget.style.boxShadow = "none"; }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "#1E2D28" }}>
                {t("settings.profile.phone")}
              </label>
              <input
                type="tel"
                value={formData.profile.phone}
                onChange={(e) => handleInputChange("profile", "phone", e.target.value)}
                className="w-full px-4 py-2 rounded-xl outline-none transition" style={{ border: "1px solid #C4DED5", background: "#ffffff", color: "#1E2D28" }}
                onFocus={e => { e.currentTarget.style.borderColor = "#3bb582"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,181,130,0.12)"; }}
                onBlur={e => { e.currentTarget.style.borderColor = "#C4DED5"; e.currentTarget.style.boxShadow = "none"; }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "#1E2D28" }}>
                {t("settings.profile.position")}
              </label>
              <input
                type="text"
                value={formData.profile.position}
                onChange={(e) => handleInputChange("profile", "position", e.target.value)}
                className="w-full px-4 py-2 rounded-xl outline-none transition" style={{ border: "1px solid #C4DED5", background: "#ffffff", color: "#1E2D28" }}
                onFocus={e => { e.currentTarget.style.borderColor = "#3bb582"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,181,130,0.12)"; }}
                onBlur={e => { e.currentTarget.style.borderColor = "#C4DED5"; e.currentTarget.style.boxShadow = "none"; }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div className="rounded-2xl p-6" style={{ background: "#FFFFFF", border: "1px solid #C4DED5", boxShadow: "0 4px 20px -2px rgba(59,181,130,0.08)" }}>
        <h3 className="text-lg font-semibold mb-4">{t("settings.notifications.title")}</h3>
        <div className="space-y-4">
          {Object.entries(formData.notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between py-3" style={{ borderBottom: "1px solid #C4DED5" }}>
              <div>
                <label className="text-sm font-medium text-gray-900">
                  {notificationLabels[key]?.label}
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  {notificationLabels[key]?.desc}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => handleInputChange("notifications", key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#3bb582]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-green"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div className="rounded-2xl p-6" style={{ background: "#FFFFFF", border: "1px solid #C4DED5", boxShadow: "0 4px 20px -2px rgba(59,181,130,0.08)" }}>
        <h3 className="text-lg font-semibold mb-4">{t("settings.security.title")}</h3>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "#1E2D28" }}>
              {t("settings.security.twoFactor")}
            </label>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">{t("settings.security.twoFactorDesc")}</p>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.security.twoFactorAuth}
                  onChange={(e) => handleInputChange("security", "twoFactorAuth", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#3bb582]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-green"></div>
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "#1E2D28" }}>
              {t("settings.security.sessionTimeout")}
            </label>
            <select
              value={formData.security.sessionTimeout}
              onChange={(e) => handleInputChange("security", "sessionTimeout", e.target.value)}
              className="w-full md:w-64 px-4 py-2 rounded-xl outline-none transition" style={{ border: "1px solid #C4DED5", background: "#ffffff", color: "#1E2D28" }}
              onFocus={e => { e.currentTarget.style.borderColor = "#3bb582"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,181,130,0.12)"; }}
              onBlur={e => { e.currentTarget.style.borderColor = "#C4DED5"; e.currentTarget.style.boxShadow = "none"; }}
            >
              <option value="15">15</option>
              <option value="30">30</option>
              <option value="60">60</option>
              <option value="120">120</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "#1E2D28" }}>
              {t("settings.security.passwordExpiry")}
            </label>
            <select
              value={formData.security.passwordExpiry}
              onChange={(e) => handleInputChange("security", "passwordExpiry", e.target.value)}
              className="w-full md:w-64 px-4 py-2 rounded-xl outline-none transition" style={{ border: "1px solid #C4DED5", background: "#ffffff", color: "#1E2D28" }}
              onFocus={e => { e.currentTarget.style.borderColor = "#3bb582"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,181,130,0.12)"; }}
              onBlur={e => { e.currentTarget.style.borderColor = "#C4DED5"; e.currentTarget.style.boxShadow = "none"; }}
            >
              <option value="30">30</option>
              <option value="60">60</option>
              <option value="90">90</option>
              <option value="180">180</option>
            </select>
          </div>
          <div>
            <p className="text-sm font-medium mb-3" style={{ color: "#1E2D28" }}>
              {t("settings.security.changePassword")}
            </p>
            <p className="text-sm text-gray-500 mb-3">
              {t("settings.security.changePasswordDesc")}
            </p>
            <button
              className="px-4 py-2 rounded-full text-sm flex items-center gap-2 transition"
              style={{ border: "1px solid #C4DED5", color: "#5A7A6E" }}
              onMouseEnter={e => e.currentTarget.style.background = "#EAF4F0"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              onClick={() => {
                const url = keycloak.createAccountUrl();
                const accountBase = url.split("?")[0].replace(/\/$/, "");
                window.open(`${accountBase}/password`, "_blank", "noopener,noreferrer");
              }}
            >
              <Key className="w-4 h-4" />
              {t("settings.security.changePassword")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSystemTab = () => (
    <div className="space-y-6">
      <div className="rounded-2xl p-6" style={{ background: "#FFFFFF", border: "1px solid #C4DED5", boxShadow: "0 4px 20px -2px rgba(59,181,130,0.08)" }}>
        <h3 className="text-lg font-semibold mb-4">{t("settings.system.title")}</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "#1E2D28" }}>
              {t("settings.system.language")}
            </label>
            <Select
              value={formData.system.language}
              onChange={(v) => handleInputChange("system", "language", v)}
              style={{ width: 256 }}
              options={[
                { value: "vi", label: t("settings.system.languages.vi") },
                { value: "en", label: t("settings.system.languages.en") },
                { value: "ja", label: t("settings.system.languages.ja") },
              ]}
            />
            <p className="text-xs mt-1.5" style={{ color: "#5A7A6E" }}>
              {t("settings.system.languageHint")}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "#1E2D28" }}>
              {t("settings.system.timezone")}
            </label>
            <select
              value={formData.system.timezone}
              onChange={(e) => handleInputChange("system", "timezone", e.target.value)}
              className="w-full md:w-64 px-4 py-2 rounded-xl outline-none transition" style={{ border: "1px solid #C4DED5", background: "#ffffff", color: "#1E2D28" }}
              onFocus={e => { e.currentTarget.style.borderColor = "#3bb582"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,181,130,0.12)"; }}
              onBlur={e => { e.currentTarget.style.borderColor = "#C4DED5"; e.currentTarget.style.boxShadow = "none"; }}
            >
              <option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh (GMT+7)</option>
              <option value="UTC">UTC (GMT+0)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "#1E2D28" }}>
              {t("settings.system.dateFormat")}
            </label>
            <select
              value={formData.system.dateFormat}
              onChange={(e) => handleInputChange("system", "dateFormat", e.target.value)}
              className="w-full md:w-64 px-4 py-2 rounded-xl outline-none transition" style={{ border: "1px solid #C4DED5", background: "#ffffff", color: "#1E2D28" }}
              onFocus={e => { e.currentTarget.style.borderColor = "#3bb582"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,181,130,0.12)"; }}
              onBlur={e => { e.currentTarget.style.borderColor = "#C4DED5"; e.currentTarget.style.boxShadow = "none"; }}
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "#1E2D28" }}>
              {t("settings.system.currency")}
            </label>
            <select
              value={formData.system.currency}
              onChange={(e) => handleInputChange("system", "currency", e.target.value)}
              className="w-full md:w-64 px-4 py-2 rounded-xl outline-none transition" style={{ border: "1px solid #C4DED5", background: "#ffffff", color: "#1E2D28" }}
              onFocus={e => { e.currentTarget.style.borderColor = "#3bb582"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,181,130,0.12)"; }}
              onBlur={e => { e.currentTarget.style.borderColor = "#C4DED5"; e.currentTarget.style.boxShadow = "none"; }}
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
      case "profile": return renderProfileTab();
      case "notifications": return renderNotificationsTab();
      case "security": return renderSecurityTab();
      case "system": return renderSystemTab();
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-heading text-3xl font-bold" style={{ color: "#1E2D28" }}>
            {t("settings.title")}
          </h2>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2.5 text-white rounded-full text-sm flex items-center gap-2 transition shadow-sm mt-1 disabled:opacity-70"
          style={{ background: "linear-gradient(135deg, #3bb582 0%, #2096d8 100%)" }}
          onMouseEnter={e => { if (!saving) e.currentTarget.style.opacity = "0.9"; }}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}
        >
          <Save className="w-4 h-4" />
          {saving ? t("actions.save") + "..." : t("settings.save")}
        </button>
      </div>

      <div className="rounded-2xl p-1" style={{ background: "#FFFFFF", border: "1px solid #C4DED5", boxShadow: "0 4px 20px -2px rgba(59,181,130,0.08)" }}>
        <div className="flex flex-wrap gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition text-sm"
                style={isActive
                  ? { background: "linear-gradient(135deg, #3bb582 0%, #2096d8 100%)", color: "#ffffff", fontWeight: 600 }
                  : { color: "#5A7A6E" }}
                onMouseEnter={e => !isActive && (e.currentTarget.style.background = "#EAF4F0")}
                onMouseLeave={e => !isActive && (e.currentTarget.style.background = "transparent")}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {renderTabContent()}
    </div>
  );
}
