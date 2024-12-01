import './CompassButton.css'

const eventTypes = ['click']

export class CompassButton {
  private button: HTMLButtonElement
  private clickCallback: (() => void) | undefined

  constructor(parent: HTMLElement, visible = true) {
    this.button = this.createButton()
    const buttonContainer = document.createElement('div')
    buttonContainer.classList.add('maplibregl-ctrl', 'maplibregl-ctrl-group')
    buttonContainer.appendChild(this.button)
    if (!visible) {
      buttonContainer.style.display = 'none'
    }
    parent.appendChild(buttonContainer)
  }

  on(type: string, callback: () => void) {
    if (!eventTypes.includes(type)) {
      throw new Error(`Event type ${type} is not supported.`)
    }
    switch (type) {
      case 'click':
        this.clickCallback = callback
        break
    }
  }

  turnOn() {
    this.button.classList.add('maplibregl-ctrl-compass-heading-active')
    this.button.setAttribute('aria-pressed', 'true')
    this.startLoading()
  }

  turnOff() {
    this.button.classList.remove('maplibregl-ctrl-compass-heading-active')
    this.button.setAttribute('aria-pressed', 'false')
    this.stopLoading()
  }

  disable() {
    this.button.setAttribute('title', 'Compass not available')
    this.button.setAttribute('aria-label', 'Compass not available')
    this.button.setAttribute('disabled', 'disabled')
  }

  startLoading() {
    this.button.classList.add('maplibregl-ctrl-compass-heading-waiting')
  }

  stopLoading() {
    this.button.classList.remove('maplibregl-ctrl-compass-heading-waiting')
  }

  private createButton() {
    const button = document.createElement('button')
    button.classList.add('maplibregl-ctrl-compass-heading')
    button.setAttribute('title', 'Rotate map to heading-up')
    button.setAttribute('aria-label', 'Rotate map to heading-up')
    button.addEventListener('click', () => {
      if (this.clickCallback) {
        this.clickCallback()
      }
    })

    const span = document.createElement('span')
    span.classList.add('maplibregl-ctrl-icon')

    button.appendChild(span)
    return button
  }
}
