import { useState, useEffect } from 'react'
import { getUsers } from '../services/userService'
import { getDistance } from '../utils/geoUtils'

/** 現在地から radiusKm 以内のユーザーを返すフック */
export function useNearbyUsers(myLat, myLng, radiusKm = 50) {
  const [users, setUsers] = useState([])

  useEffect(() => {
    if (myLat == null || myLng == null) return
    getUsers()
      .then((all) => {
        const nearby = all
          .filter((u) => u.currentLocation)
          .map((u) => ({
            ...u,
            distance: getDistance(
              myLat,
              myLng,
              u.currentLocation.lat,
              u.currentLocation.lng
            ),
          }))
          .filter((u) => u.distance <= radiusKm)
          .sort((a, b) => a.distance - b.distance)
        setUsers(nearby)
      })
      .catch(console.error)
  }, [myLat, myLng, radiusKm])

  return users
}
