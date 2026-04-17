import { Modal } from "antd";
import { CheckCircle } from "lucide-react";

export default function InspectionConfirmModal({ open, onCancel, onConfirm, loading }) {
  return (
    <Modal
      open={open}
      onCancel={() => !loading && onCancel()}
      footer={null}
      centered
      width={440}
      closable={!loading}
      maskClosable={!loading}
    >
      <div className="py-2 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto" style={{ background: "rgba(59,181,130,0.12)" }}>
          <CheckCircle className="w-8 h-8" style={{ color: "#3bb582" }} />
        </div>
        <div>
          <h3 className="text-lg font-bold" style={{ color: "#1E2D28" }}>Xác nhận hoàn thành kiểm tra</h3>
          <p className="text-sm mt-2 leading-relaxed" style={{ color: "#5A7A6E" }}>
            Bạn xác nhận đã hoàn tất kiểm tra nhà.
            <br />
            Thao tác này sẽ cho phép khách hàng{" "}
            <span className="font-semibold" style={{ color: "#1E2D28" }}>ra / vào nhà</span>{" "}
            sau khi được duyệt.
          </p>
        </div>
        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            disabled={loading}
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50"
            style={{ border: "1px solid #C4DED5", color: "#5A7A6E", background: "#ffffff" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#EAF4F0")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition shadow-sm disabled:opacity-70"
            style={{ background: "linear-gradient(135deg, #3bb582 0%, #2096d8 100%)" }}
            onMouseEnter={(e) => !loading && (e.currentTarget.style.opacity = "0.9")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            {loading ? "Đang xử lý..." : "Xác nhận hoàn thành"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
