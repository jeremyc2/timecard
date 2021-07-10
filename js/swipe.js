class SwipeEventDispatcher {
    constructor(element, options = {}) {
        this.evtMap = {
            SWIPE_LEFT: [],
            SWIPE_UP: [],
            SWIPE_DOWN: [],
            SWIPE_RIGHT: []
        };

        this.xDown = null;
        this.yDown = null;
        this.element = element;
        this.isMouseDown = false;
        this.listenForMouseEvents = true;
        this.options = Object.assign({ triggerDist: 50 }, options);

        element.addEventListener('touchstart', evt => this.handleTouchStart(evt), false);
        element.addEventListener('touchend', evt => this.handleTouchEnd(evt), false);
        element.addEventListener('mousedown', evt => this.handleMouseDown(evt), false);
        element.addEventListener('mouseup', evt => this.handleMouseUp(evt), false);
    }

    on(evt, cb) {
        this.evtMap[evt].push(cb);
    }

    off(evt, lcb) {
        this.evtMap[evt] = this.evtMap[evt].filter(cb => cb !== lcb);
    }

    trigger(evt, data) {
        this.evtMap[evt].map(handler => handler(data));
    }

    handleTouchStart(evt) {
        this.xDown = evt.touches[0].clientX;
        this.yDown = evt.touches[0].clientY;
    }

    handleMouseDown(evt) {
        if (this.listenForMouseEvents==false) return;
        this.xDown = evt.clientX;
        this.yDown = evt.clientY;
        this.isMouseDown = true;
    }

    handleMouseUp(evt) {
        if (this.isMouseDown == false) return;
        const deltaX = evt.clientX - this.xDown;
        const deltaY = evt.clientY - this.yDown;
        const distMoved = Math.abs(Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY);

        if (distMoved > this.options.triggerDist) {
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                deltaX < 0 ? this.trigger('SWIPE_LEFT') : this.trigger('SWIPE_RIGHT');
            } else {
                deltaY > 0 ? this.trigger('SWIPE_UP') : this.trigger('SWIPE_DOWN');
            }
        }
    }

    handleTouchEnd(evt) {
        const deltaX = evt.changedTouches[0].clientX - this.xDown;
        const deltaY = evt.changedTouches[0].clientY - this.yDown;
        const distMoved = Math.abs(Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY);

        if (distMoved > this.options.triggerDist) {
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                deltaX < 0 ? this.trigger('SWIPE_LEFT') : this.trigger('SWIPE_RIGHT');
            } else {
                deltaY > 0 ? this.trigger('SWIPE_UP') : this.trigger('SWIPE_DOWN');
            }
        }
    }
}