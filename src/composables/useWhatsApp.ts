import { whatsappConfig, formatWhatsAppUrl } from 'src/config/whatsapp';
import type { Product, CartItem, CartDelivery } from 'src/stores/types';
import { formatPrice } from 'src/utils/format';

export function useWhatsApp() {
  function sendProductRequest(product: Product) {
    const price = formatProductPrice(product);
    const message = whatsappConfig.messageTemplates.product(product.name, price, product.image);
    window.open(formatWhatsAppUrl(message), '_blank');
  }

  function sendCartProposal(
    items: CartItem[],
    totals: Record<string, number>,
    delivery?: CartDelivery,
    reference?: string,
  ): { opened: boolean; url: string } {
    const itemsList = items
      .map((item) => {
        const unit = formatProductPrice(item.product);
        return `• ${item.product.name} x${item.quantity} - ${unit} c/u`;
      })
      .join('\n');

    const currencyEntries = Object.entries(totals);
    const first = currencyEntries[0] ?? ['CUP', 0];
    const totalsBlock =
      currencyEntries.length === 1
        ? formatPrice(first[1], first[0])
        : currencyEntries
            .map(([currency, total]) => `${currency}: ${formatPrice(total, currency)}`)
            .join('\n');

    const message = whatsappConfig.messageTemplates.cart(itemsList, totalsBlock, delivery, reference);
    const url = formatWhatsAppUrl(message);
    const win = window.open(url, '_blank');
    return { opened: win != null, url };
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
  const label = formatPrice(price, product.currency);
  return product.oferta ? `${label} (Oferta)` : label;
}
