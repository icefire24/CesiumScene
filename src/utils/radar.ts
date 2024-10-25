import * as turf from '@turf/turf'
import * as Cesium from 'cesium'

export class Radar {
  constructor(viewer: Cesium.Viewer, center: [number, number], radius: number) {
    this.viewer = viewer
    this.center = center
    this.radius = radius
    this.angle = 0
    this.sectorPoints = []
    this.drawCircle()
    this.drawSector()
    this.init()
  }
  init() {
    setInterval(() => {
      this.center[0] += 0.001
      this.angle += 1
      var center = turf.point(this.center)
      var radius = this.radius
      var bearing1 = this.angle
      var bearing2 = this.angle + 30
      var sector = turf.sector(center, radius, bearing1, bearing2, {
        units: 'meters'
      })
      let points = turf.getCoords(sector).flat().flat()
      this.sectorPoints = points
    }, 1000)
  }
  //画圆
  drawCircle() {
    var xSemiAxis = this.radius
    var ySemiAxis = this.radius
    var ellipse = turf.ellipse(this.center, xSemiAxis, ySemiAxis, {
      units: 'meters'
    })
    let points = turf.getCoords(ellipse).flat().flat()
    this.circleEntity = this.viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(this.center[0], this.center[1]),
      polygon: {
        hierarchy: Cesium.Cartesian3.fromDegreesArray(points),
        material: Cesium.Color.GREEN.withAlpha(0.5)
      }
    })
    // this.viewer.flyTo(this.circleEntity)
  }
  //画扇形
  drawSector() {
    let self = this
    var center = turf.point(this.center)
    var radius = this.radius
    var bearing1 = this.angle
    var bearing2 = this.angle + 30
    var sector = turf.sector(center, radius, bearing1, bearing2, {
      units: 'meters'
    })
    let points = turf.getCoords(sector).flat().flat()
    this.sectorPoints = Cesium.Cartesian3.fromDegreesArray(points)
    this.sectorEntity = this.viewer.entities.add({
      position: new Cesium.CallbackProperty(() => {
        console.log(this.center[0])
        return Cesium.Cartesian3.fromDegrees(this.center[0], this.center[1])
      }, false),
      polygon: {
        hierarchy: this.sectorPoints,
        material: new Cesium.ImageMaterialProperty({
          image: '/img/colors.png'
        })
      }
    })
    this.viewer.flyTo(this.sectorEntity)
  }
}
