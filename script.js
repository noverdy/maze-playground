var gridWidth = 32;
var animationSpeed = 15;
var forDelayInterrupt = false;

var windowWidth, windowHeight, mouseDown;
var gridCountX, gridCountY;
var gridArray, gridHTMLArray, sourceIndex, destIndex, showPath;


function deepcopy(array) {
    let newArr = [];
    for (let i = 0; i < array.length; i++) {
        let newRow = [];
        for (let j = 0; j < array[i].length; j++) {
            newRow.push(array[i][j]);
        }
        newArr.push(newRow);
    }
    return newArr;
}


function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}


function compare(arr1, arr2) {
    return JSON.stringify(arr1) === JSON.stringify(arr2);
}


function randint(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


function forWithDelay(i, length, fn, delay) {
    if (delay == 0) {
        for (let j = i; j < length; j++) {
            fn(j, length);
        }
    }
    else {
        setTimeout(function () {
            if (forDelayInterrupt) {
                forDelayInterrupt = false;
                return;
            }
            fn(i, length);
            i++;
            if (i < length) {
                forWithDelay(i, length, fn, delay); 
            }
        }, delay);
    }
}


function clear() {
    for (let i = 0; i < gridCountY; i++) {
        for (let j = 0; j < gridCountX; j++) {
            gridArray[i][j] = false;
            gridHTMLArray[i][j].classList.remove(...gridHTMLArray[i][j].classList);
            sourceIndex = null;
            destIndex = null;
            showPath = false;
            gridHTMLArray[i][j].classList.add('grid');
        }
    }
}


function clearPath() {
    gridHTMLArray.forEach(r => r.forEach(c => {
        c.classList.remove('grid-path');
        c.classList.remove('grid-path-ud');
        c.classList.remove('grid-path-lr');
        c.classList.remove('grid-path-ur');
        c.classList.remove('grid-path-ul');
        c.classList.remove('grid-path-dr');
        c.classList.remove('grid-path-dl');
        c.classList.remove('grid-path-head');
        c.classList.remove('grid-path-endpoint');
    }));
    showPath = false;
}    


function reset() {
    gridArray = [];
    gridHTMLArray = [];
    sourceIndex = null;
    destIndex = null;
    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;
    showPath = false;
    document.getElementById('gridWrapper').innerHTML = '';
}


function findPath() {
    if (sourceIndex === null || destIndex === null) {
        alert('Asal atau Tujuan belum dipilih!');
    }
    else if (gridArray[sourceIndex[0]][sourceIndex[1]]) {
        return '';
    }
    else {
        let board = deepcopy(gridArray);
        let queue = [];
        queue.push([[sourceIndex[0], sourceIndex[1]], '']);
        while (queue.length > 0) {
            let data = queue.shift();
            let i = data[0];
            if (compare(data[0], destIndex)) {
                return data[1];
            }
            else {
                const up = () => {
                    if (i[0] !== 0 && board[i[0] - 1][i[1]] === false) {
                        board[i[0] - 1][i[1]] = true;
                        queue.push([[i[0] - 1, i[1]], data[1] + 'U']);
                    }
                }
                const down = () => {
                    if (i[0] !== gridCountY - 1 && board[i[0] + 1][i[1]] === false) {
                        board[i[0] + 1][i[1]] = true;
                        queue.push([[i[0] + 1, i[1]], data[1] + 'D']);
                    }
                };
                const left = () => {
                    if (i[1] !== 0 && board[i[0]][i[1] - 1] === false) {
                        board[i[0]][i[1] - 1] = true;
                        queue.push([[i[0], i[1] - 1], data[1] + 'L']);
                    }
                };
                const right = () => {
                    if (i[1] !== gridCountX - 1 && board[i[0]][i[1] + 1] === false) {
                        board[i[0]][i[1] + 1] = true;
                        queue.push([[i[0], i[1] + 1], data[1] + 'R']);
                    }
                };
                let choices = [up, down, left, right];
                shuffle(choices);
                choices.forEach(choice => choice());
            }
        }
        return '';
    }
}


function renderPath() {
    function toggleButton() {
        let n = document.getElementById('generateButton').disabled;
        document.getElementById('generateButton').disabled = !n;
        document.getElementById('resetButton').disabled = !n;
        document.getElementById('gridWrapper').disabled = !n;
        let s = document.getElementById('searchButton').textContent;
        if (s === 'CARI JALAN') document.getElementById('searchButton').textContent = 'BATAL';
        else document.getElementById('searchButton').textContent = 'CARI JALAN';
    }

    if (document.getElementById('searchButton').textContent === 'BATAL') {
        forDelayInterrupt = true;
        toggleButton();
        clearPath();
        return;
    }

    if (showPath) {
        clearPath();
    }

    let path = findPath();
    if (path === '') {
        alert('Jalan tidak ditemukan!');
    }
    else if (typeof(path) !== 'undefined') {
        toggleButton();

        let i = [sourceIndex[0], sourceIndex[1]];
        gridHTMLArray[i[0]][i[1]].classList.add('grid-path-endpoint');
        forWithDelay(0, path.length, function(j, l) {
            gridHTMLArray[i[0]][i[1]].classList.remove('grid-path-head');
            switch (path[j]) {
                case 'U': i[0]--; break;
                case 'D': i[0]++; break;
                case 'L': i[1]--; break;
                case 'R': i[1]++; break;
            }

            if (j === l - 1) {
                toggleButton();
            }
            else {
                gridHTMLArray[i[0]][i[1]].classList.add('grid-path-head');
            }

            if (compare(i, destIndex)) {
                gridHTMLArray[i[0]][i[1]].classList.add('grid-path-endpoint');
            }
            else {
                const cmp = (c1, c2) => {
                    return (path[j] === c1 && path[j + 1] === c2);
                }

                gridHTMLArray[i[0]][i[1]].classList.add('grid-path');
                if (cmp('U', 'U') || cmp('D', 'D')) {
                    gridHTMLArray[i[0]][i[1]].classList.add('grid-path-ud');
                }
                else if (cmp('L', 'L') || cmp('R', 'R')) {
                    gridHTMLArray[i[0]][i[1]].classList.add('grid-path-lr');
                }
                else if (cmp('R', 'U') || cmp('D', 'L')) {
                    gridHTMLArray[i[0]][i[1]].classList.add('grid-path-ul');
                }
                else if (cmp('L', 'U') || cmp('D', 'R')) {
                    gridHTMLArray[i[0]][i[1]].classList.add('grid-path-ur');
                }
                else if (cmp('R', 'D') || cmp('U', 'L')) {
                    gridHTMLArray[i[0]][i[1]].classList.add('grid-path-dl');
                }
                else if (cmp('L', 'D') || cmp('U', 'R')) {
                    gridHTMLArray[i[0]][i[1]].classList.add('grid-path-dr');
                }
            }
        }, animationSpeed);
        showPath = true;
    }
}


function generateMaze() {
    function traverse(maze, i, j) {
        const up = () => {
            if (i > 1 && maze[i - 2][j] == 1) {
                maze[i - 1][j] = 0;
                traverse(maze, i - 2, j);
            }
        };
        const left = () => {
            if (j > 1 && maze[i][j - 2] == 1) {
                maze[i][j - 1] = 0;
                traverse(maze, i, j - 2);
            }
        };
        const down = () => {
            if (i < gridCountY - 2 && maze[i + 2][j] == 1) {
                maze[i + 1][j] = 0;
                traverse(maze, i + 2, j);
            }
        };
        const right = () => {
            if (j < gridCountX - 2 && maze[i][j + 2] == 1) {
                maze[i][j + 1] = 0;
                traverse(maze, i, j + 2);
            }
        };
        
        maze[i][j] = 0;
        let choices = [up, left, down, right];
        shuffle(choices);
        choices.forEach(i => i());
    }
    clear();
    let maze = [];
    for (let i = 0; i < gridCountY; i++) {
        let mazeRow = [];
        for (let j = 0; j < gridCountX; j++) {
            mazeRow.push(1);
        }
        maze.push(mazeRow);
    }
    traverse(maze, randint(0, gridCountY/2 - 1)*2 + 1, randint(0, gridCountX/2 - 1)*2 + 1);
    for (let i = 0; i < gridCountY; i++) {
        for (let j = 0; j < gridCountX; j++) {
            if (maze[i][j] === 1) {
                gridArray[i][j] = true;
                gridHTMLArray[i][j].classList.add('grid-selected');
            }
        }
    }
}


function initDragListener() {
    mouseDown = false;
    document.body.onmousedown = function() { 
        mouseDown = true;
    }
    document.body.onmouseup = function() {
        mouseDown = false;
    }
}


function initGridCanvas() {
    reset();

    gridCountX = Math.floor(windowWidth/gridWidth);
    gridCountY = Math.floor((windowHeight - 40)/gridWidth);

    if (windowWidth < 576) gridCountY -= 2;
    if (gridCountX % 2 == 0) gridCountX--;
    if (gridCountY % 2 == 0) gridCountY--;

    let s = '';
    for (let i = 0; i < gridCountY; i++) {
        s += '<div class="grid-row-wrapper">'
        for (let j = 0; j < gridCountX; j++) {
            s += '<div class="grid" id="' + i.toString() + '-' + j.toString() + '"></div>'
        }
        s += '</div>'
    }
    document.getElementById('gridWrapper').innerHTML = s;
    for (let i = 0; i < gridCountY; i++) {
        gridArray.push(Array(gridCountX).fill(false));
    }

    let grids = document.querySelectorAll('.grid');
    for (let i = 0; i < gridCountY; i++) {
        let arr = [];
        for (let j = 0; j < gridCountX; j++) {
            let idx = (i * gridCountX) + j;
            arr.push(grids[idx]);
        }
        gridHTMLArray.push(arr);
    }
}


function initGridListener() {
    let listener = function(grid, selectedRadio) {
        let index = grid.id.split('-');
        index[0] = parseInt(index[0]);
        index[1] = parseInt(index[1]);
        switch (selectedRadio) {
            case 'drawWall':
                gridArray[index[0]][index[1]] = true;
                grid.classList.add('grid-selected');
                break;
            case 'removeWall':
                gridArray[index[0]][index[1]] = false;
                grid.classList.remove('grid-selected');
                break;
            case 'addSource':
                if (sourceIndex !== null) {
                    gridHTMLArray[sourceIndex[0]][sourceIndex[1]].classList.remove('grid-source');
                }
                sourceIndex = index;
                grid.classList.add('grid-source');
                break;
            case 'addDestination':
                if (destIndex !== null) {
                    gridHTMLArray[destIndex[0]][destIndex[1]].classList.remove('grid-destination');
                }
                destIndex = index;
                grid.classList.add('grid-destination');
                break;
        }
        if (showPath) {
            clearPath();
        }
    }

    let grids = document.querySelectorAll('.grid');
    grids.forEach(grid => {
        grid.onmouseover = function() {
            let selectedRadio = document.querySelector('input[name="mode"]:checked').value;
            if (mouseDown && document.getElementById('gridWrapper').disabled !== true) {
                listener(grid, selectedRadio);
            }
        }
        grid.onmousedown = function() {
            let selectedRadio = document.querySelector('input[name="mode"]:checked').value;
            if (document.getElementById('gridWrapper').disabled !== true) {
                listener(grid, selectedRadio);
            }
        }
    });
}


function initLocalStorage() {
    let gridVal = localStorage.getItem('grid-width');
    let animVal = localStorage.getItem('animation-speed');

    if (gridVal !== null && animVal !== null) {
        document.getElementById('gridSlider').value = gridVal;
        document.getElementById('speedSlider').value = animVal;
        document.documentElement.style.setProperty('--grid-width', gridVal + 'px');
        gridWidth = gridVal;
        animationSpeed = animVal;
    }
}


function initKeyCombination() {
    document.addEventListener('keydown', function(event) {
        if (event.key === 'z') {
            document.getElementById('drawWall').checked = true;
        }
        if (event.key === 'x') {
            document.getElementById('removeWall').checked = true;
        }
        if (event.key === 'c') {
            document.getElementById('addSource').checked = true;
        }
        if (event.key === 'v') {
            document.getElementById('addDestination').checked = true;
        }
        if (event.key === ' ') {
            renderPath();
        }
      });
}


function onStart() {
    initDragListener();
    initLocalStorage();
    initGridCanvas();
    initGridListener();
    initKeyCombination();

    document.addEventListener('contextmenu', event => event.preventDefault());
    document.getElementById('generateButton').onclick = generateMaze;
    document.getElementById('resetButton').onclick = onStart;
    document.getElementById('searchButton').onclick = renderPath;

    document.getElementById('settingsButton').onclick = function () {
        document.getElementById('popup').classList.toggle('show');
    }

    document.getElementById('saveButton').onclick = function () {
        document.getElementById('popup').classList.toggle('show');

        let gridVal = document.getElementById('gridSlider').value;
        let animVal = document.getElementById('speedSlider').value;

        localStorage.setItem('grid-width', gridVal);
        localStorage.setItem('animation-speed', animVal);
        
        if (gridWidth != gridVal) {
            gridWidth = gridVal;
            onStart();
        }
        animationSpeed = animVal;
    }
    document.getElementById('resetConfigButton').onclick = function () {
        document.getElementById('gridSlider').value = "32";
        document.getElementById('speedSlider').value = "15";
    }
    document.getElementById('closeButton').onclick = function () {
        document.getElementById('popup').classList.toggle('show');
        document.getElementById('gridSlider').value = gridWidth.toString();
        document.getElementById('speedSlider').value = animationSpeed.toString();
    }
}


onStart()