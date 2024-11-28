import './style.css'
import { Map, addProtocol, NavigationControl, GeolocateControl } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { Protocol } from 'pmtiles'
import { CompassControl } from './maplibre-gl-compass'
import './maplibre-gl-compass.css'

const map = new Map({
  container: 'app',
  style: 'https://tiles.geodig.jp/styles/basic.json',
  center: [139.7538, 35.6674],
  zoom: 11,
  hash: true
})
const protocol = new Protocol()
addProtocol('pmtiles', protocol.tile)
map.addControl(new CompassControl(), 'top-right')
map.addControl(new NavigationControl({ showCompass: true }), 'top-right')
map.addControl(new GeolocateControl({ positionOptions: { enableHighAccuracy: true }, trackUserLocation: true }), 'top-right')