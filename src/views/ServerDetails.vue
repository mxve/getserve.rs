<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getServers } from '../services/api';
import { gameNames, platformNames, gameColors } from '../utils/gameMappings';
import { SITE_DOMAIN } from '../utils/constants';
import { 
  Server, Users, Play, Lock, Map as MapIcon, Globe, Hash, 
  Joystick, ArrowLeft, Copy, Star, ExternalLink
} from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();

const server = ref(null);
const loading = ref(true);
const error = ref(null);
const showToast = ref(false);
const toastMessage = ref('');
const isFavorite = ref(false);

onMounted(async () => {
  await fetchServerDetails();
  checkFavorite();
});

watch(() => route.params, async () => {
  loading.value = true;
  await fetchServerDetails();
  checkFavorite();
});

async function fetchServerDetails() {
  try {
    const data = await getServers();
    const servers = data.servers || [];
    
    if (route.params.id) {
      server.value = servers.find(s => s.identifier === route.params.id);
    } else if (route.params.ip && route.params.port) {
      server.value = servers.find(s => s.ip === route.params.ip && s.port == route.params.port);
    }

    if (!server.value) {
      error.value = 'Server not found';
    } else {
      updateMetaTags();
    }
  } catch (err) {
    error.value = 'Failed to load server details.';
    console.error(err);
  } finally {
    loading.value = false;
  }
}

function updateMetaTags() {
  if (!server.value) return;
  
  const title = `${server.value.hostnameDisplayFull} [${server.value.realClients}/${server.value.maxplayers}]`;
  const description = `View player count, map and gamemode of ${server.value.hostnameDisplayFull}`;
  
  document.title = title;
  
  updateMeta('og:title', title);
  updateMeta('og:description', description);
  updateMeta('og:url', `${SITE_DOMAIN}/#/s/${server.value.identifier}`);
}

function updateMeta(name, content) {
  let element = document.querySelector(`meta[property="${name}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute('property', name);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function getGameIcon(game) {
  return `/img/${game}.jpg`;
}

function getFlagClass(country) {
  if (!country) return '';
  return `fi fi-${country.toLowerCase()}`;
}

function connectToServer() {
  if (!server.value) return;
  const command = `connect ${server.value.ip}:${server.value.port}`;
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

function toggleFavorite() {
  if (!server.value) return;
  
  let favourites = JSON.parse(localStorage.getItem('favourites')) || [];
  const identifier = server.value.identifier;
  
  if (favourites.includes(identifier)) {
    favourites = favourites.filter(id => id !== identifier);
    isFavorite.value = false;
  } else {
    favourites.push(identifier);
    isFavorite.value = true;
  }
  
  localStorage.setItem('favourites', JSON.stringify(favourites));
}

function checkFavorite() {
  if (!server.value) return;
  const favourites = JSON.parse(localStorage.getItem('favourites')) || [];
  isFavorite.value = favourites.includes(server.value.identifier);
}

function goBack() {
  router.push('/');
}

const installLink = computed(() => {
  if (!server.value) return null;
  const game = server.value.game;
  
  if (game === 'iw4') return { url: 'https://iw4x.dev', text: 'Install this client' };
  if (['s1', 'iw6', 't7'].includes(game)) return { url: 'https://alterware.dev', text: 'Install this client' };
  if (['iw5mp', 't4mp', 't4sp', 't5mp', 't5sp', 't6mp', 't6zm'].includes(game)) return { url: 'https://plutonium.pw', text: 'Install this client' };
  if (['h1', 'iw7'].includes(game)) return { url: 'https://auroramod.dev', text: 'Install this client' };
  if (game === 'cod4x') return { url: 'https://cod4x.ovh/', text: 'Install this client' };
  
  return null;
});

const platformLink = computed(() => {
  if (!server.value) return null;
  const platform = server.value.platform;
  
  if (server.value.game === 'iw4') return { url: 'https://iw4x.dev', text: 'IW4x' };
  if (platform === 'plutonium') return { url: 'https://plutonium.pw', text: 'Plutonium' };
  if (platform === 'alterware') return { url: 'https://alterware.dev', text: 'AlterWare' };
  if (platform === 'aurora') return { url: 'https://auroramod.dev', text: 'Aurora' };
  if (platform === 'cod4x') return { url: 'https://cod4x.ovh', text: 'CoD4x' };
  
  return null;
});

const showPlayerList = computed(() => {
  if (!server.value) return false;
  const s = server.value;
  const validPlatform = ['plutonium', 'alterware', 'cod4x'].includes(s.platform);
  const hasPlayers = s.realClients > 0;
  const endpointAvailable = s.endpoint_available !== false;
  const notT7 = s.game !== 't7';
  
  return validPlatform && hasPlayers && endpointAvailable && notT7;
});
</script>

<template>
  <div class="server-details-container">
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Loading server details...</p>
    </div>

    <div v-else-if="error" class="error-container">
      <p>{{ error }}</p>
      <button @click="goBack" class="back-btn">
        <ArrowLeft :size="16" /> Back to List
      </button>
    </div>

    <div v-else class="content">
      <div v-if="showToast" class="toast">
        {{ toastMessage }}
      </div>

      <button @click="goBack" class="back-link">
        <ArrowLeft :size="16" /> Back to Server List
      </button>

      <div class="banner" v-if="installLink">
        <a :href="installLink.url" target="_blank" class="install-link">
          {{ installLink.text }} <ExternalLink :size="12" />
        </a>
        <span class="divider">|</span>
        <a href="https://hetzner.cloud/?ref=xAd5ndPeibsR" target="_blank" class="host-link">
          Host your own server with 20€ free credit <ExternalLink :size="12" />
        </a>
      </div>

      <div class="server-header" :class="server.game" :style="{ borderLeftColor: gameColors[server.game] || 'transparent' }">
        <h1 class="hostname">{{ server.hostnameDisplayFull }}</h1>
        
        <div class="actions">
          <button @click="toggleFavorite" class="action-btn favorite-btn" :class="{ active: isFavorite }" title="Toggle Favorite">
            <Star :size="20" :fill="isFavorite ? 'currentColor' : 'none'" />
          </button>
          
          <div class="connect-box" @click="connectToServer" title="Click to copy">
            <span class="command">connect {{ server.ip }}:{{ server.port }}</span>
            <Copy :size="16" />
          </div>

          <a v-if="server.game === 'iw4'" :href="`iw4x://${server.ip}:${server.port}`" class="play-btn-link">
            <Play :size="16" fill="currentColor" /> Connect
          </a>
        </div>
      </div>

      <div class="info-grid">
        <div class="info-card">
          <h3>Players</h3>
          <div class="info-content">
            <Users :size="20" class="icon" />
            <span>{{ server.realClients }}/{{ server.maxplayers }}</span>
            <span v-if="server.bots > 0" class="bots">({{ server.bots }} bots)</span>
          </div>
        </div>

        <div class="info-card">
          <h3>Game</h3>
          <div class="info-content">
            <img :src="getGameIcon(server.game)" :alt="server.game" class="game-icon" />
            <span>{{ gameNames[server.game] || server.game }}</span>
          </div>
        </div>

        <div class="info-card">
          <h3>Map</h3>
          <div class="info-content">
            <MapIcon :size="20" class="icon" />
            <span>{{ server.mapDisplay }}</span>
          </div>
        </div>

        <div class="info-card">
          <h3>Mode</h3>
          <div class="info-content">
            <Joystick :size="20" class="icon" />
            <span>{{ server.gametypeDisplay }}</span>
          </div>
        </div>

        <div v-if="server.round >= 0" class="info-card">
          <h3>Round</h3>
          <div class="info-content">
            <Hash :size="20" class="icon" />
            <span>{{ server.round }}</span>
          </div>
        </div>

        <div class="info-card">
          <h3>Location</h3>
          <div class="info-content">
            <span :class="getFlagClass(server.country)" class="flag-icon"></span>
            <span>{{ server.countryDisplay }}</span>
          </div>
        </div>

        <div v-if="platformLink" class="info-card">
          <h3>Platform</h3>
          <div class="info-content">
            <a :href="platformLink.url" target="_blank" class="platform-link">
              {{ platformLink.text }} <ExternalLink :size="14" />
            </a>
          </div>
        </div>
      </div>

      <div v-if="showPlayerList" class="player-list-section">
        <h3>Player List</h3>
        <div class="player-grid">
          <div v-for="(player, index) in server.players" :key="index" class="player-card">
            <template v-if="player.test_client !== 1">
              <div class="player-info">
                <span v-if="['alterware', 'cod4x'].includes(server.platform)" class="player-name">
                  {{ player.name }}
                </span>
                <a v-else :href="`https://forum.plutonium.pw/user/${player.userslug}`" target="_blank" class="player-name link" title="Forum Profile">
                  {{ player.username }}
                </a>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
function getPingClass(ping) {
  if (ping < 100) return 'ping-good';
  if (ping < 200) return 'ping-medium';
  return 'ping-bad';
}
</script>

<style scoped>
.server-details-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
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

.back-link {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  margin-bottom: 20px;
  font-size: 0.9rem;
  padding: 0;
}

.back-link:hover {
  color: var(--text-color);
}

.banner {
  background: #1a1d26;
  padding: 12px;
  border-radius: 8px;
  text-align: center;
  margin-bottom: 24px;
  border: 1px solid var(--border-color);
  font-size: 0.9rem;
}

.banner a {
  color: var(--text-muted);
  text-decoration: none;
  transition: color 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.banner a:hover {
  color: var(--accent-color);
}

.divider {
  margin: 0 12px;
  color: var(--border-color);
}

.server-header {
  background: #15171e;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-width: 300px;
}

.actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.action-btn {
  background: #1a1d26;
  border: 1px solid var(--border-color);
  color: var(--text-muted);
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #252936;
  color: var(--text-color);
}

.favorite-btn.active {
  color: #ffb020;
  border-color: #ffb020;
}

.connect-box {
  background: #1a1d26;
  border: 1px solid var(--border-color);
  padding: 8px 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.connect-box:hover {
  border-color: var(--accent-color);
  background: rgba(255, 102, 153, 0.05);
}

.command {
  font-family: monospace;
  color: var(--accent-color);
  font-weight: 600;
}

.play-btn-link {
  background: var(--accent-color);
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  transition: opacity 0.2s;
}

.play-btn-link:hover {
  opacity: 0.9;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

@media (min-width: 768px) {
  .info-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.info-card {
  background: #15171e;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 16px;
}

.info-card h3 {
  margin: 0 0 12px 0;
  font-size: 0.8rem;
  text-transform: uppercase;
  color: var(--text-muted);
  letter-spacing: 0.5px;
}

.info-content {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.1rem;
  font-weight: 500;
}

.icon {
  color: var(--text-muted);
}

.game-icon {
  width: 24px;
  height: 24px;
  border-radius: 4px;
}

.flag-icon {
  font-size: 1.2rem;
}

.platform-link {
  color: var(--accent-color);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 4px;
}

.platform-link:hover {
  text-decoration: underline;
}

.player-list-section {
  background: #15171e;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 24px;
}

.player-list-section h3 {
  margin: 0 0 20px 0;
}

.player-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.player-card {
  background: #1a1d26;
  border: 1px solid var(--border-color);
  padding: 12px;
  border-radius: 8px;
}

.player-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.player-name {
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.player-name.link {
  color: white;
  text-decoration: none;
  border-bottom: 1px dotted white;
}

.player-name.link:hover {
  border-bottom-style: solid;
}

.player-ping {
  font-size: 0.85rem;
  font-weight: 600;
}

.ping-good { color: #7ac431; }
.ping-medium { color: #ffb020; }
.ping-bad { color: #e02a14; }

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

@media (max-width: 768px) {
  .server-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .actions {
    width: 100%;
    flex-wrap: wrap;
  }
  
  .connect-box {
    flex: 1;
    justify-content: center;
  }
}
</style>
