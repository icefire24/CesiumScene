import { Viewer } from 'cesium'
import { defineStore } from 'pinia'

interface MapState {
  map: Viewer | null
}

const mapStore = defineStore('map', {
  state: (): MapState => ({
    map: null
  }),

  actions: {
    setMap(map: Viewer) {
      this.map = map
    }
  }
})
export default mapStore
