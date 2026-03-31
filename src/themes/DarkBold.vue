<template>
  <div class="db-root">
    <!-- ── HEADER ── -->
    <header class="db-header">
      <div class="db-header-inner">
        <div class="db-brand">
          <div class="db-logo">
            <img v-if="config?.logoUrl && !logoError" :src="config.logoUrl" :alt="config?.siteName" class="db-logo-img" @error="logoError=true"/>
            <span v-else>{{ config?.logoFallback || '🏪' }}</span>
          </div>
          <div>
            <div class="db-site-name">{{ config?.siteName || 'Catálogo' }}</div>
            <div class="db-tagline">{{ config?.tagline || '' }}</div>
          </div>
        </div>
        <input class="db-search" :value="searchQ" :placeholder="config?.searchPlaceholder || 'Buscar...'"
          @input="$emit('update:searchQ', $event.target.value)" autocomplete="off"/>
        <a v-if="config?.whatsapp" :href="'https://wa.me/'+config.whatsapp" target="_blank" class="db-wa-link">💬 WhatsApp</a>
      </div>
    </header>

    <!-- ── FILTROS ── -->
    <div class="db-filters">
      <button v-for="cat in cats" :key="cat.k"
        :class="['db-filter', activeCat === cat.k ? 'active' : '']"
        @click="$emit('update:activeCat', cat.k); $emit('update:searchQ', '')">
        {{ cat.icon }} {{ cat.l }}
      </button>
    </div>

    <!-- ── SKELETON ── -->
    <div v-if="loading" class="db-grid">
      <div v-for="n in 6" :key="n" class="db-card db-skeleton">
        <div class="db-sk-img"></div>
        <div class="db-sk-line"></div>
        <div class="db-sk-line short"></div>
      </div>
    </div>

    <!-- ── GRID ── -->
    <div v-else class="db-grid">
      <div v-if="!prodsFiltrados.length" class="db-empty">
        <p>Sin resultados para "{{ searchQ }}"</p>
      </div>
      <div v-for="(prod, i) in prodsFiltrados" :key="prod.id"
        :class="['db-card', enCarrito(prod.id) ? 'in-cart' : '']"
        :style="{ animationDelay: Math.min(i*.04,.32)+'s' }"
        @click="$emit('toggle-carrito', prod)">
        <div class="db-card-img">
          <img v-if="prod.imageUrl && !imgErrors[prod.id]" :src="prod.imageUrl" :alt="prod.name"
            loading="lazy" class="db-img" @error="imgErrors[prod.id]=true"/>
          <span v-else class="db-emoji">{{ prod.emoji }}</span>
          <div v-if="prod.badge === 'oferta'" class="db-badge oferta">OFERTA</div>
          <div v-else-if="prod.badge === 'nuevo'" class="db-badge nuevo">NUEVO</div>
          <div v-else-if="prod.badge === 'poco'" class="db-badge poco">STOCK BAJO</div>
        </div>
        <div class="db-card-body">
          <div class="db-prod-name">{{ prod.name }}</div>
          <div class="db-price-row">
            <span class="db-price">{{ fmt(prod.price) }}</span>
            <span v-if="prod.orig" class="db-orig">{{ fmt(prod.orig) }}</span>
          </div>
          <button :class="['db-add', enCarrito(prod.id) ? 'added' : '']"
            @click.stop="$emit('toggle-carrito', prod)">
            {{ enCarrito(prod.id) ? '✓ Agregado' : '+ Agregar' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ── CART BAR ── -->
    <div :class="['db-cart-bar', countCarrito > 0 ? 'visible' : '']">
      <div :class="['db-drawer', drawerOpen ? 'open' : '']">
        <div class="db-drawer-head">
          <span>Pedido ({{ countCarrito }})</span>
          <button @click="$emit('update:drawerOpen', false)">✕</button>
        </div>
        <div class="db-cart-list">
          <div v-for="item in itemsCarrito" :key="item.id" class="db-cart-row">
            <span>{{ item.emoji }} {{ item.name }}</span>
            <div class="db-qty">
              <button @click="$emit('cambiar-qty', item.id, -1)">−</button>
              <span>{{ item.qty }}</span>
              <button @click="$emit('cambiar-qty', item.id, 1)">+</button>
            </div>
            <span>{{ fmt(item.price * item.qty) }}</span>
            <button class="db-del" @click="$emit('eliminar-item', item.id)">✕</button>
          </div>
        </div>
        <div class="db-form">
          <input class="db-input" v-model="nombre" placeholder="Tu nombre"/>
          <select class="db-input" v-model="tipoEnvio">
            <option value="">Tipo de envío</option>
            <option value="retiro">Retiro en sucursal</option>
            <option value="delivery">{{ config?.deliveryLabel || 'Envío a domicilio' }}</option>
          </select>
        </div>
      </div>
      <div class="db-cta">
        <button class="db-toggle" @click="$emit('update:drawerOpen', !drawerOpen)">
          🛒 {{ countCarrito }} — {{ drawerOpen ? 'Ocultar' : 'Ver pedido' }}
        </button>
        <button class="db-send" @click="$emit('enviar-wa', nombre, tipoEnvio)">
          WhatsApp · {{ fmt(totalCarrito) }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
const props = defineProps({
  config:Object, cats:Array, prods:Array, loading:Boolean,
  activeCat:String, searchQ:String, prodsFiltrados:Array,
  itemsCarrito:Array, totalCarrito:Number, countCarrito:Number,
  hayOfertas:Boolean, hayStockBajo:Boolean, drawerOpen:Boolean, fmt:Function,
})
defineEmits(['update:activeCat','update:searchQ','update:drawerOpen',
  'toggle-carrito','cambiar-qty','eliminar-item','enviar-wa'])
const nombre = ref(''); const tipoEnvio = ref('')
const imgErrors = reactive({}); const logoError = ref(false)
const enCarrito = (id) => props.itemsCarrito.some(i => i.id === id)
</script>

<style scoped>
.db-root{--bg:#0A0A0F;--bg2:#13131A;--bg3:#1C1C28;--accent:#6C63FF;--accent2:#FF6584;--text:#F0F0FF;--muted:#8888AA;--green:#00D68F;--red:#FF4757;font-family:'Inter',system-ui,sans-serif;background:var(--bg);color:var(--text);min-height:100vh;}
.db-root *{box-sizing:border-box;}
.db-header{background:var(--bg2);border-bottom:1px solid rgba(108,99,255,.2);position:sticky;top:0;z-index:90;}
.db-header-inner{max-width:1100px;margin:0 auto;padding:14px 16px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;}
.db-brand{display:flex;align-items:center;gap:10px;flex-shrink:0;}
.db-logo{width:40px;height:40px;border-radius:12px;background:var(--accent);display:flex;align-items:center;justify-content:center;font-size:20px;overflow:hidden;}
.db-logo-img{width:100%;height:100%;object-fit:cover;}
.db-site-name{font-size:16px;font-weight:800;letter-spacing:-.02em;}
.db-tagline{font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.1em;}
.db-search{flex:1;min-width:160px;height:38px;background:var(--bg3);border:1px solid rgba(108,99,255,.3);border-radius:10px;padding:0 14px;color:var(--text);font-size:14px;outline:none;}
.db-wa-link{padding:8px 16px;background:var(--accent);color:#fff;border-radius:10px;text-decoration:none;font-weight:700;font-size:13px;white-space:nowrap;}
.db-filters{display:flex;gap:8px;overflow-x:auto;padding:12px 16px;scrollbar-width:none;background:var(--bg2);}
.db-filter{padding:6px 16px;border-radius:99px;border:1px solid rgba(108,99,255,.3);background:transparent;color:var(--muted);font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap;transition:.15s;}
.db-filter.active{background:var(--accent);border-color:var(--accent);color:#fff;}
.db-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:16px;padding-bottom:140px;max-width:1100px;margin:0 auto;}
@media(min-width:560px){.db-grid{grid-template-columns:repeat(3,1fr);}}
@media(min-width:800px){.db-grid{grid-template-columns:repeat(4,1fr);}}
@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
.db-card{background:var(--bg2);border-radius:16px;overflow:hidden;cursor:pointer;border:1px solid rgba(255,255,255,.05);transition:.2s;opacity:0;animation:fadeUp .3s ease forwards;}
.db-card:hover{transform:translateY(-2px);border-color:var(--accent);}
.db-card.in-cart{border-color:var(--green);box-shadow:0 0 0 2px rgba(0,214,143,.15);}
.db-card-img{aspect-ratio:1;background:var(--bg3);display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;}
.db-img{width:100%;height:100%;object-fit:cover;}
.db-emoji{font-size:40px;}
.db-badge{position:absolute;top:8px;left:8px;font-size:9px;font-weight:800;letter-spacing:.08em;padding:3px 8px;border-radius:6px;}
.db-badge.oferta{background:var(--red);color:#fff;}
.db-badge.nuevo{background:var(--accent);color:#fff;}
.db-badge.poco{background:#FF9F43;color:#fff;}
.db-card-body{padding:12px;}
.db-prod-name{font-size:13px;font-weight:700;line-height:1.3;margin-bottom:8px;}
.db-price-row{display:flex;align-items:baseline;gap:8px;margin-bottom:10px;}
.db-price{font-size:18px;font-weight:800;color:var(--accent);}
.db-orig{font-size:12px;color:var(--muted);text-decoration:line-through;}
.db-add{width:100%;height:32px;border-radius:8px;border:none;font-size:12px;font-weight:700;cursor:pointer;transition:.15s;background:var(--accent);color:#fff;}
.db-add.added{background:rgba(0,214,143,.15);color:var(--green);border:1px solid var(--green);}
.db-skeleton{pointer-events:none;}
.db-sk-img{aspect-ratio:1;background:var(--bg3);}
.db-sk-line{height:12px;border-radius:6px;background:var(--bg3);margin:8px 12px;}
.db-sk-line.short{width:50%;}
.db-empty{grid-column:1/-1;text-align:center;padding:60px;color:var(--muted);}
.db-cart-bar{position:fixed;bottom:0;left:0;right:0;z-index:100;transform:translateY(100%);transition:.35s cubic-bezier(.34,1.56,.64,1);}
.db-cart-bar.visible{transform:none;}
.db-drawer{background:var(--bg2);border-radius:20px 20px 0 0;max-height:0;overflow:hidden;transition:max-height .38s;}
.db-drawer.open{max-height:60vh;overflow-y:auto;}
.db-drawer-head{display:flex;justify-content:space-between;align-items:center;padding:16px;font-weight:700;border-bottom:1px solid rgba(255,255,255,.06);}
.db-drawer-head button{background:rgba(255,255,255,.08);border:none;color:var(--text);width:28px;height:28px;border-radius:50%;cursor:pointer;}
.db-cart-list{padding:12px 16px;display:flex;flex-direction:column;gap:8px;}
.db-cart-row{display:flex;align-items:center;gap:10px;font-size:13px;}
.db-cart-row>span:first-child{flex:1;}
.db-qty{display:flex;align-items:center;gap:8px;}
.db-qty button{background:rgba(255,255,255,.08);border:none;color:var(--text);width:24px;height:24px;border-radius:50%;cursor:pointer;}
.db-del{background:rgba(255,71,87,.15);border:none;color:var(--red);width:24px;height:24px;border-radius:50%;cursor:pointer;}
.db-form{padding:12px 16px;display:flex;gap:8px;}
.db-input{flex:1;height:38px;background:var(--bg3);border:1px solid rgba(255,255,255,.1);border-radius:10px;padding:0 12px;color:var(--text);font-size:13px;outline:none;}
.db-cta{display:flex;gap:10px;padding:10px 16px 20px;background:var(--bg2);border-top:1px solid rgba(255,255,255,.06);}
.db-toggle{padding:0 16px;height:48px;border-radius:12px;background:var(--bg3);border:1px solid rgba(108,99,255,.3);color:var(--text);font-size:13px;font-weight:700;cursor:pointer;}
.db-send{flex:1;height:48px;border-radius:12px;background:var(--accent);border:none;color:#fff;font-size:14px;font-weight:800;cursor:pointer;}
</style>
