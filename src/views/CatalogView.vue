<template>
  <div>
    <!-- Error de carga de datos -->
    <div v-if="error" class="error-screen">
      <div class="error-icon">⚠️</div>
      <p class="error-msg">{{ error }}</p>
      <button class="error-btn" @click="cargarDatos">Reintentar</button>
    </div>

    <!-- Tema cargado dinámicamente -->
    <component
      v-else-if="componenteTema"
      :is="componenteTema"
      :config="config"
      :cats="cats"
      :prods="prods"
      :loading="loading"
      :active-cat="activeCat"
      :search-q="searchQ"
      :prods-filtrados="prodsFiltrados"
      :items-carrito="itemsCarrito"
      :total-carrito="totalCarrito"
      :count-carrito="countCarrito"
      :hay-ofertas="hayOfertas"
      :hay-stock-bajo="hayStockBajo"
      :drawer-open="drawerOpen"
      :fmt="fmt"
      @update:activeCat="activeCat = $event"
      @update:searchQ="searchQ = $event"
      @update:drawerOpen="drawerOpen = $event"
      @toggle-carrito="toggleCarrito"
      @cambiar-qty="cambiarQty"
      @eliminar-item="eliminarItem"
      @enviar-wa="enviarWA"
    />

    <!-- Tema no encontrado -->
    <div v-else-if="!loading" class="error-screen">
      <div class="error-icon">🎨</div>
      <p class="error-msg">Tema "{{ temaActual }}" no registrado en main.js</p>
      <router-link to="/" class="error-btn">Volver al inicio</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useCatalog } from '../composables/useCatalog.js'
import { TEMAS_DISPONIBLES } from '../main.js'

const props = defineProps({
  catalogo: { type: Object, required: true },
})

// Toda la lógica viene del composable
const {
  config, cats, prods, loading, error,
  activeCat, searchQ, drawerOpen,
  prodsFiltrados, itemsCarrito, totalCarrito, countCarrito,
  hayOfertas, hayStockBajo,
  cargarDatos, toggleCarrito, cambiarQty, eliminarItem,
  fmt, enviarWA,
} = useCatalog(props.catalogo)

// ── Cargar el componente de tema dinámicamente ────────────────────────────
const componenteTema = ref(null)

const temaActual = computed(() => {
  // Lee el tema desde config (viene de la hoja CONFIG del Sheets)
  return config.value?.theme || 'ios-light'
})

watch(temaActual, async (nombre) => {
  const loader = TEMAS_DISPONIBLES[nombre]
  if (!loader) {
    componenteTema.value = null
    return
  }
  const mod = await loader()
  componenteTema.value = mod.default
}, { immediate: false })

// Cuando termina de cargar, aplicar el tema
watch(loading, (val) => {
  if (!val && config.value?.theme) {
    const loader = TEMAS_DISPONIBLES[config.value.theme]
    if (loader) {
      loader().then(mod => { componenteTema.value = mod.default })
    }
  }
})
</script>

<style scoped>
.error-screen {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  background: #F7F4EF;
  font-family: 'DM Sans', sans-serif;
  padding: 40px;
  text-align: center;
}
.error-icon { font-size: 56px; }
.error-msg { font-size: 16px; color: #3A3832; max-width: 320px; line-height: 1.5; }
.error-btn {
  margin-top: 8px;
  padding: 10px 24px;
  background: #007AFF;
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  font-family: inherit;
}
</style>
