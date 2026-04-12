import { useState } from "react";
import { Table, Progress, Tag, Typography } from "antd";
import { ChevronDown, ChevronRight } from "lucide-react";
import ImageCarousel from "../../../components/shared/ImageCarousel";

const EVENT_TYPE_CONFIG = {
  CHECK_IN:    { label: "Bàn giao",    color: "green"   },
  CHECK_OUT:   { label: "Kết thúc HĐ", color: "orange"  },
  MAINTENANCE: { label: "Bảo trì",     color: "blue"    },
  default:     { label: "—",           color: "default" },
};

function conditionStroke(pct) {
  if (pct >= 80) return "#10b981";
  if (pct >= 50) return "#f59e0b";
  return "#ef4444";
}

function ConditionChange({ prev, curr }) {
  const diff = (curr ?? 0) - (prev ?? 0);
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <Progress
          percent={curr ?? 0}
          showInfo={false}
          strokeColor={conditionStroke(curr ?? 0)}
          size={["100%", 6]}
          styles={{ trail: { background: "#e5e7eb" } }}
          className="flex-1"
        />
        <span className="text-xs font-bold w-9 text-right" style={{ color: conditionStroke(curr ?? 0) }}>
          {curr ?? 0}%
        </span>
      </div>
      {prev != null && (
        <p className="text-[10px] text-gray-400">
          Trước: {prev}%
          {diff !== 0 && (
            <span className={`ml-1 font-semibold ${diff > 0 ? "text-emerald-500" : "text-red-500"}`}>
              ({diff > 0 ? "+" : ""}{diff}%)
            </span>
          )}
        </p>
      )}
    </div>
  );
}

function ExpandedRow({ record }) {
  if (!record.images?.length) return null;
  return (
    <div className="px-4 pb-3">
      <p className="text-xs font-semibold text-gray-500 mb-2">Ảnh ghi nhận ({record.images.length})</p>
      <div className="max-w-sm rounded-xl overflow-hidden border border-gray-100">
        <ImageCarousel images={record.images} alt={record.assetName} height="h-44" />
      </div>
    </div>
  );
}

const COLUMNS = [
  {
    title: "Tài sản",
    dataIndex: "assetName",
    key: "assetName",
    render: (name) => (
      <Typography.Text strong className="text-sm">{name ?? "—"}</Typography.Text>
    ),
  },
  {
    title: "Tình trạng",
    key: "condition",
    width: 180,
    render: (_, record) => (
      <ConditionChange prev={record.previousCondition} curr={record.currentCondition} />
    ),
  },
  {
    title: "Loại sự kiện",
    dataIndex: "eventType",
    key: "eventType",
    width: 130,
    render: (type) => {
      const cfg = EVENT_TYPE_CONFIG[type] ?? EVENT_TYPE_CONFIG.default;
      return <Tag color={cfg.color}>{cfg.label}</Tag>;
    },
  },
  {
    title: "Ghi chú",
    dataIndex: "note",
    key: "note",
    render: (note) => (
      <Typography.Text type="secondary" className="text-xs">
        {note || "—"}
      </Typography.Text>
    ),
  },
];

/**
 * @param {{ events: Array, loading?: boolean }} props
 */
export default function AssetEventTable({ events = [], loading = false }) {
  const [expandedKeys, setExpandedKeys] = useState([]);

  const toggleExpand = (key) =>
    setExpandedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );

  return (
    <Table
      dataSource={events}
      columns={[
        {
          key: "expand",
          width: 36,
          render: (_, record) => {
            if (!record.images?.length) return null;
            const isOpen = expandedKeys.includes(record.id);
            return (
              <button
                type="button"
                onClick={() => toggleExpand(record.id)}
                className="text-gray-400 hover:text-teal-500 transition"
              >
                {isOpen
                  ? <ChevronDown className="w-4 h-4" />
                  : <ChevronRight className="w-4 h-4" />}
              </button>
            );
          },
        },
        ...COLUMNS,
      ]}
      expandable={{
        expandedRowKeys: expandedKeys,
        showExpandColumn: false,
        expandedRowRender: (record) => <ExpandedRow record={record} />,
      }}
      rowKey={(r) => r.id ?? r.assetId ?? Math.random()}
      loading={loading}
      size="small"
      pagination={events.length > 8 ? { pageSize: 8, size: "small" } : false}
      locale={{ emptyText: "Không có tài sản nào được ghi nhận" }}
    />
  );
}
