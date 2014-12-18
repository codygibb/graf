graf.directive('dependencyGraph', function() {
	return {
		restrict: 'EA',
		scope: {
			dependencyGraph: '='
		},
		link: function(scope, elem, attrs) {
			var Graph = function(depGraph) {
				var selector = d3.select(elem[0]);
				selector.selectAll('svg').remove();

				this.w = $(elem[0]).width();
				this.h = this.w / 2;

				this.svg = selector.append('svg:svg')
					.attr('width', this.w)
					.attr('height', this.h);

				this.nodes = d3.values(depGraph);
				this.links = [];
				for (var i = 0; i < this.nodes.length; i++) {
					n = this.nodes[i];
					for (var j = 0; j < n.children.length; j++) {
						c = n.children[j];
						this.links.push({
							source: n,
							target: depGraph[c]
						});
					}
				}

				this.force = d3.layout.force()
					.size([this.w, this.h])
					.charge(-1000)
    				.linkDistance(120)
    				.friction(0.6)
    				.on('tick', this.tick.bind(this))
					.start();

				this.update();
			};

			Graph.prototype.update = function() {
				// restart force layout
				this.force
					.gravity(Math.atan((this.nodes.length || 1) / 50) / Math.PI * 0.4)
					.nodes(this.nodes)
					.links(this.links)
					.start();

				// update existing links
				this.link = this.svg.selectAll('line.link')
					.data(this.links);
				 	
				this.link.enter().append('svg:line')
				 	.attr('x1', function(d) { return d.source.x; })
					.attr('y1', function(d) { return d.source.y; })
					.attr('x2', function(d) { return d.target.x; })
					.attr('y2', function(d) { return d.target.y; })
					.style('stroke-width', '1');

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
					.attr('r', 10);

				this.node.append('text')
					.text(function(d) { return d.name; })
					.attr('text-anchor', 'middle')
					.attr('dy', -11)
					.style('fill', '#000');
					
					
				this.node.exit().remove();
			};

			Graph.prototype.tick = function() {
				this.link.attr('x1', function(d) { return d.source.x; })
					.attr('y1', function(d) { return d.source.y; })
					.attr('x2', function(d) { return d.target.x; })
					.attr('y2', function(d) { return d.target.y; });

				// this.node.attr('cx', function(d) { return d.x; })
				// 	.attr('cy', function(d) { return d.y; });
				this.node.attr('transform', function(d) { return "translate(" + d.x + "," + d.y + ")"; })
			};

			Graph.prototype.cleanup = function() {
				this.nodes = [];
				this.links = [];
				this.update();
				this.force.stop();
			}

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