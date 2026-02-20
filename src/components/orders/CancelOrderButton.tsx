//src/components/orders/CancelOrderButton.tsx
import React, { useState } from "react";
import { cancelOrder } from "@/services/orders.service";
import { useAuthStore } from "@/store/auth-store";

interface Props {
  orderId: string;
  isCanceled?: boolean;
  initialReason?: string;
  onCanceled?: (reason: string) => void; // para refrescar UI
}

export const CancelOrderButton: React.FC<Props> = ({
  orderId,
  isCanceled,
  initialReason,
  onCanceled,
}) => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === "Admin";

  const [reason, setReason] = useState(initialReason ?? "");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  if (!isAdmin) return null;

  const handleCancel = async () => {
    if (isCanceled || loading) return;

    if (!reason.trim()) {
      setErr("Debes ingresar el motivo de cancelación");
      setTimeout(() => setErr(null), 4000);
      return;
    }

    try {
      setLoading(true);
      setErr(null);
      setMsg(null);

      const result = await cancelOrder(orderId, reason);

      if (result.ok) {
        setMsg("Orden anulada correctamente");
        onCanceled?.(reason.trim());
        setTimeout(() => setMsg(null), 3000);
      } else {
        setErr(result.message || "No se pudo anular");
        setTimeout(() => setErr(null), 5000);
      }
    } catch {
      setErr("Error de conexión");
      setTimeout(() => setErr(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Motivo de cancelación
      </label>

      <input
        type="text"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        disabled={!!isCanceled || loading}
        placeholder="Ej: Cliente canceló / Error de pedido..."
        className={`w-full px-3 py-2 rounded-md border text-sm
          ${
            isCanceled
              ? "bg-gray-100 border-gray-300 cursor-not-allowed text-gray-600"
              : "border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
          }`}
      />

      <button
        onClick={handleCancel}
        disabled={!!isCanceled || loading}
        className={`w-full py-3 px-4 rounded-md text-white ${
          isCanceled
            ? "bg-orange-400 cursor-not-allowed"
            : loading
            ? "bg-gray-500 cursor-not-allowed"
            : "bg-orange-600 hover:bg-orange-700"
        }`}
      >
        {loading ? "Anulando..." : isCanceled ? "Anulada" : "Cancelar / Anular pedido"}
      </button>

      {msg && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-3 rounded shadow">
          {msg}
        </div>
      )}
      {err && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded shadow">
          {err}
        </div>
      )}
    </div>
  );
};