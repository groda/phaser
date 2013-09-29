/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2013 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
* @module       Phaser.Graphics
*/

/**
* Description.
* 
* @class Phaser.Graphics
* @constructor
*
* @param {Phaser.Game} game Current game instance.
* @param {number} [x] X position of Description.
* @param {number} [y] Y position of Description.
*/
Phaser.Graphics = function (game, x, y) {

    /**
	* @property {bool} exists - If exists = false then the Sprite isn't updated by the core game loop or physics subsystem at all.
	*/
    this.exists = true;
 
    /**
	* @property {bool} alive - This is a handy little var your game can use to determine if a sprite is alive or not, it doesn't effect rendering.
	*/
    this.alive = true;

	/**
    * @property {Description} group - Description.
  	* @default
  	*/
    this.group = null;

	/**
    * @property {string} name - Description.
   	* @default
   	*/
    this.name = '';

    /**
    * @property {Phaser.Game} game - A reference to the currently running Game.
    */
	this.game = game;

	PIXI.DisplayObjectContainer.call(this);

    /**
	* @property {Description} type - Description.
	*/
    this.type = Phaser.GRAPHICS;

	this.position.x = x;
	this.position.y = y;

    //  Replaces the PIXI.Point with a slightly more flexible one
	/**
	* @property {Phaser.Point} scale - Description.
	*/
    this.scale = new Phaser.Point(1, 1);

    //  Influence of camera movement upon the position
	/**
	* @property {Phaser.Point} scrollFactor - Description.
	*/
    this.scrollFactor = new Phaser.Point(1, 1);

    //  A mini cache for storing all of the calculated values
	/**
	* @property {function} _cache - Description.
	* @private
	*/
    this._cache = { 

        dirty: false,

        //  Transform cache
        a00: 1, a01: 0, a02: x, a10: 0, a11: 1, a12: y, id: 1, 

        //  The previous calculated position inc. camera x/y and scrollFactor
        x: -1, y: -1,

        //  The actual scale values based on the worldTransform
        scaleX: 1, scaleY: 1

    };

    this._cache.x = this.x - (this.game.world.camera.x * this.scrollFactor.x);
    this._cache.y = this.y - (this.game.world.camera.y * this.scrollFactor.y);

	/**
	* @property {bool} renderable - Description.
	* @private
	*/
	this.renderable = true;

    /**
    * @property {number} fillAlpha - The alpha of the fill of this graphics object.
    * @default
    */
	this.fillAlpha = 1;

    /**
    * @property {number} lineWidth - The width of any lines drawn.
    * @default
    */
	this.lineWidth = 0;

    /**
	* @property {string} lineColor - The color of any lines drawn.
    * @default
    */
	this.lineColor = "black";

    /**
    * @property {array} graphicsData - Graphics data.
    * @private
    */
	this.graphicsData = [];

    /**
    * @property {object} currentPath - Current path.
    * @private
    */
	this.currentPath = {points:[]};

};

Phaser.Graphics.prototype = Phaser.Utils.extend(true, PIXI.Graphics.prototype, PIXI.DisplayObjectContainer.prototype, Phaser.Sprite.prototype);
Phaser.Graphics.prototype.constructor = Phaser.Graphics;

//  Add our own custom methods

/**
* Automatically called by World.update
* 
* @method Phaser.Graphics.prototype.update
*/
Phaser.Graphics.prototype.update = function() {

    if (!this.exists)
    {
        return;
    }

    this._cache.dirty = false;

    this._cache.x = this.x - (this.game.world.camera.x * this.scrollFactor.x);
    this._cache.y = this.y - (this.game.world.camera.y * this.scrollFactor.y);

    if (this.position.x != this._cache.x || this.position.y != this._cache.y)
    {
        this.position.x = this._cache.x;
        this.position.y = this._cache.y;
        this._cache.dirty = true;
    }

}

/**
* Get
* @returns {Description}
*//**
* Set
* @param {Description} value - Description
*/
Object.defineProperty(Phaser.Graphics.prototype, 'angle', {

    get: function() {
        return Phaser.Math.radToDeg(this.rotation);
    },

    set: function(value) {
        this.rotation = Phaser.Math.degToRad(value);
    }

});

/**
* Get
* @returns {Description}
*//**
* Set
* @param {Description} value - Description
*/
Object.defineProperty(Phaser.Graphics.prototype, 'x', {

    get: function() {
        return this.position.x;
    },

    set: function(value) {
        this.position.x = value;
    }

});

/**
* Get
* @returns {Description}
*//**
* Set
* @param {Description} value - Description
*/
Object.defineProperty(Phaser.Graphics.prototype, 'y', {

    get: function() {
        return this.position.y;
    },

    set: function(value) {
        this.position.y = value;
    }

});
