<template>
  <div class="ios-root">
    <!-- Google Fonts para este tema -->
    <component :is="'link'" rel="preconnect" href="https://fonts.googleapis.com" />
    <component :is="'link'" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />

    <!-- ── HERO ── -->
    <div class="hero">
      <div class="hero-noise"></div>
      <div class="hero-inner">
        <div class="hero-top">
          <!-- Logo / Brand -->
          <div class="brand-mark">
            <div class="brand-icon">
              <img
                v-if="config?.logoUrl"
                :src="config.logoUrl"
                :alt="config?.siteName || 'Logo'"
                class="brand-logo-img"
                @error="logoError = true"
              />
              <span v-if="!config?.logoUrl || logoError" class="brand-emoji">
                {{ config?.logoFallback || '🏪' }}
              </span>
            </div>
            <div class="brand-text">
              <div class="brand-name">{{ config?.siteName || 'Catálogo' }}</div>
              <div class="brand-tagline">{{ config?.tagline || '' }}</div>
            </div>
          </div>

          <!-- Trust chips — visibles en tablet+ -->
          <div class="hero-trust">
            <div v-if="config?.chip1Text" class="trust-chip">
              <div class="trust-dot gold"></div>{{ config.chip1Text }}
            </div>
            <div v-if="config?.chip2Text" class="trust-chip">
              <div class="trust-dot green"></div>{{ config.chip2Text }}
            </div>
            <div v-if="config?.chip3Text" class="trust-chip">
              <div class="trust-dot blue"></div>{{ config.chip3Text }}
            </div>
          </div>

          <!-- Botones header -->
          <div class="hero-actions">
            <a v-if="config?.phone" :href="'tel:' + config.phone" class="hero-btn hero-btn-ghost">
              📞 Llamar
            </a>
            <a
              v-if="config?.whatsapp"
              :href="'https://wa.me/' + config.whatsapp"
              target="_blank"
              class="hero-btn hero-btn-wa"
            >
              💬 WhatsApp
            </a>
          </div>
        </div>

        <!-- Buscador -->
        <div class="hero-search">
          <svg viewBox="0 0 24 24"><path d="M10.5 2a8.5 8.5 0 105.963 14.477l4.28 4.28a1 1 0 001.414-1.414l-4.28-4.28A8.5 8.5 0 0010.5 2zm-6.5 8.5a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0z"/></svg>
          <input
            :value="searchQ"
            :placeholder="config?.searchPlaceholder || 'Buscar producto…'"
            @input="$emit('update:searchQ', $event.target.value)"
            autocomplete="off"
          />
        </div>
      </div>
      <div class="hero-fade"></div>
    </div>

    <!-- ── NAV PILLS ── -->
    <div class="pill-nav-wrap">
      <div class="pill-nav">
        <button
          v-for="cat in cats"
          :key="cat.k"
          :class="['pill', activeCat === cat.k ? 'active' : '']"
          @click="$emit('update:activeCat', cat.k); $emit('update:searchQ', '')"
        >
          {{ cat.icon }} {{ cat.l }}
        </button>
      </div>
    </div>

    <!-- ── SKELETON (cargando) ── -->
    <div v-if="loading" class="grid-wrap">
      <div class="product-grid">
        <div v-for="n in 8" :key="n" class="pcard skeleton-card">
          <div class="skeleton-img"></div>
          <div class="card-body">
            <div class="skeleton-line short"></div>
            <div class="skeleton-line"></div>
            <div class="skeleton-line medium"></div>
            <div class="skeleton-btn"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── GRID DE PRODUCTOS ── -->
    <div v-else class="grid-wrap" id="gridWrap">
      <!-- Sin resultados -->
      <div v-if="!prodsFiltrados.length" class="empty">
        <div class="empty-icon">🔍</div>
        <div class="empty-title">Sin resultados</div>
        <div class="empty-sub">Intenta con otro término o categoría</div>
      </div>

      <template v-else>
        <div class="section-head">
          <span class="section-title">
            {{ searchQ ? `"${searchQ}"` : (activeCat === 'todos' ? 'Catálogo completo' : cats.find(c=>c.k===activeCat)?.l) }}
          </span>
          <span class="section-count">{{ prodsFiltrados.length }} productos</span>
        </div>

        <div class="product-grid">
          <div
            v-for="(prod, i) in prodsFiltrados"
            :key="prod.id"
            :class="['pcard', enCarrito(prod.id) ? 'in-cart' : '', esFeatured(prod) ? 'featured' : '']"
            :style="{ animationDelay: Math.min(i * 0.045, 0.36) + 's' }"
            @click="$emit('toggle-carrito', prod)"
          >
            <!-- Imagen del producto -->
            <div class="card-img">
              <img
                v-if="prod.imageUrl && !imgErrors[prod.id]"
                :src="prod.imageUrl"
                :alt="prod.name"
                class="card-product-img"
                loading="lazy"
                @error="imgErrors[prod.id] = true"
              />
              <span v-else class="card-emoji">{{ prod.emoji }}</span>

              <!-- Badge -->
              <div v-if="prod.badge === 'oferta'" class="badge badge-oferta">Oferta</div>
              <div v-else-if="prod.badge === 'poco'" class="badge badge-poco">⚡ Pocas piezas</div>
              <div v-else-if="prod.badge === 'nuevo'" class="badge badge-nuevo">Nuevo</div>

              <!-- Check carrito -->
              <div class="cart-check">
                <svg viewBox="0 0 12 10" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="1,5 4.5,8.5 11,1"/>
                </svg>
              </div>
            </div>

            <!-- Body -->
            <div class="card-body">
              <div class="card-cat">{{ prod.cat }}</div>
              <div class="card-name">{{ prod.name }}</div>

              <div class="price-block">
                <div class="price-row">
                  <span class="price-main">{{ fmt(prod.price) }}</span>
                  <span v-if="prod.orig" class="price-orig">{{ fmt(prod.orig) }}</span>
                </div>
                <div v-if="prod.orig" class="price-save">▼ Ahorras {{ fmt(prod.orig - prod.price) }}</div>
                <div v-if="prod.stock === 1" class="stock-warn">⚠ Última pieza</div>
                <div v-else-if="prod.stock <= 3" class="stock-warn">Solo {{ prod.stock }} disponibles</div>
              </div>

              <button
                :class="['add-btn', enCarrito(prod.id) ? 'add-btn-in' : 'add-btn-out']"
                @click.stop="$emit('toggle-carrito', prod)"
              >
                {{ enCarrito(prod.id) ? '✓ En tu pedido' : '+ Agregar' }}
              </button>

              <!-- Specs colapsables -->
              <template v-if="prod.desc || prod.specs">
                <button class="card-desc-toggle" :class="{ open: specsOpen[prod.id] }"
                  @click.stop="specsOpen[prod.id] = !specsOpen[prod.id]">
                  Ver specs <span class="tog-arrow">▾</span>
                </button>
                <div class="card-desc" :class="{ open: specsOpen[prod.id] }">
                  <div class="card-desc-inner">
                    <p v-if="prod.desc">{{ prod.desc }}</p>
                    <div v-if="prod.specs" class="card-desc-specs">
                      <div v-for="([k,v]) in prod.specs" :key="k" class="spec-row">
                        <span class="spec-key">{{ k }}</span>
                        <span class="spec-val">{{ v }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- ── CART BAR (fija en el fondo) ── -->
    <div :class="['cart-bar', countCarrito > 0 ? 'visible' : '', cartBounce ? 'bounce' : '']">

      <!-- Urgencia -->
      <div v-if="hayOfertas || hayStockBajo" class="urgency-strip">
        <span v-if="hayOfertas" class="urg-msg">⏱ Oferta válida por <span class="urg-timer">{{ timerDisplay }}</span></span>
        <span v-else class="urg-msg">⚠ Stock limitado — aparta ahora</span>
      </div>

      <!-- Drawer -->
      <div :class="['drawer', drawerOpen ? 'open' : '']">
        <div class="drawer-handle"></div>
        <div class="drawer-head">
          <span class="drawer-title">Tu pedido ({{ countCarrito }})</span>
          <button class="drawer-close" @click="$emit('update:drawerOpen', false)">✕</button>
        </div>

        <!-- Lista de items -->
        <div class="cart-list">
          <div v-for="item in itemsCarrito" :key="item.id" class="cart-row">
            <div class="crow-emoji">{{ item.emoji }}</div>
            <div class="crow-info">
              <div class="crow-name">{{ item.name }}</div>
              <div class="crow-sub">{{ fmt(item.price) }} c/u</div>
            </div>
            <div class="qty-ctrl">
              <button class="qty-btn" @click="$emit('cambiar-qty', item.id, -1)">−</button>
              <span class="qty-num">{{ item.qty }}</span>
              <button class="qty-btn" @click="$emit('cambiar-qty', item.id, 1)">+</button>
            </div>
            <div class="crow-total">{{ fmt(item.price * item.qty) }}</div>
            <button class="del-btn" @click="$emit('eliminar-item', item.id)">✕</button>
          </div>
        </div>

        <!-- Formulario -->
        <div class="order-form">
          <div class="form-group">
            <label class="form-label">Tu nombre</label>
            <input class="form-input" v-model="nombre" placeholder="¿Cómo te llamamos?" autocomplete="name" />
          </div>
          <div class="form-group">
            <label class="form-label">Envío</label>
            <select class="form-input" v-model="tipoEnvio">
              <option value="">Selecciona una opción</option>
              <option value="retiro">Retiro en sucursal — Gratis</option>
              <option value="delivery">{{ config?.deliveryLabel || 'Envío a domicilio' }}</option>
            </select>
          </div>
          <div class="order-total">
            <span>{{ countCarrito }} {{ countCarrito === 1 ? 'producto' : 'productos' }}</span>
            <span class="order-total-val">{{ fmt(totalCarrito) }}</span>
          </div>
        </div>
      </div>

      <!-- CTA bar -->
      <div class="cta-bar">
        <div class="cta-toggle">
          <button class="cta-toggle-btn" @click="$emit('update:drawerOpen', !drawerOpen)">
            <span class="cart-icon-wrap">
              <svg class="cart-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              <span class="cart-badge">{{ countCarrito }}</span>
            </span>
            <span>{{ drawerOpen ? 'Ocultar pedido' : 'Ver pedido y editar' }}</span>
          </button>
        </div>
        <button class="wa-btn" @click="$emit('enviar-wa', nombre, tipoEnvio)">
          <div class="wa-left">
            <svg class="wa-icon" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            <div class="wa-copy">
              <span class="wa-main">{{ countCarrito === 1 ? 'Pedir mi producto' : `Pedir mis ${countCarrito} productos` }}</span>
              <span class="wa-sub">Asesor responde en minutos</span>
            </div>
          </div>
          <span class="wa-pill">{{ fmt(totalCarrito) }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'

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

const emit = defineEmits([
  'update:activeCat','update:searchQ','update:drawerOpen',
  'toggle-carrito','cambiar-qty','eliminar-item','enviar-wa',
])

// Estado local del tema
const nombre      = ref('')
const tipoEnvio   = ref('')
const specsOpen   = reactive({})
const imgErrors   = reactive({})
const logoError   = ref(false)
const cartBounce  = ref(false)

// Timer de urgencia
const timerSecs   = ref(899)
const timerDisplay = ref('14:59')
setInterval(() => {
  if (timerSecs.value <= 0) { timerSecs.value = 899; return }
  timerSecs.value--
  const m = Math.floor(timerSecs.value / 60)
  const s = String(timerSecs.value % 60).padStart(2, '0')
  timerDisplay.value = `${m}:${s}`
}, 1000)

// Bounce al agregar
watch(() => props.countCarrito, () => {
  cartBounce.value = true
  setTimeout(() => { cartBounce.value = false }, 400)
})

function enCarrito(id) {
  return props.itemsCarrito.some(i => i.id === id)
}
function esFeatured(prod) {
  return prod.featured && props.activeCat === 'todos' && !props.searchQ
}
</script>

<style scoped>
/* ── RESET Y ROOT ── */
.ios-root {
  --cream:#F7F4EF;--bg2:#FFFFFF;--bg3:#F2EFE8;
  --ink:#0F0E0C;--ink2:#3A3832;
  --ink3:rgba(58,56,50,.55);--ink4:rgba(58,56,50,.28);
  --sep:rgba(58,56,50,.12);--sep2:rgba(58,56,50,.06);
  --gold:#C8922A;--gold-lt:#F5EDD8;
  --blue:#007AFF;--blue-lt:rgba(0,122,255,.1);
  --green:#34C759;--green-lt:rgba(52,199,89,.12);
  --orange:#FF9500;--red:#FF3B30;--red-lt:rgba(255,59,48,.1);
  --fill:rgba(58,56,50,.1);--fill2:rgba(58,56,50,.06);
  --wa:#25D366;--radius:16px;--radius-sm:12px;
  --shadow:0 2px 16px rgba(15,14,12,.07);
  --shadow-lg:0 8px 40px rgba(15,14,12,.12);
  --font:'DM Sans','Helvetica Neue',sans-serif;
  --serif:'Playfair Display',Georgia,serif;
  font-family:var(--font);
  background:var(--cream);
  color:var(--ink);
  min-height:100vh;
  overscroll-behavior:none;
  box-sizing:border-box;
}
.ios-root *{box-sizing:border-box;-webkit-tap-highlight-color:transparent;}

/* ── HERO ── */
.hero{background:var(--ink);padding:max(16px,env(safe-area-inset-top,0px)) 16px 0;position:relative;overflow:hidden;}
.hero::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 70% 60% at 85% 15%,rgba(200,146,42,.18) 0%,transparent 70%),radial-gradient(ellipse 50% 50% at 15% 85%,rgba(200,146,42,.08) 0%,transparent 70%);}
.hero-noise{position:absolute;inset:0;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.04'/%3E%3C/svg%3E");opacity:.5;}
.hero-inner{position:relative;z-index:2;max-width:1100px;margin:0 auto;}
.hero-top{display:flex;align-items:center;gap:10px;}
.brand-mark{display:flex;align-items:center;gap:8px;flex-shrink:0;}
.brand-icon{width:36px;height:36px;border-radius:10px;background:var(--gold);display:flex;align-items:center;justify-content:center;overflow:hidden;box-shadow:0 3px 10px rgba(200,146,42,.35);}
.brand-logo-img{width:100%;height:100%;object-fit:cover;}
.brand-emoji{font-size:18px;}
.brand-text{display:flex;flex-direction:column;}
.brand-name{font-family:var(--serif);font-size:16px;font-weight:700;color:#fff;letter-spacing:-.01em;line-height:1;}
.brand-tagline{font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.38);font-weight:500;margin-top:1px;}
.hero-trust{display:none;flex:1;gap:12px;flex-wrap:nowrap;justify-content:center;}
@media(min-width:600px){.hero-trust{display:flex;}}
.trust-chip{display:flex;align-items:center;gap:5px;font-size:10.5px;font-weight:500;color:rgba(255,255,255,.45);white-space:nowrap;}
.trust-dot{width:5px;height:5px;border-radius:50%;flex-shrink:0;}
.trust-dot.gold{background:var(--gold);}
.trust-dot.green{background:var(--green);}
.trust-dot.blue{background:var(--blue);}
.hero-actions{display:flex;gap:6px;flex-shrink:0;margin-left:auto;}
.hero-btn{height:32px;padding:0 12px;border-radius:99px;border:none;font-family:var(--font);font-size:12.5px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:4px;text-decoration:none;backdrop-filter:blur(20px);transition:transform .12s,opacity .12s;}
.hero-btn:active{transform:scale(.93);opacity:.8;}
.hero-btn-ghost{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.15);color:rgba(255,255,255,.85);}
.hero-btn-wa{background:var(--wa);color:#fff;}
.hero-search{margin-top:12px;background:rgba(255,255,255,.08);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,.1);border-radius:12px;display:flex;align-items:center;gap:8px;padding:0 14px;height:40px;}
.hero-search input{flex:1;background:none;border:none;outline:none;font-family:var(--font);font-size:15px;color:#fff;}
.hero-search input::placeholder{color:rgba(255,255,255,.3);}
.hero-search svg{width:15px;height:15px;fill:rgba(255,255,255,.35);flex-shrink:0;}
.hero-fade{height:20px;background:linear-gradient(to bottom,transparent,var(--cream));margin-top:12px;}

/* ── NAV ── */
.pill-nav-wrap{position:sticky;top:0;z-index:90;background:rgba(247,244,239,.92);backdrop-filter:saturate(180%) blur(20px);border-bottom:1px solid var(--sep2);}
.pill-nav{max-width:1100px;margin:0 auto;padding:10px 16px;display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;}
@media(min-width:700px){.pill-nav{justify-content:center;}}
.pill-nav::-webkit-scrollbar{display:none;}
.pill{flex-shrink:0;height:34px;padding:0 16px;border-radius:99px;border:none;font-family:var(--font);font-size:13.5px;font-weight:600;cursor:pointer;transition:all .22s cubic-bezier(.34,1.56,.64,1);white-space:nowrap;}
.pill.active{background:var(--ink);color:#fff;transform:scale(1.05);box-shadow:0 4px 12px rgba(15,14,12,.18);}
.pill:not(.active){background:var(--fill2);color:var(--ink3);}
.pill:not(.active):hover{background:var(--fill);color:var(--ink2);}
.pill:active{transform:scale(.93) !important;}

/* ── GRID ── */
.grid-wrap{padding:16px;padding-bottom:140px;max-width:1100px;margin:0 auto;}
.section-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;margin-top:6px;}
.section-title{font-family:var(--serif);font-size:20px;font-weight:700;color:var(--ink);}
.section-count{font-size:12px;color:var(--ink3);font-weight:500;background:var(--fill2);padding:4px 10px;border-radius:99px;border:1px solid var(--sep2);}
.product-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
@media(min-width:560px){.product-grid{grid-template-columns:repeat(3,1fr);}}
@media(min-width:800px){.product-grid{grid-template-columns:repeat(4,1fr);}}
@media(min-width:1050px){.product-grid{grid-template-columns:repeat(5,1fr);}}

/* ── CARD ── */
@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
.pcard{background:var(--bg2);border-radius:var(--radius);overflow:hidden;cursor:pointer;position:relative;display:flex;flex-direction:column;transition:transform .2s cubic-bezier(.34,1.56,.64,1),box-shadow .2s,border-color .2s;box-shadow:var(--shadow);border:1px solid var(--sep2);opacity:0;animation:fadeUp .32s ease forwards;will-change:transform,opacity;}
.pcard:hover{transform:translateY(-3px) scale(1.01);box-shadow:var(--shadow-lg);}
.pcard:active{transform:scale(.95) !important;}
.pcard.in-cart{border:1.5px solid var(--green);box-shadow:0 0 0 3px var(--green-lt),var(--shadow);}
.pcard.featured{grid-column:span 2;flex-direction:row;min-height:126px;}
.pcard.featured .card-img{width:126px;flex-shrink:0;aspect-ratio:auto;}
.pcard.featured .card-emoji{font-size:50px;}
@media(min-width:560px){.pcard.featured{grid-column:span 1;flex-direction:column;}.pcard.featured .card-img{width:100%;aspect-ratio:1;}}

.card-img{aspect-ratio:1;background:var(--bg3);display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;transition:background .22s;}
.pcard.in-cart .card-img{background:var(--green-lt);}
.card-product-img{width:100%;height:100%;object-fit:cover;transition:transform .22s cubic-bezier(.34,1.56,.64,1);}
.pcard:hover .card-product-img{transform:scale(1.06);}
.card-emoji{font-size:38px;pointer-events:none;transition:transform .22s cubic-bezier(.34,1.56,.64,1);}
.pcard:hover .card-emoji{transform:scale(1.1);}
.cart-check{position:absolute;top:8px;right:8px;width:22px;height:22px;border-radius:50%;background:var(--green);display:flex;align-items:center;justify-content:center;opacity:0;transform:scale(0) rotate(-30deg);transition:all .25s cubic-bezier(.34,1.56,.64,1);}
.pcard.in-cart .cart-check{opacity:1;transform:scale(1) rotate(0deg);}
.cart-check svg{width:11px;height:11px;}
.badge{position:absolute;top:8px;left:8px;font-size:9.5px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;padding:3px 8px;border-radius:99px;backdrop-filter:blur(10px);}
.badge-oferta{background:rgba(255,59,48,.9);color:#fff;}
.badge-poco{background:rgba(255,149,0,.9);color:#fff;}
.badge-nuevo{background:rgba(0,122,255,.9);color:#fff;}

.card-body{padding:10px 12px 12px;flex:1;display:flex;flex-direction:column;}
.card-cat{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.07em;color:var(--ink4);margin-bottom:3px;}
.card-name{font-size:13px;font-weight:600;color:var(--ink);line-height:1.3;flex:1;}
.price-block{margin-top:8px;}
.price-row{display:flex;align-items:baseline;gap:5px;}
.price-main{font-size:16px;font-weight:700;color:var(--ink);letter-spacing:-.01em;}
.price-orig{font-size:11px;color:var(--ink4);text-decoration:line-through;}
.price-save{font-size:10px;font-weight:700;color:var(--green);margin-top:2px;}
.stock-warn{font-size:10px;font-weight:600;color:var(--orange);margin-top:2px;}
.add-btn{margin-top:9px;width:100%;height:32px;border-radius:10px;border:none;font-family:var(--font);font-size:12.5px;font-weight:600;cursor:pointer;transition:all .2s cubic-bezier(.34,1.56,.64,1);display:flex;align-items:center;justify-content:center;gap:4px;}
.add-btn:active{transform:scale(.93);}
.add-btn-out{background:var(--blue);color:#fff;box-shadow:0 2px 8px rgba(0,122,255,.25);}
.add-btn-in{background:var(--green-lt);color:var(--green);border:1.5px solid rgba(52,199,89,.3);}

/* Specs colapsables */
.card-desc-toggle{display:flex;align-items:center;gap:4px;margin-top:7px;background:none;border:none;padding:0;font-family:var(--font);font-size:11px;font-weight:600;color:var(--blue);cursor:pointer;align-self:flex-start;}
.tog-arrow{display:inline-block;font-size:10px;transition:transform .22s cubic-bezier(.34,1.56,.64,1);}
.card-desc-toggle.open .tog-arrow{transform:rotate(180deg);}
.card-desc{overflow:hidden;max-height:0;transition:max-height .3s,opacity .25s;opacity:0;}
.card-desc.open{max-height:140px;opacity:1;}
.card-desc-inner{margin-top:7px;padding:8px 10px;background:var(--bg3);border-radius:8px;border-left:2px solid var(--blue);}
.card-desc-inner p{font-size:11px;line-height:1.5;color:var(--ink3);}
.card-desc-specs{display:flex;flex-direction:column;gap:2px;margin-top:5px;}
.spec-row{display:flex;justify-content:space-between;font-size:10.5px;}
.spec-key{color:var(--ink4);font-weight:500;}
.spec-val{color:var(--ink2);font-weight:600;}

/* ── SKELETON ── */
.skeleton-card{pointer-events:none;}
.skeleton-img{aspect-ratio:1;background:linear-gradient(90deg,#eee 25%,#f5f5f5 50%,#eee 75%);background-size:200% 100%;animation:shimmer 1.4s infinite;}
.skeleton-line{height:12px;border-radius:6px;background:linear-gradient(90deg,#eee 25%,#f5f5f5 50%,#eee 75%);background-size:200% 100%;animation:shimmer 1.4s infinite;margin:8px 0;}
.skeleton-line.short{width:40%;}
.skeleton-line.medium{width:60%;}
.skeleton-btn{height:32px;border-radius:10px;background:linear-gradient(90deg,#eee 25%,#f5f5f5 50%,#eee 75%);background-size:200% 100%;animation:shimmer 1.4s infinite;margin-top:9px;}
@keyframes shimmer{to{background-position:-200% 0;}}

/* ── EMPTY ── */
.empty{text-align:center;padding:60px 20px;}
.empty-icon{font-size:48px;margin-bottom:12px;}
.empty-title{font-size:17px;font-weight:600;color:var(--ink);}
.empty-sub{font-size:14px;color:var(--ink3);margin-top:6px;}

/* ── CART BAR ── */
.cart-bar{position:fixed;bottom:0;left:0;right:0;z-index:100;transform:translateY(100%);transition:transform .35s cubic-bezier(.34,1.56,.64,1);}
.cart-bar.visible{transform:none;}
@keyframes cartBounce{0%{transform:scale(1)}40%{transform:scale(1.07)}70%{transform:scale(.97)}100%{transform:scale(1)}}
.cart-bar.bounce .wa-btn{animation:cartBounce .4s cubic-bezier(.34,1.56,.64,1);}
.urgency-strip{background:var(--ink);color:#fff;font-size:12px;font-weight:600;padding:8px 16px;display:flex;justify-content:center;align-items:center;gap:8px;}
.urg-timer{font-variant-numeric:tabular-nums;}
.drawer{background:var(--bg2);border-radius:20px 20px 0 0;max-height:0;overflow:hidden;transition:max-height .38s cubic-bezier(.4,0,.2,1);}
.drawer.open{max-height:70vh;overflow-y:auto;}
.drawer-handle{width:36px;height:4px;background:var(--sep);border-radius:2px;margin:12px auto 0;}
.drawer-head{display:flex;align-items:center;justify-content:space-between;padding:14px 16px 0;}
.drawer-title{font-family:var(--serif);font-size:17px;font-weight:700;}
.drawer-close{background:var(--fill2);border:none;width:28px;height:28px;border-radius:50%;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;}
.cart-list{padding:12px 16px;display:flex;flex-direction:column;gap:10px;}
.cart-row{display:flex;align-items:center;gap:10px;background:var(--bg3);border-radius:12px;padding:10px 12px;}
.crow-emoji{font-size:28px;flex-shrink:0;}
.crow-info{flex:1;min-width:0;}
.crow-name{font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.crow-sub{font-size:11px;color:var(--ink3);}
.qty-ctrl{display:flex;align-items:center;gap:6px;}
.qty-btn{width:26px;height:26px;border-radius:50%;border:none;background:var(--fill);font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;}
.qty-num{font-size:14px;font-weight:700;min-width:18px;text-align:center;}
.crow-total{font-size:13px;font-weight:700;white-space:nowrap;}
.del-btn{background:var(--red-lt);border:none;color:var(--red);width:26px;height:26px;border-radius:50%;cursor:pointer;font-size:13px;display:flex;align-items:center;justify-content:center;}
.order-form{padding:0 16px 16px;}
.form-group{margin-bottom:10px;}
.form-label{display:block;font-size:12px;font-weight:600;color:var(--ink3);margin-bottom:5px;letter-spacing:.04em;text-transform:uppercase;}
.form-input{width:100%;height:42px;border-radius:10px;border:1.5px solid var(--sep);background:var(--bg3);font-family:var(--font);font-size:14px;padding:0 12px;outline:none;color:var(--ink);}
.form-input:focus{border-color:var(--blue);}
.order-total{display:flex;justify-content:space-between;align-items:center;padding:10px 12px;background:var(--gold-lt);border-radius:12px;margin-top:8px;font-size:14px;font-weight:600;color:var(--gold-dk);}
.order-total-val{font-size:20px;font-weight:700;}
.cta-bar{display:flex;gap:10px;padding:10px 16px max(16px,env(safe-area-inset-bottom,0px));background:var(--bg2);border-top:1px solid var(--sep2);}
.cta-toggle{display:flex;}
.cta-toggle-btn{display:flex;align-items:center;gap:8px;padding:0 14px;height:52px;border-radius:14px;border:1.5px solid var(--sep);background:var(--bg2);font-family:var(--font);font-size:13px;font-weight:600;cursor:pointer;color:var(--ink2);}
.cart-icon-wrap{position:relative;display:flex;}
.cart-icon-svg{width:22px;height:22px;stroke:var(--ink2);}
.cart-badge{position:absolute;top:-6px;right:-8px;background:var(--red);color:#fff;font-size:10px;font-weight:700;border-radius:99px;min-width:16px;height:16px;display:flex;align-items:center;justify-content:center;padding:0 4px;}
.wa-btn{flex:1;display:flex;align-items:center;justify-content:space-between;padding:0 16px;height:52px;border-radius:14px;border:none;background:var(--wa);cursor:pointer;transition:all .18s cubic-bezier(.34,1.56,.64,1);}
.wa-btn:active{transform:scale(.97);}
.wa-left{display:flex;align-items:center;gap:10px;}
.wa-icon{width:22px;height:22px;fill:#fff;flex-shrink:0;}
.wa-copy{display:flex;flex-direction:column;align-items:flex-start;}
.wa-main{font-size:14px;font-weight:700;color:#fff;font-family:var(--font);}
.wa-sub{font-size:10px;color:rgba(255,255,255,.7);}
.wa-pill{background:rgba(0,0,0,.2);color:#fff;font-size:13px;font-weight:700;border-radius:10px;padding:4px 12px;}
</style>
