import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'

// ─── REGISTRO DE TEMAS DISPONIBLES ───────────────────────────────────────────
// Para agregar un tema nuevo:
// 1. Crea el archivo en src/themes/NombreTema.vue
// 2. Agrégalo aquí con el mismo nombre que usarás en Sheets
// 3. Haz git push — Netlify despliega automáticamente
// 4. En Google Sheets > CONFIG > celda "theme", escribe ese nombre
// ─────────────────────────────────────────────────────────────────────────────
export const TEMAS_DISPONIBLES = {
  'ios-light':  () => import('./themes/IosLight.vue'),
  'dark-bold':  () => import('./themes/DarkBold.vue'),
  'minimal':    () => import('./themes/Minimal.vue'),
  // 'mi-tema':  () => import('./themes/MiTema.vue'),  ← así se agrega uno nuevo
}

// ─── CATÁLOGOS (rutas) ───────────────────────────────────────────────────────
// Para agregar un catálogo nuevo (nuevo tema de PRODUCTOS, no de diseño):
// 1. Crea la hoja en Google Sheets con el nombre del catálogo
// 2. Agrégalo al array de abajo con su id y apiUrl
// 3. Haz git push
// ─────────────────────────────────────────────────────────────────────────────
export const CATALOGOS = [
  {
    id: 'n5-concept',
    label: 'N5 Concept',
    icon: '🔧',
    apiUrl: 'https://script.google.com/macros/s/AKfycbyzuJJVS72SOMWfqN2jN2DQOKYJYpYm22IOknQYS67hBlrM-dUtJzorYmSjI5QO0SmR/exec',
  },
  {
    id: 'n5-store',
    label: 'N5 Store',
    icon: '🛍️',
    apiUrl: 'https://script.google.com/macros/s/AKfycbyzuJJVS72SOMWfqN2jN2DQOKYJYpYm22IOknQYS67hBlrM-dUtJzorYmSjI5QO0SmR/exec',
  },
  {
    id: 'n5-supply',
    label: 'N5 Supply',
    icon: '📦',
    apiUrl: 'https://script.google.com/macros/s/AKfycbyzuJJVS72SOMWfqN2jN2DQOKYJYpYm22IOknQYS67hBlrM-dUtJzorYmSjI5QO0SmR/exec',
  },
  {
    id: 'n5-moto',
    label: 'N5 Moto',
    icon: '🏍️',
    apiUrl: 'https://script.google.com/macros/s/AKfycbyzuJJVS72SOMWfqN2jN2DQOKYJYpYm22IOknQYS67hBlrM-dUtJzorYmSjI5QO0SmR/exec',
  },
  {
    id: 'n5-tech',
    label: 'N5 Tech',
    icon: '💻',
    apiUrl: 'https://script.google.com/macros/s/AKfycbyzuJJVS72SOMWfqN2jN2DQOKYJYpYm22IOknQYS67hBlrM-dUtJzorYmSjI5QO0SmR/exec',
  },
  {
    id: 'n5-raiz',
    label: 'N5 Raíz',
    icon: '🌿',
    apiUrl: 'https://script.google.com/macros/s/AKfycbyzuJJVS72SOMWfqN2jN2DQOKYJYpYm22IOknQYS67hBlrM-dUtJzorYmSjI5QO0SmR/exec',
  },
  {
    id: 'n5-select',
    label: 'N5 Select',
    icon: '✨',
    apiUrl: 'https://script.google.com/macros/s/AKfycbyzuJJVS72SOMWfqN2jN2DQOKYJYpYm22IOknQYS67hBlrM-dUtJzorYmSjI5QO0SmR/exec',
  },
]

// ─── ROUTER ──────────────────────────────────────────────────────────────────
const routes = [
  {
    path: '/',
    component: () => import('./views/Home.vue'),
  },
  ...CATALOGOS.map(cat => ({
    path: '/' + cat.id,
    component: () => import('./views/CatalogView.vue'),
    props: { catalogo: cat },
  })),
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

createApp(App).use(router).mount('#app')
