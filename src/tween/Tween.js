/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2013 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
* @module       Phaser.Tween
*/


/**
* Tween constructor
* Create a new <code>Tween</code>.
*
* @class Phaser.Tween
* @constructor
* @param {object} object - Target object will be affected by this tween.
* @param {Phaser.Game} game - Current game instance.
*/
Phaser.Tween = function (object, game) {

    /**
    * Reference to the target object.
    * @property {object} _object
    */
	this._object = object;

    /**
    * @property {Phaser.Game} game - A reference to the currently running Game.
    */
    this.game = game;

    /**
    * @property {object} _manager - Description.
    */
    this._manager = this.game.tweens;

    /**
    * @property {object} _valuesStart - Description.
    */
    this._valuesStart = {};

    /**
    * @property {object} _valuesEnd - Description.
    */
    this._valuesEnd = {};

    /**
    * @property {object} _valuesStartRepeat - Description.
    */
    this._valuesStartRepeat = {};

    /**
    * @property {number} _duration - Description.
    * @defaultvalue
    */
    this._duration = 1000;

    /**
    * @property {number} _repeat - Description.
    * @defaultvalue
    */
    this._repeat = 0;

    /**
    * @property {bool} _yoyo - Description.
    * @defaultvalue
    */
    this._yoyo = false;

    /**
    * @property {bool} _reversed - Description.
    * @defaultvalue
    */
    this._reversed = false;

    /**
    * @property {number} _delayTime - Description.
    * @defaultvalue
    */
    this._delayTime = 0;

    /**
    * @property {object} _startTime - Description.
    * @defaultvalue null
    */
    this._startTime = null;

    /**
    * @property {object} _easingFunction - Description.
    */
    this._easingFunction = Phaser.Easing.Linear.None;

    /**
    * @property {object} _interpolationFunction - Description.
    */
    this._interpolationFunction = Phaser.Math.linearInterpolation;

    /**
    * @property {object} _chainedTweens - Description.
    */
    this._chainedTweens = [];

    /**
    * @property {object} _onStartCallback - Description.
    * @defaultvalue
    */
    this._onStartCallback = null;

    /**
    * @property {bool} _onStartCallbackFired - Description.
    * @defaultvalue
    */
    this._onStartCallbackFired = false;

    /**
    * @property {object} _onUpdateCallback - Description.
    * @defaultvalue null
    */
    this._onUpdateCallback = null;

    /**
    * @property {object} _onCompleteCallback - Description.
    * @defaultvalue null
    */
    this._onCompleteCallback = null;
    
    /**
    * @property {number} _pausedTime - Description.
    * @defaultvalue
    */
    this._pausedTime = 0;

    /**
    * @property {bool} pendingDelete - Description.
    * @defaultvalue
    */
    this.pendingDelete = false;

    // Set all starting values present on the target object
    for ( var field in object ) {
    	this._valuesStart[ field ] = parseFloat(object[field], 10);
    }
    
    /**
    * @property {object} onStart - Description.
    */
    this.onStart = new Phaser.Signal();

    /**
    * @property {object} onComplete - Description.
    */
    this.onComplete = new Phaser.Signal();

    /**
    * @property {bool} isRunning - Description.
    * @defaultvalue
    */
    this.isRunning = false;

};

Phaser.Tween.prototype = {

	/**
	* Configure the Tween
	*
	* @methodto
	* @param {object} properties - Properties you want to tween.
	* @param {number} duration - Duration of this tween.
	* @param {function} ease - Easing function.
	* @param {bool} autoStart - Whether this tween will start automatically or not.
	* @param {number} delay - Delay before this tween will start, defaults to 0 (no delay).
	* @param {bool} repeat - Should the tween automatically restart once complete? (ignores any chained tweens).
	* @param {Phaser.Tween} yoyo - Description.
	* @returns {Phaser.Tween} Itself.
	*/
	to: function ( properties, duration, ease, autoStart, delay, repeat, yoyo ) {

		duration = duration || 1000;
		ease = ease || null;
		autoStart = autoStart || false;
		delay = delay || 0;
		repeat = repeat || 0;
		yoyo = yoyo || false;

		this._repeat = repeat;
        this._duration = duration;
		this._valuesEnd = properties;

        if (ease !== null)
        {
            this._easingFunction = ease;
        }

        if (delay > 0)
        {
            this._delayTime = delay;
        }

        this._yoyo = yoyo;

        if (autoStart) {
            return this.start();
        } else {
            return this;
        }

	},

	/**
	* Description. 
	*
	* @method start
	* @param {number} time - Description.
	* @returns {Phaser.Tween} Itself.
	*/
	start: function ( time ) {

        if (this.game === null || this._object === null) {
            return;
        }

		this._manager.add(this);

		this.onStart.dispatch(this._object);

                this.isRunning = true;

		this._onStartCallbackFired = false;

                this._startTime = this.game.time.now + this._delayTime;

		for ( var property in this._valuesEnd ) {

			// check if an Array was provided as property value
			if ( this._valuesEnd[ property ] instanceof Array ) {

				if ( this._valuesEnd[ property ].length === 0 ) {

					continue;

				}

				// create a local copy of the Array with the start value at the front
				this._valuesEnd[ property ] = [ this._object[ property ] ].concat( this._valuesEnd[ property ] );

			}

			this._valuesStart[ property ] = this._object[ property ];

			if ( ( this._valuesStart[ property ] instanceof Array ) === false ) {
				this._valuesStart[ property ] *= 1.0; // Ensures we're using numbers, not strings
			}

			this._valuesStartRepeat[ property ] = this._valuesStart[ property ] || 0;

		}

		return this;

	},

	/**
	* Description. 
	*
	* @method stop
	* @returns {Phaser.Tween} Itself.
	*/
	stop: function () {

		this._manager.remove(this);
        this.isRunning = false;

		return this;

	},

	/**
	* Description. 
	*
	* @method delay
	* @param {number} amount - Description.
	* @returns {Phaser.Tween} Itself.
	*/
	delay: function ( amount ) {

		this._delayTime = amount;
		return this;

	},

	/**
	* Description. 
	*
	* @method repeat
	* @param {number} times - How many times to repeat.
	* @returns {Phaser.Tween} Itself.
	*/
	repeat: function ( times ) {

		this._repeat = times;
		return this;

	},

	/**
	* Description. 
	*
	* @method yoyo
	* @param {Phaser.Tween} yoyo - Description.
	* @returns {Phaser.Tween} Itself.
	*/
	yoyo: function( yoyo ) {

		this._yoyo = yoyo;
		return this;

	},

	/**
	* Set easing function. 
	*
	* @method easing
	* @param {function} easing - Description.
	* @returns {Phaser.Tween} Itself.
	*/
	easing: function ( easing ) {

		this._easingFunction = easing;
		return this;

	},

	/**
	* Set interpolation function. 
	*
	* @method interpolation
	* @param {function} interpolation - Description.
	* @returns {Phaser.Tween} Itself.
	*/
	interpolation: function ( interpolation ) {

		this._interpolationFunction = interpolation;
		return this;

	},

	/**
	* Description. 
	*
	* @method chain
	* @returns {Phaser.Tween} Itself.
	*/
	chain: function () {

		this._chainedTweens = arguments;
		return this;

	},

	/**
	* Description. 
	*
	* @method onStartCallback
	* @param {object} callback - Description.
	* @returns {Phaser.Tween} Itself.
	*/
	onStartCallback: function ( callback ) {

		this._onStartCallback = callback;
		return this;

	},

	/**
	* Description. 
	*
	* @method onUpdateCallback
	* @param {object} callback - Description.
	* @returns {Phaser.Tween} Itself.
	*/
	onUpdateCallback: function ( callback ) {

		this._onUpdateCallback = callback;
		return this;

	},

	/**
	* Description. 
	*
	* @method onCompleteCallback
	* @param {object} callback - Description.
	* @returns {Phaser.Tween} Itself.
	*/
	onCompleteCallback: function ( callback ) {

		this._onCompleteCallback = callback;
		return this;

	},

	/**
	* Pause. 
	*
	* @method pause
	*/
        pause: function () {
            this._paused = true;
        },

	/**
	* Resume.
	*
	* @method resume
	*/
        resume: function () {
            this._paused = false;
            this._startTime += this.game.time.pauseDuration;
        },

	/**
	* Description.
	*
	* @method update
	* @param {number} time - Description.
	* @returns {bool} Description.
	*/
	update: function ( time ) {

		if (this.pendingDelete)
		{
			return false;
		}

        if (this._paused || time < this._startTime) {

            return true;

        }

		var property;

		if ( time < this._startTime ) {

			return true;

		}

		if ( this._onStartCallbackFired === false ) {

			if ( this._onStartCallback !== null ) {

				this._onStartCallback.call( this._object );

			}

			this._onStartCallbackFired = true;

		}

		var elapsed = ( time - this._startTime ) / this._duration;
		elapsed = elapsed > 1 ? 1 : elapsed;

		var value = this._easingFunction( elapsed );

		for ( property in this._valuesEnd ) {

			var start = this._valuesStart[ property ] || 0;
			var end = this._valuesEnd[ property ];

			if ( end instanceof Array ) {

				this._object[ property ] = this._interpolationFunction( end, value );

			} else {

                // Parses relative end values with start as base (e.g.: +10, -3)
				if ( typeof(end) === "string" ) {
					end = start + parseFloat(end, 10);
				}

				// protect against non numeric properties.
                if ( typeof(end) === "number" ) {
					this._object[ property ] = start + ( end - start ) * value;
				}

			}

		}

		if ( this._onUpdateCallback !== null ) {

			this._onUpdateCallback.call( this._object, value );

		}

		if ( elapsed == 1 ) {

			if ( this._repeat > 0 ) {

				if ( isFinite( this._repeat ) ) {
					this._repeat--;
				}

				// reassign starting values, restart by making startTime = now
				for ( property in this._valuesStartRepeat ) {

					if ( typeof( this._valuesEnd[ property ] ) === "string" ) {
						this._valuesStartRepeat[ property ] = this._valuesStartRepeat[ property ] + parseFloat(this._valuesEnd[ property ], 10);
					}

					if (this._yoyo) {
						var tmp = this._valuesStartRepeat[ property ];
						this._valuesStartRepeat[ property ] = this._valuesEnd[ property ];
						this._valuesEnd[ property ] = tmp;
						this._reversed = !this._reversed;
					}
					this._valuesStart[ property ] = this._valuesStartRepeat[ property ];

				}

				this._startTime = time + this._delayTime;

				this.onComplete.dispatch(this._object);

				if ( this._onCompleteCallback !== null ) {
					this._onCompleteCallback.call( this._object );
				}

				return true;

			} else {

				this.onComplete.dispatch(this._object);

				if ( this._onCompleteCallback !== null ) {
					this._onCompleteCallback.call( this._object );
				}

				for ( var i = 0, numChainedTweens = this._chainedTweens.length; i < numChainedTweens; i ++ ) {

					this._chainedTweens[ i ].start( time );

				}

				return false;

			}

		}

		return true;

	}
	
};

