import { useState, useEffect, useRef } from 'react';
import { Monitor, Zap, Disc, Battery, Wifi, Activity } from 'lucide-react';

const PixelAtmosphereEngine = () => {
  const canvasRef = useRef(null);
  const requestRef = useRef();
  const [activeMode, setActiveMode] = useState('dark_fantasy');
  const [time, setTime] = useState(new Date());
  const [batteryLevel, setBatteryLevel] = useState(100);

  // HD-Pixel Resolution (High DPI look)
  const GAME_WIDTH = 640;
  const GAME_HEIGHT = 360;

  // REFS
  const modeRef = useRef('dark_fantasy');
  const frameRef = useRef(0);
  
  // ENTITY STATE SYSTEM
  const entitiesRef = useRef({
    particles: [], // General particles
    stars: [],
    clouds: [],
    fireworks: [],
    campfires: [],
    knights: [],
    horses: [],
    animals: [], 
    balloons: [],
    fish: [],
    ghosts: [],
    bats: [], 
    crowd: [], 
    couples: [], // New Year
    santas: [], 
    snowmen: [], 
    kids: [], 
    houses: [], 
    planets: [], 
    ufos: [],
    galaxyStars: [], // Orbit
    seaCreatures: [], // Ocean
    sharks: [], // Ocean
    partyGuests: [], // Birthday
    hologram: null, // Cyberpunk
    ryan: null, // Cyberpunk
    flyingCars: [], // Cyberpunk
    lanterns: [], // Kyoto
    torii: [], // Kyoto
    witches: [], // Halloween
    monsters: [], // Halloween
    gravestones: [], // Halloween
    demons: [], // Halloween (Ring Girl)
    wells: [], // Halloween
  });

  // --- THEME CONFIGURATION ---
  const modes = {
    dark_fantasy: { title: "REST", quote: "The Long Watch", colors: { bg: '#231917', accent: '#fbbf24' } },
    new_year: { title: "NEON", quote: "Midnight Kiss", colors: { bg: '#020617', accent: '#a78bfa' } },
    nature: { title: "SAVANNA", quote: "Wild Lands", colors: { bg: '#38bdf8', accent: '#bef264' } },
    christmas: { title: "FROST", quote: "Winter Solstice", colors: { bg: '#0f172a', accent: '#f87171' } },
    halloween: { title: "SPOOK", quote: "Seven Days", colors: { bg: '#2e1065', accent: '#fb923c' } }, 
    birthday: { title: "PARTY", quote: "House Party", colors: { bg: '#fff1f2', accent: '#ec4899' } },
    zen: { title: "KYOTO", quote: "Spirit Walk", colors: { bg: '#fff1f2', accent: '#be185d' } },
    cyberpunk: { title: "2049", quote: "Baseline Test", colors: { bg: '#052e16', accent: '#d946ef' } },
    underwater: { title: "OCEAN", quote: "The Depths", colors: { bg: '#172554', accent: '#67e8f9' } },
    space: { title: "ORBIT", quote: "Galactic Center", colors: { bg: '#000000', accent: '#fff' } },
  };

  // --- DRAWING PRIMITIVES ---

  const drawPixel = (ctx, x, y, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1);
  };

  const drawRect = (ctx, x, y, w, h, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
  };

  const drawCircle = (ctx, x, y, radius, color) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  };

  // --- ENTITY FACTORIES & INIT ---

  const initMode = (mode) => {
    const e = entitiesRef.current;
    // Reset transient entities
    e.particles = [];
    e.fireworks = [];
    e.campfires = [];
    e.knights = [];
    e.horses = [];
    e.animals = [];
    e.balloons = [];
    e.fish = [];
    e.ghosts = [];
    e.bats = [];
    e.crowd = [];
    e.couples = [];
    e.clouds = [];
    e.santas = [];
    e.snowmen = [];
    e.kids = [];
    e.houses = [];
    e.planets = [];
    e.ufos = [];
    e.galaxyStars = [];
    e.seaCreatures = [];
    e.sharks = [];
    e.partyGuests = [];
    e.lanterns = [];
    e.torii = [];
    e.witches = [];
    e.monsters = [];
    e.gravestones = [];
    e.demons = [];
    e.wells = [];
    e.hologram = null;
    e.ryan = null;
    e.flyingCars = [];

    // Global: Stars (re-generated for certain modes)
    if (['dark_fantasy', 'new_year', 'space', 'halloween', 'christmas'].includes(mode)) {
        const starCount = mode === 'space' ? 400 : 200;
        e.stars = Array.from({ length: starCount }, () => ({
            x: Math.random() * GAME_WIDTH,
            y: Math.random() * GAME_HEIGHT,
            size: Math.random() * (mode === 'space' ? 2 : 1.5),
            blinkSpeed: 0.01 + Math.random() * 0.05,
            color: mode === 'space' ? ['#fff', '#a78bfa', '#fbcfe8'][Math.floor(Math.random()*3)] : '#fff'
        }));
    } else {
        e.stars = [];
    }

    if (mode === 'space') {
        // Planets
        e.planets.push({ type: 'gas_giant', x: GAME_WIDTH - 100, y: 100, r: 60, color: '#d97706' });
        e.planets.push({ type: 'earth', x: 80, y: GAME_HEIGHT - 60, r: 35, color: '#3b82f6' });
        e.planets.push({ type: 'red_dwarf', x: 550, y: 250, r: 20, color: '#ef4444' });
        e.planets.push({ type: 'ice', x: 300, y: 50, r: 15, color: '#67e8f9' });
        
        // Galaxy Spiral Stars
        for(let i=0; i<300; i++) {
            const angle = i * 0.1;
            const dist = i * 0.8;
            e.galaxyStars.push({
                angle: angle,
                dist: dist,
                speed: 0.002 + Math.random() * 0.002,
                color: i % 2 === 0 ? '#a78bfa' : '#fbcfe8'
            });
        }
        e.ufos.push({ x: -50, y: 50, speed: 1.5 });
    }

    if (mode === 'new_year') {
        // Crowd (Anchored to ground)
        const groundY = GAME_HEIGHT - 20; 
        for(let i=0; i<GAME_WIDTH; i+=15) {
            e.crowd.push({
                x: i,
                y: groundY,
                color: ['#38bdf8', '#f472b6', '#a78bfa', '#bef264'][Math.floor(Math.random()*4)],
                height: 10 + Math.random() * 4,
                facing: Math.random() > 0.5 ? 1 : -1,
                action: Math.random() > 0.7 ? 'wave' : 'idle'
            });
        }
        // Couples kissing (Anchored)
        e.couples = [
            { x: 150, y: groundY },
            { x: 450, y: groundY },
            { x: 300, y: groundY }
        ];
    }

    if (mode === 'dark_fantasy') {
        // Campfires
        e.campfires = [
            { x: 150, y: GAME_HEIGHT - 40, size: 1 },
            { x: 350, y: GAME_HEIGHT - 50, size: 1.2 },
            { x: 500, y: GAME_HEIGHT - 45, size: 0.8 }
        ];

        // Knights
        e.knights = [
            { x: 130, y: GAME_HEIGHT - 45, action: 'sitting', color: '#94a3b8' },
            { x: 170, y: GAME_HEIGHT - 45, action: 'sleeping', color: '#64748b' },
            { x: 330, y: GAME_HEIGHT - 55, action: 'standing', color: '#cbd5e1' },
            { x: 370, y: GAME_HEIGHT - 55, action: 'eating', color: '#94a3b8' },
            { x: 480, y: GAME_HEIGHT - 50, action: 'sitting', color: '#64748b' },
            { x: 520, y: GAME_HEIGHT - 50, action: 'guitar', color: '#94a3b8' }, // Bard
        ];

        // Horses
        e.horses = [
            { x: 60, y: GAME_HEIGHT - 50, color: '#3f2e22', headDown: true },
            { x: 580, y: GAME_HEIGHT - 60, color: '#1c1917', headDown: false }
        ];
    }

    if (mode === 'nature') {
        e.clouds = Array.from({length: 8}, () => ({
            x: Math.random() * GAME_WIDTH,
            y: Math.random() * 100,
            w: 40 + Math.random() * 60,
            speed: 0.05 + Math.random() * 0.2
        }));

        e.animals = [
            { type: 'lion', x: 50, y: GAME_HEIGHT - 45, dir: 1, state: 'walk' },
            { type: 'deer', x: 400, y: GAME_HEIGHT - 50, dir: -1 },
            { type: 'zebra', x: 150, y: GAME_HEIGHT - 55, dir: 1 },
            { type: 'giraffe', x: 550, y: GAME_HEIGHT - 90, dir: -1 },
            { type: 'bird', x: 0, y: 50, speed: 2, offset: 0 },
            { type: 'cactus', x: 250, y: GAME_HEIGHT - 30, h: 20 },
            { type: 'cactus', x: 280, y: GAME_HEIGHT - 25, h: 15 },
            { type: 'cactus', x: 480, y: GAME_HEIGHT - 35, h: 25 }
        ];
    }

    if (mode === 'birthday') {
        // Party Guests (Crowd in room)
        for(let i=0; i<15; i++) {
            e.partyGuests.push({
                x: 50 + Math.random() * (GAME_WIDTH - 100),
                y: GAME_HEIGHT - 40 - Math.random() * 20,
                color: ['#f472b6', '#60a5fa', '#a78bfa', '#facc15'][Math.floor(Math.random()*4)],
                jump: Math.random() * 100
            });
        }
        for(let i=0; i<30; i++) {
            e.balloons.push({
                x: Math.random() * GAME_WIDTH,
                y: GAME_HEIGHT + Math.random() * 200,
                color: ['#f472b6', '#38bdf8', '#facc15', '#a78bfa'][Math.floor(Math.random()*4)],
                speed: 0.5 + Math.random(),
                wobble: Math.random() * 10
            });
        }
    }

    if (mode === 'christmas') {
        // Snowflakes
        for(let i=0; i<300; i++) {
            e.particles.push({
                type: 'snow',
                x: Math.random() * GAME_WIDTH,
                y: Math.random() * GAME_HEIGHT,
                speed: 0.2 + Math.random() * 0.8
            });
        }
        e.houses.push({ x: 450, y: GAME_HEIGHT - 60 });
        e.snowmen.push({ x: 100, y: GAME_HEIGHT - 40 });
        e.kids = [
            { x: 130, y: GAME_HEIGHT - 35, color: '#facc15', dir: 1 },
            { x: 160, y: GAME_HEIGHT - 35, color: '#60a5fa', dir: -1 },
            { x: 400, y: GAME_HEIGHT - 35, color: '#f472b6', dir: 1 }, 
        ];
        e.santas.push({ x: -100, y: 50 }); 
    }

    if (mode === 'halloween') {
        // Gravestones
        for(let i=0; i<8; i++) {
            e.gravestones.push({
                x: 50 + i * 80 + Math.random() * 30,
                y: GAME_HEIGHT - 35,
                w: 20 + Math.random() * 10,
                h: 25 + Math.random() * 10,
                type: Math.random() > 0.5 ? 'cross' : 'round'
            });
        }
        // Well
        e.wells.push({ x: 300, y: GAME_HEIGHT - 35 });
        // Ring Girl Demon (Starts in well)
        e.demons.push({ x: 307, y: GAME_HEIGHT - 35, state: 'rising', progress: 0 });
        
        e.witches.push({ x: GAME_WIDTH + 20, y: 100, speed: 2 });
        
        // Spirits
        for(let i=0; i<5; i++) {
             e.ghosts.push({ x: 150 + i*80, y: GAME_HEIGHT-20, offset: i*100 });
        }

        // Bats
        for(let i=0; i<10; i++) {
            e.bats.push({
                x: Math.random() * GAME_WIDTH,
                y: Math.random() * 200,
                speed: 1 + Math.random() * 2,
                off: Math.random() * 100
            });
        }
        // Fog
        for(let i=0; i<50; i++) {
             e.particles.push({
                type: 'fog',
                x: Math.random() * GAME_WIDTH,
                y: GAME_HEIGHT - Math.random() * 50,
                speed: 0.2 + Math.random() * 0.5,
                size: 20 + Math.random() * 30
            });
        }
    }

    if (mode === 'zen') {
        // Kyoto details
        e.torii.push({ x: GAME_WIDTH/2, y: GAME_HEIGHT - 60 });
        e.lanterns = [
            {x: 100, y: 100}, {x: 200, y: 80}, {x: 440, y: 80}, {x: 540, y: 100}
        ];
        
        // Lots of petals
        for(let i=0; i<200; i++) {
             e.particles.push({
                type: 'petal',
                x: Math.random() * GAME_WIDTH,
                y: Math.random() * GAME_HEIGHT,
                speed: 0.2 + Math.random() * 0.5
            });
        }
    }

    if (mode === 'underwater') {
        // Shark
        e.sharks.push({ x: -100, y: 100, speed: 1.5, dir: 1 });

        // Ocean creatures
        e.seaCreatures.push({ type: 'octopus', x: 100, y: 200, color: '#fca5a5' });
        e.seaCreatures.push({ type: 'jellyfish', x: 500, y: 150, color: '#e879f9' });
        e.seaCreatures.push({ type: 'jellyfish', x: 550, y: 250, color: '#a78bfa' });
        e.seaCreatures.push({ type: 'crab', x: 300, y: GAME_HEIGHT - 20, color: '#ef4444', dir: 1 });
        e.seaCreatures.push({ type: 'crab', x: 400, y: GAME_HEIGHT - 15, color: '#f87171', dir: -1 });

        // Bubbles
        for(let i=0; i<80; i++) {
            e.particles.push({
                type: 'bubble',
                x: Math.random() * GAME_WIDTH,
                y: Math.random() * GAME_HEIGHT,
                speed: 0.1 + Math.random() * 0.5
            });
        }
        // Fish
        for(let i=0; i<25; i++) {
            e.fish.push({
                x: Math.random() * GAME_WIDTH,
                y: 100 + Math.random() * 200,
                color: ['#fbbf24', '#f87171', '#22d3ee', '#86efac'][Math.floor(Math.random()*4)],
                speed: 0.5 + Math.random() * 1.5,
                dir: Math.random() > 0.5 ? 1 : -1
            });
        }
    }

    if (mode === 'cyberpunk') {
        e.ryan = { x: GAME_WIDTH/2 - 50, y: GAME_HEIGHT - 60 };
        e.hologram = { x: GAME_WIDTH/2 + 20, y: GAME_HEIGHT - 180 };
        // Flying Cars
        e.flyingCars = [
            { x: 0, y: 50, speed: 2, color: '#0ea5e9' },
            { x: 400, y: 100, speed: -3, color: '#f43f5e' },
            { x: 100, y: 80, speed: 4, color: '#ffffff' }
        ];

        // Rain
        for(let i=0; i<100; i++) {
             e.particles.push({
                type: 'rain',
                x: Math.random() * GAME_WIDTH,
                y: Math.random() * GAME_HEIGHT,
                speed: 5 + Math.random() * 5
            });
        }
    }
  };

  // --- RENDERERS ---

  const renderDarkFantasy = (ctx, frame) => {
    // 1. Background (Lighter Dusk for contrast)
    const grd = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
    grd.addColorStop(0, '#1e3a8a'); // Dusk Blue
    grd.addColorStop(1, '#4c1d95'); // Purple Bottom
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Stars
    entitiesRef.current.stars.forEach(s => {
        if (Math.sin(frame * s.blinkSpeed) > 0) drawPixel(ctx, s.x, s.y, '#ffffff');
    });

    // Huge Moon
    drawCircle(ctx, GAME_WIDTH/2, 100, 60, '#fef3c7');

    // CASTLE SILHOUETTE (Pensanavia Style - Gothic)
    ctx.fillStyle = '#0f172a'; // Darker, cleaner silhouette
    const cx = GAME_WIDTH/2;
    const cy = GAME_HEIGHT;
    
    // Main base
    drawRect(ctx, cx - 100, cy - 100, 200, 100, '#0f172a');
    
    // Central Spire (Tall & Thin)
    ctx.beginPath();
    ctx.moveTo(cx - 30, cy - 100);
    ctx.lineTo(cx, cy - 280); // Way up
    ctx.lineTo(cx + 30, cy - 100);
    ctx.fill();
    
    // Side Spires
    ctx.beginPath();
    ctx.moveTo(cx - 90, cy - 100);
    ctx.lineTo(cx - 70, cy - 200);
    ctx.lineTo(cx - 50, cy - 100);
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(cx + 50, cy - 100);
    ctx.lineTo(cx + 70, cy - 200);
    ctx.lineTo(cx + 90, cy - 100);
    ctx.fill();
    
    // Spikes/Details on base
    for(let i=-100; i<100; i+=20) {
        ctx.beginPath();
        ctx.moveTo(cx + i, cy - 100);
        ctx.lineTo(cx + i + 10, cy - 130);
        ctx.lineTo(cx + i + 20, cy - 100);
        ctx.fill();
    }
    
    // Windows
    ctx.fillStyle = '#fbbf24';
    drawRect(ctx, cx - 10, cy - 180, 4, 10, '#fbbf24');
    drawRect(ctx, cx + 6, cy - 180, 4, 10, '#fbbf24');
    drawRect(ctx, cx - 70, cy - 150, 4, 8, '#fbbf24');
    drawRect(ctx, cx + 66, cy - 150, 4, 8, '#fbbf24');


    // 2. Midground Hills
    ctx.fillStyle = '#334155';
    for (let x=0; x<GAME_WIDTH; x+=4) {
        let h = 60 + Math.sin(x*0.01)*20;
        ctx.fillRect(x, GAME_HEIGHT - h, 4, h);
    }

    // 3. Foreground Camp Ground
    ctx.fillStyle = '#475569';
    drawRect(ctx, 0, GAME_HEIGHT - 40, GAME_WIDTH, 40, '#475569'); 

    // 4. ENTITIES
    const e = entitiesRef.current;

    // Campfires & Smoke
    e.campfires.forEach(fire => {
        // Fire base
        drawRect(ctx, fire.x - 10, fire.y + 5, 20, 5, '#1e293b'); 
        // Flickering Flame
        drawCircle(ctx, fire.x, fire.y, 6 + Math.sin(frame*0.2)*2, '#ea580c');
        drawCircle(ctx, fire.x, fire.y + 2, 3 + Math.sin(frame*0.5)*1, '#facc15');
        
        // Spawn ember particles
        if(frame % 5 === 0) {
            e.particles.push({
                type: 'ember', x: fire.x + (Math.random()-0.5)*10, y: fire.y,
                vy: -0.5 - Math.random(), life: 100
            });
        }
    });

    // Knights
    e.knights.forEach(k => {
        ctx.fillStyle = k.color;
        drawRect(ctx, k.x, k.y, 12, 16, k.color); // Torso
        drawCircle(ctx, k.x+6, k.y-4, 5, k.color); // Head
        
        // Actions
        if(k.action === 'sleeping') {
             if(frame % 60 < 30) drawPixel(ctx, k.x+10, k.y-10, '#fff');
             if(frame % 60 < 20) drawPixel(ctx, k.x+14, k.y-14, '#fff');
             drawRect(ctx, k.x, k.y+4, 12, 12, '#00000055');
        } else if (k.action === 'guitar') {
             const strum = Math.sin(frame * 0.2) * 2;
             drawRect(ctx, k.x-4, k.y+8+strum, 20, 4, '#78350f'); 
        } else if (k.action === 'eating') {
             if(frame % 100 < 20) drawCircle(ctx, k.x+6, k.y+4, 3, '#ea580c');
             else drawCircle(ctx, k.x+6, k.y+10, 3, '#ea580c');
        }
    });

    // Horses
    e.horses.forEach(h => {
        ctx.fillStyle = h.color;
        drawRect(ctx, h.x, h.y, 24, 14, h.color);
        drawRect(ctx, h.x+2, h.y+14, 4, 8, h.color);
        drawRect(ctx, h.x+18, h.y+14, 4, 8, h.color);
        if(h.headDown || (frame % 200 > 100)) drawRect(ctx, h.x-8, h.y+4, 10, 8, h.color); 
        else drawRect(ctx, h.x-4, h.y-8, 8, 12, h.color); 
        if(Math.sin(frame*0.1) > 0.8) drawRect(ctx, h.x+24, h.y+2, 2, 8, h.color);
        else drawRect(ctx, h.x+24, h.y+4, 2, 8, h.color);
    });

    // Process Particles (Embers)
    e.particles = e.particles.filter(p => p.life > 0);
    e.particles.forEach(p => {
        p.y += p.vy;
        p.x += Math.sin(frame * 0.1) * 0.5;
        p.life--;
        ctx.globalAlpha = p.life / 100;
        drawPixel(ctx, p.x, p.y, '#fbbf24');
        ctx.globalAlpha = 1.0;
    });
  };

  const renderCity = (ctx, frame) => {
    const e = entitiesRef.current;
    
    // 1. Sky - DARK BLUE
    drawRect(ctx, 0, 0, GAME_WIDTH, GAME_HEIGHT, '#172554'); // Blue-950

    // Stars & Moon
    e.stars.forEach(s => {
        if (Math.sin(frame * s.blinkSpeed) > 0) drawPixel(ctx, s.x, s.y, '#ffffff');
    });
    drawCircle(ctx, 100, 80, 25, '#fef9c3'); 

    // 2. Fireworks Physics (Middle Sky)
    if(Math.random() > 0.95) { 
        e.fireworks.push({
            x: Math.random() * GAME_WIDTH,
            y: GAME_HEIGHT,
            tx: Math.random() * GAME_WIDTH,
            ty: 50 + Math.random() * 150, 
            vx: (Math.random()-0.5) * 2,
            vy: -4 - Math.random() * 3,
            color: ['#f0abfc', '#38bdf8', '#bef264', '#fca5a5', '#fbbf24'][Math.floor(Math.random()*5)],
            state: 'rise'
        });
    }

    // Draw Fireworks
    e.fireworks = e.fireworks.filter(fw => fw.state !== 'dead');
    e.fireworks.forEach(fw => {
        if(fw.state === 'rise') {
            fw.x += fw.vx;
            fw.y += fw.vy;
            fw.vy += 0.05; 
            drawRect(ctx, fw.x, fw.y, 2, 4, '#fff');
            if(fw.vy >= 0) {
                fw.state = 'explode';
                fw.life = 60;
                fw.particles = [];
                for(let i=0; i<30; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const speed = Math.random() * 2;
                    fw.particles.push({
                        x: fw.x, y: fw.y,
                        vx: Math.cos(angle) * speed,
                        vy: Math.sin(angle) * speed
                    });
                }
            }
        } else if (fw.state === 'explode') {
            fw.life--;
            if(fw.life <= 0) fw.state = 'dead';
            fw.particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.02; 
                p.vx *= 0.95;
                ctx.globalAlpha = fw.life / 60;
                drawRect(ctx, p.x, p.y, 2, 2, fw.color);
                ctx.globalAlpha = 1.0;
            });
        }
    });

    // 3. Cityscape (Brighter and Livelier)
    for(let i=0; i<GAME_WIDTH; i+=40) {
      let h = 100 + Math.sin(i*132)*50;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(i, GAME_HEIGHT-h, 36, h);

      // Windows
      for(let wy=GAME_HEIGHT-h+4; wy<GAME_HEIGHT; wy+=6) {
          for(let wx=i+4; wx<i+32; wx+=6) {
             const t = frame * 0.02;
             const noise = Math.sin(wx * 0.1 + wy * 0.1 + t);
             if(noise > 0.4) { 
                 ctx.fillStyle = (noise > 0.8) ? '#a78bfa' : (noise > 0.9 ? '#22d3ee' : '#fef08a');
                 drawRect(ctx, wx, wy, 4, 4, ctx.fillStyle);
             } else {
                 ctx.fillStyle = '#1e293b'; 
                 drawRect(ctx, wx, wy, 4, 4, '#1e293b');
             }
          }
      }
    }

    // 4. Ground (Sidewalk)
    ctx.fillStyle = '#1e293b';
    drawRect(ctx, 0, GAME_HEIGHT - 20, GAME_WIDTH, 20, '#1e293b');
    // Railing
    ctx.fillStyle = '#475569';
    drawRect(ctx, 0, GAME_HEIGHT - 22, GAME_WIDTH, 2, '#475569');

    // 4. Cheering Crowd 
    e.crowd.forEach(person => {
        ctx.fillStyle = person.color;
        drawRect(ctx, person.x, person.y - person.height, 6, person.height, person.color);
        drawRect(ctx, person.x+1, person.y - person.height - 4, 4, 4, '#fcd34d'); 
        if(person.action === 'wave') {
            const wave = Math.sin(frame * 0.2 + person.x) * 2;
            drawRect(ctx, person.x-2, person.y - person.height - 2 + wave, 2, 6, person.color); 
            drawRect(ctx, person.x+6, person.y - person.height - 2 - wave, 2, 6, person.color); 
        }
    });

    // 5. Kissing Couples & Hearts
    e.couples.forEach(c => {
         ctx.fillStyle = '#fff';
         drawRect(ctx, c.x, c.y - 12, 5, 12, '#3b82f6');
         drawRect(ctx, c.x+1, c.y - 16, 3, 4, '#fcd34d');
         drawRect(ctx, c.x+4, c.y - 11, 5, 11, '#f472b6');
         drawRect(ctx, c.x+5, c.y - 15, 3, 4, '#fcd34d');

         if(frame % 40 === 0) {
             e.particles.push({
                 type: 'heart', x: c.x+2, y: c.y-20,
                 vy: -1, life: 120, color: '#ef4444' 
             });
         }
    });

    e.particles.forEach(p => {
        if(p.type === 'heart') {
            p.y += p.vy * 0.5; 
            p.x += Math.sin(frame * 0.2 + p.y) * 0.5;
            p.life--; 
            if(p.life > 0) {
                ctx.globalAlpha = p.life < 30 ? p.life / 30 : 1.0;
                ctx.fillStyle = p.color;
                drawRect(ctx, p.x, p.y, 2, 2, p.color);
                drawRect(ctx, p.x+4, p.y, 2, 2, p.color);
                drawRect(ctx, p.x+2, p.y+2, 2, 2, p.color);
                drawRect(ctx, p.x+2, p.y-1, 2, 1, p.color);
                ctx.globalAlpha = 1.0;
            }
        }
    });
  };

  const renderNature = (ctx, frame) => {
    // 1. Sky & Sun
    drawRect(ctx, 0, 0, GAME_WIDTH, GAME_HEIGHT, '#38bdf8');
    
    // Sun
    const sunY = 80;
    const sunX = GAME_WIDTH - 100;
    drawCircle(ctx, sunX, sunY, 30, '#facc15');
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2;
    for(let i=0; i<8; i++) {
        const angle = frame * 0.01 + (i * (Math.PI/4));
        ctx.beginPath();
        ctx.moveTo(sunX + Math.cos(angle)*35, sunY + Math.sin(angle)*35);
        ctx.lineTo(sunX + Math.cos(angle)*50, sunY + Math.sin(angle)*50);
        ctx.stroke();
    }

    // 2. Clouds
    ctx.fillStyle = '#ffffff';
    entitiesRef.current.clouds.forEach(c => {
        c.x += c.speed;
        if(c.x > GAME_WIDTH + 50) c.x = -50;
        drawCircle(ctx, c.x, c.y, 20, '#fff');
        drawCircle(ctx, c.x+15, c.y-5, 25, '#fff');
        drawCircle(ctx, c.x+30, c.y, 20, '#fff');
    });

    // 3. Savanna Terrain
    ctx.fillStyle = '#eab308'; // Golden grass back
    drawRect(ctx, 0, GAME_HEIGHT-80, GAME_WIDTH, 80, '#eab308');
    ctx.fillStyle = '#a16207'; // Front dirt
    drawRect(ctx, 0, GAME_HEIGHT-20, GAME_WIDTH, 20, '#a16207');

    // Acacia Tree
    const drawAcacia = (x, y) => {
        ctx.fillStyle = '#451a03'; // Trunk
        drawRect(ctx, x, y-60, 10, 60, '#451a03');
        // Flat top leaves
        ctx.fillStyle = '#166534';
        drawRect(ctx, x-30, y-70, 70, 15, '#166534');
        drawRect(ctx, x-20, y-75, 50, 10, '#166534');
    };
    drawAcacia(100, GAME_HEIGHT-20);
    drawAcacia(500, GAME_HEIGHT-30);

    // 4. Animals
    entitiesRef.current.animals.forEach(a => {
        if(a.type === 'lion') {
            a.x += a.dir * 0.3;
            if(a.x > 300 || a.x < 20) a.dir *= -1;
            
            // Lion Body
            ctx.fillStyle = '#ca8a04';
            drawRect(ctx, a.x, a.y, 25, 12, '#ca8a04');
            drawRect(ctx, a.x + (a.dir === 1 ? 20 : -5), a.y-5, 10, 10, '#ca8a04'); // Head
            drawRect(ctx, a.x + (a.dir === 1 ? 20 : -5), a.y-5, 10, 12, '#713f12'); // Mane
            
            // Legs moving
            const legOffset = Math.sin(frame * 0.2) * 3;
            drawRect(ctx, a.x+2, a.y+12+legOffset, 4, 8, '#ca8a04');
            drawRect(ctx, a.x+18, a.y+12-legOffset, 4, 8, '#ca8a04');
        } else if (a.type === 'deer') {
            // Deer grazing
            ctx.fillStyle = '#b45309';
            drawRect(ctx, a.x, a.y, 15, 10, '#b45309');
            drawRect(ctx, a.x-4, a.y+2, 4, 6, '#b45309'); // Head grazing
            drawRect(ctx, a.x, a.y+10, 2, 8, '#78350f'); // Leg
            drawRect(ctx, a.x+12, a.y+10, 2, 8, '#78350f'); // Leg
            
            // Randomly lift head
            if(frame % 200 > 180) {
                 ctx.fillStyle = '#38bdf8'; // Sky cover old head
                 drawRect(ctx, a.x-4, a.y+2, 4, 6, '#eab308'); // Erase
                 ctx.fillStyle = '#b45309';
                 drawRect(ctx, a.x-2, a.y-6, 4, 8, '#b45309'); // Head up
            }
        } else if (a.type === 'zebra') {
             // Zebra
             a.x += a.dir * 0.1;
             if(a.x > 200 || a.x < 100) a.dir *= -1;
             ctx.fillStyle = '#fff';
             drawRect(ctx, a.x, a.y, 25, 14, '#fff'); // Body
             // Stripes
             ctx.fillStyle = '#000';
             for(let i=2; i<24; i+=4) drawRect(ctx, a.x+i, a.y, 2, 14, '#000');
             
             // Head
             ctx.fillStyle = '#fff';
             drawRect(ctx, a.x + (a.dir === 1 ? 20 : -5), a.y-8, 10, 12, '#fff');
             
             // Legs
             const leg = Math.sin(frame * 0.1) * 3;
             drawRect(ctx, a.x+2, a.y+14+leg, 3, 10, '#fff');
             drawRect(ctx, a.x+20, a.y+14-leg, 3, 10, '#fff');

        } else if (a.type === 'giraffe') {
             // Giraffe
             ctx.fillStyle = '#facc15';
             drawRect(ctx, a.x, a.y, 30, 15, '#facc15'); // Body
             drawRect(ctx, a.x-5, a.y-50, 8, 60, '#facc15'); // Neck
             drawRect(ctx, a.x-10, a.y-60, 15, 10, '#facc15'); // Head
             
             // Spots
             ctx.fillStyle = '#a16207';
             drawRect(ctx, a.x+5, a.y+2, 5, 5, '#a16207');
             drawRect(ctx, a.x+15, a.y+8, 5, 5, '#a16207');
             drawRect(ctx, a.x-2, a.y-30, 2, 2, '#a16207');
             drawRect(ctx, a.x-2, a.y-10, 2, 2, '#a16207');
             
             // Legs
             ctx.fillStyle = '#facc15';
             drawRect(ctx, a.x+2, a.y+15, 4, 30, '#facc15');
             drawRect(ctx, a.x+24, a.y+15, 4, 30, '#facc15');

        } else if (a.type === 'cactus') {
             ctx.fillStyle = '#15803d';
             drawRect(ctx, a.x, a.y - a.h, 6, a.h, '#15803d'); // Main stem
             // Arm
             drawRect(ctx, a.x - 6, a.y - a.h + 5, 6, 4, '#15803d');
             drawRect(ctx, a.x - 6, a.y - a.h - 5, 4, 10, '#15803d');
        }
    });
  };

  const renderGenericTheme = (ctx, frame, themeName) => {
    const e = entitiesRef.current;
    
    // Backgrounds
    if (themeName === 'christmas') {
        drawRect(ctx, 0, 0, GAME_WIDTH, GAME_HEIGHT, '#1e293b'); // Night
        e.stars.forEach(s => {
            if (Math.sin(frame * s.blinkSpeed) > 0) drawPixel(ctx, s.x, s.y, '#ffffff');
        });

        // Snow Ground
        ctx.fillStyle = '#f1f5f9';
        drawRect(ctx, 0, GAME_HEIGHT-30, GAME_WIDTH, 30, '#f1f5f9');
        
        // Tree
        const tx = GAME_WIDTH/2; const ty = GAME_HEIGHT-30;
        ctx.fillStyle = '#166534';
        for(let i=0; i<3; i++) {
            const w = 60 - i*15;
            const h = 40;
            const y = ty - (i*25);
            ctx.beginPath();
            ctx.moveTo(tx - w/2, y);
            ctx.lineTo(tx + w/2, y);
            ctx.lineTo(tx, y - h);
            ctx.fill();
        }
        // Lights on tree
        if(frame % 30 < 15) {
             drawPixel(ctx, tx-10, ty-20, '#ef4444');
             drawPixel(ctx, tx+5, ty-40, '#facc15');
             drawPixel(ctx, tx-5, ty-60, '#3b82f6');
        }

        // House
        e.houses.forEach(h => {
             ctx.fillStyle = '#7f1d1d'; // Red brick
             drawRect(ctx, h.x, h.y, 60, 40, '#7f1d1d');
             // Roof
             ctx.fillStyle = '#f1f5f9'; // Snow roof
             ctx.beginPath();
             ctx.moveTo(h.x-10, h.y);
             ctx.lineTo(h.x+70, h.y);
             ctx.lineTo(h.x+30, h.y-30);
             ctx.fill();
             // Chimney
             drawRect(ctx, h.x+40, h.y-35, 10, 20, '#7f1d1d');
             // Smoke
             if(frame % 20 === 0) {
                 e.particles.push({
                     type: 'smoke', x: h.x+45, y: h.y-40,
                     speed: -0.5, life: 100
                 });
             }
             // Windows
             ctx.fillStyle = '#facc15'; // Warm light
             drawRect(ctx, h.x+10, h.y+10, 10, 10, '#facc15');
             drawRect(ctx, h.x+40, h.y+10, 10, 10, '#facc15');
        });

        // Snowman
        e.snowmen.forEach(s => {
            ctx.fillStyle = '#fff';
            drawCircle(ctx, s.x, s.y, 12, '#fff'); // Base
            drawCircle(ctx, s.x, s.y-15, 9, '#fff'); // Mid
            drawCircle(ctx, s.x, s.y-25, 6, '#fff'); // Head
            ctx.fillStyle = '#ea580c';
            drawRect(ctx, s.x, s.y-26, 6, 2, '#ea580c'); // Nose
        });

        // Kids Playing
        e.kids.forEach(k => {
             k.x += k.dir * 0.2;
             if(k.x > 500 || k.x < 100) k.dir *= -1;
             ctx.fillStyle = k.color;
             drawRect(ctx, k.x, k.y, 8, 12, k.color); // Body
             drawCircle(ctx, k.x+4, k.y-4, 4, '#fecaca'); // Head
             
             // Throw snowball
             if(Math.random() > 0.98) {
                 e.particles.push({
                     type: 'snowball', x: k.x, y: k.y-5, 
                     vx: k.dir * 2, vy: -2, life: 50
                 });
             }
        });

       // SANTA (Redrawn)
        e.santas.forEach(s => {
             s.x += 1.5;
             if(s.x > GAME_WIDTH + 100) s.x = -100;
             const y = s.y + Math.sin(frame * 0.05) * 20;
             
             // Reindeer (Group of 3)
             for(let i=0; i<3; i++) {
                 const rx = s.x + 60 + i*25;
                 const ry = y + 10 + Math.sin(frame * 0.2 + i)*5;
                 ctx.fillStyle = '#78350f'; // Brown
                 drawRect(ctx, rx, ry, 15, 8, '#78350f'); // Body
                 drawRect(ctx, rx+12, ry-5, 5, 6, '#78350f'); // Head
                 drawRect(ctx, rx+14, ry-8, 2, 4, '#fde047'); // Antlers
                 // Legs running
                 if(frame % 20 < 10) {
                     drawRect(ctx, rx+2, ry+8, 2, 6, '#78350f');
                     drawRect(ctx, rx+12, ry+8, 2, 6, '#78350f');
                 } else {
                     drawRect(ctx, rx, ry+6, 2, 6, '#78350f');
                     drawRect(ctx, rx+10, ry+6, 2, 6, '#78350f');
                 }
                 // Rein line
                 ctx.strokeStyle = '#b45309';
                 ctx.beginPath();
                 ctx.moveTo(s.x+30, y+5);
                 ctx.lineTo(rx, ry+5);
                 ctx.stroke();
             }

             // Sleigh
             ctx.fillStyle = '#991b1b'; // Red
             // Body
             ctx.beginPath();
             ctx.moveTo(s.x, y);
             ctx.lineTo(s.x+40, y);
             ctx.lineTo(s.x+35, y+15);
             ctx.lineTo(s.x+5, y+15);
             ctx.fill();
             // Runner (Gold)
             ctx.strokeStyle = '#facc15';
             ctx.beginPath();
             ctx.moveTo(s.x, y+20);
             ctx.quadraticCurveTo(s.x+45, y+20, s.x+50, y+5);
             ctx.stroke();

             // Santa
             ctx.fillStyle = '#dc2626'; // Red Suit
             drawRect(ctx, s.x+15, y-10, 15, 15, '#dc2626');
             ctx.fillStyle = '#fff'; // Beard/Trim
             drawRect(ctx, s.x+22, y-8, 8, 8, '#fff');
             // Hat
             ctx.fillStyle = '#dc2626';
             drawRect(ctx, s.x+20, y-16, 10, 6, '#dc2626');
             drawRect(ctx, s.x+30, y-12, 4, 4, '#fff'); // Pom pom
        });
        
        // Falling Snow & Smoke & Snowballs
        e.particles = e.particles.filter(p => p.life === undefined || p.life > 0);
        e.particles.forEach(p => {
            if(p.type === 'snow') {
                p.y += p.speed;
                p.x += Math.sin(frame * 0.05 + p.y) * 0.5;
                if(p.y > GAME_HEIGHT) p.y = -5;
                drawPixel(ctx, p.x, p.y, '#fff');
            } else if (p.type === 'smoke') {
                p.y += p.speed;
                p.x += Math.sin(frame*0.1) * 0.5;
                p.life--;
                ctx.globalAlpha = p.life / 100;
                drawCircle(ctx, p.x, p.y, 4, '#cbd5e1');
                ctx.globalAlpha = 1.0;
            } else if (p.type === 'snowball') {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.1;
                p.life--;
                drawCircle(ctx, p.x, p.y, 2, '#fff');
            }
        });
    }

    if (themeName === 'halloween') {
        // Lighter Purple/Blue Background for better visibility
        drawRect(ctx, 0, 0, GAME_WIDTH, GAME_HEIGHT, '#312e81'); 
        
        // Stars
        e.stars.forEach(s => {
             drawPixel(ctx, s.x, s.y, '#ffffff55'); 
        });

        // Ground (Distinct)
        drawRect(ctx, 0, GAME_HEIGHT-30, GAME_WIDTH, 30, '#1e1b4b');

        // WELL
        e.wells.forEach(w => {
            ctx.fillStyle = '#64748b'; // Stone Grey
            drawRect(ctx, w.x, w.y, 40, 30, '#64748b');
            ctx.fillStyle = '#334155'; // Darker inside/shading
            drawRect(ctx, w.x+5, w.y, 30, 5, '#334155'); // Opening shadow
            ctx.beginPath();
            ctx.ellipse(w.x+20, w.y, 20, 5, 0, 0, Math.PI * 2);
            ctx.fill();
        });

        // Ring Girl Demon
        e.demons.forEach(d => {
            // Logic: Rise up from inside the well (y > ground) to outside
            if(d.state === 'rising') {
                if(d.y > GAME_HEIGHT - 60) {
                    d.y -= 0.2; // Slowly rise
                } else {
                    d.state = 'crawling';
                }
            } else {
                // Twitchy
                d.x += (Math.random() - 0.5);
            }

            // White Dress
            ctx.fillStyle = '#e2e8f0';
            drawRect(ctx, d.x, d.y, 14, 30, '#e2e8f0');
            // Long Black Hair covering face
            ctx.fillStyle = '#000';
            drawRect(ctx, d.x, d.y, 14, 20, '#000');
            // Hands
            drawRect(ctx, d.x-2, d.y+10, 2, 10, '#e2e8f0');
            drawRect(ctx, d.x+14, d.y+10, 2, 10, '#e2e8f0');
        });

        // Gravestones
        e.gravestones.forEach(g => {
             ctx.fillStyle = '#64748b';
             if(g.type === 'round') {
                 // Round top stone
                 ctx.beginPath();
                 ctx.arc(g.x + g.w/2, g.y, g.w/2, Math.PI, 0);
                 ctx.lineTo(g.x + g.w, g.y + g.h);
                 ctx.lineTo(g.x, g.y + g.h);
                 ctx.fill();
             } else {
                 // Cross type
                 drawRect(ctx, g.x + g.w/2 - 3, g.y - 10, 6, g.h + 10, '#64748b');
                 drawRect(ctx, g.x, g.y + 5, g.w, 6, '#64748b');
             }
        });

        // Witch
        e.witches.forEach(w => {
            w.x -= w.speed;
            if(w.x < -50) w.x = GAME_WIDTH + 50;
            const y = w.y + Math.sin(frame * 0.1) * 10;
            // Broom
            ctx.fillStyle = '#a16207';
            drawRect(ctx, w.x, y+10, 30, 2, '#a16207');
            // Witch Body
            ctx.fillStyle = '#000';
            drawRect(ctx, w.x+10, y, 8, 12, '#000');
            // Hat
            ctx.beginPath();
            ctx.moveTo(w.x+10, y);
            ctx.lineTo(w.x+18, y);
            ctx.lineTo(w.x+14, y-10);
            ctx.fill();
        });

        // Monsters (Frankenstein & Coffin)
        e.monsters.forEach(m => {
            if(m.type === 'frankenstein') {
                // Body
                ctx.fillStyle = '#3f3f46';
                drawRect(ctx, m.x, m.y, 20, 40, '#3f3f46');
                // Head
                ctx.fillStyle = '#4ade80'; // Green
                drawRect(ctx, m.x+2, m.y-15, 16, 15, '#4ade80');
                // Bolts
                ctx.fillStyle = '#9ca3af';
                drawRect(ctx, m.x, m.y-8, 2, 4, '#9ca3af');
                drawRect(ctx, m.x+18, m.y-8, 2, 4, '#9ca3af');
            } else if (m.type === 'coffin') {
                ctx.fillStyle = '#57534e';
                // Coffin Shape
                ctx.beginPath();
                ctx.moveTo(m.x+10, m.y-30);
                ctx.lineTo(m.x+20, m.y-10);
                ctx.lineTo(m.x+15, m.y+20);
                ctx.lineTo(m.x+5, m.y+20);
                ctx.lineTo(m.x, m.y-10);
                ctx.fill();
                // Cross
                ctx.fillStyle = '#1c1917';
                drawRect(ctx, m.x+8, m.y-15, 4, 15, '#1c1917');
                drawRect(ctx, m.x+4, m.y-10, 12, 4, '#1c1917');
            }
        });

        // Rising Spirits (Replaced ghosts)
        e.ghosts.forEach(g => {
             const y = g.y - ((frame + g.offset) % 100);
             ctx.globalAlpha = 1.0 - (((frame + g.offset) % 100) / 100);
             ctx.fillStyle = '#a5f3fc';
             drawCircle(ctx, g.x, y, 5, '#a5f3fc');
             drawRect(ctx, g.x-5, y, 10, 10, '#a5f3fc');
             ctx.globalAlpha = 1.0;
        });

        // Bats
        e.bats.forEach(b => {
             b.x += b.speed;
             b.y += Math.sin(frame * 0.2 + b.off) * 2;
             if(b.x > GAME_WIDTH + 20) b.x = -20;
             ctx.fillStyle = '#000';
             // Simple Bat Shape 'M'
             drawRect(ctx, b.x, b.y, 4, 4, '#000'); // Body
             const wingFlap = Math.sin(frame * 0.5) * 4;
             drawRect(ctx, b.x-4, b.y-wingFlap, 4, 2, '#000');
             drawRect(ctx, b.x+4, b.y-wingFlap, 4, 2, '#000');
        });

        // Fog Particles (Less dense)
        e.particles.forEach(p => {
             if(p.type === 'fog') {
                 p.x -= p.speed;
                 if(p.x < -50) p.x = GAME_WIDTH + 50;
                 ctx.fillStyle = '#a78bfa'; // Lighter fog
                 ctx.globalAlpha = 0.1; // More transparent
                 drawRect(ctx, p.x, p.y, p.size * 2, p.size, '#a78bfa');
                 ctx.globalAlpha = 1.0;
             }
        });
    }

    if (themeName === 'space') {
         drawRect(ctx, 0, 0, GAME_WIDTH, GAME_HEIGHT, '#000000');
         
         // Galaxy Spiral Background
         const cx = GAME_WIDTH/2;
         const cy = GAME_HEIGHT/2;
         e.galaxyStars.forEach(s => {
             s.angle += s.speed;
             const x = cx + Math.cos(s.angle) * s.dist;
             const y = cy + Math.sin(s.angle) * (s.dist * 0.4); // Flattened spiral
             drawPixel(ctx, x, y, s.color);
         });

         // Stars
         e.stars.forEach(s => {
             const blink = Math.sin(frame * s.blinkSpeed);
             const c = blink > 0.8 ? s.color : (blink > 0 ? '#ffffff55' : '#000');
             drawRect(ctx, s.x, s.y, s.size, s.size, c);
         });

         // Planets
         e.planets.forEach(p => {
             drawCircle(ctx, p.x, p.y, p.r, p.color);
             // Ring for gas giant
             if(p.type === 'gas_giant') {
                 ctx.strokeStyle = '#fcd34d';
                 ctx.lineWidth = 4;
                 ctx.beginPath();
                 ctx.ellipse(p.x, p.y, p.r + 15, p.r * 0.3, -0.2, 0, Math.PI * 2);
                 ctx.stroke();
             }
             // Continents for earth
             if(p.type === 'earth') {
                 ctx.fillStyle = '#16a34a';
                 drawCircle(ctx, p.x-10, p.y-5, 8, '#16a34a');
                 drawCircle(ctx, p.x+5, p.y+10, 6, '#16a34a');
             }
             // Craters for moon
             if(p.type === 'moon') {
                 ctx.fillStyle = '#6b7280';
                 drawCircle(ctx, p.x-2, p.y-2, 2, '#6b7280');
             }
         });

         // UFO
         e.ufos.forEach(u => {
             u.x += u.speed;
             if(u.x > GAME_WIDTH + 50) u.x = -50;
             const y = u.y + Math.sin(frame * 0.1) * 10;
             
             // Dome
             ctx.fillStyle = '#bae6fd';
             drawCircle(ctx, u.x, y-5, 8, '#bae6fd');
             // Disc
             ctx.fillStyle = '#9ca3af';
             ctx.beginPath();
             ctx.ellipse(u.x, y, 20, 6, 0, 0, Math.PI * 2);
             ctx.fill();
             // Lights
             if(frame % 10 < 5) {
                ctx.fillStyle = '#ef4444';
                drawCircle(ctx, u.x-10, y, 2, '#ef4444');
                drawCircle(ctx, u.x+10, y, 2, '#ef4444');
                drawCircle(ctx, u.x, y+2, 2, '#ef4444');
             }
         });
    }

    if (themeName === 'birthday') {
        // Room Background
        drawRect(ctx, 0, 0, GAME_WIDTH, GAME_HEIGHT, '#fdf2f8');
        // Floor
        drawRect(ctx, 0, GAME_HEIGHT - 40, GAME_WIDTH, 40, '#fbcfe8');
        // Striped Wallpaper
        ctx.fillStyle = '#fce7f3';
        for(let i=0; i<GAME_WIDTH; i+=40) {
             drawRect(ctx, i, 0, 20, GAME_HEIGHT-40, '#fce7f3');
        }
        
        // Bunting Flags
        for(let i=0; i<GAME_WIDTH; i+=30) {
             ctx.fillStyle = i % 60 === 0 ? '#60a5fa' : '#facc15';
             ctx.beginPath();
             ctx.moveTo(i, 20);
             ctx.lineTo(i+30, 20);
             ctx.lineTo(i+15, 40);
             ctx.fill();
        }

        // CAKE (SMALLER)
        const cx = GAME_WIDTH/2;
        const cy = GAME_HEIGHT - 50;
        // Table
        drawRect(ctx, cx - 20, cy + 10, 40, 30, '#78350f');
        // Cake Base
        drawRect(ctx, cx - 12, cy, 24, 10, '#fbcfe8');
        // Frosting
        drawRect(ctx, cx - 14, cy - 5, 28, 5, '#f472b6');
        // Candles
        drawRect(ctx, cx - 5, cy - 12, 2, 7, '#60a5fa');
        drawRect(ctx, cx + 5, cy - 12, 2, 7, '#60a5fa');
        // Flames
        if(frame % 10 < 5) {
            drawCircle(ctx, cx - 4, cy - 14, 2, '#fbbf24');
            drawCircle(ctx, cx + 6, cy - 14, 2, '#fbbf24');
        }

        // Crowd (Better Kids)
        e.partyGuests.forEach(g => {
            const jump = Math.sin(frame * 0.2 + g.x) * 5;
            const y = g.y - jump;
            
            ctx.fillStyle = g.color;
            // Body
            drawRect(ctx, g.x, y, 12, 18, g.color);
            // Head
            ctx.fillStyle = '#fcd34d';
            drawRect(ctx, g.x+2, y - 8, 8, 8, '#fcd34d'); 
            // Legs
            ctx.fillStyle = '#1e293b'; // Pants
            drawRect(ctx, g.x+2, y + 18, 3, 6, '#1e293b');
            drawRect(ctx, g.x+7, y + 18, 3, 6, '#1e293b');
            // Arms
            ctx.fillStyle = g.color; // Sleeves
            drawRect(ctx, g.x-3, y, 3, 10, g.color);
            drawRect(ctx, g.x+12, y, 3, 10, g.color);
            
            // Party Hat
            ctx.fillStyle = g.color;
            ctx.beginPath();
            ctx.moveTo(g.x+2, y - 8);
            ctx.lineTo(g.x+10, y - 8);
            ctx.lineTo(g.x+6, y - 16);
            ctx.fill();
        });

        // Balloons
        e.balloons.forEach(b => {
            b.y -= b.speed;
            if(b.y < -50) b.y = GAME_HEIGHT + 50;
            const x = b.x + Math.sin(frame * 0.1 + b.wobble) * 5;
            
            ctx.fillStyle = b.color;
            drawCircle(ctx, x, b.y, 10, b.color); // Balloon
            
            // String
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(x, b.y+10);
            ctx.lineTo(x, b.y+30);
            ctx.stroke();
        });
    }
    
    if (themeName === 'underwater') {
        // Ocean Layers
        const grd = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
        grd.addColorStop(0, '#0284c7'); // Top light
        grd.addColorStop(0.5, '#0369a1'); // Mid
        grd.addColorStop(1, '#0c4a6e'); // Deep
        ctx.fillStyle = grd;
        ctx.fillRect(0,0,GAME_WIDTH, GAME_HEIGHT);

        // SHARK SHADOW (Background)
        e.sharks.forEach(s => {
            s.x += s.speed * s.dir;
            if (s.x > GAME_WIDTH + 150) s.x = -150;
            
            // Shark Silhouette (Dark Blue/Black)
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            // Nose
            ctx.moveTo(s.x, s.y);
            // Top body to fin
            ctx.quadraticCurveTo(s.x-20, s.y-10, s.x-40, s.y-15); // Dorsal start
            ctx.lineTo(s.x-50, s.y-35); // Dorsal Top
            ctx.lineTo(s.x-55, s.y-15); // Dorsal End
            // Back to tail
            ctx.lineTo(s.x-100, s.y-5);
            // Tail Top
            ctx.lineTo(s.x-120, s.y-25);
            ctx.lineTo(s.x-115, s.y);
            // Tail Bot
            ctx.lineTo(s.x-120, s.y+20);
            ctx.lineTo(s.x-100, s.y+5);
            // Belly
            ctx.quadraticCurveTo(s.x-40, s.y+15, s.x, s.y);
            ctx.fill();
        });

        // Sand
        ctx.fillStyle = '#fcd34d';
        drawRect(ctx, 0, GAME_HEIGHT-20, GAME_WIDTH, 20, '#fcd34d');
        
        // Bubbles
        ctx.strokeStyle = '#ffffff55';
        e.particles.forEach(p => {
             p.y -= p.speed;
             if(p.y < 0) p.y = GAME_HEIGHT;
             drawCircle(ctx, p.x, p.y, 2, '#fff'); 
        });

        // Sea Creatures
        e.seaCreatures.forEach(c => {
             if(c.type === 'crab') {
                 c.x += c.dir * 0.2;
                 if(c.x > 450 || c.x < 250) c.dir *= -1;
                 ctx.fillStyle = c.color;
                 drawRect(ctx, c.x, c.y, 15, 8, c.color); // Body
                 // Claws
                 drawRect(ctx, c.x-4, c.y-4, 4, 4, c.color);
                 drawRect(ctx, c.x+15, c.y-4, 4, 4, c.color);
                 // Legs
                 drawRect(ctx, c.x, c.y+8, 2, 4, c.color);
                 drawRect(ctx, c.x+13, c.y+8, 2, 4, c.color);
             } else if (c.type === 'jellyfish') {
                 const y = c.y + Math.sin(frame * 0.05) * 10;
                 ctx.fillStyle = c.color;
                 // Dome
                 ctx.beginPath();
                 ctx.arc(c.x, y, 10, Math.PI, 0);
                 ctx.fill();
                 // Tentacles
                 ctx.strokeStyle = c.color;
                 for(let i=0; i<3; i++) {
                     ctx.beginPath();
                     ctx.moveTo(c.x - 6 + i*6, y);
                     ctx.lineTo(c.x - 6 + i*6, y+15);
                     ctx.stroke();
                 }
             } else if (c.type === 'octopus') {
                 const y = c.y + Math.sin(frame * 0.05) * 5;
                 ctx.fillStyle = c.color;
                 drawCircle(ctx, c.x, y, 12, c.color); // Head
                 // Legs
                 for(let i=0; i<4; i++) {
                     const legWiggle = Math.sin(frame * 0.1 + i) * 5;
                     drawRect(ctx, c.x - 10 + i*6, y+10, 4, 15+legWiggle, c.color);
                 }
             }
        });

        // Fish
        e.fish.forEach(f => {
            f.x += f.speed * f.dir;
            if(f.x > GAME_WIDTH + 20) f.x = -20;
            if(f.x < -20) f.x = GAME_WIDTH + 20;

            ctx.fillStyle = f.color;
            ctx.beginPath();
            if(f.dir === 1) {
                ctx.moveTo(f.x, f.y);
                ctx.lineTo(f.x-10, f.y-5);
                ctx.lineTo(f.x-10, f.y+5);
            } else {
                ctx.moveTo(f.x, f.y);
                ctx.lineTo(f.x+10, f.y-5);
                ctx.lineTo(f.x+10, f.y+5);
            }
            ctx.fill();
        });
        
        // Seaweed
        ctx.fillStyle = '#166534';
        for(let i=0; i<GAME_WIDTH; i+=40) {
            const sway = Math.sin(frame * 0.05 + i) * 10;
            ctx.beginPath();
            ctx.moveTo(i, GAME_HEIGHT);
            ctx.quadraticCurveTo(i+sway, GAME_HEIGHT-40, i, GAME_HEIGHT-80);
            ctx.lineTo(i+5, GAME_HEIGHT-80);
            ctx.quadraticCurveTo(i+sway+5, GAME_HEIGHT-40, i+5, GAME_HEIGHT);
            ctx.fill();
        }
    }
    
    if (themeName === 'zen') {
        drawRect(ctx, 0, 0, GAME_WIDTH, GAME_HEIGHT, '#fff1f2');
        
        // MOUNT FUJI BACKGROUND
        const fujiX = GAME_WIDTH/2;
        const fujiY = GAME_HEIGHT;
        ctx.fillStyle = '#bae6fd'; // Sky blue tint for mountain
        ctx.beginPath();
        ctx.moveTo(0, GAME_HEIGHT);
        ctx.lineTo(fujiX, 100); // Peak
        ctx.lineTo(GAME_WIDTH, GAME_HEIGHT);
        ctx.fill();
        // Snow Cap
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.moveTo(fujiX - 40, 150);
        ctx.lineTo(fujiX, 100);
        ctx.lineTo(fujiX + 40, 150);
        // Jagged snow line
        ctx.lineTo(fujiX + 20, 140);
        ctx.lineTo(fujiX, 160);
        ctx.lineTo(fujiX - 20, 140);
        ctx.fill();

        // Red Sun
        drawCircle(ctx, GAME_WIDTH/2, 80, 40, '#be185d');

        // Torii Gate
        e.torii.forEach(t => {
             ctx.fillStyle = '#be123c';
             drawRect(ctx, t.x-40, t.y, 10, 60, '#be123c'); // Left post
             drawRect(ctx, t.x+30, t.y, 10, 60, '#be123c'); // Right post
             drawRect(ctx, t.x-50, t.y+10, 100, 8, '#be123c'); // Top bar lower
             drawRect(ctx, t.x-55, t.y-5, 110, 10, '#be123c'); // Top bar upper (curved illusion)
             drawRect(ctx, t.x-5, t.y-15, 10, 15, '#be123c'); // Center support
        });

        // Lanterns
        e.lanterns.forEach(l => {
             // String
             ctx.strokeStyle = '#000';
             ctx.beginPath();
             ctx.moveTo(l.x, 0);
             ctx.lineTo(l.x, l.y);
             ctx.stroke();
             // Lantern
             ctx.fillStyle = '#ef4444'; // Red
             drawRect(ctx, l.x-10, l.y, 20, 25, '#ef4444');
             ctx.fillStyle = '#facc15'; // Yellow light
             drawRect(ctx, l.x-6, l.y+5, 12, 15, '#facc15');
        });
        
        // Pagoda (Side)
        const px = GAME_WIDTH - 80; const py = GAME_HEIGHT - 20;
        ctx.fillStyle = '#1c1917';
        drawRect(ctx, px, py-80, 40, 80, '#1c1917');
        const drawRoof = (y, w) => {
            ctx.fillStyle = '#451a03';
            ctx.beginPath();
            ctx.moveTo(px + 20 - w/2, y);
            ctx.lineTo(px + 20 + w/2, y);
            ctx.lineTo(px + 20, y - 10);
            ctx.fill();
        };
        drawRoof(py-20, 80);
        drawRoof(py-50, 60);
        drawRoof(py-80, 40);

        // Petals
        ctx.fillStyle = '#fbcfe8';
        e.particles.forEach(p => {
            p.y += p.speed;
            p.x += Math.sin(frame * 0.05 + p.y) * 1;
            if(p.y > GAME_HEIGHT) p.y = -5;
            drawPixel(ctx, p.x, p.y, '#fbcfe8');
        });
    }

    if (themeName === 'cyberpunk') {
         // Blade Runner 2049 Vibe (Smoggy Orange/Dark)
         const grd = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
         grd.addColorStop(0, '#0f172a'); // Dark Slate Top
         grd.addColorStop(0.5, '#7c2d12'); // Orange Smog Mid
         grd.addColorStop(1, '#020617'); // Black Bottom
         ctx.fillStyle = grd;
         ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
         
         // Giant Hologram (Joi)
         if(e.hologram) {
             const hover = Math.sin(frame * 0.05) * 5;
             const hy = e.hologram.y + hover;
             
             ctx.globalAlpha = 0.5;
             // Hair
             ctx.fillStyle = '#3b82f6'; // Blue Hair
             drawRect(ctx, e.hologram.x + 35, hy - 45, 30, 80, '#3b82f6');
             
             // Body (Transparent Pink/Skin)
             ctx.fillStyle = '#fbcfe8'; 
             drawRect(ctx, e.hologram.x + 10, hy - 40, 40, 40, '#fbcfe8'); // Head
             drawRect(ctx, e.hologram.x, hy, 60, 120, '#fbcfe8'); // Body
             
             // Dress (Yellowish/Transparent)
             ctx.fillStyle = '#fde047';
             ctx.globalAlpha = 0.2;
             drawRect(ctx, e.hologram.x-5, hy, 70, 120, '#fde047');
             
             ctx.globalAlpha = 1.0;

             // Speech Bubble
             ctx.fillStyle = '#fff';
             drawRect(ctx, e.hologram.x + 80, hy - 60, 140, 30, '#fff');
             ctx.font = '10px monospace';
             ctx.fillStyle = '#000';
             ctx.fillText("You look lonely", e.hologram.x + 90, hy - 45);
             ctx.fillText("I can fix that", e.hologram.x + 90, hy - 35);
             // Bubble tail
             ctx.beginPath();
             ctx.moveTo(e.hologram.x + 80, hy - 45);
             ctx.lineTo(e.hologram.x + 60, hy - 35);
             ctx.lineTo(e.hologram.x + 80, hy - 35);
             ctx.fillStyle = '#fff';
             ctx.fill();
         }

         // Flying Cars
         e.flyingCars.forEach(c => {
             c.x += c.speed;
             if(c.x > GAME_WIDTH + 50) c.x = -50;
             if(c.x < -50) c.x = GAME_WIDTH + 50;
             ctx.shadowBlur = 10;
             ctx.shadowColor = c.color;
             ctx.fillStyle = c.color;
             drawRect(ctx, c.x, c.y, 20, 5, c.color);
             ctx.shadowBlur = 0;
         });

         // Bridge / Walkway
         ctx.fillStyle = '#1e293b';
         drawRect(ctx, 0, GAME_HEIGHT - 40, GAME_WIDTH, 40, '#1e293b'); // Railing base
         
         // Ryan (Lonely figure)
         if(e.ryan) {
             // Coat (Brown/Grey)
             ctx.fillStyle = '#451a03'; 
             drawRect(ctx, e.ryan.x, e.ryan.y, 12, 22, '#451a03'); // Torso
             // Legs
             ctx.fillStyle = '#1c1917';
             drawRect(ctx, e.ryan.x+10, e.ryan.y+12, 15, 10, '#1c1917'); // Legs extended
             // Head
             ctx.fillStyle = '#fcd34d'; // Skin
             drawCircle(ctx, e.ryan.x+6, e.ryan.y-4, 6, '#fcd34d'); 
             // Hair
             ctx.fillStyle = '#ca8a04';
             drawRect(ctx, e.ryan.x, e.ryan.y-9, 12, 4, '#ca8a04');
         }

         // Rain
         ctx.fillStyle = '#94a3b8';
         ctx.globalAlpha = 0.4;
         e.particles.forEach(p => {
             p.y += p.speed;
             p.x -= 2; // Wind
             if(p.y > GAME_HEIGHT) {
                 p.y = -10;
                 p.x = Math.random() * GAME_WIDTH + 50;
             }
             drawRect(ctx, p.x, p.y, 1, 6, '#94a3b8');
         });
         ctx.globalAlpha = 1.0;

         // Neon Signs glow
         ctx.shadowBlur = 10;
         ctx.shadowColor = '#d946ef';
         drawRect(ctx, GAME_WIDTH - 100, 100, 80, 20, '#d946ef');
         ctx.shadowBlur = 0;
    }
  };

  const animate = () => {
    const canvas = canvasRef.current;
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    // Clear
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Route Render Logic
    const mode = modeRef.current;
    if (mode === 'dark_fantasy') renderDarkFantasy(ctx, frameRef.current);
    else if (mode === 'new_year') renderCity(ctx, frameRef.current);
    else if (mode === 'nature') renderNature(ctx, frameRef.current);
    else renderGenericTheme(ctx, frameRef.current, mode);

    frameRef.current++;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    modeRef.current = activeMode;
    initMode(activeMode);
  }, [activeMode]);

  // Battery API Effect
  useEffect(() => {
      let batteryRef = null;
      const updateBattery = (battery) => {
          setBatteryLevel(Math.floor(battery.level * 100));
      };
      
      if ('getBattery' in navigator) {
          navigator.getBattery().then(battery => {
              batteryRef = battery;
              updateBattery(battery);
              battery.addEventListener('levelchange', () => updateBattery(battery));
          });
      }
      return () => {
          if(batteryRef) batteryRef.removeEventListener('levelchange', () => updateBattery(batteryRef));
      }
  }, []);

  useEffect(() => {
    if(canvasRef.current) {
      canvasRef.current.width = GAME_WIDTH;
      canvasRef.current.height = GAME_HEIGHT;
    }
    requestRef.current = requestAnimationFrame(animate);
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => { cancelAnimationFrame(requestRef.current); clearInterval(timer); };
  }, []);

  const currentTheme = modes[activeMode];

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden flex flex-col items-center justify-center font-sans select-none">
      
      {/* CANVAS LAYER */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ imageRendering: 'pixelated' }}
      />

      {/* VIGNETTE & SCANLINES */}
      <div className="absolute inset-0 z-10 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]"></div>
      <div className="absolute inset-0 z-10 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px]"></div>

      {/* UI LAYER */}
      <div className="relative z-20 w-full h-full max-w-7xl mx-auto p-6 md:p-12 flex flex-col justify-between text-white mix-blend-difference">
        
        {/* TOP BAR */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none opacity-90">
              {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </h1>
            <div className="flex items-center gap-3 text-sm tracking-widest uppercase opacity-70">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              {time.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
            </div>
          </div>
          
          <div className="hidden md:flex flex-col items-end gap-2 text-xs font-mono opacity-60">
             <div className="flex items-center gap-2"><Wifi size={14}/> ONLINE</div>
             <div className="flex items-center gap-2"><Battery size={14}/> {batteryLevel}%</div>
             <div className="flex items-center gap-2"><Disc size={14}/> {currentTheme.title}</div>
          </div>
        </div>

        {/* CENTER TITLE */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
            <h2 
                key={activeMode}
                className="text-9xl font-black tracking-tighter opacity-10 animate-pulse scale-150 transform transition-all duration-1000"
            >
                {currentTheme.title}
            </h2>
        </div>

        {/* BOTTOM CONTROLS */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="text-sm font-bold tracking-widest uppercase text-yellow-100/80 border-l-2 border-yellow-100/50 pl-4">
                {currentTheme.quote}
            </div>
            <div className="text-xs font-mono opacity-50">
                SCENE: {activeMode.toUpperCase()} // FRM: {frameRef.current}
            </div>
          </div>

          {/* SCROLLABLE THEME SELECTOR */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/50 z-10 pointer-events-none rounded-xl"></div>
            <div className="flex overflow-x-auto gap-4 pb-4 pt-2 snap-x scrollbar-hide px-4 mask-image-gradient">
                {Object.entries(modes).map(([key, m]) => (
                <button
                    key={key}
                    onClick={() => setActiveMode(key)}
                    className={`
                    snap-center shrink-0 px-6 py-4 rounded-xl border border-white/10 backdrop-blur-md transition-all duration-300
                    flex flex-col items-center gap-2 min-w-[100px]
                    ${activeMode === key 
                        ? 'bg-white/20 scale-110 shadow-[0_0_30px_rgba(255,255,255,0.2)] border-white/40' 
                        : 'bg-white/5 hover:bg-white/10 hover:scale-105 opacity-60 hover:opacity-100'}
                    `}
                >
                    <span className="text-xs font-bold tracking-widest">{m.title}</span>
                    <div className="w-full h-1 rounded-full" style={{ backgroundColor: m.colors.accent }}></div>
                </button>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PixelAtmosphereEngine;