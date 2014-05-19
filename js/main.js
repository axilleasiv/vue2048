(function(win) {

	var Game = new Vue({
		el: '#mainVue',
		data: {
			tileDimension: 124,
			tilePosition: 121,
			startTiles: 2,
			tiles: [],
			grid: [],
			conf: gameStorage.fetch('vue2048-config')
		},

		created: function() {
			this.getWindowSize();
		},

		ready: function() {
			var data = gameStorage.fetch('vue2048'),
				conf = this.conf;


			if (conf.score) {
				this.continueGame(data);
			} else {
				
				if (conf.length === 0) {
					//First Kick
					this.conf = {
						score: 0,
						size: 4,
						bestScore: 0
					};
				}
				
				this.init();
			}

			this.$watch('tiles', function(tiles) {
				gameStorage.save('vue2048', tiles);
			});

			this.$watch('conf', function(conf) {
				gameStorage.save('vue2048-config', conf);
			});

		},
		//Can go to templates
		computed: {
			findDimension: function() {
				return this.grid.length * this.tileDimension;
			},

			selected: function() {
				return '';
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

		components: {
			
			tile: {

				replace: true,

				computed: {
					calcStyleX: function(cord) {
						var tilePosition = this.$parent.tilePosition;

						return tilePosition * this.x;
					},

					calcStyleY: function(cord) {
						var tilePosition = this.$parent.tilePosition;

						return tilePosition * this.y;
					},
					isMerged: function(){
						return 'tile-merged';
					}
				}
			}
		},

		directives: {
			selected: {
				isEmpty: true,
				bind: function () {
					if(this.vm.conf.size)
						this.el.value = this.vm.conf.size;
				}
			}
		},


		methods: {

			init: function() {

				var startTiles = this.startTiles;

				this.initArrayGrid(this.conf.size);
				this.clearMessage();

				this.tiles = [];
				this.updateScore(0);

				for (var i = 0; i < startTiles; i++) {
					this.addRandomTile();
				}
			},

			continueGame: function(data) {
				var arr,
					conf;

				conf = this.conf;
				this.initArrayGrid(conf.size);
				arr = this.grid;
				this.tiles = data;

				data.forEach(function(item) {
					arr[item.x][item.y] = 1;
				});
			},

			gameOver: function() {
				this.message();
			},

			initArrayGrid: function(size) {
				var arr = [];

				for (var x = 0; x < size; x++) {
					arr[x] = [];
					for (var y = 0; y < size; y++) {
						arr[x][y] = 0;
					}
				}

				this.grid = arr;
			},

			changesTilesSize: function(e) {
				e.preventDefault();
				this.conf.size = parseInt(e.target.value);

				if(document.activeElement)
					document.activeElement.blur();

				this.init();
			},

			addRandomTile: function() {

				if (this.availableCells().length > 0) {
					var value = Math.random() < 0.9 ? 2 : 4,
						randomCell = this.randomAvailableCell();

					this.addTile({
						x: randomCell.x,
						y: randomCell.y,
						value: value,
						merged: false
					});
				}

			},

			addTile: function(tile) {

				var tiles = this.tiles,
					len = tiles.length;

				tiles.$set(len, {
					x: tile.x,
					y: tile.y,
					value: tile.value,
					merged: tile.merged,
				});

				this.grid[tile.x][tile.y] = 1;
			},

			// Find the first available random position
			randomAvailableCell: function() {
				var cells = this.availableCells();

				if (cells.length) {
					return cells[Math.floor(Math.random() * cells.length)];
				}
			},

			availableCells: function() {
				var cells = [],
					size = this.conf.size,
					grid = this.grid;

				for (var x = 0; x < size; x++) {
					for (var y = 0; y < size; y++) {
						if (!grid[x][y]) {
							cells.push({
								x: x,
								y: y
							});
						}
					}
				}

				return cells;
			},

			getVector: function(direction) {
				var map = {
					0: {
						x: 0,
						y: -1
					}, // Up
					1: {
						x: 1,
						y: 0
					}, // Right
					2: {
						x: 0,
						y: 1
					}, // Down
					3: {
						x: -1,
						y: 0
					} // Left
				};

				return map[direction];
			},

			findFarthestPosition: function(cell, vector) {
				var previous;

				do {
					previous = cell;
					cell = {
						x: previous.x + vector.x,
						y: previous.y + vector.y
					};

				} while (this.withinBounds(cell) && !this.grid[cell.x][cell.y]);

				return {
					farthest: previous,
					next: cell // Used to check if a merge is required
				};
			},

			findTile: function(position) {

				if (position.x === -1 || position.y === -1)
					return null;
				else {
					var tiles = this.tiles;

					return tiles.filter(function(item, index) {
						return item.x === position.x && item.y === position.y;
					})[0];
				}

			},

			moveTile: function(tile, position) {

				if (tile.x === position.x && tile.y === position.y) {
					return false;
				} else {
					this.grid[tile.x][tile.y] = 0;
					this.grid[position.x][position.y] = 1;

					tile.x = position.x;
					tile.y = position.y;

					return true;
				}

			},

			mergeTiles: function(curr, next, position) {

				next.value *= 2;
				next.merged = true;
				
				var tiles = this.tiles;

				//Better Way to find index of data
				for (var key in tiles) {
					if (tiles[key].x === curr.x && tiles[key].y === curr.y) {
						this.tiles.$remove(parseInt(key));
						break;
					}
				}

				this.grid[curr.x][curr.y] = 0;

				// Update the score
				this.updateScore(next.value);

				return true;
			},

			move: function(direction) {

				var vector = this.getVector(direction);
				var traversals = this.buildTraversals(vector);
				var moved = false;
				var self = this;
				var grid = self.grid;
				var positions;
				var next;
				var tile;


				traversals.x.forEach(function(x) {
					traversals.y.forEach(function(y) {
						// console.log(x, y);
						if (grid[x][y]) {
							var tile = self.findTile({
								x: x,
								y: y
							});
							
							//tile.merged = false;
							
							var positions = self.findFarthestPosition({
								x: x,
								y: y
							}, vector);
							//console.log(positions);
							var next = self.findTile(positions.next);

							//console.log(next); 
							// Only one merger per row traversal?
							if (next && next.value === tile.value) {

								moved = self.mergeTiles(tile, next, positions.next);


							} else {
								moved = self.moveTile(tile, positions.farthest);
							}

						}

					});
				});

				if (moved) {
					this.addRandomTile();

					if (grid.toString().indexOf('0') === -1) {
						if (!this.tileMatchesAvailable()) {
							this.gameOver();
						}

					}

				}

			},

			tileMatchesAvailable: function() {

				var size = this.conf.size;
				var grid = this.grid;
				var tiles = this.tiles;
				var tile;

				for (var x = 0; x < size; x++) {
					for (var y = 0; y < size; y++) {
						tile = grid[x][y];

						if (tile) {
							for (var direction = 0; direction < 4; direction++) {
								var vector = this.getVector(direction);
								var cell = {
									x: x + vector.x,
									y: y + vector.y
								},
									other;

								if (cell.x >= 0 && cell.x < size && cell.y >= 0 && cell.y < size) {
									other = grid[cell.x][cell.y];
								} else {
									continue;
								}

								if (other && this.findTile(cell).value === this.findTile({
									x: x,
									y: y
								}).value) {
									return true; // These two tiles can be merged
								}
							}
						}
					}
				}

				return false;
			},

			withinBounds: function(position) {
				var size = this.conf.size;

				return position.x >= 0 && position.x < size && position.y >= 0 && position.y < size;
			},

			buildTraversals: function(vector) {
				var traversals = {
					x: [],
					y: []
				},
					size = this.conf.size;

				for (var pos = 0; pos < size; pos++) {
					traversals.x.push(pos);
					traversals.y.push(pos);
				}

				// Always traverse from the farthest cell in the chosen direction
				if (vector.x === 1) traversals.x = traversals.x.reverse();
				if (vector.y === 1) traversals.y = traversals.y.reverse();

				return traversals;
			},

			updateScore: function(score) {
				var scoreContainer = document.getElementsByClassName('score-container')[0];

				//On init
				if (score === 0) {
					this.conf.score = 0;
					//gameStorage.save('score', 0);

					return false;
				}


				this.conf.score += score;
				//gameStorage.save('score', this.score);

				if (this.conf.score > this.conf.bestScore) {
					this.conf.bestScore = this.conf.score;
					//gameStorage.save('bestScore', this.bestScore);
				}

				// The mighty 2048 tile
				if (score === 2048)
					this.message(true);

				var addition = document.createElement("div");
				addition.classList.add("score-addition");
				addition.textContent = "+" + score;
				scoreContainer.appendChild(addition);

			},

			message: function(won) {
				var type = won ? "game-won" : "game-over";
				var message = won ? "You win!" : "Game over!";
				var messageContainer = document.querySelector(".game-message");

				messageContainer.classList.add(type);
				messageContainer.getElementsByTagName("p")[0].textContent = message;
			},

			clearMessage: function() {
				messageContainer = document.querySelector(".game-message");

				messageContainer.classList.remove("game-won");
				messageContainer.classList.remove("game-over");
			},

			clearContainer: function(container) {
				while (container.firstChild) {
					container.removeChild(container.firstChild);
				}
			},

			getWindowSize: function() {
				var w = window,
					d = document,
					e = d.documentElement,
					g = d.getElementsByTagName('body')[0],
					x = w.innerWidth || e.clientWidth || g.clientWidth,
					y = w.innerHeight || e.clientHeight || g.clientHeight;

				console.log(x);
				console.log(this.conf);
				console.log(x/this.conf.size);


				if (x < 520) {
					this.tileDimension = 69.5;
					this.tilePosition = 67;
				} else {
					this.tileDimension = 124;
					this.tilePosition = 121;

				}
			}

		}
	});



	var Keys = new KeyboardInputManager();


	Keys.on('move', function(direction) {
		Game.move(direction);
	});


	win.onresize = function(event) {
		Game.getWindowSize();
	};

})(window);