import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'

// API única para todos los catálogos.
// Para crear un catálogo nuevo ya no se modifica este archivo.
export const API_URL =
  'https://script.google.com/macros/s/AKfycbyzuJJVS72SOMWfqN2jN2DQOKYJYpYm22IOknQYS67hBlrM-dUtJzorYmSjI5QO0SmR/exec'

// Temas visuales disponibles.
// Solo se edita esta lista cuando se programa un DISEÑO nuevo,
// no cuando se crea un catálogo nuevo en Google Sheets.
export const TEMAS_DISPONIBLES = {
  'ios-light': () => import('./themes/IosLight.vue'),
  'dark-bold': () => import('./themes/DarkBold.vue'),
  'minimal': () => import('./themes/Minimal.vue'),

  // Nuevos temas profesionales
  'n5-studio': () => import('./themes/N5Studio.vue'),
  'editorial': () => import('./themes/Editorial.vue'),
  'industrial': () => import('./themes/Industrial.vue'),
  'mercado-calido': () => import('./themes/MercadoCalido.vue'),
  'tech-grid': () => import('./themes/TechGrid.vue'),
}

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('./views/Home.vue'),
  },
  {
    // Ruta dinámica: cualquier slug válido se consulta en Apps Script.
    // Ejemplos: /n5-supply, /n5-tech, /ferreteria-lopez
    path: '/:slug',
    name: 'catalogo',
    component: () => import('./views/CatalogView.vue'),
    props: route => ({
      catalogo: {
        id: String(route.params.slug || '').trim().toLowerCase(),
        apiUrl: API_URL,
      },
    }),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

createApp(App).use(router).mount('#app')
