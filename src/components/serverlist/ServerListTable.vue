<script setup>
import { 
  Users, Play, Lock, Crosshair, CircleDashed, CircleOff, 
  Gamepad2, Map as MapIcon, Globe, Hash, Key, Joystick 
} from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import { gameNames, gameColors } from '../../utils/gameMappings';

defineProps({
  servers: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['connect']);
const router = useRouter();

let middleMouseTarget = null;

function getGameIcon(game) {
  return `/img/${game}.jpg`;
}

function getFlagClass(country) {
  if (!country) return '';
  return `fi fi-${country.toLowerCase()}`;
}

function navigateToDetails(server, event) {
  if (event && (event.ctrlKey || event.metaKey || event.button === 1)) {
    const url = `${window.location.origin}${window.location.pathname}#/s/${server.identifier}`;
    window.open(url, '_blank');
    return;
  }
  router.push(`/s/${server.identifier}`);
}

function handleMouseDown(server, event) {
  if (event.button === 1) {
    middleMouseTarget = server.identifier;
    event.preventDefault();
  }
}

function handleMouseUp(server, event) {
  if (event.button === 1 && middleMouseTarget === server.identifier) {
    event.preventDefault();
    navigateToDetails(server, event);
    middleMouseTarget = null;
  }
}
</script>

<template>
  <div class="table-responsive">
    <table class="server-table">
      <thead>
        <tr>
          <th class="icon-col" title="Game"><Gamepad2 :size="16" /></th>
          <th class="flag-col" title="Location"><Globe :size="16" /></th>
          <th class="hostname-col">Hostname</th>
          <th class="players-col"><Users :size="16" /></th>
          <th class="gametype-col">Mode</th>
          <th class="map-col"><Map :size="16" /></th>
          <th class="round-col" title="Round"><Hash :size="16" /></th>
          <th class="aim-col" title="Aim Assist"><Crosshair :size="16" /></th>
          <th class="pwd-col" title="Password"><Key :size="16" /></th>
          <th class="connect-col"></th>
        </tr>
      </thead>
      <tbody>
        <tr 
          v-for="server in servers" 
          :key="server.identifier" 
          :class="['server-row', server.game]"
          :style="{ borderLeftColor: gameColors[server.game] || 'transparent' }"
          @click="navigateToDetails(server, $event)"
          @mousedown="handleMouseDown(server, $event)"
          @mouseup="handleMouseUp(server, $event)"
        >
          <td class="icon-col">
            <img :src="getGameIcon(server.game)" :alt="server.game" :title="gameNames[server.game]" loading="lazy" />
          </td>
          <td class="flag-col">
            <span :class="getFlagClass(server.country)" :title="server.country"></span>
          </td>
          <td class="hostname-col">
            <div class="hostname" :title="server.hostnameDisplayFull">{{ server.hostnameDisplay }}</div>
          </td>
          
          <td class="players-col">
            <span class="mobile-label"><Users :size="12"/></span>
            <span class="player-count">{{ server.realClients }}/{{ server.maxplayers }}</span>
            <span v-if="server.bots > 0" class="bots">({{ server.bots }})</span>
          </td>
          <td class="gametype-col">
            <span class="mobile-label"><Joystick :size="12"/></span>
            {{ server.gametypeDisplay }}
          </td>
          <td class="map-col">
            <span class="mobile-label"><Map :size="12"/></span>
            {{ server.mapDisplay }}
          </td>
          
          <td class="round-col" :class="{ 'has-round': server.round >= 0 }">
            <template v-if="server.round >= 0">
              <span class="mobile-label"><Hash :size="12"/></span>
              {{ server.round }}
            </template>
          </td>
          <td class="aim-col mobile-hide">
            <Crosshair v-if="server.aimassist === '1'" :size="16" class="status-yes" />
            <CircleOff v-else-if="server.aimassist === '0'" :size="16" class="status-no" />
            <CircleDashed v-else :size="16" class="status-unknown" />
          </td>
          <td class="pwd-col mobile-hide">
            <Lock v-if="server.password" :size="16" class="status-lock" />
          </td>
          <td class="connect-col mobile-hide">
            <button @click.stop="$emit('connect', server.ip, server.port)" class="play-btn" title="Copy Connect Command">
              <Play :size="16" fill="currentColor" />
            </button>
          </td>
        </tr>
        <tr v-if="servers.length === 0">
          <td colspan="10" class="no-servers">No servers found.</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.table-responsive {
  overflow: hidden;
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.server-table {
  width: 100%;
  border-collapse: collapse;
  background: #15171e;
  table-layout: fixed;
  min-width: 900px;
}

th {
  background: #1a1d26;
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: var(--text-muted);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.server-row {
  border-bottom: 1px solid var(--border-color);
  border-left: 3px solid transparent;
  transition: background-color 0.1s;
  cursor: pointer;
}

.server-row:last-child {
  border-bottom: none;
}

.server-row:hover {
  background-color: #1e212b;
}

td {
  padding: 10px 12px;
  vertical-align: middle;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.icon-col { width: 50px; text-align: center; }
.flag-col { width: 35px; text-align: center; }
.hostname-col { width: 35%; }
.players-col { width: 70px; }
.gametype-col { width: 15%; }
.map-col { width: 15%; }
.round-col { width: 40px; text-align: center; }
.aim-col { width: 40px; text-align: center; }
.pwd-col { width: 40px; text-align: center; }
.connect-col { width: 50px; text-align: center; }

.icon-col img {
  width: 28px;
  height: 28px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  vertical-align: middle;
}

.flag-col span {
  display: inline-block;
  vertical-align: middle;
}

.hostname-link {
  text-decoration: none;
  color: inherit;
  display: block;
}

.hostname-link:hover .hostname {
  color: var(--accent-color);
}

.hostname {
  font-weight: 500;
  color: #ececf1;
  transition: color 0.2s;
}

.player-count {
  font-weight: 600;
  color: var(--accent-color);
}

.bots {
  color: var(--text-muted);
  font-size: 0.85em;
  margin-left: 4px;
}

.status-yes { color: #7ac431; }
.status-no { color: var(--text-muted); }
.status-unknown { color: var(--text-muted); }
.status-lock { color: #ff7c1f; }

.play-btn {
  background: rgba(108, 124, 255, 0.1);
  border: none;
  color: var(--accent-color);
  cursor: pointer;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.play-btn:hover {
  background: var(--accent-color);
  color: white;
  transform: scale(1.1);
}

.no-servers {
  text-align: center;
  padding: 40px;
  color: var(--text-muted);
  font-style: italic;
}

.mobile-label {
  display: none;
}



@media (max-width: 768px) {
  .table-responsive {
    border: none;
    background: transparent;
  }

  .server-table {
    display: block;
    min-width: auto;
    border: none;
    background: transparent;
  }

  thead {
    display: none;
  }

  tbody {
    display: block;
  }

  .server-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    background: #15171e;
    margin-bottom: 12px;
    padding: 12px;
    border-radius: 8px;
    min-height: 45px;
    height: auto;
  }

  .icon-col {
    width: 28px;
    order: 1;
    padding: 0;
    border: none;
    flex-shrink: 0;
  }

  .flag-col {
    width: 24px;
    order: 2;
    padding: 0;
    border: none;
    flex-shrink: 0;
  }

  .hostname-col {
    width: 100%;
    order: 3;
    padding: 0;
    border: none;
    flex-basis: 100%;
  }

  .hostname {
    font-size: 0.95rem;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .players-col,
  .gametype-col,
  .map-col {
    width: auto;
    padding: 4px 10px;
    border: none;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: 500;
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  .players-col {
    order: 4;
    color: var(--accent-color);
  }

  .gametype-col {
    order: 5;
  }

  .map-col {
    order: 6;
  }

  .aim-col, .pwd-col, .connect-col {
    display: none;
  }

  .round-col {
    width: auto;
    padding: 4px 10px;
    border: none;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: 500;
    flex-shrink: 0;
    display: none;
    align-items: center;
    gap: 4px;
    order: 7;
  }

  .round-col.has-round {
    display: inline-flex;
  }

  .mobile-label {
    display: inline-flex;
    color: var(--text-muted);
  }
}
</style>
