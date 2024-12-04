import { WebkitDeviceOrientationEvent } from '../core/Compass'
import './DebugView.css'

export class DebugView {
  private element: HTMLElement

  constructor(parent: HTMLElement) {
    this.element = document.createElement('div')
    this.element.classList.add('maplibregl-ctrl')
    this.element.innerHTML = `
    <ul class="maplibregl-ctrl-compass-heading-debug">
      <li><b>event</b>: <span class="event-name"></span></li>
      <li><b>heading</b>: <span class="heading"></span></li>
      <li><b>alpha</b>: <span class="alpha"></span></li>
      <li><b>beta</b>: <span class="beta"></span></li>
      <li><b>gamma</b>: <span class="gamma"></span></li>
    </ul>
    `
    parent.appendChild(this.element)
  }

  update(heading?: number, event?: WebkitDeviceOrientationEvent) {
    const eventName = this.element.querySelector('.event-name')
    const headingSpan = this.element.querySelector('.heading')
    const alphaSpan = this.element.querySelector('.alpha')
    const betaSpan = this.element.querySelector('.beta')
    const gammaSpan = this.element.querySelector('.gamma')
    if (eventName) eventName.textContent = event?.type || ''
    if (headingSpan) headingSpan.textContent = `${heading || ''}`
    if (alphaSpan) alphaSpan.textContent = `${event?.alpha || ''}`
    if (betaSpan) betaSpan.textContent = `${event?.beta || ''}`
    if (gammaSpan) gammaSpan.textContent = `${event?.gamma || ''}`
  }
}
