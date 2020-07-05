function Metronome(options) {
    this.step = () => {
        this.interval = this.getInterval();
        let expected = Date.now() + this.interval;
        const drift = Math.max(0, Date.now() - expected); // the drift (positive for overshooting)

        // if (drift > this.interval) {
            // something really bad happened. Maybe the browser (tab) was inactive?
            // possibly special handling to avoid futile "catch up" run
        // }

        expected += this.interval;

        if (this.count === 1) {
            this.sound = new Audio(options.click.sound.up);
        } else {
            this.sound = new Audio(options.click.sound.down);
        }
        
        this.sound.play();

        this.loop = setTimeout(this.step, Math.max(0, this.interval - drift)); // take into account drift
        
        this.display.innerHTML = this.count;
        this.count = this.count < parseInt(this.signature.unit.value) ? this.count + 1 : 1;
    }

    this.start = () => {
        if (!this.bpm.value || (this.bpm.value) < 1) {
            return;
        }

        if (this.loop) {
            this.stop();
        }

        this.count = 1;
        this.interval = this.getInterval();
        this.loop = setTimeout(this.step, this.interval);
        this.started = true;
    }
    
    this.stop = () => {
        clearTimeout(this.loop);
        this.started = false;
    }

    this.getInterval = () => (this.miliseconds / parseInt(this.bpm.value)) * this.seconds;

    this.elements = () => {
        this.button = {
            start: document.querySelector(options.selector.start),
            stop: document.querySelector(options.selector.stop)
        };
    
        this.signature = {
            unit: document.querySelector(options.selector.signature.unit),
            figure: document.querySelector(options.selector.signature.figure)
        };
    
        this.display = document.querySelector(options.selector.display);
        this.bpm = document.querySelector(options.selector.bpm);
    }

    this.onChangeBpm = (event) => {
        if (!event.target.value) {
            event.target.value = 0;
        }

        if (this.started) {
            this.stop();
            this.start();
        }
    }
    this.attachEvents = () => {
        this.button.start.addEventListener('click', this.start);
        this.button.stop.addEventListener('click', this.stop);
        this.bpm.addEventListener('input', this.onChangeBpm);
    }

    this.config = () => {
        this.count = 0;
        this.seconds = 60;
        this.miliseconds = 1000;
    }

    this.loadSounds = () => {
        // not sure if this helps
        new Audio(options.click.sound.up);
        new Audio(options.click.sound.down);
    }
    
    this.init = () => {
        this.started = false;
        this.config();
        this.elements();
        this.attachEvents();
        this.loadSounds();
    }

    return {
        init: this.init,
        start: this.start,
        stop: this.stop,
        started: this.started
    }
}

const metronome = new Metronome({
    selector: {
        start: '#start',
        stop: '#stop',
        display: '#display',
        signature: {
            unit: '#unit',
            figure: '#display'
        },
        bpm: '#bpm'
    },
    click: {
        sound: {
            up: 'sound/clickUp.wav',
            down: 'sound/clickDown.wav'
        }
    }
});

metronome.init();