<template>
  <div class="mn-root">
    <header class="mn-header">
      <div class="mn-header-inner">
        <div class="mn-brand">
          <div class="mn-logo">
            <img v-if="config?.logoUrl && !logoError" :src="config.logoUrl" :alt="config?.siteName" class="mn-logo-img" @error="logoError=true"/>
            <span v-else class="mn-logo-emoji">{{ config?.logoFallback || '🏪' }}</span>
          </div>
          <div class="mn-brand-text">
            <div class="mn-site-name">{{ config?.siteName }}</div>
            <div class="mn-tagline">{{ config?.tagline }}</div>
          </div>
        </div>
        <div class="mn-search-wrap">
          <svg viewBox="0 0 24 24" class="mn-search-icon"><path d="M10.5 2a8.5 8.5 0 105.963 14.477l4.28 4.28a1 1 0 001.414-1.414l-4.28-4.28A8.5 8.5 0 0010.5 2zm-6.5 8.5a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0z"/></svg>
          <input class="mn-search" :value="searchQ" :placeholder="config?.searchPlaceholder || 'Buscar...'"
            @input="$emit('update:searchQ', $event.target.value)" autocomplete="off"/>
        </div>
        <a v-if="config?.whatsapp" :href="'https://wa.me/'+config.whatsapp" target="_blank" class="mn-wa">WhatsApp</a>
      </div>
      <nav class="mn-nav">
        <button v-for="cat in cats" :key="cat.k"
          :class="['mn-nav-btn', activeCat===cat.k ? 'active':'']"
          @click="$emit('update:activeCat', cat.k); $emit('update:searchQ','')">
          {{ cat.l }}
        </button>
      </nav>
    </header>

    <main class="mn-main">
      <div v-if="loading" class="mn-grid">
        <div v-for="n in 8" :key="n" class="mn-card mn-sk">
          <div class="mn-sk-img"></div>
          <div class="mn-sk-line"></div>
          <div class="mn-sk-line mn-sk-short"></div>
        </div>
      </div>
      <div v-else-if="!prodsFiltrados.length" class="mn-empty">No hay productos para mostrar</div>
      <div v-else class="mn-grid">
        <div v-for="(prod,i) in prodsFiltrados" :key="prod.id"
          :class="['mn-card', enCarrito(prod.id)?'in-cart':'']"
          :style="{animationDelay:Math.min(i*.04,.32)+'s'}"
          @click="$emit('toggle-carrito', prod)">
          <div class="mn-card-img">
            <img v-if="prod.imageUrl && !imgErrors[prod.id]" :src="prod.imageUrl" :alt="prod.name"
              loading="lazy" class="mn-img" @error="imgErrors[prod.id]=true"/>
            <span v-else class="mn-emoji">{{ prod.emoji }}</span>
            <div v-if="prod.badge==='oferta'" class="mn-badge">OFERTA</div>
            <div v-if="prod.badge==='nuevo'" class="mn-badge mn-badge-new">NUEVO</div>
            <div class="mn-check" v-if="enCarrito(prod.id)">✓</div>
          </div>
          <div class="mn-card-body">
            <p class="mn-cat">{{ prod.cat }}</p>
            <p class="mn-name">{{ prod.name }}</p>
            <div class="mn-prices">
              <span class="mn-price">{{ fmt(prod.price) }}</span>
              <span v-if="prod.orig" class="mn-orig">{{ fmt(prod.orig) }}</span>
            </div>
            <p v-if="prod.stock<=3 && prod.stock>0" class="mn-stock">Solo {{ prod.stock }} disponibles</p>
            <button :class="['mn-add', enCarrito(prod.id)?'mn-added':'']"
              @click.stop="$emit('toggle-carrito', prod)">
              {{ enCarrito(prod.id) ? 'En tu selección' : 'Seleccionar' }}
            </button>
          </div>
        </div>
      </div>
    </main>

    <div :class="['mn-bar', countCarrito>0?'visible':'']">
      <div :class="['mn-drawer', drawerOpen?'open':'']">
        <div class="mn-drawer-head">
          <span>Tu selección ({{ countCarrito }})</span>
          <button @click="$emit('update:drawerOpen', false)">✕</button>
        </div>
        <div style="padding:0 20px;">
          <div v-for="item in itemsCarrito" :key="item.id" class="mn-row">
            <span class="mn-row-name">{{ item.name }}</span>
            <div class="mn-row-qty">
              <button @click="$emit('cambiar-qty', item.id,-1)">−</button>
              <span>{{ item.qty }}</span>
              <button @click="$emit('cambiar-qty', item.id,1)">+</button>
            </div>
            <span class="mn-row-price">{{ fmt(item.price*item.qty) }}</span>
            <button class="mn-row-del" @click="$emit('eliminar-item', item.id)">✕</button>
          </div>
        </div>
        <div class="mn-form">
          <input class="mn-input" v-model="nombre" placeholder="Tu nombre"/>
          <select class="mn-input" v-model="tipoEnvio">
            <option value="">Tipo de envío</option>
            <option value="retiro">Retiro en tienda</option>
            <option value="delivery">{{ config?.deliveryLabel || 'Envío a domicilio' }}</option>
          </select>
          <div class="mn-total">Total: <strong>{{ fmt(totalCarrito) }}</strong></div>
        </div>
      </div>
      <div class="mn-cta">
        <button class="mn-toggle" @click="$emit('update:drawerOpen', !drawerOpen)">
          {{ countCarrito }} artículo{{ countCarrito!==1?'s':'' }} · {{ drawerOpen?'Ocultar':'Ver pedido' }}
        </button>
        <button class="mn-send" @click="$emit('enviar-wa', nombre, tipoEnvio)">
          Pedir por WhatsApp — {{ fmt(totalCarrito) }}
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
const nombre=ref(''); const tipoEnvio=ref('')
const imgErrors=reactive({}); const logoError=ref(false)
const enCarrito=(id)=>props.itemsCarrito.some(i=>i.id===id)
</script>

<style scoped>
.mn-root{--white:#FFFFFF;--off:#F9F9F7;--border:#E8E8E4;--ink:#1A1A1A;--muted:#888;--accent:#1A1A1A;--green:#2D9B6F;--red:#D4323E;font-family:'Georgia',serif;background:var(--white);color:var(--ink);min-height:100vh;}
.mn-root *{box-sizing:border-box;}
.mn-header{border-bottom:1px solid var(--border);position:sticky;top:0;z-index:90;background:var(--white);}
.mn-header-inner{max-width:1100px;margin:0 auto;padding:16px 24px;display:flex;align-items:center;gap:16px;}
.mn-brand{display:flex;align-items:center;gap:12px;flex-shrink:0;}
.mn-logo{width:44px;height:44px;border:1px solid var(--border);border-radius:4px;display:flex;align-items:center;justify-content:center;overflow:hidden;}
.mn-logo-img{width:100%;height:100%;object-fit:cover;}
.mn-logo-emoji{font-size:22px;}
.mn-site-name{font-size:18px;font-weight:700;letter-spacing:-.02em;}
.mn-tagline{font-size:11px;color:var(--muted);letter-spacing:.04em;text-transform:uppercase;}
.mn-search-wrap{flex:1;display:flex;align-items:center;gap:8px;border:1px solid var(--border);border-radius:4px;padding:0 12px;height:40px;}
.mn-search-icon{width:14px;height:14px;fill:var(--muted);flex-shrink:0;}
.mn-search{flex:1;border:none;outline:none;font-size:14px;font-family:inherit;color:var(--ink);}
.mn-wa{padding:8px 20px;border:1px solid var(--ink);border-radius:4px;text-decoration:none;font-size:13px;font-weight:700;color:var(--ink);white-space:nowrap;font-family:'Inter',sans-serif;}
.mn-nav{max-width:1100px;margin:0 auto;padding:0 24px;display:flex;gap:0;overflow-x:auto;scrollbar-width:none;border-top:1px solid var(--border);}
.mn-nav-btn{padding:12px 20px;border:none;border-bottom:2px solid transparent;background:none;font-family:inherit;font-size:13px;font-weight:600;color:var(--muted);cursor:pointer;white-space:nowrap;letter-spacing:.04em;text-transform:uppercase;}
.mn-nav-btn.active{color:var(--ink);border-bottom-color:var(--ink);}
.mn-main{max-width:1100px;margin:0 auto;padding:32px 24px 160px;}
.mn-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:1px;background:var(--border);}
@media(min-width:560px){.mn-grid{grid-template-columns:repeat(3,1fr);}}
@media(min-width:800px){.mn-grid{grid-template-columns:repeat(4,1fr);}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
.mn-card{background:var(--white);cursor:pointer;transition:.15s;opacity:0;animation:fadeIn .3s ease forwards;}
.mn-card:hover{background:var(--off);}
.mn-card.in-cart{background:#F0F7F4;}
.mn-card-img{aspect-ratio:1;background:var(--off);display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;}
.mn-img{width:100%;height:100%;object-fit:cover;}
.mn-emoji{font-size:44px;}
.mn-badge{position:absolute;top:12px;left:12px;font-size:9px;font-weight:800;letter-spacing:.1em;padding:3px 8px;background:var(--red);color:#fff;}
.mn-badge-new{background:var(--ink);}
.mn-check{position:absolute;top:12px;right:12px;width:24px;height:24px;background:var(--green);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:13px;font-weight:700;}
.mn-card-body{padding:16px;}
.mn-cat{font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-bottom:4px;font-family:'Inter',sans-serif;}
.mn-name{font-size:14px;line-height:1.4;margin-bottom:12px;}
.mn-prices{display:flex;align-items:baseline;gap:8px;margin-bottom:8px;}
.mn-price{font-size:18px;font-weight:700;font-family:'Inter',sans-serif;}
.mn-orig{font-size:13px;color:var(--muted);text-decoration:line-through;font-family:'Inter',sans-serif;}
.mn-stock{font-size:11px;color:var(--red);margin-bottom:8px;font-family:'Inter',sans-serif;}
.mn-add{width:100%;padding:10px;border:1px solid var(--ink);background:none;font-family:'Inter',sans-serif;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;transition:.15s;}
.mn-add:hover{background:var(--ink);color:#fff;}
.mn-added{background:var(--green) !important;border-color:var(--green) !important;color:#fff !important;}
.mn-empty{text-align:center;padding:80px;color:var(--muted);}
.mn-sk{pointer-events:none;}
.mn-sk-img{aspect-ratio:1;background:#F0F0EE;}
.mn-sk-line{height:14px;background:#F0F0EE;margin:12px 16px 0;}
.mn-sk-short{width:50%;}
.mn-bar{position:fixed;bottom:0;left:0;right:0;z-index:100;transform:translateY(100%);transition:.3s;}
.mn-bar.visible{transform:none;}
.mn-drawer{background:var(--white);border-top:1px solid var(--border);max-height:0;overflow:hidden;transition:max-height .35s;}
.mn-drawer.open{max-height:55vh;overflow-y:auto;}
.mn-drawer-head{display:flex;justify-content:space-between;align-items:center;padding:20px 24px 12px;border-bottom:1px solid var(--border);font-size:15px;font-weight:700;}
.mn-drawer-head button{background:none;border:none;cursor:pointer;font-size:18px;color:var(--muted);}
.mn-row{display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--border);font-size:13px;font-family:'Inter',sans-serif;}
.mn-row-name{flex:1;}
.mn-row-qty{display:flex;align-items:center;gap:10px;}
.mn-row-qty button{background:none;border:1px solid var(--border);width:24px;height:24px;cursor:pointer;font-size:16px;}
.mn-row-price{font-weight:700;}
.mn-row-del{background:none;border:none;color:var(--muted);cursor:pointer;font-size:16px;}
.mn-form{padding:16px 24px 12px;display:flex;gap:10px;flex-wrap:wrap;}
.mn-input{flex:1;min-width:140px;height:40px;border:1px solid var(--border);padding:0 12px;font-family:'Inter',sans-serif;font-size:14px;outline:none;}
.mn-total{width:100%;font-size:15px;font-family:'Inter',sans-serif;padding:8px 0;}
.mn-cta{display:flex;gap:12px;padding:16px 24px 24px;background:var(--white);border-top:1px solid var(--border);}
.mn-toggle{padding:0 20px;height:48px;border:1px solid var(--border);background:none;font-family:'Inter',sans-serif;font-size:13px;font-weight:600;cursor:pointer;}
.mn-send{flex:1;height:48px;background:var(--ink);border:none;color:#fff;font-family:'Inter',sans-serif;font-size:14px;font-weight:700;cursor:pointer;letter-spacing:.02em;}
</style>
