export interface GeoResult {
  lat: number
  lng: number
}

export async function geocodeAddress(address: string): Promise<GeoResult | null> {
  const params = new URLSearchParams({ q: address, format: 'json', limit: '1' })
  const url = `https://nominatim.openstreetmap.org/search?${params}`

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'PamilyaMap/1.0 (family trip planner)' },
    })
    if (!res.ok) return null
    const data = await res.json()
    if (!data.length) return null
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
  } catch {
    return null
  }
}
