<template>
  <q-page padding class="admin-page orders-page">
    <div class="section-eyebrow">Panel de control</div>
    <div class="section-title">PEDIDOS</div>
    <div class="section-rule"></div>

    <div class="row q-col-gutter-sm q-mb-md">
      <div v-for="kpi in kpiFilters" :key="kpi.key" class="col-4">
        <q-btn
          flat
          no-caps
          align="left"
          class="kpi-filter"
          :class="{ 'gauge-active': statusFilter === kpi.key }"
          :style="{ '--kpi-accent': kpi.accent }"
          :aria-pressed="statusFilter === kpi.key"
          :aria-label="`${kpi.label}: ${kpi.value} pedidos. Filtrar por ${kpi.hint}`"
          @click="statusFilter = kpi.key"
        >
          <div class="kpi-filter__icon">
            <q-icon :name="kpi.icon" size="18px" color="white" />
          </div>
          <div class="kpi-filter__label">{{ kpi.label }}</div>
          <div class="kpi-filter__value">{{ kpi.value }}</div>
        </q-btn>
      </div>
    </div>

    <q-card class="orders-filters q-mb-md">
      <q-card-section class="q-pa-sm">
        <div class="row items-center q-col-gutter-sm">
          <div class="col-12 col-sm">
            <q-input
              v-model="filter"
              dense
              outlined
              clearable
              placeholder="Buscar por token, id o cliente..."
              aria-label="Buscar pedidos"
            >
              <template #prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>

          <div class="col-12 col-sm-auto">
            <q-btn
              v-if="newOrdersCount > 0"
              unelevated
              color="primary"
              icon="fiber_new"
              no-caps
              class="full-width"
              :label="`Ver pedidos nuevos (${newOrdersCount})`"
              @click="showNewOrders"
            />
            <div v-else class="orders-freshness text-center">Actualizado {{ freshnessLabel }}</div>
          </div>
        </div>
      </q-card-section>

      <q-card-section class="q-pa-sm q-pt-none">
        <div class="row items-center q-col-gutter-sm">
          <div class="col">
            <q-select
              v-model="statusFilter"
              :options="statusSelectOptions"
              label="Estado"
              dense
              outlined
              options-dense
              emit-value
              map-options
            />
          </div>
          <div class="col">
            <q-select
              v-model="deliveryFilter"
              :options="deliveryOptions"
              label="Entrega"
              dense
              outlined
              options-dense
              emit-value
              map-options
            />
          </div>
          <div v-if="hasActiveFilters" class="col-auto">
            <q-btn
              flat
              dense
              round
              icon="close"
              color="primary"
              aria-label="Limpiar filtros"
              @click="clearFilters"
            >
              <q-tooltip>Limpiar filtros</q-tooltip>
            </q-btn>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-card class="products-card">
      <q-table
        :rows="filteredOrders"
        :columns="columns"
        :visible-columns="visibleColumns"
        :row-class="() => 'orders-row'"
        :header-cell-style="headerCellStyle"
        v-model:pagination="pagination"
        :loading="ordersStore.loading"
        :no-data-label="noDataLabel"
        flat
        separator="horizontal"
        loading-label="Cargando pedidos..."
        row-key="id"
        class="products-table orders-table"
        @row-click="onRowClick"
      >
        <template #body-cell-token="props">
          <q-td :props="props">
            <q-btn
              flat
              dense
              no-caps
              :ripple="false"
              class="order-token-btn"
              :aria-label="`Ver pedido ${props.row.token}`"
              @click.stop="openDetail(props.row)"
            >
              <span class="order-token">#{{ props.row.token.slice(0, 6) }}</span>
            </q-btn>
            <div class="orders-table__caption lt-md">
              {{ formatRelativeTime(props.row.created_at) }}
            </div>
          </q-td>
        </template>

        <template #body-cell-status="props">
          <q-td :props="props">
            <span class="status-pill" :class="orderStatusClass(props.row.status)">
              {{ props.row.status }}
            </span>
          </q-td>
        </template>

        <template #body-cell-client_name="props">
          <q-td :props="props">
            <span
              class="cell-ellipsis orders-client"
              :title="props.row.client_name || 'Cliente sin identificar'"
            >
              {{ props.row.client_name || 'Cliente sin identificar' }}
            </span>
          </q-td>
        </template>

        <template #body-cell-type_delivery="props">
          <q-td :props="props">
            <div class="row items-center no-wrap q-gutter-xs">
              <q-icon
                :name="props.row.type_delivery === 'domicilio' ? 'local_shipping' : 'storefront'"
                size="16px"
                class="text-grey-9"
              />
              <span>{{ deliveryLabel(props.row.type_delivery) }}</span>
            </div>
          </q-td>
        </template>

        <template #body-cell-created_at="props">
          <q-td :props="props">
            <span class="text-caption">{{ formatDateTime(props.row.created_at) }}</span>
          </q-td>
        </template>

        <template #body-cell-total_cup="props">
          <q-td :props="props" class="orders-total">
            <div v-if="props.row.total_cup != null">{{ formatPrice(props.row.total_cup, 'CUP') }}</div>
            <div v-if="props.row.total_usd" class="orders-total__usd">
              {{ formatPrice(props.row.total_usd, 'USD') }}
            </div>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <q-dialog
      v-model="detailOpen"
      :position="$q.screen.lt.md ? 'bottom' : 'standard'"
      :full-width="$q.screen.lt.md"
      :maximized="$q.screen.lt.md"
    >
      <q-card :style="$q.screen.lt.md ? '' : 'max-width: 560px; width: 100%'">
        <q-card-section class="row items-center q-py-sm detail-header">
          <div class="text-subtitle1 text-weight-bold detail-title">
            Pedido #{{ detailOrder?.token.slice(0, 6) ?? '' }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section v-if="detailOrder" class="q-pt-md">
          <div class="q-mb-sm">
            <span class="text-caption text-grey-7">Token (para match exacto)</span>
            <div class="row items-center no-wrap q-gutter-xs">
              <div class="order-token-mono">{{ detailOrder.token }}</div>
              <q-btn
                flat
                dense
                round
                size="sm"
                icon="content_copy"
                color="primary"
                @click="copyToken(detailOrder.token)"
              >
                <q-tooltip>Copiar token</q-tooltip>
              </q-btn>
            </div>
          </div>
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-6">
              <span class="text-caption text-grey-7">Fecha</span>
              <div class="text-body2">{{ formatDateTime(detailOrder.created_at) }}</div>
            </div>
            <div class="col-6">
              <span class="text-caption text-grey-7">Estado</span>
              <div>
                <span class="status-pill" :class="orderStatusClass(detailOrder.status)">{{
                  detailOrder.status
                }}</span>
              </div>
            </div>
            <div class="col-6">
              <span class="text-caption text-grey-7">Tipo de envío</span>
              <div class="text-body2">{{ deliveryLabel(detailOrder.type_delivery) }}</div>
            </div>
            <div class="col-6">
              <span class="text-caption text-grey-7">Cliente</span>
              <div class="text-body2">{{ detailOrder.client_name || '—' }}</div>
            </div>
            <div v-if="detailOrder.type_delivery === 'domicilio'" class="col-12">
              <span class="text-caption text-grey-7">Dirección</span>
              <div class="text-body2">{{ detailOrder.address_client || '—' }}</div>
            </div>
          </div>

          <div class="text-caption text-grey-7 q-mb-xs">Productos</div>
          <q-list bordered separator class="rounded-borders q-mb-md">
            <q-item v-for="item in detailItems" :key="item.id">
              <q-item-section>
                <q-item-label class="text-weight-medium">{{
                  item.products?.name || item.id_product
                }}</q-item-label>
                <q-item-label caption class="text-grey-7">
                  {{ item.qty }} × {{ formatPrice(item.price_at_order, item.products?.currency) }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <div class="text-weight-bold">
                  {{ formatPrice(subtotal(item), item.products?.currency) }}
                </div>
              </q-item-section>
            </q-item>
          </q-list>

          <div class="row items-center justify-end q-gutter-sm q-mb-md">
            <div v-if="detailOrder.total_usd" class="text-body1 text-weight-bold">
              Total USD: {{ formatPrice(detailOrder.total_usd, 'USD') }}
            </div>
            <div v-if="detailOrder.total_cup != null" class="text-subtitle1 text-weight-bold">
              Total CUP: {{ formatPrice(detailOrder.total_cup, 'CUP') }}
            </div>
          </div>

          <q-separator class="q-mb-md" />

          <div class="row items-center q-col-gutter-sm">
            <div class="col-12 col-sm-7">
              <q-select
                v-model="statusDraft"
                :options="statusOptions"
                outlined
                dense
                label="Cambiar estado"
                :loading="savingStatus"
              />
            </div>
            <div class="col-12 col-sm-5">
              <q-btn
                color="primary"
                label="Guardar estado"
                no-caps
                class="full-width"
                :disable="
                  !statusDraft ||
                  statusDraft === detailOrder.status ||
                  savingStatus ||
                  detailOrder.status === 'Entregado' ||
                  detailOrder.status === 'Cancelado'
                "
                @click="saveStatus"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useMeta, useQuasar, copyToClipboard } from 'quasar';
import type { QTableColumn } from 'quasar';
import { useOrdersStore } from 'src/stores/orders';
import type { Order, OrderProductRow, OrderStatus } from 'src/stores/types';
import {
  formatDateTime,
  formatPrice as formatPriceUtil,
  formatRelativeTime,
} from 'src/utils/format';
import { orderStatusClass } from 'src/utils/orderStatus';
import { branding } from 'src/config/branding';

useMeta({
  title: `Pedidos | Admin ${branding.name}`,
  meta: {
    robots: { name: 'robots', content: 'noindex, nofollow' },
  },
});

const ordersStore = useOrdersStore();
const $q = useQuasar();
const route = useRoute();
const router = useRouter();
const filter = ref('');

const detailOpen = ref(false);
const detailOrder = ref<Order | null>(null);
const statusDraft = ref<OrderStatus | null>(null);
const savingStatus = ref(false);

const statusOptions: OrderStatus[] = ['Pendiente', 'Confirmado', 'Cancelado', 'Rechazado'];

type StatusFilter = 'all' | OrderStatus;
type DeliveryFilter = 'all' | NonNullable<Order['type_delivery']>;

const statusFilter = ref<StatusFilter>('all');
const deliveryFilter = ref<DeliveryFilter>('all');
const pagination = ref({ rowsPerPage: 10, page: 1 });

const STATUS_ORDER: StatusFilter[] = [
  'all',
  'Pendiente',
  'Confirmado',
  'Entregado',
  'Rechazado',
  'Cancelado',
];

const STATUS_PRIORITY: Record<OrderStatus, number> = {
  Pendiente: 0,
  Confirmado: 1,
  Entregado: 2,
  Rechazado: 3,
  Cancelado: 4,
};

const deliveryOptions: Array<{ label: string; value: DeliveryFilter }> = [
  { label: 'Todas', value: 'all' },
  { label: 'Retiro en tienda', value: 'retiro' },
  { label: 'A domicilio', value: 'domicilio' },
];

const kpiFilters = computed<
  Array<{
    key: StatusFilter;
    label: string;
    hint: string;
    value: number;
    icon: string;
    accent: string;
  }>
>(() => [
  {
    key: 'all',
    label: 'TOTAL',
    hint: 'todos',
    value: ordersStore.stats.total,
    icon: 'receipt_long',
    accent: branding.colors.primary,
  },
  {
    key: 'Pendiente',
    label: 'PENDIENTES',
    hint: 'pendientes',
    value: ordersStore.stats.pendientes,
    icon: 'schedule',
    accent: '#8a5a1b',
  },
  {
    key: 'Entregado',
    label: 'ENTREGADOS',
    hint: 'entregados',
    value: ordersStore.stats.entregados,
    icon: 'check_circle',
    accent: '#127a5c',
  },
]);

const statusSelectOptions = computed(() => {
  const counts: Record<StatusFilter, number> = {
    all: ordersStore.orders.length,
    Pendiente: 0,
    Confirmado: 0,
    Entregado: 0,
    Rechazado: 0,
    Cancelado: 0,
  };
  for (const order of ordersStore.orders) {
    if (order.status in counts) counts[order.status] += 1;
  }
  return STATUS_ORDER.map((value) => ({
    label: value === 'all' ? 'Todos' : value,
    value,
    caption: String(counts[value]),
  }));
});

const hasActiveFilters = computed(
  () =>
    statusFilter.value !== 'all' ||
    deliveryFilter.value !== 'all' ||
    filter.value.trim().length > 0,
);

function clearFilters() {
  statusFilter.value = 'all';
  deliveryFilter.value = 'all';
  filter.value = '';
}

const filteredOrders = computed(() => {
  const f = filter.value.trim().toLowerCase();

  return ordersStore.orders
    .filter((o) => {
      if (statusFilter.value !== 'all' && o.status !== statusFilter.value) return false;
      if (deliveryFilter.value !== 'all' && o.type_delivery !== deliveryFilter.value) return false;
      if (!f) return true;
      return (
        o.token.toLowerCase().includes(f) ||
        String(o.id).includes(f) ||
        (o.client_name || '').toLowerCase().includes(f)
      );
    })
    .sort((a, b) => {
      const byStatus = STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status];
      if (byStatus !== 0) return byStatus;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
});

const isMobile = computed(() => $q.screen.lt.md);

const columns: QTableColumn[] = [
  { name: 'token', label: 'Pedido', field: 'token', align: 'left', sortable: true },
  { name: 'status', label: 'Estado', field: 'status', align: 'left', sortable: true },
  { name: 'client_name', label: 'Cliente', field: 'client_name', align: 'left' },
  { name: 'type_delivery', label: 'Entrega', field: 'type_delivery', align: 'left' },
  { name: 'created_at', label: 'Fecha', field: 'created_at', align: 'left', sortable: true },
  { name: 'total_cup', label: 'Total', field: 'total_cup', align: 'right', sortable: true },
];

const visibleColumns = computed(() =>
  isMobile.value ? ['token', 'status', 'total_cup'] : columns.map((c) => c.name),
);

const headerCellStyle = () => ({
  background: branding.colors.primary,
  color: '#FFFFFF',
  fontFamily: 'Inter, sans-serif',
  fontWeight: 600,
  fontSize: '0.75rem',
  letterSpacing: '0.5px',
  textTransform: 'uppercase' as const,
});

const noDataLabel = computed(() =>
  ordersStore.orders.length ? 'Ningún pedido coincide con los filtros.' : 'No hay pedidos todavía.',
);

function onRowClick(_evt: Event, row: Order) {
  openDetail(row);
}

watch([statusFilter, deliveryFilter, filter], () => {
  pagination.value.page = 1;
});

const detailItems = computed<OrderProductRow[]>(() =>
  detailOrder.value ? ordersStore.productsByOrder(detailOrder.value.id) : [],
);

async function copyToken(token: string) {
  try {
    await copyToClipboard(token);
    $q.notify({
      message: 'Token copiado',
      color: 'positive',
      icon: 'check_circle',
      timeout: 1500,
    });
  } catch {
    $q.notify({
      message: 'No se pudo copiar el token',
      color: 'negative',
      icon: 'error',
    });
  }
}

function deliveryLabel(method: Order['type_delivery']): string {
  return method === 'domicilio' ? 'A domicilio' : 'Retiro en tienda';
}

function formatPrice(val?: number | null, currency?: string | null): string {
  if (val == null) return '-';
  return formatPriceUtil(val, currency);
}

function subtotal(item: OrderProductRow): number {
  return (item.price_at_order ?? 0) * item.qty;
}

function openDetail(order: Order) {
  detailOrder.value = order;
  statusDraft.value = order.status;
  detailOpen.value = true;
}

async function saveStatus() {
  if (!detailOrder.value || !statusDraft.value) return;
  savingStatus.value = true;
  try {
    const ok = await ordersStore.updateOrderStatus(detailOrder.value.id, statusDraft.value);
    if (ok) {
      if (detailOrder.value) detailOrder.value.status = statusDraft.value;
      $q.notify({
        message: 'Estado actualizado',
        color: 'positive',
        icon: 'check_circle',
        timeout: 2000,
      });
    } else {
      $q.notify({
        message: 'Error al actualizar el estado',
        color: 'negative',
        icon: 'error',
      });
    }
  } finally {
    savingStatus.value = false;
  }
}

const newOrdersCount = ref(0);
const nowTick = ref(Date.now());
let pollTimer: number | null = null;

const freshnessLabel = computed(() => {
  const loadedAt = ordersStore.loadedAt;
  if (!loadedAt) return '—';
  return formatRelativeTime(new Date(loadedAt).toISOString(), nowTick.value);
});

async function checkNewOrders() {
  newOrdersCount.value = await ordersStore.countNewOrders();
}

async function showNewOrders() {
  await ordersStore.fetchOrders();
  await ordersStore.refreshStats();
  newOrdersCount.value = 0;
}

function startPolling() {
  pollTimer = window.setInterval(() => {
    nowTick.value = Date.now();
    if (document.visibilityState === 'visible') void checkNewOrders();
  }, 60000);
}

function openOrderFromQuery() {
  const requested = route.query.order;
  if (typeof requested !== 'string' || !requested) return;
  const id = Number(requested);
  if (!Number.isFinite(id)) return;
  const found = ordersStore.orders.find((o) => o.id === id);
  if (found) openDetail(found);
}

onMounted(() => {
  void ordersStore.fetchOrders().then(() => {
    void ordersStore.refreshStats();
    void checkNewOrders();
    openOrderFromQuery();
  });
  startPolling();
});

onBeforeUnmount(() => {
  if (pollTimer !== null) {
    window.clearInterval(pollTimer);
    pollTimer = null;
  }
});

watch(detailOpen, (open) => {
  if (open || !route.query.order) return;
  void router.replace({ query: { ...route.query, order: undefined } });
});
</script>

<style lang="scss">
.admin-page {
  background: #f7f5f0;
  min-height: 100vh;
}

.section-eyebrow {
  font-family: 'Inter', sans-serif;
  font-size: 0.7rem;
  font-weight: 500;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #5b6472;
  margin-bottom: 2px;
}

.section-title {
  font-family: 'Oswald', sans-serif;
  font-size: 1.5rem;
  letter-spacing: 3px;
  color: #0a2747;
  line-height: 1.1;
}

.section-rule {
  height: 1px;
  background: linear-gradient(90deg, #c8963e 60px, #e0c491 60px);
  margin: 12px 0 24px 0;
  width: 100%;
}

.orders-filters {
  border-radius: 4px;
  background: #ffffff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.07);
}

.products-card {
  border-radius: 4px;
  background: #ffffff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.07);
  overflow: hidden;
}

.products-table {
  thead tr {
    th {
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
  }

  tbody tr {
    background: #ffffff;

    &:nth-child(even) {
      background: #faf8f4;
    }

    &:hover {
      background: #f0ede4;
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

.gauge-active {
  box-shadow: 0 0 0 2px #c8963e inset !important;
  background: #faf3e7 !important;
}

.cell-ellipsis {
  display: block;
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.orders-freshness {
  font-family: 'Inter', sans-serif;
  font-size: 0.72rem;
  color: #5b6472;
  padding: 8px 4px;
}

.kpi-filter {
  width: 100%;
  min-height: 44px;
  height: 100%;
  border-radius: 4px;
  background: #ffffff;
  border-left: 3px solid var(--kpi-accent);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.07);
  display: block;
  padding: 8px;
  text-align: left;

  &__icon {
    width: 32px;
    height: 32px;
    border-radius: 6px;
    background: var(--kpi-accent);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__label {
    font-family: 'Inter', sans-serif;
    font-size: 0.62rem;
    font-weight: 600;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    color: #5b6472;
    margin-top: 6px;
  }

  &__value {
    font-family: 'JetBrains Mono', monospace;
    font-size: 1.15rem;
    font-weight: 700;
    line-height: 1.2;
    color: var(--kpi-accent);
  }

  &:focus-visible {
    outline: 2px solid #0a2747;
    outline-offset: 2px;
  }
}

.orders-table {
  .orders-row {
    cursor: pointer;
  }

  tbody tr {
    height: 56px;
  }

  &__caption {
    font-family: 'Inter', sans-serif;
    font-size: 0.68rem;
    color: #5b6472;
    margin-top: 2px;
  }
}

.order-token-btn {
  min-height: 32px;
  padding: 0 4px;
  margin-left: -4px;
  border-radius: 4px;

  .order-token {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.8rem;
    font-weight: 600;
    color: #0a2747;
  }

  &:focus-visible {
    outline: 2px solid #0a2747;
    outline-offset: 1px;
  }
}

.orders-total {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.85rem;
  font-weight: 700;
  color: #0a2747;

  &__usd {
    font-size: 0.75rem;
    font-weight: 600;
    color: #127a5c;
  }
}

.detail-header {
  border-bottom: 2px solid #c8963e;
}

.detail-title {
  font-family: 'Inter', sans-serif;
  color: #0a2747;
}

.order-token {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.8rem;
  font-weight: 600;
  color: #0a2747;
}

.order-token-mono {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  color: #5b6472;
  word-break: break-all;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 999px;
  font-family: 'Inter', sans-serif;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.3px;
  white-space: nowrap;
}

.status-pill--pendiente {
  background: #fdf0dc;
  color: #7a4f10;
}

.status-pill--confirmado {
  background: #e4ecf7;
  color: #0a2747;
}

.status-pill--entregado {
  background: #e3f3ec;
  color: #0f7355;
}

.status-pill--rechazado {
  background: #fbe6e4;
  color: #a5281c;
}

.status-pill--cancelado {
  background: #eeeeee;
  color: #616161;
}

@media (max-width: 1023px) {
  .orders-filters {
    position: sticky;
    top: 0;
    z-index: 5;
  }

  .orders-table {
    .status-pill {
      font-size: 0.62rem;
      padding: 3px 7px;
    }

    tbody tr {
      height: 64px;
    }
  }

  .orders-client {
    max-width: 130px;
  }
}
</style>
