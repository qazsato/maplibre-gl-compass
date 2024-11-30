import './maplibre-gl-compass.css';
const defaultOptions = {
    timeout: 3000, // ms
    debug: false,
};
export class CompassControl {
    constructor(options) {
        Object.defineProperty(this, "map", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "button", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "debugView", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "options", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "active", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "currentHeading", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "currentAccuracy", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "onDeviceOrientation", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (event) => {
                if (!this.map)
                    return;
                const webkitEvent = event;
                this.currentHeading = webkitEvent.webkitCompassHeading;
                this.currentAccuracy = webkitEvent.webkitCompassAccuracy;
                if (this.options.debug) {
                    this.writeDebugView();
                }
                if (this.currentHeading === undefined) {
                    return;
                }
                const bearing = this.map.getBearing();
                if (this.options.accuracy && this.currentAccuracy && this.currentAccuracy < this.options.accuracy) {
                    return;
                }
                if (Math.abs(this.currentHeading - bearing) >= 1) {
                    this.map?.setBearing(this.currentHeading);
                }
                this.hideWaiting();
            }
        });
        this.options = { ...defaultOptions, ...options };
    }
    onAdd(map) {
        this.map = map;
        this.button = this.createButton();
        const container = document.createElement('div');
        // compassButton
        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('maplibregl-ctrl', 'maplibregl-ctrl-group');
        buttonContainer.appendChild(this.button);
        container.appendChild(buttonContainer);
        // debugView
        if (this.options.debug) {
            this.debugView = this.createDebugView();
            container.appendChild(this.debugView);
        }
        return container;
    }
    onRemove() {
        this.map = undefined;
    }
    createButton() {
        const button = document.createElement('button');
        button.classList.add('maplibregl-ctrl-compass-heading');
        button.addEventListener('click', () => this.onClick());
        const span = document.createElement('span');
        span.classList.add('maplibregl-ctrl-icon');
        button.appendChild(span);
        return button;
    }
    createDebugView() {
        const div = document.createElement('div');
        div.classList.add('maplibregl-ctrl');
        div.innerHTML = `
    <ul class="maplibregl-ctrl-compass-heading-debug">
      <li><b>bearing</b>: <span class="heading"></span></li>
      <li><b>accuracy</b>: <span class="accuracy"></span></li>
    </ul>
    `;
        return div;
    }
    onClick() {
        this.active ? this.turnOff() : this.turnOn();
        this.active = !this.active;
        this.map?.on('touchmove', () => {
            if (this.active) {
                this.turnOff();
                this.active = false;
            }
        });
    }
    enableDeviceOrientation() {
        // For iOS 13 and later
        // refs: https://developer.mozilla.org/en-US/docs/Web/API/DeviceOrientationEvent#browser_compatibility
        if ('requestPermission' in window.DeviceOrientationEvent) {
            // @ts-ignore
            window.DeviceOrientationEvent.requestPermission()
                .then((response) => {
                if (response === 'granted') {
                    window.addEventListener('deviceorientation', this.onDeviceOrientation, true);
                }
                else {
                    this.disableButton();
                }
            }).catch(() => {
                this.disableButton();
            });
            return;
        }
        window.addEventListener('deviceorientation', this.onDeviceOrientation, true);
    }
    writeDebugView() {
        if (!this.debugView)
            return;
        this.debugView.querySelector('.heading').textContent = `${this.currentHeading}`;
        this.debugView.querySelector('.accuracy').textContent = `${this.currentAccuracy}`;
    }
    clearDebugView() {
        if (!this.debugView)
            return;
        this.debugView.querySelector('.heading').textContent = '';
        this.debugView.querySelector('.accuracy').textContent = '';
    }
    turnOff() {
        if (!this.button)
            return;
        this.button.classList.remove('maplibregl-ctrl-compass-heading-active');
        window.removeEventListener('deviceorientation', this.onDeviceOrientation, true);
        this.hideWaiting();
        if (this.options.debug) {
            this.clearDebugView();
        }
    }
    turnOn() {
        if (!this.button)
            return;
        this.showWaiting();
        this.button.classList.add('maplibregl-ctrl-compass-heading-active');
        this.enableDeviceOrientation();
        setTimeout(() => {
            if (this.active && this.currentHeading === undefined) {
                this.disableButton();
            }
        }, this.options.timeout);
    }
    disableButton() {
        if (!this.button)
            return;
        this.button.setAttribute('disabled', 'disabled');
        this.button.classList.remove('maplibregl-ctrl-compass-heading-active');
        this.hideWaiting();
    }
    showWaiting() {
        this.button?.classList.add('maplibregl-ctrl-compass-heading-waiting');
    }
    hideWaiting() {
        this.button?.classList.remove('maplibregl-ctrl-compass-heading-waiting');
    }
}
