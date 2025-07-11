// src/components/orders/OrderPDFButton.tsx
import React from "react";
import html2pdf from "html2pdf.js";

interface Props {
  order: any; // Mejor usar Order si está bien definida
}

export const OrderPDFButton = ({ order }: Props) => {
  const handleDownloadPDF = () => {
    const element = document.createElement("div");
    element.style.maxWidth = "800px";
    element.style.margin = "auto";
    element.style.padding = "20px";
    element.style.border = "1px solid #ccc";
    element.style.fontFamily = "Arial, sans-serif";

    // Genera contenido HTML del PDF
    element.innerHTML = `
      <h2 style="text-align:center;">Pedido #${order.id}</h2>
      <p><strong>Cliente:</strong> Carlos Pérez</p>
      <p><strong>Dirección:</strong> ${order.OrderAddress.address}, ${
      order.OrderAddress.postalCode
    }, ${order.OrderAddress.city}, ${order.OrderAddress.countryId}</p>
      <p><strong>Teléfono:</strong> ${order.OrderAddress.phone}</p>

      <table style="width:100%; border-collapse: collapse; margin-top: 20px;">
        <thead>
          <tr style="background:#f2f2f2;">
            <th style="border:1px solid #ddd; padding: 8px;">ID Producto</th>
            <th style="border:1px solid #ddd; padding: 8px;">Nombre</th>
            <th style="border:1px solid #ddd; padding: 8px; text-align:center;">Cantidad</th>
            <th style="border:1px solid #ddd; padding: 8px; text-align:right;">Precio</th>
            <th style="border:1px solid #ddd; padding: 8px; text-align:right;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${order.OrderItem.map(
            (item: any) => `
            <tr key="${item.productId}">
              <td style="border:1px solid #ddd; padding: 8px;">${
                item.productId
              }</td>
              <td style="border:1px solid #ddd; padding: 8px;">${
                item.product.title
              }</td>
              <td style="border:1px solid #ddd; padding: 8px; text-align:center;">${
                item.quantity
              }</td>
              <td style="border:1px solid #ddd; padding: 8px; text-align:right;">$${item.price.toLocaleString(
                "es-CO"
              )}</td>
              <td style="border:1px solid #ddd; padding: 8px; text-align:right;">$${(
                item.price * item.quantity
              ).toLocaleString("es-CO")}</td>
            </tr>
          `
          ).join("")}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="3" style="text-align:right; font-weight:bold;">Subtotal:</td>
            <td style="font-weight:bold; text-align:right;">$${order.subTotal.toLocaleString(
              "es-CO"
            )}</td>
          </tr>
          <tr>
            <td colSpan="3" style="text-align:right;">Impuestos (15%):</td>
            <td style="text-align:right;">$${order.tax.toLocaleString(
              "es-CO"
            )}</td>
          </tr>
          <tr>
            <td colSpan="3" style="text-align:right; font-size:1.2em; font-weight:bold;">Total:</td>
            <td style="font-size:1.2em; font-weight:bold; text-align:right;">$${order.total.toLocaleString(
              "es-CO"
            )}</td>
          </tr>
        </tfoot>
      </table>
    `;

    // Agrega temporalmente al DOM y genera el PDF
    document.body.appendChild(element);
    const opt = {
      margin: 0.5,
      filename: `pedido-${order.id}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };

    html2pdf().set(opt).from(element).save();
    document.body.removeChild(element); // Limpia después
  };

  return (
    <button
      onClick={handleDownloadPDF}
      className="mx-2 text-blue-600 hover:text-blue-800 underline"
      type="button"
    >
      Descargar
    </button>
  );
};
