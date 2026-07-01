<template>
  <q-page class="index-page">
    <!-- Hero -->
    <section class="hero-section text-white noise-bg">
      <div class="hero-glow"></div>
      <div class="hero-content column items-center text-center q-pa-lg">
        <q-img src="/images/logo.jpeg" alt="Ferretería VIP" class="hero-logo q-mb-lg" ratio="1" />
        <div class="hero-tags q-mb-lg hero-enter-sub">
          <span class="hero-tag">Herramientas</span>
          <span class="hero-tag">Material eléctrico</span>
          <span class="hero-tag">Grifería</span>
          <span class="hero-tag">Cerraduras</span>
          <span class="hero-tag">Spray</span>
          <span class="hero-tag">Lijas</span>
        </div>
        <q-btn
          color="secondary"
          size="lg"
          :label="branding.hero.ctaText"
          :to="branding.hero.ctaLink"
          unelevated
          no-caps
          class="hero-cta q-px-xl hero-enter-cta"
        />
      </div>
    </section>

    <hr class="brass-rule hero-enter-rule" />

    <!-- Categories -->
    <section class="categories-section q-pa-lg section-reveal">
      <div class="text-center q-mb-lg">
        <div class="categories-title text-weight-bold">CATEGORÍAS</div>
        <div class="text-grey-7 text-caption">Explora por secciones</div>
      </div>
      <div class="row q-col-gutter-md justify-center">
        <div
          v-for="(cat, index) in displayCategories"
          :key="cat.key"
          class="col-6 col-sm-4 col-md-3"
        >
          <div
            class="category-card scroll-reveal"
            :class="{ revealed: revealedCategories }"
            :style="{ transitionDelay: `${index * 80}ms` }"
            @click="$router.push(`/catalogo?cat=${cat.key}`)"
          >
            <q-card flat bordered class="category-inner bg-white">
              <div class="gold-border-top"></div>
              <q-card-section class="column items-center text-center q-py-lg">
                <q-icon :name="cat.icon" size="2.5rem" class="category-icon q-mb-sm" />
                <div class="category-label text-weight-bold">{{ cat.label }}</div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>
    </section>

    <hr class="brass-rule" />

    <!-- Featured products -->
    <section class="shelf-section q-pa-lg section-reveal">
      <div class="text-center q-mb-lg">
        <div class="shelf-title text-weight-bold">PRODUCTOS DESTACADOS</div>
        <div class="text-grey-7 text-caption">Lo más vendido — incluye ofertas</div>
      </div>
      <div v-if="loading" class="row q-col-gutter-md">
        <div v-for="n in 4" :key="n" class="col-6 col-sm-4 col-md-3">
          <div class="skeleton-card bg-white" style="border-radius: 4px; overflow: hidden">
            <q-skeleton square style="width: 100%; aspect-ratio: 1" animation="wave" />
            <div class="q-pa-sm">
              <q-skeleton type="text" width="80%" height="14px" animation="wave" />
              <q-skeleton type="text" width="50%" height="16px" class="q-mt-xs" animation="wave" />
              <q-skeleton type="text" width="30%" height="12px" class="q-mt-xs" animation="wave" />
            </div>
          </div>
        </div>
      </div>
      <div v-else class="row q-col-gutter-md">
        <div
          v-for="product in featuredProducts"
          :key="product.id"
          class="col-6 col-sm-4 col-md-3 cursor-pointer"
          @click="$router.push('/catalogo')"
        >
          <div class="shelf-card bg-white">
            <div class="shelf-img-wrap">
              <q-img
                :src="product.image || '/images/placeholder.svg'"
                ratio="1"
                class="shelf-img cursor-pointer"
                @click.stop="preview.open(product)"
              />
              <div v-if="product.oferta" class="offer-ribbon">OFERTA</div>
            </div>
            <div class="shelf-divider"></div>
            <div class="shelf-info q-pa-sm">
              <div class="shelf-name text-weight-bold">{{ product.name }}</div>
              <div class="shelf-price" :class="{'shelf-stacked': product.oferta}">
                <template v-if="product.oferta">
                  <span class="old-price">{{ formatPrice(product.price) }}</span>
                  <span class="sale-price">{{ formatPrice(product.descuento) }}</span>
                </template>
                <template v-else>
                  <span class="sale-price">{{ formatPrice(product.price) }}</span>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="text-center q-mt-md">
        <q-btn flat no-caps label="Ver catálogo completo →" to="/catalogo" class="shelf-link" />
      </div>
    </section>

    <hr class="brass-rule" />

    <!-- WhatsApp CTA -->
    <section class="cta-section bg-primary text-white q-pa-lg section-reveal">
      <div class="column items-center text-center">
        <div class="cta-title">¿Necesitas herramientas o materiales?</div>
        <div class="cta-bullets q-my-md">
          <span class="cta-bullet"><q-icon name="check_circle" size="xs" color="positive" /> Atención rápida</span>
          <span class="cta-dot">·</span>
          <span class="cta-bullet"><q-icon name="check_circle" size="xs" color="positive" /> Buenos precios</span>
          <span class="cta-dot">·</span>
          <span class="cta-bullet"><q-icon name="check_circle" size="xs" color="positive" /> Variedad de productos</span>
        </div>
        <q-btn
          color="positive"
          size="md"
          label="Escríbenos directo aquí"
          unelevated
          no-caps
          class="q-px-xl"
          style="border-radius: 6px"
          @click="openWhatsApp"
        >
          <template v-slot:default>
            <q-icon name="fa-brands fa-whatsapp" />
          </template>
        </q-btn>
      </div>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { branding } from 'src/config/branding';
import { defaultCategories } from 'src/config/categories';
import { whatsappConfig, formatWhatsAppUrl } from 'src/config/whatsapp';
import { useProducts } from 'src/composables/useProducts';
import { useProductPreview } from 'src/composables/useProductPreview';
import { useMeta } from 'quasar';

const preview = useProductPreview();

const displayCategories = defaultCategories.filter((c) => c.key !== 'all');
const revealedCategories = ref(false);

const { products, fetchProducts, loading } = useProducts();

const featuredProducts = computed(() => {
  const available = products.value.filter((p) => p.estado !== 'Agotado');
  const offers = available.filter((p) => p.oferta);
  const nonOffers = available.filter((p) => !p.oferta);

  const selectedOffers = offers.slice(0, 2);
  const remaining = 4 - selectedOffers.length;
  const shuffled = [...nonOffers].sort(() => Math.random() - 0.5);
  const selectedNonOffers = shuffled.slice(0, remaining);

  return [...selectedOffers, ...selectedNonOffers];
});

function formatPrice(value: number): string {
  return new Intl.NumberFormat('es-CU', {
    style: 'currency',
    currency: 'CUP',
    maximumFractionDigits: 0,
  }).format(value);
}

let observer: IntersectionObserver | null = null;

onMounted(async () => {
  await fetchProducts();
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          if (entry.target.classList.contains('categories-section')) {
            revealedCategories.value = true;
          }
          observer?.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 },
  );
  const els = document.querySelectorAll('.section-reveal');
  if (els.length) {
    els.forEach((el) => observer?.observe(el));
  }
});

onUnmounted(() => {
  observer?.disconnect();
});

function openWhatsApp() {
  const url = formatWhatsAppUrl(whatsappConfig.messageTemplates.contact());
  window.open(url, '_blank');
}

useMeta({
  title: `${branding.name} | Inicio`,
  meta: {
    description: { name: 'description', content: branding.slogan },
    'og:title': { property: 'og:title', content: `${branding.name} | Inicio` },
    'og:description': { property: 'og:description', content: branding.slogan },
    'og:image': { property: 'og:image', content: branding.siteUrl + branding.logo },
    'og:url': { property: 'og:url', content: branding.siteUrl + '/' },
    'twitter:title': { name: 'twitter:title', content: `${branding.name} | Inicio` },
    'twitter:description': { name: 'twitter:description', content: branding.slogan },
  },
});
</script>

<style scoped>
.index-page {
  overflow-x: hidden;
}

/* Hero */
.hero-section {
  background: #0c1a2e;
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.hero-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 500px;
  height: 500px;
  transform: translate(-50%, -50%);
  background: radial-gradient(ellipse at center, rgba(200, 150, 62, 0.25) 0%, transparent 60%);
  pointer-events: none;
  z-index: 0;
}

.hero-content {
  position: relative;
  z-index: 1;
}

.hero-logo {
  width: 260px;
  height: 260px;
  border-radius: 50%;
  animation:
    hero-scale-in 0.8s cubic-bezier(0.22, 1, 0.36, 1) both,
    logo-float 4s ease-in-out infinite;
  animation-delay: 0s, 1.2s;
}

.hero-tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  max-width: 480px;
}

.hero-tag {
  font-family: 'Inter', sans-serif;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 5px 14px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 20px;
  color: rgba(255, 255, 255, 0.9);
  letter-spacing: 0.3px;
}

.hero-cta {
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  border-radius: 6px;
}

/* Entrance animations */
@keyframes hero-scale-in {
  from {
    opacity: 0;
    transform: scale(0.92);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes hero-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes hero-fade-up {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes hero-rule-expand {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}

@keyframes logo-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
}

.hero-enter-sub {
  animation: hero-fade-in 0.6s ease both;
  animation-delay: 0.25s;
}

.hero-enter-cta {
  animation: hero-fade-up 0.6s ease both;
  animation-delay: 0.5s;
}

.hero-enter-rule {
  animation: hero-rule-expand 0.5s ease both;
  animation-delay: 0.8s;
  transform-origin: center;
}

/* Categories */
.categories-section {
  background: #f5f3ef;
}

.categories-title {
  font-family: 'Oswald', sans-serif;
  font-size: 1.5rem;
  letter-spacing: 3px;
}

.category-card {
  cursor: pointer;
}

.category-inner {
  border-radius: 4px;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.category-inner:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.category-icon {
  color: #c8963e;
}

.category-label {
  font-family: 'Oswald', sans-serif;
  font-size: 1rem;
  letter-spacing: 1px;
}

/* Shelf (featured products) */
.shelf-section {
  background: #ffffff;
}

.shelf-title {
  font-family: 'Oswald', sans-serif;
  font-size: 1.5rem;
  letter-spacing: 3px;
}

.shelf-card {
  border-radius: 4px;
  overflow: hidden;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.shelf-img-wrap {
  position: relative;
  overflow: hidden;
}

.offer-ribbon {
  position: absolute;
  top: 14px;
  right: -30px;
  background: #E85D04;
  color: #fff;
  font-family: 'Inter', sans-serif;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 1px;
  padding: 3px 34px;
  transform: rotate(45deg);
  z-index: 2;
  text-transform: uppercase;
  line-height: 1.4;
  pointer-events: none;
}

.shelf-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.shelf-divider {
  height: 1px;
  background: #8c929a;
  margin: 0;
}

.shelf-name {
  font-family: 'Oswald', sans-serif;
  font-size: 0.85rem;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: #1a1a2e;
  line-height: 1.2;
}

.shelf-price {
  font-family: 'JetBrains Mono', monospace;
  font-size: 1rem;
  color: #1a1a2e;
  margin-top: 2px;

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
}

.shelf-stacked {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
  gap: 2px;
}

.shelf-badge {
  font-family: 'Inter', sans-serif;
  font-size: 0.65rem;
  font-weight: 500;
  padding: 2px 6px;
  border-radius: 2px;
  margin-top: 4px;
}

.shelf-link {
  font-family: 'Oswald', sans-serif;
  font-size: 0.95rem;
  letter-spacing: 1px;
  color: #c8963e;
}

/* CTA section */
.cta-title {
  font-family: 'Oswald', sans-serif;
  letter-spacing: 3px;
  font-size: 1.5rem;
}

.cta-bullets {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 6px;
}

.cta-bullet {
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.85);
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.cta-dot {
  color: rgba(255, 255, 255, 0.3);
  font-size: 1rem;
  user-select: none;
}

/* Responsive hero */
@media (min-width: 768px) {
  .hero-logo {
    width: 380px;
    height: 380px;
  }
  .hero-tags {
    max-width: 560px;
    gap: 10px;
  }

  .hero-tag {
    font-size: 0.85rem;
    padding: 6px 18px;
  }
}

@media (min-width: 1024px) {
  .hero-logo {
    width: 420px;
    height: 420px;
  }
}
</style>
