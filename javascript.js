        // Data structure
        let nodes = [];
        let links = [];

        // D3.js setup
        // Graph dimensions
        const width = 800;
        const height = 600;
        const svg = d3.select("#graph")
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        const simulation = d3.forceSimulation()
            .force("link", d3.forceLink().id(d => d.id).distance(150))
            .force("charge", d3.forceManyBody().strength(-200))
            .force("center", d3.forceCenter(width / 2, height / 2));

        function updateGraph() {
            // Clear existing elements
            svg.selectAll("*").remove();
            const link = svg.append("g")
                .selectAll("line")
                .data(links)
                .enter()
                .append("line")
                .attr("class", "link");

            const node = svg.append("g")
                .selectAll("circle")
                .data(nodes)
                .enter()
                .append("circle")
                .attr("class", "node")
                .attr("r", 20)
                .attr("fill", "#69b3a2")
                .on("click", showPopup);

            const labels = svg.append("g")
                .selectAll("text")
                .data(nodes)
                .enter()
                .append("text")
                .text(d => d.name)
                .attr("font-size", "12px")
                .attr("dx", 25)
                .attr("dy", 5);

            // Update simulation
            simulation
                .nodes(nodes)
                .on("tick", () => {
                    link
                        .attr("x1", d => d.source.x)
                        .attr("y1", d => d.source.y)
                        .attr("x2", d => d.target.x)
                        .attr("y2", d => d.target.y);

                    node
                        .attr("cx", d => d.x)
                        .attr("cy", d => d.y);

                    labels
                        .attr("x", d => d.x)
                        .attr("y", d => d.y);
                });

            // Update checkboxes for connections
            const connectionsDiv = document.getElementById("nodeConnections");
            connectionsDiv.innerHTML = ""; // Clear existing checkboxes

            nodes.forEach(node => {
                const checkboxItem = document.createElement("div");
                checkboxItem.className = "checkbox-item";
                
                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.id = `connect-${node.id}`;
                checkbox.value = node.id;
                
                const label = document.createElement("label");
                label.htmlFor = `connect-${node.id}`;
                label.textContent = node.name;
                
                checkboxItem.appendChild(checkbox);
                checkboxItem.appendChild(label);
                connectionsDiv.appendChild(checkboxItem);
            });

            simulation.force("link").links(links);
            simulation.alpha(1).restart();
        }

        function showPopup(event, d) {
            const popup = document.getElementById("popup");
            const connectedNodes = links
                .filter(link => link.source.id === d.id || link.target.id === d.id)
                .map(link => link.source.id === d.id ? link.target.name : link.source.name);

            popup.innerHTML = `
                <h4>${d.name}</h4>
                <p>Age: ${d.age}</p>
                <p>Description: ${d.description}</p>
                <p>Connected to: ${connectedNodes.join(", ") || "None"}</p>
            `;
            
            popup.style.display = "block";
            popup.style.left = (event.pageX + 10) + "px";
            popup.style.top = (event.pageY + 10) + "px";
        }

        function addNode() {
            const name = document.getElementById("nodeName").value;
            const age = document.getElementById("nodeAge").value;
            const description = document.getElementById("nodeDescription").value;
            
            if (!name) return;

            const newNode = {
                id: nodes.length,
                name,
                age,
                description
            };

            nodes.push(newNode);

            // Get selected connections from checkboxes
            const checkboxes = document.querySelectorAll('#nodeConnections input[type="checkbox"]:checked');
            checkboxes.forEach(checkbox => {
                links.push({
                    source: newNode.id,
                    target: parseInt(checkbox.value)
                });
            });

            updateGraph();

            // Clear inputs
            document.getElementById("nodeName").value = "";
            document.getElementById("nodeAge").value = "";
            document.getElementById("nodeDescription").value = "";
        }

        // Close popup when clicking outside
        document.addEventListener("click", (event) => {
            const popup = document.getElementById("popup");
            if (!event.target.closest(".node") && !event.target.closest(".popup")) {
                popup.style.display = "none";
            }
        });

        // Close dropdowns when clicking outside
        document.addEventListener('click', function(event) {
            const connectionsDropdown = document.getElementById('nodeConnections');
            const dropdownHeader = document.querySelector('.dropdown-header');
            
            if (!event.target.closest('.connections-dropdown')) {
                connectionsDropdown.classList.remove('active');
            }
        });

        // Initial render
        updateGraph();
        
        function togglePanel() {
            const panel = document.getElementById('addNodePanel');
            panel.classList.toggle('active');
            const icon = document.querySelector('.toggle-icon');
            icon.textContent = panel.classList.contains('active') ? '▲' : '▼';
        }

        function toggleConnections() {
            const connections = document.getElementById('nodeConnections');
            connections.classList.toggle('active');
        }