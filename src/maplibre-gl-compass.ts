import { IControl, Map } from 'maplibre-gl'
import './maplibre-gl-compass.css'

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
  visible: true
}

const eventTypes = ['deviceorientation', 'turnon', 'turnoff']

export class CompassControl implements IControl {
  private map: Map | undefined
  private button: HTMLButtonElement | undefined
  private debugView: HTMLElement | undefined
  private options: CompassControlOptions

  private active = false
  private currentHeading: number | undefined
  private currentAccuracy: number | undefined

  // Callbacks
  private deviceorientationCallback: ((event: WebkitDeviceOrientationEvent) => void) | undefined
  private turnonCallback: (() => void) | undefined
  private turnoffCallback: (() => void) | undefined

  constructor (options?: CompassControlOptions) {
    this.options = { ...defaultOptions, ...options }
  }

  onAdd (map: Map) {
    this.map = map
    this.button = this.createButton()

    const container = document.createElement('div')
    // compassButton
    const buttonContainer = document.createElement('div')
    buttonContainer.classList.add('maplibregl-ctrl', 'maplibregl-ctrl-group')
    buttonContainer.appendChild(this.button)
    if (!this.options.visible) {
      buttonContainer.style.display = 'none'
    }
    container.appendChild(buttonContainer)
    // debugView
    if (this.options.debug) {
      this.debugView = this.createDebugView()
      container.appendChild(this.debugView)
    }

    this.map.on('touchmove', () => {
      if (this.active) {
        this.turnOff()
        this.active = false
      }
    })
    return container
  }

  onRemove () {
    this.map = undefined
  }

  on (type: string, callback: any) {
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

  turnOn () {
    this.showWaiting()
    this.button?.classList.add('maplibregl-ctrl-compass-heading-active')
    this.enableDeviceOrientation()

    setTimeout(() => {
      if (this.active && this.currentHeading === undefined) {
        this.disableButton()
      }
    }, this.options.timeout)

    if (this.turnonCallback) {
      this.turnonCallback()
    }
    this.active = true
  }

  turnOff () {
    this.button?.classList.remove('maplibregl-ctrl-compass-heading-active')
    window.removeEventListener('deviceorientation', this.onDeviceOrientation, true)
    this.hideWaiting()
    if (this.options.debug) {
      this.clearDebugView()
    }

    if (this.turnoffCallback) {
      this.turnoffCallback()
    }
    this.active = false
  }

  private createButton () {
    const button = document.createElement('button')
    button.classList.add('maplibregl-ctrl-compass-heading')
    button.addEventListener('click', () => this.onClick())

    const span = document.createElement('span')
    span.classList.add('maplibregl-ctrl-icon')

    button.appendChild(span)
    return button
  }

  private createDebugView () {
    const div = document.createElement('div')
    div.classList.add('maplibregl-ctrl')
    div.innerHTML = `
    <ul class="maplibregl-ctrl-compass-heading-debug">
      <li><b>bearing</b>: <span class="heading"></span></li>
      <li><b>accuracy</b>: <span class="accuracy"></span></li>
    </ul>
    `
    return div
  }

  private onClick () {
    this.active ? this.turnOff() : this.turnOn()
  }

  private enableDeviceOrientation() {
    // For iOS 13 and later
    // refs: https://developer.mozilla.org/en-US/docs/Web/API/DeviceOrientationEvent#browser_compatibility
    if ('requestPermission' in window.DeviceOrientationEvent) {
      // @ts-ignore
      window.DeviceOrientationEvent.requestPermission()
      .then((response: string) => {
        if (response === 'granted') {
          window.addEventListener('deviceorientation', this.onDeviceOrientation, true)
        } else {
          this.disableButton()
        }
      }).catch(() => {
        this.disableButton()
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
      this.writeDebugView()
    }
    if (this.currentHeading === undefined) {
      return
    }
    const bearing = this.map.getBearing()
    if (this.options.accuracy && this.currentAccuracy && this.currentAccuracy < this.options.accuracy) {
      return
    }
    if (Math.abs(this.currentHeading - bearing) >= 1) {
      this.map?.setBearing(this.currentHeading)
    }
    this.hideWaiting()
  }

  private writeDebugView () {
    if (!this.debugView) return
    this.debugView.querySelector('.heading')!.textContent = `${this.currentHeading}`
    this.debugView.querySelector('.accuracy')!.textContent = `${this.currentAccuracy}`
  }

  private clearDebugView () {
    if (!this.debugView) return
    this.debugView.querySelector('.heading')!.textContent = ''
    this.debugView.querySelector('.accuracy')!.textContent = ''
  }

  private disableButton () {
    if (!this.button) return
    this.button.setAttribute('disabled', 'disabled')
    this.turnOff()
  }

  private showWaiting () {
    this.button?.classList.add('maplibregl-ctrl-compass-heading-waiting')
  }

  private hideWaiting () {
    this.button?.classList.remove('maplibregl-ctrl-compass-heading-waiting')
  }
}