<script setup>
import { Search } from 'lucide-vue-next';
import { gameNames } from '../../utils/gameMappings';

const props = defineProps({
  selectedPlatform: String,
  selectedGame: String,
  searchQuery: String,
  includePlayers: Boolean,
  allGames: Array,
  platformFilters: Array
});

const emit = defineEmits([
  'update:selectedPlatform',
  'update:selectedGame',
  'update:searchQuery',
  'update:includePlayers',
  'select-platform',
  'select-game'
]);

function selectPlatform(platform) {
  emit('update:selectedPlatform', platform);
  emit('update:selectedGame', 'all');
}

function handleGameClick(gameInfo) {
  if (gameInfo.isMuted) {
    emit('update:selectedPlatform', gameInfo.platform);
  }
  emit('update:selectedGame', gameInfo.game);
}
</script>

<template>
  <div class="controls">
    <div class="filter-group">
      <div class="chips">
        <button 
          @click="selectPlatform('all')"
          :class="['chip', { active: selectedPlatform === 'all' && selectedGame === 'all' }]"
        >
          All
        </button>
        
        <button 
          v-for="platform in platformFilters" 
          :key="platform.value"
          @click="selectPlatform(platform.value)"
          :class="['chip', { active: selectedPlatform === platform.value }]"
        >
          {{ platform.label }}
        </button>
        
        <button 
          v-for="gameInfo in allGames" 
          :key="gameInfo.game"
          @click="handleGameClick(gameInfo)"
          :class="['chip', 'game-chip', { active: selectedGame === gameInfo.game, muted: gameInfo.isMuted }]"
          :style="{ '--game-color': gameInfo.color }"
        >
          {{ gameNames[gameInfo.game] || gameInfo.game }}
        </button>
      </div>
    </div>

    <div class="search-bar">
      <Search :size="18" class="search-icon" />
      <input 
        :value="searchQuery"
        @input="$emit('update:searchQuery', $event.target.value)"
        type="text" 
        placeholder="Search hostname, map..." 
        class="search-input" 
      />
      <label class="checkbox-label">
        <input 
          :checked="includePlayers"
          @change="$emit('update:includePlayers', $event.target.checked)"
          type="checkbox" 
        /> Include players
      </label>
    </div>
  </div>
</template>

<style scoped>
.controls {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 20px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip {
  background: #1a1d26;
  border: 1px solid var(--border-color);
  color: var(--text-muted);
  padding: 6px 12px;
  border-radius: 16px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s ease;
  font-family: inherit;
}

.chip:hover {
  background: #252936;
  color: var(--text-color);
}

.chip.active {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
}

.game-chip {
  border-left: 3px solid var(--game-color);
}

.game-chip.active {
  background: var(--game-color);
  color: white;
  border-color: var(--game-color);
}

.game-chip.muted {
  opacity: 0.5;
  cursor: pointer;
}

.game-chip.muted:hover {
  opacity: 0.7;
  background: #252936;
}

.search-bar {
  display: flex;
  gap: 10px;
  align-items: center;
  background: #1a1d26;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid var(--border-color);
}

.search-icon {
  color: var(--text-muted);
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  color: white;
  font-size: 0.95rem;
  padding: 4px;
  outline: none;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  color: var(--text-muted);
  font-size: 0.85rem;
  white-space: nowrap;
}
</style>
