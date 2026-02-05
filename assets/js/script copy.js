document.addEventListener('DOMContentLoaded', () => {
    initExperience();
    initCarousel();
    initLenis();
    initScrollProgress();
    initFeatureGlow();
    initScrollObserver();
    initCareersAnimations();
    initShowcaseCarousel();
    initTestimonialCarousel();
    // initTypingEffect();
    initGallery();
});

function initExperience() {
    initThreeJS();
    initScrollAnimations();
    initCursor();
}
// --- LENIS SMOOTH SCROLL ---
function initLenis() {
    // Check if Lenis is loaded
    if (typeof Lenis === 'undefined') {
        console.warn('Lenis script not loaded.');
        return;
    }

    // Initialize Lenis
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // standard ease
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
    });

    // Expose functionality to window for other scripts
    window.lenis = lenis;

    // Integrate with GSAP ScrollTrigger
    // Update ScrollTrigger on Lenis scroll event
    lenis.on('scroll', ScrollTrigger.update);

    // Add Lenis's requestAnimationFrame to GSAP's ticker
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });

    // Disable lag smoothing in GSAP to prevent jumps during heavy loads
    gsap.ticker.lagSmoothing(0);

    // Anchor link handling is left to specific handlers or default behavior 
    // to avoid conflicts with existing complex logic.
    console.log('Lenis initialized and integrated with GSAP.');
}

function initScrollProgress() {
    // Create progress bar element
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    progressBar.innerHTML = '<div class="scroll-progress-bar"></div>';
    document.body.appendChild(progressBar);

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .scroll-progress {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 3px;
            background: rgba(255, 255, 255, 0.1);
            z-index: 10001;
        }
        .scroll-progress-bar {
            height: 100%;
            width: 0%;
            background: linear-gradient(90deg, #e31837, #ffd700);
            transition: width 0.1s linear;
        }
    `;
    document.head.appendChild(style);

    // Update on scroll
    const bar = progressBar.querySelector('.scroll-progress-bar');

    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrollTop / docHeight) * 100;
        bar.style.width = `${progress}%`;
    });
}

// --- THREE.JS PARTICLE SYSTEM ---
function initThreeJS() {
    const canvas = document.querySelector('#particleCanvas');

    // Prevent crash if canvas or THREE is missing
    if (!canvas || typeof THREE === 'undefined') return;

    // Make canvas fixed and cover entire viewport
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.zIndex = '1';
    canvas.style.pointerEvents = 'none';

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050505, 0.008);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 18;

    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    // ============================================
    // SHAPE GENERATORS
    // ============================================

    // Shape 1: Film Strip Icon (RIGHT side of screen) + Scattered particles
    function generateFilmStripWithScatter(count) {
        const points = [];
        const scale = 3.3;
        const offsetX = 10; // Right side
        const tiltAngle = -10 * (Math.PI / 180); // 10 degree tilt

        // Helper function to add point with tilt rotation
        function addPoint(x, y, z, isLogo = true) {
            // Apply tilt rotation around Z axis
            const rotX = x * Math.cos(tiltAngle) - y * Math.sin(tiltAngle);
            const rotY = x * Math.sin(tiltAngle) + y * Math.cos(tiltAngle);

            points.push({
                x: (rotX * scale) + offsetX,
                y: rotY * scale,
                z: z,
                isLogo: isLogo
            });
        }

        // --- Film Strip Dimensions ---
        const filmWidth = 5.0;
        const filmHeight = 4.2;
        const cornerRadius = 0.3;
        const sprocketSize = 0.4;
        const sprocketRadius = 0.12;
        const frameWidth = 2.8;
        const frameHeight = 1.4;

        // ========== Outer Frame (Rounded Rectangle) ==========
        function addRoundedRect(w, h, r, density) {
            const halfW = w / 2, halfH = h / 2;

            for (let layer = 0; layer < 3; layer++) {
                const offset = (layer - 1) * 0.05;
                const hw = halfW + offset, hh = halfH + offset;

                // Top & Bottom edges
                for (let x = -hw + r; x <= hw - r; x += density) {
                    addPoint(x, hh, (Math.random() - 0.5) * 0.3);
                    addPoint(x, -hh, (Math.random() - 0.5) * 0.3);
                }
                // Left & Right edges
                for (let y = -hh + r; y <= hh - r; y += density) {
                    addPoint(-hw, y, (Math.random() - 0.5) * 0.3);
                    addPoint(hw, y, (Math.random() - 0.5) * 0.3);
                }

                // Corners
                const corners = [
                    { cx: hw - r, cy: hh - r, start: 0, end: Math.PI / 2 },
                    { cx: -hw + r, cy: hh - r, start: Math.PI / 2, end: Math.PI },
                    { cx: -hw + r, cy: -hh + r, start: Math.PI, end: Math.PI * 1.5 },
                    { cx: hw - r, cy: -hh + r, start: Math.PI * 1.5, end: Math.PI * 2 }
                ];
                corners.forEach(c => {
                    for (let a = c.start; a <= c.end; a += 0.12) {
                        addPoint(c.cx + Math.cos(a) * r, c.cy + Math.sin(a) * r, (Math.random() - 0.5) * 0.3);
                    }
                });
            }
        }

        addRoundedRect(filmWidth, filmHeight, cornerRadius, 0.08);

        // ========== Sprocket Holes (4 on each side) ==========
        function addSprocketHole(cx, cy, size, radius, density) {
            const half = size / 2;

            // Outline of rounded square
            for (let layer = 0; layer < 2; layer++) {
                const o = layer * 0.03;
                const h = half + o;

                // Edges
                for (let x = -h + radius; x <= h - radius; x += density) {
                    addPoint(cx + x, cy + h, (Math.random() - 0.5) * 0.15);
                    addPoint(cx + x, cy - h, (Math.random() - 0.5) * 0.15);
                }
                for (let y = -h + radius; y <= h - radius; y += density) {
                    addPoint(cx - h, cy + y, (Math.random() - 0.5) * 0.15);
                    addPoint(cx + h, cy + y, (Math.random() - 0.5) * 0.15);
                }

                // Corners
                const corners = [
                    { ccx: h - radius, ccy: h - radius, start: 0, end: Math.PI / 2 },
                    { ccx: -h + radius, ccy: h - radius, start: Math.PI / 2, end: Math.PI },
                    { ccx: -h + radius, ccy: -h + radius, start: Math.PI, end: Math.PI * 1.5 },
                    { ccx: h - radius, ccy: -h + radius, start: Math.PI * 1.5, end: Math.PI * 2 }
                ];
                corners.forEach(c => {
                    for (let a = c.start; a <= c.end; a += 0.2) {
                        addPoint(cx + c.ccx + Math.cos(a) * radius, cy + c.ccy + Math.sin(a) * radius, (Math.random() - 0.5) * 0.15);
                    }
                });
            }

            // Fill interior
            for (let x = -half + 0.08; x < half; x += density * 1.5) {
                for (let y = -half + 0.08; y < half; y += density * 1.5) {
                    if (Math.random() > 0.4) {
                        addPoint(cx + x, cy + y, (Math.random() - 0.5) * 0.2);
                    }
                }
            }
        }

        // Left side sprockets (4 holes)
        const sprocketX = -filmWidth / 2 + 0.45;
        const sprocketSpacing = 0.9;
        for (let i = 0; i < 4; i++) {
            const yPos = 1.35 - i * sprocketSpacing;
            addSprocketHole(sprocketX, yPos, sprocketSize, sprocketRadius, 0.06);
        }

        // Right side sprockets (4 holes)
        const sprocketXRight = filmWidth / 2 - 0.45;
        for (let i = 0; i < 4; i++) {
            const yPos = 1.35 - i * sprocketSpacing;
            addSprocketHole(sprocketXRight, yPos, sprocketSize, sprocketRadius, 0.06);
        }

        // ========== Center Frames (2 large rectangles) ==========
        function addCenterFrame(cx, cy, width, height, density) {
            const halfW = width / 2, halfH = height / 2;
            const r = 0.15; // Corner radius

            // Outline
            for (let layer = 0; layer < 2; layer++) {
                const o = layer * 0.04;
                const hw = halfW + o, hh = halfH + o;

                for (let x = -hw + r; x <= hw - r; x += density) {
                    addPoint(cx + x, cy + hh, (Math.random() - 0.5) * 0.2);
                    addPoint(cx + x, cy - hh, (Math.random() - 0.5) * 0.2);
                }
                for (let y = -hh + r; y <= hh - r; y += density) {
                    addPoint(cx - hw, cy + y, (Math.random() - 0.5) * 0.2);
                    addPoint(cx + hw, cy + y, (Math.random() - 0.5) * 0.2);
                }

                // Corners
                const corners = [
                    { ccx: hw - r, ccy: hh - r, start: 0, end: Math.PI / 2 },
                    { ccx: -hw + r, ccy: hh - r, start: Math.PI / 2, end: Math.PI },
                    { ccx: -hw + r, ccy: -hh + r, start: Math.PI, end: Math.PI * 1.5 },
                    { ccx: hw - r, ccy: -hh + r, start: Math.PI * 1.5, end: Math.PI * 2 }
                ];
                corners.forEach(c => {
                    for (let a = c.start; a <= c.end; a += 0.15) {
                        addPoint(cx + c.ccx + Math.cos(a) * r, cy + c.ccy + Math.sin(a) * r, (Math.random() - 0.5) * 0.2);
                    }
                });
            }

            // Fill interior
            for (let x = -halfW + 0.1; x < halfW; x += density * 2) {
                for (let y = -halfH + 0.1; y < halfH; y += density * 2) {
                    if (Math.random() > 0.5) {
                        addPoint(cx + x, cy + y, (Math.random() - 0.5) * 0.25);
                    }
                }
            }
        }

        // Top frame
        addCenterFrame(0, 0.8, frameWidth, frameHeight, 0.07);
        // Bottom frame
        addCenterFrame(0, -0.8, frameWidth, frameHeight, 0.07);

        const logoCount = points.length;

        // --- Scattered background particles ---
        const scatterCount = count - logoCount;
        for (let i = 0; i < scatterCount; i++) {
            points.push({
                x: (Math.random() - 0.5) * 40,
                y: (Math.random() - 0.5) * 28,
                z: (Math.random() - 0.5) * 20 - 5,
                isLogo: false
            });
        }

        return points.slice(0, count);
    }

    // Shape 2: Exploded/Scattered
    function generateExplodedPoints(count) {
        const points = [];
        for (let i = 0; i < count; i++) {
            points.push({
                x: (Math.random() - 0.5) * 50,
                y: (Math.random() - 0.5) * 35,
                z: (Math.random() - 0.5) * 30
            });
        }
        return points;
    }

    // Shape 3: Game Controller (LEFT side of screen)
    function generateControllerPoints(count) {
        const points = [];
        const scale = 3.5;
        const offsetX = -11; // LEFT side
        const tiltAngle = 10 * (Math.PI / 180); // Opposite tilt (10 degrees)

        // Helper to add point with tilt
        function addPoint(x, y, z) {
            // Apply tilt rotation around Z axis
            const rotX = x * Math.cos(tiltAngle) - y * Math.sin(tiltAngle);
            const rotY = x * Math.sin(tiltAngle) + y * Math.cos(tiltAngle);

            points.push({
                x: (rotX * scale) + offsetX,
                y: rotY * scale,
                z: z
            });
        }

        // Controller body
        const bodyW = 4.0, bodyH = 2.5, radius = 0.45;

        function addRoundedRect(w, h, r, density) {
            const halfW = w / 2, halfH = h / 2;
            for (let layer = 0; layer < 4; layer++) {
                const o = (layer - 1.5) * 0.05;
                const hw = halfW + o, hh = halfH + o;

                for (let x = -hw + r; x <= hw - r; x += density) {
                    addPoint(x, hh, (Math.random() - 0.5) * 0.3);
                    addPoint(x, -hh, (Math.random() - 0.5) * 0.3);
                }
                for (let y = -hh + r; y <= hh - r; y += density) {
                    addPoint(-hw, y, (Math.random() - 0.5) * 0.3);
                    addPoint(hw, y, (Math.random() - 0.5) * 0.3);
                }

                const corners = [
                    { cx: hw - r, cy: hh - r, start: 0, end: Math.PI / 2 },
                    { cx: -hw + r, cy: hh - r, start: Math.PI / 2, end: Math.PI },
                    { cx: -hw + r, cy: -hh + r, start: Math.PI, end: Math.PI * 1.5 },
                    { cx: hw - r, cy: -hh + r, start: Math.PI * 1.5, end: Math.PI * 2 }
                ];
                corners.forEach(c => {
                    for (let a = c.start; a <= c.end; a += 0.08) {
                        addPoint(c.cx + Math.cos(a) * r, c.cy + Math.sin(a) * r, (Math.random() - 0.5) * 0.3);
                    }
                });
            }
        }

        addRoundedRect(bodyW, bodyH, radius, 0.06);

        // D-Pad (left side)
        const dpadX = -1.2, dpadY = 0.25, dpadSize = 0.35, dpadThick = 0.1;
        for (let y = -dpadSize; y <= dpadSize; y += 0.04) {
            addPoint(dpadX - dpadThick, dpadY + y, Math.random() * 0.15);
            addPoint(dpadX + dpadThick, dpadY + y, Math.random() * 0.15);
        }
        for (let x = -dpadSize; x <= dpadSize; x += 0.04) {
            addPoint(dpadX + x, dpadY - dpadThick, Math.random() * 0.15);
            addPoint(dpadX + x, dpadY + dpadThick, Math.random() * 0.15);
        }

        // Action buttons (right side - 4 circles in diamond)
        const btnX = 1.2, btnY = 0.25, btnSpacing = 0.3, btnR = 0.12;
        const btnPositions = [
            { x: btnX, y: btnY + btnSpacing },
            { x: btnX + btnSpacing, y: btnY },
            { x: btnX, y: btnY - btnSpacing },
            { x: btnX - btnSpacing, y: btnY }
        ];
        btnPositions.forEach(btn => {
            for (let a = 0; a < Math.PI * 2; a += 0.12) {
                addPoint(btn.x + Math.cos(a) * btnR, btn.y + Math.sin(a) * btnR, Math.random() * 0.12);
            }
            // Fill buttons
            for (let r = 0.04; r < btnR; r += 0.04) {
                for (let a = 0; a < Math.PI * 2; a += 0.25) {
                    addPoint(btn.x + Math.cos(a) * r, btn.y + Math.sin(a) * r, Math.random() * 0.15);
                }
            }
        });

        // Analog sticks
        const stickY = -0.1, stickR = 0.22;
        [-0.55, 0.55].forEach(stickX => {
            for (let a = 0; a < Math.PI * 2; a += 0.1) {
                addPoint(stickX + Math.cos(a) * stickR, stickY + Math.sin(a) * stickR, Math.random() * 0.12);
            }
            for (let a = 0; a < Math.PI * 2; a += 0.18) {
                addPoint(stickX + Math.cos(a) * stickR * 0.5, stickY + Math.sin(a) * stickR * 0.5, Math.random() * 0.15);
            }
        });

        // Center menu buttons
        [-0.2, 0.2].forEach(bx => {
            for (let x = -0.1; x <= 0.1; x += 0.04) {
                addPoint(bx + x, 0.75, Math.random() * 0.1);
            }
        });

        // Pad to count
        const controllerCount = points.length;
        const scatterNeeded = count - controllerCount;
        for (let i = 0; i < scatterNeeded; i++) {
            points.push({
                x: (Math.random() - 0.5) * 40,
                y: (Math.random() - 0.5) * 28,
                z: (Math.random() - 0.5) * 20 - 5
            });
        }

        return points.slice(0, count);
    }

    // Shape 4: Computer Monitor Icon (precise and clean)
    function generateLightbulbPoints(count) {
        const points = [];
        const scale = 5.8;
        const offsetX = 8;
        const offsetY = -1;
        const tiltAngle = -10 * (Math.PI / 180);

        function addPoint(x, y, z = 0) {
            const rotX = x * Math.cos(tiltAngle) - y * Math.sin(tiltAngle);
            const rotY = x * Math.sin(tiltAngle) + y * Math.cos(tiltAngle);
            points.push({
                x: (rotX * scale) + offsetX,
                y: (rotY * scale) + offsetY,
                z: z * scale
            });
        }

        // ========== MONITOR SCREEN (Rounded Rectangle) ==========
        const screenWidth = 3.0;
        const screenHeight = 2.0;
        const cornerRadius = 0.15;

        // Outer frame with rounded corners
        for (let pass = 0; pass < 2; pass++) {
            const p = pass * 0.02;
            const r = cornerRadius - p;

            // Top edge (between corners)
            for (let x = -screenWidth / 2 + cornerRadius; x <= screenWidth / 2 - cornerRadius; x += 0.02) {
                addPoint(x, screenHeight / 2 - p, p * 0.2);
            }

            // Bottom edge (between corners)
            for (let x = -screenWidth / 2 + cornerRadius; x <= screenWidth / 2 - cornerRadius; x += 0.02) {
                addPoint(x, -screenHeight / 2 + p, p * 0.2);
            }

            // Left edge (between corners)
            for (let y = -screenHeight / 2 + cornerRadius; y <= screenHeight / 2 - cornerRadius; y += 0.02) {
                addPoint(-screenWidth / 2 + p, y, p * 0.2);
            }

            // Right edge (between corners)
            for (let y = -screenHeight / 2 + cornerRadius; y <= screenHeight / 2 - cornerRadius; y += 0.02) {
                addPoint(screenWidth / 2 - p, y, p * 0.2);
            }

            // Top-left corner
            for (let a = Math.PI / 2; a <= Math.PI; a += 0.1) {
                addPoint(-screenWidth / 2 + cornerRadius + Math.cos(a) * r, screenHeight / 2 - cornerRadius + Math.sin(a) * r, p * 0.2);
            }

            // Top-right corner
            for (let a = 0; a <= Math.PI / 2; a += 0.1) {
                addPoint(screenWidth / 2 - cornerRadius + Math.cos(a) * r, screenHeight / 2 - cornerRadius + Math.sin(a) * r, p * 0.2);
            }

            // Bottom-left corner
            for (let a = Math.PI; a <= 3 * Math.PI / 2; a += 0.1) {
                addPoint(-screenWidth / 2 + cornerRadius + Math.cos(a) * r, -screenHeight / 2 + cornerRadius + Math.sin(a) * r, p * 0.2);
            }

            // Bottom-right corner
            for (let a = 3 * Math.PI / 2; a <= 2 * Math.PI; a += 0.1) {
                addPoint(screenWidth / 2 - cornerRadius + Math.cos(a) * r, -screenHeight / 2 + cornerRadius + Math.sin(a) * r, p * 0.2);
            }
        }

        // ========== INNER SCREEN (Rounded Bezel) ==========
        const bezel = 0.2;
        const innerW = screenWidth - bezel * 2;
        const innerH = screenHeight - bezel * 2;
        const innerR = 0.1;

        for (let pass = 0; pass < 1; pass++) {
            const p = pass * 0.02;

            // Top & bottom edges
            for (let x = -innerW / 2 + innerR; x <= innerW / 2 - innerR; x += 0.025) {
                addPoint(x, innerH / 2 - p, 0.05);
                addPoint(x, -innerH / 2 + p, 0.05);
            }
            // Left & right edges
            for (let y = -innerH / 2 + innerR; y <= innerH / 2 - innerR; y += 0.025) {
                addPoint(-innerW / 2 + p, y, 0.05);
                addPoint(innerW / 2 - p, y, 0.05);
            }
            // Corners
            for (let a = Math.PI / 2; a <= Math.PI; a += 0.15) {
                addPoint(-innerW / 2 + innerR + Math.cos(a) * innerR, innerH / 2 - innerR + Math.sin(a) * innerR, 0.05);
            }
            for (let a = 0; a <= Math.PI / 2; a += 0.15) {
                addPoint(innerW / 2 - innerR + Math.cos(a) * innerR, innerH / 2 - innerR + Math.sin(a) * innerR, 0.05);
            }
            for (let a = Math.PI; a <= 3 * Math.PI / 2; a += 0.15) {
                addPoint(-innerW / 2 + innerR + Math.cos(a) * innerR, -innerH / 2 + innerR + Math.sin(a) * innerR, 0.05);
            }
            for (let a = 3 * Math.PI / 2; a <= 2 * Math.PI; a += 0.15) {
                addPoint(innerW / 2 - innerR + Math.cos(a) * innerR, -innerH / 2 + innerR + Math.sin(a) * innerR, 0.05);
            }
        }

        // ========== "ARENA" TEXT INSIDE MONITOR ==========
        const textScale = 0.18;
        const textY = 0.1; // Centered vertically
        const letterSpacing = 0.45;
        const startX = -0.9; // Start position for "ARENA"

        // Helper to draw line segment with particles
        function drawLine(x1, y1, x2, y2, density = 8) {
            for (let i = 0; i <= density; i++) {
                const t = i / density;
                const x = x1 + (x2 - x1) * t;
                const y = y1 + (y2 - y1) * t;
                addPoint(x, y, 0.08);
            }
        }

        // Letter A
        let lx = startX;
        drawLine(lx, textY - textScale, lx + textScale * 0.5, textY + textScale); // Left diagonal
        drawLine(lx + textScale * 0.5, textY + textScale, lx + textScale, textY - textScale); // Right diagonal
        drawLine(lx + textScale * 0.25, textY, lx + textScale * 0.75, textY); // Middle bar

        // Letter R
        lx += letterSpacing;
        drawLine(lx, textY - textScale, lx, textY + textScale); // Vertical
        drawLine(lx, textY + textScale, lx + textScale * 0.6, textY + textScale); // Top
        drawLine(lx + textScale * 0.6, textY + textScale, lx + textScale * 0.6, textY + textScale * 0.3); // Right top
        drawLine(lx + textScale * 0.6, textY + textScale * 0.3, lx, textY); // Middle back
        drawLine(lx, textY, lx + textScale * 0.7, textY - textScale); // Diagonal leg

        // Letter E
        lx += letterSpacing;
        drawLine(lx, textY - textScale, lx, textY + textScale); // Vertical
        drawLine(lx, textY + textScale, lx + textScale * 0.6, textY + textScale); // Top
        drawLine(lx, textY, lx + textScale * 0.5, textY); // Middle
        drawLine(lx, textY - textScale, lx + textScale * 0.6, textY - textScale); // Bottom

        // Letter N
        lx += letterSpacing;
        drawLine(lx, textY - textScale, lx, textY + textScale); // Left vertical
        drawLine(lx, textY + textScale, lx + textScale * 0.6, textY - textScale); // Diagonal
        drawLine(lx + textScale * 0.6, textY - textScale, lx + textScale * 0.6, textY + textScale); // Right vertical

        // Letter A (second)
        lx += letterSpacing;
        drawLine(lx, textY - textScale, lx + textScale * 0.5, textY + textScale);
        drawLine(lx + textScale * 0.5, textY + textScale, lx + textScale, textY - textScale);
        drawLine(lx + textScale * 0.25, textY, lx + textScale * 0.75, textY);
        // ========== STAND NECK ==========
        const neckWidth = 0.4;
        const neckHeight = 0.6;
        const neckY = -screenHeight / 2 - neckHeight / 2;

        for (let pass = 0; pass < 2; pass++) {
            const p = pass * 0.02;

            // Left side of neck
            for (let y = 0; y <= neckHeight; y += 0.03) {
                addPoint(-neckWidth / 2 + p, -screenHeight / 2 - y, p * 0.15);
            }

            // Right side of neck
            for (let y = 0; y <= neckHeight; y += 0.03) {
                addPoint(neckWidth / 2 - p, -screenHeight / 2 - y, p * 0.15);
            }
        }

        // ========== BASE/STAND ==========
        const baseWidth = 1.6;
        const baseHeight = 0.25;
        const baseY = -screenHeight / 2 - neckHeight;

        for (let pass = 0; pass < 2; pass++) {
            const p = pass * 0.02;

            // Top of base
            for (let x = -baseWidth / 2 + p; x <= baseWidth / 2 - p; x += 0.02) {
                addPoint(x, baseY - p, p * 0.15);
            }

            // Bottom of base
            for (let x = -baseWidth / 2 + p; x <= baseWidth / 2 - p; x += 0.02) {
                addPoint(x, baseY - baseHeight + p, p * 0.15);
            }

            // Left side of base
            for (let y = 0; y <= baseHeight; y += 0.03) {
                addPoint(-baseWidth / 2 + p, baseY - y, p * 0.15);
            }

            // Right side of base
            for (let y = 0; y <= baseHeight; y += 0.03) {
                addPoint(baseWidth / 2 - p, baseY - y, p * 0.15);
            }
        }

        // ========== POWER BUTTON (small circle at bottom of screen) ==========
        const buttonRadius = 0.08;
        const buttonY = -screenHeight / 2 + bezel / 2;

        for (let i = 0; i < 20; i++) {
            const angle = (i / 20) * Math.PI * 2;
            addPoint(Math.cos(angle) * buttonRadius, buttonY + Math.sin(angle) * buttonRadius, 0.03);
        }

        const monitorCount = points.length;

        // --- Scattered background particles ---
        const scatterCount = count - monitorCount;
        for (let i = 0; i < scatterCount; i++) {
            points.push({
                x: (Math.random() - 0.5) * 50,
                y: (Math.random() - 0.5) * 35,
                z: (Math.random() - 0.5) * 25 - 8
            });
        }

        return points.slice(0, count);
    }


    // Shape 5: Rocket (for CTA section)
    function generateRocketPoints(count) {
        const points = [];
        const scale = 1.3; // Larger scale for visibility
        const offsetX = -6; // Position on LEFT side of screen
        const offsetY = 0;
        const tiltAngle = -35 * (Math.PI / 180); // 15 degree tilt

        // apply tilt rotation
        function applyTilt(x, y) {
            const cos = Math.cos(tiltAngle);
            const sin = Math.sin(tiltAngle);
            return {
                x: x * cos - y * sin,
                y: x * sin + y * cos
            };
        }

        // Helper function to add a point with tilt and offset
        function addPoint(x, y, z = 0) {
            const tilted = applyTilt(x, y);
            points.push({
                x: (tilted.x + offsetX) * scale,
                y: (tilted.y + offsetY) * scale,
                z: z * scale
            });
        }

        // ========== ROCKET BODY (Oval/Ellipse outline) ==========
        // The body is an elongated oval shape
        const bodyWidth = 2.0;
        const bodyHeight = 5.5;
        const bodyDensity = 200;

        for (let i = 0; i < bodyDensity; i++) {
            const angle = (i / bodyDensity) * Math.PI * 2;
            const x = Math.cos(angle) * bodyWidth + (Math.random() - 0.5) * 0.15;
            const y = Math.sin(angle) * bodyHeight + (Math.random() - 0.5) * 0.15;
            addPoint(x, y, (Math.random() - 0.5) * 0.3);
        }

        // ========== NOSE CONE ==========
        // Smooth filled nose cone at the top
        const noseBaseY = bodyHeight * 0.7; // nose starts
        const noseTipY = bodyHeight + 2.5; // Tip of nose
        const noseDensity = 80;


        // Horizontal line inside
        for (let i = 0; i < 40; i++) {
            const x = (Math.random() - 0.5) * bodyWidth * 1.3;
            const curveY = noseBaseY - (x * x) * -0.20; // Curve downward at sides
            addPoint(x, curveY, (Math.random() - 0.5) * 0.1);
        }


        // ========== CIRCULAR WINDOW (Porthole in center) ==========
        const windowRadius = 1.0;
        const windowY = 0; // Center of body
        const windowDensity = 60;

        // Outer circle
        for (let i = 0; i < windowDensity; i++) {
            const angle = (i / windowDensity) * Math.PI * 2;
            const x = Math.cos(angle) * windowRadius + (Math.random() - 0.5) * 0.08;
            const y = Math.sin(angle) * windowRadius + windowY + (Math.random() - 0.5) * 0.08;
            addPoint(x, y, (Math.random() - 0.5) * 0.15);
        }

        // Inner circle (slightly smaller)
        const innerRadius = 0.75;
        for (let i = 0; i < 40; i++) {
            const angle = (i / 40) * Math.PI * 2;
            const x = Math.cos(angle) * innerRadius + (Math.random() - 0.5) * 0.06;
            const y = Math.sin(angle) * innerRadius + windowY + (Math.random() - 0.5) * 0.06;
            addPoint(x, y, (Math.random() - 0.5) * 0.12);
        }

        // ========== BOTTOM SECTION (Base with horizontal lines) ==========
        const baseDensity = 60;
        const baseY = -bodyHeight + 0.5;
        for (let i = 0; i < baseDensity; i++) {
            const t = i / baseDensity;
            const x = (t - 0.5) * bodyWidth * 1.6;
            addPoint(x, baseY + (Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.2);
        }

        // Multiple horizontal lines at base (creating base section look)
        const baseLineCount = 3;
        for (let line = 0; line < baseLineCount; line++) {
            const lineY = -bodyHeight + 0.8 + line * 0.5;
            for (let i = 0; i < 30; i++) {
                const x = (Math.random() - 0.5) * bodyWidth * 1.7;
                addPoint(x, lineY, (Math.random() - 0.5) * 0.12);
            }
        }

        // ========== LEFT FIN (Curved wing) ==========
        // Curved fin sweeping outward and down from body
        const finDensity = 120;
        for (let i = 0; i < finDensity; i++) {
            const t = i / finDensity;
            // Bezier-like curve for fin
            const startX = -bodyWidth * 0.8;
            const startY = -bodyHeight * 0.3;
            const controlX = -bodyWidth * 2.2;
            const controlY = -bodyHeight * 0.8;
            const endX = -bodyWidth * 0.9;
            const endY = -bodyHeight - 1.5;

            // Quadratic bezier curve
            const x = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * controlX + t * t * endX;
            const y = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * controlY + t * t * endY;

            addPoint(x + (Math.random() - 0.5) * 0.15, y + (Math.random() - 0.5) * 0.15, (Math.random() - 0.5) * 0.2);
        }

        // Fill left fin interior
        for (let i = 0; i < 60; i++) {
            const t = Math.random();
            const startX = -bodyWidth * 0.8;
            const startY = -bodyHeight * 0.3;
            const controlX = -bodyWidth * 1.8;
            const controlY = -bodyHeight * 0.6;
            const endX = -bodyWidth * 0.9;
            const endY = -bodyHeight - 1.0;

            const x = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * controlX + t * t * endX;
            const y = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * controlY + t * t * endY;

            addPoint(x + (Math.random() - 0.5) * 0.8, y + (Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.3);
        }

        // ========== RIGHT FIN (Curved wing - mirror) ==========
        for (let i = 0; i < finDensity; i++) {
            const t = i / finDensity;
            const startX = bodyWidth * 0.8;
            const startY = -bodyHeight * 0.3;
            const controlX = bodyWidth * 2.2;
            const controlY = -bodyHeight * 0.8;
            const endX = bodyWidth * 0.9;
            const endY = -bodyHeight - 1.5;

            const x = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * controlX + t * t * endX;
            const y = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * controlY + t * t * endY;

            addPoint(x + (Math.random() - 0.5) * 0.15, y + (Math.random() - 0.5) * 0.15, (Math.random() - 0.5) * 0.2);
        }

        // Fill right fin interior
        for (let i = 0; i < 60; i++) {
            const t = Math.random();
            const startX = bodyWidth * 0.8;
            const startY = -bodyHeight * 0.3;
            const controlX = bodyWidth * 1.8;
            const controlY = -bodyHeight * 0.6;
            const endX = bodyWidth * 0.9;
            const endY = -bodyHeight - 1.0;

            const x = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * controlX + t * t * endX;
            const y = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * controlY + t * t * endY;

            addPoint(x + (Math.random() - 0.5) * 0.8, y + (Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.3);
        }

        // ========== EXHAUST NOZZLE (Small trapezoid at bottom) ==========
        const nozzleDensity = 40;
        for (let i = 0; i < nozzleDensity; i++) {
            const t = i / nozzleDensity;
            const y = -bodyHeight - t * 0.8;
            const width = 0.6 + t * 0.3; // Slightly expanding
            const x = (Math.random() - 0.5) * width * 2;
            addPoint(x, y, (Math.random() - 0.5) * 0.2);
        }

        // ========== FLAME (Leaf/teardrop shape) ==========
        // Outer flame outline
        const flameDensity = 100;
        for (let i = 0; i < flameDensity; i++) {
            const t = i / flameDensity;
            const angle = t * Math.PI * 2;
            // Leaf/teardrop parametric shape
            const flameY = -bodyHeight - 1.0 - Math.sin(angle) * 2.5;
            const flameX = Math.sin(angle) * Math.cos(angle) * 1.5;

            addPoint(flameX + (Math.random() - 0.5) * 0.1, flameY + (Math.random() - 0.5) * 0.1, (Math.random() - 0.5) * 0.2);
        }

        // Inner flame (smaller teardrop)
        for (let i = 0; i < 50; i++) {
            const t = i / 50;
            const angle = t * Math.PI * 2;
            const flameY = -bodyHeight - 1.3 - Math.sin(angle) * 1.5;
            const flameX = Math.sin(angle) * Math.cos(angle) * 0.9;

            addPoint(flameX + (Math.random() - 0.5) * 0.08, flameY + (Math.random() - 0.5) * 0.08, (Math.random() - 0.5) * 0.15);
        }

        // Flame tip
        for (let i = 0; i < 30; i++) {
            addPoint(
                (Math.random() - 0.5) * 0.3,
                -bodyHeight - 3.5 - Math.random() * 0.5,
                (Math.random() - 0.5) * 0.2
            );
        }

        const rocketCount = points.length;

        // --- Scattered background particles (widely distributed) ---
        const scatterCount = count - rocketCount;
        for (let i = 0; i < scatterCount; i++) {
            points.push({
                x: (Math.random() - 0.5) * 80,  // horizontal spread
                y: (Math.random() - 0.5) * 35,  // vertical spread
                z: (Math.random() - 0.5) * 50 - 8  // z spread
            });
        }

        return points.slice(0, count);
    }

    // ============================================
    // CREATE INSTANCED MESH
    // ============================================
    const particleCount = 2750;
    const geometry = new THREE.TetrahedronGeometry(0.2, 0); //particle size
    const material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true,
        transparent: true,
        opacity: 0.75
    });

    const mesh = new THREE.InstancedMesh(geometry, material, particleCount);
    const dummy = new THREE.Object3D();

    // Generate all shapes
    const shape1 = generateFilmStripWithScatter(particleCount);
    const shape2 = generateExplodedPoints(particleCount);
    const shape3 = generateControllerPoints(particleCount);
    const shape4 = generateLightbulbPoints(particleCount);
    const shape5 = generateRocketPoints(particleCount);

    // Particle data
    const particles = [];

    // Colors
    const colors = [
        new THREE.Color('#ffffff'),
        new THREE.Color('#FFE01A'),
        new THREE.Color('#DF3131')
        // new THREE.Color('#FF6B35'),
        // new THREE.Color('#8338ec'),
        // new THREE.Color('#00f0ff')
    ];

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
        const p = shape1[i];

        particles.push({
            x: p.x, y: p.y, z: p.z,
            target1: { x: shape1[i].x, y: shape1[i].y, z: shape1[i].z },
            target2: { x: shape2[i].x, y: shape2[i].y, z: shape2[i].z },
            target3: { x: shape3[i].x, y: shape3[i].y, z: shape3[i].z },
            target4: { x: shape4[i].x, y: shape4[i].y, z: shape4[i].z },
            target5: { x: shape5[i].x, y: shape5[i].y, z: shape5[i].z },
            rotX: (Math.random() - 0.5) * 0.002,
            rotY: (Math.random() - 0.5) * 0.002,
            rotZ: (Math.random() - 0.5) * 0.002,
            isLogo: p.isLogo || false
        });

        dummy.position.set(p.x, p.y, p.z);
        dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        dummy.scale.setScalar(p.isLogo ? (0.8 + Math.random() * 0.4) : (0.5 + Math.random() * 0.5));
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);

        // Colors
        const rand = Math.random();
        let colorIdx = 0;
        if (rand > 0.85) colorIdx = 2; // Red
        else if (rand > 0.65) colorIdx = 1; // Yellow
        // else if (rand > 0.50) colorIdx = 3; // Orange
        // else if (rand > 0.40) colorIdx = 4; // Purple
        // else if (rand > 0.30) colorIdx = 5; // Cyan
        mesh.setColorAt(i, colors[colorIdx]);
    }

    mesh.instanceMatrix.needsUpdate = true;
    mesh.instanceColor.needsUpdate = true;
    scene.add(mesh);

    // ============================================
    // MORPH PROGRESS (controlled by scroll)
    // 0 = Shape1 (Logo), 0.5 = Exploded, 1 = Shape3 (Controller)
    // ============================================
    let morphProgress = 0;

    // ============================================
    // MOUSE INTERACTION
    // ============================================
    let mouse = { x: 0, y: 0 };
    let mouseWorld = new THREE.Vector3();
    const raycaster = new THREE.Raycaster();
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

    document.addEventListener('mousemove', (e) => {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        raycaster.ray.intersectPlane(plane, mouseWorld);
    });

    // ============================================
    // ANIMATION LOOP
    // ============================================
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        const time = clock.getElapsedTime();

        for (let i = 0; i < particleCount; i++) {
            const p = particles[i];

            // Calculate target based on morphProgress
            let targetX, targetY, targetZ;

            if (morphProgress <= 0.5) {
                // Phase 1: Logo → Exploded
                const t = morphProgress * 2;
                const easeT = t * t * (3 - 2 * t); // Smoothstep
                targetX = p.target1.x + (p.target2.x - p.target1.x) * easeT;
                targetY = p.target1.y + (p.target2.y - p.target1.y) * easeT;
                targetZ = p.target1.z + (p.target2.z - p.target1.z) * easeT;
            } else if (morphProgress <= 1.0) {
                // Phase 2: Exploded → Controller
                const t = (morphProgress - 0.5) * 2;
                const easeT = t * t * (3 - 2 * t);
                targetX = p.target2.x + (p.target3.x - p.target2.x) * easeT;
                targetY = p.target2.y + (p.target3.y - p.target2.y) * easeT;
                targetZ = p.target2.z + (p.target3.z - p.target2.z) * easeT;
            } else if (morphProgress <= 1.5) {
                // Phase 3: Controller → Scatter outward (morphProgress 1.0 to 1.5)
                const t = (morphProgress - 1.0) * 2; // 0 to 1
                const easeT = t * t; // Quadratic ease for smooth scatter

                // Scatter from controller position toward random exploded positions
                const scatterX = p.target2.x * 1.5; // Push further out
                const scatterY = p.target2.y * 1.5;
                const scatterZ = p.target2.z * 2.0; // More Z depth for scatter

                targetX = p.target3.x + (scatterX - p.target3.x) * easeT;
                targetY = p.target3.y + (scatterY - p.target3.y) * easeT;
                targetZ = p.target3.z + (scatterZ - p.target3.z) * easeT;
            } else if (morphProgress <= 2.0) {
                // Phase 4: Scattered → Lightbulb (morphProgress 1.5 to 2.0)
                const t = (morphProgress - 1.5) * 2; // 0 to 1
                const easeT = t * t * (3 - 2 * t); // Smoothstep for smooth formation

                // Calculate scatter position (where we're coming from)
                const scatterX = p.target2.x * 1.5;
                const scatterY = p.target2.y * 1.5;
                const scatterZ = p.target2.z * 2.0;

                // Interpolate from scatter to lightbulb (target4) - no rotation, direct morph
                targetX = scatterX + (p.target4.x - scatterX) * easeT;
                targetY = scatterY + (p.target4.y - scatterY) * easeT;
                targetZ = scatterZ + (p.target4.z - scatterZ) * easeT;
            } else if (morphProgress <= 2.5) {
                // Phase 5: Monitor → Gentle Scatter (morphProgress 2.0 to 2.5)
                const t = (morphProgress - 2.0) * 2; // 0 to 1
                // Very smooth easing - cubic for gentle transition
                const easeT = t * t * t * (t * (t * 6 - 15) + 10); // Smootherstep (Ken Perlin)

                // Gentle scatter from monitor - small offsets for smooth drift, not explosion
                // Use index-based offset for consistent, predictable movement
                const offsetX = Math.sin(i * 0.1) * 3.0;
                const offsetY = Math.cos(i * 0.15) * 2.5;
                const offsetZ = Math.sin(i * 0.2) * 2.0;

                const scatterX = p.target4.x + offsetX;
                const scatterY = p.target4.y + offsetY;
                const scatterZ = p.target4.z + offsetZ;

                targetX = p.target4.x + (scatterX - p.target4.x) * easeT;
                targetY = p.target4.y + (scatterY - p.target4.y) * easeT;
                targetZ = p.target4.z + (scatterZ - p.target4.z) * easeT;
            } else {
                // Phase 6: Scatter → Rocket (morphProgress 2.5 to 3.0)
                const t = (morphProgress - 2.5) * 2; // 0 to 1
                // Smooth formation using smootherstep
                const easeT = t * t * t * (t * (t * 6 - 15) + 10);

                // Calculate scatter position (where we're coming from) - match Phase 5
                const offsetX = Math.sin(i * 0.1) * 3.0;
                const offsetY = Math.cos(i * 0.15) * 2.5;
                const offsetZ = Math.sin(i * 0.2) * 2.0;

                const scatterX = p.target4.x + offsetX;
                const scatterY = p.target4.y + offsetY;
                const scatterZ = p.target4.z + offsetZ;

                // Interpolate from scatter to Rocket (target5) - smooth formation
                targetX = scatterX + (p.target5.x - scatterX) * easeT;
                targetY = scatterY + (p.target5.y - scatterY) * easeT;
                targetZ = scatterZ + (p.target5.z - scatterZ) * easeT;
            }

            // Lerp to target
            p.x += (targetX - p.x) * 0.06;
            p.y += (targetY - p.y) * 0.06;
            p.z += (targetZ - p.z) * 0.06;

            // Wave animation
            const waveX = Math.sin(time * 0.6 + p.y * 0.3) * 0.05;
            const waveY = Math.cos(time * 0.5 + p.x * 0.3) * 0.05;

            // Mouse repulsion
            let repelX = 0, repelY = 0, repelZ = 0;
            const dx = p.x - mouseWorld.x;
            const dy = p.y - mouseWorld.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 5.0 && dist > 0.01) {
                const force = (1 - dist / 5.5) * 0.3; //mouse repulsion size
                repelX = (dx / dist) * force;
                repelY = (dy / dist) * force;
                repelZ = force * 0.3;
            }

            // Mouse follow (subtle)
            const followX = mouse.x * 1.0;
            const followY = mouse.y * 1.0;

            dummy.position.set(
                p.x + waveX + repelX + followX * 0.2,
                p.y + waveY + repelY + followY * 0.2,
                p.z + repelZ
            );

            dummy.rotation.x += p.rotX;
            dummy.rotation.y += p.rotY;
            dummy.rotation.z += p.rotZ;

            dummy.updateMatrix();
            mesh.setMatrixAt(i, dummy.matrix);
        }

        mesh.instanceMatrix.needsUpdate = true;

        // Subtle mesh rotation
        mesh.rotation.y = Math.sin(time * 0.06) * 0.02;

        renderer.render(scene, camera);
    }
    animate();

    // Resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // ============================================
    // SCROLL TRIGGERS FOR MORPHING
    // ============================================
    gsap.registerPlugin(ScrollTrigger);

    // If on Gallery page OR Course page, strictly force SCATTER state and skip shape morphing
    if (document.querySelector('.gallery-section') || document.querySelector('.course-grid')) {
        morphProgress = 1.5;
        material.opacity = 0.2;
        return;
    }

    // If on About page, create ARENA ANIMATION text with scroll-triggered formation
    if (document.querySelector('.overview-section')) {
        // Generate text points for ARENA ANIMATION
        const textPoints = generateArenaAnimationText(particleCount);
        // Generate scattered points for initial state
        const scatterPoints = generateWideScatter(particleCount);

        // Set initial scattered state
        for (let i = 0; i < particleCount; i++) {
            particles[i].x = scatterPoints[i].x;
            particles[i].y = scatterPoints[i].y;
            particles[i].z = scatterPoints[i].z;
            // Target1 = scattered, Target2 = text shape
            particles[i].target1 = { x: scatterPoints[i].x, y: scatterPoints[i].y, z: scatterPoints[i].z };
            particles[i].target2 = { x: textPoints[i].x, y: textPoints[i].y, z: textPoints[i].z };
        }

        morphProgress = 0; // Start in scattered state
        material.opacity = 0.45;

        // ScrollTrigger: Form text at 50% of overview-section
        ScrollTrigger.create({
            trigger: ".overview-section",
            start: "top 80%",
            end: "50% center",
            scrub: 1.5,
            onUpdate: (self) => {
                morphProgress = self.progress * 0.5; // 0 to 0.5 = scattered to text
            }
        });

        return;
    }

    // Generate wide scatter points for About page
    function generateWideScatter(count) {
        const points = [];
        for (let i = 0; i < count; i++) {
            points.push({
                x: (Math.random() - 0.5) * 60,
                y: (Math.random() - 0.5) * 30,
                z: (Math.random() - 0.5) * 40 - 10
            });
        }
        return points;
    }

    // Helper function to generate ARENA ANIMATION text points (vector-based, high density)
    function generateArenaAnimationText(count) {
        const points = [];
        const scale = 2.5; // Larger letters
        const letterSpacing = 3; // More space between letters
        const lineSpacing = 6.5; // More space between lines

        // Helper to draw line segment with high-density particles
        function drawLine(x1, y1, x2, y2, density = 20) {
            for (let i = 0; i <= density; i++) {
                const t = i / density;
                // Add slight randomness for organic feel
                const jitter = 0.08;
                points.push({
                    x: x1 + (x2 - x1) * t + (Math.random() - 0.5) * jitter,
                    y: y1 + (y2 - y1) * t + (Math.random() - 0.5) * jitter,
                    z: (Math.random() - 0.5) * 0.3
                });
            }
        }

        // Letter drawing functions with improved precision
        function drawA(startX, startY) {
            const s = scale;
            drawLine(startX, startY - s, startX + s * 0.5, startY + s, 25); // Left diagonal
            drawLine(startX + s * 0.5, startY + s, startX + s, startY - s, 25); // Right diagonal
            drawLine(startX + s * 0.2, startY - s * 0.1, startX + s * 0.8, startY - s * 0.1, 15); // Middle bar
        }

        function drawR(startX, startY) {
            const s = scale;
            drawLine(startX, startY - s, startX, startY + s, 25); // Vertical
            drawLine(startX, startY + s, startX + s * 0.65, startY + s, 18); // Top
            drawLine(startX + s * 0.65, startY + s, startX + s * 0.65, startY + s * 0.25, 15); // Right curve
            drawLine(startX + s * 0.65, startY + s * 0.25, startX, startY, 15); // Middle back
            drawLine(startX + s * 0.15, startY - s * 0.1, startX + s * 0.75, startY - s, 20); // Diagonal leg
        }

        function drawE(startX, startY) {
            const s = scale;
            drawLine(startX, startY - s, startX, startY + s, 25); // Vertical
            drawLine(startX, startY + s, startX + s * 0.65, startY + s, 18); // Top
            drawLine(startX, startY, startX + s * 0.55, startY, 15); // Middle
            drawLine(startX, startY - s, startX + s * 0.65, startY - s, 18); // Bottom
        }

        function drawN(startX, startY) {
            const s = scale;
            drawLine(startX, startY - s, startX, startY + s, 25); // Left vertical
            drawLine(startX, startY + s, startX + s * 0.7, startY - s, 30); // Diagonal
            drawLine(startX + s * 0.7, startY - s, startX + s * 0.7, startY + s, 25); // Right vertical
        }

        function drawI(startX, startY) {
            const s = scale;
            drawLine(startX + s * 0.35, startY - s, startX + s * 0.35, startY + s, 25); // Vertical
            drawLine(startX, startY + s, startX + s * 0.7, startY + s, 18); // Top bar
            drawLine(startX, startY - s, startX + s * 0.7, startY - s, 18); // Bottom bar
        }

        function drawM(startX, startY) {
            const s = scale;
            drawLine(startX, startY - s, startX, startY + s, 25); // Left vertical
            drawLine(startX, startY + s, startX + s * 0.45, startY - s * 0.2, 22); // Left diagonal
            drawLine(startX + s * 0.45, startY - s * 0.2, startX + s * 0.9, startY + s, 22); // Right diagonal
            drawLine(startX + s * 0.9, startY + s, startX + s * 0.9, startY - s, 25); // Right vertical
        }

        function drawT(startX, startY) {
            const s = scale;
            drawLine(startX + s * 0.35, startY - s, startX + s * 0.35, startY + s, 25); // Vertical center
            drawLine(startX, startY + s, startX + s * 0.7, startY + s, 18); // Top bar
        }

        function drawO(startX, startY) {
            const s = scale;
            const segments = 24; // More segments for smoother circle
            const rx = s * 0.35; // Horizontal radius
            const ry = s; // Vertical radius
            for (let i = 0; i < segments; i++) {
                const angle1 = (i / segments) * Math.PI * 2;
                const angle2 = ((i + 1) / segments) * Math.PI * 2;
                const x1 = startX + s * 0.35 + Math.cos(angle1) * rx;
                const y1 = startY + Math.sin(angle1) * ry;
                const x2 = startX + s * 0.35 + Math.cos(angle2) * rx;
                const y2 = startY + Math.sin(angle2) * ry;
                drawLine(x1, y1, x2, y2, 5);
            }
        }

        // Draw "ARENA" on first line (centered)
        const word1 = "ARENA";
        const word1Width = word1.length * letterSpacing;
        let xPos = -word1Width / 2;
        const yLine1 = lineSpacing / 2;

        for (const char of word1) {
            switch (char) {
                case 'A': drawA(xPos, yLine1); break;
                case 'R': drawR(xPos, yLine1); break;
                case 'E': drawE(xPos, yLine1); break;
                case 'N': drawN(xPos, yLine1); break;
            }
            xPos += letterSpacing;
        }

        // Draw "ANIMATION" on second line (centered)
        const word2 = "ANIMATION";
        const word2Width = word2.length * letterSpacing;
        xPos = -word2Width / 2;
        const yLine2 = -lineSpacing / 2;

        for (const char of word2) {
            switch (char) {
                case 'A': drawA(xPos, yLine2); break;
                case 'N': drawN(xPos, yLine2); break;
                case 'I': drawI(xPos, yLine2); break;
                case 'M': drawM(xPos, yLine2); break;
                case 'T': drawT(xPos, yLine2); break;
                case 'O': drawO(xPos, yLine2); break;
            }
            xPos += letterSpacing;
        }

        // Fill remaining with widely scattered particles
        const textCount = points.length;
        const scatterCount = count - textCount;

        for (let i = 0; i < scatterCount; i++) {
            points.push({
                x: (Math.random() - 0.5) * 80,
                y: (Math.random() - 0.5) * 40,
                z: (Math.random() - 0.5) * 50 - 10
            });
        }

        return points.slice(0, count);
    }

    // Phase 1: Hero scroll → Explosion (0 to 0.5)
    ScrollTrigger.create({
        trigger: ".hero-section",
        start: "top top",
        end: "bottom top",
        scrub: 1.5,
        onUpdate: (self) => {
            morphProgress = self.progress * 0.5;
        }
    });

    // Phase 2: Institute section → Controller (0.5 to 1)
    ScrollTrigger.create({
        trigger: ".institute-section",
        start: "top bottom",
        end: "center center",
        scrub: 1.5,
        onUpdate: (self) => {
            morphProgress = 0.5 + (self.progress * 0.5);
        }
    });

    // Phase 3: Institute to Course section → Scatter & Fade
    ScrollTrigger.create({
        trigger: ".immersive-section",
        start: "20% 80%",
        end: "center center",
        scrub: 1,
        onUpdate: (self) => {
            // Scatter: push morphProgress beyond 1 to trigger explosion
            // This will interpolate from controller (target3) back toward exploded (target2)
            morphProgress = 1 + (self.progress * 0.5); //(extra scatter)

            // Fade opacity 
            material.opacity = 0.75 * (1 - self.progress * 0.7);
        }
    });

    // Phase 4: Why Choose Us section → Lightbulb Formation
    ScrollTrigger.create({
        trigger: ".why-section",
        start: "top 50%",
        end: "center center",
        scrub: 1.5,
        onUpdate: (self) => {
            // Transition from scatter (1.5) to lightbulb (2.0)
            morphProgress = 1.5 + (self.progress * 0.5);

            // Fade particles back in as lightbulb forms
            material.opacity = 0.25 + (self.progress * 0.5); // 0.25 to 0.75
        }
    });

    // Phase 5: After Showcase section → Scatter outward
    ScrollTrigger.create({
        trigger: ".showcase-section",
        start: "bottom center",
        end: "bottom top",
        scrub: 1.5,
        onUpdate: (self) => {
            // Transition from lightbulb (2.0) to scatter (2.5)
            morphProgress = 2.0 + (self.progress * 0.5);

            // Fade particles out as they scatter
            material.opacity = 0.75 * (1 - self.progress * 0.7);
        }
    });

    // Phase 6: Testimonial section → Arena Text Formation
    ScrollTrigger.create({
        trigger: ".testimonial-section",
        start: "top 80%",
        end: "center center",
        scrub: 1.5,
        onUpdate: (self) => {
            // Transition from scatter (2.5) to Arena text (3.0)
            morphProgress = 2.5 + (self.progress * 0.5);



            // Fade particles back in as text forms
            material.opacity = 0.25 + (self.progress * 0.5); // 0.25 to 0.75
        }
    });

    // Camera movement
    gsap.to(camera.position, {
        scrollTrigger: {
            trigger: ".hero-section",
            start: "top top",
            end: "bottom top",
            scrub: 1
        },
        z: 22,
        y: -2
    });

    gsap.to(camera.position, {
        scrollTrigger: {
            trigger: ".institute-section",
            start: "top bottom",
            end: "center center",
            scrub: 1
        },
        z: 16,
        y: 0
    });

    // Camera zoom out for course section (scatter effect)
    // gsap.to(camera.position, {
    //     scrollTrigger: {
    //         trigger: ".immersive-section",
    //         start: "top 10%",
    //         end: "center center",
    //         scrub: 1
    //     },
    //     z: 10,
    //     y: 5,
    // });
}

// --- GSAP SCROLL ANIMATIONS ---
function initScrollAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    // Hero reveal
    gsap.timeline({ delay: 0.3 }).to('.hero-section .animate-on-scroll', {
        opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out'
    });

    // Institute section reveals
    gsap.utils.toArray('.institute-section .animate-on-scroll').forEach((el, i) => {
        gsap.to(el, {
            opacity: 1, y: 0, duration: 0.8, delay: i * 0.1, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 85%' }
        });
    });

    // Number counters
    document.querySelectorAll('.stat-number').forEach(stat => {
        gsap.to(stat, {
            textContent: parseInt(stat.getAttribute('data-count')),
            duration: 2, delay: 1, ease: 'power2.out', snap: { textContent: 1 },
            scrollTrigger: { trigger: stat, start: 'top 80%' }
        });
    });

    // Navbar scroll
    ScrollTrigger.create({
        trigger: '.hero-section',
        start: 'top top',
        end: '+=100',
        onUpdate: (self) => {
            const navbar = document.querySelector('.navbar');
            self.progress > 0.5 ? navbar?.classList.add('scrolled') : navbar?.classList.remove('scrolled');
        }
    });

    // Content section
    gsap.utils.toArray('.content-section .animate-on-scroll').forEach((el, i) => {
        gsap.to(el, {
            opacity: 1, y: 0, duration: 0.8, delay: i * 0.1, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 85%' }
        });
    });

    // Floating icons parallax
    gsap.utils.toArray('.float-icon').forEach((icon, i) => {
        gsap.to(icon, {
            y: -100 - (i * 20),
            scrollTrigger: { trigger: '.hero-section', start: 'top top', end: 'bottom top', scrub: 1 }
        });
    });

    // 3D Cards parallax
    gsap.utils.toArray('.card-3d').forEach((card, i) => {
        const dir = i % 2 === 0 ? 1 : -1;
        gsap.to(card, {
            y: -50 * dir, rotation: 5 * dir,
            scrollTrigger: { trigger: '.hero-section', start: 'top top', end: 'bottom top', scrub: 1 }
        });
    });

    // ============================================
    // IMMERSIVE SECTION - Text Reveal with Pin
    // ============================================
    const immersiveSection = document.querySelector('.immersive-section');
    const bgTypography = document.querySelector('.background-typography');
    const textLines = gsap.utils.toArray('.bg-text-line');
    const courseSwiper = document.querySelector('.course-swiper');

    if (immersiveSection && textLines.length > 0) {
        // Create a timeline for the text reveal with proper pinning
        const textRevealTl = gsap.timeline({
            scrollTrigger: {
                trigger: immersiveSection,
                start: 'top top',
                end: 'bottom bottom', // Use section's full height
                scrub: 0.5,
                pin: true,
                pinSpacing: false, // Section already has the height
            }
        });

        // Staggered text line reveal (first half of scroll)
        textRevealTl
            .to('.text-begin', {
                opacity: 1,
                y: 0,
                duration: 0.15,
                ease: 'power2.out'
            }, 0)
            .to('.text-top', {
                opacity: 1,
                y: 0,
                duration: 0.15,
                ease: 'power2.out'
            }, 0.10)
            .to('.text-middle', {
                opacity: 1,
                y: 0,
                duration: 0.15,
                ease: 'power2.out'
            }, 0.15)
            .to('.text-bottom', {
                opacity: 1,
                y: 0,
                duration: 0.15,
                ease: 'power2.out'
            }, 0.20)
            // After text reveals, show the course cards (second half of scroll)
            .to(courseSwiper, {
                opacity: 1,
                y: 0,
                duration: 0.20,
                ease: 'power2.out'
            }, 0.20);
    }

    // --- Add this inside initScrollAnimations() ---

    // Animate Overview Stats
    const statNumbers = document.querySelectorAll('.stat-num');
    statNumbers.forEach(stat => {
        const targetVal = parseInt(stat.getAttribute('data-val'));

        gsap.to(stat, {
            scrollTrigger: {
                trigger: ".overview-section",
                start: "top 75%",
            },
            innerHTML: targetVal,
            duration: 2,
            snap: { innerHTML: 1 },
            ease: "power2.out",
            onUpdate: function () {
                this.targets()[0].innerHTML = Math.ceil(this.targets()[0].innerHTML);
            }
        });
    });

    // Reveal Animation for Content
    gsap.from(".overview-content > *", {
        scrollTrigger: {
            trigger: ".overview-section",
            start: "top 80%",
        },
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out"
    });

    // Reveal Animation for Image
    gsap.from(".holo-frame", {
        scrollTrigger: {
            trigger: ".overview-section",
            start: "top 80%",
        },
        x: -50,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
    });
}

// --- CUSTOM CURSOR ---
function initCursor() {
    const cursor = document.querySelector('.custom-cursor');
    const cursorDot = document.querySelector('.cursor-dot');
    if (!cursor || !cursorDot) return;

    document.addEventListener('mousemove', (e) => {
        gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.25, ease: 'power2.out' });
        gsap.to(cursorDot, { x: e.clientX, y: e.clientY, duration: 0.08 });
    });

    document.querySelectorAll('a, button, .card-3d, .program-card, .stat-box, .feature-item, .course-card').forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });
}

// --- COURSE SWIPER CAROUSEL ---
function initCarousel() {
    var swiper = new Swiper(".course-swiper", {
        effect: "coverflow",
        grabCursor: true,
        centeredSlides: true,
        slidesPerView: "auto",
        initialSlide: 1, /* Starts on center slide */
        loop: true,
        coverflowEffect: {
            rotate: 0,
            stretch: 0,
            depth: 150,
            modifier: 2.5,
            slideShadows: true, /* Essential for the depth look */
        },
        autoplay: { delay: 3000, disableOnInteraction: false },
        speed: 800,
    });
}


// 1. Mouse Glow Effect Logic
function initFeatureGlow() {
    const cards = document.querySelectorAll('.feature-card');

    cards.forEach(card => {
        const glow = card.querySelector('.card-glow-effect');
        if (!glow) return;

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Move glow center to mouse position
            // We subtract 200 because the glow is 400x400px, so 200 is radius
            glow.style.transform = `translate(${x - 200}px, ${y - 200}px)`;
            glow.style.opacity = '1';
        });

        card.addEventListener('mouseleave', () => {
            glow.style.opacity = '0';
        });
    });
}

// 2. Simple Scroll Animation Observer (Fade In)
function initScrollObserver() {
    const observerOptions = {
        threshold: 0.15, // Trigger when 15% of element is visible
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
}


// ============================================
// Careers Section Animations
// ============================================
function initCareersAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    // 1. Title Glitch & Shutter Reveal
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: ".careers-section",
            start: "top 75%",
        }
    });

    tl.fromTo(".h-shutter",
        { width: 0, opacity: 0 },
        { width: 100, opacity: 0.5, duration: 0.8, ease: "power2.out" }
    )
        .fromTo(".holo-title",
            { y: 50, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, ease: "back.out(1.7)" }, "-=0.6"
        )
        .fromTo(".holo-subtitle",
            { scale: 0.8, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.5 }, "-=0.4"
        );

    // 2. Cards Staggered Entry
    gsap.fromTo(".holo-card",
        { y: 100, opacity: 0, rotationX: 15 },
        {
            y: 0,
            opacity: 1,
            rotationX: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: "power3.out",
            scrollTrigger: {
                trigger: ".holo-grid-wrapper",
                start: "top 85%"
            }
        }
    );

    // 3. Scramble Text & Progress Bars
    const stats = document.querySelectorAll('.holo-card');

    stats.forEach(card => {
        const valueDisplay = card.querySelector('.scramble-text');
        const barFill = card.querySelector('.bar-fill');
        const originalText = valueDisplay.getAttribute('data-target');

        ScrollTrigger.create({
            trigger: card,
            start: "top 85%",
            onEnter: () => {
                // Scramble Effect
                let iteration = 0;
                const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
                const interval = setInterval(() => {
                    valueDisplay.innerText = originalText.split("")
                        .map((letter, index) => {
                            if (index < iteration) {
                                return originalText[index];
                            }
                            return characters[Math.floor(Math.random() * 26)];
                        })
                        .join("");

                    if (iteration >= originalText.length) {
                        clearInterval(interval);
                        valueDisplay.innerText = originalText;
                    }

                    iteration += 1 / 2; // Speed control
                }, 50);

                // Bar Fill Animation
                gsap.to(barFill, {
                    width: barFill.style.width,
                    duration: 1.5,
                    ease: "power2.out"
                });
            }
        });

        // Reset bar width initially
        gsap.set(barFill, { width: 0 });
    });
}


// Initialize Swiper Carousel
function initShowcaseCarousel() {
    var showcaseSwiper = new Swiper(".showcase-swiper", {
        effect: "coverflow",
        grabCursor: true,
        centeredSlides: true,
        slidesPerView: "auto",
        initialSlide: 1,
        loop: true,
        speed: 800,
        coverflowEffect: {
            rotate: 0,
            stretch: 0,
            depth: 200, // 3D Depth
            modifier: 1,
            slideShadows: false, // Cleaner look without dark shadows
        },
        autoplay: {
            delay: 3000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true
        },
        pagination: {
            el: ".swiper-pagination",
            clickable: true,
        },
        breakpoints: {
            320: { slidesPerView: 1.2, spaceBetween: 20 },
            768: { slidesPerView: "auto", spaceBetween: 30 }
        }
    });
}


function initTestimonialCarousel() {
    var swiper = new Swiper(".testimonial-swiper", {
        slidesPerView: 1,
        spaceBetween: 30,
        loop: true,
        speed: 800,
        grabCursor: true,
        autoplay: {
            delay: 4000,
            disableOnInteraction: false,
        },
        pagination: {
            el: ".swiper-pagination",
            clickable: true,
        },
        breakpoints: {
            768: {
                slidesPerView: 2,
                spaceBetween: 30,
            },
            1200: {
                slidesPerView: 3,
                spaceBetween: 40,
            },
        }
    });
}

// Typing/Scramble Effect for Breadcrumb
// function initTypingEffect() {
//     const el = document.querySelector('.cb-current');
//     if (!el) return;

//     const originalText = el.innerText.trim();
//     if (!originalText) return;

//     const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_!@#";

//     // Initial state
//     el.innerText = "";

//     let iteration = 0;

//     // Animate
//     let interval = setInterval(() => {
//         el.innerText = originalText.split("")
//             .map((letter, index) => {
//                 if (index < iteration) {
//                     return originalText[index];
//                 }
//                 return chars[Math.floor(Math.random() * chars.length)];
//             })
//             .join("");

//         if (iteration >= originalText.length) {
//             clearInterval(interval);
//             el.innerText = originalText;
//         }

//         iteration += 1 / 2; // Speed of reveal
//     }, 40); // Update frequency
// }

// --- GALLERY LOGIC ---
function initGallery() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('lightbox');

    if (!filterBtns.length || !galleryItems.length || !lightbox) return;

    // Filter Logic
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update Active State
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            // Animate Filtering
            const itemsToHide = [];
            const itemsToShow = [];

            galleryItems.forEach(item => {
                if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                    itemsToShow.push(item);
                } else {
                    itemsToHide.push(item);
                }
            });

            // GSAP Animation Sequence
            gsap.to(itemsToHide, {
                opacity: 0,
                scale: 0.8,
                duration: 0.3,
                ease: "power2.inOut",
                onComplete: () => {
                    itemsToHide.forEach(el => el.style.display = 'none');
                }
            });

            gsap.set(itemsToShow, { display: 'block', opacity: 0, scale: 0.8 });
            gsap.to(itemsToShow, {
                opacity: 1,
                scale: 1,
                duration: 0.5,
                stagger: 0.05,
                ease: "back.out(1.7)",
                delay: 0.2
            });
        });
    });

    // Lightbox Logic
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxTitle = document.getElementById('lightbox-title');
    const lightboxStudent = document.getElementById('lightbox-student');
    const closeBtn = document.querySelector('.lightbox-close');

    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            const imgSrc = item.querySelector('img').src;
            const title = item.querySelector('.project-name').innerText;
            const student = item.querySelector('.student-name').innerText;

            lightboxImg.src = imgSrc;
            lightboxTitle.innerText = title;
            lightboxStudent.innerText = student;

            // GSAP Entrance
            gsap.set(lightbox, { display: 'flex' });
            gsap.to(lightbox, { opacity: 1, duration: 0.4 });
            gsap.fromTo('.lightbox-content',
                { scale: 0.8, opacity: 0 },
                { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.7)", delay: 0.1 }
            );

            document.body.style.overflow = 'hidden'; // Stop scrolling
        });
    });

    const closeLightbox = () => {
        gsap.to('.lightbox-content', { scale: 0.8, opacity: 0, duration: 0.3, ease: "power2.in" });
        gsap.to(lightbox, {
            opacity: 0,
            duration: 0.3,
            delay: 0.1,
            onComplete: () => {
                lightbox.style.display = 'none';
                document.body.style.overflow = 'auto'; // Resume scrolling
            }
        });
    };

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);

    // Close on background click
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(Flip);

    const filterBtns = document.querySelectorAll('.filter-btn');
    const items = document.querySelectorAll('.course-item');

    // --- FILTERING LOGIC ---
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update Active State
            document.querySelector('.filter-btn.active').classList.remove('active');
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            // GSAP Flip for smooth reordering
            const state = Flip.getState(items);

            items.forEach(item => {
                // Filter Logic
                if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                    item.classList.remove('hidden');
                    gsap.to(item, { autoAlpha: 1, scale: 1, duration: 0.4 });
                } else {
                    item.classList.add('hidden');
                    gsap.to(item, { autoAlpha: 0, scale: 0.8, duration: 0.4 });
                }
            });

            // Animate layout change
            Flip.from(state, {
                duration: 0.7,
                ease: "power2.out",
                stagger: 0.05,
                absolute: true, // Crucial for grid animation
                onEnter: elements => gsap.fromTo(elements, { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, duration: 0.5 }),
                onLeave: elements => gsap.to(elements, { opacity: 0, scale: 0, duration: 0.5 })
            });
        });
    });
});