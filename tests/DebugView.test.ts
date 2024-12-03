import { describe, expect, beforeEach, it } from '@jest/globals'
import { DebugView } from '../src/components/DebugView'

describe('DebugView', () => {
  let parentElement: HTMLElement
  let debugView: DebugView

  beforeEach(() => {
    parentElement = document.createElement('div')
    debugView = new DebugView(parentElement)
  })

  it('should create a debug view and append it to the parent element', () => {
    const debugElement = parentElement.querySelector('.maplibregl-ctrl')
    expect(debugElement).toBeTruthy()
    expect(
      debugElement?.querySelector('.maplibregl-ctrl-compass-heading-debug'),
    ).toBeTruthy()
  })

  it('should update heading values', () => {
    debugView.update('180.123')

    const headingSpan = parentElement.querySelector('.heading')
    expect(headingSpan?.textContent).toBe('180.123')
  })

  it('should handle missing elements gracefully', () => {
    const headingSpan = parentElement.querySelector('.heading')
    headingSpan?.remove()

    const updatedHeadingSpan = parentElement.querySelector('.heading')

    expect(() => debugView.update('180.123')).not.toThrow()
    expect(updatedHeadingSpan).toBeNull()
  })
})
