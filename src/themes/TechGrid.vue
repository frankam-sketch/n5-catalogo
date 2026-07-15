<template>
  <div class="tg-root">
    <header class="tg-header">
      <div class="tg-brandline">
        <div class="tg-brand">
          <div class="tg-logo"><img v-if="config?.logoUrl && !logoError" :src="config.logoUrl" :alt="config?.siteName" @error="logoError=true"/><span v-else>{{ config?.logoFallback || 'N5' }}</span></div>
          <div><small>ONLINE CATALOG / LIVE</small><h1>{{ config?.siteName || 'N5 Tech' }}</h1></div>
        </div>
        <p>{{ config?.tagline || 'Productos y soluciones para trabajar mejor.' }}</p>
        <a v-if="config?.whatsapp" :href="'https://wa.me/'+config.whatsapp" target="_blank" rel="noopener">OPEN CHAT ↗</a>
      </div>
      <div class="tg-searchrow">
        <label><span>SEARCH_</span><input :value="searchQ" :placeholder="config?.searchPlaceholder || 'name, category, keyword'" @input="$emit('update:searchQ',$event.target.value)"/></label>
        <div class="tg-status"><i></i><span>{{ prodsFiltrados?.length || 0 }} ITEMS ONLINE</span></div>
      </div>
      <nav class="tg-tabs">
        <button v-for="cat in cats" :key="cat.k" :class="{active:activeCat===cat.k}" @click="$emit('update:activeCat',cat.k);$emit('update:searchQ','')">{{ cat.icon }} {{ cat.l }}</button>
      </nav>
    </header>

    <main class="tg-main">
      <section v-if="loading" class="tg-grid"><article v-for="n in 10" :key="n" class="tg-card tg-sk"><div></div><i></i><i></i></article></section>
      <div v-else-if="!prodsFiltrados?.length" class="tg-empty"><span>404</span><b>NO_MATCHING_PRODUCTS</b></div>
      <section v-else class="tg-grid">
        <article v-for="prod in prodsFiltrados" :key="prod.id" :class="['tg-card',{selected:enCarrito(prod.id)}]">
          <div class="tg-media" @click="$emit('toggle-carrito',prod)">
            <img v-if="prod.imageUrl && !imgErrors[prod.id]" :src="prod.imageUrl" :alt="prod.name" loading="lazy" @error="imgErrors[prod.id]=true"/>
            <span v-else>{{ prod.emoji || '⌘' }}</span>
            <b v-if="prod.badge">{{ prod.badge === 'oferta' ? 'SALE' : prod.badge === 'nuevo' ? 'NEW' : 'LOW_STOCK' }}</b>
          </div>
          <div class="tg-body">
            <small>{{ prod.cat }} / {{ prod.id }}</small>
            <h2>{{ prod.name }}</h2>
            <p>{{ prod.desc }}</p>
            <div class="tg-bottom">
              <div><strong>{{ fmt(prod.price) }}</strong><del v-if="prod.orig">{{ fmt(prod.orig) }}</del></div>
              <button @click="$emit('toggle-carrito',prod)">{{ enCarrito(prod.id) ? '✓' : '+' }}</button>
            </div>
          </div>
        </article>
      </section>
    </main>

    <div :class="['tg-cart',{visible:countCarrito>0}]">
      <div :class="['tg-drawer',{open:drawerOpen}]">
        <header><span>ORDER_BUFFER</span><button @click="$emit('update:drawerOpen',false)">[CLOSE]</button></header>
        <div class="tg-items">
          <div v-for="item in itemsCarrito" :key="item.id">
            <span>{{ item.name }}</span>
            <div><button @click="$emit('cambiar-qty',item.id,-1)">−</button><b>{{ item.qty }}</b><button @click="$emit('cambiar-qty',item.id,1)">+</button></div>
            <strong>{{ fmt(item.price*item.qty) }}</strong>
            <button @click="$emit('eliminar-item',item.id)">×</button>
          </div>
        </div>
        <div class="tg-fields">
          <input v-model="nombre" placeholder="CLIENT_NAME"/>
          <select v-model="tipoEnvio"><option value="">DELIVERY_MODE</option><option value="retiro">PICKUP</option><option value="delivery">{{ config?.deliveryLabel || 'DELIVERY' }}</option></select>
        </div>
      </div>
      <div class="tg-bar">
        <button @click="$emit('update:drawerOpen',!drawerOpen)"><span>{{ countCarrito }} ITEMS</span><strong>{{ fmt(totalCarrito) }}</strong></button>
        <button @click="$emit('enviar-wa',nombre,tipoEnvio)">SEND_TO_WHATSAPP ↗</button>
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
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap');
.tg-root{--bg:#070b17;--panel:#0d1427;--panel2:#111b32;--line:#213050;--ink:#edf4ff;--muted:#8192b3;--cyan:#31ddff;--lime:#b5ff58;min-height:100vh;background:linear-gradient(rgba(49,221,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(49,221,255,.025) 1px,transparent 1px),var(--bg);background-size:36px 36px;color:var(--ink);font-family:'Space Grotesk',sans-serif;padding-bottom:125px}.tg-root *{box-sizing:border-box}.tg-header{background:rgba(7,11,23,.96);border-bottom:1px solid var(--line);position:sticky;top:0;z-index:60;backdrop-filter:blur(16px)}.tg-brandline,.tg-searchrow,.tg-tabs,.tg-main{width:min(1200px,calc(100% - 30px));margin:auto}.tg-brandline{display:grid;grid-template-columns:auto 1fr auto;gap:24px;align-items:center;padding:16px 0}.tg-brand{display:flex;align-items:center;gap:11px}.tg-logo{width:47px;height:47px;border:1px solid var(--cyan);background:rgba(49,221,255,.08);display:grid;place-items:center;color:var(--cyan);font:600 15px 'IBM Plex Mono';overflow:hidden;clip-path:polygon(0 0,88% 0,100% 12%,100% 100%,12% 100%,0 88%)}.tg-logo img{width:100%;height:100%;object-fit:cover}.tg-brand small{font:500 7px 'IBM Plex Mono';letter-spacing:.14em;color:var(--cyan)}.tg-brand h1{font-size:18px;margin:3px 0 0;letter-spacing:-.03em}.tg-brandline>p{font-size:10px;color:var(--muted);margin:0}.tg-brandline>a{font:600 9px 'IBM Plex Mono';color:var(--bg);background:var(--lime);padding:10px 13px;text-decoration:none}.tg-searchrow{display:grid;grid-template-columns:1fr auto;gap:16px;align-items:center}.tg-searchrow label{height:40px;border:1px solid var(--line);display:flex;align-items:center;background:var(--panel)}.tg-searchrow label span{padding:0 11px;font:500 9px 'IBM Plex Mono';color:var(--cyan)}.tg-searchrow input{height:100%;flex:1;border:0;background:transparent;outline:0;color:var(--ink);font:500 10px 'IBM Plex Mono'}.tg-status{display:flex;align-items:center;gap:7px;color:var(--muted);font:500 8px 'IBM Plex Mono'}.tg-status i{width:7px;height:7px;border-radius:50%;background:var(--lime);box-shadow:0 0 10px var(--lime)}.tg-tabs{display:flex;gap:6px;overflow:auto;scrollbar-width:none;padding:10px 0 12px}.tg-tabs button{height:30px;border:1px solid var(--line);background:transparent;color:var(--muted);padding:0 10px;font:500 8px 'IBM Plex Mono';white-space:nowrap;cursor:pointer}.tg-tabs button.active{border-color:var(--cyan);color:var(--cyan);background:rgba(49,221,255,.08)}
.tg-main{padding-top:16px}.tg-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.tg-card{background:linear-gradient(145deg,var(--panel),#0a1121);border:1px solid var(--line);overflow:hidden;transition:.18s}.tg-card:hover{border-color:#36537f;transform:translateY(-2px)}.tg-card.selected{border-color:var(--lime);box-shadow:inset 0 0 0 1px var(--lime)}.tg-media{aspect-ratio:1.35;background:var(--panel2);display:grid;place-items:center;position:relative;overflow:hidden;cursor:pointer}.tg-media img{width:100%;height:100%;object-fit:cover}.tg-media>span{font:600 40px 'IBM Plex Mono';color:var(--cyan)}.tg-media b{position:absolute;top:7px;left:7px;background:var(--cyan);color:var(--bg);padding:4px 6px;font:600 7px 'IBM Plex Mono'}.tg-body{padding:11px}.tg-body small{font:500 6px 'IBM Plex Mono';color:#607193;text-transform:uppercase}.tg-body h2{font-size:13px;line-height:1.18;margin:5px 0;letter-spacing:-.02em}.tg-body>p{font:400 8px/1.5 'IBM Plex Mono';color:var(--muted);margin:0 0 9px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.tg-bottom{display:flex;justify-content:space-between;align-items:end}.tg-bottom>div{display:grid}.tg-bottom strong{font-size:16px;color:var(--lime)}.tg-bottom del{font:400 7px 'IBM Plex Mono';color:#62708a}.tg-bottom button{width:33px;height:33px;border:1px solid var(--cyan);background:transparent;color:var(--cyan);font-size:18px;cursor:pointer}.tg-card.selected .tg-bottom button{background:var(--lime);border-color:var(--lime);color:var(--bg)}.tg-empty{height:330px;border:1px dashed var(--line);display:grid;place-content:center;text-align:center}.tg-empty span{font:600 60px 'IBM Plex Mono';color:var(--cyan)}.tg-empty b{font:500 9px 'IBM Plex Mono';color:var(--muted)}.tg-sk div,.tg-sk i{background:linear-gradient(90deg,#0e172a,#172440,#0e172a);background-size:200%;animation:tgsh 1.3s infinite}.tg-sk>div{aspect-ratio:1.35}.tg-sk i{display:block;height:10px;margin:11px}.tg-sk i:last-child{width:45%}@keyframes tgsh{to{background-position:-200%}}
.tg-cart{position:fixed;left:50%;bottom:12px;transform:translate(-50%,150%);width:min(800px,calc(100% - 20px));z-index:100;transition:.3s}.tg-cart.visible{transform:translate(-50%,0)}.tg-bar{display:grid;grid-template-columns:1fr 1.1fr;border:1px solid var(--cyan);background:var(--bg);box-shadow:0 0 28px rgba(49,221,255,.15)}.tg-bar>button{height:52px;border:0;font:600 9px 'IBM Plex Mono';cursor:pointer}.tg-bar>button:first-child{background:var(--panel);color:var(--ink);display:flex;justify-content:space-between;align-items:center;padding:0 15px}.tg-bar>button:last-child{background:var(--cyan);color:var(--bg)}.tg-drawer{position:absolute;left:0;right:0;bottom:53px;background:#0b1223;border:1px solid var(--cyan);border-bottom:0;padding:14px;opacity:0;transform:translateY(10px);pointer-events:none;transition:.2s;max-height:65vh;overflow:auto}.tg-drawer.open{opacity:1;transform:none;pointer-events:auto}.tg-drawer header{display:flex;justify-content:space-between;border-bottom:1px solid var(--line);padding-bottom:9px;color:var(--cyan);font:500 8px 'IBM Plex Mono'}.tg-drawer header button,.tg-items button{border:0;background:transparent;color:var(--muted);font:500 8px 'IBM Plex Mono';cursor:pointer}.tg-items>div{display:grid;grid-template-columns:1fr auto auto auto;gap:10px;align-items:center;padding:10px 0;border-bottom:1px solid var(--line);font:400 8px 'IBM Plex Mono'}.tg-items>div>div{display:flex;border:1px solid var(--line)}.tg-items>div>div button{width:28px;height:28px;background:#101a30}.tg-items>div>div b{width:25px;display:grid;place-items:center}.tg-fields{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:12px}.tg-fields input,.tg-fields select{height:39px;border:1px solid var(--line);background:#0d1629;color:var(--ink);padding:0 9px;font:500 8px 'IBM Plex Mono'}
@media(min-width:680px){.tg-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}@media(min-width:980px){.tg-grid{grid-template-columns:repeat(5,minmax(0,1fr))}}@media(max-width:700px){.tg-brandline{grid-template-columns:1fr auto}.tg-brandline>p{display:none}.tg-searchrow{grid-template-columns:1fr}.tg-status{display:none}.tg-fields{grid-template-columns:1fr}.tg-items>div{grid-template-columns:1fr auto auto}.tg-items>div>strong{display:none}}@media(max-width:420px){.tg-brandline,.tg-searchrow,.tg-tabs,.tg-main{width:calc(100% - 18px)}.tg-brandline>a{display:none}.tg-grid{gap:7px}.tg-body{padding:9px}.tg-body>p{display:none}.tg-body h2{font-size:11px}.tg-bottom strong{font-size:14px}.tg-bar{grid-template-columns:.8fr 1.2fr}}
</style>
