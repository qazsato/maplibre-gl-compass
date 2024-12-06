import { describe, expect, beforeEach, it, jest } from '@jest/globals'
import { Map } from 'maplibre-gl'
import { CompassControl } from '../src/maplibre-gl-compass'

jest.mock('maplibre-gl', () => ({
  Map: jest.fn(() => ({
    on: jest.fn(),
    off: jest.fn(),
    getBearing: jest.fn(() => 0),
    setBearing: jest.fn(),
  })),
}))

describe('CompassControl', () => {
  let map: Map
  let compassControl: CompassControl

  beforeEach(() => {
    Object.defineProperty(window, 'DeviceOrientationEvent', {
      value: {
        // @ts-ignore
        requestPermission: jest.fn().mockResolvedValue('granted'),
      },
      writable: true,
    })

    map = new Map({
      container: 'app',
      style: 'https://exmaple.com/style.json',
      center: [139.7538, 35.6674],
      zoom: 11,
    })
    compassControl = new CompassControl()
  })

  it('should initialize with default options', () => {
    expect(compassControl).toBeDefined()
  })

  it('should add the control to the map', () => {
    const container = compassControl.onAdd(map)
    expect(container).toBeInstanceOf(HTMLElement)
  })

  it('should remove the control from the map', () => {
    compassControl.onRemove()
    expect(compassControl['map']).toBeUndefined()
  })

  it('should trigger the turnOn and turnOff callbacks', () => {
    const mockTurnOnCallback = jest.fn()
    const mockTurnOffCallback = jest.fn()

    compassControl.on('turnon', mockTurnOnCallback)
    compassControl.on('turnoff', mockTurnOffCallback)

    compassControl.turnOn()
    expect(mockTurnOnCallback).toHaveBeenCalled()

    compassControl.turnOff()
    expect(mockTurnOffCallback).toHaveBeenCalled()
  })

  it('should toggle state when clicked', () => {
    compassControl.turnOn()
    expect(compassControl['active']).toBe(true)

    compassControl.turnOff()
    expect(compassControl['active']).toBe(false)
  })

  it('should handle unsupported event types', () => {
    expect(() => compassControl.on('unsupportedEvent', jest.fn())).toThrow(
      'Event type unsupportedEvent is not supported.',
    )
  })
})
