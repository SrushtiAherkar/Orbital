document.addEventListener('DOMContentLoaded', () => {

    // =============================================
    // Mobile Navigation Toggle
    // =============================================
    const navToggle = document.getElementById('navToggle');
    const headerNav = document.getElementById('headerNav');
    const navLinks = document.querySelectorAll('.header-nav a');

    if (navToggle && headerNav) {
        navToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            navToggle.classList.toggle('active');
            headerNav.classList.toggle('active');
            document.body.classList.toggle('no-scroll');
        });

        // Close menu when a link is clicked
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('active');
                headerNav.classList.remove('active');
                document.body.classList.remove('no-scroll');
            });
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (headerNav.classList.contains('active') && !headerNav.contains(e.target) && !navToggle.contains(e.target)) {
                navToggle.classList.remove('active');
                headerNav.classList.remove('active');
                document.body.classList.remove('no-scroll');
            }
        });
    }

    // =============================================
    // Hero Title Typing Animation
    // =============================================
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        const originalContent = heroTitle.innerHTML.trim();
        heroTitle.innerHTML = ''; // Start empty
        heroTitle.style.opacity = '1';

        // Create cursor
        const cursor = document.createElement('span');
        cursor.className = 'typing-cursor';
        heroTitle.appendChild(cursor);

        let charIndex = 0;
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = originalContent;

        // Flatten nodes but keep tag structure
        const nodes = [];
        function walk(node, parentPath = []) {
            node.childNodes.forEach(child => {
                if (child.nodeType === Node.TEXT_NODE) {
                    const text = child.textContent;
                    for (let i = 0; i < text.length; i++) {
                        nodes.push({
                            type: 'char',
                            value: text[i],
                            tags: [...parentPath]
                        });
                    }
                } else if (child.nodeType === Node.ELEMENT_NODE) {
                    if (child.tagName === 'BR') {
                        nodes.push({ type: 'tag', value: '<br>', tags: [...parentPath] });
                    } else {
                        walk(child, [...parentPath, { tag: child.tagName, class: child.className }]);
                    }
                }
            });
        }
        walk(tempDiv);

        function type() {
            if (charIndex < nodes.length) {
                const node = nodes[charIndex];
                let target = heroTitle;

                // Remove cursor temporarily to add content
                cursor.remove();

                // Reconstruct tag path if needed
                node.tags.forEach(t => {
                    let lastChild = target.lastElementChild;
                    if (!lastChild || lastChild.tagName !== t.tag || (t.class && lastChild.className !== t.class)) {
                        const el = document.createElement(t.tag);
                        if (t.class) el.className = t.class;
                        target.appendChild(el);
                        target = el;
                    } else {
                        target = lastChild;
                    }
                });

                if (node.type === 'char') {
                    target.appendChild(document.createTextNode(node.value));
                } else {
                    target.innerHTML += node.value;
                }

                // Put cursor back
                heroTitle.appendChild(cursor);

                charIndex++;
                const delay = node.value === ' ' ? 50 : (Math.random() * 40 + 60);
                setTimeout(type, delay);
            }
        }

        // Start typing after a short initial delay
        setTimeout(type, 800);
    }


    // =============================================
    // 0. Full-Page Starfield Background (3-layer parallax)
    // =============================================
    const starCanvas = document.getElementById('starfield-canvas');
    if (starCanvas) {
        const sCtx = starCanvas.getContext('2d');
        let sW, sH;
        let starMouse = { x: -9999, y: -9999 };

        function starResize() {
            sW = starCanvas.width = window.innerWidth;
            sH = starCanvas.height = window.innerHeight;
        }
        starResize();
        window.addEventListener('resize', starResize);

        // Track mouse globally for repulsion
        document.addEventListener('mousemove', (e) => {
            starMouse.x = e.clientX;
            starMouse.y = e.clientY;
        });
        document.addEventListener('mouseleave', () => {
            starMouse.x = -9999;
            starMouse.y = -9999;
        });

        // 3 depth layers: far (small, slow), mid, near (large, fast)
        const isMobileDevice = window.matchMedia('(max-width: 768px)').matches;
        const LAYER_DEFS = [
            { count: isMobileDevice ? 70 : 180, rMin: 0.2, rMax: 0.8, alphaMin: 0.10, alphaMax: 0.30, speed: 0.5, repelStrength: 55, spring: 0.012, damping: 0.92, haloMul: 4, color: [165, 160, 255] },
            { count: isMobileDevice ? 45 : 120, rMin: 0.5, rMax: 1.3, alphaMin: 0.18, alphaMax: 0.48, speed: 1.0, repelStrength: 90, spring: 0.018, damping: 0.90, haloMul: 5, color: [210, 205, 255] },
            { count: isMobileDevice ? 25 : 65, rMin: 1.0, rMax: 2.0, alphaMin: 0.30, alphaMax: 0.65, speed: 1.6, repelStrength: 130, spring: 0.025, damping: 0.88, haloMul: 6, color: [240, 235, 255] },
        ];
        const STAR_REPEL_RADIUS = 200;

        // Pre-render star sprites for each layer to avoid expensive gradients in loop
        const starSprites = LAYER_DEFS.map((layer, li) => {
            const canvas = document.createElement('canvas');
            const r = layer.rMax * layer.haloMul;
            canvas.width = r * 2 + 4;
            canvas.height = r * 2 + 4;
            const ctx = canvas.getContext('2d');
            const center = canvas.width / 2;

            // Halo
            const grd = ctx.createRadialGradient(center, center, 0, center, center, layer.rMax * layer.haloMul);
            const [cr, cg, cb] = layer.color;
            grd.addColorStop(0, `rgba(${cr},${cg},${cb},0.65)`);
            grd.addColorStop(0.45, `rgba(${cr},${cg},${cb},0.2)`);
            grd.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
            ctx.fillStyle = grd;
            ctx.beginPath();
            ctx.arc(center, center, layer.rMax * layer.haloMul, 0, Math.PI * 2);
            ctx.fill();

            // Core
            ctx.fillStyle = `rgb(${Math.min(cr + 30, 255)},${Math.min(cg + 30, 255)},255)`;
            ctx.shadowColor = `rgba(${cr},${cg},${cb},0.9)`;
            ctx.shadowBlur = layer.rMax * 4;
            ctx.beginPath();
            ctx.arc(center, center, layer.rMax, 0, Math.PI * 2);
            ctx.fill();

            return { canvas, r: layer.rMax * layer.haloMul };
        });

        const allStars = [];
        LAYER_DEFS.forEach((layer, li) => {
            for (let i = 0; i < layer.count; i++) {
                allStars.push({
                    layer: li,
                    ox: Math.random(), oy: Math.random(),
                    x: 0, y: 0,
                    vx: 0, vy: 0,
                    r: Math.random() * (layer.rMax - layer.rMin) + layer.rMin,
                    alpha: Math.random() * (layer.alphaMax - layer.alphaMin) + layer.alphaMin,
                    twinkleSpeed: Math.random() * 0.012 + 0.003,
                    twinkleOffset: Math.random() * Math.PI * 2,
                    driftAngle: Math.random() * Math.PI * 2,
                    driftSpeed: (Math.random() * 0.5 + 0.3) * layer.speed,
                });
            }
        });
        // Init pixel positions
        allStars.forEach(s => { s.x = s.ox * sW; s.y = s.oy * sH; });
        window.addEventListener('resize', () => {
            allStars.forEach(s => { s.x = s.ox * sW; s.y = s.oy * sH; s.vx = 0; s.vy = 0; });
        });

        let starStart = null;
        function renderStars(ts) {
            if (!starStart) starStart = ts;
            const t = (ts - starStart) * 0.001;

            sCtx.clearRect(0, 0, sW, sH);

            allStars.forEach(s => {
                const layer = LAYER_DEFS[s.layer];

                const driftAmt = 30 * layer.speed;
                const originX = s.ox * sW
                    + Math.sin(t * s.driftSpeed * 0.35 + s.twinkleOffset) * driftAmt
                    + Math.cos(t * s.driftSpeed * 0.20 + s.driftAngle) * driftAmt * 0.7;
                const originY = s.oy * sH
                    + Math.cos(t * s.driftSpeed * 0.28 + s.twinkleOffset) * driftAmt
                    + Math.sin(t * s.driftSpeed * 0.15 + s.driftAngle) * driftAmt * 0.6;

                let targetX = originX;
                let targetY = originY;

                const dx = s.x - starMouse.x;
                const dy = s.y - starMouse.y;
                const distSq = dx * dx + dy * dy;

                if (distSq < STAR_REPEL_RADIUS * STAR_REPEL_RADIUS && distSq > 0) {
                    const dist = Math.sqrt(distSq);
                    const ease = (1 - dist / STAR_REPEL_RADIUS);
                    const push = ease * ease * layer.repelStrength;
                    targetX += (dx / dist) * push;
                    targetY += (dy / dist) * push;
                }

                const ax = (targetX - s.x) * layer.spring;
                const ay = (targetY - s.y) * layer.spring;
                s.vx = (s.vx + ax) * layer.damping;
                s.vy = (s.vy + ay) * layer.damping;
                s.x += s.vx;
                s.y += s.vy;

                const tw = 0.5 + 0.5 * Math.sin(t * s.twinkleSpeed * 55 + s.twinkleOffset);
                const a = s.alpha * (0.45 + 0.55 * tw);

                const sprite = starSprites[s.layer];
                const drawSize = sprite.r * 2 * (s.r / LAYER_DEFS[s.layer].rMax);

                sCtx.globalAlpha = a;
                sCtx.drawImage(
                    sprite.canvas,
                    s.x - drawSize / 2,
                    s.y - drawSize / 2,
                    drawSize,
                    drawSize
                );
            });
            sCtx.globalAlpha = 1.0;
            requestAnimationFrame(renderStars);
        }
        requestAnimationFrame(renderStars);
    }

    // =============================================
    // 1. Hero Canvas Animation
    // =============================================
    const canvas = document.getElementById('hero-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let W, H, cx, cy, baseDim;
        let mouse = { x: 0, y: 0 };
        let mousePos = { x: -9999, y: -9999 };
        let parallax = { x: 0, y: 0 };
        let animId;
        let isMobile = window.matchMedia('(max-width: 768px)').matches;

        function resize() {
            W = canvas.width = canvas.offsetWidth;
            H = canvas.height = canvas.offsetHeight;
            cx = W / 2;
            cy = H / 2;
            // Base dimension for scaling (the 450px container)
            baseDim = canvas.parentElement.offsetWidth || 450;
        }
        resize();
        window.addEventListener('resize', () => {
            resize();
            isMobile = window.matchMedia('(max-width: 768px)').matches;
            particles.forEach(p => { p.x = p.ox * W; p.y = p.oy * H; p.vx = 0; p.vy = 0; });
        });

        // Mouse parallax + cursor tracking
        const heroEl = document.getElementById('hero');
        heroEl.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = (e.clientX - rect.left - W / 2) / W;
            mouse.y = (e.clientY - rect.top - H / 2) / H;
            if (!isMobile) {
                mousePos.x = e.clientX - rect.left;
                mousePos.y = e.clientY - rect.top;
            }
        });
        heroEl.addEventListener('mouseleave', () => {
            mousePos.x = -9999; mousePos.y = -9999;
            mouse.x = 0; mouse.y = 0;
        });

        // ---- Particles ----
        const PARTICLE_COUNT = isMobile ? 120 : 0;
        const REPEL_RADIUS = 115;
        const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
            ox: Math.random(), oy: Math.random(), // origin (normalized)
            x: 0, y: 0,                           // current (pixels)
            vx: 0, vy: 0,                         // velocity
            r: Math.random() * 1.8 + 0.4,
            alpha: Math.random() * 0.55 + 0.2,
            twinkleSpeed: Math.random() * 0.02 + 0.005,
            twinkleOffset: Math.random() * Math.PI * 2,
        }));
        // Init positions after W/H are set
        particles.forEach(p => { p.x = p.ox * W; p.y = p.oy * H; });

        // Pre-render a single particle sprite for better performance
        const particleSprite = (() => {
            const canvas = document.createElement('canvas');
            const size = 32;
            canvas.width = size;
            canvas.height = size;
            const pCtx = canvas.getContext('2d');
            const center = size / 2;
            const grd = pCtx.createRadialGradient(center, center, 0, center, center, size / 2);
            grd.addColorStop(0, 'rgba(220,210,255,0.8)');
            grd.addColorStop(0.4, 'rgba(160,140,255,0.3)');
            grd.addColorStop(1, 'rgba(100,120,255,0)');
            pCtx.fillStyle = grd;
            pCtx.beginPath();
            pCtx.arc(center, center, size / 2, 0, Math.PI * 2);
            pCtx.fill();
            return canvas;
        })();

        // Reusable offscreen canvas for figure mask
        const maskCanvas = document.createElement('canvas');
        const maskCtx = maskCanvas.getContext('2d');

        // ---- Orbit definitions ----
        // 7 unique orbits — one per icon — to prevent clustering
        const orbitDefs = [
            { rx: 0.38, ry: 0.11, tilt: -0.65, speed: 0.00040, color: '#7c3aed' }, // clock (PURPLE - Elongated & Tilted)
            { rx: 0.21, ry: 0.18, tilt: 0.55, speed: 0.00030, color: '#2563eb' }, // timer
            { rx: 0.37, ry: 0.13, tilt: 0.15, speed: 0.00048, color: '#06b6d4' }, // book
            { rx: 0.25, ry: 0.16, tilt: -0.70, speed: 0.00036, color: '#a855f7' }, // laptop
            { rx: 0.40, ry: 0.12, tilt: 0.80, speed: 0.00025, color: '#3b82f6' }, // calendar
            { rx: 0.18, ry: 0.20, tilt: -0.20, speed: 0.00033, color: '#34d399' }, // checklist
            { rx: 0.34, ry: 0.14, tilt: 0.60, speed: 0.00044, color: '#fb923c' }, // notes
        ];

        // ---- Productivity Icons — each on its own orbit ----
        const iconDefs = [
            { name: 'clock', orbitIdx: 0, phase: 0.0 },
            { name: 'timer', orbitIdx: 1, phase: 0.6 },
            { name: 'book', orbitIdx: 2, phase: 1.2 },
            { name: 'laptop', orbitIdx: 3, phase: 0.4 },
            { name: 'calendar', orbitIdx: 4, phase: 1.8 },
            { name: 'checklist', orbitIdx: 5, phase: 2.5 },
            { name: 'notes', orbitIdx: 6, phase: 0.8 },
        ];

        // Icon drawing functions — minimalist glassmorphism style
        function drawIconBase(ctx, x, y, angle, glowColor) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle);

            // Glass card bg
            const size = 22;
            ctx.beginPath();
            ctx.roundRect(-size, -size, size * 2, size * 2, 8);
            const bgGrad = ctx.createRadialGradient(0, -size * 0.3, 2, 0, 0, size * 1.5);
            bgGrad.addColorStop(0, 'rgba(255,255,255,0.14)');
            bgGrad.addColorStop(1, 'rgba(255,255,255,0.04)');
            ctx.fillStyle = bgGrad;
            ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,0.18)';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Glow shadow
            ctx.shadowColor = glowColor;
            ctx.shadowBlur = 28;
        }

        const iconDrawers = {
            clock: (ctx, t) => {
                ctx.strokeStyle = '#a78bfa';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(0, 0, 11, 0, Math.PI * 2);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(Math.cos(t * 0.8 - Math.PI / 2) * 7, Math.sin(t * 0.8 - Math.PI / 2) * 7);
                ctx.strokeStyle = '#c4b5fd';
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(Math.cos(t * 0.1 - Math.PI / 2) * 10, Math.sin(t * 0.1 - Math.PI / 2) * 10);
                ctx.strokeStyle = '#ede9fe';
                ctx.lineWidth = 1.5;
                ctx.stroke();
                ctx.fillStyle = '#a78bfa';
                ctx.beginPath();
                ctx.arc(0, 0, 2, 0, Math.PI * 2);
                ctx.fill();
            },
            timer: (ctx, t) => {
                ctx.strokeStyle = '#67e8f9';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(0, 3, 10, 0, Math.PI * 2);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(-5, -8);
                ctx.lineTo(5, -8);
                ctx.strokeStyle = '#a5f3fc';
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(0, -8);
                ctx.lineTo(0, -11);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(0, 3);
                const timerAngle = t * 0.6 - Math.PI / 2;
                ctx.lineTo(Math.cos(timerAngle) * 7, 3 + Math.sin(timerAngle) * 7);
                ctx.strokeStyle = '#e0f2fe';
                ctx.lineWidth = 2;
                ctx.stroke();
            },
            book: (ctx) => {
                ctx.strokeStyle = '#818cf8';
                ctx.lineWidth = 2;
                // book shape
                ctx.beginPath();
                ctx.roundRect(-10, -12, 20, 24, 2);
                ctx.strokeStyle = '#a5b4fc';
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(0, -12);
                ctx.lineTo(0, 12);
                ctx.strokeStyle = 'rgba(165,180,252,0.5)';
                ctx.lineWidth = 1;
                ctx.stroke();
                // lines
                for (let i = -6; i <= 6; i += 4) {
                    ctx.beginPath();
                    ctx.moveTo(-8, i);
                    ctx.lineTo(-2, i);
                    ctx.strokeStyle = 'rgba(196,181,253,0.6)';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(2, i);
                    ctx.lineTo(8, i);
                    ctx.stroke();
                }
            },
            laptop: (ctx) => {
                ctx.strokeStyle = '#38bdf8';
                ctx.lineWidth = 2;
                // screen
                ctx.beginPath();
                ctx.roundRect(-12, -11, 24, 16, 2);
                ctx.stroke();
                // base
                ctx.beginPath();
                ctx.moveTo(-14, 5);
                ctx.lineTo(14, 5);
                ctx.lineTo(11, 11);
                ctx.lineTo(-11, 11);
                ctx.closePath();
                ctx.strokeStyle = '#7dd3fc';
                ctx.stroke();
                // screen glow dot
                ctx.fillStyle = 'rgba(56,189,248,0.5)';
                ctx.beginPath();
                ctx.arc(0, -3, 4, 0, Math.PI * 2);
                ctx.fill();
            },
            calendar: (ctx) => {
                ctx.strokeStyle = '#c084fc';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.roundRect(-11, -10, 22, 22, 3);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(-11, -3);
                ctx.lineTo(11, -3);
                ctx.strokeStyle = 'rgba(192,132,252,0.5)';
                ctx.lineWidth = 1;
                ctx.stroke();
                // hooks
                ctx.strokeStyle = '#e879f9';
                ctx.lineWidth = 2.5;
                [-5, 5].forEach(x => {
                    ctx.beginPath();
                    ctx.moveTo(x, -12);
                    ctx.lineTo(x, -6);
                    ctx.stroke();
                });
                // dots
                const days = [[-7, 2], [0, 2], [7, 2], [-7, 8], [0, 8]];
                ctx.fillStyle = '#e9d5ff';
                days.forEach(([dx, dy]) => {
                    ctx.beginPath();
                    ctx.arc(dx, dy, 2, 0, Math.PI * 2);
                    ctx.fill();
                });
            },
            checklist: (ctx) => {
                const items = [-7, 0, 7];
                items.forEach((y, i) => {
                    // checkbox
                    ctx.strokeStyle = i < 2 ? '#34d399' : 'rgba(52,211,153,0.4)';
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.roundRect(-11, y - 4, 8, 8, 1.5);
                    ctx.stroke();
                    // check for done items
                    if (i < 2) {
                        ctx.strokeStyle = '#6ee7b7';
                        ctx.lineWidth = 1.5;
                        ctx.beginPath();
                        ctx.moveTo(-9.5, y);
                        ctx.lineTo(-7.5, y + 2.5);
                        ctx.lineTo(-4.5, y - 2);
                        ctx.stroke();
                    }
                    // line
                    ctx.beginPath();
                    ctx.moveTo(0, y);
                    ctx.lineTo(11, y);
                    ctx.strokeStyle = i < 2 ? 'rgba(110,231,183,0.6)' : 'rgba(110,231,183,0.2)';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                });
            },
            notes: (ctx) => {
                ctx.strokeStyle = '#fb923c';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.roundRect(-11, -12, 22, 24, 3);
                ctx.stroke();
                // folded corner
                ctx.beginPath();
                ctx.moveTo(5, -12);
                ctx.lineTo(11, -6);
                ctx.lineTo(5, -6);
                ctx.closePath();
                ctx.strokeStyle = 'rgba(251,146,60,0.5)';
                ctx.lineWidth = 1;
                ctx.stroke();
                // lines
                [- 5, 0, 6].forEach(y => {
                    ctx.beginPath();
                    ctx.moveTo(-8, y);
                    ctx.lineTo(3, y);
                    ctx.strokeStyle = 'rgba(253,186,116,0.6)';
                    ctx.lineWidth = 1.5;
                    ctx.stroke();
                });
            }
        };

        // ---- Figure Image (replaces canvas-drawn silhouette) ----
        const figureImg = new Image();
        figureImg.src = 'assets/figure_glow.jpg';
        let figureLoaded = false;
        figureImg.onload = () => { figureLoaded = true; };



        // ---- Main render ----
        let startTime = null;

        function render(ts) {
            if (!startTime) startTime = ts;
            const t = (ts - startTime) * 0.001 * (isMobile ? 0.6 : 1.0); // seconds

            // Smooth parallax
            parallax.x = 0;
            parallax.y += (mouse.y * 12 - parallax.y) * 0.04;

            ctx.clearRect(0, 0, W, H);

            // Preservation of current visual scale:
            // Current was (1.4 * baseDim) * 1.3 = 1.82 * baseDim
            const scaleX = baseDim * (isMobile ? 1.736 : 1.82);
            // Orbit centered in its container
            const orbitShift = 0;
            const ocx = cx;
            const ocy = cy + H * 0.06 + parallax.y * 0.5;  // shifted down to clear header

            // Orbit drawing helper — uses baseDim for consistent proportions regardless of canvas buffer
            function localOrbitPoint(orb, angle) {
                const cosT = orb.rx * scaleX * Math.cos(angle);
                const sinT = orb.ry * baseDim * 1.82 * Math.sin(angle); // Match scaleX proportion
                const cosTilt = Math.cos(orb.tilt);
                const sinTilt = Math.sin(orb.tilt);
                return {
                    x: ocx + cosT * cosTilt - sinT * sinTilt,
                    y: ocy + parallax.y * 0.4 + cosT * sinTilt + sinT * cosTilt
                };
            }

            // Orbit exclusion zone: no stars inside the orbit circle
            const orCx = ocx;
            const orCy = ocy + parallax.y * 0.4;
            const excludeR2 = baseDim * baseDim * 0.155 * 1.82; // scaled exclusion radius

            // Particles — lerp-based repel (calm, premium, no velocity overshoot)
            particles.forEach(p => {
                const originX = p.ox * W;
                const originY = p.oy * H;

                let targetX = originX;
                let targetY = originY;

                if (!isMobile) {
                    const dx = originX - mousePos.x;
                    const dy = originY - mousePos.y;
                    const distSq = dx * dx + dy * dy;

                    if (distSq < REPEL_RADIUS * REPEL_RADIUS && distSq > 0) {
                        // Max gentle push ~48px, eases off with distance
                        const dist = Math.sqrt(distSq);
                        const push = (1 - dist / REPEL_RADIUS) * 48;
                        targetX = originX + (dx / dist) * push;
                        targetY = originY + (dy / dist) * push;
                    }
                }

                // Lerp toward target — repulsion slightly faster than return
                const atOrigin = Math.abs(targetX - originX) < 1 && Math.abs(targetY - originY) < 1;
                p.x += (targetX - p.x) * (atOrigin ? 0.022 : 0.038);
                p.y += (targetY - p.y) * (atOrigin ? 0.022 : 0.038);

                // Skip drawing if inside orbit exclusion circle
                const epDx = p.x - orCx;
                const epDy = p.y - orCy;
                if (epDx * epDx + epDy * epDy < excludeR2) return;

                const twinkle = 0.5 + 0.5 * Math.sin(t * p.twinkleSpeed * 60 + p.twinkleOffset);
                const a = p.alpha * (0.4 + 0.6 * twinkle);

                ctx.globalAlpha = a;
                const pSize = p.r * 12;
                ctx.drawImage(particleSprite, p.x - pSize / 2, p.y - pSize / 2, pSize, pSize);
            });
            ctx.globalAlpha = 1.0;

            // Silhouette center glow
            const sil_x = ocx;
            const sil_y = ocy - H * 0.01 + parallax.y * 0.3;

            // Radial glow behind figure
            const glow = ctx.createRadialGradient(sil_x, sil_y, 0, sil_x, sil_y, 220);
            glow.addColorStop(0, 'rgba(109,40,217,0.18)');
            glow.addColorStop(1, 'transparent');
            ctx.fillStyle = glow;
            ctx.fillRect(sil_x - 220, sil_y - 220, 440, 440);

            // Orbit paths (back layer)
            orbitDefs.forEach(orb => {
                ctx.save();
                ctx.shadowBlur = 15;
                ctx.shadowColor = orb.color;
                ctx.globalAlpha = 0.45;

                const steps = 120;
                ctx.beginPath();
                for (let i = 0; i <= steps; i++) {
                    const angle = (i / steps) * Math.PI * 2;
                    const p = localOrbitPoint(orb, angle);
                    if (i === 0) ctx.moveTo(p.x, p.y);
                    else ctx.lineTo(p.x, p.y);
                }
                ctx.strokeStyle = orb.color;
                ctx.lineWidth = 1.5;
                ctx.stroke();
                ctx.restore();
            });

            // Draw figure image — professional compositing with feathered edges
            if (figureLoaded) {
                const bob = Math.sin(t * 0.4) * 6;
                const figH = 312;
                const figW = figH * (figureImg.naturalWidth / figureImg.naturalHeight);
                const drawX = sil_x - figW / 2;
                const drawY = sil_y - figH / 2 + bob;

                // --- Offscreen canvas for masked figure ---
                const offW = Math.ceil(figW + 80);  // extra padding for feather
                const offH = Math.ceil(figH + 80);

                if (maskCanvas.width !== offW || maskCanvas.height !== offH) {
                    maskCanvas.width = offW;
                    maskCanvas.height = offH;
                }
                maskCtx.clearRect(0, 0, offW, offH);

                // Draw figure centered in offscreen canvas
                maskCtx.drawImage(figureImg, 40, 40, figW, figH);

                // Apply radial feather mask — soft elliptical fade to transparent
                maskCtx.globalCompositeOperation = 'destination-in';
                const fGrd = maskCtx.createRadialGradient(offW / 2, offH / 2, figH * 0.25, offW / 2, offH / 2, offH * 0.5);
                fGrd.addColorStop(0, 'white'); fGrd.addColorStop(0.7, 'white'); fGrd.addColorStop(1, 'transparent');
                maskCtx.fillStyle = fGrd; maskCtx.fillRect(0, 0, offW, offH);
                maskCtx.globalCompositeOperation = 'source-over';

                // --- Composite masked figure onto main canvas ---
                ctx.save();
                ctx.globalCompositeOperation = 'screen';
                ctx.drawImage(maskCanvas, sil_x - offW / 2, sil_y - offH / 2 + bob);
                ctx.globalCompositeOperation = 'source-over';

                // --- Ambient color spill from orbit glow onto figure edges ---
                const spillGrad = ctx.createRadialGradient(
                    sil_x, sil_y + bob, figH * 0.15,
                    sil_x, sil_y + bob, figH * 0.55
                );
                spillGrad.addColorStop(0, 'rgba(124,58,237,0.0)');
                spillGrad.addColorStop(0.5, 'rgba(99,102,241,0.06)');
                spillGrad.addColorStop(0.7, 'rgba(56,189,248,0.04)');
                spillGrad.addColorStop(1, 'rgba(52,211,153,0.0)');
                ctx.globalCompositeOperation = 'screen';
                ctx.fillStyle = spillGrad;
                ctx.beginPath();
                ctx.ellipse(sil_x, sil_y + bob, figW * 0.6, figH * 0.55, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalCompositeOperation = 'source-over';
                ctx.restore();
            }

            // Icons on orbits
            iconDefs.forEach((icon, i) => {
                const orb = orbitDefs[icon.orbitIdx];
                const angle = icon.phase + t * orb.speed * 1000;
                const selfRot = t * 0.3 + i * 0.7;

                const p = localOrbitPoint(orb, angle);

                // depth (z) for perspective fade
                const cosAngle = Math.cos(angle);
                const depth = 0.65 + 0.35 * cosAngle;
                const iconAlpha = 0.5 + 0.5 * depth;

                // Icon colors per type
                const glowColors = {
                    clock: '#a78bfa', timer: '#67e8f9', book: '#818cf8',
                    laptop: '#38bdf8', calendar: '#c084fc', checklist: '#34d399', notes: '#fb923c'
                };

                ctx.save();
                ctx.globalAlpha = iconAlpha * 0.85;
                ctx.shadowBlur = 0;
                drawIconBase(ctx, p.x, p.y, selfRot, glowColors[icon.name]);
                iconDrawers[icon.name](ctx, t);
                ctx.restore();
            });

            // Front orbit paths (over icons for depth)
            orbitDefs.forEach(orb => {
                // draw only the "front half" of each orbit (top half of ellipse)
                ctx.save();
                ctx.globalAlpha = 0.2;
                ctx.shadowBlur = 10;
                ctx.shadowColor = orb.color;
                const steps = 60;
                ctx.beginPath();
                for (let i = 0; i <= steps; i++) {
                    const angle = (i / steps) * Math.PI;
                    const p = localOrbitPoint(orb, angle);
                    if (i === 0) ctx.moveTo(p.x, p.y);
                    else ctx.lineTo(p.x, p.y);
                }
                ctx.strokeStyle = orb.color;
                ctx.lineWidth = 1.4;
                ctx.stroke();
                ctx.restore();
            });

            animId = requestAnimationFrame(render);
        }

        animId = requestAnimationFrame(render);
    }


    // =============================================
    // 2. Hero Carousel Logic
    // =============================================
    const carouselImg = document.getElementById('carousel-img');
    if (carouselImg) {
        const images = [
            'assets/home_screen.png',
            'assets/focus_session.png',
            'assets/settings_page.png',
            'assets/daily_report.png',
            'assets/summary_analytics.png'
        ];
        let currentIndex = 0;

        setInterval(() => {
            carouselImg.classList.add('fade-out');
            setTimeout(() => {
                currentIndex = (currentIndex + 1) % images.length;
                carouselImg.src = images[currentIndex];
                carouselImg.classList.remove('fade-out');
            }, 400);
        }, 3500);
    }


    // =============================================
    // 3. Scroll Reveal Animations (Intersection Observer)
    // =============================================

    // --- Original fade-in for feature blocks ---
    const fadeElements = document.querySelectorAll('.fade-in-on-scroll');
    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });
    fadeElements.forEach(el => scrollObserver.observe(el));

    // --- New reveal system ---
    const revealElements = document.querySelectorAll('.reveal, .reveal-side');
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0 });
    revealElements.forEach(el => revealObserver.observe(el));


    // =============================================
    // 4. Infinite Horizontal Scroll Showcase
    // =============================================
    const scrollTrack = document.getElementById('screens-track');
    if (scrollTrack) {
        const items = [...scrollTrack.children];
        items.forEach(item => {
            const clone = item.cloneNode(true);
            scrollTrack.appendChild(clone);
        });
    }

    // =============================================
    // 5. Infinite Reviews Marquee
    // =============================================
    const reviewsTrack = document.getElementById('reviews-track');
    if (reviewsTrack) {
        const cards = [...reviewsTrack.children];
        cards.forEach(card => {
            const clone = card.cloneNode(true);
            reviewsTrack.appendChild(clone);
        });
    }

    // =============================================
    // 6. Contact Form — Validation & Submission
    // =============================================


    // ---- IMPORTANT: Paste your Google Apps Script Web App URL here ----
    // After deploying your Apps Script (see google_apps_script_guide.md),
    // replace the placeholder below with your actual Web App URL.
    const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyt8-_bx-ZAeRxVQhHHiaF-2aJcquA6a1dJLgRPqHZMAhnARvpvgVdjBHOXMYAAO0OK/exec';

    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        const fieldName = document.getElementById('fieldName');
        const fieldPhone = document.getElementById('fieldPhone');
        const fieldEmail = document.getElementById('fieldEmail');
        const fieldMessage = document.getElementById('fieldMessage');
        const submitBtn = document.getElementById('contactSubmit');
        const charCounter = document.getElementById('charCounter');
        const submitErrBanner = document.getElementById('formSubmitError');

        const errorName = document.getElementById('errorName');
        const errorPhone = document.getElementById('errorPhone');
        const errorEmail = document.getElementById('errorEmail');
        const errorMessage = document.getElementById('errorMessage');

        // ---- Validators — return error string or null ----
        function validateName(v) {
            if (!v.trim()) return 'Full name is required.';
            if (v.trim().length < 3) return 'Name must be at least 3 characters.';
            if (!/^[A-Za-z\s]+$/.test(v)) return 'Only letters and spaces are allowed.';
            return null;
        }
        function validatePhone(v) {
            if (!v.trim()) return 'Phone number is required.';
            if (!/^\d+$/.test(v.trim())) return 'Only numeric digits are allowed.';
            if (v.trim().length !== 10) return 'Phone number must be exactly 10 digits.';
            return null;
        }
        function validateEmail(v) {
            if (!v.trim()) return 'Email address is required.';
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())) return 'Enter a valid email (e.g. name@example.com).';
            return null;
        }
        function validateMessage(v) {
            if (!v.trim()) return null; // Message is now optional
            if (v.trim().length > 500) return 'Message cannot exceed 500 characters.';
            return null;
        }

        // ---- Show / clear field error ----
        function showError(input, errorEl, msg) {
            input.classList.remove('input-valid');
            input.classList.add('input-invalid');
            // Shake: remove existing first so re-submits re-trigger
            input.classList.remove('shake');
            void input.offsetWidth; // force reflow
            input.classList.add('shake');
            errorEl.textContent = msg;
            errorEl.classList.add('visible');
        }
        function clearError(input, errorEl) {
            input.classList.remove('input-invalid', 'shake');
            input.classList.add('input-valid');
            errorEl.textContent = '';
            errorEl.classList.remove('visible');
        }

        // ---- Validate a single field and return bool ----
        function validateField(field, errorEl, validatorFn) {
            const err = validatorFn(field.value);
            if (err) { showError(field, errorEl, err); return false; }
            clearError(field, errorEl);
            return true;
        }

        // ---- Check all fields to enable/disable submit ----
        function updateSubmitState() {
            const allOk =
                !validateName(fieldName.value) &&
                !validatePhone(fieldPhone.value) &&
                !validateEmail(fieldEmail.value) &&
                !validateMessage(fieldMessage.value);
            submitBtn.disabled = !allOk;
        }

        // ---- Blur listeners — validate on leave ----
        fieldName.addEventListener('blur', () => {
            validateField(fieldName, errorName, validateName);
            updateSubmitState();
        });
        fieldPhone.addEventListener('blur', () => {
            validateField(fieldPhone, errorPhone, validatePhone);
            updateSubmitState();
        });
        fieldEmail.addEventListener('blur', () => {
            validateField(fieldEmail, errorEmail, validateEmail);
            updateSubmitState();
        });
        fieldMessage.addEventListener('blur', () => {
            validateField(fieldMessage, errorMessage, validateMessage);
            updateSubmitState();
        });

        // ---- Input listeners — re-check state on every keystroke ----
        [fieldName, fieldPhone, fieldEmail, fieldMessage].forEach(f => {
            f.addEventListener('input', updateSubmitState);
        });

        // Phone: allow only digits as user types
        fieldPhone.addEventListener('input', () => {
            fieldPhone.value = fieldPhone.value.replace(/\D/g, '').slice(0, 10);
        });

        // ---- Char counter for message ----
        fieldMessage.addEventListener('input', () => {
            const len = fieldMessage.value.length;
            charCounter.textContent = `${len} / 500`;
            charCounter.classList.remove('warn', 'over');
            if (len > 500) charCounter.classList.add('over');
            else if (len > 450) charCounter.classList.add('warn');
        });

        // ---- Loading state helpers ----
        function setLoading(on) {
            if (on) {
                submitBtn.classList.add('loading');
                submitBtn.disabled = true;
            } else {
                submitBtn.classList.remove('loading');
                updateSubmitState();
            }
        }

        // ---- Success modal ----
        const successModal = document.getElementById('successModal');
        const successClose = document.getElementById('successClose');

        function showSuccessModal() {
            successModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
        function hideSuccessModal() {
            successModal.classList.remove('active');
            document.body.style.overflow = '';
        }
        successClose.addEventListener('click', hideSuccessModal);
        successModal.addEventListener('click', (e) => {
            if (e.target === successModal) hideSuccessModal();
        });

        // ---- Submission error banner ----
        function showSubmitError(msg) {
            submitErrBanner.textContent = msg;
            submitErrBanner.classList.add('visible');
        }
        function clearSubmitError() {
            submitErrBanner.classList.remove('visible');
        }

        // ---- Form submit ----
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearSubmitError();

            // Re-validate all fields before sending
            const okName = validateField(fieldName, errorName, validateName);
            const okPhone = validateField(fieldPhone, errorPhone, validatePhone);
            const okEmail = validateField(fieldEmail, errorEmail, validateEmail);
            const okMessage = validateField(fieldMessage, errorMessage, validateMessage);

            if (!okName || !okPhone || !okEmail || !okMessage) return;

            setLoading(true);

            const payload = {
                fullName: fieldName.value.trim(),
                phone: fieldPhone.value.trim(),
                email: fieldEmail.value.trim(),
                message: fieldMessage.value.trim(),
                timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
            };

            try {
                // If no real URL yet, simulate success for testing:
                if (APPS_SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
                    await new Promise(r => setTimeout(r, 1200)); // simulate network
                    setLoading(false);
                    showSuccessModal();
                    contactForm.reset();
                    charCounter.textContent = '0 / 500';
                    // Clear all valid states
                    [fieldName, fieldPhone, fieldEmail, fieldMessage].forEach(f => {
                        f.classList.remove('input-valid', 'input-invalid');
                    });
                    return;
                }

                const response = await fetch(APPS_SCRIPT_URL, {
                    method: 'POST',
                    mode: 'no-cors', // Google Apps Script requires no-cors
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                // no-cors returns opaque response; treat as success
                setLoading(false);
                showSuccessModal();
                contactForm.reset();
                charCounter.textContent = '0 / 500';
                [fieldName, fieldPhone, fieldEmail, fieldMessage].forEach(f => {
                    f.classList.remove('input-valid', 'input-invalid');
                });

            } catch (err) {
                setLoading(false);
                showSubmitError('Something went wrong. Please try again or email us directly.');
                console.error('Form submission error:', err);
            }
        });
    }

});

