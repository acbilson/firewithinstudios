function display_diagram(dataPath) {
	d3.json(dataPath).then(function (data) {
		/* DATA */
		nodes_data = data["nodes"];
		links_data = data["links"];

		/* SVG */
		var svg = d3.select("svg");
		var viewBox = svg.attr("viewBox").split(/\s+|,/);
		var width = viewBox[2];
		var height = viewBox[3];

		/* SIMULATION */
		var link_force = d3.forceLink(links_data);
		var simulation = d3.forceSimulation().nodes(nodes_data);

		/* FORCES */
		var link_force = d3
			.forceLink(links_data)
			.id(function (d) {
				return d.name;
			})
			.distance(70);
		var charge_force = d3
			.forceManyBody()
			.distanceMin(50)
			.distanceMax(width - 300)
			.strength(-20);
		var center_force = d3.forceCenter(width / 2, height / 2);
		var collide_force = d3.forceCollide().strength(2);
		var x_force = d3.forceX().strength(0.01);
		var y_force = d3.forceY().strength(0.01);

		simulation
			.force("charge", charge_force)
			.force("center", center_force)
			.force("link", link_force)
			.force("collide", collide_force)
			.force("x", x_force)
			.force("y", y_force);

		/* UPDATES */
		simulation.on("tick", updateCoordsOnTick);

		/* NODES */
		var node = svg
			.append("g")
			.attr("class", "nodes")
			.selectAll("circle")
			.data(nodes_data)
			.enter()
			.append("g")
			.attr("class", "diagram-node")
			.call(drag(simulation));

		var circle = node
			.append("circle")
			.attr("r", function (d) {
				return (d.count + 5) / 2;
			})
			.attr("class", function (d) {
				return `diagram-${d.type}`;
			});

		var text = node
			.append("a")
			.attr("href", function (d) {
				return `${d.path}`;
			})
			.append("text")
			.attr("class", "diagram-node-text")
			.text(function (d) {
				return `${d.name}:${d.count}`;
			})
			.attr("x", function (d) {
				return `-${d.name.length * 3.5}px`;
			})
			.attr("y", "3px");

		/* LINKS */
		var link = svg
			.append("g")
			.selectAll("line")
			.data(links_data)
			.enter()
			.append("line")
			.attr("class", "diagram-link");

		/* TRANSFORM FUNCS */
		function updateCoordsOnTick() {
			//update node position each tick of the simulation
			node.attr("transform", function (d) {
				return `translate(${d.x}, ${d.y})`;
			});

			//update link positions
			//simply tells one end of the line to follow one node around
			//and the other end of the line to follow the other node around
			link
				.attr("x1", function (d) {
					return d.source.x;
				})
				.attr("y1", function (d) {
					return d.source.y;
				})
				.attr("x2", function (d) {
					return d.target.x;
				})
				.attr("y2", function (d) {
					return d.target.y;
				});
		}

		function drag(simulation) {
			function dragstarted(d) {
				if (!d3.event.active) simulation.alphaTarget(0.3).restart();
				d.fx = d.x;
				d.fy = d.y;
			}

			function dragged(d) {
				d.fx = d3.event.x;
				d.fy = d3.event.y;
			}

			function dragended(d) {
				if (!d3.event.active) simulation.alphaTarget(0);
				d.fx = null;
				d.fy = null;
			}

			return d3
				.drag()
				.on("start", dragstarted)
				.on("drag", dragged)
				.on("end", dragended);
		}
	}); // d3.json
} // func display_diagram
