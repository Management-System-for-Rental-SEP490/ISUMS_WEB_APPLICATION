/**
 * Mock data cho Dashboard charts.
 * Tổng BĐS: 11 (6 + 3 + 2) — nhất quán với KPI card
 * Tổng hợp đồng: 48 (24 + 11 + 6 + 4 + 3)
 * TODO: Thay bằng API thật khi backend sẵn sàng.
 */

// ── Donut Chart: Tình trạng BĐS (total = 11) ────────────────────────────────
export const HOUSE_STATUS_DATA = [
  { name: "Đang cho thuê", value: 6, color: "#3bb582" },
  { name: "Còn trống",     value: 3, color: "#2096d8" },
  { name: "Bảo trì",       value: 2, color: "#f59e0b" },
];

// ── Line Chart: Hợp đồng mới theo tháng ─────────────────────────────────────
export const CONTRACTS_BY_MONTH_DATA = [
  { month: "T1",  contracts: 2  },
  { month: "T2",  contracts: 4  },
  { month: "T3",  contracts: 3  },
  { month: "T4",  contracts: 7  },
  { month: "T5",  contracts: 5  },
  { month: "T6",  contracts: 9  },
  { month: "T7",  contracts: 6  },
  { month: "T8",  contracts: 11 },
  { month: "T9",  contracts: 8  },
  { month: "T10", contracts: 13 },
  { month: "T11", contracts: 10 },
  { month: "T12", contracts: 15 },
];

// Dữ liệu 3 tháng gần nhất
export const CONTRACTS_3M_DATA = [
  { month: "T10 W1", contracts: 3  },
  { month: "T10 W2", contracts: 4  },
  { month: "T10 W3", contracts: 3  },
  { month: "T10 W4", contracts: 3  },
  { month: "T11 W1", contracts: 2  },
  { month: "T11 W2", contracts: 3  },
  { month: "T11 W3", contracts: 3  },
  { month: "T11 W4", contracts: 2  },
  { month: "T12 W1", contracts: 4  },
  { month: "T12 W2", contracts: 4  },
  { month: "T12 W3", contracts: 4  },
  { month: "T12 W4", contracts: 3  },
];

// Dữ liệu 6 tháng gần nhất
export const CONTRACTS_6M_DATA = [
  { month: "T7",  contracts: 6  },
  { month: "T8",  contracts: 11 },
  { month: "T9",  contracts: 8  },
  { month: "T10", contracts: 13 },
  { month: "T11", contracts: 10 },
  { month: "T12", contracts: 15 },
];

// ── Bar Chart: Hợp đồng theo trạng thái (total = 48) ─────────────────────────
export const CONTRACT_STATUS_DATA = [
  { label: "Hoàn thành",  value: 24, color: "#3bb582" },
  { label: "Đang xử lý", value: 11, color: "#2096d8" },
  { label: "Chờ ký",     value: 6,  color: "#f59e0b" },
  { label: "Đã huỷ",     value: 4,  color: "#D95F4B" },
  { label: "Bản nháp",   value: 3,  color: "#8ab5a3" },
];
