<template>
  <q-card class="my-card">
    <q-img :src="product.image || '/images/placeholder.svg'" :alt="product.name" ratio="4/3" />
    <q-card-section>
      <div class="text-subtitle1">{{ product.name }}</div>
      <div v-if="product.descripcion" class="text-caption text-grey-7">
        {{ product.descripcion }}
      </div>
      <div class="text-h6 q-mt-sm" :class="{'price-stacked': product.oferta}">
        <template v-if="product.oferta">
          <span class="old-price">{{ currency(product.price, product.currency) }}</span>
          <span class="sale-price">{{ currency(product.descuento, product.currency) }}</span>
        </template>
        <template v-else>
          <span class="sale-price">{{ currency(product.price, product.currency) }}</span>
        </template>
      </div>
    </q-card-section>
    <q-card-actions align="between">
      <q-btn color="primary" label="Agregar al carrito" @click="addToCart" />
      <q-btn flat label="Ver" :to="{ name: 'product', params: { id: product.id } }" />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { useCartStore } from 'src/stores/cart';
import { formatPrice } from 'src/utils/format';
import type { Product } from 'src/stores/types';

const props = defineProps<{ product: Product }>();
const cart = useCartStore();

function addToCart() {
  cart.add(props.product, 1);
}
function currency(n: number, c?: string) {
  return formatPrice(n, c);
}
</script>

<style scoped>
.my-card {
  max-width: 320px;
  width: 100%;
}

.price-stacked {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
  gap: 2px;
}

.old-price {
  text-decoration: line-through;
  opacity: 0.45;
  margin-right: 6px;
  font-size: 0.85em;
  color: #dc2626;
}

.sale-price {
  font-weight: 600;
}
</style>
