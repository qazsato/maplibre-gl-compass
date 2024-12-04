# maplibre-gl-compass

[![npm version](https://badge.fury.io/js/maplibre-gl-compass.svg)](https://badge.fury.io/js/maplibre-gl-compass)
[![npm downloads](https://img.shields.io/npm/dm/maplibre-gl-compass.svg)](https://badge.fury.io/js/maplibre-gl-compass)
[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A **heading-up** compass for MapLibre GL JS 🧭

This plugin rotates the map based on the values from the [Device orientation events](https://developer.mozilla.org/en-US/docs/Web/API/Device_orientation_events).  
Therefore, it can only be used on devices equipped with an orientation sensor, such as mobile devices.

Demo page is [here](https://qazsato.github.io/maplibre-gl-compass).

## Installation

```sh
npm install maplibre-gl-compass
```

## Usage

### Basic usage

```js
import { Map } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { CompassControl } from 'maplibre-gl-compass'
import 'maplibre-gl-compass/style.css'

const map = new Map({/* YOUR_MAP_OPTION */})

map.addControl(new CompassControl())
```

### Advanced usage

```js
import { Map } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { CompassControl } from 'maplibre-gl-compass'
import type { CompassEvent, CompassError } from 'maplibre-gl-compass'
import 'maplibre-gl-compass/style.css'

const map = new Map({/* YOUR_MAP_OPTION */})

const compass = new CompassControl({
  debug: true,    // Show debug view. Default is false.
  visible: true,  // Show compass button. Default is true.
  timeout: 10000, // The maximum time to wait for a DeviceOrientationEvent. Default is 3000 [ms].
})

compass.on('turnon', () => {
  // Set pitch when compass is turned on.
  map.setPitch(45)
})

compass.on('turnoff', () => {
  // Restore pitch and north up when compass is turned off
  map.setPitch(0)
  map.setBearing(0)
})

compass.on('compass', (event: CompassEvent) => {
  // Your custom logic is here!
})

compass.on('error', (event: CompassError) => {
  // Your custom logic is here!
})

map.addControl(compass)
```

## Options

| name    | default | description                                                |
| ------- | ------- | ---------------------------------------------------------- |
| debug   | false   | Show debug view.                                           |
| visible | true    | Show compass button.                                       |
| timeout | 3000    | The maximum time[ms] to wait for a DeviceOrientationEvent. |

## Events

| name    | description                                                                                                                                                                                                                                                 |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| turnon  | Fired when the compass is turned on.                                                                                                                                                                                                                        |
| turnoff | Fired when the compass is turned off.                                                                                                                                                                                                                       |
| error   | Fired when the compass cannot be accessed due to permission denied or a timeout.                                                                                                                                                                            |
| compass | Fired when the device orientation changes. <br> A `heading` number represents the difference between the motion of the device around the z axis of the world system and the direction of the north, expressed in degrees with values ranging from 0 to 360. |

## Reference

- https://developer.apple.com/documentation/webkitjs/deviceorientationevent
- https://developer.mozilla.org/en-US/docs/Web/API/Window/deviceorientationabsolute_event

## License

This project is licensed under the terms of the [MIT license](https://github.com/qazsato/maplibre-gl-compass/blob/main/LICENSE).
