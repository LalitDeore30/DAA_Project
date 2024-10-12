const gridSize = { rows: 6, cols: 15 };
const grid = document.getElementById("grid");
const startBtn = document.getElementById("startBtn");
const endBtn = document.getElementById("endBtn");
const deleteBtn = document.getElementById("deleteBtn");
const runBtn = document.getElementById("runBtn");
let start = null;
let end = null;
let gridCells = [];
let mode = "setStart";
let car = null;
let hospital = null;

// Create grid cells
for (let i = 0; i < gridSize.rows; i++) {
	const row = [];
	for (let j = 0; j < gridSize.cols; j++) {
		const cell = document.createElement("div");
		cell.classList.add("cell");
		cell.dataset.row = i;
		cell.dataset.col = j;
		cell.addEventListener("click", () => handleCellClick(cell, i, j));
		grid.appendChild(cell);
		row.push(cell);
	}
	gridCells.push(row);
}

// Handle cell click based on the mode (setting start, end or deleting)
function handleCellClick(cell, row, col) {
	if (mode === "setStart") {
		if (start) start.classList.remove("start");
		cell.classList.add("start");
		start = cell;
		addCarToCell(cell); // Place car on the start cell
	} else if (mode === "setEnd") {
		if (end) end.classList.remove("end");
		cell.classList.add("end");
		end = cell;
		addHospitalToCell(cell); // Place hospital on the end cell
	} else if (mode === "delete") {
		if (cell.classList.contains("start")) {
			start = null;
		} else if (cell.classList.contains("end")) {
			end = null;
		}
		// Change the background to black for "blocked" cells
		cell.classList.add("blocked");
		cell.classList.remove("start", "end", "road");
	}
}

function addCarToCell(cell) {
	if (car) {
		car.remove(); // Remove existing car if already placed
	}
	car = document.createElement("img");
	car.src = "car.png"; // Path to your car PNG
	car.classList.add("car");
	car.style.top = `${cell.offsetTop}px`;
	car.style.left = `${cell.offsetLeft}px`;
	document.body.appendChild(car); // Append car to the body
}

function addHospitalToCell(cell) {
	if (hospital) {
		hospital.remove(); // Remove existing hospital if already placed
	}
	hospital = document.createElement("div");
	hospital.classList.add("hospital");
	hospital.style.top = `${cell.offsetTop}px`;
	hospital.style.left = `${cell.offsetLeft}px`;
	document.body.appendChild(hospital); // Append hospital to the body
}

// Dijkstra's Algorithm to find the shortest path
function dijkstra(start, end) {
	const dist = Array(gridSize.rows)
		.fill()
		.map(() => Array(gridSize.cols).fill(Infinity));
	const prev = Array(gridSize.rows)
		.fill()
		.map(() => Array(gridSize.cols).fill(null));
	const pq = [];
	const directions = [
		[0, 1], // Right
		[1, 0], // Down
		[0, -1], // Left
		[-1, 0], // Up
		[-1, -1], // Top-left
		[-1, 1], // Top-right
		[1, -1], // Bottom-left
		[1, 1], // Bottom-right
	];

	let startX = parseInt(start.dataset.row);
	let startY = parseInt(start.dataset.col);

	dist[startX][startY] = 0;
	pq.push([0, startX, startY]);

	while (pq.length) {
		const [d, x, y] = pq.shift();
		if (d > dist[x][y]) continue;

		for (let [dx, dy] of directions) {
			const newX = x + dx;
			const newY = y + dy;

			if (
				newX >= 0 &&
				newX < gridSize.rows &&
				newY >= 0 &&
				newY < gridSize.cols
			) {
				if (gridCells[newX][newY].classList.contains("blocked")) {
					continue; // Skip blocked cells
				}

				const edgeWeight = gridCells[newX][newY].classList.contains(
					"road"
				)
					? 1
					: 9999; // "9999" for blocked road
				if (dist[x][y] + edgeWeight < dist[newX][newY]) {
					dist[newX][newY] = dist[x][y] + edgeWeight;
					prev[newX][newY] = [x, y];
					pq.push([dist[newX][newY], newX, newY]);
				}
			}
		}
	}

	let path = [];
	let current = [parseInt(end.dataset.row), parseInt(end.dataset.col)];
	while (current) {
		path.push(current);
		current = prev[current[0]][current[1]];
	}
	path.reverse();

	return path;
}

// Set mode to set start point
startBtn.addEventListener("click", () => {
	mode = "setStart";
});

// Set mode to set end point
endBtn.addEventListener("click", () => {
	mode = "setEnd";
});

// Set mode to delete vertex or road
deleteBtn.addEventListener("click", () => {
	mode = "delete";
});

// Run Dijkstra and show the shortest path with animation
runBtn.addEventListener("click", () => {
	if (!start || !end) {
		alert("Please select both start and end points.");
		return;
	}

	const path = dijkstra(start, end);

	// Animate the car along the path
	animateCarOnPath(path);
});

function animateCarOnPath(path) {
	let step = 0;
	const interval = setInterval(() => {
		if (step < path.length) {
			const [x, y] = path[step];
			const carPosition = gridCells[x][y].getBoundingClientRect();

			// Animate the car smoothly
			car.style.top = `${carPosition.top + window.scrollY}px`;
			car.style.left = `${carPosition.left + window.scrollX}px`;

			step++;
		} else {
			clearInterval(interval); // Stop the animation when the car reaches the end
		}
	}, 500); // Adjust the interval time for smoother movement
}