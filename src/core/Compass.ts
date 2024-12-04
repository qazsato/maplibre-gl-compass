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

const eventTypes = ['deviceorientation', 'error']

export class Compass {
  private deviceOrientationCallback: ((event: CompassEvent) => void) | undefined
  private errorCallback: ((error: CompassError) => void) | undefined

  on(type: string, callback: any) {
    if (!eventTypes.includes(type)) {
      throw new Error(`Event type ${type} is not supported.`)
    }
    switch (type) {
      case 'deviceorientation':
        this.deviceOrientationCallback = callback
        break
      case 'error':
        this.errorCallback = callback
        break
    }
  }

  turnOn() {
    this.listenDeviceOrientation()
    this.listenDeviceOrientationAbsolute()
  }

  turnOff() {
    window.removeEventListener(
      'deviceorientation',
      this.onDeviceOrientation,
      true,
    )
    window.removeEventListener(
      'deviceorientationabsolute',
      this.onDeviceOrientation,
      true,
    )
  }

  private listenDeviceOrientation() {
    // For iOS 13 and later
    // refs: https://developer.mozilla.org/en-US/docs/Web/API/DeviceOrientationEvent#browser_compatibility
    if ('requestPermission' in window.DeviceOrientationEvent) {
      // @ts-ignore
      window.DeviceOrientationEvent.requestPermission()
        .then((response: string) => {
          if (response === 'granted') {
            window.addEventListener(
              'deviceorientation',
              this.onDeviceOrientation,
              true,
            )
          } else {
            if (this.errorCallback) {
              this.errorCallback({
                code: 'PERMISSION_DENIED',
                message: 'Permission denied',
              })
            }
          }
        })
        .catch(() => {
          if (this.errorCallback) {
            this.errorCallback({
              code: 'PERMISSION_DENIED',
              message: 'Permission denied',
            })
          }
        })
      return
    }
    window.addEventListener('deviceorientation', this.onDeviceOrientation, true)
  }

  private listenDeviceOrientationAbsolute() {
    window.addEventListener(
      'deviceorientationabsolute',
      this.onDeviceOrientation,
      true,
    )
  }

  private onDeviceOrientation = (event: WebkitDeviceOrientationEvent) => {
    if (event.type === 'deviceorientationabsolute' && event.alpha != null) {
      window.removeEventListener(
        'deviceorientation',
        this.onDeviceOrientation,
        true,
      )
    } else if (
      event.type === 'deviceorientation' &&
      event.webkitCompassHeading != null
    ) {
      window.removeEventListener(
        'deviceorientationabsolute',
        this.onDeviceOrientation,
        true,
      )
    }

    if (this.deviceOrientationCallback) {
      this.deviceOrientationCallback({
        heading: this.calculateCompassHeading(event),
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
}
