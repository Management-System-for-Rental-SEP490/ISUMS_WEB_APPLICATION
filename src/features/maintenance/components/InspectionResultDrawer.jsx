import { useTranslation } from "react-i18next";
import { Drawer, Alert, Spin, Descriptions, Tag, Typography, Divider } from "antd";
import { ClipboardCheck } from "lucide-react";
import { useInspectionResult } from "../hooks/useInspectionResult";
import AssetEventTable from "./AssetEventTable";
import ImageCarousel from "../../../components/shared/ImageCarousel";

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

export default function InspectionResultDrawer({ inspectionId, onClose }) {
  const { t } = useTranslation("common");
  const { inspection, assetEvents, loading, error } = useInspectionResult(inspectionId);

  const typeLabel = inspection?.type
    ? t(`inspection.type.${inspection.type}`, { defaultValue: inspection.type })
    : null;
  const images      = toImageArray(inspection?.photoUrls);
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
          <span className="text-sm font-semibold text-gray-700">{t("inspection.resultDrawer.title")}</span>
          {inspection?.type && (
            <Tag color={inspection.type === "CHECK_IN" ? "green" : "orange"} className="ml-1">
              {typeLabel}
            </Tag>
          )}
        </div>
      }
    >
      {loading && (
        <div className="flex flex-col items-center justify-center h-64 gap-2 text-gray-400">
          <Spin size="large" />
          <span className="text-sm">{t("inspection.resultDrawer.loading")}</span>
        </div>
      )}

      {error && (
        <div className="p-5">
          <Alert type="error" showIcon description={error} />
        </div>
      )}

      {inspection && (
        <div>
          <ImageCarousel images={images} alt={t("inspection.resultDrawer.photoLabel")} height="h-56" />

          <div className="p-5 space-y-5">
            {hasDeduction && (
              <Alert
                type="warning"
                showIcon
                message={t("inspection.resultDrawer.deductionLabel")}
                description={
                  <span>
                    {t("inspection.resultDrawer.deductionAmount")}{" "}
                    <strong className="text-orange-700">
                      {Number(inspection.deductionAmount).toLocaleString("vi-VN")}₫
                    </strong>
                  </span>
                }
              />
            )}

            <Descriptions
              column={1}
              size="small"
              bordered
              labelStyle={{ width: 150, color: "#6b7280", fontSize: 12 }}
              contentStyle={{ fontSize: 12 }}
            >
              <Descriptions.Item label={t("inspection.colType")}>
                <Tag color={inspection.type === "CHECK_IN" ? "green" : "orange"}>{typeLabel ?? "—"}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label={t("inspection.colCompletedAt")}>
                {formatDate(inspection.completedAt)}
              </Descriptions.Item>
              {inspection.contractId && (
                <Descriptions.Item label="Contract ID">
                  <span className="font-mono text-xs">
                    #{String(inspection.contractId).slice(-6).toUpperCase()}
                  </span>
                </Descriptions.Item>
              )}
              <Descriptions.Item label={t("inspection.resultDrawer.deductionAmount")}>
                <span className={hasDeduction ? "font-bold text-orange-600" : "text-gray-400"}>
                  {hasDeduction
                    ? `${Number(inspection.deductionAmount).toLocaleString("vi-VN")}₫`
                    : t("inspection.resultDrawer.noValue")}
                </span>
              </Descriptions.Item>
            </Descriptions>

            {inspection.inspectionNotes && (
              <div>
                <Typography.Text strong className="text-xs text-gray-500 uppercase tracking-wide">
                  {t("inspection.resultDrawer.noteLabel")}
                </Typography.Text>
                <div className="mt-1.5 text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2.5 leading-relaxed border border-gray-100">
                  {inspection.inspectionNotes}
                </div>
              </div>
            )}

            <div>
              <Divider orientation="left" orientationMargin={0}>
                <Typography.Text strong className="text-xs text-gray-500 uppercase tracking-wide">
                  {t("inspection.resultDrawer.assetTitle", { count: assetEvents.length })}
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
