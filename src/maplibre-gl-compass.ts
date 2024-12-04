import { IControl, Map } from 'maplibre-gl'
import { CompassButton } from './components/CompassButton'
import { DebugView } from './components/DebugView'
import {
  CompassEvent,
  CompassError,
  WebkitDeviceOrientationEvent,
  Compass,
} from './core/Compass'

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

const eventTypes = ['turnon', 'turnoff', 'error', 'compass']

export class CompassControl implements IControl {
  private map: Map | undefined
  private container = document.createElement('div')
  private compass: Compass
  private compassButton: CompassButton
  private debugView: DebugView | undefined
  private options: CompassControlOptions

  private active = false
  private currentEvent: WebkitDeviceOrientationEvent | undefined
  private currentHeading: number | undefined

  private turnonCallback: (() => void) | undefined
  private turnoffCallback: (() => void) | undefined
  private errorCallback: ((error: CompassError) => void) | undefined
  private compassCallback: ((event: CompassEvent) => void) | undefined

  constructor(options?: CompassControlOptions) {
    this.options = { ...defaultOptions, ...options }
    this.compass = new Compass()
    this.compass.on('deviceorientation', (event: CompassEvent) => {
      if (!this.map) return
      this.currentEvent = event.originalEvent as WebkitDeviceOrientationEvent
      this.currentHeading = event.heading
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

      if (this.compassCallback) {
        this.compassCallback(event)
      }
    })
    this.compass.on('error', (error: CompassError) => {
      this.disable()
      if (this.errorCallback) {
        this.errorCallback(error)
      }
    })

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
      case 'turnon':
        this.turnonCallback = callback
        break
      case 'turnoff':
        this.turnoffCallback = callback
        break
      case 'error':
        this.errorCallback = callback
        break
      case 'compass':
        this.compassCallback = callback
        break
    }
  }

  turnOn() {
    this.compass.turnOn()
    this.compassButton.turnOn()

    setTimeout(() => {
      if (this.active && this.currentHeading === undefined) {
        this.disable()
        if (this.errorCallback) {
          this.errorCallback({ code: 'TIMEOUT', message: 'Timeout' })
        }
      }
    }, this.options.timeout)

    if (this.turnonCallback) {
      this.turnonCallback()
    }
    this.active = true
  }

  turnOff() {
    this.compass.turnOff()
    this.compassButton.turnOff()
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
}
