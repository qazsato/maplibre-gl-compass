# maplibre-gl-compass

A **heading-up** compass for MapLibre GL JS 🧭

## Installation

```sh
npm install maplibre-gl-compass
```

## Usage

### Simple

```js
import { Map } from 'maplibre-gl'
import { CompassControl } from 'maplibre-gl-compass'
import 'maplibre-gl-compass/style.css'

const map = new Map({/* YOUR_MAP_OPTION */})

map.addControl(new CompassControl())
```

### Advanced

```js
import { Map } from 'maplibre-gl'
import { CompassControl } from 'maplibre-gl-compass'
import type { WebkitDeviceOrientationEvent } from 'maplibre-gl-compass'
import 'maplibre-gl-compass/style.css'

const map = new Map({/* YOUR_MAP_OPTION */})

const compass = new CompassControl({
  accuracy: 10.0, // Lower than this value, the map bearing will not be updated. Default is not set.
  debug: true,    // Show debug view. Default is false.
  timeout: 10000, // Max time to wait for a DeviceOrientationEvent. Default is 3000 [ms].
  visible: true,  // Show the compass button. Default is true.
})

compass.on('turnon', () => {
  // Set pitch when compass is turned on.
  map.setTilt(45)
})

compass.on('turnoff', () => {
  // Restore pitch and north up when compass is turned off
  map.setTilt(0)
  map.setBearing(0)
})

compass.on('deviceorientation', (event: WebkitDeviceOrientationEvent) => {
  // Your costome logic is here!
})

map.addControl(compass)
```

## License

This project is licensed under the terms of the [MIT license](https://github.com/qazsato/maplibre-gl-compass/blob/main/LICENSE).