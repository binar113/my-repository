// proton_emitter.js - Розовый блок, испускающий протоны
// Категория: specials

elements.proton_emitter = {
    name: "Proton Emitter",
    color: "#FF69B4", // Ярко-розовый (Hot Pink)
    category: "specials", // ← ИЗМЕНЕНО на "specials"
    state: "solid",
    behavior: behaviors.WALL,
    density: 3000,
    conduct: 1, // Проводит электричество
    
    // Настройки эмиссии
    emitRate: 2, // Сколько протонов за тик
    emitDirection: "all", // up/down/left/right/all
    
    tick: function(pixel) {
        // Проверяем, есть ли питание (как у твоего лазера)
        let hasPower = false;
        let neighbors = [[1,0], [-1,0], [0,1], [0,-1]];
        
        for (let i = 0; i < neighbors.length; i++) {
            let nx = pixel.x + neighbors[i][0];
            let ny = pixel.y + neighbors[i][1];
            
            if (currentPixels[nx] && currentPixels[nx][ny]) {
                let neighbor = currentPixels[nx][ny];
                if (elements[neighbor.element] && elements[neighbor.element].conduct && neighbor.charge) {
                    hasPower = true;
                    break;
                }
            }
        }
        
        // Если есть питание - испускаем протоны
        if (hasPower) {
            this.emitProtons(pixel);
            
            // Визуальный эффект - пульсация
            pixel.color = "rgb(255, 105, 180)";
            setTimeout(() => {
                if (pixel && pixel.element === "proton_emitter") {
                    pixel.color = "#FF69B4";
                }
            }, 100);
        }
    },
    
    emitProtons: function(pixel) {
        // Определяем направления для эмиссии
        let directions = [];
        
        switch(this.emitDirection) {
            case "up":
                directions = [[0, -1]];
                break;
            case "down":
                directions = [[0, 1]];
                break;
            case "left":
                directions = [[-1, 0]];
                break;
            case "right":
                directions = [[1, 0]];
                break;
            case "all":
            default:
                directions = [[0, -1], [0, 1], [-1, 0], [1, 0]];
                break;
        }
        
        // Создаём протоны в каждом направлении
        for (let d = 0; d < directions.length; d++) {
            let [dx, dy] = directions[d];
            
            for (let i = 0; i < this.emitRate; i++) {
                let targetX = pixel.x + dx * (i + 1);
                let targetY = pixel.y + dy * (i + 1);
                
                // Проверяем, свободно ли место
                if (!currentPixels[targetX] || !currentPixels[targetX][targetY]) {
                    currentPixels[targetX][targetY] = {
                        element: "proton",
                        x: targetX,
                        y: targetY,
                        color: "#FFB6C1" // Светло-розовый для протонов
                    };
                }
            }
        }
    },
    
    // При получении заряда
    charge: function(pixel) {
        pixel.color = "#FF1493"; // Глубокий розовый при заряде
        setTimeout(() => {
            if (pixel && pixel.element === "proton_emitter") {
                pixel.color = "#FF69B4";
            }
        }, 200);
    }
};

// Добавляем рецепт (опционально)
elements.proton_emitter.reactions = {
    "wire": { "elem1": null, "elem2": null },
    "copper": { "elem1": null, "elem2": null }
};