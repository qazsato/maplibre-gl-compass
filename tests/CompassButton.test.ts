/**
 * @jest-environment jsdom
 */
import { describe, expect, beforeEach, it, jest } from '@jest/globals'
import { CompassButton } from '../src/components/CompassButton'

describe('CompassButton', () => {
  let parentElement: HTMLElement
  let compassButton: CompassButton

  beforeEach(() => {
    parentElement = document.createElement('div')
    compassButton = new CompassButton(parentElement)
  })

  it('should create a button and append it to the parent element', () => {
    expect(
      parentElement.querySelector('.maplibregl-ctrl-compass-heading'),
    ).toBeTruthy()
  })

  it('should allow adding a click event listener', () => {
    const mockCallback = jest.fn()
    compassButton.on('click', mockCallback)

    const button = parentElement.querySelector('button') as HTMLButtonElement
    button.click()

    expect(mockCallback).toHaveBeenCalled()
  })

  it('should throw an error for unsupported event types', () => {
    expect(() => compassButton.on('hover', jest.fn())).toThrowError(
      'Event type hover is not supported.',
    )
  })

  it('should enable and disable the button state', () => {
    const button = parentElement.querySelector('button') as HTMLButtonElement

    compassButton.turnOn()
    expect(
      button.classList.contains('maplibregl-ctrl-compass-heading-active'),
    ).toBe(true)

    compassButton.turnOff()
    expect(
      button.classList.contains('maplibregl-ctrl-compass-heading-active'),
    ).toBe(false)

    compassButton.disable()
    expect(button.disabled).toBe(true)
  })

  it('should toggle loading state', () => {
    const button = parentElement.querySelector('button') as HTMLButtonElement

    compassButton.startLoading()
    expect(
      button.classList.contains('maplibregl-ctrl-compass-heading-waiting'),
    ).toBe(true)

    compassButton.stopLoading()
    expect(
      button.classList.contains('maplibregl-ctrl-compass-heading-waiting'),
    ).toBe(false)
  })

  it('should hide button container when visible is false', () => {
    const parentElement = document.createElement('div')
    new CompassButton(parentElement, false)
    const container = parentElement.querySelector(
      '.maplibregl-ctrl',
    ) as HTMLDivElement
    expect(container.style.display).toBe('none')
  })

  it('should not throw error when clickCallback is undefined', () => {
    const button = parentElement.querySelector('button') as HTMLButtonElement
    expect(() => button.click()).not.toThrow()
  })
})
