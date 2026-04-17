import React from "react";
import CreateContract from "../CreateContract";

export default function ContractCreateView({ onBack, onCreated }) {
  return <CreateContract onCancel={onBack} onCreated={onCreated} />;
}
