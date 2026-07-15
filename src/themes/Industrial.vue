<template>
  <div class="in-root">
    <header class="in-header">
      <div class="in-header-main">
        <div class="in-identity">
          <div class="in-logo">
            <img v-if="config?.logoUrl && !logoError" :src="config.logoUrl" :alt="config?.siteName" @error="logoError=true"/>
            <span v-else>{{ config?.logoFallback || 'N5' }}</span>
          </div>
          <div><small>CATÁLOGO / DISPONIBILIDAD</small><h1>{{ config?.siteName || 'Suministros' }}</h1></div>
        </div>
        <p>{{ config?.tagline || 'Productos claros, precio directo y atención inmediata.' }}</p>
        <a v-if="config?.whatsapp" :href="'https://wa.me/'+config.whatsapp" target="_blank" rel="noopener">COTIZAR →</a>
      </div>

      <div class="in-tool-row">
        <label><b>BUSCAR</b><input :value="searchQ" :placeholder="config?.searchPlaceholder || 'Producto, modelo o uso'" @input="$emit('update:searchQ',$event.target.value)"/></label>
        <nav>
          <button v-for="cat in cats" :key="cat.k" :class="{active:activeCat===cat.k}" @click="$emit('update:activeCat',cat.k);$emit('update:searchQ','')">
            <span>{{ cat.icon }}</span>{{ cat.l }}
          </button>
        </nav>
      </div>
    </header>

    <main class="in-main">
      <div class="in-meta"><span>INVENTARIO EN LÍNEA</span><b>{{ prodsFiltrados?.length || 0 }} RESULTADOS</b></div>

      <section v-if="loading" class="in-grid">
        <article v-for="n in 8" :key="n" class="in-card in-sk"><div></div><i></i><i></i></article>
      </section>

      <div v-else-if="!prodsFiltrados?.length" class="in-empty">SIN RESULTADOS / CAMBIA EL FILTRO</div>

      <section v-else class="in-grid">
        <article v-for="(prod,i) in prodsFiltrados" :key="prod.id" :class="['in-card',{selected:enCarrito(prod.id)}]">
          <div class="in-num">{{ String(i+1).padStart(2,'0') }}</div>
          <div class="in-media" @click="$emit('toggle-carrito',prod)">
            <img v-if="prod.imageUrl && !imgErrors[prod.id]" :src="prod.imageUrl" :alt="prod.name" loading="lazy" @error="imgErrors[prod.id]=true"/>
            <span v-else>{{ prod.emoji || '⬡' }}</span>
            <b v-if="prod.badge">{{ prod.badge === 'oferta' ? 'OFERTA' : prod.badge === 'nuevo' ? 'NUEVO' : 'STOCK BAJO' }}</b>
          </div>
          <div class="in-body">
            <small>{{ prod.cat }}</small>
            <h2>{{ prod.name }}</h2>
            <p>{{ prod.desc }}</p>
            <div class="in-price"><strong>{{ fmt(prod.price) }}</strong><del v-if="prod.orig">{{ fmt(prod.orig) }}</del></div>
            <button @click="$emit('toggle-carrito',prod)">{{ enCarrito(prod.id) ? '✓ EN PEDIDO' : '+ AGREGAR' }}</button>
          </div>
        </article>
      </section>
    </main>

    <div :class="['in-order',{visible:countCarrito>0}]">
      <div :class="['in-drawer',{open:drawerOpen}]">
        <header><b>ORDEN DE COMPRA</b><button @click="$emit('update:drawerOpen',false)">CERRAR</button></header>
        <div class="in-items">
          <div v-for="item in itemsCarrito" :key="item.id">
            <span>{{ item.name }}</span>
            <div><button @click="$emit('cambiar-qty',item.id,-1)">−</button><b>{{ item.qty }}</b><button @click="$emit('cambiar-qty',item.id,1)">+</button></div>
            <strong>{{ fmt(item.price*item.qty) }}</strong>
            <button @click="$emit('eliminar-item',item.id)">×</button>
          </div>
        </div>
        <div class="in-fields">
          <input v-model="nombre" placeholder="NOMBRE / EMPRESA"/>
          <select v-model="tipoEnvio"><option value="">ENTREGA</option><option value="retiro">RETIRO EN SUCURSAL</option><option value="delivery">{{ (config?.deliveryLabel || 'ENVÍO A DOMICILIO').toUpperCase() }}</option></select>
        </div>
      </div>
      <div class="in-bar">
        <button @click="$emit('update:drawerOpen',!drawerOpen)"><span>{{ countCarrito }} UNIDADES</span><b>{{ fmt(totalCarrito) }}</b></button>
        <button @click="$emit('enviar-wa',nombre,tipoEnvio)">ENVIAR POR WHATSAPP →</button>
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
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=Oswald:wght@500;600;700&display=swap');
.in-root{--bg:#e8e8e2;--ink:#11120f;--panel:#f5f5ef;--rule:#20221d;--accent:#d8ff29;min-height:100vh;background:repeating-linear-gradient(90deg,rgba(0,0,0,.025) 0,rgba(0,0,0,.025) 1px,transparent 1px,transparent 80px),var(--bg);color:var(--ink);font-family:'IBM Plex Sans',sans-serif;padding-bottom:130px}.in-root *{box-sizing:border-box}.in-header{background:#11120f;color:#fff;border-bottom:6px solid var(--accent)}.in-header-main,.in-tool-row,.in-main{width:min(1220px,calc(100% - 32px));margin:auto}.in-header-main{min-height:105px;display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:30px}.in-identity{display:flex;gap:12px;align-items:center}.in-logo{width:56px;height:56px;border:2px solid var(--accent);display:grid;place-items:center;color:var(--accent);font:700 20px 'Oswald';overflow:hidden}.in-logo img{width:100%;height:100%;object-fit:cover}.in-identity small{font-size:8px;color:#aeb0aa;letter-spacing:.15em}.in-identity h1{font:700 27px/1 'Oswald';margin:4px 0 0;text-transform:uppercase;letter-spacing:.02em}.in-header-main>p{font-size:11px;color:#b6b7b2;max-width:460px;margin:0}.in-header-main>a{background:var(--accent);color:#11120f;padding:12px 16px;text-decoration:none;font:700 11px 'IBM Plex Sans'}.in-tool-row{display:grid;grid-template-columns:320px 1fr;gap:20px;padding-bottom:15px}.in-tool-row label{height:42px;display:grid;grid-template-columns:auto 1fr;align-items:center;border:1px solid #4b4d46}.in-tool-row label b{height:100%;display:grid;place-items:center;padding:0 12px;background:#2b2d27;color:var(--accent);font-size:9px}.in-tool-row input{height:100%;border:0;background:transparent;color:#fff;outline:0;padding:0 12px;font:500 11px 'IBM Plex Sans'}.in-tool-row nav{display:flex;gap:6px;overflow:auto;scrollbar-width:none}.in-tool-row nav button{border:1px solid #4a4c45;background:transparent;color:#b8bab4;padding:0 13px;white-space:nowrap;font:600 10px 'IBM Plex Sans';cursor:pointer}.in-tool-row nav button.active{background:var(--accent);color:#11120f;border-color:var(--accent)}.in-tool-row nav span{margin-right:5px}
.in-main{padding-top:20px}.in-meta{height:32px;border-top:2px solid var(--rule);border-bottom:1px solid var(--rule);display:flex;justify-content:space-between;align-items:center;font-size:8px;letter-spacing:.14em;margin-bottom:14px}.in-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.in-card{position:relative;background:var(--panel);border:1px solid var(--rule);display:grid;grid-template-columns:44% 56%;min-height:190px}.in-card.selected{box-shadow:inset 0 0 0 4px var(--accent)}.in-num{position:absolute;right:6px;top:5px;font:700 10px 'Oswald';z-index:2}.in-media{min-height:100%;background:#d7d8d0;border-right:1px solid var(--rule);display:grid;place-items:center;position:relative;overflow:hidden;cursor:pointer}.in-media img{width:100%;height:100%;object-fit:cover}.in-media>span{font-size:42px}.in-media b{position:absolute;left:0;bottom:0;background:var(--accent);padding:5px 7px;font:700 8px 'IBM Plex Sans'}.in-body{padding:18px 14px 12px;display:flex;flex-direction:column}.in-body small{font-size:7px;letter-spacing:.16em;text-transform:uppercase;color:#6c6f66}.in-body h2{font:700 20px/1.05 'Oswald';text-transform:uppercase;margin:5px 0 7px}.in-body p{font-size:10px;line-height:1.45;color:#62655d;margin:0 0 12px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.in-price{display:flex;align-items:baseline;gap:7px;margin-top:auto}.in-price strong{font:700 21px 'Oswald'}.in-price del{font-size:9px;color:#777}.in-body>button{height:34px;margin-top:10px;border:1px solid var(--rule);background:#11120f;color:#fff;font:700 9px 'IBM Plex Sans';cursor:pointer}.in-card.selected .in-body>button{background:var(--accent);color:#11120f}
.in-empty{height:330px;border:1px solid var(--rule);display:grid;place-items:center;font:700 26px 'Oswald'}.in-sk div,.in-sk i{background:linear-gradient(90deg,#cfd0c8,#e2e3dc,#cfd0c8);background-size:200%;animation:insk 1.3s infinite}.in-sk>div{height:100%}.in-sk i{height:12px;margin:20px;display:block}.in-sk i:last-child{width:40%}@keyframes insk{to{background-position:-200%}}
.in-order{position:fixed;left:50%;bottom:14px;transform:translate(-50%,150%);width:min(850px,calc(100% - 24px));z-index:100;transition:.3s}.in-order.visible{transform:translate(-50%,0)}.in-bar{display:grid;grid-template-columns:1fr 1fr;border:2px solid #11120f}.in-bar>button{height:56px;border:0;font:700 10px 'IBM Plex Sans';cursor:pointer}.in-bar>button:first-child{background:#fff;display:flex;justify-content:space-between;align-items:center;padding:0 18px}.in-bar>button:last-child{background:var(--accent);border-left:2px solid #11120f}.in-drawer{position:absolute;bottom:58px;left:0;right:0;background:#fff;border:2px solid #11120f;border-bottom:0;padding:16px;opacity:0;transform:translateY(12px);pointer-events:none;transition:.2s;max-height:65vh;overflow:auto}.in-drawer.open{opacity:1;transform:none;pointer-events:auto}.in-drawer header{display:flex;justify-content:space-between;border-bottom:2px solid #11120f;padding-bottom:8px;font:700 13px 'Oswald'}.in-drawer header button,.in-items button{border:0;background:transparent;font:600 9px 'IBM Plex Sans';cursor:pointer}.in-items>div{display:grid;grid-template-columns:1fr auto auto auto;gap:12px;align-items:center;padding:10px 0;border-bottom:1px solid #aaa;font-size:10px}.in-items>div>div{display:flex;border:1px solid #111}.in-items>div>div button{width:30px;height:30px;background:#eee}.in-items>div>div b{width:28px;display:grid;place-items:center}.in-fields{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:13px}.in-fields input,.in-fields select{height:40px;border:1px solid #111;padding:0 10px;font:600 9px 'IBM Plex Sans'}
@media(min-width:940px){.in-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}@media(max-width:760px){.in-header-main{grid-template-columns:1fr auto;padding:14px 0}.in-header-main>p{display:none}.in-header-main>a{font-size:9px}.in-tool-row{grid-template-columns:1fr}.in-grid{grid-template-columns:1fr}.in-card{min-height:165px}.in-logo{width:48px;height:48px}.in-identity h1{font-size:22px}.in-fields{grid-template-columns:1fr}}@media(max-width:430px){.in-header-main,.in-tool-row,.in-main{width:calc(100% - 20px)}.in-header-main>a{display:none}.in-card{grid-template-columns:42% 58%}.in-body{padding:14px 11px 10px}.in-body h2{font-size:17px}.in-body p{display:none}.in-bar{grid-template-columns:.8fr 1.2fr}}
</style>
