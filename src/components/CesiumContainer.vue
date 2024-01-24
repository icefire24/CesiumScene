<template>
  <div ref="earthContainer" id="cesiumContainer"></div>
</template>
<script setup lang="ts">
import * as Cesium from 'cesium'
import { ref, onMounted } from 'vue'
import useMapStore from '@/store/modules/map'
import { PolylineTrailLinkMaterialProperty } from '@/utils/PolylineTrailMaterialProperty'
let earthContainer = ref(null)
let mapStore = useMapStore()
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhMDFlYzljOC04YTQwLTQwZjUtOTY4My0yZDI5MjNiMzFjMDYiLCJpZCI6ODUxMDAsImlhdCI6MTY4NjA1ODI3M30.ZhBOypwDMw_O5U1ohT6Ch9NcK7p90E_XFAcfGihTwlM'
onMounted(async () => {
  let viewer = new Cesium.Viewer(earthContainer.value!, {
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
  ;(viewer.cesiumWidget.creditContainer as any).style.display = 'none' // 去除版权信息

  try {
    const tileset = await Cesium.Cesium3DTileset.fromUrl('/model/FSTDQ/tileset.json')
    viewer.scene.primitives.add(tileset)
    viewer.flyTo(tileset)
  } catch (error) {
    console.error(`Error creating tileset: ${error}`)
  }
  mapStore.setMap(viewer)
  //加载kml数据
  let kmlOptions = {
    camera: viewer.scene.camera,
    canvas: viewer.scene.canvas,
    clampToGround: true
  }
  let line = mapStore.map!.dataSources.add(Cesium.KmlDataSource.load('model/广汕铁路.kml', kmlOptions))
  console.log(line)
  // line.then((res) => {
  //   res.entities.values[0].polyline.material = new PolylineTrailLinkMaterialProperty({
  //     color: Cesium.Color.RED,
  //     duration: 3000
  //   })
  // })

  // //给线加上流动纹理

  mapStore.map!.zoomTo(line)
})
</script>
<style scoped>
#cesiumContainer {
  width: 100%;
  height: 100%;
}
</style>
