import React from "react";
import Breadcrumbs from "../../components/components/Breadscrumbs";
import CreateContract from "../CreateContract";

export default function ContractCreateView({ onNavigateMenu, onBack, onCreated }) {
  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { label: "Trang chủ", onClick: () => onNavigateMenu?.("dashboard") },
          { label: "Quản lý hợp đồng", onClick: onBack },
          { label: "Tạo hợp đồng" },
        ]}
      />
      <CreateContract onCancel={onBack} onCreated={onCreated} />
    </div>
  );
}
