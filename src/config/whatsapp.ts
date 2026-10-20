import { branding } from './branding';
import type { CartDelivery } from 'src/stores/types';

export const whatsappConfig = {
  number: import.meta.env.VITE_WHATSAPP_NUMBER || '5351234567',
  businessName: branding.name,
  messageTemplates: {
    product: (productName: string, price: string, imageUrl?: string) =>
      imageUrl
        ? [
            'Hola, me interesa este producto:',
            '',
            `🛒 Producto: ${productName}`,
            `💰 Precio: ${price}`,
            `🖼 Imagen: ${imageUrl}`,
            '',
            '¿Me podrías confirmar la disponibilidad? Quedo atento. Gracias.',
          ].join('\n')
        : [
            'Hola, me interesa este producto:',
            '',
            `🛒 Producto: ${productName}`,
            `💰 Precio: ${price}`,
            '',
            '¿Me podrías confirmar la disponibilidad? Quedo atento. Gracias.',
          ].join('\n'),

    cart: (items: string, totalsBlock: string, delivery?: CartDelivery, reference?: string) => {
      const method =
        delivery && delivery.method === 'domicilio' ? 'A DOMICILIO' : 'RETIRO EN TIENDA';
      const lines = [
        'Hola, quiero hacer el siguiente pedido:',
        '',
        `🧾 Pedido: ${reference || '---'}`,
        `📦 Tipo de envío: ${method}`,
      ];

      if (delivery && delivery.method === 'domicilio') {
        if (delivery.name && delivery.name.trim()) lines.push(`👤 Cliente: ${delivery.name.trim()}`);
        if (delivery.address && delivery.address.trim())
          lines.push(`📍 Dirección: ${delivery.address.trim()}`);
        if (delivery.refs && delivery.refs.trim())
          lines.push(`📌 Puntos de ref: ${delivery.refs.trim()}`);
      }

      lines.push('');
      lines.push('🛒 Productos:');
      lines.push(items);
      lines.push('');
      lines.push(`💰 Total: ${totalsBlock}`);
      lines.push('');
      lines.push('Quedo atento a su confirmación. Gracias.');
      return lines.join('\n');
    },

    contact: () =>
      [
        'Hola 👋, me gustaría obtener información sobre sus productos de ferretería.',
        '',
        '¿Me podrías ayudar con disponibilidad, precios y opciones de entrega? Quedo atento a su respuesta. Gracias.',
      ].join('\n'),
  },
};

export function formatWhatsAppUrl(message: string): string {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${whatsappConfig.number}?text=${encoded}`;
}