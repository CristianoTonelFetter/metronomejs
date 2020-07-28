function Metronome(options) {
    this.preCountIsActive = () => this.preCount.checked;

    this.updateDisplay = () => {
        this.display.innerHTML = this.preCounting ? `/ ${this.preCountBeat}` : this.count;
    }

    this.step = () => {
        this.preCounting = this.preCountIsActive() && this.preCountBeat <= this.signature.unit.value;
        let clickSound;

        if (this.preCounting) {
            clickSound = options.click.sound.preCount;
        } else if (this.count === 1) {
            clickSound = options.click.sound.up;
        } else {
            clickSound = options.click.sound.down;
        }
        
        this.sound = new Audio(clickSound);
        this.sound.play();

        this.updateDisplay();
        
        if (this.preCounting) {
            ++this.preCountBeat;
        } else {
            this.count = this.count < parseInt(this.signature.unit.value) ? this.count + 1 : 1;
        }

        // the drift (positive for overshooting)
        const drift = Math.max(0, Date.now() - this.expected);
        
        this.expected += this.interval;

        // take drift into account
        this.loop = setTimeout(this.step, Math.max(0, this.interval - drift));
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

        this.interval = this.getInterval();
        this.expected = Date.now() + this.interval;
        this.count = 1;
        this.loop = setTimeout(this.step, this.interval);
        this.started = true;
    }
    
    this.stop = () => {
        clearTimeout(this.loop);
        this.started = false;
    }

    this.restart = () => {
        if (this.started) {
            this.stop();
            this.start();
        }
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

            this.restart();
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

        this.restart();
    }

    this.onChangePreCount = () => {
        this.restart();
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
    
    this.init = () => {
        this.config();
        this.elements();
        this.attachEvents();
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