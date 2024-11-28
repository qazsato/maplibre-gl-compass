import { IControl, Map } from 'maplibre-gl'

type CompassControlOptions = {
  tilt: number
  accuracy: number
  debug: boolean
  timeout: number
}

const defaultOptions: CompassControlOptions = {
  tilt: 0,
  accuracy: 10,
  debug: false,
  timeout: 3000, // ms
}

export class CompassControl implements IControl {
  private map: Map | undefined
  private button: HTMLButtonElement | undefined
  private options: CompassControlOptions

  private active = false
  private currentCompassHeading: number | undefined

  constructor (options?: CompassControlOptions) {
    this.options = { ...defaultOptions, ...options }
  }

  onAdd (map: Map) {
    this.map = map
    this.button = this.createButton()

    const container = document.createElement('div')
    container.classList.add('maplibregl-ctrl', 'maplibregl-ctrl-group')
    container.appendChild(this.button)

    return container
  }

  onRemove () {
    this.map = undefined
  }

  private createButton () {
    const span = document.createElement('span')
    span.classList.add('maplibregl-ctrl-icon')

    const button = document.createElement('button')
    button.classList.add('maplibregl-ctrl-compass-heading')
    button.addEventListener('click', () => this.onClick())
    button.appendChild(span)

    return button
  }

  private onClick () {
    this.active ? this.turnOff() : this.turnOn()
    this.active = !this.active
  }


  enableDeviceOrientation() {
    // For iOS 13 and later
    // refs: https://developer.mozilla.org/en-US/docs/Web/API/DeviceOrientationEvent#browser_compatibility
    if ('requestPermission' in window.DeviceOrientationEvent) {
      // @ts-ignore
      window.DeviceOrientationEvent.requestPermission().then((response) => {
        if (response === 'granted') {
          window.addEventListener('deviceorientation', this.onDeviceOrientation, true)
        }
      })
      return
    }
    window.addEventListener('deviceorientation', this.onDeviceOrientation, true)
  }

  private onDeviceOrientation = (event: DeviceOrientationEvent) =>{
    // @ts-ignore
    const heading = event.webkitCompassHeading
    if (heading !== undefined) {
      this.currentCompassHeading = heading
      this.map?.setBearing(heading)
      this.hideWaiting()
    }
  }

  private turnOff () {
    if (!this.button) return
    this.button.classList.remove('maplibregl-ctrl-compass-heading-active')
    window.removeEventListener('deviceorientation', this.onDeviceOrientation)
    this.hideWaiting()
  }

  private turnOn () {
    if (!this.button) return
    this.showWaiting()
    this.button.classList.add('maplibregl-ctrl-compass-heading-active')
    this.enableDeviceOrientation()

    setTimeout(() => {
      if (this.active && this.currentCompassHeading === undefined) {
        this.button?.setAttribute('disabled', 'disabled')
        this.button?.classList.remove('maplibregl-ctrl-compass-heading-active')
        this.hideWaiting()
      }
    }, this.options.timeout)
  }

  private showWaiting () {
    this.button?.classList.add('maplibregl-ctrl-compass-heading-waiting')
  }

  private hideWaiting () {
    this.button?.classList.remove('maplibregl-ctrl-compass-heading-waiting')
  }
}