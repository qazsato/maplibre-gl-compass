import type { CompassEvent } from '../core/Compass'
import './DebugView.css'

export class DebugView {
  private element: HTMLElement
  private eventTimestamps: number[] = []

  constructor(parent: HTMLElement) {
    this.element = document.createElement('div')
    this.element.classList.add('maplibregl-ctrl')
    this.element.innerHTML = `
    <dl class="maplibregl-ctrl-compass-heading-debug">
      <dt>event</dt>
      <dd class="event-type"></dd>
      <dt>heading</dt>
      <dd class="heading"></dd>
      <dt>alpha</dt>
      <dd class="alpha"></dd>
      <dt>beta</dt>
      <dd class="beta"></dd>
      <dt>gamma</dt>
      <dd class="gamma"></dd>
      <dt>count</dt>
      <dd class="count"></dd>
    </dl>
    `
    parent.appendChild(this.element)
  }

  update(e?: CompassEvent) {
    if (!e) {
      this.clear()
      return
    }

    const now = Date.now()
    this.eventTimestamps.push(now)
    this.eventTimestamps = this.eventTimestamps.filter((ts) => now - ts <= 1000)

    const eventType = e.originalEvent.type
    const heading = e.heading != null ? e.heading.toFixed(4) : ''
    const alpha =
      e.originalEvent.alpha != null ? e.originalEvent.alpha.toFixed(4) : ''
    const beta =
      e.originalEvent.beta != null ? e.originalEvent.beta.toFixed(4) : ''
    const gamma =
      e.originalEvent.gamma != null ? e.originalEvent.gamma.toFixed(4) : ''
    const count = `${this.eventTimestamps.length} events/sec`

    this.updateField('.event-type', eventType)
    this.updateField('.heading', heading)
    this.updateField('.alpha', alpha)
    this.updateField('.beta', beta)
    this.updateField('.gamma', gamma)
    this.updateField('.count', count)
  }

  private clear() {
    const fields = [
      '.event-type',
      '.heading',
      '.alpha',
      '.beta',
      '.gamma',
      '.count',
    ]
    fields.forEach((selector) => this.updateField(selector, ''))
  }

  private updateField(selector: string, value: string) {
    const element = this.element.querySelector(selector)
    if (element) element.textContent = value
  }
}
