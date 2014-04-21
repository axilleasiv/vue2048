var data = [
    {
        x:4,
        y:4,
        value: 2
    },
    {
        x:1,
        y:1,
        value: 4
    },
    {
        x:2,
        y:2,
        value: 16
    },
    {
        x:3,
        y:3,
        value: 32
    }
];


// bootstrap the demo
var Game = new Vue({
    el: '#tile-container',
    data: {
        size: 4,
        initItems: 2,
        tiles: gameStorage.fetch()
    },

    created: function () {
        console.log('created');
        this.tiles = data;
        // this.$watch('branch', function () {
        //     this.fetchData()
        // })
    },

    attached: function(){
        console.log('Attached');
    },

    ready: function () {
        console.log('ready');
        // this.$watch('tiles', function (tiles) {
        //     console.log(tiles);
        //     // todoStorage.save(todos);
        // });
    },

    computed: {
        remaining: function() {
            return this.tiles.length;
        },
        allDone: {
            $get: function() {
                return this.remaining === 0;
            },
            $set: function(value) {
                this.todos.forEach(function(todo) {
                    todo.completed = value;
                });
            }
        }
    },
    methods: {

        init: function(){
            return [];
        },
    
        reorder: function (event) {
            this.tiles.forEach(function(item){
                console.log(item.value);
                item.value++;
            });
        },
        move: function(direction) {
            var map = {
                0: { x: 0,  y: -1 }, // Up
                1: { x: 1,  y: 0 },  // Right
                2: { x: 0,  y: 1 },  // Down
                3: { x: -1, y: 0 }   // Left
            };

            this.tiles.forEach(function(item){
                //console.log(item.value);
                // item.value++;
                item.x = map[direction].x + item.x;
                item.y = map[direction].y + item.y;
            });
        }
    }
});


var Keys = new KeyboardInputManager();


Keys.on('move', function(direction){
    Game.move(direction);
});


// GameManager.prototype.getVector = function (direction) {
//   // Vectors representing tile movement
//   var map = {
//     0: { x: 0,  y: -1 }, // Up
//     1: { x: 1,  y: 0 },  // Right
//     2: { x: 0,  y: 1 },  // Down
//     3: { x: -1, y: 0 }   // Left
//   };

//   return map[direction];
// };

// // Build a list of positions to traverse in the right order
// GameManager.prototype.buildTraversals = function (vector) {
//   var traversals = { x: [], y: [] };

//   for (var pos = 0; pos < this.size; pos++) {
//     traversals.x.push(pos);
//     traversals.y.push(pos);
//   }

//   // Always traverse from the farthest cell in the chosen direction
//   if (vector.x === 1) traversals.x = traversals.x.reverse();
//   if (vector.y === 1) traversals.y = traversals.y.reverse();

//   return traversals;
// };

// GameManager.prototype.move = function (direction) {
//   // 0: up, 1: right, 2: down, 3: left
//   var self = this;

//   if (this.isGameTerminated()) return; // Don't do anything if the game's over

//   var cell, tile;

//   var vector     = this.getVector(direction);
//   var traversals = this.buildTraversals(vector);
//   var moved      = false;

//   // Save the current tile positions and remove merger information
//   this.prepareTiles();

//   // Traverse the grid in the right direction and move tiles
//   traversals.x.forEach(function (x) {
//     traversals.y.forEach(function (y) {
//       cell = { x: x, y: y };
//       tile = self.grid.cellContent(cell);

//       if (tile) {
//         var positions = self.findFarthestPosition(cell, vector);
//         var next      = self.grid.cellContent(positions.next);

//         // Only one merger per row traversal?
//         if (next && next.value === tile.value && !next.mergedFrom) {
//           var merged = new Tile(positions.next, tile.value * 2);
//           merged.mergedFrom = [tile, next];

//           self.grid.insertTile(merged);
//           self.grid.removeTile(tile);

//           // Converge the two tiles' positions
//           tile.updatePosition(positions.next);

//           // Update the score
//           self.score += merged.value;

//           // The mighty 2048 tile
//           if (merged.value === 2048) self.won = true;
//         } else {
//           self.moveTile(tile, positions.farthest);
//         }

//         if (!self.positionsEqual(cell, tile)) {
//           moved = true; // The tile moved from its original cell!
//         }
//       }
//     });
//   });

//   if (moved) {
//     this.addRandomTile();

//     if (!this.movesAvailable()) {
//       this.over = true; // Game over!
//     }

//     this.actuate();
//   }
// };