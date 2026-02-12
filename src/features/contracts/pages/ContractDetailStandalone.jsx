import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getContractById } from "../api/contracts.api";
import { mapContractFromApi } from "../utils/mapContractFromApi";

export default function ContractDetailStandalone() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const raw = await getContractById(id);
        const mapped = mapContractFromApi(raw);
        if (mounted) setContract(mapped);
      } catch (err) {
        if (mounted) setError(err?.message ?? "Không thể tải hợp đồng.");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (id) fetchData();
    return () => {
      mounted = false;
    };
  }, [id]);

  const html = contract?.html ?? "";

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="w-full bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="max-w-5xl w-full mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Hợp đồng</h1>
            <p className="text-sm text-gray-600">
              {contract?.contractNumber ?? contract?.name ?? id}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => navigate(`/contracts/${id}/edit`)}
              className="px-4 py-2 border border-teal-500 text-teal-600 rounded-lg text-sm hover:bg-teal-50 transition"
            >
              Chỉnh sửa
            </button>
            <button
              type="button"
              onClick={() =>
                navigate("/dashboard", { state: { menu: "contracts" } })
              }
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition"
            >
              Quay về Danh sách hợp đồng
            </button>
          </div>
        </div>
      </header>

      <main className="px-6 py-4">
        {loading && (
          <div className="max-w-5xl mx-auto bg-white rounded-xl border shadow-sm p-8 text-center">
            <p className="text-gray-600">Đang tải hợp đồng...</p>
          </div>
        )}

        {error && !loading && (
          <div className="max-w-5xl mx-auto bg-white rounded-xl border shadow-sm p-8 text-center">
            <p className="text-red-600 font-medium mb-4">{error}</p>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition"
            >
              Quay lại
            </button>
          </div>
        )}

        {!loading && !error && html && (
          <div className="max-w-5xl mx-auto bg-white rounded-xl border shadow-sm">
            <iframe
              title="Contract HTML"
              srcDoc={html}
              className="w-full min-h-[1000px] border-0 rounded-xl"
              sandbox=""
              referrerPolicy="no-referrer"
            />
          </div>
        )}
      </main>
    </div>
  );
}
