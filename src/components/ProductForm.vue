<template>
  <q-form @submit.prevent="onSubmit">
    <div class="row q-col-gutter-md">
      <!-- Carga de imagen + previsualización -->
      <div class="col-12">
        <q-file
          v-model="fileProxy"
          accept="image/*"
          dense
          outlined
          clearable
          label="Seleccionar imagen"
          @update:model-value="onFileSelected"
        >
          <template #prepend>
            <q-icon name="image" />
          </template>
        </q-file>
      </div>
      <div class="col-12" v-if="previewUrl || localProduct.image">
        <q-img :src="previewUrl || localProduct.image" :ratio="16 / 9" style="max-height: 200px" />
      </div>
      <div class="col-12">
        <q-input v-model="localProduct.id" label="ID" dense outlined :disable="mode === 'edit'" />
      </div>
      <div class="col-12">
        <q-input
          v-model="localProduct.name"
          label="Nombre"
          dense
          outlined
          :rules="[(val) => !!val?.trim() || 'El nombre es obligatorio']"
        />
      </div>
      <div class="col-6">
        <q-input
          v-model.number="localProduct.price"
          type="number"
          label="Precio"
          dense
          outlined
          :rules="[(val) => val > 0 || 'El precio debe ser mayor a 0']"
        />
      </div>
      <div class="col-6">
        <q-select
          v-model="localProduct.currency"
          :options="currencyOptions"
          label="Moneda"
          dense
          outlined
          emit-value
          map-options
          :rules="[(val) => !!val || 'La moneda es obligatoria']"
        />
      </div>
      <div class="col-6">
        <q-select
          v-model="localProduct.category"
          :options="categoryOptions"
          label="Categoría"
          clearable
          dense
          outlined
          emit-value
          map-options
          use-input
          input-debounce="0"
          new-value-mode="add-unique"
          :rules="[(val) => !!val || 'La categoría es obligatoria']"
        />
      </div>
      <div class="col-6">
        <q-select
          v-model="localProduct.subcategory"
          :options="subcategoryOptions"
          label="Subcategoria"
          clearable
          required
          dense
          outlined
          emit-value
          map-options
        />
      </div>
      <div class="col-6">
        <q-select
          v-model="localProduct.estado"
          :options="estadoOptions"
          label="Estado"
          required
          dense
          outlined
          emit-value
          map-options
        />
      </div>
      <div class="col-12">
        <q-input v-model="localProduct.image" label="URL de imagen" required dense outlined />
      </div>
      <div class="col-6">
        <q-toggle v-model="localProduct.new" label="Nuevo" />
      </div>
      <div class="col-6">
        <q-toggle v-model="localProduct.oferta" label="En oferta" />
      </div>
      <div class="col-6" v-if="localProduct.oferta || localProduct.subcategory === 'Mayorista'">
        <q-input
          v-model.number="localProduct.descuento"
          type="number"
          label="Precio de la Oferta o Mayorista"
          dense
          outlined
        />
      </div>
      <div class="col-12">
        <q-input
          v-model="localProduct.descripcion"
          type="textarea"
          label="Descripción"
          dense
          outlined
          autogrow
        />
      </div>
    </div>
    <div class="row justify-end q-gutter-sm q-mt-md">
      <q-btn flat color="grey-7" no-caps label="Cancelar" @click="onCancel" style="font-family: 'Inter', sans-serif;" />
      <q-btn
        color="primary"
        no-caps
        :label="mode === 'add' ? 'Crear' : 'Guardar'"
        type="submit"
        :disable="!isFormValid"
        style="font-family: 'Inter', sans-serif; letter-spacing: 0.5px;"
      />
    </div>
  </q-form>
</template>

<script setup lang="ts">
import { reactive, watch, ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { supabase } from 'boot/supabase';
import { useQuasar } from 'quasar';
import type { Product } from 'src/stores/types';
import { defaultCategories } from 'src/config/categories';

const MAX_FILE_SIZE = 420 * 1024; // 400KB en bytes

const props = defineProps<{
  modelValue: Product;
  mode: 'add' | 'edit';
  negocioId: string | null;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: Product): void;
  (e: 'save', value: Product): void;
  (e: 'cancel'): void;
}>();

const localProduct = reactive<Product>(
  { ...props.modelValue,
  });
const $q = useQuasar();
const DEPARTAMENT = 'ferreteria';
watch(
  () => props.modelValue,
  (v) => {
    Object.assign(localProduct, v);
  },
);

watch(
  localProduct,
  (v) => {
    emit('update:modelValue', { ...v });
  },
  { deep: true },
);

const estadoOptions = [
  { label: 'Disponible', value: 'Disponible' },
  { label: 'Agotado', value: 'Agotado' },
];

const currencyOptions = [
  { label: 'CUP', value: 'CUP' },
  { label: 'USD', value: 'USD' },
];
const subcategoryOptions = ref([
  { label: 'Mayorista', value: 'Mayorista' },
  { label: 'Zelle', value: 'Zelle' },
]);

const categoryOptions = ref<{ label: string; value: string }[]>(
  defaultCategories
    .filter((c) => c.key !== 'all')
    .map((c) => ({ label: c.label, value: c.key })),
);

const fileProxy = ref<File | File[] | null>(null);
const previewUrl = ref<string>('');

const isFormValid = computed(() => {
  const hasImage = !!(fileProxy.value || localProduct.image);
  const hasName = !!localProduct.name?.trim();
  const hasPrice = localProduct.price > 0;
  const hasCategory = !!localProduct.category?.trim();

  return hasImage && hasName && hasPrice && hasCategory;
});

function slugifyBase(name: string) {
  const base = name.replace(/\.[^/.]+$/, '');
  return base
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function onFileSelected(val: File | File[] | null) {
  const f = Array.isArray(val) ? val[0] : val;
  if (!f) {
    if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
    previewUrl.value = '';
    return;
  }
  if (f.size > MAX_FILE_SIZE) {
    const sizeKB = Math.round(f.size / 1024);
    $q.notify({
      message: `La imagen que intenta subir tiene (${sizeKB}KB) no puede superar 400KB`,
      color: 'negative',
      icon: 'error',
      position: 'top',
    });
    if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
    previewUrl.value = '';
    fileProxy.value = null;
    return;
  }
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
  previewUrl.value = URL.createObjectURL(f);
  const filename = f.name;
  const slug = slugifyBase(filename);
  if (slug && props.mode === 'add') {
    localProduct.id = crypto.randomUUID();
  }
  try {
    const filePath = `ferreteriaVip/${Date.now()}-${filename}`;
    const { data, error } = await supabase.storage.from('products').upload(filePath, f);
    console.log('Imagen subida:', data);
    if (error) {
      $q.notify({
        message: `La imagen no se pudo subir: ${error.message}`,
        color: 'negative',
        icon: 'error',
        position: 'top',
      });
    }

    // Obtener URL pública
    const { data: urlData } = supabase.storage.from('products').getPublicUrl(filePath);

    localProduct.image = urlData.publicUrl;

    $q.notify({
      message: 'Imagen subida correctamente',
      color: 'positive',
      icon: 'check_circle',
      position: 'top',
      timeout: 2000,
    });
  } catch (error) {
    console.error('Error subiendo imagen:', error);
    // Fallback a ruta local si falla
    localProduct.image = `/images/productos/${filename}`;
  }
}

onMounted(async () => {
  try {
    const { data } = await supabase
      .from('products')
      .select('category')
      .eq('negocio_id', props.negocioId);

    if (data) {
      const current = new Set(categoryOptions.value.map((o) => o.value));
      const dbCats = [...new Set(data.map((p) => p.category).filter(Boolean))];
      for (const cat of dbCats) {
        if (!current.has(cat)) {
          categoryOptions.value.push({ label: cat, value: cat });
        }
      }
    }
  } catch (e: unknown) {
    console.log('Error fetching extra categories', e);
  }
});

onBeforeUnmount(() => {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
});

function onCancel() {
  emit('cancel');
}

async function onSubmit() {
  try {
    const productData = {
      id: localProduct.id,
      negocio_id: props.negocioId,
      departament: DEPARTAMENT,
      name: localProduct.name,
      price: localProduct.price,
      currency: localProduct.currency || 'CUP',
      category: localProduct.category,
      subcategory: localProduct.subcategory || null,
      image: localProduct.image,
      descuento: localProduct.descuento || 0,
      new: localProduct.new || false,
      oferta: localProduct.oferta || false,
      estado: localProduct.estado || 'Disponible',
      descripcion: localProduct.descripcion || null,
    };

    if (props.mode === 'add') {
      const { error } = await supabase.from('products').insert(productData);

      if (error) throw error;

      $q.notify({
        message: 'Producto creado correctamente',
        color: 'positive',
        icon: 'check_circle',
      });
    } else {
      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', localProduct.id)
        .eq('negocio_id', props.negocioId);

      if (error) throw error;

      $q.notify({
        message: 'Producto actualizado correctamente',
        color: 'positive',
        icon: 'check_circle',
      });
    }

    emit('save', { ...localProduct });
  } catch (e: unknown) {
    console.error('Error guardando producto:', e);
    $q.notify({
      message: 'Error al guardar producto',
      color: 'negative',
      icon: 'error',
    });
  }
}
</script>

<style scoped></style>
