function Metronome(options) {
    this.preCountIsActive = () => this.preCount.checked;

    this.step = () => {
        this.interval = this.getInterval();
        let expected = Date.now() + this.interval;
        // the drift (positive for overshooting)
        const drift = Math.max(0, Date.now() - expected);

        expected += this.interval;

        const preCounting = this.preCountIsActive() && this.preCountBeat <= this.signature.unit.value;
        let clickSound;

        if (preCounting) {
            clickSound = options.click.sound.preCount;
        } else if (this.count === 1) {
            clickSound = options.click.sound.up;
        } else {
            clickSound = options.click.sound.down;
        }
        
        this.sound = new Audio(clickSound);
        this.sound.play();

        // take drift into account
        this.loop = setTimeout(this.step, Math.max(0, this.interval - drift));
        
        this.display.innerHTML = preCounting ? `/ ${this.preCountBeat}` : this.count;

        if (preCounting) {
            ++this.preCountBeat;
        } else {
            this.count = this.count < parseInt(this.signature.unit.value) ? this.count + 1 : 1;
        }
    }

    this.start = () => {
        if (!this.bpm.value || (this.bpm.value) < 1) {
            return;
        }

        if (this.loop) {
            this.stop();
        }

        if (this.preCountIsActive()) {
            this.preCountBeat = 1;
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

    this.tap = () => {
        if (this.tapDebounce) {
            clearTimeout(this.tapDebounce);
        }

        const tapTime = new Date().getTime();

        this.tapTimes.push(tapTime);

        const { length: taps } = this.tapTimes;

        if (taps > 1) {
            this.tapDifferences.push(this.tapTimes[taps - 1] - this.tapTimes[taps - 2]);
            const average = this.tapDifferences.reduce((acc, item) => acc + item, 0) / this.tapDifferences.length;

            // this is weird but works
            this.bpm.value = Math.floor(this.seconds * (this.seconds / (this.seconds * (average / this.miliseconds))));
        }
        
        this.tapDebounce = setTimeout(() => {
            this.tapTimes = [];
            this.tapDifferences = [];
        }, this.miliseconds * 2);
    }

    this.getInterval = () => (this.miliseconds / parseInt(this.bpm.value)) * this.seconds;

    this.elements = () => {
        this.button = {
            start: document.querySelector(options.selector.start),
            stop: document.querySelector(options.selector.stop),
            tap: document.querySelector(options.selector.tap)
        };
    
        this.signature = {
            unit: document.querySelector(options.selector.signature.unit),
            figure: document.querySelector(options.selector.signature.figure)
        };
    
        this.display = document.querySelector(options.selector.display);
        this.bpm = document.querySelector(options.selector.bpm);
        this.preCount = document.querySelector(options.selector.preCount);
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
        this.button.tap.addEventListener('click', this.tap);
        this.bpm.addEventListener('input', this.onChangeBpm);
        this.preCount.addEventListener('input', this.onChangePreCount);
    }

    this.config = () => {
        this.started = false;
        this.preCountBeat = 0;
        this.count = 0;
        this.tapTimes = [];
        this.tapDifferences = [];
        this.seconds = 60;
        this.miliseconds = 1000;
    }

    this.preLoadSounds = () => {
        // not sure if this helps
        new Audio(options.click.sound.up);
        new Audio(options.click.sound.down);
        new Audio(options.click.sound.preCount);
    }
    
    this.init = () => {
        this.config();
        this.elements();
        this.attachEvents();
        this.preLoadSounds();
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
        bpm: '#bpm',
        preCount: '#preCount',
        tap: '#tap'
    },
    click: {
        sound: {
            up: 'sound/clickUp.wav',
            down: 'sound/clickDown.wav',
            preCount: 'sound/preCount.wav'
        }
    }
});

metronome.init();