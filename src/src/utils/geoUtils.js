/** Haversine 公式で2点間の距離(km)を計算 */
export function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/** km を「約○km」「約○m」形式にフォーマット */
export function formatDistance(km) {
  if (km < 1) return `約${Math.round(km * 1000)}m`
  return `約${km.toFixed(1)}km`
}
