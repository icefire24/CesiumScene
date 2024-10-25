<template>
  <div ref="earthContainer" id="cesiumContainer"></div>
  <div class="test" style="position: absolute; left: 20px; top: 20px">
    <button @click="initRoma">roma</button>
  </div>
</template>
<script setup lang="ts">
import * as Cesium from 'cesium'
import { ref, onMounted } from 'vue'
import useMapStore from '@/store/modules/map'
import { PolylineFlowMaterialProperty } from '@/utils/PolylineFlowMaterialProperty.js'
import { PolylineArrowMaterialProperty } from '@/utils/PolylineArrowMaterialProperty.js'
import { transformControl } from '@/utils/cesiumUtil'
import { Radar } from '@/utils/radar'
let earthContainer = ref(null)
let mapStore = useMapStore()
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4YTA5NGI5MC05N2U1LTRiNzktYmQ4Mi1iYTlhNTNkMGMwNzYiLCJpZCI6ODUxMDAsImlhdCI6MTcyOTc2NTQzNn0.xn0nQzZfB_WyeRjgE2HzkJtrQcRVPimW2WdV57iQ-IU'
const testdata = ref([1, 2, '3'])
let path = [
  {
    lat: 39.99796185072834,
    lng: 113.99687721846784,
    height: -0.009133143849740608
  },
  {
    lat: 39.99827207035648,
    lng: 113.99889211409518,
    height: -0.0070531485782081346
  },
  {
    lat: 39.99863547208981,
    lng: 114.00117573865097,
    height: -0.008533815890477893
  },
  {
    lat: 39.998972053424666,
    lng: 114.00322787997024,
    height: -0.008737187117615133
  },
  {
    lat: 40.00051328608612,
    lng: 114.00221333275798,
    height: -0.005342403468982637
  },
  {
    lat: 40.00178868390644,
    lng: 114.00027907577314,
    height: -0.002268075911764024
  },
  {
    lat: 40.00087598071422,
    lng: 113.99823577018488,
    height: -0.002759394877080241
  },
  {
    lat: 39.99938936427338,
    lng: 113.99780461067469,
    height: -0.00809533533275353
  }
]
let viewer: Cesium.Viewer
let blueBox: Cesium.Entity
let man: Cesium.Model
const initRoma = () => {
  console.log(viewer)
  viewer.clock.shouldAnimate = true
  viewer.trackedEntity = blueBox
}
onMounted(async () => {
  window.viewer = viewer = new Cesium.Viewer(earthContainer.value!, {
    homeButton: false, //是否显示主页按钮
    sceneModePicker: false, //是否显示场景按钮
    baseLayerPicker: false, //是否显示图层选择控件
    navigationHelpButton: false, //导航帮助按钮
    selectionIndicator: false, //鼠标选择指示器
    infoBox: false, //信息提示框
    animation: false, //是否创建动画小器件，左下角仪表
    timeline: false, //是否显示时间线控件
    geocoder: false, //是否显示地名查找控件
    fullscreenButton: true, //是否全屏按钮
    shouldAnimate: false
  })
  let radar = new Radar(viewer, [114, 40], 100)
  console.log("🚀 ~ onMounted ~ radar:", radar)
  //点击打印经纬度和拾取物体
  let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
  handler.setInputAction(function (movement: Cesium.ScreenSpaceEventHandler.PositionedEvent) {
    let ray = viewer.camera.getPickRay(movement.position)
    let poi = viewer.scene.globe.pick(ray!, viewer.scene)
    //转经纬度
    let cartographic = viewer.scene.globe.ellipsoid.cartesianToCartographic(poi)
    pois.push({
      lat: Cesium.Math.toDegrees(cartographic.latitude),
      lng: Cesium.Math.toDegrees(cartographic.longitude),
      height: cartographic.height
    })
    console.log('🚀 ~ poi:', pois)

    let pick = viewer.scene.pick(movement.position)
    if (pick) {
      console.log(pick)
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
  ;(viewer.cesiumWidget.creditContainer as any).style.display = 'none' // 去除版权信息
  // let height = new Cesium.SampledProperty(Cesium.Cartesian3)
  // let start = Cesium.JulianDate.fromDate(new Date())
  // let stop = Cesium.JulianDate.addSeconds(start, path.length * 5 - 5, new Cesium.JulianDate())
  // viewer.clock.startTime = start.clone()
  // viewer.clock.stopTime = stop.clone()
  // viewer.clock.currentTime = start.clone()
  // viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP //Loop at the end
  // viewer.clock.multiplier = 0.3
  // height.addSample(start, new Cesium.Cartesian3(100, 100, 100))
  // height.addSample(stop, new Cesium.Cartesian3(100, 100, 500))
  // // 创建盒子
  // blueBox = viewer.entities.add({
  //   name: 'Blue box',
  //   position: Cesium.Cartesian3.fromDegrees(114.0, 40.0, 0.0),
  //   box: {
  //     dimensions: new Cesium.Cartesian3(100, 100, 100),
  //     material: Cesium.Color.BLUE,
  //     outline: true
  //   }
  // })
  // // blueBox.box!.dimensions = height

  // viewer.flyTo(blueBox)
  //  创建线
  // let positionProperty = new Cesium.SampledPositionProperty()
  // path.forEach((item, index) => {
  //   let point = viewer.entities.add({
  //     name: 'Point',
  //     position: Cesium.Cartesian3.fromDegrees(item.lng, item.lat, item.height),
  //     point: {
  //       pixelSize: 10,
  //       color: Cesium.Color.RED,
  //       outlineColor: Cesium.Color.WHITE,
  //       outlineWidth: 2
  //     }
  //   })
  //   //
  //   let time = Cesium.JulianDate.addSeconds(start, 5 * index, new Cesium.JulianDate())
  //   positionProperty.addSample(time, Cesium.Cartesian3.fromDegrees(item.lng, item.lat, item.height + 10))
  // })
  // blueBox.position = positionProperty
  // blueBox!.position!.setInterpolationOptions({
  //   interpolationDegree: 1,
  //   interpolationAlgorithm: Cesium.LinearApproximation
  // })
  // mapStore.setMap(viewer)

  //加载kml数据
  // let kmlOptions = {
  //   camera: viewer.scene.camera,
  //   canvas: viewer.scene.canvas,
  //   clampToGround: true
  // }
  // let line = mapStore.map!.dataSources.add(Cesium.KmlDataSource.load('model/广汕铁路.kml', kmlOptions))
  // line.then((res) => {
  //   res.entities.values[0].polyline!.material = new PolylineFlowMaterialProperty({})
  // })
  //加载gltf数据
  // const man = viewer.scene.primitives.add(Cesium.Model.fromGltfAsync({
  //   url:'/model/man.glb'
  // }))
  // viewer.flyTo(man)
  // //给线加上流动纹理

  // mapStore.map!.zoomTo(line)
  //鼠标移动到kml变宽
  // let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
  // handler.setInputAction(function (movement:Cesium.ScreenSpaceEventHandler.MotionEvent) {
  //   let ray = viewer.camera.getPickRay(movement.endPosition)
  //   let pick=viewer.scene.pick(movement.endPosition)
  //   console.log(pick);

  //   if (pick) {
  //     pick.id.polyline!.width = 10
  //     pick.id.polyline!.material = new PolylineArrowMaterialProperty()
  //   } else {

  //   }
  // }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
})
</script>
<style scoped>
#cesiumContainer {
  width: 100%;
  height: 100%;
}
</style>
