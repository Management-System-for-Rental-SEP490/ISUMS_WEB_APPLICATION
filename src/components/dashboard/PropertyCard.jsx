import React from 'react';
import { Building2, MapPin, Users, Zap, Droplet, Flame } from 'lucide-react';

export default function PropertyCard({ property }) {
  return (
    <div className="border border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-gray-300 transition cursor-pointer bg-white">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center">
          <Building2 className="w-5 h-5 text-teal-600" />
        </div>
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          property.statusColor === 'green' ? 'bg-green-100 text-green-700' :
          property.statusColor === 'red' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
        }`}> ● {property.status} </span>
      </div>

      <h4 className="font-semibold text-gray-900 mb-1">{property.name}</h4>
      <p className="text-xs text-gray-500 mb-4 flex items-center gap-1"><MapPin className="w-3 h-3" /> {property.address}</p>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-600 flex items-center gap-1"><Users className="w-3 h-3" /> Lấp Đầy</span>
          <span className="text-xs font-semibold text-gray-900">{property.occupancy}</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-teal-500 rounded-full transition-all" style={{ width: `${property.occupancyPercent}%` }}></div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="bg-amber-50 rounded-lg p-2 text-center">
          <Zap className="w-4 h-4 text-amber-600 mx-auto mb-1" />
          <p className="text-xs font-bold">{property.electricity.value}</p>
          <p className="text-[10px] text-gray-500">{property.electricity.unit}</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-2 text-center">
          <Droplet className="w-4 h-4 text-blue-600 mx-auto mb-1" />
          <p className="text-xs font-bold">{property.water.value}</p>
          <p className="text-[10px] text-gray-500">{property.water.unit}</p>
        </div>
        <div className="bg-red-50 rounded-lg p-2 text-center">
          <Flame className="w-4 h-4 text-red-600 mx-auto mb-1" />
          <p className="text-xs font-bold">{property.gas.value}</p>
          <p className="text-[10px] text-gray-500">{property.gas.unit}</p>
        </div>
      </div>
    </div>
  );
}