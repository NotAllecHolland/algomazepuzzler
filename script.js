class Node {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.isWall = false;
        this.isVisited = false;
        this.isStart = false;
        this.isEnd = false;
        this.isPath = false;
        this.isCurrent = false;
        this.isHover = false;
        this.isPreviewing = false;
        this.isExploring = false;  // For open list/queue visualization
        this.isProcessed = false;  // For closed list visualization
        
        // Algorithm-specific values
        this.gCost = 0;
        this.hCost = 0;
        this.fCost = 0;
        this.distance = Infinity;
        this.parent = null;
    }
    
    reset() {
        this.isVisited = false;
        this.isPath = false;
        this.isCurrent = false;
        this.isHover = false;
        this.isPreviewing = false;
        this.isExploring = false;
        this.isProcessed = false;
        this.gCost = 0;
        this.hCost = 0;
        this.fCost = 0;
        this.distance = Infinity;
        this.parent = null;
    }
    
    calculateFCost() {
        this.fCost = this.gCost + this.hCost;
    }
    
    canModify() {
        return !this.isStart && !this.isEnd;
    }
    
    getVisualState() {
        if (this.isStart) return 'start';
        if (this.isEnd) return 'end';
        if (this.isCurrent) return 'current';
        if (this.isPath) return 'path';
        if (this.isProcessed) return 'processed';
        if (this.isVisited) return 'visited';
        if (this.isExploring) return 'exploring';
        if (this.isPreviewing) return 'preview';
        if (this.isWall) return 'wall';
        if (this.isHover) return 'hover';
        return 'empty';
    }
}

class MazeGrid {
    constructor(rows = 25, cols = 25) {
        this.rows = rows;
        this.cols = cols;
        this.grid = [];
        this.startNode = null;
        this.endNode = null;
        this.initializeGrid();
    }
    
    initializeGrid(pattern = 'empty') {
        this.grid = [];
        for (let row = 0; row < this.rows; row++) {
            const currentRow = [];
            for (let col = 0; col < this.cols; col++) {
                currentRow.push(new Node(col, row));
            }
            this.grid.push(currentRow);
        }
        
        this.setStartNode(2, 2);
        this.setEndNode(this.cols - 3, this.rows - 3);
        
        if (pattern === 'border') this.createBorderWalls();
        else if (pattern === 'random') this.generateRandomMaze();
        else if (pattern === 'spiral') this.generateSpiralMaze();
        else if (pattern === 'cross') this.generateCrossMaze();
        else if (pattern === 'scatter') this.generateScatterMaze();
    }
    
    getNode(x, y) {
        if (this.isValidCoordinate(x, y)) {
            return this.grid[y][x];
        }
        return null;
    }
    
    isValidCoordinate(x, y) {
        return x >= 0 && x < this.cols && y >= 0 && y < this.rows;
    }
    
    setStartNode(x, y) {
        if (this.startNode) {
            this.startNode.isStart = false;
        }
        this.startNode = this.getNode(x, y);
        if (this.startNode) {
            this.startNode.isStart = true;
            this.startNode.isWall = false;
        }
    }
    
    setEndNode(x, y) {
        if (this.endNode) {
            this.endNode.isEnd = false;
        }
        this.endNode = this.getNode(x, y);
        if (this.endNode) {
            this.endNode.isEnd = true;
            this.endNode.isWall = false;
        }
    }
    
    getNeighbors(node) {
        const neighbors = [];
        const directions = [
            { x: 0, y: -1 }, { x: 1, y: 0 },
            { x: 0, y: 1 }, { x: -1, y: 0 }
        ];
        
        directions.forEach(dir => {
            const newX = node.x + dir.x;
            const newY = node.y + dir.y;
            const neighbor = this.getNode(newX, newY);
            
            if (neighbor && !neighbor.isWall) {
                neighbors.push(neighbor);
            }
        });
        
        return neighbors;
    }
    
    resetNodes() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                this.grid[row][col].reset();
            }
        }
    }
    
    clearWalls() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const node = this.grid[row][col];
                if (!node.isStart && !node.isEnd) {
                    node.isWall = false;
                }
            }
        }
    }
    
    createBorderWalls() {
        for (let col = 0; col < this.cols; col++) {
            this.grid[0][col].isWall = true;
            this.grid[this.rows - 1][col].isWall = true;
        }
        for (let row = 0; row < this.rows; row++) {
            this.grid[row][0].isWall = true;
            this.grid[row][this.cols - 1].isWall = true;
        }
        if (this.startNode) this.startNode.isWall = false;
        if (this.endNode) this.endNode.isWall = false;
    }
    
    generateRandomMaze(density = 0.3) {
        this.clearWalls();
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const node = this.grid[row][col];
                if (!node.isStart && !node.isEnd && Math.random() < density) {
                    node.isWall = true;
                }
            }
        }
    }
    
    generateSpiralMaze() {
        this.clearWalls();
        const centerX = Math.floor(this.cols / 2);
        const centerY = Math.floor(this.rows / 2);
        
        let x = centerX, y = centerY;
        let dx = 0, dy = -1;
        let steps = 1;
        let stepCount = 0;
        let direction = 0;
        
        const wallPositions = new Set();
        const maxSteps = Math.floor(Math.min(this.rows, this.cols) / 2);
        
        for (let i = 0; i < maxSteps * 8; i++) {
            if (this.isValidCoordinate(x, y)) {
                if (i % 3 === 0) {
                    wallPositions.add(`${x},${y}`);
                }
            }
            
            x += dx;
            y += dy;
            stepCount++;
            
            if (stepCount === steps) {
                stepCount = 0;
                direction = (direction + 1) % 4;
                
                if (direction === 0) { dx = 0; dy = -1; }
                else if (direction === 1) { dx = 1; dy = 0; }
                else if (direction === 2) { dx = 0; dy = 1; }
                else { dx = -1; dy = 0; }
                
                if (direction % 2 === 0) steps++;
            }
        }
        
        wallPositions.forEach(pos => {
            const [wx, wy] = pos.split(',').map(Number);
            const node = this.getNode(wx, wy);
            if (node && !node.isStart && !node.isEnd) {
                node.isWall = true;
            }
        });
        
        for (let row = 0; row < this.rows; row += 4) {
            for (let col = 0; col < this.cols; col += 4) {
                const node = this.getNode(col, row);
                if (node && !node.isStart && !node.isEnd) {
                    node.isWall = true;
                }
            }
        }
    }
    
    generateCrossMaze() {
        this.clearWalls();
        const centerX = Math.floor(this.cols / 2);
        const centerY = Math.floor(this.rows / 2);
        
        for (let row = 0; row < this.rows; row++) {
            const node = this.getNode(centerX, row);
            if (node && !node.isStart && !node.isEnd) {
                node.isWall = true;
            }
        }
        
        for (let col = 0; col < this.cols; col++) {
            const node = this.getNode(col, centerY);
            if (node && !node.isStart && !node.isEnd) {
                node.isWall = true;
            }
        }
        
        const gapSize = 3;
        for (let i = -gapSize; i <= gapSize; i++) {
            const vNode = this.getNode(centerX, centerY + i);
            if (vNode && !vNode.isStart && !vNode.isEnd) {
                vNode.isWall = false;
            }
            
            const hNode = this.getNode(centerX + i, centerY);
            if (hNode && !hNode.isStart && !hNode.isEnd) {
                hNode.isWall = false;
            }
        }
        
        for (let i = 1; i < Math.min(this.rows, this.cols) / 2; i++) {
            const node1 = this.getNode(centerX - i, centerY - i);
            if (node1 && !node1.isStart && !node1.isEnd && i % 3 === 0) {
                node1.isWall = true;
            }
            
            const node2 = this.getNode(centerX + i, centerY + i);
            if (node2 && !node2.isStart && !node2.isEnd && i % 3 === 0) {
                node2.isWall = true;
            }
            
            const node3 = this.getNode(centerX + i, centerY - i);
            if (node3 && !node3.isStart && !node3.isEnd && i % 3 === 0) {
                node3.isWall = true;
            }
            
            const node4 = this.getNode(centerX - i, centerY + i);
            if (node4 && !node4.isStart && !node4.isEnd && i % 3 === 0) {
                node4.isWall = true;
            }
        }
    }
    
    generateScatterMaze() {
        this.clearWalls();
        const numClusters = 8;
        const clusterSize = 3;
        
        for (let cluster = 0; cluster < numClusters; cluster++) {
            const centerX = Math.floor(Math.random() * (this.cols - clusterSize * 2)) + clusterSize;
            const centerY = Math.floor(Math.random() * (this.rows - clusterSize * 2)) + clusterSize;
            
            for (let dy = -clusterSize; dy <= clusterSize; dy++) {
                for (let dx = -clusterSize; dx <= clusterSize; dx++) {
                    const node = this.getNode(centerX + dx, centerY + dy);
                    if (node && !node.isStart && !node.isEnd) {
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        if (distance <= clusterSize && Math.random() < 0.7 - distance * 0.1) {
                            node.isWall = true;
                        }
                    }
                }
            }
        }
        
        for (let i = 0; i < this.rows * this.cols * 0.1; i++) {
            const x = Math.floor(Math.random() * this.cols);
            const y = Math.floor(Math.random() * this.rows);
            const node = this.getNode(x, y);
            if (node && !node.isStart && !node.isEnd && Math.random() < 0.3) {
                node.isWall = true;
            }
        }
    }
}

// Base PathfindingAlgorithm class
class PathfindingAlgorithm {
    constructor(grid) {
        this.grid = grid;
        this.visitedNodesInOrder = [];
        this.isRunning = false;
        this.isComplete = false;
        this.algorithmStates = [];
    }
    
    findPath() {
        throw new Error('findPath method must be implemented by subclass');
    }
    
    reconstructPath() {
        const path = [];
        let currentNode = this.grid.endNode;
        
        while (currentNode) {
            path.unshift(currentNode);
            currentNode = currentNode.parent;
        }
        
        path.forEach(node => {
            if (!node.isStart && !node.isEnd) {
                node.isPath = true;
            }
        });
        
        return path;
    }
    
    getManhattanDistance(nodeA, nodeB) {
        return Math.abs(nodeA.x - nodeB.x) + Math.abs(nodeA.y - nodeB.y);
    }
    
    getEuclideanDistance(nodeA, nodeB) {
        const dx = nodeA.x - nodeB.x;
        const dy = nodeA.y - nodeB.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    reset() {
        this.visitedNodesInOrder = [];
        this.isRunning = false;
        this.isComplete = false;
        this.algorithmStates = [];
        this.grid.resetNodes();
    }
}

// BFS Algorithm
class BFSAlgorithm extends PathfindingAlgorithm {
    constructor(grid) {
        super(grid);
        this.queue = [];
        this.visitedSet = new Set();
    }
    
    findPath() {
        this.reset();
        this.isRunning = true;
        this.queue = [];
        this.visitedSet = new Set();
        this.visitedNodesInOrder = [];
        
        const startNode = this.grid.startNode;
        const endNode = this.grid.endNode;
        
        if (!startNode || !endNode) {
            this.isRunning = false;
            return [];
        }
        
        this.queue.push(startNode);
        this.visitedSet.add(startNode);
        
        while (this.queue.length > 0) {
            const currentNode = this.queue.shift();
            
            if (!currentNode.isStart && !currentNode.isEnd) {
                currentNode.isVisited = true;
            }
            this.visitedNodesInOrder.push(currentNode);
            
            if (currentNode === endNode) {
                this.isComplete = true;
                this.isRunning = false;
                return this.reconstructPath();
            }
            
            const neighbors = this.grid.getNeighbors(currentNode);
            
            for (const neighbor of neighbors) {
                if (this.visitedSet.has(neighbor)) {
                    continue;
                }
                
                this.visitedSet.add(neighbor);
                neighbor.parent = currentNode;
                this.queue.push(neighbor);
            }
        }
        
        this.isComplete = true;
        this.isRunning = false;
        return [];
    }
    
    reset() {
        super.reset();
        this.queue = [];
        this.visitedSet.clear();
    }
    
    getCurrentState() {
        return {
            queue: [...this.queue],
            visitedNodes: [...this.visitedNodesInOrder],
            visitedSet: new Set(this.visitedSet)
        };
    }
}

// Dijkstra Algorithm
class DijkstraAlgorithm extends PathfindingAlgorithm {
    constructor(grid) {
        super(grid);
        this.unvisitedNodes = [];
    }
    
    findPath() {
        this.reset();
        this.isRunning = true;
        this.unvisitedNodes = [];
        this.visitedNodesInOrder = [];
        
        const startNode = this.grid.startNode;
        const endNode = this.grid.endNode;
        
        if (!startNode || !endNode) {
            this.isRunning = false;
            return [];
        }
        
        this.initializeNodes();
        startNode.distance = 0;
        
        for (let row = 0; row < this.grid.rows; row++) {
            for (let col = 0; col < this.grid.cols; col++) {
                this.unvisitedNodes.push(this.grid.grid[row][col]);
            }
        }
        
        while (this.unvisitedNodes.length > 0) {
            this.sortNodesByDistance();
            const currentNode = this.unvisitedNodes.shift();
            
            if (currentNode.isWall || currentNode.distance === Infinity) {
                continue;
            }
            
            if (!currentNode.isStart && !currentNode.isEnd) {
                currentNode.isVisited = true;
            }
            this.visitedNodesInOrder.push(currentNode);
            
            if (currentNode === endNode) {
                this.isComplete = true;
                this.isRunning = false;
                return this.reconstructPath();
            }
            
            this.updateNeighbors(currentNode);
        }
        
        this.isComplete = true;
        this.isRunning = false;
        return [];
    }
    
    initializeNodes() {
        for (let row = 0; row < this.grid.rows; row++) {
            for (let col = 0; col < this.grid.cols; col++) {
                const node = this.grid.grid[row][col];
                node.distance = Infinity;
                node.parent = null;
            }
        }
    }
    
    sortNodesByDistance() {
        this.unvisitedNodes.sort((nodeA, nodeB) => nodeA.distance - nodeB.distance);
    }
    
    updateNeighbors(node) {
        const neighbors = this.grid.getNeighbors(node);
        
        for (const neighbor of neighbors) {
            if (!this.unvisitedNodes.includes(neighbor)) {
                continue;
            }
            
            const tentativeDistance = node.distance + 1;
            
            if (tentativeDistance < neighbor.distance) {
                neighbor.distance = tentativeDistance;
                neighbor.parent = node;
            }
        }
    }
    
    getCurrentState() {
        return {
            unvisitedNodes: [...this.unvisitedNodes],
            visitedNodes: [...this.visitedNodesInOrder]
        };
    }
}

// A* Algorithm with enhanced state tracking
class AStarAlgorithm extends PathfindingAlgorithm {
    constructor(grid) {
        super(grid);
        this.openList = [];
        this.closedList = [];
    }
    
    findPath() {
        this.reset();
        this.isRunning = true;
        this.openList = [];
        this.closedList = [];
        this.visitedNodesInOrder = [];
        this.algorithmStates = [];
        
        const startNode = this.grid.startNode;
        const endNode = this.grid.endNode;
        
        if (!startNode || !endNode) {
            this.isRunning = false;
            return [];
        }
        
        startNode.gCost = 0;
        startNode.hCost = this.getManhattanDistance(startNode, endNode);
        startNode.calculateFCost();
        
        this.openList.push(startNode);
        
        while (this.openList.length > 0) {
            let currentNode = this.openList[0];
            let currentIndex = 0;
            
            for (let i = 1; i < this.openList.length; i++) {
                if (this.openList[i].fCost < currentNode.fCost || 
                    (this.openList[i].fCost === currentNode.fCost && this.openList[i].hCost < currentNode.hCost)) {
                    currentNode = this.openList[i];
                    currentIndex = i;
                }
            }
            
            this.openList.splice(currentIndex, 1);
            this.closedList.push(currentNode);
            
            if (!currentNode.isStart && !currentNode.isEnd) {
                currentNode.isVisited = true;
            }
            this.visitedNodesInOrder.push(currentNode);
            
            this.algorithmStates.push({
                openList: [...this.openList],
                closedList: [...this.closedList],
                currentNode: currentNode
            });
            
            if (currentNode === endNode) {
                this.isComplete = true;
                this.isRunning = false;
                return this.reconstructPath();
            }
            
            const neighbors = this.grid.getNeighbors(currentNode);
            
            for (const neighbor of neighbors) {
                if (this.closedList.includes(neighbor)) {
                    continue;
                }
                
                const tentativeGCost = currentNode.gCost + 1;
                const isInOpenList = this.openList.includes(neighbor);
                
                if (!isInOpenList || tentativeGCost < neighbor.gCost) {
                    neighbor.parent = currentNode;
                    neighbor.gCost = tentativeGCost;
                    neighbor.hCost = this.getManhattanDistance(neighbor, endNode);
                    neighbor.calculateFCost();
                    
                    if (!isInOpenList) {
                        this.openList.push(neighbor);
                    }
                }
            }
        }
        
        this.isComplete = true;
        this.isRunning = false;
        return [];
    }
    
    getCurrentState() {
        return {
            openList: [...this.openList],
            closedList: [...this.closedList],
            visitedNodes: [...this.visitedNodesInOrder]
        };
    }
    
    isFinished() {
        return this.isComplete;
    }
}

// Enhanced Visualizer with Step Controls
class Visualizer {
    constructor(grid, canvas) {
        this.grid = grid;
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.animationSpeed = 3;
        this.isAnimating = false;
        this.isPaused = false;
        this.stepMode = false;
        
        this.currentStep = 0;
        this.animationSteps = [];
        this.animationPath = [];
        this.animationCallback = null;
        
        this.colors = {
            empty: '#ffffff',
            wall: '#2c3e50',
            start: '#27ae60',
            end: '#e74c3c',
            visited: '#74b9ff',
            current: '#fdcb6e',
            path: '#6c5ce7',
            hover: '#ddd6fe',
            preview: '#95a5a6',
            grid: '#b2bec3',
            exploring: '#81ecec',
            processed: '#d63031'
        };
        
        this.speedMap = {
            1: { delay: 300, label: 'Very Slow' },
            2: { delay: 150, label: 'Slow' },
            3: { delay: 75, label: 'Medium' },
            4: { delay: 25, label: 'Fast' },
            5: { delay: 5, label: 'Very Fast' }
        };
        
        this.initializeCanvas();
    }
    
    getAnimationDelay() {
        return this.speedMap[this.animationSpeed].delay;
    }
    
    getSpeedLabel() {
        return this.speedMap[this.animationSpeed].label;
    }
    
    setAnimationSpeed(speed) {
        this.animationSpeed = Math.max(1, Math.min(5, speed));
    }
    
    toggleStepMode() {
        this.stepMode = !this.stepMode;
        return this.stepMode;
    }
    
    stepForward() {
        if (!this.isAnimating || !this.stepMode) return false;
        
        if (this.currentStep < this.animationSteps.length) {
            this.executeAnimationStep(this.currentStep);
            this.currentStep++;
            return true;
        }
        return false;
    }
    
    stepBackward() {
        if (!this.isAnimating || !this.stepMode || this.currentStep <= 0) return false;
        
        this.currentStep--;
        this.restoreToStep(this.currentStep);
        return true;
    }
    
    executeAnimationStep(stepIndex) {
        if (stepIndex >= this.animationSteps.length) return;
        
        const step = this.animationSteps[stepIndex];
        
        if (stepIndex > 0) {
            const prevStep = this.animationSteps[stepIndex - 1];
            if (prevStep.node && !prevStep.node.isStart && !prevStep.node.isEnd) {
                prevStep.node.isCurrent = false;
            }
        }
        
        if (step.node && !step.node.isStart && !step.node.isEnd) {
            step.node.isVisited = true;
            step.node.isCurrent = true;
        }
        
        if (step.algorithmState) {
            this.applyAlgorithmState(step.algorithmState);
        }
        
        this.render();
    }
    
    restoreToStep(stepIndex) {
        this.grid.resetNodes();
        
        for (let i = 0; i <= stepIndex && i < this.animationSteps.length; i++) {
            const step = this.animationSteps[i];
            if (step.node && !step.node.isStart && !step.node.isEnd) {
                step.node.isVisited = true;
                if (i === stepIndex) {
                    step.node.isCurrent = true;
                }
            }
            
            if (step.algorithmState) {
                this.applyAlgorithmState(step.algorithmState);
            }
        }
        
        this.render();
    }
    
    applyAlgorithmState(state) {
        if (state.openList) {
            state.openList.forEach(node => {
                if (!node.isStart && !node.isEnd && !node.isVisited) {
                    node.isExploring = true;
                }
            });
        }
        
        if (state.closedList) {
            state.closedList.forEach(node => {
                if (!node.isStart && !node.isEnd) {
                    node.isProcessed = true;
                }
            });
        }
    }
    
    togglePlayPause() {
        if (!this.isAnimating) return false;
        
        this.isPaused = !this.isPaused;
        
        if (!this.isPaused && this.stepMode) {
            this.continueStepAnimation();
        }
        
        return !this.isPaused;
    }
    
    continueStepAnimation() {
        if (this.isPaused || !this.stepMode) return;
        
        const step = () => {
            if (this.isPaused) return;
            
            if (this.currentStep < this.animationSteps.length) {
                this.executeAnimationStep(this.currentStep);
                this.currentStep++;
                setTimeout(step, this.getAnimationDelay());
            } else {
                this.finishAnimation();
            }
        };
        
        step();
    }
    
    initializeCanvas() {
        requestAnimationFrame(() => {
            this.calculateCellSize();
            this.setCanvasSize();
            
            setTimeout(() => {
                this.render();
            }, 10);
        });
    }
    
    calculateCellSize() {
        const container = this.canvas.parentElement;
        const maxCanvasWidth = container ? 
            Math.min(container.offsetWidth * 0.95, 800) : 
            Math.min(window.innerWidth * 0.9, 600);
        const maxCanvasHeight = Math.min(window.innerHeight * 0.5, 500);
        
        const cellSizeByWidth = Math.floor(maxCanvasWidth / this.grid.cols);
        const cellSizeByHeight = Math.floor(maxCanvasHeight / this.grid.rows);
        
        this.cellSize = Math.min(cellSizeByWidth, cellSizeByHeight);
        this.cellSize = Math.max(this.cellSize, 15);
        this.cellSize = Math.min(this.cellSize, 25);
    }
    
    setCanvasSize() {
        const width = this.grid.cols * this.cellSize;
        const height = this.grid.rows * this.cellSize;
        
        this.canvas.width = width;
        this.canvas.height = height;
        
        this.canvas.style.width = width + 'px';
        this.canvas.style.height = height + 'px';
        
        this.ctx.imageSmoothingEnabled = false;
    }
    
    renderCell(node, highlight = false) {
        const x = node.x * this.cellSize;
        const y = node.y * this.cellSize;
        
        let color = this.colors.empty;
        
        if (node.isStart) color = this.colors.start;
        else if (node.isEnd) color = this.colors.end;
        else if (node.isCurrent) color = this.colors.current;
        else if (node.isPath) color = this.colors.path;
        else if (node.isProcessed) color = this.colors.processed;
        else if (node.isVisited) color = this.colors.visited;
        else if (node.isExploring) color = this.colors.exploring;
        else if (node.isPreviewing) color = this.colors.preview;
        else if (node.isWall) color = this.colors.wall;
        else if (highlight || node.isHover) color = this.colors.hover;
        
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
        
        if (node.isVisited && !node.isCurrent && !node.isPath) {
            const gradient = this.ctx.createLinearGradient(x, y, x + this.cellSize, y + this.cellSize);
            gradient.addColorStop(0, 'rgba(116, 185, 255, 0.1)');
            gradient.addColorStop(1, 'rgba(116, 185, 255, 0.3)');
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
        }
        
        if (node.isPreviewing) {
            this.ctx.strokeStyle = this.colors.wall;
            this.ctx.lineWidth = 2;
            this.ctx.setLineDash([3, 3]);
            this.ctx.strokeRect(x + 1, y + 1, this.cellSize - 2, this.cellSize - 2);
            this.ctx.setLineDash([]);
        }
        
        this.ctx.strokeStyle = this.colors.grid;
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x, y, this.cellSize, this.cellSize);
        
        if (node.isStart || node.isEnd) {
            this.ctx.fillStyle = 'white';
            const fontSize = Math.max(10, this.cellSize * 0.5);
            this.ctx.font = `bold ${fontSize}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            
            const centerX = x + this.cellSize / 2;
            const centerY = y + this.cellSize / 2;
            
            this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            this.ctx.shadowOffsetX = 1;
            this.ctx.shadowOffsetY = 1;
            this.ctx.shadowBlur = 2;
            
            if (node.isStart) {
                this.ctx.fillText('S', centerX, centerY);
            } else if (node.isEnd) {
                this.ctx.fillText('E', centerX, centerY);
            }
            
            this.ctx.shadowColor = 'transparent';
            this.ctx.shadowOffsetX = 0;
            this.ctx.shadowOffsetY = 0;
            this.ctx.shadowBlur = 0;
        }
        
        if (node.isCurrent) {
            this.ctx.strokeStyle = '#2d3436';
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(x + 2, y + 2, this.cellSize - 4, this.cellSize - 4);
        }
    }
    
    render() {
        if (!this.canvas || !this.ctx) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let row = 0; row < this.grid.rows; row++) {
            for (let col = 0; col < this.grid.cols; col++) {
                this.renderCell(this.grid.grid[row][col]);
            }
        }
    }
    
    renderWithHover(hoverNode) {
        if (!this.canvas || !this.ctx) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let row = 0; row < this.grid.rows; row++) {
            for (let col = 0; col < this.grid.cols; col++) {
                const node = this.grid.grid[row][col];
                const highlight = node === hoverNode;
                this.renderCell(node, highlight);
            }
        }
    }
    
    handleResize() {
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            this.calculateCellSize();
            this.setCanvasSize();
            this.render();
        }, 100);
    }
    
    animateAlgorithm(visitedNodes, finalPath = [], algorithmStates = []) {
        return new Promise((resolve) => {
            this.isAnimating = true;
            this.isPaused = false;
            this.currentStep = 0;
            this.animationSteps = [];
            this.animationPath = finalPath;
            this.animationCallback = resolve;
            
            this.grid.resetNodes();
            this.render();
            
            visitedNodes.forEach((node, index) => {
                this.animationSteps.push({
                    node: node,
                    type: 'visit',
                    algorithmState: algorithmStates[index] || null
                });
            });
            
            finalPath.forEach((node, index) => {
                this.animationSteps.push({
                    node: node,
                    type: 'path',
                    pathIndex: index
                });
            });
            
            if (this.stepMode) {
                this.render();
            } else {
                this.runAutomaticAnimation();
            }
        });
    }
    
    runAutomaticAnimation() {
        let visitedIndex = 0;
        let pathIndex = 0;
        const animationDelay = this.getAnimationDelay();
        
        const animateStep = () => {
            if (this.isPaused) {
                setTimeout(animateStep, 100);
                return;
            }
            
            if (visitedIndex < this.animationSteps.length - this.animationPath.length) {
                const step = this.animationSteps[visitedIndex];
                
                if (visitedIndex > 0) {
                    const prevStep = this.animationSteps[visitedIndex - 1];
                    if (prevStep.node && !prevStep.node.isStart && !prevStep.node.isEnd) {
                        prevStep.node.isCurrent = false;
                    }
                }
                
                if (step.node && !step.node.isStart && !step.node.isEnd) {
                    step.node.isVisited = true;
                    step.node.isCurrent = true;
                }
                
                if (step.algorithmState) {
                    this.applyAlgorithmState(step.algorithmState);
                }
                
                this.render();
                visitedIndex++;
                setTimeout(animateStep, animationDelay);
                
            } else if (pathIndex < this.animationPath.length && this.animationPath.length > 0) {
                if (visitedIndex > 0) {
                    const lastStep = this.animationSteps[visitedIndex - 1];
                    if (lastStep.node) {
                        lastStep.node.isCurrent = false;
                    }
                }
                
                const pathNode = this.animationPath[pathIndex];
                if (!pathNode.isStart && !pathNode.isEnd) {
                    pathNode.isPath = true;
                }
                
                this.render();
                pathIndex++;
                setTimeout(animateStep, 50);
                
            } else {
                this.finishAnimation();
            }
        };
        
        animateStep();
    }
    
    finishAnimation() {
        this.isAnimating = false;
        this.isPaused = false;
        this.currentStep = 0;
        
        for (let row = 0; row < this.grid.rows; row++) {
            for (let col = 0; col < this.grid.cols; col++) {
                const node = this.grid.grid[row][col];
                node.isCurrent = false;
                node.isExploring = false;
                node.isProcessed = false;
            }
        }
        
        this.render();
        
        if (this.animationCallback) {
            this.animationCallback();
            this.animationCallback = null;
        }
    }
}

// Enhanced UI Controller with Visualization Controls
class UIController {
    constructor(visualizer, grid) {
        this.visualizer = visualizer;
        this.grid = grid;
        this.isMouseDown = false;
        this.isDraggingNode = false;
        this.draggedNode = null;
        this.lastHoverNode = null;
        this.lastDrawnNode = null;
        
        this.drawingMode = 'wall';
        this.initialWallState = null;
        
        this.algorithms = new Map();
        this.currentAlgorithm = null;
        this.isRunningAlgorithm = false;
        
        this.setupEventListeners();
        this.setupControlButtons();
        this.setupModeButtons();
        this.setupAlgorithmControls();
        this.setupResizeHandler();
        this.initializeAlgorithms();
    }
    
    initializeAlgorithms() {
        this.algorithms.set('astar', AStarAlgorithm);
        this.algorithms.set('dijkstra', DijkstraAlgorithm);
        this.algorithms.set('bfs', BFSAlgorithm);
        this.setAlgorithm('astar');
    }
    
    setAlgorithm(algorithmName) {
        const AlgorithmClass = this.algorithms.get(algorithmName);
        if (AlgorithmClass) {
            this.currentAlgorithm = new AlgorithmClass(this.grid);
        }
    }
    
    setupEventListeners() {
        const canvas = this.visualizer.canvas;
        
        canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        canvas.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
        
        canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        
        this.setupVisualizationControls();
    }
    
    setupVisualizationControls() {
        const speedControl = document.getElementById('speedControl');
        const speedLabel = document.getElementById('speedLabel');
        
        speedControl.addEventListener('input', (e) => {
            const speed = parseInt(e.target.value);
            this.visualizer.setAnimationSpeed(speed);
            speedLabel.textContent = this.visualizer.getSpeedLabel();
        });
        
        speedLabel.textContent = this.visualizer.getSpeedLabel();
        
        document.getElementById('stepModeBtn').addEventListener('click', () => {
            this.toggleStepMode();
        });
        
        document.getElementById('stepForwardBtn').addEventListener('click', () => {
            this.stepForward();
        });
        
        document.getElementById('stepBackwardBtn').addEventListener('click', () => {
            this.stepBackward();
        });
        
        document.getElementById('playPauseBtn').addEventListener('click', () => {
            this.togglePlayPause();
        });
    }
    
    toggleStepMode() {
        const isStepMode = this.visualizer.toggleStepMode();
        const stepModeBtn = document.getElementById('stepModeBtn');
        
        stepModeBtn.textContent = isStepMode ? 'Exit Step Mode' : 'Step Mode';
        stepModeBtn.classList.toggle('active', isStepMode);
        
        this.updateStepControls(isStepMode);
        
        this.updateStatus(isStepMode ? 
            'Step mode enabled. Use controls to step through algorithm execution.' : 
            'Step mode disabled. Algorithms will run continuously.');
    }
    
    updateStepControls(isStepMode) {
        document.getElementById('stepForwardBtn').disabled = !isStepMode || !this.visualizer.isAnimating;
        document.getElementById('stepBackwardBtn').disabled = !isStepMode || !this.visualizer.isAnimating || this.visualizer.currentStep <= 0;
        document.getElementById('playPauseBtn').disabled = !isStepMode || !this.visualizer.isAnimating;
    }
    
    stepForward() {
        if (this.visualizer.stepForward()) {
            this.updateStepControls(true);
        }
    }
    
    stepBackward() {
        if (this.visualizer.stepBackward()) {
            this.updateStepControls(true);
        }
    }
    
    togglePlayPause() {
        const isPlaying = this.visualizer.togglePlayPause();
        const playPauseBtn = document.getElementById('playPauseBtn');
        playPauseBtn.textContent = isPlaying ? 'Pause' : 'Play';
    }
    
    setupAlgorithmControls() {
        document.getElementById('algorithmSelect').addEventListener('change', (event) => {
            this.setAlgorithm(event.target.value);
            this.updateStatus(`Switched to ${event.target.selectedOptions[0].text} algorithm.`);
        });
        
        document.getElementById('runAlgorithmBtn').addEventListener('click', () => {
            this.runAlgorithm();
        });
        
        document.getElementById('clearPathBtn').addEventListener('click', () => {
            this.clearPath();
        });
    }
    
    async runAlgorithm() {
        if (!this.currentAlgorithm || this.isRunningAlgorithm || this.visualizer.isAnimating) {
            return;
        }
        
        if (!this.grid.startNode || !this.grid.endNode) {
            this.updateStatus('Please set both start and end points!');
            return;
        }
        
        this.isRunningAlgorithm = true;
        this.updateRunButton(true);
        
        this.grid.resetNodes();
        this.visualizer.render();
        
        this.updateStatus('Running pathfinding algorithm...');
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        try {
            const path = this.currentAlgorithm.findPath();
            
            const algorithmStates = this.currentAlgorithm.algorithmStates || [];
            
            if (this.visualizer.stepMode) {
                this.updateStepControls(true);
                document.getElementById('playPauseBtn').textContent = 'Play';
            }
            
            await this.visualizer.animateAlgorithm(
                this.currentAlgorithm.visitedNodesInOrder, 
                path,
                algorithmStates
            );
            
            if (path.length > 0) {
                this.updateStatus(`Path found! Length: ${path.length - 1} steps. Nodes explored: ${this.currentAlgorithm.visitedNodesInOrder.length}`);
            } else {
                this.updateStatus('No path exists between start and end points.');
            }
        } catch (error) {
            console.error('Error running algorithm:', error);
            this.updateStatus('Error occurred while running algorithm.');
        } finally {
            this.isRunningAlgorithm = false;
            this.updateRunButton(false);
            
            this.updateStepControls(false);
        }
    }
    
    clearPath() {
        this.grid.resetNodes();
        this.visualizer.render();
        this.updateStatus('Path cleared. Ready to run algorithm again.');
    }
    
    updateRunButton(isRunning) {
        const runBtn = document.getElementById('runAlgorithmBtn');
        runBtn.disabled = isRunning;
        runBtn.textContent = isRunning ? 'Running...' : 'Find Path';
        
        document.getElementById('algorithmSelect').disabled = isRunning;
        document.querySelectorAll('.mode-button').forEach(btn => {
            btn.disabled = isRunning;
        });
    }
    
    setupModeButtons() {
        const modeButtons = [
            { id: 'wallModeBtn', mode: 'wall' },
            { id: 'startModeBtn', mode: 'start' },
            { id: 'endModeBtn', mode: 'end' },
            { id: 'eraseModeBtn', mode: 'erase' }
        ];
        
        modeButtons.forEach(({ id, mode }) => {
            document.getElementById(id).addEventListener('click', () => {
                this.setDrawingMode(mode);
            });
        });
    }
    
    setDrawingMode(mode) {
        this.drawingMode = mode;
        
        document.querySelectorAll('.mode-button').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeButton = document.getElementById(`${mode}ModeBtn`);
        if (activeButton) {
            activeButton.classList.add('active');
        }
        
        this.updateModeStatus();
        this.updateCanvasCursor();
        
        this.clearPreviews();
        this.visualizer.render();
    }
    
    updateModeStatus() {
        const statusMessages = {
            wall: 'Click and drag to draw walls. Hold to draw continuously.',
            start: 'Click to place the start point.',
            end: 'Click to place the end point.',
            erase: 'Click and drag to erase walls.'
        };
        
        this.updateStatus(statusMessages[this.drawingMode]);
    }
    
    updateCanvasCursor() {
        const cursors = {
            wall: 'cell',
            start: 'grab',
            end: 'grab',
            erase: 'not-allowed'
        };
        
        this.visualizer.canvas.style.cursor = cursors[this.drawingMode];
    }
    
    clearPreviews() {
        for (let row = 0; row < this.grid.rows; row++) {
            for (let col = 0; col < this.grid.cols; col++) {
                this.grid.grid[row][col].isPreviewing = false;
                this.grid.grid[row][col].isHover = false;
            }
        }
    }
    
    handleMouseDown(event) {
        if (this.visualizer.isAnimating || this.isRunningAlgorithm) return;
        
        this.isMouseDown = true;
        const node = this.getNodeFromMouseEvent(event);
        
        if (!node) return;
        
        switch (this.drawingMode) {
            case 'wall':
                if (node.canModify()) {
                    this.initialWallState = node.isWall;
                    this.toggleWall(node);
                    this.lastDrawnNode = node;
                }
                break;
                
            case 'erase':
                if (node.canModify() && node.isWall) {
                    node.isWall = false;
                    this.visualizer.render();
                    this.lastDrawnNode = node;
                }
                break;
                
            case 'start':
                if (node.canModify()) {
                    this.clearPath();
                    this.grid.setStartNode(node.x, node.y);
                    this.visualizer.render();
                    this.updateStatus('Start point moved.');
                }
                break;
                
            case 'end':
                if (node.canModify()) {
                    this.clearPath();
                    this.grid.setEndNode(node.x, node.y);
                    this.visualizer.render();
                    this.updateStatus('End point moved.');
                }
                break;
        }
    }
    
    handleMouseMove(event) {
        const node = this.getNodeFromMouseEvent(event);
        
        if (!node) return;
        
        if (node !== this.lastHoverNode) {
            this.clearPreviews();
            
            if (!this.isMouseDown && this.drawingMode === 'wall' && node.canModify()) {
                node.isPreviewing = true;
            } else if (!this.isMouseDown && node.canModify()) {
                node.isHover = true;
            }
            
            this.lastHoverNode = node;
            this.visualizer.render();
        }
        
        if (this.isMouseDown && node !== this.lastDrawnNode) {
            switch (this.drawingMode) {
                case 'wall':
                    if (node.canModify()) {
                        node.isWall = !this.initialWallState;
                        this.lastDrawnNode = node;
                        this.visualizer.render();
                    }
                    break;
                    
                case 'erase':
                    if (node.canModify() && node.isWall) {
                        node.isWall = false;
                        this.lastDrawnNode = node;
                        this.visualizer.render();
                    }
                    break;
            }
        }
    }
    
    handleMouseUp(event) {
        this.isMouseDown = false;
        this.lastDrawnNode = null;
        this.initialWallState = null;
        
        if (this.drawingMode === 'wall' || this.drawingMode === 'erase') {
            this.updateModeStatus();
        }
    }
    
    handleMouseLeave(event) {
        this.isMouseDown = false;
        this.lastDrawnNode = null;
        this.initialWallState = null;
        this.clearPreviews();
        this.visualizer.render();
    }
    
    toggleWall(node) {
        if (!node.canModify()) {
            this.updateStatus('Cannot modify start or end points!');
            return false;
        }
        
        node.isWall = !node.isWall;
        this.visualizer.render();
        return true;
    }
    
    handleKeyDown(event) {
        if (this.visualizer.isAnimating || this.isRunningAlgorithm) return;
        
        switch (event.key) {
            case '1':
                this.setDrawingMode('wall');
                break;
            case '2':
                this.setDrawingMode('start');
                break;
            case '3':
                this.setDrawingMode('end');
                break;
            case '4':
                this.setDrawingMode('erase');
                break;
            case ' ':
                event.preventDefault();
                this.generateRandomMaze();
                break;
            case 'c':
                this.clearWalls();
                break;
            case 'r':
                this.reset();
                break;
            case 'Enter':
                event.preventDefault();
                this.runAlgorithm();
                break;
            case 'Escape':
                this.clearPath();
                break;
        }
    }
    
    setupControlButtons() {
        document.getElementById('clearWallsBtn').addEventListener('click', () => {
            this.clearWalls();
        });
        
        document.getElementById('randomMazeBtn').addEventListener('click', () => {
            this.generateRandomMaze();
        });
        
        document.getElementById('borderWallsBtn').addEventListener('click', () => {
            this.generateBorderWalls();
        });
        
        document.getElementById('spiralMazeBtn').addEventListener('click', () => {
            this.generateSpiralMaze();
        });
        
        document.getElementById('crossMazeBtn').addEventListener('click', () => {
            this.generateCrossMaze();
        });
        
        document.getElementById('scatterMazeBtn').addEventListener('click', () => {
            this.generateScatterMaze();
        });
        
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.reset();
        });
    }
    
    setupResizeHandler() {
        window.addEventListener('resize', () => {
            this.visualizer.handleResize();
        });
    }
    
    getNodeFromMouseEvent(event) {
        const rect = this.visualizer.canvas.getBoundingClientRect();
        const x = Math.floor((event.clientX - rect.left) / this.visualizer.cellSize);
        const y = Math.floor((event.clientY - rect.top) / this.visualizer.cellSize);
        return this.grid.getNode(x, y);
    }
    
    clearWalls() {
        this.grid.clearWalls();
        this.visualizer.render();
        this.updateStatus('All walls cleared.');
    }
    
    generateRandomMaze() {
        this.grid.generateRandomMaze(0.35);
        this.visualizer.render();
        this.updateStatus('Random maze generated.');
    }
    
    generateBorderWalls() {
        this.grid.createBorderWalls();
        this.visualizer.render();
        this.updateStatus('Border walls created.');
    }
    
    generateSpiralMaze() {
        this.grid.generateSpiralMaze();
        this.visualizer.render();
        this.updateStatus('Spiral maze generated.');
    }
    
    generateCrossMaze() {
        this.grid.generateCrossMaze();
        this.visualizer.render();
        this.updateStatus('Cross maze generated.');
    }
    
    generateScatterMaze() {
        this.grid.generateScatterMaze();
        this.visualizer.render();
        this.updateStatus('Scatter maze generated.');
    }
    
    reset() {
        this.grid.resetNodes();
        this.visualizer.render();
        this.updateStatus('Maze reset.');
    }
    
    updateStatus(message) {
        document.getElementById('status').textContent = message;
    }
}

// Initialize the application
class MazeSolverApp {
    constructor() {
        this.canvas = document.getElementById('mazeCanvas');
        this.grid = new MazeGrid(25, 25);
        this.visualizer = new Visualizer(this.grid, this.canvas);
        this.uiController = new UIController(this.visualizer, this.grid);
        
        this.initialize();
    }
    
    initialize() {
        this.visualizer.render();
        this.uiController.setDrawingMode('wall');
        
        this.uiController.updateStatus('Ready! Draw walls, set start/end points, then click "Find Path" or press Enter. Step Mode available for detailed visualization.');
        
        setTimeout(() => {
            this.visualizer.handleResize();
        }, 100);
    }
}

// Start the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MazeSolverApp();
});