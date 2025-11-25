<script setup>
import { Server, Users } from 'lucide-vue-next';

defineProps({
  stats: {
    type: Object,
    required: true
  }
});
</script>

<template>
  <div class="header-section">
    <div class="logo-container">
      <img src="/img/plutools.png" alt="Logo" class="logo" />
    </div>
    
    <div class="stats-container">
      <div class="stat-item">
        <span class="stat-value">{{ stats.countServers }}</span>
        <span class="stat-label">
          <Server :size="14" class="icon-inline" /> Servers
        </span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-value">{{ stats.countPlayers }}</span>
        <span class="stat-label">
          <Users :size="14" class="icon-inline" /> Players
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
}

.logo {
  height: 60px;
  object-fit: contain;
}

.stats-container {
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--accent-color);
  line-height: 1;
}

.stat-label {
  color: var(--text-muted);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.icon-inline {
  vertical-align: text-bottom;
}

.stat-divider {
  width: 1px;
  height: 30px;
  background: var(--border-color);
}
</style>
