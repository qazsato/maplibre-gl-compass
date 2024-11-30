import './style.css'
import {
  Map,
  addProtocol,
  NavigationControl,
  GeolocateControl,
} from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { Protocol } from 'pmtiles'
import { CompassControl } from './maplibre-gl-compass'

const map = new Map({
  container: 'app',
  style:
    'https://api.protomaps.com/styles/v4/light/en.json?key=afde32549db516d8',
  center: [139.7538, 35.6674],
  zoom: 11,
})
const protocol = new Protocol()
addProtocol('pmtiles', protocol.tile)
const compass = new CompassControl({
  debug: true,
})

compass.on('turnon', () => {
  map.setPitch(45)
})

compass.on('turnoff', () => {
  map.setPitch(0)
  map.setBearing(0)
})

map.addControl(compass, 'top-left')
map.addControl(new NavigationControl({ showCompass: true }), 'top-right')
map.addControl(
  new GeolocateControl({
    positionOptions: { enableHighAccuracy: true },
    trackUserLocation: true,
  }),
  'top-right',
)
