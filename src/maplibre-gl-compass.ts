import { IControl, Map } from 'maplibre-gl'

type CompassControlOptions = {
  tilt?: number
  accuracy?: number
  debug?: boolean
  timeout?: number
}

const defaultOptions: CompassControlOptions = {
  tilt: 0,
  accuracy: 10,
  debug: false,
  timeout: 3000, // ms
}

export class CompassControl implements IControl {
  private map: Map | undefined
  private button: HTMLElement | undefined
  private debugView: HTMLElement | undefined
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
    container.appendChild(this.button)

    if (this.options.debug) {
      this.debugView = this.createDebugView()
      container.appendChild(this.debugView)
    }

    return container
  }

  onRemove () {
    this.map = undefined
  }

  private createButton () {
    const container = document.createElement('div')
    container.classList.add('maplibregl-ctrl', 'maplibregl-ctrl-group')

    const button = document.createElement('button')
    button.classList.add('maplibregl-ctrl-compass-heading')
    button.addEventListener('click', () => this.onClick())

    const span = document.createElement('span')
    span.classList.add('maplibregl-ctrl-icon')

    button.appendChild(span)
    container.appendChild(button)

    return container
  }

  private createDebugView () {
    const div = document.createElement('div')
    div.classList.add('maplibregl-ctrl')
    div.innerHTML = `
    <ul class="maplibregl-ctrl-compass-heading-debug">
      <li><b>heading</b>: <span class="heading"></span></li>
      <li><b>accuracy</b>: <span class="accuracy"></span></li>
      <li>alpha: <span class="alpha"></span></li>
      <li>beta: <span class="beta"></span></li>
      <li>gamma: <span class="gamma"></span></li>
    </ul>
    `
    return div
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

  private onDeviceOrientation = (event: DeviceOrientationEvent) =>{
    if (!this.map) return
    // @ts-ignore
    const heading = event.webkitCompassHeading
    if (heading !== undefined) {
      this.currentCompassHeading = heading
      if (Math.abs(heading - this.map.getBearing()) >= 1) {
        this.map?.setBearing(heading)
      }
      this.hideWaiting()
    }

    if (this.options.debug && this.debugView) {
      // @ts-ignore
      const accuracy = event.webkitCompassAccuracy
      this.debugView.querySelector('.heading')!.textContent = `${heading}`
      this.debugView.querySelector('.accuracy')!.textContent = `${accuracy}`
      this.debugView.querySelector('.alpha')!.textContent = `${event.alpha}`
      this.debugView.querySelector('.beta')!.textContent = `${event.beta}`
      this.debugView.querySelector('.gamma')!.textContent = `${event.gamma}`
    }
  }

  private turnOff () {
    if (!this.button) return
    this.button.classList.remove('maplibregl-ctrl-compass-heading-active')
    window.removeEventListener('deviceorientation', this.onDeviceOrientation, true)
    this.hideWaiting()
  }

  private turnOn () {
    if (!this.button) return
    this.showWaiting()
    this.button.classList.add('maplibregl-ctrl-compass-heading-active')
    this.enableDeviceOrientation()

    setTimeout(() => {
      if (this.active && this.currentCompassHeading === undefined) {
        this.disableButton()
      }
    }, this.options.timeout)
  }

  private disableButton () {
    if (!this.button) return
    this.button.setAttribute('disabled', 'disabled')
    this.button.classList.remove('maplibregl-ctrl-compass-heading-active')
    this.hideWaiting()
  }

  private showWaiting () {
    this.button?.classList.add('maplibregl-ctrl-compass-heading-waiting')
  }

  private hideWaiting () {
    this.button?.classList.remove('maplibregl-ctrl-compass-heading-waiting')
  }
}