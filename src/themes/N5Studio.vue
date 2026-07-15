<template>
  <div class="n5-root">
    <header class="n5-header">
      <div class="n5-header-inner">
        <div class="n5-brand">
          <div class="n5-mark">
            <img
              v-if="config?.logoUrl && !logoError"
              :src="config.logoUrl"
              :alt="config?.siteName || 'Catálogo'"
              @error="logoError = true"
            />
            <span v-else>{{ config?.logoFallback || 'N5' }}</span>
          </div>
          <div>
            <p class="n5-kicker">CATÁLOGO DIRECTO</p>
            <h1>{{ config?.siteName || 'N5' }}</h1>
            <p>{{ config?.tagline || 'Ideas convertidas en productos que sí comunican.' }}</p>
          </div>
        </div>

        <a
          v-if="config?.whatsapp"
          class="n5-contact"
          :href="'https://wa.me/' + config.whatsapp"
          target="_blank"
          rel="noopener"
        >
          Hablar con N5
        </a>
      </div>

      <div class="n5-tools">
        <label class="n5-search">
          <span>⌕</span>
          <input
            :value="searchQ"
            :placeholder="config?.searchPlaceholder || 'Buscar producto o servicio'"
            autocomplete="off"
            @input="$emit('update:searchQ', $event.target.value)"
          />
        </label>

        <nav class="n5-cats" aria-label="Categorías">
          <button
            v-for="cat in cats"
            :key="cat.k"
            :class="{ active: activeCat === cat.k }"
            @click="$emit('update:activeCat', cat.k); $emit('update:searchQ', '')"
          >
            <span>{{ cat.icon }}</span>{{ cat.l }}
          </button>
        </nav>
      </div>
    </header>

    <main class="n5-main">
      <section class="n5-intro">
        <div>
          <span class="n5-line"></span>
          <p>{{ prodsFiltrados?.length || 0 }} opciones disponibles</p>
        </div>
        <p class="n5-help">Selecciona productos y envía tu pedido por WhatsApp.</p>
      </section>

      <section v-if="loading" class="n5-grid">
        <article v-for="n in 8" :key="n" class="n5-card skeleton">
          <div class="n5-media"></div>
          <div class="n5-copy"><i></i><i></i><i></i></div>
        </article>
      </section>

      <section v-else-if="!prodsFiltrados?.length" class="n5-empty">
        <strong>No encontramos coincidencias.</strong>
        <span>Prueba con otra palabra o categoría.</span>
      </section>

      <section v-else class="n5-grid">
        <article
          v-for="(prod, index) in prodsFiltrados"
          :key="prod.id"
          :class="['n5-card', { selected: enCarrito(prod.id) }]"
          :style="{ '--delay': Math.min(index * 35, 280) + 'ms' }"
        >
          <button class="n5-card-hit" @click="$emit('toggle-carrito', prod)" :aria-label="'Agregar ' + prod.name"></button>
          <div class="n5-media">
            <img
              v-if="prod.imageUrl && !imgErrors[prod.id]"
              :src="prod.imageUrl"
              :alt="prod.name"
              loading="lazy"
              @error="imgErrors[prod.id] = true"
            />
            <span v-else class="n5-emoji">{{ prod.emoji || '◼' }}</span>

            <span v-if="prod.badge" :class="['n5-badge', prod.badge]">
              {{ prod.badge === 'oferta' ? 'OFERTA' : prod.badge === 'nuevo' ? 'NUEVO' : 'POCAS PIEZAS' }}
            </span>
          </div>

          <div class="n5-copy">
            <div class="n5-title-row">
              <h2>{{ prod.name }}</h2>
              <span v-if="enCarrito(prod.id)" class="n5-check">✓</span>
            </div>
            <p>{{ prod.desc }}</p>
            <div class="n5-price-row">
              <strong>{{ fmt(prod.price) }}</strong>
              <del v-if="prod.orig">{{ fmt(prod.orig) }}</del>
            </div>
            <button
              :class="['n5-add', { added: enCarrito(prod.id) }]"
              @click="$emit('toggle-carrito', prod)"
            >
              {{ enCarrito(prod.id) ? 'Agregado al pedido' : 'Agregar' }}
            </button>
          </div>
        </article>
      </section>
    </main>

    <div :class="['n5-cart-shell', { visible: countCarrito > 0 }]">
      <section :class="['n5-drawer', { open: drawerOpen }]">
        <div class="n5-drawer-head">
          <div>
            <span>PEDIDO ACTUAL</span>
            <strong>{{ countCarrito }} artículo{{ countCarrito === 1 ? '' : 's' }}</strong>
          </div>
          <button @click="$emit('update:drawerOpen', false)">Cerrar</button>
        </div>

        <div class="n5-cart-list">
          <div v-for="item in itemsCarrito" :key="item.id" class="n5-cart-item">
            <div>
              <strong>{{ item.name }}</strong>
              <small>{{ fmt(item.price) }} c/u</small>
            </div>
            <div class="n5-qty">
              <button @click="$emit('cambiar-qty', item.id, -1)">−</button>
              <span>{{ item.qty }}</span>
              <button @click="$emit('cambiar-qty', item.id, 1)">+</button>
            </div>
            <strong>{{ fmt(item.price * item.qty) }}</strong>
            <button class="n5-delete" @click="$emit('eliminar-item', item.id)">×</button>
          </div>
        </div>

        <div class="n5-form">
          <input v-model="nombre" placeholder="Tu nombre" />
          <select v-model="tipoEnvio">
            <option value="">Selecciona entrega</option>
            <option value="retiro">Retiro en sucursal</option>
            <option value="delivery">{{ config?.deliveryLabel || 'Envío a domicilio' }}</option>
          </select>
        </div>
      </section>

      <div class="n5-cart-bar">
        <button class="n5-summary" @click="$emit('update:drawerOpen', !drawerOpen)">
          <span>{{ countCarrito }} productos</span>
          <strong>{{ fmt(totalCarrito) }}</strong>
        </button>
        <button class="n5-send" @click="$emit('enviar-wa', nombre, tipoEnvio)">
          Pedir por WhatsApp
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const props = defineProps({
  config: Object,
  cats: Array,
  prods: Array,
  loading: Boolean,
  activeCat: String,
  searchQ: String,
  prodsFiltrados: Array,
  itemsCarrito: Array,
  totalCarrito: Number,
  countCarrito: Number,
  hayOfertas: Boolean,
  hayStockBajo: Boolean,
  drawerOpen: Boolean,
  fmt: Function,
})

defineEmits([
  'update:activeCat',
  'update:searchQ',
  'update:drawerOpen',
  'toggle-carrito',
  'cambiar-qty',
  'eliminar-item',
  'enviar-wa',
])

const nombre = ref('')
const tipoEnvio = ref('')
const imgErrors = reactive({})
const logoError = ref(false)
const enCarrito = (id) => props.itemsCarrito?.some((item) => item.id === id)
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');

.n5-root{--bg:#090d0b;--panel:#101713;--panel2:#151f19;--line:#26342c;--ink:#f3f7f4;--muted:#9aaba0;--accent:#00c26a;--accent2:#2cf29f;min-height:100vh;background:radial-gradient(circle at 80% 0,rgba(0,194,106,.12),transparent 30%),var(--bg);color:var(--ink);font-family:'Manrope',system-ui,sans-serif;padding-bottom:140px}
.n5-root *{box-sizing:border-box}.n5-header{position:sticky;top:0;z-index:60;background:rgba(9,13,11,.94);backdrop-filter:blur(18px);border-bottom:1px solid var(--line)}
.n5-header-inner,.n5-tools,.n5-main{width:min(1180px,calc(100% - 32px));margin:auto}.n5-header-inner{display:flex;justify-content:space-between;align-items:center;padding:18px 0;gap:20px}
.n5-brand{display:flex;align-items:center;gap:14px}.n5-mark{width:54px;height:54px;border-radius:15px;background:linear-gradient(145deg,var(--accent2),var(--accent));color:#03130b;display:grid;place-items:center;font-weight:900;font-size:20px;overflow:hidden;box-shadow:0 10px 30px rgba(0,194,106,.18)}
.n5-mark img{width:100%;height:100%;object-fit:cover}.n5-kicker{font-size:9px;letter-spacing:.22em;color:var(--accent2);font-weight:800;margin:0 0 3px}.n5-brand h1{font-size:18px;line-height:1;margin:0 0 5px;letter-spacing:-.03em}.n5-brand p:last-child{margin:0;color:var(--muted);font-size:12px}
.n5-contact{padding:11px 16px;border:1px solid var(--line);border-radius:10px;color:var(--ink);text-decoration:none;font-size:12px;font-weight:800}.n5-contact:hover{border-color:var(--accent)}
.n5-tools{display:grid;grid-template-columns:minmax(230px,340px) 1fr;gap:18px;align-items:center;padding:0 0 14px}.n5-search{height:44px;border-radius:12px;background:var(--panel);border:1px solid var(--line);display:flex;align-items:center;gap:8px;padding:0 13px}.n5-search span{color:var(--accent);font-size:20px}.n5-search input{width:100%;border:0;outline:0;background:transparent;color:var(--ink);font:inherit;font-size:13px}
.n5-cats{display:flex;overflow:auto;gap:8px;scrollbar-width:none}.n5-cats button{border:1px solid var(--line);background:transparent;color:var(--muted);border-radius:999px;height:38px;padding:0 14px;white-space:nowrap;font:700 12px 'Manrope';cursor:pointer}.n5-cats button.active{background:var(--accent);border-color:var(--accent);color:#03130b}.n5-cats button span{margin-right:5px}
.n5-main{padding-top:24px}.n5-intro{display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;color:var(--muted);font-size:11px}.n5-intro>div{display:flex;align-items:center;gap:10px}.n5-line{width:42px;height:2px;background:var(--accent)}.n5-intro p{margin:0}.n5-help{letter-spacing:.02em}
.n5-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.n5-card{position:relative;background:var(--panel);border:1px solid var(--line);border-radius:18px;overflow:hidden;animation:rise .35s ease both;animation-delay:var(--delay);transition:.2s}.n5-card:hover{transform:translateY(-3px);border-color:#3d5848}.n5-card.selected{border-color:var(--accent);box-shadow:0 0 0 1px rgba(0,194,106,.2)}
@keyframes rise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}.n5-card-hit{position:absolute;inset:0;border:0;background:transparent;cursor:pointer;z-index:1}.n5-media{aspect-ratio:4/3;background:var(--panel2);position:relative;display:grid;place-items:center;overflow:hidden}.n5-media img{width:100%;height:100%;object-fit:cover;transition:transform .35s}.n5-card:hover .n5-media img{transform:scale(1.025)}.n5-emoji{font-size:44px}.n5-badge{position:absolute;top:10px;left:10px;padding:5px 8px;border-radius:7px;background:#fff;color:#111;font-size:8px;font-weight:900;letter-spacing:.09em}.n5-badge.oferta{background:#ff4d5f;color:#fff}.n5-badge.nuevo{background:var(--accent2);color:#042011}.n5-badge.poco{background:#ffb84d;color:#241700}
.n5-copy{padding:14px;position:relative;z-index:2;pointer-events:none}.n5-title-row{display:flex;justify-content:space-between;gap:8px}.n5-title-row h2{font-size:14px;line-height:1.25;margin:0;letter-spacing:-.02em}.n5-check{width:20px;height:20px;border-radius:50%;background:var(--accent);color:#04130b;display:grid;place-items:center;font-size:11px;font-weight:900}.n5-copy p{font-size:11px;line-height:1.5;color:var(--muted);margin:7px 0 12px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.n5-price-row{display:flex;align-items:baseline;gap:8px;margin-bottom:12px}.n5-price-row strong{font-size:19px;color:var(--accent2)}.n5-price-row del{font-size:11px;color:#6d7d73}.n5-add{pointer-events:auto;width:100%;height:38px;border-radius:10px;border:1px solid var(--line);background:#17231c;color:var(--ink);font:800 11px 'Manrope';cursor:pointer}.n5-add.added{background:var(--accent);color:#03130b;border-color:var(--accent)}
.n5-empty{border:1px dashed var(--line);min-height:280px;border-radius:20px;display:grid;place-content:center;text-align:center;color:var(--muted);gap:7px}.n5-empty strong{color:var(--ink)}
.skeleton{animation:pulse 1.5s infinite}.skeleton .n5-media,.skeleton i{background:linear-gradient(90deg,#141d17,#1d2a21,#141d17);background-size:200% 100%;animation:shimmer 1.3s infinite}.skeleton i{display:block;height:12px;border-radius:6px;margin-bottom:9px}.skeleton i:nth-child(2){width:65%}.skeleton i:nth-child(3){height:36px;margin:18px 0 0}@keyframes shimmer{to{background-position:-200% 0}}@keyframes pulse{50%{opacity:.8}}
.n5-cart-shell{position:fixed;left:50%;bottom:18px;transform:translate(-50%,130%);width:min(780px,calc(100% - 24px));z-index:100;transition:.3s}.n5-cart-shell.visible{transform:translate(-50%,0)}.n5-cart-bar{display:grid;grid-template-columns:1fr 1.1fr;background:#effff6;border-radius:16px;padding:7px;box-shadow:0 20px 70px rgba(0,0,0,.45)}.n5-cart-bar button{height:50px;border-radius:11px;border:0;font:800 12px 'Manrope';cursor:pointer}.n5-summary{background:transparent;color:#0b2215;display:flex;justify-content:space-between;align-items:center;padding:0 15px}.n5-summary span{font-size:11px}.n5-summary strong{font-size:15px}.n5-send{background:var(--accent);color:#02130a}
.n5-drawer{position:absolute;left:0;right:0;bottom:68px;background:#effff6;color:#0b1b11;border-radius:20px;padding:18px;box-shadow:0 18px 70px rgba(0,0,0,.4);opacity:0;transform:translateY(15px);pointer-events:none;transition:.2s;max-height:min(68vh,560px);overflow:auto}.n5-drawer.open{opacity:1;transform:none;pointer-events:auto}.n5-drawer-head{display:flex;justify-content:space-between;align-items:center;padding-bottom:14px;border-bottom:1px solid #cae2d3}.n5-drawer-head div{display:grid;gap:3px}.n5-drawer-head span{font-size:8px;letter-spacing:.15em;color:#5c7665}.n5-drawer-head strong{font-size:17px}.n5-drawer-head button,.n5-delete{border:0;background:transparent;cursor:pointer;color:#4f6557}.n5-cart-list{display:grid}.n5-cart-item{display:grid;grid-template-columns:1fr auto auto auto;gap:14px;align-items:center;padding:13px 0;border-bottom:1px solid #d8e8de;font-size:12px}.n5-cart-item>div:first-child{display:grid}.n5-cart-item small{color:#6f8577;margin-top:3px}.n5-qty{display:flex;align-items:center;border:1px solid #bed3c5;border-radius:9px;overflow:hidden}.n5-qty button{width:30px;height:30px;border:0;background:#dff1e6;cursor:pointer}.n5-qty span{width:28px;text-align:center}.n5-delete{font-size:20px}.n5-form{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:15px}.n5-form input,.n5-form select{height:43px;border:1px solid #bdd1c3;border-radius:10px;background:#fff;padding:0 12px;font:600 12px 'Manrope';outline:none}
@media(min-width:620px){.n5-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}@media(min-width:940px){.n5-grid{grid-template-columns:repeat(4,minmax(0,1fr))}}
@media(max-width:700px){.n5-header-inner{padding:13px 0}.n5-contact{display:none}.n5-brand p:last-child{max-width:230px}.n5-tools{grid-template-columns:1fr;gap:10px}.n5-main{padding-top:18px}.n5-intro{align-items:flex-start}.n5-help{display:none}.n5-cart-item{grid-template-columns:1fr auto auto}.n5-cart-item>strong{display:none}.n5-form{grid-template-columns:1fr}.n5-drawer{padding:15px}}
@media(max-width:420px){.n5-header-inner,.n5-tools,.n5-main{width:min(100% - 22px,1180px)}.n5-mark{width:46px;height:46px}.n5-brand h1{font-size:16px}.n5-grid{gap:10px}.n5-copy{padding:11px}.n5-copy p{display:none}.n5-price-row strong{font-size:17px}.n5-cart-bar{grid-template-columns:.85fr 1.15fr}}
</style>
