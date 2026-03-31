// ─────────────────────────────────────────────────────────────────────────────
// useCatalog.js — Lógica completa del catálogo
// ─────────────────────────────────────────────────────────────────────────────
// Este archivo maneja TODO lo que no es visual:
//   - Fetch de datos desde Apps Script
//   - Carrito de compras
//   - Búsqueda y filtros
//   - Envío por WhatsApp
//
// IMPORTANTE: No necesitas editar este archivo para agregar temas ni catálogos.
// ─────────────────────────────────────────────────────────────────────────────

import { ref, computed, reactive, watch } from 'vue'

export function useCatalog(catalogo) {
  // ── Estado de datos ──────────────────────────────────────────────────────
  const config     = ref(null)   // Datos de la hoja CONFIG
  const cats       = ref([])     // Categorías del catálogo
  const prods      = ref([])     // Productos
  const loading    = ref(true)   // Mostrando skeleton mientras carga
  const error      = ref(null)   // Mensaje de error si algo falla

  // ── Estado de UI ─────────────────────────────────────────────────────────
  const activeCat  = ref('todos')
  const searchQ    = ref('')
  const cart       = reactive({})
  const drawerOpen = ref(false)

  // ── Cargar datos desde Apps Script ───────────────────────────────────────
  async function cargarDatos() {
    loading.value = true
    error.value   = null
    try {
      const url = `${catalogo.apiUrl}?tema=${catalogo.id}`
      const res  = await fetch(url)
      if (!res.ok) throw new Error('Error HTTP ' + res.status)
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      config.value = data.config || {}
      cats.value   = data.cats   || []
      prods.value  = data.prods  || []
    } catch (e) {
      error.value = 'No se pudo cargar el catálogo. Intenta de nuevo.'
      console.error('[useCatalog]', e)
    } finally {
      loading.value = false
    }
  }

  // ── Productos filtrados (búsqueda + categoría) ────────────────────────────
  const prodsFiltrados = computed(() => {
    let lista = activeCat.value === 'todos'
      ? prods.value
      : prods.value.filter(p => p.cat === activeCat.value)
    if (searchQ.value.trim()) {
      const q = searchQ.value.toLowerCase()
      lista = lista.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.desc.toLowerCase().includes(q)
      )
    }
    return lista
  })

  // ── Carrito ───────────────────────────────────────────────────────────────
  function toggleCarrito(prod) {
    if (cart[prod.id]) delete cart[prod.id]
    else cart[prod.id] = { ...prod, qty: 1 }
  }

  function cambiarQty(id, delta) {
    if (!cart[id]) return
    cart[id].qty = Math.max(1, cart[id].qty + delta)
  }

  function eliminarItem(id) {
    delete cart[id]
    if (!Object.keys(cart).length) drawerOpen.value = false
  }

  function limpiarCarrito() {
    Object.keys(cart).forEach(k => delete cart[k])
    drawerOpen.value = false
  }

  const itemsCarrito = computed(() => Object.values(cart))
  const totalCarrito = computed(() =>
    itemsCarrito.value.reduce((s, i) => s + i.price * i.qty, 0)
  )
  const countCarrito = computed(() =>
    itemsCarrito.value.reduce((s, i) => s + i.qty, 0)
  )
  const hayOfertas = computed(() =>
    itemsCarrito.value.some(i => i.badge === 'oferta')
  )
  const hayStockBajo = computed(() =>
    itemsCarrito.value.some(i => i.stock <= 3)
  )

  // ── Formato de moneda ─────────────────────────────────────────────────────
  function fmt(valor) {
    const moneda = config.value?.currency || 'MXN'
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: moneda,
      minimumFractionDigits: 0,
    }).format(valor)
  }

  // ── Enviar pedido por WhatsApp ────────────────────────────────────────────
  function enviarWA(nombre, tipoEnvio) {
    const wa = config.value?.whatsapp || ''
    if (!wa) { alert('Número de WhatsApp no configurado'); return }
    const envioLabel = tipoEnvio === 'retiro'
      ? 'Retiro en sucursal'
      : config.value?.deliveryLabel || 'Envío a domicilio'
    let msg = `¡Hola! Soy *${nombre || 'Cliente'}* y quiero apartar:\n\n`
    itemsCarrito.value.forEach(i => {
      msg += `• ${i.name}\n  Cantidad: ${i.qty}  |  ${fmt(i.price * i.qty)}\n`
    })
    msg += `\n📦 Envío: ${envioLabel}`
    msg += `\n*Total: ${fmt(totalCarrito.value)}*`
    msg += `\n\n¿Tienen disponibilidad? 🙏`
    window.open(`https://wa.me/${wa}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  // ── Inicializar ───────────────────────────────────────────────────────────
  cargarDatos()

  return {
    // Datos
    config, cats, prods, loading, error,
    // UI
    activeCat, searchQ, drawerOpen,
    // Computados
    prodsFiltrados, itemsCarrito, totalCarrito, countCarrito,
    hayOfertas, hayStockBajo,
    // Métodos
    cargarDatos, toggleCarrito, cambiarQty, eliminarItem,
    limpiarCarrito, fmt, enviarWA,
  }
}
