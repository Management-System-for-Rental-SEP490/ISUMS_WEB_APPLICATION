import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Drawer, Badge, Progress, Descriptions, Alert, Spin, Tag, Button, Modal } from "antd";
import { Package, CheckCircle } from "lucide-react";
import { toast } from "react-toastify";
import { useLanguageStore } from "../../../store/languageStore";
import { getAssetItemById, managerConfirmAsset } from "../api/assets.api";
import ImageCarousel from "../../../components/shared/ImageCarousel";

const STATUS_BADGE = {
  IN_USE: "success",
  UNDER_REPAIR: "warning",
  BROKEN: "error",
  DISPOSED: "error",
  WAITING_MANAGER_CONFIRM: "processing",
  default: "default",
};

const conditionStroke = (pct) => {
  if (pct >= 80) return "#10b981";
  if (pct >= 50) return "#f59e0b";
  return "#ef4444";
};

function getCategoryName(asset, lang) {
  if (lang !== "vi" && asset.category?.nameTranslations?.[lang])
    return asset.category.nameTranslations[lang];
  return asset.category?.name ?? "—";
}

function getDisplayName(asset, lang) {
  if (lang !== "vi" && asset.translations?.[lang]) return asset.translations[lang];
  return asset.displayName;
}

export default function AssetItemDetailDrawer({ assetId, onClose, onConfirmed }) {
  const { t } = useTranslation("common");
  const lang = useLanguageStore((s) => s.language);

  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!assetId) return;
    setLoading(true);
    setError(null);
    setAsset(null);
    getAssetItemById(assetId)
      .then(setAsset)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [assetId]);

  const handleConfirm = () => {
    Modal.confirm({
      title: t("assets.confirmAsset"),
      content: asset?.displayName,
      okText: t("actions.confirm"),
      cancelText: t("actions.cancel"),
      okButtonProps: { style: { background: "#3bb582", borderColor: "#3bb582" } },
      onOk: async () => {
        setConfirming(true);
        try {
          await managerConfirmAsset(assetId, "IN_USE");
          toast.success(t("assets.confirmAssetSuccess"));
          onConfirmed?.();
          onClose();
        } catch (e) {
          toast.error(e.message || t("assets.confirmAssetError"));
        } finally {
          setConfirming(false);
        }
      },
    });
  };

  const pct = asset?.conditionPercent ?? 0;
  const badgeStatus = asset ? (STATUS_BADGE[asset.status] ?? STATUS_BADGE.default) : "default";

  return (
    <Drawer
      open={!!assetId}
      onClose={onClose}
      width={480}
      autoFocus={false}
      title={
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-semibold text-gray-700">
            {t("houses.assetDrawer.title")}
          </span>
        </div>
      }
      styles={{ body: { padding: 0 } }}
    >
      {loading && (
        <div className="flex flex-col items-center justify-center h-64 gap-3 text-gray-400">
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
          <ImageCarousel images={asset.images ?? []} alt={asset.displayName} height="h-56" />

          <div className="p-5 space-y-5">
            {/* Name + status */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-base font-bold" style={{ color: "#1E2D28" }}>
                  {getDisplayName(asset, lang)}
                </p>
                {asset.serialNumber && (
                  <p className="text-xs font-mono mt-0.5" style={{ color: "#9CA3AF" }}>
                    {asset.serialNumber}
                  </p>
                )}
              </div>
              <Badge
                status={badgeStatus}
                text={
                  <span className="text-xs font-medium">
                    {t(`houses.assetStatus.${asset.status}`, { defaultValue: asset.status })}
                  </span>
                }
              />
            </div>

            {/* Condition bar */}
            <div className="rounded-xl p-4" style={{ background: "#F7FBF9", border: "1px solid #EAF4F0" }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold" style={{ color: "#5A7A6E" }}>
                  {t("houses.assetDrawer.conditionLabel")}
                </span>
                <span className="text-sm font-bold" style={{ color: conditionStroke(pct) }}>
                  {pct}%
                </span>
              </div>
              <Progress
                percent={pct}
                showInfo={false}
                strokeColor={conditionStroke(pct)}
                size={["100%", 8]}
                styles={{ trail: { background: "#E5E7EB" } }}
              />
              <p className="text-[11px] mt-1.5" style={{ color: "#9CA3AF" }}>
                {pct >= 80
                  ? t("houses.assetDrawer.conditionGood")
                  : pct >= 50
                    ? t("houses.assetDrawer.conditionMedium")
                    : t("houses.assetDrawer.conditionBad")}
              </p>
            </div>

            {/* Info */}
            <Descriptions
              column={1}
              size="small"
              bordered
              labelStyle={{ width: 140, color: "#6b7280", fontSize: 12 }}
              contentStyle={{ fontSize: 12 }}
            >
              {asset.serialNumber && (
                <Descriptions.Item label={t("houses.assetDrawer.serialLabel")}>
                  {asset.serialNumber}
                </Descriptions.Item>
              )}
              <Descriptions.Item label={t("houses.assetDrawer.categoryLabel")}>
                {getCategoryName(asset, lang)}
              </Descriptions.Item>
              <Descriptions.Item label={t("houses.assetDrawer.updatedLabel")}>
                {asset.updateAt ? new Date(asset.updateAt).toLocaleDateString() : "—"}
              </Descriptions.Item>
            </Descriptions>

            {/* Tags */}
            {asset.tags?.length > 0 && (
              <div>
                <p className="text-xs font-semibold mb-2" style={{ color: "#5A7A6E" }}>Tags</p>
                <div className="flex gap-2 flex-wrap">
                  {asset.tags.map((tag, i) => (
                    <Tag key={tag.id ?? i} color="blue">
                      {tag.tagValue}{tag.tagType ? ` (${tag.tagType})` : ""}
                    </Tag>
                  ))}
                </div>
              </div>
            )}

            {/* Note */}
            {asset.note && (
              <div>
                <p className="text-xs font-semibold mb-1.5" style={{ color: "#5A7A6E" }}>
                  {t("houses.assetDrawer.noteLabel")}
                </p>
                <Alert type="info" description={asset.note} showIcon />
              </div>
            )}

            {/* Confirm button — only for WAITING_MANAGER_CONFIRM */}
            {asset.status === "WAITING_MANAGER_CONFIRM" && (
              <Button
                type="primary"
                icon={<CheckCircle className="w-4 h-4" />}
                loading={confirming}
                onClick={handleConfirm}
                className="w-full"
                style={{ background: "#3bb582", borderColor: "#3bb582", height: 40 }}
              >
                {t("assets.confirmAsset")}
              </Button>
            )}
          </div>
        </div>
      )}
    </Drawer>
  );
}
