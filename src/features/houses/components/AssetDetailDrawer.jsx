import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Drawer, Badge, Progress, Tag, Descriptions, Alert, Spin, Typography } from "antd";
import { Package } from "lucide-react";
import ImageCarousel from "../../../components/shared/ImageCarousel";
import { getAssetById } from "../api/houses.api";
import { ASSET_STATUS } from "./HouseOverviewTab";

const STATUS_BADGE = {
  IN_USE:       "success",
  UNDER_REPAIR: "warning",
  BROKEN:       "error",
  DISPOSED:     "error",
  default:      "default",
};

const CONDITION_STROKE = (pct) => {
  if (pct >= 80) return "#10b981";
  if (pct >= 50) return "#f59e0b";
  return "#ef4444";
};

export default function AssetDetailDrawer({ assetId, onClose }) {
  const { t } = useTranslation("common");
  const [asset, setAsset]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!assetId) return;
    setLoading(true); setError(null); setAsset(null);
    getAssetById(assetId)
      .then(setAsset)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [assetId]);

  const status    = asset ? (ASSET_STATUS[asset.status] ?? ASSET_STATUS.default) : null;
  const badgeStatus = asset ? (STATUS_BADGE[asset.status] ?? STATUS_BADGE.default) : "default";
  const pct       = asset?.conditionPercent ?? 0;

  return (
    <Drawer
      open={!!assetId}
      onClose={onClose}
      classNames={{ wrapper: "!w-[480px]" }}
      autoFocus={false}
      title={
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-semibold text-gray-700">{t("houses.assetDrawer.title")}</span>
        </div>
      }
      styles={{ body: { padding: 0 } }}
    >
      {loading && (
        <div className="flex flex-col items-center justify-center h-64 gap-2 text-gray-400">
          <Spin size="large" />
          <span className="text-sm">{t("houses.assetDrawer.loading")}</span>
        </div>
      )}

      {error && (
        <div className="p-5">
          <Alert type="error" showIcon description={error} />
        </div>
      )}

      {asset && (
        <div>
          {/* Carousel */}
          <ImageCarousel images={asset.images ?? []} alt={asset.displayName} height="h-64" />

          <div className="p-5 space-y-5">
            {/* Header: tên + badge trạng thái */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <Typography.Title level={5} className="!mb-0.5">{asset.displayName}</Typography.Title>
                <Typography.Text type="secondary" className="font-mono text-xs">{asset.serialNumber ?? "—"}</Typography.Text>
              </div>
              <Badge status={badgeStatus} text={<span className="text-xs font-medium">{t(`houses.assetStatus.${asset.status}`, { defaultValue: status.label })}</span>} />
            </div>

            {/* Tình trạng */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-600">{t("houses.assetDrawer.conditionLabel")}</span>
                <span className="text-sm font-bold" style={{ color: CONDITION_STROKE(pct) }}>{pct}%</span>
              </div>
              <Progress
                percent={pct}
                showInfo={false}
                strokeColor={CONDITION_STROKE(pct)}
                size={["100%", 8]}
                styles={{ trail: { background: "#e5e7eb" } }}
              />
              <p className="text-[11px] text-gray-400 mt-1.5">
                {pct >= 80 ? t("houses.assetDrawer.conditionGood") : pct >= 50 ? t("houses.assetDrawer.conditionMedium") : t("houses.assetDrawer.conditionBad")}
              </p>
            </div>

            {/* Thông tin chung */}
            <Descriptions column={1} size="small" bordered labelStyle={{ width: 130, color: "#6b7280", fontSize: 12 }} contentStyle={{ fontSize: 12 }}>
              <Descriptions.Item label={t("houses.assetDrawer.serialLabel")}>{asset.serialNumber ?? "—"}</Descriptions.Item>
              {asset.category?.name && (
                <Descriptions.Item label={t("houses.assetDrawer.categoryLabel")}>{asset.category?.name}</Descriptions.Item>
              )}
              {asset.description && (
                <Descriptions.Item label={t("houses.assetDrawer.descriptionLabel")}>{asset.description}</Descriptions.Item>
              )}
              <Descriptions.Item label={t("houses.assetDrawer.updatedLabel")}>
                {asset.updateAt ? new Date(asset.updateAt).toLocaleDateString() : "—"}
              </Descriptions.Item>
            </Descriptions>

            {/* Tags */}
            {asset.tags?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2">Tags</p>
                <div className="flex gap-2 flex-wrap">
                  {asset.tags.map((tag, i) => (
                    <Tag key={tag.id ?? i} color="blue">{tag.tagValue} {tag.tagType ? `(${tag.tagType})` : ""}</Tag>
                  ))}
                </div>
              </div>
            )}

            {/* Ghi chú */}
            {asset.note && (
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1.5">{t("houses.assetDrawer.noteLabel")}</p>
                <Alert type="info" description={asset.note} showIcon />
              </div>
            )}
          </div>
        </div>
      )}
    </Drawer>
  );
}
