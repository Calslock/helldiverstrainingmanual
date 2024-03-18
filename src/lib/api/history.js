import { supabase } from "$lib/db"
import { api } from "$lib/api/api"

let lastCampaignEntry = 0

export async function fetchHistory(planetIndex, { limit = 288 } = {}) {
  try {
    return await api(`war/history/${planetIndex}?limit=${limit}`) || {}
  } catch (error) {
    console.error(error)
  }
}

export async function saveCampaignStatusHistory(formattedCampaigns) {
  const now = Date.now()

  if ((now - lastCampaignEntry) / 1000 < 300) return // Only add a new entry every 5 minutes

  const requests = []

  formattedCampaigns.forEach(({ planetIndex, health, maxHealth, players, }) => {
    requests.push({
      planet_index: planetIndex,
      current_health: health,
      max_health: maxHealth,
      player_count: players
    })
  })

  try {
    const { error } = await supabase.from("history").insert(requests).select()

    if (error) throw new Error(error.message)
  } catch (error) {
    // @ts-ignore
    throw new Error(error.message)
  }

  lastCampaignEntry = now
}
