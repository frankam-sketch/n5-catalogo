<template>
  <div class="home">
    <header class="home-header">
      <h1>Catálogos</h1>
      <p>Selecciona un catálogo para ver los productos</p>
    </header>

    <p v-if="loading" class="home-status">Cargando catálogos…</p>

    <div v-else-if="error" class="home-error">
      <p>{{ error }}</p>
      <button type="button" @click="cargarCatalogos">Reintentar</button>
    </div>

    <main v-else-if="catalogos.length" class="home-grid">
      <router-link
        v-for="cat in catalogos"
        :key="cat.slug"
        :to="cat.publicPath || '/' + cat.slug"
        class="home-card"
      >
        <span class="home-card-icon">📦</span>
        <span class="home-card-label">
          {{ cat.siteName || cat.slug }}
        </span>
      </router-link>
    </main>

    <p v-else class="home-status">
      No hay catálogos publicados.
    </p>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { API_URL } from '../main.js'

const catalogos = ref([])
const loading = ref(true)
const error = ref('')

async function cargarCatalogos() {
  loading.value = true
  error.value = ''

  try {
    const response = await fetch(API_URL)

    if (!response.ok) {
      throw new Error(`Error HTTP ${response.status}`)
    }

    const data = await response.json()

    if (data.error) {
      throw new Error(data.error)
    }

    catalogos.value = Array.isArray(data.catalogos)
      ? data.catalogos.filter(cat => cat && cat.slug)
      : []
  } catch (err) {
    console.error('[Home]', err)
    error.value = 'No se pudieron cargar los catálogos.'
  } finally {
    loading.value = false
  }
}

onMounted(cargarCatalogos)
</script>

<style scoped>
.home {
  min-height: 100vh;
  background: #f7f4ef;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  font-family: 'DM Sans', sans-serif;
}

.home-header {
  text-align: center;
  margin-bottom: 40px;
}

.home-header h1 {
  font-size: 32px;
  font-weight: 700;
  color: #0f0e0c;
  margin: 0 0 8px;
}

.home-header p,
.home-status {
  font-size: 16px;
  color: rgba(58, 56, 50, 0.65);
  text-align: center;
}

.home-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
  max-width: 760px;
}

.home-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 32px 40px;
  background: #fff;
  border-radius: 20px;
  border: 1px solid rgba(58, 56, 50, 0.08);
  box-shadow: 0 2px 16px rgba(15, 14, 12, 0.07);
  text-decoration: none;
  transition: transform 0.2s, box-shadow 0.2s;
  min-width: 140px;
}

.home-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(15, 14, 12, 0.12);
}

.home-card-icon {
  font-size: 48px;
}

.home-card-label {
  font-size: 15px;
  font-weight: 600;
  color: #0f0e0c;
  text-align: center;
}

.home-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  color: #3a3832;
  text-align: center;
}

.home-error button {
  border: 0;
  border-radius: 12px;
  padding: 10px 22px;
  background: #007aff;
  color: #fff;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}
</style>
