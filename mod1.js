// dop_machines_simple.js - Упрощённая версия
// Категория: dop machines
// Элементы: Pixel Speaker и Laser Emitter

// ============================================
// 1. PIXEL SPEAKER - динамик с нотами
// ============================================
elements.pixel_speaker = {
    name: "Pixel Speaker",
    color: "#8B4513", // Коричневый
    category: "dop machines",
    state: "solid",
    behavior: behaviors.WALL,
    density: 1000,
    conduct: 1,
    tempHigh: 1000,
    stateHigh: "ash",
    
    // Ноты
    noteNames: ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"],
    baseFreq: 261.63, // До (C4)
    
    tick: function(pixel) {
        // Считаем активные контакты вокруг (4 стороны)
        let activePins = 0;
        let neighbors = [[1,0], [-1,0], [0,1], [0,-1]];
        
        for (let i = 0; i < neighbors.length; i++) {
            let nx = pixel.x + neighbors[i][0];
            let ny = pixel.y + neighbors[i][1];
            
            if (currentPixels[nx] && currentPixels[nx][ny]) {
                let neighbor = currentPixels[nx][ny];
                // Если сосед проводит ток и заряжен
                if (elements[neighbor.element] && elements[neighbor.element].conduct && neighbor.charge) {
                    activePins++;
                }
            }
        }
        
        // Если есть активные контакты - играем ноту
        if (activePins > 0) {
            let noteIndex = Math.min(activePins - 1, 11); // Максимум 12 нот
            let frequency = this.baseFreq * Math.pow(2, noteIndex / 12);
            this.playTone(frequency, 100); // 100ms
            
            // Визуальный эффект - светится
            pixel.color = "rgb(255, 200, 100)";
            setTimeout(() => {
                if (pixel && pixel.element === "pixel_speaker") {
                    pixel.color = "#8B4513";
                }
            }, 100);
        }
    },
    
    playTone: function(frequency, duration) {
        try {
            if (!window.audioContext) {
                window.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            
            let ctx = window.audioContext;
            let oscillator = ctx.createOscillator();
            let gainNode = ctx.createGain();
            
            oscillator.type = 'sine'; // Чистый тон
            oscillator.frequency.value = frequency;
            
            // Убираем щелчки
            gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.1, ctx.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration/1000);
            
            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);
            
            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + duration/1000);
            
            oscillator.onended = function() {
                oscillator.disconnect();
                gainNode.disconnect();
            };
        } catch(e) {
            // Тишина, если звук не поддерживается
            console.log("Sound not supported:", e);
        }
    },
    
    // При получении заряда
    charge: function(pixel) {
        pixel.color = "rgb(255, 150, 50)";
        setTimeout(() => {
            if (pixel && pixel.element === "pixel_speaker") {
                pixel.color = "#8B4513";
            }
        }, 200);
    }
};

// ============================================
// 2. LASER EMITTER - испускает лазер при питании
// ============================================
elements.laser_emitter = {
    name: "Laser Emitter",
    color: "#FF0000", // Красный
    category: "dop machines",
    state: "solid",
    behavior: behaviors.WALL,
    density: 2000,
    conduct: 1, // Проводит электричество
    tempHigh: 2000,
    stateHigh: "molten_iron",
    
    // Направление лазера (по умолчанию вправо)
    direction: "right", // "right", "left", "up", "down"
    
    tick: function(pixel) {
        // Проверяем, есть ли питание
        let hasPower = false;
        
        // Проверяем соседей на наличие заряда
        let neighbors = [[1,0], [-1,0], [0,1], [0,-1]];
        
        for (let i = 0; i < neighbors.length; i++) {
            let nx = pixel.x + neighbors[i][0];
            let ny = pixel.y + neighbors[i][1];
            
            if (currentPixels[nx] && currentPixels[nx][ny]) {
                let neighbor = currentPixels[nx][ny];
                // Если сосед проводит ток и заряжен
                if (elements[neighbor.element] && elements[neighbor.element].conduct && neighbor.charge) {
                    hasPower = true;
                    break;
                }
            }
        }
        
        // Если есть питание - испускаем лазер
        if (hasPower) {
            this.emitLaser(pixel);
            
            // Визуальный эффект - светится ярче
            pixel.color = "rgb(255, 100, 100)";
            setTimeout(() => {
                if (pixel && pixel.element === "laser_emitter") {
                    pixel.color = "#FF0000";
                }
            }, 50);
        }
    },
    
    emitLaser: function(pixel) {
        // Определяем целевую позицию в зависимости от направления
        let targetX = pixel.x;
        let targetY = pixel.y;
        
        // Направление можно менять в зависимости от соседей
        // По умолчанию вправо, но можно определить по специальным входам
        this.determineDirection(pixel);
        
        switch(this.direction) {
            case "right":
                targetX = pixel.x + 1;
                targetY = pixel.y;
                break;
            case "left":
                targetX = pixel.x - 1;
                targetY = pixel.y;
                break;
            case "up":
                targetX = pixel.x;
                targetY = pixel.y - 1;
                break;
            case "down":
                targetX = pixel.x;
                targetY = pixel.y + 1;
                break;
        }
        
        // Проверяем, свободно ли место
        if (!currentPixels[targetX] || !currentPixels[targetX][targetY]) {
            // Создаём лазер
            currentPixels[targetX][targetY] = {
                element: "laser",
                x: targetX,
                y: targetY,
                color: "#FF3333"
            };
        }
    },
    
    determineDirection: function(pixel) {
        // Можно менять направление в зависимости от дополнительных входов
        // Например, если есть заряд сверху - стреляем вверх и т.д.
        
        // Проверяем верхний вход
        if (currentPixels[pixel.x] && currentPixels[pixel.x][pixel.y - 1]) {
            let upNeighbor = currentPixels[pixel.x][pixel.y - 1];
            if (elements[upNeighbor.element] && elements[upNeighbor.element].conduct && upNeighbor.charge) {
                this.direction = "up";
                return;
            }
        }
        
        // Проверяем нижний вход
        if (currentPixels[pixel.x] && currentPixels[pixel.x][pixel.y + 1]) {
            let downNeighbor = currentPixels[pixel.x][pixel.y + 1];
            if (elements[downNeighbor.element] && elements[downNeighbor.element].conduct && downNeighbor.charge) {
                this.direction = "down";
                return;
            }
        }
        
        // Проверяем левый вход
        if (currentPixels[pixel.x - 1] && currentPixels[pixel.x - 1][pixel.y]) {
            let leftNeighbor = currentPixels[pixel.x - 1][pixel.y];
            if (elements[leftNeighbor.element] && elements[leftNeighbor.element].conduct && leftNeighbor.charge) {
                this.direction = "left";
                return;
            }
        }
        
        // Проверяем правый вход
        if (currentPixels[pixel.x + 1] && currentPixels[pixel.x + 1][pixel.y]) {
            let rightNeighbor = currentPixels[pixel.x + 1][pixel.y];
            if (elements[rightNeighbor.element] && elements[rightNeighbor.element].conduct && rightNeighbor.charge) {
                this.direction = "right";
                return;
            }
        }
        
        // Если ничего не нашли, оставляем текущее направление
    },
    
    // При получении заряда
    charge: function(pixel) {
        // Просто меняем цвет, сам лазер создаётся в tick
        pixel.color = "rgb(255, 50, 50)";
        setTimeout(() => {
            if (pixel && pixel.element === "laser_emitter") {
                pixel.color = "#FF0000";
            }
        }, 100);
    }
};

// Добавляем рецепты (опционально)
elements.pixel_speaker.reactions = {
    "wire": { "elem1": null, "elem2": null }
};

elements.laser_emitter.reactions = {
    "wire": { "elem1": null, "elem2": null }
};