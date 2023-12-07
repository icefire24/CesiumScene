<template>
  <div ref="earthContainer" id="cesiumContainer"></div>
</template>
<script setup lang="ts">
import * as Cesium from "cesium";
import { ref, onMounted } from "vue";
let earthContainer = ref(null);

onMounted(() => {
  let viewer;
  viewer = new Cesium.Viewer(earthContainer.value!, {
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
    shouldAnimate: false,
  });

  viewer.cesiumWidget.creditContainer.style.display = "none"; // 去除版权信息

});
</script>
<style scoped>
#cesiumContainer {
  width: 100%;
  height: 100%;
}
</style>
