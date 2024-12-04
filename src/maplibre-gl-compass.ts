import { IControl, Map } from 'maplibre-gl'
import { CompassButton } from './components/CompassButton'
import { DebugView } from './components/DebugView'

export type CompassEvent = {
  heading: number | undefined
  originalEvent: WebkitDeviceOrientationEvent
}

// https://developer.mozilla.org/en-US/docs/Web/API/DeviceOrientationEvent
export type WebkitDeviceOrientationEvent = DeviceOrientationEvent & {
  webkitCompassHeading?: number
  webkitCompassAccuracy?: number
}

type CompassControlOptions = {
  debug?: boolean
  visible?: boolean
  timeout?: number
}

const defaultOptions: CompassControlOptions = {
  debug: false,
  visible: true,
  timeout: 3000, // ms
}

const eventTypes = ['compass', 'turnon', 'turnoff']

export class CompassControl implements IControl {
  private map: Map | undefined
  private container = document.createElement('div')
  private compassButton: CompassButton
  private debugView: DebugView | undefined
  private options: CompassControlOptions

  private active = false
  private currentEvent: WebkitDeviceOrientationEvent | undefined
  private currentHeading: number | undefined

  private compassCallback: ((event: CompassEvent) => void) | undefined
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
      case 'compass':
        this.compassCallback = callback
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
    this.listenDeviceOrientation()
    this.listenDeviceOrientationAbsolute()

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
    window.removeEventListener(
      'deviceorientationabsolute',
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

  private listenDeviceOrientation() {
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

  private listenDeviceOrientationAbsolute() {
    window.addEventListener(
      'deviceorientationabsolute',
      this.onDeviceOrientation,
      true,
    )
  }

  private onDeviceOrientation = (event: DeviceOrientationEvent) => {
    if (!this.map) return
    this.currentEvent = event as WebkitDeviceOrientationEvent
    this.currentHeading = this.calculateCompassHeading(this.currentEvent)

    if (event.type === 'deviceorientationabsolute' && event.alpha != null) {
      window.removeEventListener(
        'deviceorientation',
        this.onDeviceOrientation,
        true,
      )
    }

    if (this.compassCallback) {
      this.compassCallback({
        heading: this.currentHeading,
        originalEvent: this.currentEvent,
      })
    }
    if (this.options.debug) {
      this.updateDebugView()
    }
    if (this.currentHeading === undefined) {
      return
    }
    const bearing = this.map.getBearing()
    if (Math.abs(this.currentHeading - bearing) >= 1) {
      this.map?.setBearing(this.currentHeading)
    }
    this.compassButton.stopLoading()
  }

  private updateDebugView() {
    this.debugView?.update(this.currentHeading, this.currentEvent)
  }

  private clearDebugView() {
    this.debugView?.update()
  }

  private disable() {
    this.compassButton.disable()
    this.turnOff()
  }

  private calculateCompassHeading(event: WebkitDeviceOrientationEvent) {
    if (event.webkitCompassHeading != null) {
      return event.webkitCompassHeading
    }
    if (event.alpha == null) {
      return undefined
    }
    let compassHeading = 360 - event.alpha
    if (compassHeading < 0) {
      compassHeading += 360
    }
    return compassHeading
  }
}
