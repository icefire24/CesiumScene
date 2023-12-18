import { Color, defaultValue, defined, Property, createPropertyDescriptor, Material, Event, Cartesian2 } from 'cesium';

const defaultColor = Color.TRANSPARENT;
import defaultImage from '../../../assets/images/effect/line-color-yellow.png';
const defaultForward = 1;
const defaultSpeed = 1;
const defaultRepeat = new Cartesian2(1.0, 1.0);

class PolylineFlowMaterialProperty {
  constructor(options) {
    options = defaultValue(options, defaultValue.EMPTY_OBJECT);

    this._definitionChanged = new Event();
    // 定义材质变量
    this._color = undefined;
    this._colorSubscription = undefined;
    this._image = undefined;
    this._imageSubscription = undefined;
    this._forward = undefined;
    this._forwardSubscription = undefined;
    this._speed = undefined;
    this._speedSubscription = undefined;
    this._repeat = undefined;
    this._repeatSubscription = undefined;
    // 变量初始化
    this.color = options.color || defaultColor; //颜色
    this.image = options.image || defaultImage; //材质图片
    this.forward = options.forward || defaultForward;
    this.speed = options.speed || defaultSpeed;
    this.repeat = options.repeat || defaultRepeat;
  }

  // 材质类型
  getType() {
    return 'PolylineFlow';
  }

  // 这个方法在每次渲染时被调用，result的参数会传入glsl中。
  getValue(time, result) {
    if (!defined(result)) {
      result = {};
    }

    result.color = Property.getValueOrClonedDefault(this._color, time, defaultColor, result.color);
    result.image = Property.getValueOrClonedDefault(this._image, time, defaultImage, result.image);
    result.forward = Property.getValueOrClonedDefault(this._forward, time, defaultForward, result.forward);
    result.speed = Property.getValueOrClonedDefault(this._speed, time, defaultSpeed, result.speed);
    result.repeat = Property.getValueOrClonedDefault(this._repeat, time, defaultRepeat, result.repeat);

    return result;
  }

  equals(other) {
    return (
      this === other ||
      (other instanceof PolylineFlowMaterialProperty &&
        Property.equals(this._color, other._color) &&
        Property.equals(this._image, other._image) &&
        Property.equals(this._forward, other._forward) &&
        Property.equals(this._speed, other._speed) &&
        Property.equals(this._repeat, other._repeat))
    );
  }
}

Object.defineProperties(PolylineFlowMaterialProperty.prototype, {
  isConstant: {
    get: function get() {
      return (
        Property.isConstant(this._color) &&
        Property.isConstant(this._image) &&
        Property.isConstant(this._forward) &&
        Property.isConstant(this._speed) &&
        Property.isConstant(this._repeat)
      );
    }
  },

  definitionChanged: {
    get: function get() {
      return this._definitionChanged;
    }
  },

  color: createPropertyDescriptor('color'),
  image: createPropertyDescriptor('image'),
  forward: createPropertyDescriptor('forward'),
  speed: createPropertyDescriptor('speed'),
  repeat: createPropertyDescriptor('repeat')
});

export { PolylineFlowMaterialProperty };
