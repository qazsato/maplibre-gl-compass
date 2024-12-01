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

let userOperating = false
map.on('touchstart', () => (userOperating = true))
map.on('touchend', () => (userOperating = false))
map.on('mousedown', () => (userOperating = true))
map.on('mouseup', () => (userOperating = false))
map.on('wheel', () => {
  userOperating = true
  setTimeout(() => (userOperating = false), 100)
})

const protocol = new Protocol()
addProtocol('pmtiles', protocol.tile)
const compass = new CompassControl()
const navigation = new NavigationControl({ showCompass: true })
const geolocate = new GeolocateControl({
  positionOptions: { enableHighAccuracy: true },
  trackUserLocation: true,
})

geolocate.on('userlocationlostfocus', () => {
  if (!userOperating) {
    geolocate.trigger()
  }
})

compass.on('turnon', () => {
  map.setPitch(45)
  if (geolocate._watchState === 'OFF') {
    geolocate.trigger()
  }
})

compass.on('turnoff', () => {
  map.setPitch(0)
  map.setBearing(0)
})

map.addControl(navigation, 'top-right')
map.addControl(geolocate, 'top-right')
map.addControl(compass, 'top-right')
