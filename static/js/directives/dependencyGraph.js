graf.directive('dependencyGraph', function() {
	return {
		restrict: 'EA',
		scope: {
			dependencyGraph: '='
		},
		link: function(scope, elem, attrs) {
			var Graph = function(depGraph) {
				this.depGraph = depGraph;

				var selector = d3.select(elem[0]);
				selector.selectAll('svg').remove();

				this.w = $(elem[0]).width();
				this.h = this.w * 0.6;
				// this.w = 500;
				// this.h = 500;

				this.svg = selector.append('svg:svg')
					.attr('width', this.w)
					.attr('height', this.h);

				var arrowSizeFactor = 1.2;

				// define arrow head
				this.svg.append('defs').append('marker')
					.attr('id', 'arrowhead')
					.attr('refX', 3 * arrowSizeFactor) // 9
					.attr('refY', 1 * arrowSizeFactor)
					.attr('markerWidth', 3 * arrowSizeFactor)
					.attr('markerHeight', 2 * arrowSizeFactor)
					.attr('orient', 'auto')
					.append('path')
					.attr('d', 'M 0,0 V 4 L6,2 Z'); //this is actual shape for arrowhead

				this.build();

				// divide by a factor of the total number of nodes to try and
				// fill up the screen evenly for both dense and sparse graphs
				// var spaceReduction = this.nodes.length;
				var spaceReduction = this.nodes.length;
				console.log(this.nodes.length, spaceReduction)

				this.force = d3.layout.force()
					.nodes(this.nodes)
					.links(this.links)
					.size([this.w, this.h])
					.linkStrength(0.1)
					.friction(0.9)
					.distance(20)
					.charge(function(d) {
						var weight = d.children.length + d.parents.length + 1; 

						return -4000 * weight / spaceReduction;
					})
					.gravity(0.1)
					.theta(0.8)
					.alpha(0.1)
					.linkDistance(function(d) {
						var weight = d.source.children.length + d.target.children.length +
									 d.source.parents.length + d.target.parents.length + 1;

						return 0.75 * weight;
					})
					// .friction()
					.on('tick', this.tick.bind(this))
					.start();

				this.update();
			};

			Graph.prototype.build = function() {
				this.nodes = d3.values(this.depGraph);
				this.links = [];
				for (var i = 0; i < this.nodes.length; i++) {
					n = this.nodes[i];
					for (var j = 0; j < n.children.length; j++) {
						c = n.children[j];
						this.links.push({
							source: n,
							target: this.depGraph[c]
						});
					}
					n.radius = 8;
				}
			}

			Graph.prototype.update = function() {
				// this.build();

				this.svg.selectAll('text').remove();

				// // restart force layout
				// this.force
				// 	// .gravity(Math.atan((this.nodes.length || 1) / 50) / Math.PI * 0.4)
				// 	.nodes(this.nodes)
				// 	.links(this.links)
				// 	// .gravity(Math.atan((this.nodes.length || 1) / 50) / Math.PI * 0.4)
				// 	.start();

				// update existing links
				this.link = this.svg.selectAll('line.link')
					.data(this.links);

				var diagonal = d3.svg.diagonal()
					.projection(function(d) { return [d.y, d.x]; });
					
				this.link.enter().append('svg:line')
					.attr('class', 'link')
					// .attr('marker-end', 'url(#arrowhead)')
					.attr('d', diagonal);

				this.link.exit().remove();

				// update nodes
				this.node = this.svg.selectAll('.node')
					.data(this.nodes);

				this.node
					.enter().append('g')
					.attr('class', function(d) {
						return 'node ' + d.type;
					})
					.call(this.force.drag);

				this.node
					.append('svg:circle')
					.on('mouseover', this.mouseover.bind(this))
					.on('mouseout', this.mouseout.bind(this))
					.on('click', this.click.bind(this))
					.attr('r', function(d) { return d.radius });

				this.node
					.append('text')
					.text(function(d) { return d.name; })
					.attr('text-anchor', 'middle')
					.attr('dy', function(d) {
						return -d.radius - 3;
					});
					
				this.node.exit().remove();
			};

			Graph.prototype.click = function(d) {
				// if (d.type === 'package') {
				// 	// console.log(d.children);
				// 	if (d.children) {
				// 		d._children = d.children;
				// 		d.children = [];
				// 	} else {
				// 		d.children = d._children;
				// 	}
				// 	// console.log(d.children);
				// }
				// this.update();
			};

			Graph.prototype.setHighlight = function(node, bool) {
				var highlightClass = (node.type === 'package')
					? 'package-highlight'
					: 'dependency-highlight';

				for (var i in node.children) {
					this.depGraph[node.children[i]][highlightClass] = bool;
				}

				for (var i in node.parents) {
					var parent = this.depGraph[node.parents[i]];
					var parentHighlight = (parent.type === 'package')
						? 'parent-package-highlight'
						: 'parent-module-highlight';
					parent[parentHighlight] = bool;
				}

				var nodeClsFunctions = {};
				nodeClsFunctions[highlightClass] = function(d) {
					return d[highlightClass];
				};
				nodeClsFunctions['selected'] = function(d) {
					return bool && d === node;
				};
				nodeClsFunctions['parent-package-highlight'] = function(d) {
					return d['parent-package-highlight'];
				};
				nodeClsFunctions['parent-module-highlight'] = function(d) {
					return d['parent-module-highlight'];
				};
				nodeClsFunctions['unfocused'] = function(d) {
					return bool && !d[highlightClass] && d !== node &&
						   !d['parent-package-highlight'] && !d['parent-module-highlight'];
				};

				this.node.classed(nodeClsFunctions);

				var linkClsFunctions = {};
				linkClsFunctions[highlightClass] = function(d) {
						return bool && d.source === node;
				};
				linkClsFunctions['parent-package-highlight'] = function(d) {
					return d.source['parent-package-highlight'];
				};
				linkClsFunctions['parent-module-highlight'] = function(d) {
					return d.source['parent-module-highlight'];
				};
				linkClsFunctions['unfocused'] = function(d) {
					return bool && d.source !== node && d.target !== node;
				};

				this.link.classed(linkClsFunctions)
					.attr('marker-end', function(d) {
						if (bool && (d.source === node || d.target === node)) {
							return 'url(#arrowhead)';
						}
					});
			};

			Graph.prototype.mouseover = function(node) {
				this.setHighlight(node, true);
			};

			Graph.prototype.mouseout = function(node) {
				this.setHighlight(node, false);
			};

			Graph.prototype.tick = function() {
				function calcOffsets(source, target) {
					// Total difference in x and y from source to target
					diffX = target.x - source.x;
					diffY = target.y - source.y;

					// Length of path from center of source node to center of target node
					pathLength = Math.sqrt((diffX * diffX) + (diffY * diffY));

					// x and y distances from center to outside edge of target node
					offsetX = (diffX * target.radius) / pathLength;
					offsetY = (diffY * target.radius) / pathLength;

					return [offsetX, offsetY];
				}
				
				this.link.attr('x1', function(d) { return d.source.x; })
					.attr('y1', function(d) { return d.source.y; })
					.attr('x2', function(d) {
						return d.target.x - calcOffsets(d.source, d.target)[0];
					})
					.attr('y2', function(d) {
						return d.target.y - calcOffsets(d.source, d.target)[1];
					});

				// this.node.attr('cx', function(d) { return d.x; })
				// 	.attr('cy', function(d) { return d.y; });
				this.node.attr('transform', function(d) { return "translate(" + d.x + "," + d.y + ")"; })
			};

			Graph.prototype.cleanup = function() {
				this.nodes = [];
				this.links = [];
				this.update();
				this.force.stop();
			};

			var graph;

			scope.$watch('dependencyGraph', function() {
				if (scope.dependencyGraph) {
					if (graph) graph.cleanup();

					graph = new Graph(scope.dependencyGraph);
				}
			});
		}
	};
});