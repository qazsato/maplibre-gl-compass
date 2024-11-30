# maplibre-gl-compass

[![npm version](https://badge.fury.io/js/maplibre-gl-compass.svg)](https://badge.fury.io/js/maplibre-gl-compass)
[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A **heading-up** compass for MapLibre GL JS 🧭

## About

**maplibre-gl-compass** is a plugin for MapLibre GL JS.  
This plugin rotates the map based on the values from the [deviceorientation event](https://developer.mozilla.org/en-US/docs/Web/API/Window/deviceorientation_event).  
Therefore, it can only be used on devices equipped with an orientation sensor, such as mobile devices.

Demo page is [here](https://qazsato.github.io/maplibre-gl-compass).

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
  accuracy: 10.0, // If the accuracy is lower than this value, the map bearing will not be updated. Default is not set.
  debug: true,    // Show debug view. Default is false.
  timeout: 10000, // The maximum time to wait for a DeviceOrientationEvent. Default is 3000 [ms].
  visible: true,  // Show the compass button. Default is true.
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

compass.on('deviceorientation', (event: WebkitDeviceOrientationEvent) => {
  // Your custom logic is here!
})

map.addControl(compass)
```

## License

This project is licensed under the terms of the [MIT license](https://github.com/qazsato/maplibre-gl-compass/blob/main/LICENSE).
