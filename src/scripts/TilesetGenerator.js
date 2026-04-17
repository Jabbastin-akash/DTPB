// ===== TilesetGenerator.js =====
// Generates tileset PNG and Tiled-format JSON map data programmatically

const TILE_SIZE = 32;
window.MAP_COLS = 60;
window.MAP_ROWS = 40;

// Tile IDs (match Tiled convention: 0 = empty, 1+ = tileset index)
window.TID = {
    EMPTY: 0,
    GRASS: 1,
    PATH: 2,
    STONE_WALL: 3,
    FENCE: 4,
    HEDGE: 5,
    TREE: 6,
    TREE_TRUNK: 7,
    FLOWER_GROUND: 8,
    GATE: 9,
    FLOWER_OBJ: 10,
    LUSH: 11,
    BENCH: 12,
    LAMP_ON: 13,
    LAMP_OFF: 14,
    FOUNTAIN_TL: 15, FOUNTAIN_TR: 16, FOUNTAIN_BL: 17, FOUNTAIN_BR: 18,
    MURAL: 19,
    SOIL: 20,
    GRASS2: 21,
    PATH2: 22,
    // House tiles: kept for backwards compatibility in spritesheet geometry
    HOUSE1_ROOF: 23, HOUSE1_FACADE: 24,
    HOUSE2_ROOF: 25, HOUSE2_FACADE: 26,
    HOUSE3_ROOF: 27, HOUSE3_FACADE: 28,
    HOUSE4_ROOF: 29, HOUSE4_FACADE: 30,
    HOUSE5_ROOF: 31, HOUSE5_FACADE: 32,
    SHOP_ROOF: 33, SHOP_FACADE: 34,
    // Decorations
    MAILBOX: 35,
    NOTICEBOARD: 36,
    EASEL: 37,
    WATER: 38,
    CHECKMARK: 39,
    LIGHTBULB_SIGN: 40,
    SHOP_SIGN: 41,
    PATH_EDGE_T: 42, PATH_EDGE_B: 43, PATH_EDGE_L: 44, PATH_EDGE_R: 45,
    COBBLESTONE: 46,
};

// Color palette
const PAL = {
    grass1: '#6db840', grass2: '#5da130', grass3: '#4e8a28', grassDark: '#3d7020',
    path1: '#c4a882', path2: '#b89b74', path3: '#d4b890', pathEdge: '#a08060',
    pathKerb: '#B8956A',
    stone1: '#8a8a8a', stone2: '#9e9e9e', stone3: '#707070', stoneWall: '#606060',
    wood1: '#8b5e3c', wood2: '#a0704d', wood3: '#7a4f30', woodDark: '#5a3a20',
    water1: '#3498db', water2: '#2980b9', water3: '#5dade2', waterFoam: '#aed6f1',
    fountainBase: '#C8B89A', fountainRim: '#A09070', fountainSpout: '#8B7355',
    fountainWater1: '#5BAED6', fountainWater2: '#4A9BC4',
    white: '#ffffff', black: '#000000',
    fence: '#c9a96e', fenceDark: '#a08050',
    lampPost: '#4a4a5a', lampGlow: '#ffeaa7',
    soil: '#8b6b4a', soilDark: '#6b4f36',
    lush1: '#3da832', lush2: '#4cc440',
    wallColor: '#e8d5b8',
    window: '#87ceeb', windowFrame: '#5a3a20', windowShine: '#b3e0f2',
    noticeBoardPost: '#8B6347', noticeBoardPaper: '#F5F0E8',
    easelFrame: '#8B6347', easelCanvas: '#F5F0E8',
    lightbulbOn: '#FFD700', lightbulbRays: '#FFF176',
    cobblestoneBase: '#9E9081', cobblestoneJoints: '#7A6E65',
};

// Seeded RNG
function mulberry32(a) {
    return function () {
        a |= 0; a = a + 0x6D2B79F5 | 0;
        let t = Math.imul(a ^ a >>> 15, 1 | a);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

// Draw helpers
function fillRect(ctx, x, y, w, h, color) { ctx.fillStyle = color; ctx.fillRect(x, y, w, h); }
function drawPixel(ctx, x, y, color, size = 1) { ctx.fillStyle = color; ctx.fillRect(x, y, size, size); }

// ===== TILE DRAWING FUNCTIONS =====

function drawGrassFromTexture(ctx, ox, oy, grassTextures, seed) {
    if (!grassTextures || grassTextures.length === 0) {
        // Fallback to old procedural drawing if no textures are provided
        drawGrass(ctx, ox, oy, seed % 2);
        return;
    }
    const rng = mulberry32(seed);
    const texture = grassTextures[Math.floor(rng() * grassTextures.length)];
    if (texture) {
        ctx.drawImage(texture, 0, 0, texture.width, texture.height, ox, oy, TILE_SIZE, TILE_SIZE);
    } else {
        // Fallback if a texture is missing for some reason
        drawGrass(ctx, ox, oy, seed % 2);
    }
}


function drawGrass(ctx, ox, oy, variant) {
    fillRect(ctx, ox, oy, 32, 32, variant === 0 ? PAL.grass1 : PAL.grass2);
    const rng = mulberry32(variant * 137 + 42);
    for (let i = 0; i < 25; i++) {
        const x = Math.floor(rng() * 32), y = Math.floor(rng() * 32);
        drawPixel(ctx, ox + x, oy + y, rng() > 0.5 ? PAL.grass3 : PAL.grassDark, 2);
    }
}

function drawPath(ctx, ox, oy, variant) {
    fillRect(ctx, ox, oy, 32, 32, PAL.path1);
    const rng = mulberry32(variant * 73 + 19);
    for (let i = 0; i < 12; i++) {
        const x = Math.floor(rng() * 28), y = Math.floor(rng() * 28);
        fillRect(ctx, ox + x, oy + y, Math.floor(rng() * 4) + 2, Math.floor(rng() * 3) + 2, rng() > 0.5 ? PAL.path2 : PAL.path3);
    }
}

function drawPathEdge(ctx, ox, oy, edge, pathTexture = null) {
    drawPath(ctx, ox, oy, 99);
    if (pathTexture) {
        ctx.drawImage(pathTexture, 0, 0, pathTexture.width, pathTexture.height, ox, oy, TILE_SIZE, TILE_SIZE);
    }
    ctx.fillStyle = PAL.pathKerb;
    if (edge === 't') fillRect(ctx, ox, oy, 32, 3, PAL.pathKerb);
    else if (edge === 'b') fillRect(ctx, ox, oy + 29, 32, 3, PAL.pathKerb);
    else if (edge === 'l') fillRect(ctx, ox, oy, 3, 32, PAL.pathKerb);
    else if (edge === 'r') fillRect(ctx, ox + 29, oy, 3, 32, PAL.pathKerb);
}

function drawStoneWall(ctx, ox, oy) {
    fillRect(ctx, ox, oy, 32, 32, PAL.stone1);
    for (let r = 0; r < 4; r++) {
        const offset = r % 2 === 0 ? 0 : 8;
        for (let c = 0; c < 3; c++) {
            fillRect(ctx, ox + c * 12 + offset, oy + r * 8, 10, 6, PAL.stone2);
            fillRect(ctx, ox + c * 12 + offset, oy + r * 8, 10, 1, PAL.stone3);
        }
    }
    fillRect(ctx, ox, oy, 32, 2, PAL.stoneWall);
    fillRect(ctx, ox, oy + 30, 32, 2, PAL.stone3);
}

function drawFence(ctx, ox, oy, grassTextures) {
    drawGrassFromTexture(ctx, ox, oy, grassTextures, 11);
    fillRect(ctx, ox + 4, oy + 8, 4, 20, PAL.fence);
    fillRect(ctx, ox + 24, oy + 8, 4, 20, PAL.fence);
    fillRect(ctx, ox + 4, oy + 14, 24, 3, PAL.fence);
    fillRect(ctx, ox + 4, oy + 22, 24, 3, PAL.fence);
    fillRect(ctx, ox + 4, oy + 14, 24, 1, PAL.fenceDark);
    fillRect(ctx, ox + 4, oy + 22, 24, 1, PAL.fenceDark);
    fillRect(ctx, ox + 5, oy + 6, 2, 2, PAL.fenceDark);
    fillRect(ctx, ox + 25, oy + 6, 2, 2, PAL.fenceDark);
}

function drawHedge(ctx, ox, oy, grassTextures) {
    drawGrassFromTexture(ctx, ox, oy, grassTextures, 13);
    fillRect(ctx, ox, oy, 32, 32, PAL.grass3);
    fillRect(ctx, ox + 2, oy + 4, 28, 24, '#2d8a3e');
    fillRect(ctx, ox + 4, oy + 2, 24, 28, '#2d8a3e');
    const rng = mulberry32(777);
    for (let i = 0; i < 15; i++) {
        drawPixel(ctx, ox + 4 + Math.floor(rng() * 24), oy + 4 + Math.floor(rng() * 24), rng() > 0.5 ? '#3da832' : '#1e7530', 3);
    }
}

function drawTree(ctx, ox, oy, grassTextures) {
    drawGrassFromTexture(ctx, ox, oy, grassTextures, 12);
    for (let y = 0; y < 32; y++) {
        for (let x = 0; x < 32; x++) {
            const dx = x - 16, dy = y - 14;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < 14) drawPixel(ctx, ox + x, oy + y, d < 8 ? '#3da832' : d < 11 ? '#2d8a3e' : '#1e7530');
        }
    }
    fillRect(ctx, ox + 10, oy + 8, 4, 3, '#5dd858');
    fillRect(ctx, ox + 14, oy + 26, 5, 6, PAL.wood1);
}

function drawFlowerGround(ctx, ox, oy, grassTextures) {
    drawGrassFromTexture(ctx, ox, oy, grassTextures, 14);
    const colors = ['#e74c3c', '#e91e8c', '#f1c40f', '#3498db', '#ecf0f1'];
    const rng = mulberry32(53);
    for (let i = 0; i < 5; i++) {
        const x = 3 + Math.floor(rng() * 26), y = 6 + Math.floor(rng() * 20);
        const c = colors[Math.floor(rng() * colors.length)];
        drawPixel(ctx, ox + x, oy + y + 2, '#27ae60', 1);
        drawPixel(ctx, ox + x, oy + y + 3, '#27ae60', 1);
        drawPixel(ctx, ox + x - 1, oy + y, c, 1);
        drawPixel(ctx, ox + x + 1, oy + y, c, 1);
        drawPixel(ctx, ox + x, oy + y - 1, c, 1);
        drawPixel(ctx, ox + x, oy + y + 1, c, 1);
        drawPixel(ctx, ox + x, oy + y, '#f1c40f', 1);
    }
}

function drawGate(ctx, ox, oy) {
    fillRect(ctx, ox, oy, 32, 32, PAL.path1);
    fillRect(ctx, ox, oy, 6, 32, PAL.stone1);
    fillRect(ctx, ox + 26, oy, 6, 32, PAL.stone1);
    fillRect(ctx, ox + 6, oy, 20, 4, PAL.stone2);
    fillRect(ctx, ox + 1, oy, 4, 3, PAL.stone3);
    fillRect(ctx, ox + 27, oy, 4, 3, PAL.stone3);
}

function drawBench(ctx, ox, oy, grassTextures) {
    drawGrassFromTexture(ctx, ox, oy, grassTextures, 13);
    fillRect(ctx, ox + 4, oy + 14, 24, 4, PAL.wood2);
    fillRect(ctx, ox + 4, oy + 8, 24, 2, PAL.wood2);
    fillRect(ctx, ox + 6, oy + 18, 3, 8, PAL.wood3);
    fillRect(ctx, ox + 23, oy + 18, 3, 8, PAL.wood3);
    fillRect(ctx, ox + 6, oy + 10, 2, 8, PAL.wood3);
    fillRect(ctx, ox + 24, oy + 10, 2, 8, PAL.wood3);
}

function drawLamp(ctx, ox, oy, lit, grassTextures) {
    drawGrassFromTexture(ctx, ox, oy, grassTextures, lit ? 15 : 16);
    fillRect(ctx, ox + 14, oy + 8, 4, 22, PAL.lampPost);
    fillRect(ctx, ox + 10, oy + 4, 12, 6, PAL.lampPost);
    fillRect(ctx, ox + 12, oy + 2, 8, 4, '#6a6a7a');
    if (lit) {
        ctx.globalAlpha = 0.3;
        fillRect(ctx, ox + 4, oy + 8, 24, 8, PAL.lampGlow);
        ctx.globalAlpha = 1;
        fillRect(ctx, ox + 13, oy + 4, 6, 3, PAL.lampGlow);
    } else {
        fillRect(ctx, ox + 13, oy + 4, 6, 3, '#4a4a5a');
    }
}

function drawFountainTile(ctx, ox, oy, quadrant, waterColor, showHighlight) {
    fillRect(ctx, ox, oy, 32, 32, PAL.fountainBase); 
    ctx.fillStyle = PAL.fountainRim; 
    if (quadrant === 'tl') { fillRect(ctx, ox, oy, 32, 4); fillRect(ctx, ox, oy, 4, 32); }
    else if (quadrant === 'tr') { fillRect(ctx, ox, oy, 32, 4); fillRect(ctx, ox + 28, oy, 4, 32); }
    else if (quadrant === 'bl') { fillRect(ctx, ox, oy + 28, 32, 4); fillRect(ctx, ox, oy, 4, 32); }
    else if (quadrant === 'br') { fillRect(ctx, ox, oy + 28, 32, 4); fillRect(ctx, ox + 28, oy, 4, 32); }
    ctx.fillStyle = waterColor; 
    fillRect(ctx, ox + 4, oy + 4, 24, 24);
    if (showHighlight) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        if (quadrant === 'tl') { ctx.beginPath(); ctx.arc(ox + 16, oy + 16, 8, 0, Math.PI * 2); ctx.fill(); }
        else if (quadrant === 'br') { ctx.beginPath(); ctx.arc(ox + 16, oy + 16, 12, 0, Math.PI * 2); ctx.fill(); }
    }
}

function drawMural(ctx, ox, oy) {
    fillRect(ctx, ox, oy, 32, 32, PAL.stone1);
    const cols = ['#e74c3c', '#f39c12', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6'];
    for (let i = 0; i < 6; i++) fillRect(ctx, ox + 2, oy + 3 + i * 4, 28, 3, cols[i]);
    fillRect(ctx, ox, oy, 32, 2, PAL.stone3);
    fillRect(ctx, ox, oy + 30, 32, 2, PAL.stone3);
    fillRect(ctx, ox, oy, 2, 32, PAL.stone3);
    fillRect(ctx, ox + 30, oy, 2, 32, PAL.stone3);
}

function drawSoil(ctx, ox, oy) {
    fillRect(ctx, ox, oy, 32, 32, PAL.soil);
    const rng = mulberry32(321);
    for (let i = 0; i < 10; i++) drawPixel(ctx, ox + Math.floor(rng() * 30), oy + Math.floor(rng() * 30), PAL.soilDark, 2);
    for (let y = 8; y < 32; y += 8) fillRect(ctx, ox, oy + y, 32, 1, PAL.soilDark);
}

function drawLush(ctx, ox, oy, grassTextures) {
    drawGrassFromTexture(ctx, ox, oy, grassTextures, 14);
    const rng = mulberry32(555);
    for (let i = 0; i < 15; i++) drawPixel(ctx, ox + Math.floor(rng() * 32), oy + Math.floor(rng() * 32), PAL.lush2, 2);
}

function drawHouseRoof(ctx, ox, oy, color, lightColor, details, grassTextures) {
    drawGrassFromTexture(ctx, ox, oy, grassTextures, 21);
    fillRect(ctx, ox, oy + 8, 32, 24, color);
    fillRect(ctx, ox + 2, oy + 4, 28, 8, color);
    fillRect(ctx, ox + 4, oy + 2, 24, 4, lightColor);
    fillRect(ctx, ox + 6, oy, 20, 3, color);
    fillRect(ctx, ox + 8, oy, 16, 1, lightColor);
    if (details === 'chimney') { fillRect(ctx, ox + 22, oy, 5, 8, PAL.stone1); fillRect(ctx, ox + 22, oy, 5, 2, PAL.stone3); }
    if (details === 'split') { fillRect(ctx, ox + 16, oy + 2, 16, 30, '#7f8c8d'); fillRect(ctx, ox + 16, oy, 10, 3, '#95a5a6'); }
    if (details === 'lightbulb') { fillRect(ctx, ox + 12, oy, 8, 6, '#f1c40f'); drawPixel(ctx, ox + 14, oy + 1, '#f39c12', 4); }
    if (details === 'star') { drawPixel(ctx, ox + 14, oy + 2, '#f1c40f', 4); }
}

function drawHouseFacade(ctx, ox, oy, doorDetail, grassTextures) {
    drawGrassFromTexture(ctx, ox, oy, grassTextures, 22);
    fillRect(ctx, ox + 2, oy, 28, 28, PAL.wallColor);
    fillRect(ctx, ox + 2, oy, 28, 2, PAL.wood3);
    fillRect(ctx, ox + 13, oy + 12, 7, 16, PAL.woodDark);
    drawPixel(ctx, ox + 18, oy + 20, '#f1c40f', 2);
    fillRect(ctx, ox + 4, oy + 6, 7, 7, PAL.windowFrame);
    fillRect(ctx, ox + 5, oy + 7, 5, 5, PAL.window);
    fillRect(ctx, ox + 22, oy + 6, 7, 7, PAL.windowFrame);
    fillRect(ctx, ox + 23, oy + 7, 5, 5, PAL.window);
    fillRect(ctx, ox, oy + 28, 32, 4, PAL.stone3);
    if (doorDetail === 'colorful') {
        fillRect(ctx, ox + 13, oy + 12, 7, 5, '#f39c12');
        fillRect(ctx, ox + 13, oy + 17, 7, 5, '#3498db');
        fillRect(ctx, ox + 13, oy + 22, 7, 6, '#2ecc71');
    }
    if (doorDetail === 'welcomemat') {
        fillRect(ctx, ox + 12, oy + 28, 9, 4, '#c0392b');
    }
}

function drawMailbox(ctx, ox, oy, grassTextures) {
    drawGrassFromTexture(ctx, ox, oy, grassTextures, 23);
    fillRect(ctx, ox + 14, oy + 14, 4, 16, PAL.wood3);
    fillRect(ctx, ox + 10, oy + 8, 12, 8, '#3498db');
    fillRect(ctx, ox + 22, oy + 8, 2, 5, '#e74c3c');
    fillRect(ctx, ox + 22, oy + 8, 6, 2, '#e74c3c');
}

function drawNoticeboard(ctx, ox, oy, grassTextures) {
    drawGrassFromTexture(ctx, ox, oy, grassTextures, 24);
    fillRect(ctx, ox + 14, oy + 10, 4, 20, PAL.noticeBoardPost);
    fillRect(ctx, ox + 7, oy + 4, 18, 12, PAL.noticeBoardPaper);
    ctx.fillStyle = '#aaaaaa';
    ctx.fillRect(ox + 9, oy + 7, 14, 1);
    ctx.fillRect(ox + 9, oy + 10, 14, 1);
    ctx.fillRect(ox + 9, oy + 13, 14, 1);
}

function drawEasel(ctx, ox, oy, grassTextures) {
    drawGrassFromTexture(ctx, ox, oy, grassTextures, 25);
    ctx.strokeStyle = PAL.easelFrame;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(ox + 8, oy + 28);
    ctx.lineTo(ox + 16, oy + 6);
    ctx.lineTo(ox + 24, oy + 28);
    ctx.stroke();
    fillRect(ctx, ox + 10, oy + 8, 12, 10, PAL.easelCanvas);
    drawPixel(ctx, ox + 18, oy + 12, '#e74c3c', 2);
}

function drawLightbulbSign(ctx, ox, oy, grassTextures) {
    drawGrassFromTexture(ctx, ox, oy, grassTextures, 26);
    fillRect(ctx, ox + 12, oy + 18, 8, 4, '#95a5a6');
    ctx.fillStyle = PAL.lightbulbOn;
    ctx.beginPath();
    ctx.arc(ox + 16, oy + 10, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = PAL.lightbulbRays;
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
        const angle = Math.PI / 4 + i * Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(ox + 16 + Math.cos(angle) * 9, oy + 10 + Math.sin(angle) * 9);
        ctx.lineTo(ox + 16 + Math.cos(angle) * 12, oy + 10 + Math.sin(angle) * 12);
        ctx.stroke();
    }
}

function drawCobblestone(ctx, ox, oy) {
    fillRect(ctx, ox, oy, 32, 32, PAL.cobblestoneBase);
    ctx.strokeStyle = PAL.cobblestoneJoints;
    ctx.lineWidth = 1;
    const rng = mulberry32(ox * 17 + oy * 31);
    for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        const x1 = rng() * 32;
        const y1 = rng() * 32;
        const x2 = x1 + (rng() - 0.5) * 15;
        const y2 = y1 + (rng() - 0.5) * 15;
        ctx.moveTo(ox + x1, oy + y1);
        ctx.lineTo(ox + x2, oy + y2);
        ctx.stroke();
    }
}

function drawShopSign(ctx, ox, oy, grassTextures) {
    drawGrassFromTexture(ctx, ox, oy, grassTextures, 27);
    fillRect(ctx, ox + 14, oy + 12, 4, 18, PAL.woodDark);
    fillRect(ctx, ox + 7, oy + 5, 18, 12, PAL.wood1);
    fillRect(ctx, ox + 8, oy + 6, 16, 10, PAL.white);
    ctx.fillStyle = PAL.black;
    ctx.font = '8px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Shop', ox + 16, oy + 14);
}

function drawCheckmark(ctx, ox, oy, grassTextures) {
    drawGrassFromTexture(ctx, ox, oy, grassTextures, 28);
    fillRect(ctx, ox + 4, oy + 2, 3, 28, PAL.wood3);
    fillRect(ctx, ox + 7, oy + 4, 18, 12, '#2ecc71');
    fillRect(ctx, ox + 7, oy + 14, 18, 2, '#27ae60');
    fillRect(ctx, ox + 11, oy + 10, 2, 2, PAL.white);
    fillRect(ctx, ox + 13, oy + 12, 2, 2, PAL.white);
    fillRect(ctx, ox + 15, oy + 10, 2, 2, PAL.white);
    fillRect(ctx, ox + 17, oy + 8, 2, 2, PAL.white);
}

function drawWater(ctx, ox, oy) {
    fillRect(ctx, ox, oy, 32, 32, PAL.water2);
    for (let y = 0; y < 32; y += 4) {
        for (let x = 0; x < 32; x += 4) {
            const offset = Math.sin(x * 0.3 + y * 0.2) * 2;
            fillRect(ctx, ox + x, oy + y + Math.floor(offset), 4, 2, offset > 0 ? PAL.water3 : PAL.water1);
        }
    }
}

// ===== GENERATE TILESET IMAGE =====
function generateTilesetImage(sourceTilesetImg, grassTextures, pathTexture) {
    const COLS = 8;
    const tileCount = Object.keys(TID).length - 1; 
    const ROWS = Math.ceil(tileCount / COLS);
    const canvas = document.createElement('canvas');
    canvas.width = COLS * TILE_SIZE;
    canvas.height = ROWS * TILE_SIZE;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    function tilePos(id) {
        const col = (id - 1) % COLS;
        const row = Math.floor((id - 1) / COLS);
        return { x: col * TILE_SIZE, y: row * TILE_SIZE };
    }

    const draw = (id, fn) => { if (!id) return; const p = tilePos(id); fn(ctx, p.x, p.y); };

    // Use new grass textures for grass tiles
    draw(TID.GRASS, (c, x, y) => drawGrassFromTexture(c, x, y, grassTextures, 1));
    draw(TID.GRASS2, (c, x, y) => drawGrassFromTexture(c, x, y, grassTextures, 2));

    // If a source tileset image is provided, use it for a few core tiles.
    // The expected layout is a 3x2 grid (e.g., 576x384 => 192px cells).
    const canUseSource = !!(sourceTilesetImg && sourceTilesetImg.width >= 96 && sourceTilesetImg.height >= 64);
    const cellW = canUseSource ? Math.floor(sourceTilesetImg.width / 3) : 0;
    const cellH = canUseSource ? Math.floor(sourceTilesetImg.height / 2) : 0;

    function drawFromSourceCell(id, col, row) {
        if (!canUseSource || cellW <= 0 || cellH <= 0) return false;
        const p = tilePos(id);
        ctx.drawImage(sourceTilesetImg, col * cellW, row * cellH, cellW, cellH, p.x, p.y, TILE_SIZE, TILE_SIZE);
        return true;
    }

    const drawPathFromImage = (c, x, y, img, variant) => {
        drawPath(c, x, y, variant);
        if (img) {
            c.drawImage(img, 0, 0, img.width, img.height, x, y, TILE_SIZE, TILE_SIZE);
        }
    };

    draw(TID.PATH, (c, x, y) => drawPathFromImage(c, x, y, pathTexture, 0));
    draw(TID.PATH2, (c, x, y) => drawPathFromImage(c, x, y, pathTexture, 1));

    if (!drawFromSourceCell(TID.STONE_WALL, 2, 0)) draw(TID.STONE_WALL, drawStoneWall);
    if (!drawFromSourceCell(TID.SOIL, 0, 1)) draw(TID.SOIL, drawSoil);

    draw(TID.FENCE, (c, x, y) => drawFence(c, x, y, grassTextures));
    draw(TID.HEDGE, (c, x, y) => drawHedge(c, x, y, grassTextures));
    draw(TID.TREE, (c, x, y) => drawTree(c, x, y, grassTextures));
    draw(TID.TREE_TRUNK, (c, x, y) => {
        drawGrassFromTexture(c, x, y, grassTextures, 99);
        fillRect(c, x + 13, y, 7, 28, PAL.wood1);
        fillRect(c, x + 10, y + 24, 12, 6, PAL.wood3);
    });
    draw(TID.FLOWER_GROUND, (c, x, y) => drawFlowerGround(c, x, y, grassTextures));
    draw(TID.FLOWER_OBJ, (c, x, y) => drawFlowerGround(c, x, y, grassTextures));
    draw(TID.LUSH, (c, x, y) => drawLush(c, x, y, grassTextures));
    draw(TID.BENCH, (c, x, y) => drawBench(c, x, y, grassTextures));
    draw(TID.LAMP_ON, (c, x, y) => drawLamp(c, x, y, true, grassTextures));
    draw(TID.LAMP_OFF, (c, x, y) => drawLamp(c, x, y, false, grassTextures));

    draw(TID.MURAL, drawMural);
    // GRASS2/PATH2/SOIL may have already been sourced above.

    draw(TID.HOUSE1_ROOF, (c, x, y) => drawHouseRoof(c, x, y, '#c0392b', '#e74c3c', 'chimney', grassTextures));
    draw(TID.HOUSE1_FACADE, (c, x, y) => drawHouseFacade(c, x, y, 'welcomemat', grassTextures));
    draw(TID.HOUSE2_ROOF, (c, x, y) => drawHouseRoof(c, x, y, '#2980b9', '#3498db', null, grassTextures));
    draw(TID.HOUSE2_FACADE, (c, x, y) => drawHouseFacade(c, x, y, null, grassTextures));
    draw(TID.HOUSE3_ROOF, (c, x, y) => drawHouseRoof(c, x, y, '#27ae60', '#2ecc71', null, grassTextures));
    draw(TID.HOUSE3_FACADE, (c, x, y) => drawHouseFacade(c, x, y, 'colorful', grassTextures));
    draw(TID.HOUSE4_ROOF, (c, x, y) => drawHouseRoof(c, x, y, '#f39c12', '#f1c40f', 'split', grassTextures));
    draw(TID.HOUSE4_FACADE, (c, x, y) => drawHouseFacade(c, x, y, null, grassTextures));
    draw(TID.HOUSE5_ROOF, (c, x, y) => drawHouseRoof(c, x, y, '#8e44ad', '#9b59b6', 'lightbulb', grassTextures));
    draw(TID.HOUSE5_FACADE, (c, x, y) => drawHouseFacade(c, x, y, null, grassTextures));
    draw(TID.SHOP_ROOF, (c, x, y) => drawHouseRoof(c, x, y, '#e67e22', '#f39c12', 'star', grassTextures));
    draw(TID.SHOP_FACADE, (c, x, y) => drawHouseFacade(c, x, y, null, grassTextures));

    draw(TID.MAILBOX, (c, x, y) => drawMailbox(c, x, y, grassTextures));
    draw(TID.NOTICEBOARD, (c, x, y) => drawNoticeboard(c, x, y, grassTextures));
    draw(TID.EASEL, (c, x, y) => drawEasel(c, x, y, grassTextures));
    draw(TID.WATER, drawWater);
    draw(TID.CHECKMARK, (c, x, y) => drawCheckmark(c, x, y, grassTextures));
    draw(TID.LIGHTBULB_SIGN, (c, x, y) => drawLightbulbSign(c, x, y, grassTextures));
    draw(TID.PATH_EDGE_T, (c, x, y) => drawPathEdge(c, x, y, 't', pathTexture));
    draw(TID.PATH_EDGE_B, (c, x, y) => drawPathEdge(c, x, y, 'b', pathTexture));
    draw(TID.PATH_EDGE_L, (c, x, y) => drawPathEdge(c, x, y, 'l', pathTexture));
    draw(TID.PATH_EDGE_R, (c, x, y) => drawPathEdge(c, x, y, 'r', pathTexture));
    draw(TID.COBBLESTONE, drawCobblestone);
    draw(TID.SHOP_SIGN, (c, x, y) => drawShopSign(c, x, y, grassTextures));

    return { canvas, cols: COLS, rows: ROWS, tileCount };
}

// ===== GENERATE MAP JSON (Tiled format) & IMAGE OBJECTS =====
function generateMapJSON() {
    const G = TID.GRASS;
    const P = TID.PATH;
    const GA = TID.GATE;

    function emptyLayer() { return new Array(MAP_COLS * MAP_ROWS).fill(0); }

    function hash01(x, y, seed = 1337) {
        const n = Math.imul(x + 374761393, 668265263) ^ Math.imul(y + 1442695041, 2246822519) ^ seed;
        const t = (n ^ (n >>> 13)) >>> 0;
        return (Math.imul(t, 1274126177) >>> 0) / 4294967296;
    }

    const groundGrid = Array.from({ length: MAP_ROWS }, () =>
        Array.from({ length: MAP_COLS }, () => G)
    );

    const inBounds = (x, y) => x >= 0 && x < MAP_COLS && y >= 0 && y < MAP_ROWS;
    const setTile = (x, y, tid) => { if (inBounds(x, y)) groundGrid[y][x] = tid; };
    const getTile = (x, y) => (inBounds(x, y) ? groundGrid[y][x] : 0);

    function setPath(x, y) {
        if (!inBounds(x, y)) return;
        setTile(x, y, P);
    }

    function paintPathH(y, x1, x2, thickness = 1) {
        const xa = Math.min(x1, x2);
        const xb = Math.max(x1, x2);
        for (let t = 0; t < thickness; t++) {
            for (let x = xa; x <= xb; x++) setPath(x, y + t);
        }
    }

    function paintPathV(x, y1, y2, thickness = 1) {
        const ya = Math.min(y1, y2);
        const yb = Math.max(y1, y2);
        for (let t = 0; t < thickness; t++) {
            for (let y = ya; y <= yb; y++) setPath(x + t, y);
        }
    }

    // --- EXPANDED 40x30 MAP LAYOUT ---
    
    // Main Roads
    paintPathH(7, 0, MAP_COLS - 1, 2); // Top horizontal
    paintPathH(20, 0, MAP_COLS - 1, 2); // Lower horizontal
    paintPathV(9, 7, 20, 2); // Left vertical connector
    paintPathV(26, 7, 26, 2); // Right vertical connector down to shop area

    // Shop Area: keep default grass pattern for a uniform green look.

    // Beautiful park area path loop
    paintPathH(13, 14, 22, 1);
    paintPathH(18, 14, 22, 1);
    paintPathV(14, 13, 18, 1);
    paintPathV(22, 13, 18, 1);

    // Lake removed in favor of a single pond image object (see imageObjects below).

    // Gate entry
    setTile(25, 29, GA); setTile(26, 29, GA); setTile(27, 29, GA);

    // Data arrays
    const groundData = [];
    const wallsData = emptyLayer();
    const objectsData = emptyLayer();
    const upgradeData = emptyLayer();
    
    for (let r = 0; r < MAP_ROWS; r++) {
        for (let c = 0; c < MAP_COLS; c++) {
            groundData.push(groundGrid[r][c]);
        }
    }

    // Generate Craftpix Image Objects
    const imageObjects = [];

    // Imported houses from assets/Hope.png
    imageObjects.push({ name: 'house1', key: 'house1', x: 5*32, y: 2*32, width: 157, height: 104, customBounds: { x: 18, y: 62, w: 121, h: 34 } });
    imageObjects.push({ name: 'house2', key: 'house2', x: 29*32, y: 2*32, width: 113, height: 103, customBounds: { x: 14, y: 62, w: 85, h: 33 } });
    imageObjects.push({ name: 'house3', key: 'house3', x: 5*32 - 8, y: 13*32, width: 139, height: 80, customBounds: { x: 16, y: 48, w: 107, h: 24 } });
    imageObjects.push({ name: 'house4', key: 'house4', x: 30*32, y: 13*32, width: 90, height: 109, customBounds: { x: 10, y: 67, w: 70, h: 34 } });
    imageObjects.push({ name: 'school', key: 'school_building', x: 17*32, y: 2*32, width: 127, height: 112, customBounds: { x: 14, y: 66, w: 99, h: 38 } });
    imageObjects.push({ name: 'house3b', key: 'house6', x: 10*32, y: 2*32, width: 139, height: 80, customBounds: { x: 16, y: 48, w: 107, h: 24 } });
    imageObjects.push({ name: 'house4b', key: 'house7', x: 22*32, y: 2*32, width: 90, height: 109, customBounds: { x: 10, y: 67, w: 70, h: 34 } });
    
    // Fountain replaces old FOUNTAIN tiles
    imageObjects.push({ name: 'fountain', key: 'fountain', anim: 'fountain_anim', x: 18 * 32, y: 15 * 32 - 16, width: 64, height: 64, customBounds: { x: 0, y: 32, w: 64, h: 32 } });

    // Pond (replaces old water tile lake)
    imageObjects.push({
        name: 'pond',
        key: 'pond',
        x: 32 * 32,
        y: 24 * 32,
        width: 7 * 32,
        height: 5 * 32,
        depth: 1,
        customBounds: { x: 16, y: 24, w: 7 * 32 - 32, h: 5 * 32 - 32 }
    });

    // Trees along both sides with spacing
    const treeKeys = [
        'tree_apple_1', 'tree_apple_2', 'tree_apple_3', 'tree_apple_4', 'tree_apple_5', 'tree_apple_6',
        'tree_orange_1', 'tree_orange_2', 'tree_orange_3', 'tree_orange_4',
        'tree_other_1', 'tree_other_2'
    ];
    const treeBounds = { x: 52, y: 88, w: 24, h: 28 };
    const pickTreeKey = (x, y) => treeKeys[Math.floor(hash01(x, y, 913) * treeKeys.length)];
    const addTree = (x, y, i) => {
        imageObjects.push({
            name: `tree_${x}_${y}_${i}`,
            key: pickTreeKey(x, y),
            x,
            y,
            customBounds: treeBounds
        });
    };

    const leftYs = [2, 7, 12, 17];
    leftYs.forEach((ty, i) => addTree(1 * 32, ty * 32, i));

    const rightYs = [4, 9, 14, 19];
    // Keep the original right-side tree line (for the original 40x30 layout)...
    rightYs.forEach((ty, i) => addTree(36 * 32, ty * 32, i));
    // ...and add another line on the new far-right edge for expanded maps.
    const farRightTreeX = (MAP_COLS - 4) * 32;
    rightYs.forEach((ty, i) => addTree(farRightTreeX, ty * 32, i + 100));

    // Animals along both sides with spacing
    const animalBounds = { x: 0, y: 0, w: 1, h: 1 };
    const makeRoamBounds = (x, y, tilesW = 2, tilesH = 2) => {
        const w = tilesW * 32;
        const h = tilesH * 32;
        const maxX = MAP_COLS * 32 - w;
        const maxY = MAP_ROWS * 32 - h;
        const rx = Math.max(0, Math.min(x - Math.floor(w / 2), maxX));
        const ry = Math.max(0, Math.min(y - Math.floor(h / 2), maxY));
        return { x: rx, y: ry, w, h };
    };
    const leftAnimals = [
        { key: 'pet_cat_idle_sheet', anim: 'pet_cat_idle', walkAnim: 'pet_cat_walk', y: 2 },
        { key: 'animal_bird_idle_sheet', anim: 'animal_bird_idle', walkAnim: 'animal_bird_walk', y: 12 },
        { key: 'animal_rat_idle_sheet', anim: 'animal_rat_idle', walkAnim: 'animal_rat_walk', y: 20 },
        { key: 'animal_cat2_idle_sheet', anim: 'animal_cat2_idle', walkAnim: 'animal_cat2_walk', y: 29 }
    ];
    leftAnimals.forEach((a, i) => imageObjects.push({
        name: `animal_left_${i}`,
        key: a.key,
        anim: a.anim,
        walkAnim: a.walkAnim,
        x: 0 * 32,
        y: a.y * 32,
        roam: true,
        roamBounds: makeRoamBounds(0 * 32, a.y * 32, 2, 2),
        roamMinSpeed: 14,
        roamMaxSpeed: 26,
        customBounds: animalBounds
    }));

    const rightAnimals = [
        { key: 'pet_dog_idle_sheet', anim: 'pet_dog_idle', walkAnim: 'pet_dog_walk', y: 3 },
        { key: 'animal_bird2_idle_sheet', anim: 'animal_bird2_idle', walkAnim: 'animal_bird2_walk', y: 13 },
        { key: 'animal_rat2_idle_sheet', anim: 'animal_rat2_idle', walkAnim: 'animal_rat2_walk', y: 24 },
        { key: 'animal_dog2_idle_sheet', anim: 'animal_dog2_idle', walkAnim: 'animal_dog2_walk', y: 29 }
    ];
    rightAnimals.forEach((a, i) => imageObjects.push({
        name: `animal_right_${i}`,
        key: a.key,
        anim: a.anim,
        walkAnim: a.walkAnim,
        x: 37 * 32,
        y: a.y * 32,
        roam: true,
        roamBounds: makeRoamBounds(37 * 32, a.y * 32, 2, 2),
        roamMinSpeed: 14,
        roamMaxSpeed: 26,
        customBounds: animalBounds
    }));

    // Football ground (make it a solid obstacle so the player can't walk over the pitch)
    imageObjects.push({
        name: 'football_ground_entry',
        key: 'football_ground_img',
        x: 2 * 32 + 4,
        y: 22 * 32 + 4,
        width: 8 * 32 - 8,
        height: 6 * 32 - 8,
        depth: 0,
        customBounds: { x: 0, y: 0, w: 8 * 32 - 8, h: 6 * 32 - 8 }
    });

    // NPCs (non-task). Story progression is handled via Zones.
    const npcObjects = [
        { id: 1, name: 'guide', type: 'npc', x: 22 * 32, y: 18 * 32, width: 32, height: 32, properties: [{ name: 'npcId', type: 'string', value: 'guide' }] },
        { id: 7, name: 'shopkeeper', type: 'npc', x: 26 * 32, y: 24 * 32, width: 32, height: 32, properties: [{ name: 'npcId', type: 'string', value: 'shopkeeper' }] },
        { id: 8, name: 'villager1', type: 'npc', x: 12 * 32, y: 12 * 32, width: 32, height: 32, properties: [{ name: 'npcId', type: 'string', value: 'villager1' }] },
        { id: 9, name: 'villager2', type: 'npc', x: 29 * 32, y: 15 * 32, width: 32, height: 32, properties: [{ name: 'npcId', type: 'string', value: 'villager2' }] },
    ];

    const spawnObjects = [
        { id: 100, name: 'spawn', type: 'spawn', x: 26 * 32, y: 28 * 32, width: 32, height: 32 }
    ];

    // Story locations (Zones). Only the next unlocked zone is actionable.
    // IMPORTANT: Object x/y are treated as top-left (consistent with NPC placement).
    const zoneObjects = [
        {
            id: 200,
            name: 'home',
            type: 'zone',
            x: 4 * 32,
            y: 5 * 32,
            width: 7 * 32,
            height: 5 * 32,
            properties: [
                { name: 'taskId', type: 'string', value: 'task1' },
                { name: 'label', type: 'string', value: 'Home Conversation' },
                { name: 'mode', type: 'string', value: 'scene' },
                { name: 'sceneKey', type: 'string', value: 'Task1ConversationScene' }
            ]
        },
        {
            id: 201,
            name: 'playground',
            type: 'zone',
            // Entry point for the football task (kept outside the pitch obstacle)
            x: 4 * 32,
            y: 28 * 32,
            width: 4 * 32,
            height: 2 * 32,
            properties: [
                { name: 'taskId', type: 'string', value: 'task2' },
                { name: 'label', type: 'string', value: 'Football Ground' },
                { name: 'mode', type: 'string', value: 'scene' },
                { name: 'autoEnter', type: 'bool', value: true },
                { name: 'sceneKey', type: 'string', value: 'FootballScene' }
            ]
        },
        {
            id: 202,
            name: 'classroom',
            type: 'zone',
            // Place the classroom task at the School building area (so the mission arrow guides to School).
            x: 14 * 32,
            y: 5 * 32,
            width: 9 * 32,
            height: 5 * 32,
            properties: [
                { name: 'taskId', type: 'string', value: 'task3a' },
                { name: 'label', type: 'string', value: 'Classroom' },
                { name: 'mode', type: 'string', value: 'scene' },
                { name: 'sceneKey', type: 'string', value: 'ClassroomScene' }
            ]
        },
        {
            id: 203,
            name: 'corridor',
            type: 'zone',
            x: 28 * 32,
            y: 17 * 32,
            width: 8 * 32,
            height: 7 * 32,
            properties: [
                { name: 'taskId', type: 'string', value: 'task6' },
                { name: 'label', type: 'string', value: 'Corridor: Ideate' },
                { name: 'mode', type: 'string', value: 'panel' }
            ]
        },
        {
            id: 204,
            name: 'maze',
            type: 'zone',
            x: 24 * 32,
            y: 27 * 32,
            width: 5 * 32,
            height: 3 * 32,
            properties: [
                { name: 'taskId', type: 'string', value: 'task5' },
                { name: 'label', type: 'string', value: 'Maze' },
                { name: 'mode', type: 'string', value: 'scene' },
                { name: 'sceneKey', type: 'string', value: 'MazeScene' }
            ]
        },
        {
            id: 205,
            name: 'park',
            type: 'zone',
            x: 14 * 32,
            y: 13 * 32,
            width: 9 * 32,
            height: 6 * 32,
            properties: [
                { name: 'taskId', type: 'string', value: 'task3b' },
                { name: 'label', type: 'string', value: 'Park: Sad/Happy' },
                { name: 'mode', type: 'string', value: 'panel' }
            ]
        },
        {
            id: 206,
            name: 'school',
            type: 'zone',
            x: 14 * 32,
            y: 5 * 32,
            width: 9 * 32,
            height: 5 * 32,
            properties: [
                { name: 'taskId', type: 'string', value: 'task7' },
                { name: 'label', type: 'string', value: 'School' },
                { name: 'mode', type: 'string', value: 'panel' }
            ]
        },
        {
            id: 207,
            name: 'landmark',
            type: 'zone',
            x: 28 * 32,
            y: 6 * 32,
            width: 8 * 32,
            height: 6 * 32,
            properties: [
                { name: 'taskId', type: 'string', value: 'task4' },
                { name: 'label', type: 'string', value: 'Landmark' },
                { name: 'mode', type: 'string', value: 'panel' }
            ]
        }
    ];

    const json = {
        compressionlevel: -1, height: MAP_ROWS, width: MAP_COLS,
        infinite: false, orientation: 'orthogonal', renderorder: 'right-down',
        tiledversion: '1.10.0', tileheight: TILE_SIZE, tilewidth: TILE_SIZE,
        type: 'map', version: '1.10', nextlayerid: 9, nextobjectid: 208,
        tilesets: [{
            firstgid: 1, columns: 8, image: 'village-tiles.png',
            imageheight: Math.ceil((Object.keys(TID).length - 1) / 8) * TILE_SIZE, imagewidth: 8 * TILE_SIZE,
            margin: 0, name: 'village-tiles', spacing: 0, tilecount: Object.keys(TID).length - 1,
            tileheight: TILE_SIZE, tilewidth: TILE_SIZE
        }],
        layers: [
            { id: 1, name: 'Ground', type: 'tilelayer', width: MAP_COLS, height: MAP_ROWS, data: groundData, visible: true, opacity: 1, x: 0, y: 0 },
            { id: 2, name: 'Walls', type: 'tilelayer', width: MAP_COLS, height: MAP_ROWS, data: wallsData, visible: true, opacity: 1, x: 0, y: 0 },
            { id: 3, name: 'Objects', type: 'tilelayer', width: MAP_COLS, height: MAP_ROWS, data: objectsData, visible: true, opacity: 1, x: 0, y: 0 },
            { id: 4, name: 'Buildings', type: 'tilelayer', width: MAP_COLS, height: MAP_ROWS, data: emptyLayer(), visible: true, opacity: 1, x: 0, y: 0 }, // Kept for layer index compat
            { id: 5, name: 'Upgrade', type: 'tilelayer', width: MAP_COLS, height: MAP_ROWS, data: upgradeData, visible: true, opacity: 1, x: 0, y: 0 },
            { id: 6, name: 'NPCs', type: 'objectgroup', objects: npcObjects, visible: true, opacity: 1, x: 0, y: 0 },
            { id: 7, name: 'Spawn', type: 'objectgroup', objects: spawnObjects, visible: true, opacity: 1, x: 0, y: 0 },
            { id: 8, name: 'Zones', type: 'objectgroup', objects: zoneObjects, visible: true, opacity: 1, x: 0, y: 0 }
        ]
    };

    return { json, imageObjects };
}
