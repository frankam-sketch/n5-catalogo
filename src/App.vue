<template>
  <router-view v-slot="{ Component, route }">
    <component :is="Component" :key="route.fullPath" />
  </router-view>
</template>

<script setup>
// La clave por ruta fuerza una carga limpia al cambiar de un catálogo a otro.
</script>
