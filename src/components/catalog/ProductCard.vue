<template>
  <q-card class="product-card">
    <div class="gold-border-top"></div>
    <q-img
      :src="product.image || '/images/placeholder.svg'"
      :ratio="1"
      :alt="product.name"
      class="cursor-pointer"
      @click.stop="preview.open(product)"
    >
      <div v-if="product.oferta && product.estado !== 'Agotado'" class="absolute-top-right q-pa-sm">
        <q-badge color="accent" text-color="white" label="Oferta" class="badge-oferta" />
      </div>
      <div v-if="product.new" class="absolute-top-left q-pa-sm badge-new-wrap">
        <q-badge color="dark" text-color="white" label="NUEVO" class="badge-new" />
      </div>
    </q-img>

    <q-card-section class="q-pa-sm card-info">
      <div class="card-title ellipsis-2-lines">{{ product.name }}</div>
      <div v-if="product.descripcion" class="card-desc text-grey-7 ellipsis-2-lines">
        {{ product.descripcion }}
      </div>
      <div class="row items-center q-mt-xs justify-between">
        <div class="card-price" :class="{'price-stacked': product.oferta}">
          <template v-if="product.oferta">
            <span class="old-price">{{ formatPrice(product.price) }}</span>
            <span class="sale-price">{{ formatPrice(product.descuento) }}</span>
          </template>
          <template v-else>
            <span class="sale-price">{{ formatPrice(product.price) }}</span>
          </template>
        </div>
        <q-badge
          :color="product.estado === 'Disponible' ? 'positive' : 'negative'"
          :text-color="'white'"
          :label="product.estado"
          class="card-status"
        />
      </div>
    </q-card-section>

    <q-card-actions class="q-pa-sm row items-center justify-between">
      <q-btn
        v-if="showWhatsApp"
        flat
        round
        dense
        icon="fa-brands fa-whatsapp"
        size="md"
        class="card-whatsapp-icon"
        @click="$emit('whatsapp', product)"
      />
      <div v-else />
      <q-btn
        v-if="showAddToCart"
        class="card-add"
        outline
        size="md"
        icon="shopping_cart"
        label="Añadir"
        no-caps
        :disable="product.estado === 'Agotado'"
        @click="$emit('add-to-cart', product)"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import type { Product } from 'src/stores/types';
import { useProductPreview } from 'src/composables/useProductPreview';

const preview = useProductPreview();

defineProps<{
  product: Product;
  showWhatsApp?: boolean;
  showAddToCart?: boolean;
}>();

defineEmits<{
  (e: 'whatsapp', product: Product): void;
  (e: 'add-to-cart', product: Product): void;
}>();

function formatPrice(value: number): string {
  return new Intl.NumberFormat('es-CU', {
    style: 'currency',
    currency: 'CUP',
    maximumFractionDigits: 0,
  }).format(value);
}
</script>

<style scoped>
.product-card {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 5px;
  overflow: hidden;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.product-card:hover .gold-border-top {
  border-image: linear-gradient(90deg, #c8963e, #d4a84e) 1;
}

.card-info {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
}

.card-title {
  font-family: 'Oswald', sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: #1a1a2e;
  line-height: 1.2;
}

.card-desc {
  font-family: 'Inter', sans-serif;
  font-size: 0.75rem;
  line-height: 1.3;
  margin-top: 2px;
}

.card-price {
  font-family: 'JetBrains Mono', monospace;
  font-size: 1rem;
  font-weight: 400;
  color: #1a1a2e;
}

.card-status {
  font-family: 'Inter', sans-serif;
  font-size: 0.65rem;
  font-weight: 500;
  padding: 2px 6px;
  border-radius: 2px;
}

.card-whatsapp-icon {
  color: #ffffff;
  background: #128C7E;
}

.card-add {
  border-color: #825C18;
  color: #825C18;
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  font-size: 0.8rem;
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
  color: #dc2626;
  margin-right: 6px;
  font-size: 0.85em;
}

.sale-price {
  font-weight: 600;
  color: #1a1a2e;
}

.badge-oferta,
.badge-new {
  font-family: 'Oswald', sans-serif;
  letter-spacing: 1px;
}

.badge-oferta {
  font-size: 0.6rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 2px;
  background: #C2410C;
}

.badge-new-wrap {
  min-width: 0;
}

.badge-new {
  width: 34px;
  height: 34px;
  padding: 0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6rem;
  font-weight: 700;
}

.ellipsis-2-lines {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
