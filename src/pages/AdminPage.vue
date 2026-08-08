<template>
  <q-page padding class="admin-page">
    <div class="section-eyebrow">Panel de control</div>
    <div class="section-title">RESUMEN</div>
    <div class="section-rule"></div>

    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-4">
        <q-card class="stat-gauge" style="border-left: 4px solid #0A2747;">
          <q-card-section class="row items-center no-wrap q-py-md">
            <div class="gauge-icon" style="background: #0A2747;">
              <q-icon name="inventory_2" size="22px" color="white" />
            </div>
            <div class="q-ml-md">
              <div class="gauge-label">TOTAL</div>
              <div class="gauge-value" style="color: #0A2747;">{{ totalProducts }}</div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-4">
        <q-card class="stat-gauge" style="border-left: 4px solid #2D6A4F;">
          <q-card-section class="row items-center no-wrap q-py-md">
            <div class="gauge-icon" style="background: #2D6A4F;">
              <q-icon name="check_circle" size="22px" color="white" />
            </div>
            <div class="q-ml-md">
              <div class="gauge-label">DISPONIBLES</div>
              <div class="gauge-value" style="color: #2D6A4F;">{{ availableCount }}</div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-4">
        <q-card class="stat-gauge" style="border-left: 4px solid #C8963E;">
          <q-card-section class="row items-center no-wrap q-py-md">
            <div class="gauge-icon" style="background: #C8963E;">
              <q-icon name="local_offer" size="22px" color="white" />
            </div>
            <div class="q-ml-md">
              <div class="gauge-label">EN OFERTA</div>
              <div class="gauge-value" style="color: #C8963E;">{{ offerCount }}</div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="section-title q-mt-xl">PRODUCTOS</div>
    <div class="section-rule"></div>

    <q-card class="products-card">
      <q-card-section class="row items-center q-col-gutter-sm q-py-sm">
        <div class="col-auto">
          <q-btn color="primary" icon="add" label="Añadir" no-caps @click="openAdd" :disable="!negocioId" style="font-family: 'Inter', sans-serif;" />
        </div>
        <div class="col-12 col-sm-4 q-ml-auto">
          <q-input dense outlined v-model="filter" placeholder="Buscar productos..." clearable>
            <template #prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>
      </q-card-section>

      <q-separator />

      <q-table
        :rows="filteredProducts"
        :columns="columns"
        flat
        :header-cell-style="headerCellStyle"
        loading-label="Cargando productos..."
        row-key="id"
        :pagination="{ rowsPerPage: 10 }"
        class="products-table"
      >
        <template #body-cell-actions="props">
          <q-td :props="props">
            <q-btn size="sm" color="primary" flat icon="visibility" @click="openView(props.row)" class="q-mr-xs">
              <q-tooltip>Ver detalle</q-tooltip>
            </q-btn>
            <q-btn size="sm" color="secondary" flat icon="edit" @click="openEdit(props.row)">
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
            <q-btn size="sm" color="negative" flat icon="delete" @click="confirmDelete(props.row)">
              <q-tooltip>Eliminar</q-tooltip>
            </q-btn>
          </q-td>
        </template>
        <template #body-cell-image="props">
          <q-td :props="props">
            <q-img :src="props.row.image" :ratio="1" style="width: 36px; height: 36px; border-radius: 2px;" />
          </q-td>
        </template>
        <template #body-cell-id="props">
          <q-td :props="props" style="font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; color: #6B7280;">
            {{ props.row.id?.slice(0, 8) }}...
          </q-td>
        </template>
        <template #body-cell-price="props">
          <q-td :props="props" style="font-family: 'JetBrains Mono', monospace;">
            {{ formatPrice(props.row.price) }}
          </q-td>
        </template>
        <template #body-cell-disponibilidad="props">
          <q-td :props="props">
            <div class="row items-center no-wrap q-gutter-xs">
              <q-toggle
                :model-value="props.row.estado === 'Disponible'"
                color="green-7"
                dense
                size="sm"
                :disable="togglingId === props.row.id"
                @update:model-value="confirmToggle(props.row)"
              />
              <span class="text-caption">{{ props.row.estado }}</span>
            </div>
          </q-td>
        </template>
        <template #body-cell-oferta="props">
          <q-td :props="props">
            <q-badge
              v-if="props.row.oferta"
              label="Oferta"
              color="secondary"
              dense
              style="font-family: 'Inter', sans-serif; font-weight: 500; padding: 2px 8px;"
            />
          </q-td>
        </template>
      </q-table>
    </q-card>

    <q-dialog v-model="viewDialog">
      <q-card style="max-width: 500px; width: 100%;">
        <q-card-section class="row items-center q-py-sm" style="border-bottom: 2px solid #C8963E;">
          <div class="text-subtitle1 text-weight-bold" style="font-family: 'Inter', sans-serif; color: #0A2747;">{{ viewProduct?.name }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section class="q-pt-md">
          <div class="row q-col-gutter-md">
            <div class="col-4">
              <q-img :src="viewProduct?.image" :ratio="1" style="border-radius: 4px;" />
            </div>
            <div class="col-8">
              <div class="q-mb-xs">
                <span class="text-caption text-grey-7">ID</span>
                <div style="font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; color: #1A1A1A;">{{ viewProduct?.id }}</div>
              </div>
              <div class="q-mb-xs">
                <span class="text-caption text-grey-7">Precio</span>
                <div style="font-family: 'JetBrains Mono', monospace; font-size: 0.95rem; color: #0A2747; font-weight: 600;">{{ formatPrice(viewProduct?.price) }}</div>
              </div>
              <div class="q-mb-xs">
                <span class="text-caption text-grey-7">Categoría</span>
                <div class="text-body2">{{ viewProduct?.category }}</div>
              </div>
              <div class="q-mb-xs">
                <span class="text-caption text-grey-7">Estado</span>
                <div>
                  <q-badge
                    :label="viewProduct?.estado"
                    :color="viewProduct?.estado === 'Disponible' ? 'green-7' : 'red-5'"
                    dense
                  />
                </div>
              </div>
              <div v-if="viewProduct?.descripcion" class="q-mt-sm">
                <span class="text-caption text-grey-7">Descripción</span>
                <div class="text-body2 text-grey-8">{{ viewProduct?.descripcion }}</div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="addDialog" persistent>
      <q-card style="max-width: 700px; width: 100%;">
        <q-card-section class="row items-center q-py-sm" style="border-bottom: 2px solid #C8963E;">
          <div class="text-subtitle1 text-weight-bold" style="font-family: 'Inter', sans-serif; color: #0A2747;">Nuevo producto</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <ProductForm
            v-model="newProduct"
            :negocio-id="negocioId"
            mode="add"
            @save="saveNew"
            @cancel="addDialog = false"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="editDialog" persistent>
      <q-card style="max-width: 700px; width: 100%;">
        <q-card-section class="row items-center q-py-sm" style="border-bottom: 2px solid #C8963E;">
          <div class="text-subtitle1 text-weight-bold" style="font-family: 'Inter', sans-serif; color: #0A2747;">Editar producto</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <ProductForm
            v-model="editProduct"
            :negocio-id="negocioId"
            mode="edit"
            @save="saveEdit"
            @cancel="editDialog = false"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import type { QTableColumn } from 'quasar';
import { useMeta, useQuasar } from 'quasar';

useMeta({
  title: 'Admin | Ferretería VIP',
  meta: {
    robots: { name: 'robots', content: 'noindex, nofollow' },
  },
});

import ProductForm from 'src/components/ProductForm.vue';
import { useAdminChangesStore } from 'src/stores/adminChanges';
import { useProducts } from 'src/composables/useProducts';
import { supabase } from 'boot/supabase';
import { getAdminBusinessId } from 'src/config/business';
import type { Product } from 'src/stores/types';

const products = ref<Product[]>([]);
const filter = ref('');
const changesStore = useAdminChangesStore();
const addDialog = ref(false);
const editDialog = ref(false);
const negocioId = getAdminBusinessId();
const $q = useQuasar();
const { deleteProduct } = useProducts();

const newProduct = ref<Product>({
  id: '',
  name: '',
  price: 0,
  category: '',
  image: '',
  new: false,
  oferta: false,
  estado: 'Disponible',
  subcategory: '',
  descuento: 0,
  descripcion: '',
  negocio_id: negocioId ?? '',
});

const editProduct = ref<Product>({
  id: '',
  name: '',
  price: 0,
  category: '',
  image: '',
  new: false,
  oferta: false,
  estado: 'Disponible',
  subcategory: '',
  descuento: 0,
  descripcion: '',
  negocio_id: negocioId ?? '',
});

const originalEditId = ref<string | null>(null);

const headerCellStyle = () => ({
  background: '#0F1B2D',
  color: '#FFFFFF',
  fontFamily: 'Inter, sans-serif',
  fontWeight: 600,
  fontSize: '0.75rem',
  letterSpacing: '0.5px',
  textTransform: 'uppercase' as const,
});

const columns = <QTableColumn[]>[
  { name: 'image', label: '', field: 'image', align: 'left', style: 'width: 48px' },
  { name: 'id', label: 'ID', field: 'id', align: 'left', sortable: true },
  { name: 'name', label: 'Nombre', field: 'name', align: 'left', sortable: true },
  {
    name: 'price',
    label: 'Precio',
    field: 'price',
    align: 'right',
    sortable: true,
    format: (v: number) => formatPrice(v),
  },
  { name: 'category', label: 'Categoría', field: 'category', align: 'left', sortable: true },
  {
    name: 'subcategory',
    label: 'Subcategoría',
    field: 'subcategory',
    align: 'left',
  },
  { name: 'disponibilidad', label: 'Estado', field: 'estado', align: 'left' },
  { name: 'oferta', label: 'Oferta', field: 'oferta', align: 'left' },
  { name: 'actions', label: '', field: 'actions', align: 'right' },
];

const filteredProducts = computed(() => {
  const f = filter.value.trim().toLowerCase();
  if (!f) return products.value;
  return products.value.filter(
    (p) =>
      p.name?.toLowerCase().includes(f) ||
      p.id?.toLowerCase().includes(f) ||
      p.category?.toLowerCase().includes(f),
  );
});

const viewDialog = ref(false);
const viewProduct = ref<Product | null>(null);
const togglingId = ref<string | null>(null);

function confirmToggle(row: Product) {
  const newEstado = row.estado === 'Disponible' ? 'Agotado' : 'Disponible';
  $q.dialog({
    title: 'Cambiar disponibilidad',
    message: `¿Estás seguro de cambiar "${row.name}" de ${row.estado} a ${newEstado}?`,
    cancel: { label: 'Cancelar', flat: true },
    ok: { label: 'Aceptar', color: 'primary' },
    persistent: true,
  }).onOk(() => { void toggleVisibility(row, newEstado); });
}

async function toggleVisibility(row: Product, newEstado: string) {
  togglingId.value = row.id;
  try {
    const { error } = await supabase
      .from('products')
      .update({ estado: newEstado })
      .eq('id', row.id)
      .eq('negocio_id', negocioId);
    if (error) throw error;
    const idx = products.value.findIndex((p) => p.id === row.id);
    if (idx !== -1) {
      const target = products.value[idx];
      if (target) target.estado = newEstado as 'Disponible' | 'Agotado';
    }
    changesStore.addUpdated({ id: row.id, name: row.name });
    $q.notify({
      message: `"${row.name}" ahora está ${newEstado}`,
      color: 'positive',
      icon: 'check_circle',
      timeout: 2000,
    });
  } catch {
    $q.notify({
      message: 'Error al cambiar disponibilidad',
      color: 'negative',
      icon: 'error',
    });
  } finally {
    togglingId.value = null;
  }
}

function openView(row: Product) {
  viewProduct.value = { ...row };
  viewDialog.value = true;
}

function openAdd() {
  newProduct.value = {
    id: '',
    name: '',
    price: 0,
    category: '',
    image: '',
    new: false,
    oferta: false,
    estado: 'Disponible',
    subcategory: '',
    descuento: 0,
    descripcion: '',
    negocio_id: negocioId ?? '',
  };
  addDialog.value = true;
}

function openEdit(row: Product) {
  editProduct.value = { ...row };
  originalEditId.value = row.id;
  editDialog.value = true;
}

function saveNew(product: Product) {
  const exists = products.value.find((p) => p.id === product.id);
  if (exists) {
    const idx = products.value.findIndex((p) => p.id === product.id);
    products.value[idx] = { ...product };
    changesStore.addUpdated({ id: product.id, name: product.name });
  } else {
    products.value.unshift({ ...product });
    changesStore.addAdded({ id: product.id, name: product.name });
  }
  addDialog.value = false;
}

const totalProducts = computed(() => products.value.length);
const availableCount = computed(
  () => products.value.filter((p) => p.estado === 'Disponible').length,
);
const offerCount = computed(() => products.value.filter((p) => p.oferta === true).length);

function saveEdit(product: Product) {
  const key = originalEditId.value ?? product.id;
  const idx = products.value.findIndex((p) => p.id === key);
  if (idx !== -1) {
    products.value[idx] = { ...product };
    changesStore.addUpdated({ id: product.id, name: product.name });
  }
  originalEditId.value = null;
  editDialog.value = false;
}

function confirmDelete(row: Product) {
  $q.dialog({
    title: 'Eliminar producto',
    message: `¿Estás seguro de eliminar "${row.name}"?`,
    cancel: { label: 'Cancelar', flat: true },
    ok: { label: 'Eliminar', color: 'negative' },
    persistent: true,
  }).onOk(() => { void handleDelete(row); });
}

async function handleDelete(row: Product) {
  const ok = await deleteProduct(row.id, row.image);
  if (ok) {
    const idx = products.value.findIndex((p) => p.id === row.id);
    if (idx !== -1) products.value.splice(idx, 1);
    changesStore.addDeleted({ id: row.id, name: row.name });
    $q.notify({
      message: 'Producto eliminado correctamente',
      color: 'positive',
      icon: 'check_circle',
    });
  } else {
    $q.notify({
      message: 'Error al eliminar producto',
      color: 'negative',
      icon: 'error',
    });
  }
}

function formatPrice(val?: number) {
  if (val == null) return '-';
  return new Intl.NumberFormat('es-CU', {
    style: 'currency',
    currency: 'CUP',
    maximumFractionDigits: 0,
  }).format(val);
}

onMounted(async () => {
  if (!negocioId) return;
  try {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('negocio_id', negocioId)
      .order('created_at', { ascending: false });
    if (data) {
      products.value = Array.isArray(data) ? data : [];
      changesStore.clear();
    }
  } catch (e) {
    console.error('Error cargando productos:', e);
  }
});
</script>

<style lang="scss">
.admin-page {
  background: #F4F1EA;
  min-height: 100vh;
}

/* Section headers */
.section-eyebrow {
  font-family: 'Inter', sans-serif;
  font-size: 0.7rem;
  font-weight: 500;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #9CA3AF;
  margin-bottom: 2px;
}

.section-title {
  font-family: 'Oswald', sans-serif;
  font-size: 1.5rem;
  letter-spacing: 3px;
  color: #0F1B2D;
  line-height: 1.1;
}

.section-rule {
  height: 1px;
  background: linear-gradient(90deg, #C8963E 60px, #D4C9B5 60px);
  margin: 12px 0 24px 0;
  width: 100%;
}

/* Stat gauges */
.stat-gauge {
  border-radius: 4px;
  background: #FFFFFF;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.07);
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .gauge-icon {
    width: 44px;
    height: 44px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .gauge-label {
    font-family: 'Inter', sans-serif;
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: #6B7280;
  }

  .gauge-value {
    font-family: 'JetBrains Mono', monospace;
    font-size: 1.5rem;
    font-weight: 700;
    line-height: 1.2;
  }
}

/* Products card */
.products-card {
  border-radius: 4px;
  background: #FFFFFF;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.07);
  overflow: hidden;
}

/* Table */
.products-table {
  thead tr {
    th {
      // header background/color set via header-cell-style prop
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
  }

  tbody tr {
    background: #FFFFFF;

    &:nth-child(even) {
      background: #FAF8F4;
    }

    &:hover {
      background: #F0EDE4;
    }
  }

  .q-table__middle {
    border-radius: 0;
  }

  td {
    font-family: 'Inter', sans-serif;
    font-size: 0.85rem;
  }
}
</style>
