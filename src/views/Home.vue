<template>
  <div class="home">
    <header class="home-header">
      <h1>Catálogos</h1>
      <p>Selecciona un catálogo para ver los productos</p>
    </header>

    <main class="home-grid">
      <router-link
        v-for="cat in CATALOGOS"
        :key="cat.id"
        :to="'/' + cat.id"
        class="home-card"
      >
        <span class="home-card-icon">{{ cat.icon }}</span>
        <span class="home-card-label">{{ cat.label }}</span>
      </router-link>
    </main>
  </div>
</template>

<script setup>
import { CATALOGOS } from '../main.js'
</script>

<style scoped>
.home {
  min-height: 100vh;
  background: #F7F4EF;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  font-family: 'DM Sans', sans-serif;
}
.home-header {
  text-align: center;
  margin-bottom: 40px;
}
.home-header h1 {
  font-size: 32px;
  font-weight: 700;
  color: #0F0E0C;
  margin-bottom: 8px;
}
.home-header p {
  font-size: 16px;
  color: rgba(58,56,50,.55);
}
.home-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
  max-width: 600px;
}
.home-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 32px 40px;
  background: #fff;
  border-radius: 20px;
  border: 1px solid rgba(58,56,50,.08);
  box-shadow: 0 2px 16px rgba(15,14,12,.07);
  text-decoration: none;
  transition: transform .2s, box-shadow .2s;
  min-width: 140px;
}
.home-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(15,14,12,.12);
}
.home-card-icon { font-size: 48px; }
.home-card-label {
  font-size: 15px;
  font-weight: 600;
  color: #0F0E0C;
}
</style>
