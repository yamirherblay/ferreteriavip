import { branding } from './branding';
import type { CartDelivery } from 'src/stores/types';

export const whatsappConfig = {
  number: import.meta.env.VITE_WHATSAPP_NUMBER || '5351234567',
  businessName: branding.name,
  messageTemplates: {
    product: (productName: string, price: string) =>
      `Hola, me interesa: ${productName} - ${price}`,

    cart: (items: string, total: string, delivery?: CartDelivery) => {
      const method =
        delivery && delivery.method === 'domicilio' ? 'A DOMICILIO' : 'RETIRO EN TIENDA';
      const lines = ['Hola, quiero hacer el siguiente pedido:', `Tipo de envío: ${method}`];

      if (delivery && delivery.method === 'domicilio') {
        if (delivery.name && delivery.name.trim()) lines.push(`Nombre: ${delivery.name.trim()}`);
        if (delivery.address && delivery.address.trim()) lines.push(`Dirección: ${delivery.address.trim()}`);
        if (delivery.refs && delivery.refs.trim()) lines.push(`Puntos de ref: ${delivery.refs.trim()}`);
      }

      lines.push('');
      lines.push(items);
      lines.push('');
      lines.push(`Total: ${total}`);
      return lines.join('\n');
    },

    contact: () =>
      `Hola, me gustaría obtener información sobre sus productos de ferretería.`,
  },
};

export function formatWhatsAppUrl(message: string): string {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${whatsappConfig.number}?text=${encoded}`;
}