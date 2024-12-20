import { describe, expect, beforeEach, it } from '@jest/globals'
import { DebugView } from '../src/components/DebugView'
import type { WebkitDeviceOrientationEvent } from '../src/core/Compass'

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
    debugView.update({
      heading: 180.123,
      originalEvent: {
        type: 'deviceorientation',
        alpha: 0,
        beta: 0,
        gamma: 0,
      } as WebkitDeviceOrientationEvent,
    })
    const headingSpan = parentElement.querySelector('.heading')
    expect(headingSpan?.textContent).toBe('180.1230')
  })

  it('should handle missing elements gracefully', () => {
    const headingSpan = parentElement.querySelector('.heading')
    headingSpan?.remove()

    const updatedHeadingSpan = parentElement.querySelector('.heading')

    expect(() =>
      debugView.update({
        heading: 180.123,
        originalEvent: {
          type: 'deviceorientation',
          alpha: 0,
          beta: 0,
          gamma: 0,
        } as WebkitDeviceOrientationEvent,
      }),
    ).not.toThrow()
    expect(updatedHeadingSpan).toBeNull()
  })
})
