/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2013 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
* @module       Phaser.Tilemap
*/


/**
* A Tile is a single representation of a tile within a Tilemap
* Create a new <code>Tile</code>.
*
* @class Phaser.TTile
* @constructor
* @param {Phaser.Game} game - A reference to the currently running game.
* @param {Tilemap} tilemap - the tilemap this tile belongs to.
* @param {number}  index - The index of this tile type in the core map data.
* @param {number}  width - Width of the tile.
* @param {number}  height - Height of the tile.
*/
Phaser.Tile = function (game, tilemap, index, width, height) {

    /**
    * @property {number}  mass - The virtual mass of the tile.
    * @defaultvalue
    */
    this.mass = 1.0;

    /**
    * @property {bool}   collideNone - Indicating this Tile doesn't collide at all.
    * @defaultvalue
    */
    this.collideNone = true;

    /**
    * @property {bool}   collideLeft - Indicating collide with any object on the left.
    * @defaultvalue
    */
    this.collideLeft = false;

    /**
    * @property {bool}   collideRight - Indicating collide with any object on the right.
    * @defaultvalue
    */
    this.collideRight = false;

    /**
    * @property {bool}   collideUp - Indicating collide with any object on the top.
    * @defaultvalue
    */
    this.collideUp = false;

    /**
    * @property {bool}   collideDown - Indicating collide with any object on the bottom.
    * @defaultvalue
    */
    this.collideDown = false;

    /**
    * @property {bool}   separateX - Enable separation at x-axis. 
    * @defaultvalue
    */
    this.separateX = true;

    /**
    * @property {bool}   separateY - Enable separation at y-axis. 
    * @defaultvalue
    */
    this.separateY = true;

    this.game = game;
    this.tilemap = tilemap;
    this.index = index;
    this.width = width;
    this.height = height;

};

Phaser.Tile.prototype = {

    /**
    * Clean up memory.
    * @method destroy
    */
    destroy: function () {
        this.tilemap = null;
    },

    /**
    * Set collision configs.
    * @method setCollision
    * @param {bool}   left - Indicating collide with any object on the left.
    * @param {bool}   right - Indicating collide with any object on the right.
    * @param {bool}   up - Indicating collide with any object on the top.
    * @param {bool}   down - Indicating collide with any object on the bottom.
    * @param {bool}   reset - Description. 
    * @param {bool}   separateX - Separate at x-axis.
    * @param {bool}   separateY - Separate at y-axis.
    */
    setCollision: function (left, right, up, down, reset, separateX, separateY) {

        if (reset)
        {
            this.resetCollision();
        }

        this.separateX = separateX;
        this.separateY = separateY;

        this.collideNone = true;
        this.collideLeft = left;
        this.collideRight = right;
        this.collideUp = up;
        this.collideDown = down;

        if (left || right || up || down)
        {
            this.collideNone = false;
        }

    },

    /**
    * Reset collision status flags.
    */
    resetCollision: function () {

        this.collideNone = true;
        this.collideLeft = false;
        this.collideRight = false;
        this.collideUp = false;
        this.collideDown = false;

    },

    /**
    * Returns a string representation of this object.
    * @method toString
    * @return {string}  A string representation of the object.
    **/
    toString: function () {

        // return "[{Tile (index=" + this.index + " collisions=" + this.allowCollisions + " width=" + this.width + " height=" + this.height + ")}]";
        return '';

    }

};
