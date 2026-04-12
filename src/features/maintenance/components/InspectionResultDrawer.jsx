import { Drawer, Alert, Spin, Descriptions, Tag, Typography, Divider } from "antd";
import { ClipboardCheck } from "lucide-react";
import { useInspectionResult } from "../hooks/useInspectionResult";
import AssetEventTable from "./AssetEventTable";
import ImageCarousel from "../../../components/shared/ImageCarousel";

const TYPE_CONFIG = {
  CHECK_IN:  { label: "Bàn giao nhà",  color: "green"  },
  CHECK_OUT: { label: "Kết thúc hợp đồng", color: "orange" },
};

function formatDate(str) {
  if (!str) return "—";
  return new Date(str).toLocaleString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function toImageArray(photoUrls) {
  if (!Array.isArray(photoUrls)) return [];
  return photoUrls.map((url, i) => ({ id: String(i), url }));
}

/**
 * @param {{ inspectionId: string|null, onClose: () => void }} props
 */
export default function InspectionResultDrawer({ inspectionId, onClose }) {
  const { inspection, assetEvents, loading, error } = useInspectionResult(inspectionId);

  const typeCfg = inspection?.type ? (TYPE_CONFIG[inspection.type] ?? {}) : {};
  const images  = toImageArray(inspection?.photoUrls);
  const hasDeduction = inspection?.deductionAmount > 0;

  return (
    <Drawer
      open={!!inspectionId}
      onClose={onClose}
      classNames={{ wrapper: "!w-[560px]" }}
      styles={{ body: { padding: 0 } }}
      title={
        <div className="flex items-center gap-2">
          <ClipboardCheck className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-semibold text-gray-700">Kết quả kiểm tra</span>
          {inspection?.type && (
            <Tag color={typeCfg.color} className="ml-1">{typeCfg.label}</Tag>
          )}
        </div>
      }
    >
      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center h-64 gap-2 text-gray-400">
          <Spin size="large" />
          <span className="text-sm">Đang tải kết quả kiểm tra...</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-5">
          <Alert type="error" showIcon description={error} />
        </div>
      )}

      {inspection && (
        <div>
          {/* Ảnh hiện trường */}
          <ImageCarousel images={images} alt="Ảnh kiểm tra" height="h-56" />

          <div className="p-5 space-y-5">
            {/* Cảnh báo khấu trừ */}
            {hasDeduction && (
              <Alert
                type="warning"
                showIcon
                message="Có khấu trừ tiền cọc"
                description={
                  <span>
                    Số tiền khấu trừ:{" "}
                    <strong className="text-orange-700">
                      {Number(inspection.deductionAmount).toLocaleString("vi-VN")}₫
                    </strong>
                  </span>
                }
              />
            )}

            {/* Thông tin tổng quan */}
            <Descriptions
              column={1}
              size="small"
              bordered
              labelStyle={{ width: 150, color: "#6b7280", fontSize: 12 }}
              contentStyle={{ fontSize: 12 }}
            >
              <Descriptions.Item label="Loại kiểm tra">
                <Tag color={typeCfg.color}>{typeCfg.label ?? "—"}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Hoàn thành lúc">
                {formatDate(inspection.completedAt)}
              </Descriptions.Item>
              {inspection.contractId && (
                <Descriptions.Item label="Mã hợp đồng">
                  <span className="font-mono text-xs">
                    #{String(inspection.contractId).slice(-6).toUpperCase()}
                  </span>
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Số tiền khấu trừ">
                <span className={hasDeduction ? "font-bold text-orange-600" : "text-gray-400"}>
                  {hasDeduction
                    ? `${Number(inspection.deductionAmount).toLocaleString("vi-VN")}₫`
                    : "Không có"}
                </span>
              </Descriptions.Item>
            </Descriptions>

            {/* Ghi chú kiểm tra */}
            {inspection.inspectionNotes && (
              <div>
                <Typography.Text strong className="text-xs text-gray-500 uppercase tracking-wide">
                  Ghi chú kiểm tra
                </Typography.Text>
                <div className="mt-1.5 text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2.5 leading-relaxed border border-gray-100">
                  {inspection.inspectionNotes}
                </div>
              </div>
            )}

            {/* Danh sách tài sản */}
            <div>
              <Divider orientation="left" orientationMargin={0}>
                <Typography.Text strong className="text-xs text-gray-500 uppercase tracking-wide">
                  Tài sản đã ghi nhận ({assetEvents.length})
                </Typography.Text>
              </Divider>
              <AssetEventTable events={assetEvents} />
            </div>
          </div>
        </div>
      )}
    </Drawer>
  );
}
