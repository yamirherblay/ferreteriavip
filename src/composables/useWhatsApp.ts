import { whatsappConfig, formatWhatsAppUrl } from 'src/config/whatsapp';
import type { Product, CartItem, CartDelivery } from 'src/stores/types';

export function useWhatsApp() {
  function sendProductRequest(product: Product) {
    const price = formatProductPrice(product);
    const message = whatsappConfig.messageTemplates.product(product.name, price);
    window.open(formatWhatsAppUrl(message), '_blank');
  }

  function sendCartProposal(items: CartItem[], total: number, delivery?: CartDelivery) {
    const itemsList = items
      .map((item) => `${item.product.name} x${item.quantity} - ${formatProductPrice(item.product)}`)
      .join('\n');

    const totalFormatted = formatPrice(total);
    const message = whatsappConfig.messageTemplates.cart(itemsList, totalFormatted, delivery);
    window.open(formatWhatsAppUrl(message), '_blank');
  }

  function sendContactMessage() {
    const message = whatsappConfig.messageTemplates.contact();
    window.open(formatWhatsAppUrl(message), '_blank');
  }

  return {
    sendProductRequest,
    sendCartProposal,
    sendContactMessage,
  };
}

function formatProductPrice(product: Product): string {
  const price = product.oferta && product.descuento ? product.descuento : product.price;
  const label = formatPrice(price);
  return product.oferta ? `${label} (Oferta)` : label;
}

function formatPrice(value: number): string {
  const formatted = new Intl.NumberFormat('es-CU', {
    style: 'currency',
    currency: 'CUP',
    maximumFractionDigits: 0,
  }).format(value);
  return `${formatted} CUP`;
}