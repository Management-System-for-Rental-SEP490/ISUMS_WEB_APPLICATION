import React, { useMemo, useState } from "react";
import { Building2, Plus, Search, Filter } from "lucide-react";
import { useHouses } from "../hooks/useHouses";
import HouseCard from "../components/HouseCard";

function normalize(str = "") {
  return String(str)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export default function Houses() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const { houses, loading, error } = useHouses();

  const list = Array.isArray(houses) ? houses : [];

  const filtered = useMemo(() => {
    const q = normalize(searchTerm.trim());
    return list.filter((h) => {
      const matchesStatus =
        filterStatus === "all" ? true : h?.status === filterStatus;
      const blob = normalize(
        [h?.title, h?.address, h?.description].filter(Boolean).join(" "),
      );
      const matchesSearch = !q ? true : blob.includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [list, searchTerm, filterStatus]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Bất động sản</h2>
          <p className="text-gray-600">
            Quản lý danh sách nhà/đơn vị cho thuê ({list.length})
            {loading ? " • Đang tải..." : ""}
          </p>
        </div>

        <button
          type="button"
          className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm flex items-center gap-2 hover:bg-teal-700 transition"
          onClick={() => console.log("TODO: open create modal/page")}
        >
          <Plus className="w-4 h-4" />
          Thêm nhà
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white border rounded-xl p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
              <Search className="w-4 h-4" />
              Tìm kiếm
            </label>
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên, địa chỉ, phường/quận, mô tả..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
              <Filter className="w-4 h-4" />
              Trạng thái
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">Tất cả</option>
              <option value="AVAILABLE">Còn trống</option>
              <option value="RENTED">Đã thuê</option>
              <option value="MAINTENANCE">Bảo trì</option>
            </select>
          </div>
        </div>
      </div>

      {/* States */}
      {loading && (
        <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-100 animate-pulse" />
            <p className="text-gray-600">Đang tải danh sách nhà...</p>
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <p className="text-red-600 font-medium">
            Không tải được danh sách nhà. Vui lòng thử lại sau.
          </p>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-12 shadow-sm text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-50 to-cyan-50 flex items-center justify-center">
            <Building2 className="w-8 h-8 text-teal-600" />
          </div>
          <h3 className="mt-4 font-semibold text-gray-900">Không tìm thấy nhà phù hợp</h3>
          <p className="mt-2 text-gray-600 text-sm max-w-sm mx-auto">
            Thử thay đổi bộ lọc trạng thái hoặc từ khóa tìm kiếm.
          </p>
        </div>
      )}

      {/* Danh sách nhà - mỗi card chiếm nguyên 1 dòng */}
      {!loading && !error && filtered.length > 0 && (
        <div className="flex flex-col gap-5">
          {filtered.map((house) => (
            <HouseCard key={house.id} house={house} />
          ))}
        </div>
      )}
    </div>
  );
}
