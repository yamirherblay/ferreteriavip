<template>
  <div class="view-toggle row items-center no-wrap q-gutter-xs">
    <q-btn
      v-for="opt in options"
      :key="opt.value"
      :icon="opt.icon"
      round
      flat
      :color="viewMode === opt.value ? 'secondary' : 'grey-6'"
      :text-color="viewMode === opt.value ? 'white' : 'grey-8'"
      :style="viewMode === opt.value ? 'background: var(--view-btn-bg, #C8963E);' : ''"
      :aria-label="opt.tooltip"
      @click="$emit('update:viewMode', opt.value)"
    >
      <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 4]">
        {{ opt.tooltip }}
      </q-tooltip>
    </q-btn>
  </div>
</template>

<script setup lang="ts">
import type { ViewMode } from './types';

export type { ViewMode };

defineProps<{
  viewMode: ViewMode;
}>();

defineEmits<{
  (e: 'update:viewMode', value: ViewMode): void;
}>();

const options: { value: ViewMode; icon: string; tooltip: string }[] = [
  { value: 'grid', icon: 'grid_view', tooltip: 'Cuadrícula' },
  { value: 'list', icon: 'view_list', tooltip: 'Lista' },
];
</script>

<style scoped>
.view-toggle {
  flex-wrap: nowrap;
}
</style>