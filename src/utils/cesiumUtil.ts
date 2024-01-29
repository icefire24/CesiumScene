import * as Cesium from 'cesium'
interface TilesetOption {
  url: string
  [key: string]: any
}
/**
 * 给3dtiles添加剖切面
 * @param model 添加剖切面模型
 */
const addClipPlan = (model: Cesium.Cesium3DTileset) => {
  let viewer = window.viewer!
  let clippingPlanes = new Cesium.ClippingPlaneCollection({
    planes: [new Cesium.ClippingPlane(new Cesium.Cartesian3(0.0, 0.0, -1.0), 10)],
    edgeWidth: 1.0
  })
  model.clippingPlanes = clippingPlanes
  let targetY = model.boundingSphere.radius
  let planeEntities = []
  let selectedPlane: Cesium.Entity
  //添加剖切面
  function createPlaneUpdateFunction(plane: Cesium.ClippingPlane) {
    return function () {
      plane.distance = targetY
      return plane
    }
  }
  const plane = clippingPlanes.get(0)

  model.debugShowBoundingVolume = true
  const planeEntity = viewer.entities.add({
    position: model.boundingSphere.center,
    plane: {
      dimensions: new Cesium.Cartesian2(model.boundingSphere.radius, model.boundingSphere.radius),
      material: Cesium.Color.RED.withAlpha(0.1),
      plane: new Cesium.CallbackProperty(createPlaneUpdateFunction(plane), false),
      // plane,
      outline: true,
      outlineColor: Cesium.Color.WHITE
    }
  })
  // Select plane when mouse down
  const downHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
  downHandler.setInputAction(function (movement: Cesium.ScreenSpaceEventHandler.PositionedEvent) {
    const pickedObject = viewer.scene.pick(movement.position)
    if (Cesium.defined(pickedObject) && Cesium.defined(pickedObject.id) && Cesium.defined(pickedObject.id.plane)) {
      selectedPlane = pickedObject.id.plane
      selectedPlane.material = Cesium.Color.WHITE.withAlpha(0.05)
      selectedPlane.outlineColor = Cesium.Color.WHITE
      viewer.scene.screenSpaceCameraController.enableInputs = false
    }
  }, Cesium.ScreenSpaceEventType.LEFT_DOWN)

  // Release plane on mouse up
  const upHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
  upHandler.setInputAction(function () {
    if (Cesium.defined(selectedPlane)) {
      selectedPlane.material = Cesium.Color.WHITE.withAlpha(0.1)
      selectedPlane.outlineColor = Cesium.Color.WHITE
      selectedPlane = undefined
    }

    viewer.scene.screenSpaceCameraController.enableInputs = true
  }, Cesium.ScreenSpaceEventType.LEFT_UP)

  // Update plane on mouse move
  const moveHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
  moveHandler.setInputAction(function (movement: Cesium.ScreenSpaceEventHandler.MotionEvent) {
    if (Cesium.defined(selectedPlane)) {
      const deltaY = movement.startPosition.y - movement.endPosition.y
      targetY += deltaY
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
}
/**
 * @description:加载3dtiles
 * @param {cesium.Viewer} viewer
 * @param {Object} option 参数
 * @return {Promise<cesium.Cesium3DTileset>}
 */
const load3DTiles = (viewer: Cesium.Viewer, option: TilesetOption): Promise<Cesium.Cesium3DTileset> => {
  return new Promise((resolve, reject) => {
    const tileset = new Cesium.Cesium3DTileset(option)
    viewer.scene.primitives.add(tileset)
    resolve(tileset)
  })
}
/**
 * @description:加载gltf
 * @param {cesium.Viewer} viewer
 * @param {Object} option 参数
 * @return {Promise<cesium.Model>}
 */
const loadGltf = (viewer: Cesium.Viewer, option: Record<string, any>): Promise<Cesium.Model> => {
  return new Promise((resolve, reject) => {
    const model = viewer.scene.primitives.add(Cesium.Model.fromGltfAsync(option as any))
    model.readyPromise.then((model: Cesium.Model) => {
      resolve(model)
    })
  })
}

/**
 * @description:初始化cesium
 * @param {cesium.Viewer} viewer
 * @param {HTMLDivElement} container
 */
function initCesium(viewer: null | Cesium.Viewer, container: string | HTMLDivElement) {
  viewer = new Cesium.Viewer(container, {
    homeButton: false, //是否显示主页按钮
    sceneModePicker: false, //是否显示场景按钮
    baseLayerPicker: false, //是否显示图层选择控件
    navigationHelpButton: false, //导航帮助按钮
    selectionIndicator: false, //鼠标选择指示器
    infoBox: false, //信息提示框
    animation: false, //是否创建动画小器件，左下角仪表
    timeline: false, //是否显示时间线控件
    geocoder: false, //是否显示地名查找控件
    fullscreenButton: false, //是否全屏按钮
    shouldAnimate: true //开启动画

    // terrainProvider: Cesium.createWorldTerrain()//加载cesium资源地形
  })
  //@ts-ignore
  viewer.cesiumWidget.creditContainer.style.display = 'none' //去除版权信息
  return viewer
}
/*
 * @description:下雨效果
 * @param {cesium.Viewer} viewer
 * @param {Object} options 参数
 */
interface RainEffectOptions {
  tiltAngle?: number
  rainSize?: number
  rainSpeed?: number
}
class RainEffect {
  tiltAngle: number
  rainSize: number
  rainSpeed: number
  viewer: Cesium.Viewer
  rainStage: null | Cesium.PostProcessStage
  isShow: boolean
  constructor(viewer: Cesium.Viewer, options: RainEffectOptions) {
    if (!viewer) throw new Error('no viewer object!')
    options = options || {}
    //倾斜角度，负数向右，正数向左
    this.tiltAngle = Cesium.defaultValue(options.tiltAngle, -0.6)
    this.rainSize = Cesium.defaultValue(options.rainSize, 0.3)
    this.rainSpeed = Cesium.defaultValue(options.rainSpeed, 60.0)
    this.viewer = viewer
    this.rainStage = null
    this.isShow = true
    this.init()
  }

  init() {
    this.rainStage = new Cesium.PostProcessStage({
      name: 'czm_rain',
      fragmentShader: this.rain(),
      uniforms: {
        tiltAngle: () => {
          return this.tiltAngle
        },
        rainSize: () => {
          return this.rainSize
        },
        rainSpeed: () => {
          return this.rainSpeed
        }
      }
    })
    this.viewer.scene.postProcessStages.add(this.rainStage)
  }

  destroy() {
    if (!this.viewer || !this.rainStage) return
    this.viewer.scene.postProcessStages.remove(this.rainStage)
    this.rainStage.destroy()
    // delete this.tiltAngle;
    // delete this.rainSize;
    // delete this.rainSpeed;
  }

  show(visible: boolean) {
    if (!this.rainStage) return
    this.rainStage.enabled = visible
    this.isShow = visible
  }

  rain() {
    return 'uniform sampler2D colorTexture;\n\
        in vec2 v_textureCoordinates;\n\
      \n\
        float hash(float x){\n\
          return fract(sin(x*133.3)*13.13);\n\
      }\n\
      \n\
      out vec4 vFragColor;\n\
        \n\
      void main(void){\n\
      \n\
        float time = czm_frameNumber / 60.0;\n\
      vec2 resolution = czm_viewport.zw;\n\
      \n\
      vec2 uv=(gl_FragCoord.xy*2.-resolution.xy)/min(resolution.x,resolution.y);\n\
      vec3 c=vec3(.6,.7,.8);\n\
      \n\
      float a=-.4;\n\
      float si=sin(a),co=cos(a);\n\
      uv*=mat2(co,-si,si,co);\n\
      uv*=length(uv+vec2(0,4.9))*.3+1.;\n\
      \n\
      float v=1.-sin(hash(floor(uv.x*100.))*100.);\n\
      float b=clamp(abs(sin(15.*time*v+uv.y*(10./(2.+v))))-.95,0.,1.)*4.;\n\
      c*=v*b; \n\
      \n\
      vFragColor = mix(texture(colorTexture, v_textureCoordinates), vec4(c,1), 0.5);  \n\
      }\n\
    '
  }
}
interface SnowEffectOptions {
  snowSize?: number
  snowSpeed?: number
}
/**
 * @description:下雪效果
 * @param {cesium.Viewer} viewer
 * @param {Object} options 参数
 *
 */
class SnowEffect {
  snowSize: number
  snowSpeed: number
  viewer: Cesium.Viewer
  snowStage: null | Cesium.PostProcessStage
  isShow: boolean
  constructor(viewer: Cesium.Viewer, options: SnowEffectOptions) {
    if (!viewer) throw new Error('no viewer object!')
    options = options || {}
    //倾斜角度，负数向右，正数向左
    this.snowSize = Cesium.defaultValue(0.02, options.snowSize)
    this.snowSpeed = Cesium.defaultValue(60.0, options.snowSpeed)
    this.viewer = viewer
    this.snowStage = null
    this.isShow = true
    this.init()
  }

  init() {
    this.snowStage = new Cesium.PostProcessStage({
      name: 'czm_snow',
      fragmentShader: this.snow(),
      uniforms: {
        snowSize: () => {
          return this.snowSize
        },
        snowSpeed: () => {
          return this.snowSpeed
        }
      }
    })
    this.viewer.scene.postProcessStages.add(this.snowStage)
  }

  destroy() {
    if (!this.viewer || !this.snowStage) return
    this.viewer.scene.postProcessStages.remove(this.snowStage)
    this.snowStage.destroy()
    // delete this.tiltAngle;
    // delete this.rainSize;
    // delete this.rainSpeed;
  }

  show(visible: boolean) {
    if (!this.snowStage) return
    this.snowStage.enabled = visible
    this.isShow = visible
  }

  snow() {
    return 'uniform sampler2D colorTexture;\n\
        in vec2 v_textureCoordinates;\n\
        uniform float snowSpeed;\n\
                uniform float snowSize;\n\
        float snow(vec2 uv,float scale)\n\
        {\n\
            float time=czm_frameNumber/snowSpeed;\n\
            float w=smoothstep(1.,0.,-uv.y*(scale/10.));if(w<.1)return 0.;\n\
            uv+=time/scale;uv.y+=time*2./scale;uv.x+=sin(uv.y+time*.5)/scale;\n\
            uv*=scale;vec2 s=floor(uv),f=fract(uv),p;float k=3.,d;\n\
            p=.5+.35*sin(11.*fract(sin((s+p+scale)*mat2(7,3,6,5))*5.))-f;d=length(p);k=min(d,k);\n\
            k=smoothstep(0.,k,sin(f.x+f.y)*snowSize);\n\
            return k*w;\n\
        }\n\
        out vec4 vFragColor;\n\
        void main(void){\n\
            vec2 resolution=czm_viewport.zw;\n\
            vec2 uv=(gl_FragCoord.xy*2.-resolution.xy)/min(resolution.x,resolution.y);\n\
            vec3 finalColor=vec3(0);\n\
            //float c=smoothstep(1.,0.3,clamp(uv.y*.3+.8,0.,.75));\n\
            float c=0.;\n\
            c+=snow(uv,30.)*.0;\n\
            c+=snow(uv,20.)*.0;\n\
            c+=snow(uv,15.)*.0;\n\
            c+=snow(uv,10.);\n\
            c+=snow(uv,8.);\n\
            c+=snow(uv,6.);\n\
            c+=snow(uv,5.);\n\
            finalColor=(vec3(c));\n\
            vFragColor=mix(texture(colorTexture,v_textureCoordinates),vec4(finalColor,1),.5);\n\
            }\n\
            '
  }
}

class transformControl {
  model: Cesium.Model | Cesium.Cesium3DTileset
  handler: Cesium.ScreenSpaceEventHandler | null
  _primitives: Cesium.PrimitiveCollection
  viewer: Cesium.Viewer
  center: Cesium.Cartesian3
  radius: number
  _width: number
  _headWidth: number
  _length: number
  _headLength: number
  _inverse: boolean
  _isTransform:boolean


  constructor(model: Cesium.Model | Cesium.Cesium3DTileset, viewer: Cesium.Viewer, center: Cesium.Cartesian3, radius: number, option?: any) {
    this.model = model
    this.viewer = viewer
    this.center = center
    this.radius = radius
    this._primitives = new Cesium.PrimitiveCollection()
    this._width = option?.width || 3
    this._headWidth = option?.headWidth || 2 * this._width
    this._length = option?.length || 300
    this._headLength = option?.headLength || 10
    this._inverse = option?.inverse || false
    this._isTransform=false
    this.handler = null
    this.init()
  }
  init() {
    this.initAxis()
    this.initPoly()
    this.viewer.scene.primitives.add(this._primitives)
    this.initEvent()
  }
  initEvent() {
    let viewer = this.viewer
    let start: Cesium.Cartesian3 | undefined = new Cesium.Cartesian3()
    let end: Cesium.Cartesian3 | undefined = new Cesium.Cartesian3()
    let leftDown = false
    //点击屏幕拾取点
    this.handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
    this.handler.setInputAction((event: any) => {
      //判断点击的轴
      let pick = viewer.scene.pick(event.position)

      if (pick && pick.id && pick.id === 'axisY-line') {
        // 如果为真，则允许用户旋转相机。如果为假，相机将锁定到当前标题。此标志仅适用于2D和3D。
        viewer.scene.screenSpaceCameraController.enableRotate = false
        leftDown = true
      }
      //
      let position = viewer.camera.pickEllipsoid(event.position, viewer.scene.globe.ellipsoid)
      start = position
    }, Cesium.ScreenSpaceEventType.LEFT_DOWN)
    //鼠标移动过程中移动模型
    this.handler.setInputAction((event: any) => {
      if (leftDown) {
        if (Cesium.defined(start)) {
          end = viewer.camera.pickEllipsoid(event.endPosition, viewer.scene.globe.ellipsoid)
          if (Cesium.defined(end)) {
            let distance = new Cesium.Cartesian3()
            Cesium.Cartesian3.subtract(end!, start!, distance)
            let offset = new Cesium.Cartesian3(0, distance.y, 0)

            let translation = Cesium.Matrix4.fromTranslation(offset)

            Cesium.Matrix4.multiply(this.model.modelMatrix, translation, this.model.modelMatrix)
            this.translateSelf(translation)
            start = end
          }
        }
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
    //鼠标左键抬起
    this.handler.setInputAction((event: any) => {
      leftDown = false
      viewer.scene.screenSpaceCameraController.enableRotate = true
      // start = undefined
      // handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE)
    }, Cesium.ScreenSpaceEventType.LEFT_UP)
  }
  initAxis() {
    const axisZ = this.initArrowPolyline('axisZ', Cesium.Color.BLUE)
    const axisX = this.initArrowPolyline('axisX', Cesium.Color.RED)
    const axisY = this.initArrowPolyline('axisY', Cesium.Color.GREEN)
    this._primitives.add(axisZ)
    this._primitives.add(axisX)
    this._primitives.add(axisY)
    //旋转x轴和y轴到正确的位置
    const mx = Cesium.Matrix3.fromRotationY(Cesium.Math.toRadians(90))
    const rotationX = Cesium.Matrix4.fromRotationTranslation(mx)
    Cesium.Matrix4.multiply(axisX.modelMatrix, rotationX, axisX.modelMatrix)
    const my = Cesium.Matrix3.fromRotationX(Cesium.Math.toRadians(90))
    const rotationY = Cesium.Matrix4.fromRotationTranslation(my)
    Cesium.Matrix4.multiply(axisY.modelMatrix, rotationY, axisY.modelMatrix)
  }
  show(isshow: boolean) {
    this._primitives.show = isshow
  }
  destroy() {
    this._primitives.destroy()
    this.handler?.destroy()
  }
  translateSelf(matrix: Cesium.Matrix4) {
    const length = this._primitives.length
    for (let i = 0; i < length; ++i) {
      const p = this._primitives.get(i)
      Cesium.Matrix4.multiply(matrix, p.modelMatrix, p.modelMatrix)
    }
  }
  initPoly() {
    //创建圆弧primitive
    let matrix = Cesium.Transforms.eastNorthUpToFixedFrame(this.center)
    let radius = this.radius
    function createAxisSphere(matrix: Cesium.Matrix4, id: string, color = Cesium.Color.RED) {
      const position = []
      for (let i = 0; i <= 360; i += 3) {
        const sin = Math.sin(Cesium.Math.toRadians(i))
        const cos = Math.cos(Cesium.Math.toRadians(i))
        const x = radius * cos
        const y = radius * sin
        position.push(new Cesium.Cartesian3(x, y, 0))
      }

      const geometry = new Cesium.PolylineGeometry({
        positions: position,
        width: 10
      })
      const instnce = new Cesium.GeometryInstance({
        geometry: geometry,
        id,
        attributes: {
          color: Cesium.ColorGeometryInstanceAttribute.fromColor(color)
        }
      })
      return new Cesium.Primitive({
        geometryInstances: instnce,
        appearance: new Cesium.PolylineColorAppearance({
          translucent: false
        }),
        modelMatrix: matrix
      })
    }
    let axisSphereX = createAxisSphere(matrix, 'rotatex', Cesium.Color.RED)
    let axisSphereY = createAxisSphere(matrix, 'rotatey', Cesium.Color.GREEN)
    let axisSphereZ = createAxisSphere(matrix, 'rotatez', Cesium.Color.BLUE)
    this._primitives.add(axisSphereX)
    this._primitives.add(axisSphereY)
    this._primitives.add(axisSphereZ)
    const my = Cesium.Matrix3.fromRotationX(Cesium.Math.toRadians(90))
    const rotationY = Cesium.Matrix4.fromRotationTranslation(my)
    Cesium.Matrix4.multiply(axisSphereY.modelMatrix, rotationY, axisSphereY.modelMatrix)
    const mx = Cesium.Matrix3.fromRotationY(Cesium.Math.toRadians(90))
    const rotationX = Cesium.Matrix4.fromRotationTranslation(mx)
    Cesium.Matrix4.multiply(axisSphereX.modelMatrix, rotationX, axisSphereX.modelMatrix)
    // this.viewer.scene.primitives.add(axisSphereX)
    // this.viewer.scene.primitives.add(axisSphereY)
    // this.viewer.scene.primitives.add(axisSphereZ)
  }
  initArrowPolyline(id: string, color: Cesium.Color) {
    //这里用的是圆锥几何对象，当topRadius和bottomRadius相同时，它就是一个圆柱
    const line = Cesium.CylinderGeometry.createGeometry(
      new Cesium.CylinderGeometry({
        length: this._length,
        topRadius: this._width,
        bottomRadius: this._width
      })
    )
    const arrow = Cesium.CylinderGeometry.createGeometry(
      new Cesium.CylinderGeometry({
        length: this._headLength,
        topRadius: 0,
        bottomRadius: this._headWidth
      })
    )
    let offset = (this._length + this._headLength) / 2
    if (this._inverse) {
      offset = -offset
    }

    this.translate(arrow!, [0, 0, offset])

    return new Cesium.Primitive({
      modelMatrix: Cesium.Transforms.eastNorthUpToFixedFrame(this.center),
      geometryInstances: [
        new Cesium.GeometryInstance({
          id: id + '-line',
          geometry: line!
        }),
        new Cesium.GeometryInstance({
          id: id + '-arrow',
          geometry: arrow!
        })
      ],
      appearance: new Cesium.MaterialAppearance({
        material: Cesium.Material.fromType('Color', { color })
      }),
      asynchronous: false
    })
  }
  translate(geometry: Cesium.Geometry, offset: Array<number>) {
    const scratchOffset = new Cesium.Cartesian3()
    if (Array.isArray(offset)) {
      scratchOffset.x = offset[0]
      scratchOffset.y = offset[1]
      scratchOffset.z = offset[2]
    } else {
      Cesium.Cartesian3.clone(offset, scratchOffset)
    }

    for (let i = 0; i < geometry.attributes.position.values.length; i += 3) {
      geometry.attributes.position.values[i] += scratchOffset.x
      geometry.attributes.position.values[i + 1] += scratchOffset.y
      geometry.attributes.position.values[i + 2] += scratchOffset.z
    }
  }
}

export { RainEffect, SnowEffect, initCesium, load3DTiles, loadGltf, transformControl, addClipPlan }
