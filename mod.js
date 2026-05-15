// cremantium.js

elements.cremantium = {
    name: "Cremantium",
    color: ["#3b82f6", "#2563eb", "#1d4ed8", "#1e3a8a"],
    category: "specials",
    state: "powder",
    density: 2100,
    conduct: 1,
    temp: 20,
    tempHigh: 200,
    
    _decayStarted: false,
    
    tick: function(pixel) {
        if (pixel.charge === true && !pixel._decayStarted) {
            pixel._decayStarted = true;
        }
        
        if (pixel._decayStarted) {
            if (pixel.temp < 200) {
                pixel.temp += 5;
            }
            
            if (pixel.temp >= 140) {
                let directions = [[0,-1],[0,1],[-1,0],[1,0]];
                
                for (let i = 0; i < 2; i++) {
                    let dx = (Math.random() - 0.5) * 2;
                    let dy = (Math.random() - 0.5) * 2;
                    let nx = Math.floor(pixel.x + dx);
                    let ny = Math.floor(pixel.y + dy);
                    
                    if (!currentPixels[nx] || !currentPixels[nx][ny]) {
                        let particle = Math.random() < 0.5 ? "proton" : "neutron";
                        currentPixels[nx][ny] = {
                            element: particle,
                            x: nx,
                            y: ny,
                            color: particle === "proton" ? "#ff6b6b" : "#a0a0a0"
                        };
                    }
                }
                
                if (!pixel._markedForDeath) {
                    pixel._markedForDeath = true;
                    pixel.element = "plasma";
                    pixel.color = "#ff4500";
                    pixel.temp = 800;
                }
            }
            
            let intensity = Math.min(255, 100 + Math.floor((pixel.temp - 20) * 1.5));
            pixel.color = `rgb(59, 130, ${Math.max(100, 246 - Math.floor(pixel.temp / 2))})`;
        }
    }
};
