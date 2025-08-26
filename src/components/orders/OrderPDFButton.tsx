// src/components/orders/OrderPDFButton.tsx
import React, { useState } from "react";
import html2pdf from "html2pdf.js";
import { getOrderById } from "@/services/orders.service";
import type { Order } from "@/interfaces/order.interface";

interface Props {
  order: Order; // Usar la interfaz real
}

export const OrderPDFButton = ({ order }: Props) => {
  const [loading, setLoading] = useState(false);

  const handleDownloadPDF = async () => {
    setLoading(true);
    
    try {
      // Obtener los datos completos de la orden
      const { ok, order: fullOrder } = await getOrderById(order.id);
      
      if (!ok || !fullOrder) {
        alert("No se pudo obtener la información completa de la orden");
        return;
      }

      generatePDF(fullOrder);
    } catch (error) {
      console.error("Error al obtener orden:", error);
      alert("Error al generar el PDF");
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = (orderData: Order) => {
    const element = document.createElement("div");
    element.style.maxWidth = "800px";
    element.style.margin = "auto";
    element.style.padding = "20px";
    element.style.border = "1px solid #ccc";
    element.style.fontFamily = "Arial, sans-serif";
    element.style.fontSize = "14px";

    // Usar los datos reales de la orden
    const itemsInOrder = orderData.itemsInOrder || orderData.OrderItem.reduce((acc, item) => acc + item.quantity, 0);
    const subTotal = orderData.subTotal;
    const tax = orderData.tax;
    const total = orderData.total;
    const clientName = `${orderData.OrderAddress.firstName} ${orderData.OrderAddress.lastName}`;

    element.innerHTML = `
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #333; margin: 0;">ORDEN DE PEDIDO</h2>
        <h3 style="color: #666; margin: 5px 0;">#${orderData.id?.slice(-6) || 'N/A'}</h3>
        <hr style="margin: 15px 0; border: none; border-top: 1px solid #ddd;">
      </div>

      <div style="margin-bottom: 20px;">
        <h4 style="color: #333; margin: 0 0 10px 0;">Información del Pedido</h4>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div>
            <p><strong>Fecha de Creación:</strong> ${orderData.createdAt ? new Date(orderData.createdAt).toLocaleDateString('es-CO') : 'N/A'}</p>
            <p><strong>Estado:</strong> <span style="color: ${orderData.isPaid ? '#22c55e' : '#ef4444'}; font-weight: bold;">
              ${orderData.isPaid ? 'Pagada' : 'Pendiente'}
            </span></p>
          </div>
          <div>
            <p><strong>Cliente:</strong> ${clientName}</p>
            <p><strong>ID Cliente:</strong> ${orderData.clientId?.slice(-6) || 'N/A'}</p>
          </div>
        </div>
      </div>

      <div style="margin-bottom: 20px;">
        <h4 style="color: #333; margin: 0 0 10px 0;">Dirección de Envío</h4>
        <div style="background: #f8f9fa; padding: 10px; border-radius: 4px;">
          <p style="margin: 2px 0;"><strong>Nombre:</strong> ${clientName}</p>
          <p style="margin: 2px 0;"><strong>Dirección:</strong> ${orderData.OrderAddress.address || 'N/A'}</p>
          <p style="margin: 2px 0;"><strong>Ciudad:</strong> ${orderData.OrderAddress.city || 'N/A'}</p>
          <p style="margin: 2px 0;"><strong>Código Postal:</strong> ${orderData.OrderAddress.postalCode || 'N/A'}</p>
          <p style="margin: 2px 0;"><strong>Teléfono:</strong> ${orderData.OrderAddress.phone || 'N/A'}</p>
        </div>
      </div>

      <div style="margin: 20px 0;">
        <h4 style="color: #333; margin: 0 0 10px 0;">Productos</h4>
        <table style="width:100%; border-collapse: collapse; margin-top: 10px;">
          <thead>
            <tr style="background:#f8f9fa;">
              <th style="border:1px solid #ddd; padding: 10px; text-align:left;">Producto</th>
              <th style="border:1px solid #ddd; padding: 10px; text-align:center;">Slug</th>
              <th style="border:1px solid #ddd; padding: 10px; text-align:center;">Cantidad</th>
              <th style="border:1px solid #ddd; padding: 10px; text-align:right;">Precio Unit.</th>
              <th style="border:1px solid #ddd; padding: 10px; text-align:right;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${orderData.OrderItem?.map((item: any) => {
              const productName = item.product?.title || 'Producto sin nombre';
              const slug = item.product?.slug || 'N/A';
              const unitPrice = item.price / item.quantity; // Calcular precio unitario
              const quantity = item.quantity || 0;
              const subtotal = item.price; // El precio ya es el subtotal
              
              return `
                <tr>
                  <td style="border:1px solid #ddd; padding: 8px;">
                    <div><strong>${productName}</strong></div>
                    <div style="font-size: 12px; color: #666;">ID: ${item.productId?.slice(-6) || 'N/A'}</div>
                  </td>
                  <td style="border:1px solid #ddd; padding: 8px; text-align:center;">${slug}</td>
                  <td style="border:1px solid #ddd; padding: 8px; text-align:center;">${quantity}</td>
                  <td style="border:1px solid #ddd; padding: 8px; text-align:right;">$${unitPrice.toLocaleString('es-CO')}</td>
                  <td style="border:1px solid #ddd; padding: 8px; text-align:right;">$${subtotal.toLocaleString('es-CO')}</td>
                </tr>
              `;
            }).join('') || `
              <tr>
                <td colspan="5" style="border:1px solid #ddd; padding: 20px; text-align: center; color: #666;">
                  No hay productos en esta orden
                </td>
              </tr>
            `}
          </tbody>
        </table>
      </div>

      <div style="margin-top: 20px; text-align: right;">
        <table style="width: 300px; margin-left: auto; border-collapse: collapse;">
          <tr>
            <td style="padding: 5px; text-align: right;"><strong>No. Productos:</strong></td>
            <td style="padding: 5px; text-align: right;">${itemsInOrder === 1 ? "1 artículo" : `${itemsInOrder} artículos`}</td>
          </tr>
          <tr>
            <td style="padding: 5px; text-align: right;"><strong>Subtotal:</strong></td>
            <td style="padding: 5px; text-align: right;">$${subTotal.toLocaleString('es-CO')}</td>
          </tr>
          <tr>
            <td style="padding: 5px; text-align: right;"><strong>Impuestos (15%):</strong></td>
            <td style="padding: 5px; text-align: right;">$${tax.toLocaleString('es-CO')}</td>
          </tr>
          <tr style="background: #f8f9fa;">
            <td style="padding: 10px; text-align: right;"><strong style="font-size: 16px;">Total:</strong></td>
            <td style="padding: 10px; text-align: right;"><strong style="font-size: 16px;">$${total.toLocaleString('es-CO')}</strong></td>
          </tr>
        </table>
      </div>

      <div style="margin-top: 30px; text-align: center; color: #666; font-size: 12px;">
        <p>Gracias por su compra</p>
        <p style="margin-top: 5px;">Este documento es generado automáticamente</p>
      </div>
    `;

    // Agrega temporalmente al DOM y genera el PDF
    document.body.appendChild(element);
    
    const opt = {
      margin: 0.5,
      filename: `orden-${orderData.id?.slice(-6) || 'N/A'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        logging: false
      },
      jsPDF: { 
        unit: 'in', 
        format: 'letter', 
        orientation: 'portrait' 
      }
    };

    html2pdf()
      .set(opt)
      .from(element)
      .save()
      .finally(() => {
        // Limpia después de generar el PDF
        setTimeout(() => {
          document.body.removeChild(element);
        }, 1000);
      });
  };

  return (
    <button
      onClick={handleDownloadPDF}
      disabled={loading}
      className={`text-blue-600 hover:text-blue-800 underline text-sm font-medium ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      type="button"
    >
      {loading ? 'Generando...' : 'Descargar PDF'}
    </button>
  );
};