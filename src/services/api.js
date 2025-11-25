import { API_BASE_URL } from '../utils/constants';

export async function getServers() {
  try {
    const response = await fetch(`${API_BASE_URL}/servers`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching servers:', error);
    return { servers: [], countPlayers: 0, countServers: 0, maxPlayers: 0, countBots: 0 };
  }
}
