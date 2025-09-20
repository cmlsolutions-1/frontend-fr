// src/components/orders/OrderPDFButton.tsx
import React, { useState } from "react";
import html2pdf from "html2pdf.js";
import { getClientById, getSalesPersonById } from "@/services/client.service";


interface OrderFromBackend {
  _id: string;
  isPaid: boolean;
  subTotal: number;
  tax: number;
  total: number;
  createdDate: string;
  paymendDate?: string;
  idClient: string;
  idSalesPerson?: string;
  items: Array<{
    quantity: number;
    price: number;
    idProduct: {
      _id: string;
      reference?: string;
      description?: string;
      detalle?: string;
    };
  }>;
  OrderAddress?: {
    firstName: string;
    lastName: string;
    address: string;
    postalCode: string;
    city: string;
    phone: string;
  };
}

interface Props {
  order: OrderFromBackend;
}

export const OrderPDFButton = ({ order }: Props) => {
  const [loading, setLoading] = useState(false);

  const handleDownloadPDF = async () => {
    setLoading(true);
    
    try {
      console.log("🔍 Orden recibida:", order);
      console.log("🆔 ID del cliente:", order.idClient);
      console.log("👥 ID del vendedor:", order.idSalesPerson);
      

      // Obtener el nombre del vendedor
      let salesPersonName = 'Vendedor N/A';
      if (order.idSalesPerson) {
        console.log("🚀 Solicitando vendedor con ID:", order.idSalesPerson);
        const salesPerson = await getSalesPersonById(order.idSalesPerson);
        console.log("📥 Vendedor recibido:", salesPerson);
        if (salesPerson) {
          const name = salesPerson.name || '';
          const lastName = salesPerson.lastName || '';
          salesPersonName = `${name} ${lastName}`.trim() || 'Vendedor N/A';
          console.log("👤 Nombre del vendedor:", salesPersonName);
        }
      }

      // Obtener el nombre del cliente
      let clientName = 'Cliente N/A';
      let clientIdToShow = 'N/A';
      if (order.idClient) {
        console.log("🚀 Solicitando cliente con ID:", order.idClient);
        const client = await getClientById(order.idClient);
        console.log("📥 Cliente recibido:", client);
        
        if (client) {
          const name = client.name || '';
          const lastName = client.lastName || '';
          clientName = `${name} ${lastName}`.trim() || 'Cliente N/A';
          clientIdToShow = client.id || client._id?.slice(-6) || 'N/A';
          console.log("👤 Nombre del cliente:", clientName);
          console.log("🆔 ID del cliente a mostrar:", clientIdToShow);
        } else {
          console.log("❌ No se encontró el cliente");
          if (order.OrderAddress) {
            clientName = `${order.OrderAddress.firstName || ''} ${order.OrderAddress.lastName || ''}`.trim() || 'Cliente N/A';
          }
          clientIdToShow = order.idClient.slice(-6) || 'N/A';
        }
      } else {
        console.log("❌ No hay ID de cliente");
        if (order.OrderAddress) {
          clientName = `${order.OrderAddress.firstName || ''} ${order.OrderAddress.lastName || ''}`.trim() || 'Cliente N/A';
        }
        clientIdToShow = 'N/A';
      }
      
      generatePDF(order, clientName, clientIdToShow, salesPersonName);
    } catch (error) {
      console.error("Error al generar PDF:", error);
      alert("Error al generar el PDF");
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = (orderData: OrderFromBackend, clientName: string, clientIdToShow: string, salesPersonName: string) => {
  const element = document.createElement("div");
  element.style.maxWidth = "800px";
  element.style.margin = "auto";
  element.style.padding = "40px";
  element.style.fontFamily = "'Hanken Grotesk', Arial, sans-serif";
  element.style.color = "#000000";
  element.style.backgroundColor = "#ffffff";
  element.style.boxSizing = "border-box";

    // Calcular totales
    const itemsInOrder = orderData.items?.length || 0;
    const subTotal = orderData.subTotal || 0;
    const tax = orderData.tax || 0;
    const total = orderData.total || 0;

    element.innerHTML = `
    <!-- Encabezado -->
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="font-size: 32px; font-weight: 700; color: #000000; margin: 0; letter-spacing: -0.03em;">
        ORDEN DE PEDIDO
      </h1>
      <p style="font-size: 18px; color: #53335d; margin: 10px 0 0 0; font-weight: 600;">
        #${orderData._id?.slice(-6) || 'N/A'}
      </p>
      <h1 style="font-size: 16px; font-weight: 700; color: #000000; margin: 0; letter-spacing: -0.03em;">
        Estado de la Orden
      </h1>
      <div style="margin-top: 16px; display: flex; justify-content: center; gap: 16px; font-size: 14px;">
      <span style="
          background-color: #F2B318;
          color: #000000;
          font-weight: 700;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 6px;
        ">
          ${orderData.isPaid ? 'GESTIONADA' : 'PENDIENTE'}
        </span>
      </div>
    </div>

    <!-- Información del Pedido -->
    <div style="margin-bottom: 32px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; font-size: 14px;">
      <div>
        <h3 style="font-size: 16px; font-weight: 600; color: #000000; margin: 0 0 12px 0;">Información del Pedido</h3>
        <div style="color: #555;">
          <p style="margin: 6px 0;"><strong>Fecha:</strong> ${orderData.createdDate ? new Date(orderData.createdDate).toLocaleDateString('es-CO') : 'N/A'}</p>
          <p style="margin: 6px 0;"><strong>Vendedor:</strong> ${salesPersonName}</p>
        </div>
      </div>
      <div>
        <h3 style="font-size: 16px; font-weight: 600; color: #000000; margin: 0 0 12px 0;">Cliente</h3>
        <div style="color: #555;">
          <p style="margin: 6px 0;"><strong>Nombre:</strong> ${clientName}</p>
          <p style="margin: 6px 0;"><strong>ID Cliente:</strong> ${clientIdToShow}</p>
        </div>
      </div>
    </div>

    <!-- Dirección de Envío -->
    ${orderData.OrderAddress ? `
    <div style="margin-bottom: 32px; background: #f8f9fa; padding: 16px; border-radius: 8px;">
      <h3 style="font-size: 16px; font-weight: 600; color: #000000; margin: 0 0 12px 0;">Dirección de Envío</h3>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 14px; color: #555;">
        <div>
          <p style="margin: 4px 0;"><strong>Dirección:</strong> ${orderData.OrderAddress.address || 'N/A'}</p>
          <p style="margin: 4px 0;"><strong>Ciudad:</strong> ${orderData.OrderAddress.city || 'N/A'}</p>
        </div>
        <div>
          <p style="margin: 4px 0;"><strong>Código Postal:</strong> ${orderData.OrderAddress.postalCode || 'N/A'}</p>
          <p style="margin: 4px 0;"><strong>Teléfono:</strong> ${orderData.OrderAddress.phone || 'N/A'}</p>
        </div>
      </div>
    </div>
    ` : ''}

    <!-- Tabla de Productos -->
    <div style="margin: 32px 0;">
      <h3 style="font-size: 16px; font-weight: 600; color: #000000; margin: 0 0 16px 0;">Productos en la Orden</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <thead>
          <tr style="background: #CCCCCC; color: #000000;">
            <th style="text-align: left; padding: 12px 8px; font-weight: 600;">Producto</th>
            <th style="text-align: center; padding: 12px 8px; font-weight: 600;">Referencia</th>
            <th style="text-align: center; padding: 12px 8px; font-weight: 600;">Cantidad</th>
            <th style="text-align: right; padding: 12px 8px; font-weight: 600;">Precio Unit.</th>
            <th style="text-align: right; padding: 12px 8px; font-weight: 600;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${orderData.items?.map((item: any) => {
            const productData = item.idProduct || item.Product;
            const productName = productData?.description || 
                                productData?.detalle ||  
                              'Producto sin nombre';
            const reference = productData?.reference || 'N/A';
            const unitPrice = item.price / item.quantity;
            const quantity = item.quantity || 0;
            const subtotal = item.price;

            return `
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 12px 8px;">
                  <div style="font-weight: 600; color: #000000;">${productName}</div>
                  <div style="font-size: 12px; color: #999;">Ref: ${productData?.reference?.slice(-6) || 'N/A'}</div>
                </td>
                <td style="text-align: center; padding: 12px 8px; color: #555;">${reference}</td>
                <td style="text-align: center; padding: 12px 8px; font-weight: 600; color: #000000;">${quantity}</td>
                <td style="text-align: right; padding: 12px 8px; color: #000000;">$${unitPrice.toLocaleString('es-CO')}</td>
                <td style="text-align: right; padding: 12px 8px; font-weight: 600; color: #000000;">$${subtotal.toLocaleString('es-CO')}</td>
              </tr>
            `;
          }).join('') || `
            <tr>
              <td colspan="5" style="text-align: center; padding: 24px; color: #999; font-style: italic;">
                No hay productos en esta orden.
              </td>
            </tr>
          `}
        </tbody>
      </table>
    </div>

    <!-- Totales -->
    <div style="margin-top: 32px; text-align: right;">
      <table style="margin-left: auto; width: 300px; border-collapse: collapse; font-size: 14px;">
        <tr>
          <td style="padding: 6px 0; text-align: right; color: #555;"><strong>Subtotal:</strong></td>
          <td style="padding: 6px 0; text-align: right; color: #000000;">$${subTotal.toLocaleString('es-CO')}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; text-align: right; color: #555;"><strong>Impuestos (15%):</strong></td>
          <td style="padding: 6px 0; text-align: right; color: #000000;">$${tax.toLocaleString('es-CO')}</td>
        </tr>
        <tr style="background: #F2B318; color: white;">
          <td style="padding: 10px 0; text-align: right;"><strong style="font-size: 16px;">TOTAL:</strong></td>
          <td style="padding: 10px 0; text-align: right;"><strong style="font-size: 16px;">$${total.toLocaleString('es-CO')}</strong></td>
        </tr>
      </table>
    </div>

    <!-- Pie de página -->
<div style="
  margin-top: 40px; 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  justify-content: center; 
  text-align: center; 
  color: #999; 
  font-size: 12px;
">
  <p style="margin: 0;">Gracias por confiar en nosotros</p>
  <p style="margin: 8px 0 0 0;">Documento generado automáticamente</p>
  
  <!-- Logo centrado -->
  <div style="margin-top: 20px;">
    <img 
      src="https://res.cloudinary.com/dra2td6jr/image/upload/v1756990004/Logo_c2lvhf.jpg" 
      alt="Ferrelectricos Restrepo" 
      style="width: 180px; height: auto; opacity: 0.9;" 
    />
  </div>
</div>
    
  `;

  document.body.appendChild(element);
    
    const opt = {
    margin: 0.5,
    filename: `orden-${orderData._id?.slice(-6) || 'N/A'}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2,
      useCORS: true,
      logging: false,
      scrollY: -window.scrollY,
      letterRendering: true
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
      setTimeout(() => {
        if (document.body.contains(element)) {
          document.body.removeChild(element);
        }
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