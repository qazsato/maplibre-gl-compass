import './DebugView.css'

export class DebugView {
  private element: HTMLElement

  constructor(parent: HTMLElement) {
    this.element = document.createElement('div')
    this.element.classList.add('maplibregl-ctrl')
    this.element.innerHTML = `
    <ul class="maplibregl-ctrl-compass-heading-debug">
      <li><b>heading</b>: <span class="heading"></span></li>
      <li><b>accuracy</b>: <span class="accuracy"></span></li>
      <li><b>count</b>: <span class="count"></span></li>
    </ul>
    `
    parent.appendChild(this.element)
  }

  update(heading: string, accuracy: string, count: string) {
    const headingSpan = this.element.querySelector('.heading')
    const accuracySpan = this.element.querySelector('.accuracy')
    const countSpan = this.element.querySelector('.count')
    if (headingSpan) {
      headingSpan.textContent = heading
    }
    if (accuracySpan) {
      accuracySpan.textContent = accuracy
    }
    if (countSpan) {
      countSpan.textContent = count
    }
  }
}
