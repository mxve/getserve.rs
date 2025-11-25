<script setup>
import { computed, ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { getServers } from '../services/api';
import { platformNames, gameColors } from '../utils/gameMappings';
import ServerListHeader from './serverlist/ServerListHeader.vue';
import ServerListFilters from './serverlist/ServerListFilters.vue';
import ServerListTable from './serverlist/ServerListTable.vue';

const route = useRoute();

const servers = ref([]);
const loading = ref(true);
const error = ref(null);

const selectedPlatform = ref('all');
const selectedGame = ref('all');
const searchQuery = ref('');
const includePlayers = ref(false);

const showToast = ref(false);
const toastMessage = ref('');

const platformFilters = [
  { value: 'plutonium', label: 'Plutonium', isPlatform: true },
  { value: 'alterware', label: 'AlterWare', isPlatform: true },
  { value: 'aurora', label: 'Aurora', isPlatform: true }
];

onMounted(async () => {
  try {
    const data = await getServers();
    servers.value = data.servers || [];
    applyRouteFilter();
  } catch (err) {
    error.value = 'Failed to load servers. Please try again later.';
    console.error(err);
  } finally {
    loading.value = false;
  }
});

watch(() => route.params.filter, () => {
  applyRouteFilter();
});

function applyRouteFilter() {
  const filter = route.params.filter;
  if (!filter) {
    selectedPlatform.value = 'all';
    selectedGame.value = 'all';
    return;
  }

  const lowerFilter = filter.toLowerCase();
  const isPlatform = platformFilters.some(p => p.value === lowerFilter);
  
  if (isPlatform) {
    selectedPlatform.value = lowerFilter;
    selectedGame.value = 'all';
    return;
  }

  selectedPlatform.value = 'all';
  selectedGame.value = lowerFilter;
}

const gameSortOrder = [
  't5mp', 't5sp', 't6mp', 't6zm', 't7', 'cod4x', 'iw4', 
  'iw5mp', 'h1', 'iw6', 'iw7', 's1', 't4mp', 't4sp'
];

const allGames = computed(() => {
  const games = new Set(servers.value.map(s => s.game));
  
  const sortedGames = Array.from(games).sort((a, b) => {
    const indexA = gameSortOrder.indexOf(a);
    const indexB = gameSortOrder.indexOf(b);
    
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return a.localeCompare(b);
  });
  
  return sortedGames.map(game => {
    const gamePlatform = platformNames[game]?.toLowerCase();
    const isActive = selectedPlatform.value === 'all' || gamePlatform === selectedPlatform.value;
    return {
      game,
      platform: gamePlatform,
      color: gameColors[game] || '#666',
      isActive,
      isMuted: !isActive
    };
  });
});

const filteredServers = computed(() => {
  let result = servers.value;

  if (selectedGame.value !== 'cod4x') {
    result = result.filter(s => s.game !== 'cod4x');
  }

  if (selectedPlatform.value !== 'all') {
    result = result.filter(s => platformNames[s.game]?.toLowerCase() === selectedPlatform.value);
  }

  if (selectedGame.value !== 'all') {
    result = result.filter(s => s.game === selectedGame.value);
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(server => {
      const hostname = server.hostnameDisplayFull?.toLowerCase() || '';
      const map = server.mapDisplay?.toLowerCase() || '';
      const gametype = server.gametypeDisplay?.toLowerCase() || '';
      
      let match = hostname.includes(query) || map.includes(query) || gametype.includes(query);

      if (includePlayers.value && server.players) {
        const players = server.players.map(p => p.username.toLowerCase()).join(' ');
        match = match || players.includes(query);
      }

      return match;
    });
  }

  return result;
});

const stats = computed(() => {
  let countPlayers = 0;
  let maxPlayers = 0;
  let countBots = 0;
  let countServers = 0;

  for (const server of filteredServers.value) {
    countPlayers += server.realClients || 0;
    maxPlayers += server.maxplayers || 0;
    countBots += server.bots || 0;
    countServers++;
  }

  return { countPlayers, maxPlayers, countBots, countServers };
});

function connectToServer(ip, port) {
  const command = `connect ${ip}:${port}`;
  navigator.clipboard.writeText(command).then(() => {
    showToastMessage(`Copied: ${command}`);
  });
}

function showToastMessage(msg) {
  toastMessage.value = msg;
  showToast.value = true;
  setTimeout(() => {
    showToast.value = false;
  }, 3000);
}
</script>

<template>
  <div class="server-list-container">
    
    <!-- Loading / Error -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Loading servers...</p>
    </div>

    <div v-else-if="error" class="error-container">
      {{ error }}
    </div>

    <template v-else>
      <div v-if="showToast" class="toast">
        {{ toastMessage }}
      </div>

      <ServerListHeader :stats="stats" />

      <ServerListFilters
        v-model:selectedPlatform="selectedPlatform"
        v-model:selectedGame="selectedGame"
        v-model:searchQuery="searchQuery"
        v-model:includePlayers="includePlayers"
        :allGames="allGames"
        :platformFilters="platformFilters"
      />

      <ServerListTable 
        :servers="filteredServers" 
        @connect="connectToServer"
      />
    </template>
  </div>
</template>

<style scoped>
.server-list-container {
  padding: 20px 0;
  position: relative;
}

.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50vh;
  color: var(--text-muted);
}

.spinner {
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-left-color: var(--accent-color);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.toast {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: var(--accent-color);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  z-index: 1000;
  font-weight: 600;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>
