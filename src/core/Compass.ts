export type CompassEvent = {
  heading: number | undefined
  originalEvent: WebkitDeviceOrientationEvent
}

export type CompassError = {
  code: 'TIMEOUT' | 'PERMISSION_DENIED'
  message: string
}

// https://developer.mozilla.org/en-US/docs/Web/API/DeviceOrientationEvent
export type WebkitDeviceOrientationEvent = DeviceOrientationEvent & {
  webkitCompassHeading?: number
  webkitCompassAccuracy?: number
}

export class Compass {
  private static readonly eventTypes = ['deviceorientation', 'error'] as const
  private deviceOrientationCallback: ((event: CompassEvent) => void) | undefined
  private errorCallback: ((error: CompassError) => void) | undefined
  private isListening = false
  private historySize = 100
  private headingHistory: number[] = []

  on(
    type: (typeof Compass.eventTypes)[number],
    callback: ((event: CompassEvent) => void) | ((error: CompassError) => void),
  ) {
    if (!Compass.eventTypes.includes(type)) {
      throw new Error(`Event type ${type} is not supported.`)
    }
    switch (type) {
      case 'deviceorientation':
        this.deviceOrientationCallback = callback as (
          event: CompassEvent,
        ) => void
        break
      case 'error':
        this.errorCallback = callback as (error: CompassError) => void
        break
    }
  }

  turnOn() {
    if (this.isListening) {
      return
    }
    this.addDeviceOrientationListener()
    this.addDeviceOrientationAbsoluteListener()
    this.isListening = true
  }

  turnOff() {
    this.removeDeviceOrientationListener()
    this.removeDeviceOrientationAbsoluteListener()
    this.isListening = false
  }

  private addDeviceOrientationListener() {
    // For iOS 13 and later
    // refs: https://developer.mozilla.org/en-US/docs/Web/API/DeviceOrientationEvent#browser_compatibility
    if ('requestPermission' in window.DeviceOrientationEvent) {
      // @ts-ignore
      window.DeviceOrientationEvent.requestPermission()
        .then((response: string) => {
          if (response !== 'granted') {
            this.handleError('PERMISSION_DENIED', 'Permission denied')
            return
          }
          window.addEventListener(
            'deviceorientation',
            this.onDeviceOrientation,
            true,
          )
        })
        .catch(() => this.handleError('PERMISSION_DENIED', 'Permission denied'))
      return
    }
    window.addEventListener('deviceorientation', this.onDeviceOrientation, true)
  }

  private removeDeviceOrientationListener() {
    window.removeEventListener(
      'deviceorientation',
      this.onDeviceOrientation,
      true,
    )
  }

  private addDeviceOrientationAbsoluteListener() {
    window.addEventListener(
      'deviceorientationabsolute',
      this.onDeviceOrientation,
      true,
    )
  }

  private removeDeviceOrientationAbsoluteListener() {
    window.removeEventListener(
      'deviceorientationabsolute',
      this.onDeviceOrientation,
      true,
    )
  }

  private onDeviceOrientation = (event: WebkitDeviceOrientationEvent) => {
    if (event.type === 'deviceorientationabsolute' && event.alpha != null) {
      this.removeDeviceOrientationListener()
    } else if (
      event.type === 'deviceorientation' &&
      event.webkitCompassHeading != null
    ) {
      this.removeDeviceOrientationAbsoluteListener()
    }

    const heading = this.calculateCompassHeading(event)
    if (heading != null) {
      this.headingHistory.push(heading)
      if (this.headingHistory.length > this.historySize) {
        this.headingHistory.shift()
      }
    }
    const averageHeading = this.calculateMovingAverage()

    if (this.deviceOrientationCallback) {
      this.deviceOrientationCallback({
        heading: averageHeading,
        originalEvent: event,
      })
    }
  }

  private calculateCompassHeading(event: WebkitDeviceOrientationEvent) {
    if (event.webkitCompassHeading != null) {
      return event.webkitCompassHeading
    }
    if (event.alpha == null) {
      return undefined
    }
    let compassHeading = 360 - event.alpha
    if (compassHeading < 0) {
      compassHeading += 360
    }
    return compassHeading
  }

  private calculateMovingAverage() {
    if (this.headingHistory.length === 0) {
      return undefined
    }
    const sinSum = this.headingHistory.reduce(
      (acc, heading) => acc + Math.sin((heading * Math.PI) / 180),
      0,
    )
    const cosSum = this.headingHistory.reduce(
      (acc, heading) => acc + Math.cos((heading * Math.PI) / 180),
      0,
    )
    const averageRadians = Math.atan2(
      sinSum / this.headingHistory.length,
      cosSum / this.headingHistory.length,
    )
    let averageDegrees = (averageRadians * 180) / Math.PI
    if (averageDegrees < 0) {
      averageDegrees += 360
    }
    return averageDegrees
  }

  private handleError(code: 'TIMEOUT' | 'PERMISSION_DENIED', message: string) {
    this.errorCallback?.({ code, message })
  }
}
