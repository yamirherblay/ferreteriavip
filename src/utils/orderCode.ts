// Código corto de pedido: 6 caracteres derivados del token (uuid).
//
// El `id` de `order` es un bigint de identidad GLOBAL del proyecto compartido y
// el `token` es un uuid de 36 caracteres: ninguno sirve como "número de pedido"
// legible ni es relativo al negocio. Este hash FNV-1a (base36) es determinista
// (mismo token ⇒ mismo código) y DEBE coincidir con el de la app de negocio
// (`ferreteriavip-apk/src/utils/orderCode.ts`) para que cliente y dueño hablen
// del mismo número.

/** Hash FNV-1a de 32 bits → base36 en mayúsculas, 6 caracteres con relleno. */
export function orderCode(token: string | null | undefined): string {
  if (!token) return '——————';
  let h = 0x811c9dc5;
  for (let i = 0; i < token.length; i++) {
    h ^= token.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36).toUpperCase().padStart(6, '0').slice(-6);
}
