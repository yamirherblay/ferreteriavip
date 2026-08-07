<template>
  <div class="product-grid">
    <div class="row q-col-gutter-md">
      <div
        v-for="(product, index) in products"
        :key="product.id"
        :class="gridClass"
        :style="{ '--i': index }"
      >
        <ProductCard
          v-if="viewMode === 'grid'"
          :product="product"
          :show-whats-app="true"
          :show-add-to-cart="true"
          @whatsapp="$emit('whatsapp', $event)"
          @add-to-cart="$emit('add-to-cart', $event)"
        />
        <ProductListItem
          v-else
          :product="product"
          @whatsapp="$emit('whatsapp', $event)"
          @add-to-cart="$emit('add-to-cart', $event)"
        />
      </div>
    </div>

    <div v-if="products.length === 0" class="q-mt-xl text-grey text-center">
      <slot name="empty">No hay productos disponibles.</slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import ProductCard from './ProductCard.vue';
import ProductListItem from './ProductListItem.vue';
import type { ViewMode } from './types';
import type { Product } from 'src/stores/types';

const props = defineProps<{
  products: Product[];
  viewMode: ViewMode;
}>();

defineEmits<{
  (e: 'whatsapp', product: Product): void;
  (e: 'add-to-cart', product: Product): void;
}>();

const gridClass = computed(() =>
  props.viewMode === 'grid'
    ? 'col-6 col-sm-6 col-md-4 col-lg-3 product-card-wrapper'
    : 'col-12 product-card-wrapper',
);
</script>

<style scoped>
.product-grid {
  min-height: 200px;
}

.product-card-wrapper {
  animation: fade-slide-in 0.3s ease-out both;
  animation-delay: calc(var(--i, 0) * 50ms);
}

@keyframes fade-slide-in {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .product-card-wrapper {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
</style>
