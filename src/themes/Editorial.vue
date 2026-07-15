<template>
  <div class="ed-root">
    <header class="ed-header">
      <div class="ed-top">
        <a v-if="config?.whatsapp" :href="'https://wa.me/'+config.whatsapp" target="_blank" rel="noopener">Atención personal</a>
        <span>Selección · Edición · Detalle</span>
      </div>

      <div class="ed-brand">
        <div class="ed-logo">
          <img v-if="config?.logoUrl && !logoError" :src="config.logoUrl" :alt="config?.siteName" @error="logoError=true"/>
          <span v-else>{{ config?.logoFallback || 'N5' }}</span>
        </div>
        <p>{{ config?.tagline || 'Una selección pensada para regalar, vestir y recordar.' }}</p>
        <h1>{{ config?.siteName || 'Catálogo' }}</h1>
      </div>

      <div class="ed-controls">
        <nav>
          <button
            v-for="cat in cats"
            :key="cat.k"
            :class="{ active: activeCat === cat.k }"
            @click="$emit('update:activeCat', cat.k); $emit('update:searchQ','')"
          >
            {{ cat.l }}
          </button>
        </nav>
        <label>
          <span>Buscar</span>
          <input
            :value="searchQ"
            :placeholder="config?.searchPlaceholder || 'Nombre o detalle'"
            @input="$emit('update:searchQ',$event.target.value)"
          />
        </label>
      </div>
    </header>

    <main class="ed-main">
      <div class="ed-section-head">
        <p>COLECCIÓN DISPONIBLE</p>
        <span>{{ prodsFiltrados?.length || 0 }} piezas</span>
      </div>

      <section v-if="loading" class="ed-grid">
        <article v-for="n in 6" :key="n" class="ed-product ed-skeleton"><div></div><i></i><i></i></article>
      </section>

      <section v-else-if="!prodsFiltrados?.length" class="ed-empty">
        <em>Sin coincidencias</em>
        <p>Explora otra categoría o cambia la búsqueda.</p>
      </section>

      <section v-else class="ed-grid">
        <article v-for="prod in prodsFiltrados" :key="prod.id" :class="['ed-product',{ selected: enCarrito(prod.id) }]">
          <div class="ed-image" @click="$emit('toggle-carrito',prod)">
            <img v-if="prod.imageUrl && !imgErrors[prod.id]" :src="prod.imageUrl" :alt="prod.name" loading="lazy" @error="imgErrors[prod.id]=true"/>
            <span v-else>{{ prod.emoji || '✦' }}</span>
            <b v-if="prod.badge">{{ prod.badge === 'oferta' ? 'Precio especial' : prod.badge === 'nuevo' ? 'Nueva pieza' : 'Últimas piezas' }}</b>
          </div>
          <div class="ed-product-copy">
            <div>
              <small>{{ prod.cat }}</small>
              <h2>{{ prod.name }}</h2>
              <p>{{ prod.desc }}</p>
            </div>
            <div class="ed-buy">
              <p><strong>{{ fmt(prod.price) }}</strong><del v-if="prod.orig">{{ fmt(prod.orig) }}</del></p>
              <button @click="$emit('toggle-carrito',prod)">
                {{ enCarrito(prod.id) ? 'Seleccionado ✓' : 'Seleccionar' }}
              </button>
            </div>
          </div>
        </article>
      </section>
    </main>

    <aside :class="['ed-order',{ visible: countCarrito>0, open: drawerOpen }]">
      <button class="ed-order-toggle" @click="$emit('update:drawerOpen',!drawerOpen)">
        <span>Tu selección · {{ countCarrito }}</span><strong>{{ fmt(totalCarrito) }}</strong>
      </button>
      <div class="ed-order-body">
        <div class="ed-order-title"><em>Tu pedido</em><button @click="$emit('update:drawerOpen',false)">×</button></div>
        <div class="ed-items">
          <div v-for="item in itemsCarrito" :key="item.id">
            <span>{{ item.name }}</span>
            <div>
              <button @click="$emit('cambiar-qty',item.id,-1)">−</button><b>{{ item.qty }}</b><button @click="$emit('cambiar-qty',item.id,1)">+</button>
            </div>
            <strong>{{ fmt(item.price*item.qty) }}</strong>
            <button @click="$emit('eliminar-item',item.id)">×</button>
          </div>
        </div>
        <div class="ed-fields">
          <input v-model="nombre" placeholder="Nombre para atenderte"/>
          <select v-model="tipoEnvio">
            <option value="">Forma de entrega</option>
            <option value="retiro">Retiro en sucursal</option>
            <option value="delivery">{{ config?.deliveryLabel || 'Envío a domicilio' }}</option>
          </select>
        </div>
        <button class="ed-wa" @click="$emit('enviar-wa',nombre,tipoEnvio)">Enviar selección por WhatsApp</button>
      </div>
    </aside>
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
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,500;9..144,600&display=swap');
.ed-root{--paper:#f4efe6;--ink:#26231f;--muted:#777066;--rule:#d9d0c2;--wine:#7a2f42;min-height:100vh;background:var(--paper);color:var(--ink);font-family:'DM Sans',sans-serif;padding-bottom:130px}.ed-root *{box-sizing:border-box}.ed-header{border-bottom:1px solid var(--rule)}.ed-top{height:34px;border-bottom:1px solid var(--rule);display:flex;align-items:center;justify-content:space-between;padding:0 max(20px,calc((100% - 1180px)/2));font-size:9px;letter-spacing:.16em;text-transform:uppercase;color:var(--muted)}.ed-top a{color:var(--wine);text-decoration:none}.ed-brand{width:min(1180px,calc(100% - 40px));margin:auto;padding:34px 0 28px;text-align:center;position:relative}.ed-logo{width:52px;height:52px;position:absolute;left:0;top:29px;border:1px solid var(--rule);display:grid;place-items:center;overflow:hidden;font-family:'Fraunces';font-size:21px}.ed-logo img{width:100%;height:100%;object-fit:cover}.ed-brand h1{font:600 clamp(42px,8vw,92px)/.92 'Fraunces',serif;letter-spacing:-.055em;margin:5px 0 0}.ed-brand p{margin:0;color:var(--muted);font:500 11px/1.5 'DM Sans';letter-spacing:.08em;text-transform:uppercase}.ed-controls{width:min(1180px,calc(100% - 40px));margin:auto;display:grid;grid-template-columns:1fr 300px;gap:20px;align-items:end;padding:0 0 16px}.ed-controls nav{display:flex;gap:20px;overflow:auto;scrollbar-width:none}.ed-controls nav button{border:0;border-bottom:1px solid transparent;background:transparent;padding:8px 0;color:var(--muted);font:600 11px 'DM Sans';white-space:nowrap;cursor:pointer}.ed-controls nav button.active{color:var(--ink);border-color:var(--ink)}.ed-controls label{display:grid;grid-template-columns:auto 1fr;align-items:center;border-bottom:1px solid var(--ink);gap:12px;padding:8px 0}.ed-controls label span{font-size:9px;text-transform:uppercase;letter-spacing:.14em}.ed-controls input{border:0;background:transparent;outline:0;font:500 12px 'DM Sans';color:var(--ink);text-align:right}
.ed-main{width:min(1180px,calc(100% - 40px));margin:28px auto}.ed-section-head{display:flex;justify-content:space-between;padding-bottom:10px;border-bottom:1px solid var(--ink);margin-bottom:20px;font-size:9px;letter-spacing:.16em}.ed-section-head p{margin:0}.ed-section-head span{color:var(--muted)}.ed-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:42px 22px}.ed-product{border-bottom:1px solid var(--rule);padding-bottom:20px}.ed-image{aspect-ratio:4/5;background:#e8e0d4;position:relative;overflow:hidden;display:grid;place-items:center;cursor:pointer}.ed-image img{width:100%;height:100%;object-fit:cover;filter:saturate(.9);transition:.5s}.ed-product:hover img{transform:scale(1.02)}.ed-image>span{font:600 48px 'Fraunces';color:var(--wine)}.ed-image b{position:absolute;left:12px;top:12px;background:var(--paper);color:var(--wine);padding:6px 9px;font:600 9px 'DM Sans';letter-spacing:.08em;text-transform:uppercase}.ed-product-copy{display:grid;grid-template-columns:1fr auto;gap:18px;padding-top:15px}.ed-product-copy small{color:var(--wine);text-transform:uppercase;font-size:8px;letter-spacing:.13em}.ed-product h2{font:600 22px/1.05 'Fraunces';margin:5px 0 7px;letter-spacing:-.025em}.ed-product-copy>div:first-child p{font-size:11px;color:var(--muted);line-height:1.55;margin:0;max-width:390px}.ed-buy{text-align:right;min-width:110px}.ed-buy p{margin:0 0 9px;display:grid}.ed-buy strong{font-size:16px}.ed-buy del{font-size:9px;color:var(--muted)}.ed-buy button{background:transparent;border:0;border-bottom:1px solid var(--ink);padding:3px 0;font:700 10px 'DM Sans';cursor:pointer;color:var(--ink)}.ed-product.selected .ed-image{outline:2px solid var(--wine);outline-offset:-2px}.ed-empty{min-height:340px;display:grid;place-content:center;text-align:center;border-bottom:1px solid var(--rule)}.ed-empty em{font:600 42px 'Fraunces'}.ed-empty p{color:var(--muted)}
.ed-order{position:fixed;right:20px;bottom:18px;width:min(420px,calc(100% - 40px));z-index:90;transform:translateY(140%);transition:.35s}.ed-order.visible{transform:none}.ed-order-toggle{width:100%;height:58px;padding:0 18px;border:1px solid #382f2b;background:#29231f;color:#fff;display:flex;align-items:center;justify-content:space-between;font:600 11px 'DM Sans';cursor:pointer}.ed-order-body{background:#fbf8f2;border:1px solid #382f2b;border-bottom:0;padding:18px;position:absolute;left:0;right:0;bottom:58px;opacity:0;pointer-events:none;transform:translateY(12px);transition:.2s;max-height:68vh;overflow:auto}.ed-order.open .ed-order-body{opacity:1;pointer-events:auto;transform:none}.ed-order-title{display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--ink);padding-bottom:10px}.ed-order-title em{font:600 30px 'Fraunces'}.ed-order-title button,.ed-items button{border:0;background:transparent;cursor:pointer}.ed-items>div{display:grid;grid-template-columns:1fr auto auto auto;gap:10px;align-items:center;padding:12px 0;border-bottom:1px solid var(--rule);font-size:11px}.ed-items>div>div{display:flex;align-items:center;border:1px solid var(--rule)}.ed-items>div>div button{width:28px;height:28px}.ed-items b{width:26px;text-align:center}.ed-fields{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:15px 0}.ed-fields input,.ed-fields select{height:42px;border:1px solid var(--rule);background:#fff;padding:0 10px;font:500 11px 'DM Sans'}.ed-wa{width:100%;height:46px;border:0;background:var(--wine);color:#fff;font:700 11px 'DM Sans';cursor:pointer}
.ed-skeleton>div,.ed-skeleton i{background:linear-gradient(90deg,#e5ddd1,#efe9df,#e5ddd1);background-size:200%;animation:edsh 1.4s infinite}.ed-skeleton>div{aspect-ratio:4/5}.ed-skeleton i{display:block;height:12px;margin-top:12px}.ed-skeleton i:last-child{width:55%}@keyframes edsh{to{background-position:-200%}}
@media(min-width:760px){.ed-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}@media(max-width:700px){.ed-top span{display:none}.ed-brand{padding-top:80px}.ed-logo{left:50%;transform:translateX(-50%);top:20px}.ed-brand h1{font-size:50px}.ed-brand p{font-size:9px}.ed-controls{grid-template-columns:1fr}.ed-controls label{grid-row:1}.ed-grid{gap:30px 12px}.ed-product-copy{grid-template-columns:1fr}.ed-buy{text-align:left}.ed-buy p{display:flex;gap:7px}.ed-product h2{font-size:18px}.ed-product-copy>div:first-child p{display:none}.ed-order{right:12px;bottom:12px;width:calc(100% - 24px)}.ed-fields{grid-template-columns:1fr}}@media(max-width:420px){.ed-main,.ed-brand,.ed-controls{width:calc(100% - 24px)}.ed-grid{gap:26px 9px}.ed-product{padding-bottom:14px}.ed-image b{font-size:7px}.ed-product h2{font-size:16px}.ed-buy strong{font-size:14px}}
</style>
