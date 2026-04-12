import React from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumbs from "../../../../components/shared/Breadcrumbs";
import CreateContract from "../CreateContract";

export default function ContractCreateView({ onBack, onCreated }) {
  const navigate = useNavigate();
  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { label: "Trang chủ", onClick: () => navigate("/dashboard") },
          { label: "Quản lý hợp đồng", onClick: onBack },
          { label: "Tạo hợp đồng" },
        ]}
      />
      <CreateContract onCancel={onBack} onCreated={onCreated} />
    </div>
  );
}
