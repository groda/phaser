/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2013 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
* @module       Phaser.AnimationManager
*/

/**
* The AnimationManager is used to add, play and update Phaser Animations.
* Any Game Object such as Phaser.Sprite that supports animation contains a single AnimationManager instance.
*
* @class Phaser.AnimationManager
* @constructor
* @param {Phaser.Sprite} sprite - A reference to the Game Object that owns this AnimationManager.
*/
Phaser.AnimationManager = function (sprite) {

    /**
    * @property {Phaser.Sprite} sprite - A reference to the parent Sprite that owns this AnimationManager.
    */
	this.sprite = sprite;

    /**
    * @property {Phaser.Game} game - A reference to the currently running Game.
    */
	this.game = sprite.game;

	/**
	* @property {Phaser.Animation.Frame} currentFrame - The currently displayed Frame of animation, if any.
	* @default
	*/
	this.currentFrame = null;
	
	/**
	* @property {bool} updateIfVisible - Should the animation data continue to update even if the Sprite.visible is set to false.
	* @default
	*/
	this.updateIfVisible = true;

	/**
	* @property {Phaser.Animation.FrameData} _frameData - A temp. var for holding the currently playing Animations FrameData.
	* @private
	* @default
	*/
	this._frameData = null;

	/**
	* @property {object} _anims - An internal object that stores all of the Animation instances.
	* @private
	*/   
	this._anims = {};

	/**
	* @property {object} _outputFrames - An internal object to help avoid gc.
	* @private
	*/
	this._outputFrames = [];

};

Phaser.AnimationManager.prototype = {

    /**
    * Loads FrameData into the internal temporary vars and resets the frame index to zero.
    * This is called automatically when a new Sprite is created.
    *
    * @method loadFrameData
    * @private
    * @param {Phaser.Animation.FrameData} frameData - The FrameData set to load.
    */
	loadFrameData: function (frameData) {

		this._frameData = frameData;
		this.frame = 0;

	},

	/**
	* Adds a new animation under the given key. Optionally set the frames, frame rate and loop.
	* Animations added in this way are played back with the play function.
	*
    * @method add
	* @param {string} name The unique (within this Sprite) name for the animation, i.e. "run", "fire", "walk".
	* @param {Array} [frames=null] An array of numbers/strings that correspond to the frames to add to this animation and in which order. e.g. [1, 2, 3] or ['run0', 'run1', run2]). If null then all frames will be used.
	* @param {number} [frameRate=60] The speed at which the animation should play. The speed is given in frames per second.
	* @param {bool} [loop=false] {bool} Whether or not the animation is looped or just plays once.
	* @param {bool} [useNumericIndex=true] Are the given frames using numeric indexes (default) or strings?
	* @return {Phaser.Animation} The Animation object that was created.
	*/
	add: function (name, frames, frameRate, loop, useNumericIndex) {

		if (this._frameData == null)
		{
			console.warn('No FrameData available for Phaser.Animation ' + name);
			return;
		}

		frameRate = frameRate || 60;

		if (typeof loop === 'undefined') { loop = false; }
		if (typeof useNumericIndex === 'undefined') { useNumericIndex = true; }

		//  Create the signals the AnimationManager will emit
		if (this.sprite.events.onAnimationStart == null)
		{
			this.sprite.events.onAnimationStart = new Phaser.Signal();
			this.sprite.events.onAnimationComplete = new Phaser.Signal();
			this.sprite.events.onAnimationLoop = new Phaser.Signal();
		}

    	this._outputFrames.length = 0;

		this._frameData.getFrameIndexes(frames, useNumericIndex, this._outputFrames);

		this._anims[name] = new Phaser.Animation(this.game, this.sprite, name, this._frameData, this._outputFrames, frameRate, loop);
		this.currentAnim = this._anims[name];
		this.currentFrame = this.currentAnim.currentFrame;
		this.sprite.setTexture(PIXI.TextureCache[this.currentFrame.uuid]);

		return this._anims[name];

	},

	/**
	* Check whether the frames in the given array are valid and exist.
	*
    * @method validateFrames
	* @param {Array} frames An array of frames to be validated.
	* @param {bool} [useNumericIndex=true] Validate the frames based on their numeric index (true) or string index (false)
	* @return {bool} True if all given Frames are valid, otherwise false.
	*/
	validateFrames: function (frames, useNumericIndex) {

		if (typeof useNumericIndex == 'undefined') { useNumericIndex = true; }

		for (var i = 0; i < frames.length; i++)
		{
			if (useNumericIndex == true)
			{
				if (frames[i] > this._frameData.total)
				{
					return false;
				}
			}
			else
			{
				if (this._frameData.checkFrameName(frames[i]) == false)
				{
					return false;
				}
			}
		}

		return true;

	},

	/**
	* Play an animation based on the given key. The animation should previously have been added via sprite.animations.add()
	* If the requested animation is already playing this request will be ignored. If you need to reset an already running animation do so directly on the Animation object itself.
	* 
	* @method play
	* @param {string} name The name of the animation to be played, e.g. "fire", "walk", "jump".
    * @param {number} [frameRate=null] The framerate to play the animation at. The speed is given in frames per second. If not provided the previously set frameRate of the Animation is used.
    * @param {bool} [loop=null] Should the animation be looped after playback. If not provided the previously set loop value of the Animation is used.
    * @return {Phaser.Animation} A reference to playing Animation instance.
	*/
	play: function (name, frameRate, loop) {

		if (this._anims[name])
		{
			if (this.currentAnim == this._anims[name])
			{
				if (this.currentAnim.isPlaying == false)
				{
					return this.currentAnim.play(frameRate, loop);
				}
			}
			else
			{
				this.currentAnim = this._anims[name];
				return this.currentAnim.play(frameRate, loop);
			}
		}

	},

	/**
	* Stop playback of an animation. If a name is given that specific animation is stopped, otherwise the current animation is stopped.
	* The currentAnim property of the AnimationManager is automatically set to the animation given.
	*
	* @method stop
	* @param {string} [name=null] The name of the animation to be stopped, e.g. "fire". If none is given the currently running animation is stopped.
	* @param {bool} [resetFrame=false] When the animation is stopped should the currentFrame be set to the first frame of the animation (true) or paused on the last frame displayed (false)
	*/
	stop: function (name, resetFrame) {

		if (typeof resetFrame == 'undefined') { resetFrame = false; }

		if (typeof name == 'string')
		{
			if (this._anims[name])
			{
				this.currentAnim = this._anims[name];
				this.currentAnim.stop(resetFrame);
			}
		}
		else
		{
			if (this.currentAnim)
			{
				this.currentAnim.stop(resetFrame);
			}
		}

	},

	/**
	* The main update function is called by the Sprites update loop. It's responsible for updating animation frames and firing related events.
	* 
	* @method update
	* @protected
    * @return {bool} True if a new animation frame has been set, otherwise false.
	*/
	update: function () {

		if (this.updateIfVisible && this.sprite.visible == false)
		{
			return false;
		}

		if (this.currentAnim && this.currentAnim.update() == true)
		{
			this.currentFrame = this.currentAnim.currentFrame;
			this.sprite.currentFrame = this.currentFrame;
			return true;
		}

		return false;

	},

    /**
    * Destroys all references this AnimationManager contains. Sets the _anims to a new object and nulls the current animation.
    *
    * @method destroy
    */
    destroy: function () {

        this._anims = {};
        this._frameData = null;
        this._frameIndex = 0;
        this.currentAnim = null;
        this.currentFrame = null;

    }

};

Object.defineProperty(Phaser.AnimationManager.prototype, "frameData", {

    /**
    * @method frameData
    * @return {Phaser.Animation.FrameData} Returns the FrameData of the current animation.
    */
    get: function () {
        return this._frameData;
    }

});

/**
* @return {number} Returns the total number of frames in the loaded FrameData, or -1 if no FrameData is loaded.
*/
Object.defineProperty(Phaser.AnimationManager.prototype, "frameTotal", {
 
    get: function () {

        if (this._frameData)
        {
            return this._frameData.total;
        }
        else
        {
            return -1;
        }
    }

});

/**
* @return {number} Returns the index of the current frame.
*//**
* @param {number} value Sets the current frame on the Sprite and updates the texture cache for display.
*/
Object.defineProperty(Phaser.AnimationManager.prototype, "frame", {

 
    get: function () {

    	if (this.currentFrame)
    	{
	        return this._frameIndex;
	    }
	    
    },


    set: function (value) {

        if (this._frameData && this._frameData.getFrame(value) !== null)
        {
            this.currentFrame = this._frameData.getFrame(value);
            this._frameIndex = value;
            this.sprite.currentFrame = this.currentFrame;
			this.sprite.setTexture(PIXI.TextureCache[this.currentFrame.uuid]);
        }

    }

});

/**
* @return {string} Returns the name of the current frame if it has one.
*//**
* @param {string} value Sets the current frame on the Sprite and updates the texture cache for display.
*/
Object.defineProperty(Phaser.AnimationManager.prototype, "frameName", {

    get: function () {

    	if (this.currentFrame)
    	{
	        return this.currentFrame.name;
    	}

    },

    set: function (value) {

        if (this._frameData && this._frameData.getFrameByName(value) !== null)
        {
            this.currentFrame = this._frameData.getFrameByName(value);
            this._frameIndex = this.currentFrame.index;
            this.sprite.currentFrame = this.currentFrame;
			this.sprite.setTexture(PIXI.TextureCache[this.currentFrame.uuid]);
        }
        else
        {
            console.warn("Cannot set frameName: " + value);
        }
    }

});
