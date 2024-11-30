import { IControl, Map } from 'maplibre-gl'
import { CompassButton } from './components/CompassButton'
import { DebugView } from './components/DebugView'

// https://developer.mozilla.org/ja/docs/Web/API/DeviceOrientationEvent
export type WebkitDeviceOrientationEvent = DeviceOrientationEvent & {
  webkitCompassHeading: number | undefined
  webkitCompassAccuracy: number | undefined
}

type CompassControlOptions = {
  accuracy?: number
  timeout?: number
  debug?: boolean
  visible?: boolean
}

const defaultOptions: CompassControlOptions = {
  timeout: 3000, // ms
  debug: false,
  visible: true,
}

const eventTypes = ['deviceorientation', 'turnon', 'turnoff']

export class CompassControl implements IControl {
  private map: Map | undefined
  private container = document.createElement('div')
  private compassButton: CompassButton
  private debugView: DebugView | undefined
  private options: CompassControlOptions

  private active = false
  private currentHeading: number | undefined
  private currentAccuracy: number | undefined

  private deviceorientationCallback:
    | ((event: WebkitDeviceOrientationEvent) => void)
    | undefined
  private turnonCallback: (() => void) | undefined
  private turnoffCallback: (() => void) | undefined

  constructor(options?: CompassControlOptions) {
    this.options = { ...defaultOptions, ...options }
    this.compassButton = new CompassButton(this.container)
    this.compassButton.on('click', () => this.onClick())
    if (this.options.debug) {
      this.debugView = new DebugView(this.container)
    }
  }

  onAdd(map: Map) {
    this.map = map
    this.map.on('touchmove', () => {
      if (this.active) {
        this.turnOff()
        this.active = false
      }
    })
    return this.container
  }

  onRemove() {
    this.map = undefined
    this.turnOff()
  }

  on(type: string, callback: any) {
    if (!eventTypes.includes(type)) {
      throw new Error(`Event type ${type} is not supported.`)
    }
    switch (type) {
      case 'deviceorientation':
        this.deviceorientationCallback = callback
        break
      case 'turnon':
        this.turnonCallback = callback
        break
      case 'turnoff':
        this.turnoffCallback = callback
        break
    }
  }

  turnOn() {
    this.compassButton.turnOn()
    this.enableDeviceOrientation()

    setTimeout(() => {
      if (this.active && this.currentHeading === undefined) {
        this.disable()
      }
    }, this.options.timeout)

    if (this.turnonCallback) {
      this.turnonCallback()
    }
    this.active = true
  }

  turnOff() {
    this.compassButton.turnOff()
    window.removeEventListener(
      'deviceorientation',
      this.onDeviceOrientation,
      true,
    )
    if (this.options.debug) {
      this.clearDebugView()
    }
    if (this.turnoffCallback) {
      this.turnoffCallback()
    }
    this.active = false
  }

  private onClick() {
    if (this.active) {
      this.turnOff()
    } else {
      this.turnOn()
    }
  }

  private enableDeviceOrientation() {
    // For iOS 13 and later
    // refs: https://developer.mozilla.org/en-US/docs/Web/API/DeviceOrientationEvent#browser_compatibility
    if ('requestPermission' in window.DeviceOrientationEvent) {
      // @ts-ignore
      window.DeviceOrientationEvent.requestPermission()
        .then((response: string) => {
          if (response === 'granted') {
            window.addEventListener(
              'deviceorientation',
              this.onDeviceOrientation,
              true,
            )
          } else {
            this.disable()
          }
        })
        .catch(() => {
          this.disable()
        })
      return
    }
    window.addEventListener('deviceorientation', this.onDeviceOrientation, true)
  }

  private onDeviceOrientation = (event: DeviceOrientationEvent) => {
    if (!this.map) return
    const webkitEvent = event as WebkitDeviceOrientationEvent
    this.currentHeading = webkitEvent.webkitCompassHeading
    this.currentAccuracy = webkitEvent.webkitCompassAccuracy
    if (this.deviceorientationCallback) {
      this.deviceorientationCallback(webkitEvent)
    }
    if (this.options.debug) {
      this.updateDebugView()
    }
    if (this.currentHeading === undefined) {
      return
    }
    const bearing = this.map.getBearing()
    if (
      this.options.accuracy &&
      this.currentAccuracy &&
      this.currentAccuracy < this.options.accuracy
    ) {
      return
    }
    if (Math.abs(this.currentHeading - bearing) >= 1) {
      this.map?.setBearing(this.currentHeading)
    }
    this.compassButton.stopLoading()
  }

  private updateDebugView() {
    this.debugView?.update(`${this.currentHeading}`, `${this.currentAccuracy}`)
  }

  private clearDebugView() {
    this.debugView?.update('', '')
  }

  private disable() {
    this.compassButton.disable()
    this.turnOff()
  }
}
