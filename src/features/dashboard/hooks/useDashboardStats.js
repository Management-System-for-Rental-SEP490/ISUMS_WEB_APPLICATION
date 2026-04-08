import { useEffect, useState } from "react";
import { getAllHouses } from "../../houses/api/houses.api";
import { getAllUsers } from "../../tenants/api/users.api";
import { getAllContracts } from "../../contracts/api/contracts.api";
import { mapContractFromApi } from "../../contracts/utils/mapContractFromApi";

/**
 * Trích xuất mảng từ nhiều dạng response khác nhau:
 * - response là mảng thẳng
 * - response.data là mảng
 * - response.items là mảng (pagination)
 * - response.content là mảng (Spring pagination)
 */

function toArray(raw) {
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.data)) return raw.data;
  if (Array.isArray(raw?.items)) return raw.items;
  if (Array.isArray(raw?.content)) return raw.content;
  return [];
}

/**
 * Hook tổng hợp thống kê cho Dashboard.
 * Gọi 3 API song song, 1 cái lỗi không ảnh hưởng 2 cái còn lại.
 *
 * @returns {{
 *   stats: {
 *     properties: { total: number },
 *     users:      { total: number },
 *     contracts:  { total: number, active: number, expiring: number },
 *   },
 *   recentContracts: Array,
 *   loading: boolean,
 *   errors: { properties: string|null, users: string|null, contracts: string|null },
 *   refetch: () => void,
 * }}
 */
export function useDashboardStats() {
  const [stats, setStats] = useState({
    properties: { total: 0 },
    users: { total: 0 },
    contracts: { total: 0, active: 0, expiring: 0 },
  });
  const [houses, setHouses] = useState([]);
  const [recentContracts, setRecentContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({
    properties: null,
    users: null,
    contracts: null,
  });
  const fetchAll = async () => {
    setLoading(true);
    setErrors({ properties: null, users: null, contracts: null });
    const [housesResult, usersResult, contractsResult] =
      await Promise.allSettled([
        getAllHouses(),
        getAllUsers(),
        getAllContracts({
          page: 0,
          size: 5,
          sortBy: "createdAt",
          sortDir: "DESC",
        }),
      ]);

    const newErrors = { properties: null, users: null, contracts: null };
    let propertiesTotal = 0;
    let housesArr = [];
    if (housesResult.status === "fulfilled") {
      housesArr = toArray(housesResult.value);
      propertiesTotal = housesArr.length;
    } else {
      newErrors.properties = housesResult.reason?.message ?? "Lỗi tải BĐS";
    }

    let usersTotal = 0;
    if (usersResult.status === "fulfilled") {
      usersTotal = toArray(usersResult.value).length;
    } else {
      newErrors.users = usersResult.reason?.message ?? "Lỗi tải người dùng";
    }

    // --- Contracts ---
    // Chỉ lấy page 0 size 5 để hiển thị danh sách gần nhất.
    // total lấy từ metadata response; active/expiring để backend cung cấp sau nếu cần.
    let contractsTotal = 0;
    let recent = [];
    if (contractsResult.status === "fulfilled") {
      const raw = contractsResult.value;
      const arr = toArray(raw).map(mapContractFromApi).filter(Boolean);
      // TODO: Confirm field tổng số: raw.total / raw.totalElements / raw.totalItems
      contractsTotal = raw?.total ?? raw?.totalElements ?? raw?.totalItems ?? arr.length;
      recent = arr;
    } else {
      newErrors.contracts =
        contractsResult.reason?.message ?? "Lỗi tải hợp đồng";
    }

    setStats({
      properties: { total: propertiesTotal },
      users: { total: usersTotal },
      contracts: { total: contractsTotal },
    });
    setHouses(housesArr);
    setRecentContracts(recent);
    setErrors(newErrors);
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAll();
  }, []);

  return { stats, houses, recentContracts, loading, errors, refetch: fetchAll };
}
