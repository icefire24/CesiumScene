import * as Cesium from 'cesium'
var dataSource = new Cesium.CustomDataSource('my')
var location = {
  latitude: 0,
  longitude: 0,
  height: 0,
  endPosition: null,
  cartesian: null
}
window.viewer!.screenSpaceEventHandler.setInputAction(function onMouseMove(movement) {
  //记录移动位置
  location.endPosition = window.viewer!.scene.pickPosition(movement.endPosition) as any
}, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

window.viewer!.screenSpaceEventHandler.setInputAction(function onLeftClick(movement) {
  var cartesian = window.viewer!.scene.pickPosition(movement.position)
  //记录点击位置
  location.cartesian = cartesian as any
  var cartographic = Cesium.Cartographic.fromCartesian(cartesian)
  location.latitude = Cesium.Math.toDegrees(cartographic.latitude)
  location.longitude = Cesium.Math.toDegrees(cartographic.longitude)
  location.height = cartographic.height
}, Cesium.ScreenSpaceEventType.LEFT_CLICK)
//左键单击画线，双击结束
export function measureLine(viewer: Cesium.Viewer) {
  var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
  //单击鼠标左键画线
  handler.setInputAction(function (movement: any) {
    let cartesian = viewer.scene.pickPosition(movement.position)
    console.log('cartesian: ', cartesian)
    let positions = []
    positions.push(cartesian.x, cartesian.y)
    dataSource.entities.add({
      polyline: {
        positions: new Cesium.CallbackProperty(function () {
          return Cesium.Cartesian3.fromDegreesArray(positions)
        }, false),
        material: Cesium.Color.RED,
        width: 3
      }
    })
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
}
