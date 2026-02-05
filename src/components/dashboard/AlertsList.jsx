import React from 'react';
import { AlertCircle, ChevronRight, Calendar } from 'lucide-react';

export default function AlertsList({ alerts }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <h3 className="font-semibold text-gray-900">Cảnh Báo Hoạt Động</h3>
        </div>
        <button className="text-teal-600 text-sm font-medium hover:text-teal-700 flex items-center gap-1">
          Xem Tất Cả <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-3">
        {alerts.map((alert) => (
          <div key={alert.id} className="p-3 rounded-lg border border-gray-200 hover:shadow-sm transition">
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${alert.severity === 'critical' ? 'bg-red-100' : 'bg-orange-100'}`}>
                <alert.icon className={`w-4 h-4 ${alert.severity === 'critical' ? 'text-red-600' : 'text-orange-600'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm text-gray-900">{alert.property}</h4>
                <p className="text-xs text-gray-600 mb-1">{alert.issue}</p>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Calendar className="w-3 h-3" /> {alert.time}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}