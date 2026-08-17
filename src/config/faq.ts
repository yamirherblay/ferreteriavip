export interface FaqItem {
  q: string;
  a: string;
}

export interface FaqSection {
  id: string;
  title: string;
  icon: string;
  items: FaqItem[];
}

export const faqConfig: FaqSection[] = [
  {
    id: 'pedir',
    title: 'Cómo hacer un pedido',
    icon: 'shopping_cart',
    items: [
       {
        q: '¿Cómo busco un producto?',
        a: 'Busca el producto en el catálogo escribiendo en el cuadro de texto el producto que quieres encontrar. La búsqueda se realiza por palabas coincidentes con el nombre o descripción.',
      },
      {
        q: '¿Cómo agrego un producto al carrito?',
        a: 'Busca el producto en el catálogo y pulsa el botón "Añadir". Quedará guardado en tu carrito para seguir comprando o para terminar el pedido.',
      },
      {
        q: '¿Cómo termino el pedido?',
        a: 'Abre el carrito, elige entre "A domicilio" o "Retiro en tienda" y pulsa "Pedir por WhatsApp". Se abrirá WhatsApp con el resumen de tu pedido ya listo; solo debes enviar el mensaje.',
      },
      {
        q: '¿Qué pasa después de enviar el pedido?',
        a: 'Un vendedor recibe tu mensaje y coordina contigo por WhatsApp la preparación del pedido y la entrega o recogida.',
      },
    ],
  },
  {
    id: 'envio',
    title: 'Envíos y retiro',
    icon: 'local_shipping',
    items: [
      {
        q: '¿Envían a domicilio?',
        a: 'Sí. En el carrito selecciona la opción "A domicilio" y escribe la dirección donde quieres recibir el pedido. Ese dato es obligatorio para poder entregarlo.',
      },
      {
        q: '¿Puedo retirar en la tienda?',
        a: 'Claro. Elige "Retiro en tienda" en el carrito y coordina la recogida por WhatsApp.',
      },
      {
        q: '¿Qué información necesito para el envío a domicilio?',
        a: 'La dirección de entrega. Si además escribes puntos de referencia (piso, edificio, junto a un parque), llegamos más rápido.',
      },
    ],
  },
  {
    id: 'precios',
    title: 'Precios',
    icon: 'payments',
    items: [
      {
        q: '¿En qué moneda están los precios?',
        a: 'Los precios están principalmente en CUP. En algunos productos puede mostrarse el precio en otra moneda cuando corresponde.',
      },
      {
        q: '¿Qué significa el precio tachado?',
        a: 'Es una oferta. Cuando un producto está en oferta se muestra el precio anterior tachado y el nuevo precio en naranja.',
      },
      {
        q: '¿Cómo confirmo el precio o resuelvo dudas?',
        a: 'Escríbenos por WhatsApp: confirmamos precio, pero, el precio que veas es el que es, lo que ves en el catalogo es que existe disponibilidad, y cualquier otra duda antes de terminar tu pedido.',
      },
    ],
  },
];