<template>
  <div class="mc-root">
    <header class="mc-header">
      <div class="mc-hero">
        <div class="mc-brand">
          <div class="mc-logo">
            <img v-if="config?.logoUrl && !logoError" :src="config.logoUrl" :alt="config?.siteName" @error="logoError=true"/>
            <span v-else>{{ config?.logoFallback || 'N5' }}</span>
          </div>
          <div><p>Compra local · Atención directa</p><h1>{{ config?.siteName || 'Nuestro catálogo' }}</h1></div>
        </div>
        <p class="mc-tagline">{{ config?.tagline || 'Elige lo que te gusta y mándanos tu pedido por WhatsApp.' }}</p>
        <a v-if="config?.whatsapp" :href="'https://wa.me/'+config.whatsapp" target="_blank" rel="noopener">Escríbenos</a>
      </div>

      <label class="mc-search"><span>¿Qué estás buscando?</span><input :value="searchQ" :placeholder="config?.searchPlaceholder || 'Buscar en el catálogo'" @input="$emit('update:searchQ',$event.target.value)"/></label>

      <nav class="mc-cats">
        <button v-for="cat in cats" :key="cat.k" :class="{active:activeCat===cat.k}" @click="$emit('update:activeCat',cat.k);$emit('update:searchQ','')">
          <span>{{ cat.icon || '•' }}</span>{{ cat.l }}
        </button>
      </nav>
    </header>

    <main class="mc-main">
      <div class="mc-title"><div><small>PARA TI</small><h2>Explora y arma tu pedido</h2></div><span>{{ prodsFiltrados?.length || 0 }} opciones</span></div>

      <section v-if="loading" class="mc-grid"><article v-for="n in 6" :key="n" class="mc-card mc-sk"><div></div><i></i><i></i></article></section>
      <section v-else-if="!prodsFiltrados?.length" class="mc-empty"><b>Ups, no encontramos eso.</b><span>Prueba otra búsqueda.</span></section>

      <section v-else class="mc-grid">
        <article v-for="prod in prodsFiltrados" :key="prod.id" :class="['mc-card',{selected:enCarrito(prod.id)}]">
          <div class="mc-image" @click="$emit('toggle-carrito',prod)">
            <img v-if="prod.imageUrl && !imgErrors[prod.id]" :src="prod.imageUrl" :alt="prod.name" loading="lazy" @error="imgErrors[prod.id]=true"/>
            <span v-else>{{ prod.emoji || '♡' }}</span>
            <b v-if="prod.badge">{{ prod.badge === 'oferta' ? 'Oferta' : prod.badge === 'nuevo' ? 'Nuevo' : 'Quedan pocos' }}</b>
          </div>
          <div class="mc-body">
            <h3>{{ prod.name }}</h3>
            <p>{{ prod.desc }}</p>
            <div class="mc-price"><strong>{{ fmt(prod.price) }}</strong><del v-if="prod.orig">{{ fmt(prod.orig) }}</del></div>
            <button @click="$emit('toggle-carrito',prod)">{{ enCarrito(prod.id) ? 'Ya está en tu pedido ✓' : 'Agregar a mi pedido' }}</button>
          </div>
        </article>
      </section>
    </main>

    <div :class="['mc-cart',{visible:countCarrito>0}]">
      <div :class="['mc-panel',{open:drawerOpen}]">
        <header><div><small>CASI LISTO</small><b>Revisa tu pedido</b></div><button @click="$emit('update:drawerOpen',false)">×</button></header>
        <div class="mc-items">
          <div v-for="item in itemsCarrito" :key="item.id">
            <span>{{ item.emoji }} {{ item.name }}</span>
            <div><button @click="$emit('cambiar-qty',item.id,-1)">−</button><b>{{ item.qty }}</b><button @click="$emit('cambiar-qty',item.id,1)">+</button></div>
            <strong>{{ fmt(item.price*item.qty) }}</strong>
            <button @click="$emit('eliminar-item',item.id)">×</button>
          </div>
        </div>
        <div class="mc-fields">
          <input v-model="nombre" placeholder="¿Cómo te llamas?"/>
          <select v-model="tipoEnvio"><option value="">¿Cómo lo recibes?</option><option value="retiro">Paso a recoger</option><option value="delivery">{{ config?.deliveryLabel || 'Envío a domicilio' }}</option></select>
        </div>
      </div>
      <div class="mc-bar">
        <button @click="$emit('update:drawerOpen',!drawerOpen)"><span>{{ countCarrito }} en tu pedido</span><strong>{{ fmt(totalCarrito) }}</strong></button>
        <button @click="$emit('enviar-wa',nombre,tipoEnvio)">Enviar pedido</button>
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
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600&family=Nunito:wght@400;600;700;800;900&display=swap');
.mc-root{--cream:#fff8eb;--ink:#2d271f;--orange:#ef6d3d;--green:#407b59;--yellow:#ffd978;--line:#ead9bd;min-height:100vh;background:var(--cream);color:var(--ink);font-family:'Nunito',sans-serif;padding-bottom:130px}.mc-root *{box-sizing:border-box}.mc-header{background:linear-gradient(135deg,#f8d98a 0,#f5b982 50%,#ef8f69 100%);padding:20px max(16px,calc((100% - 1140px)/2)) 16px;border-bottom:1px solid #d67c56}.mc-hero{display:grid;grid-template-columns:auto 1fr auto;gap:28px;align-items:center}.mc-brand{display:flex;align-items:center;gap:12px}.mc-logo{width:58px;height:58px;border-radius:18px;background:#fff8eb;display:grid;place-items:center;overflow:hidden;font:900 20px 'Nunito';box-shadow:0 8px 20px rgba(110,53,25,.12)}.mc-logo img{width:100%;height:100%;object-fit:cover}.mc-brand p{font-size:9px;letter-spacing:.08em;text-transform:uppercase;margin:0 0 2px}.mc-brand h1{font:600 28px/1 'Fraunces';margin:0;letter-spacing:-.03em}.mc-tagline{font-size:12px;line-height:1.45;max-width:430px;margin:0}.mc-hero>a{background:var(--green);color:#fff;padding:11px 17px;border-radius:999px;text-decoration:none;font-size:11px;font-weight:900}.mc-search{width:min(570px,100%);height:52px;margin:22px auto 14px;background:#fff8eb;border:2px solid #4b3b2d;border-radius:16px;display:grid;grid-template-columns:auto 1fr;align-items:center;padding:0 14px;gap:10px;box-shadow:4px 4px 0 #4b3b2d}.mc-search span{font-size:10px;font-weight:900}.mc-search input{border:0;outline:0;background:transparent;font:700 12px 'Nunito';text-align:right;color:var(--ink)}.mc-cats{display:flex;gap:8px;justify-content:center;overflow:auto;scrollbar-width:none}.mc-cats button{border:1px solid rgba(45,39,31,.3);background:rgba(255,248,235,.45);height:37px;padding:0 14px;border-radius:999px;font:800 10px 'Nunito';white-space:nowrap;cursor:pointer}.mc-cats button.active{background:#fff8eb;border-color:#4b3b2d;box-shadow:2px 2px 0 #4b3b2d}.mc-cats span{margin-right:5px}
.mc-main{width:min(1140px,calc(100% - 32px));margin:27px auto}.mc-title{display:flex;justify-content:space-between;align-items:end;margin-bottom:15px}.mc-title small{font-size:8px;letter-spacing:.15em;color:var(--orange);font-weight:900}.mc-title h2{font:600 30px/1.1 'Fraunces';margin:3px 0 0}.mc-title>span{font-size:10px;color:#8a7864}.mc-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.mc-card{background:#fffdf7;border:1px solid var(--line);border-radius:22px;overflow:hidden;box-shadow:0 8px 22px rgba(90,65,29,.07);transition:.2s}.mc-card:hover{transform:translateY(-2px)}.mc-card.selected{outline:3px solid var(--green);outline-offset:-3px}.mc-image{aspect-ratio:1.18;background:#f4e3c7;display:grid;place-items:center;position:relative;overflow:hidden;cursor:pointer}.mc-image img{width:100%;height:100%;object-fit:cover}.mc-image>span{font-size:45px}.mc-image b{position:absolute;top:10px;left:10px;background:var(--yellow);border:1px solid #6f5334;border-radius:999px;padding:5px 8px;font-size:8px}.mc-body{padding:14px}.mc-body h3{font:600 19px/1.1 'Fraunces';margin:0 0 6px}.mc-body>p{font-size:10px;line-height:1.45;color:#7d6c58;margin:0 0 10px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.mc-price{display:flex;gap:7px;align-items:baseline}.mc-price strong{font-size:18px;color:var(--green)}.mc-price del{font-size:9px;color:#a18b72}.mc-body>button{width:100%;height:38px;margin-top:11px;border:0;border-radius:12px;background:#f1e2ca;color:var(--ink);font:900 10px 'Nunito';cursor:pointer}.mc-card.selected .mc-body>button{background:var(--green);color:#fff}.mc-empty{height:320px;border:2px dashed var(--line);border-radius:24px;display:grid;place-content:center;text-align:center;gap:5px}.mc-empty b{font:600 28px 'Fraunces'}.mc-empty span{color:#8e7c66}
.mc-sk div,.mc-sk i{background:linear-gradient(90deg,#f0dfc3,#faefdc,#f0dfc3);background-size:200%;animation:mcsh 1.3s infinite}.mc-sk>div{aspect-ratio:1.18}.mc-sk i{display:block;height:12px;margin:13px;border-radius:8px}.mc-sk i:last-child{width:55%}@keyframes mcsh{to{background-position:-200%}}
.mc-cart{position:fixed;left:50%;bottom:14px;transform:translate(-50%,150%);width:min(760px,calc(100% - 24px));z-index:100;transition:.35s}.mc-cart.visible{transform:translate(-50%,0)}.mc-bar{display:grid;grid-template-columns:1fr 1fr;background:#fff8eb;border:2px solid #4b3b2d;border-radius:18px;padding:6px;box-shadow:5px 6px 0 #4b3b2d}.mc-bar>button{height:51px;border:0;border-radius:12px;font:900 11px 'Nunito';cursor:pointer}.mc-bar>button:first-child{background:transparent;display:flex;justify-content:space-between;align-items:center;padding:0 14px}.mc-bar>button:last-child{background:var(--green);color:#fff}.mc-panel{position:absolute;left:0;right:0;bottom:67px;background:#fff8eb;border:2px solid #4b3b2d;border-radius:20px;padding:16px;opacity:0;transform:translateY(12px);pointer-events:none;transition:.2s;max-height:66vh;overflow:auto}.mc-panel.open{opacity:1;transform:none;pointer-events:auto}.mc-panel header{display:flex;justify-content:space-between;align-items:center;padding-bottom:10px;border-bottom:1px solid var(--line)}.mc-panel header div{display:grid}.mc-panel header small{font-size:8px;color:var(--orange);letter-spacing:.12em}.mc-panel header b{font:600 24px 'Fraunces'}.mc-panel header button,.mc-items button{border:0;background:transparent;cursor:pointer}.mc-panel header>button{font-size:24px}.mc-items>div{display:grid;grid-template-columns:1fr auto auto auto;gap:10px;align-items:center;padding:11px 0;border-bottom:1px solid var(--line);font-size:10px}.mc-items>div>div{display:flex;background:#f2e4cc;border-radius:999px;overflow:hidden}.mc-items>div>div button{width:30px;height:30px}.mc-items>div>div b{width:28px;display:grid;place-items:center}.mc-fields{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:13px}.mc-fields input,.mc-fields select{height:42px;border:1px solid var(--line);border-radius:11px;background:#fff;padding:0 10px;font:700 10px 'Nunito'}
@media(min-width:680px){.mc-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}@media(min-width:1000px){.mc-grid{grid-template-columns:repeat(4,minmax(0,1fr))}}@media(max-width:720px){.mc-hero{grid-template-columns:1fr auto}.mc-tagline{display:none}.mc-brand h1{font-size:23px}.mc-hero>a{padding:10px 13px}.mc-cats{justify-content:flex-start}.mc-fields{grid-template-columns:1fr}.mc-items>div{grid-template-columns:1fr auto auto}.mc-items>div>strong{display:none}}@media(max-width:430px){.mc-header{padding-left:10px;padding-right:10px}.mc-main{width:calc(100% - 20px)}.mc-logo{width:48px;height:48px}.mc-brand p{display:none}.mc-title h2{font-size:25px}.mc-grid{gap:9px}.mc-card{border-radius:16px}.mc-body{padding:11px}.mc-body h3{font-size:16px}.mc-body>p{display:none}.mc-bar{grid-template-columns:.9fr 1.1fr}}
</style>
