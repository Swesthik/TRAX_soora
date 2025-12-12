// Initialize Lucide icons
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();

    // Mobile Menu Toggle
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileBtn) {
        mobileBtn.addEventListener('click', () => {
            const isHidden = navLinks.style.display === 'none' || !navLinks.style.display;
            navLinks.style.display = isHidden ? 'flex' : 'none';
            if (isHidden) {
                navLinks.style.flexDirection = 'column';
                navLinks.style.position = 'absolute';
                navLinks.style.top = '80px';
                navLinks.style.left = '0';
                navLinks.style.width = '100%';
                navLinks.style.background = '#ffffff';
                navLinks.style.padding = '20px';
                navLinks.style.borderBottom = '1px solid var(--border-color)';
            } else {
                navLinks.style = '';
            }
        });
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
                if (window.innerWidth <= 768) {
                    navLinks.style = '';
                }
            }
        });
    });

    // Antigravity Background Animation (3D Globe + Side Frequency Dots)
    const canvas = document.getElementById('bg-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height;

        // Globe Particles
        let particles = [];
        const particleCount = 1200;

        // Side Frequency Dots
        let sideParticles = [];
        const sideCountPerSide = 15; // 15 dots on left, 15 on right

        // Interaction State
        let mouseX = 0;
        let mouseY = 0;
        let isTyping = false;
        let typingTimeout;

        // Detect Typing
        const inputs = document.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                isTyping = true;
                clearTimeout(typingTimeout);
                typingTimeout = setTimeout(() => {
                    isTyping = false;
                }, 200); // Stop effect 200ms after last keystroke
            });
        });

        function resize() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        }

        // --- Globe Particle Class ---
        class Particle {
            constructor(theta, phi) {
                this.theta = theta;
                this.phi = phi;
                this.size = 0.8;
                this.baseColor = `rgba(59, 130, 246`;
            }

            update(rotationX, rotationY) {
                const r = Math.min(width, height) * 0.35;

                let x = r * Math.sin(this.phi) * Math.cos(this.theta);
                let y = r * Math.sin(this.phi) * Math.sin(this.theta);
                let z = r * Math.cos(this.phi);

                // Rotate around Y axis
                let x1 = x * Math.cos(rotationY) - z * Math.sin(rotationY);
                let z1 = z * Math.cos(rotationY) + x * Math.sin(rotationY);

                // Rotate around X axis
                let y1 = y * Math.cos(rotationX) - z1 * Math.sin(rotationX);
                let z2 = z1 * Math.cos(rotationX) + y * Math.sin(rotationX);

                // Project to 2D
                const scale = 300 / (300 + z2);
                this.x2d = width / 2 + x1 * scale;
                this.y2d = height / 2 + y1 * scale;

                this.scale = scale;
                this.alpha = Math.max(0.05, (scale - 0.5) * 0.6);
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x2d, this.y2d, this.size * this.scale, 0, Math.PI * 2);
                ctx.fillStyle = `${this.baseColor}, ${this.alpha})`;
                ctx.fill();
            }
        }

        // --- Side Frequency Dot Class ---
        class SideParticle {
            constructor(side, index, total) {
                this.side = side; // 'left' or 'right'
                this.index = index;
                this.total = total;

                // Distribute vertically with some padding
                const spacing = height * 0.6 / total;
                const startY = height * 0.2;
                this.baseY = startY + index * spacing;

                this.baseX = side === 'left' ? 40 : width - 40;
                this.x = this.baseX;
                this.y = this.baseY;

                this.size = 2.5;
                // Max brightness (opacity 1.0)
                this.color = side === 'left' ? 'rgba(59, 130, 246, 1.0)' : 'rgba(139, 92, 246, 1.0)';
            }

            update(time) {
                if (isTyping) {
                    // Typing mode: Formal/Smooth Horizontal Fluctuation
                    // Use a sine wave to create a rhythmic "breathing" or "equalizer" pattern
                    const speed = 8;
                    const frequency = 0.8;

                    // Wave calculation: -1 to 1
                    const wave = Math.sin(time * speed + this.index * frequency);

                    // Map wave to stretch factor: 1x to 6x width
                    // (wave + 1) / 2 goes from 0 to 1.
                    const stretch = 1 + ((wave + 1) / 2) * 5;

                    this.x = this.baseX; // Keep centered
                    this.scaleX = stretch;
                    this.scaleY = 1;
                    this.alpha = 1.0;
                } else {
                    // Idle mode: Stable
                    this.x = this.baseX;
                    this.scaleX = 1;
                    this.scaleY = 1;
                    this.alpha = 0.6; // Brighter idle
                }
            }

            draw() {
                ctx.beginPath();
                // Add glow effect
                ctx.shadowBlur = 10;
                ctx.shadowColor = this.color;

                ctx.ellipse(this.x, this.y, this.size * this.scaleX, this.size * this.scaleY, 0, 0, Math.PI * 2);
                ctx.fillStyle = this.color.replace('1.0)', `${this.alpha})`);
                ctx.fill();

                // Reset shadow to avoid affecting other elements
                ctx.shadowBlur = 0;
            }
        }

        function init() {
            resize();

            // Init Globe Particles
            particles = [];
            let count = 0;
            let attempts = 0;
            while (count < particleCount && attempts < particleCount * 2) {
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos((Math.random() * 2) - 1);
                const n1 = Math.sin(theta * 3) * Math.cos(phi * 3);
                const n2 = Math.sin(theta * 7 + phi * 2);
                const noise = n1 + n2 * 0.5;

                if (noise > -0.2) {
                    particles.push(new Particle(theta, phi));
                    count++;
                }
                attempts++;
            }
            console.log(`Initialized ${particles.length} globe particles.`);

            // Init Side Particles
            sideParticles = [];
            for (let i = 0; i < sideCountPerSide; i++) {
                sideParticles.push(new SideParticle('left', i, sideCountPerSide));
                sideParticles.push(new SideParticle('right', i, sideCountPerSide));
            }
            console.log(`Initialized ${sideParticles.length} side particles.`);
        }

        // Track mouse
        document.addEventListener('mousemove', (e) => {
            mouseX = (e.clientX - window.innerWidth / 2) * 0.001;
            mouseY = (e.clientY - window.innerHeight / 2) * 0.001;
        });



        let rotY = 0;
        let rotX = 0;

        function animate() {
            ctx.clearRect(0, 0, width, height);
            const time = Date.now() * 0.001;

            // 1. Update & Draw Globe
            let targetRotY = mouseX * 2;
            let targetRotX = mouseY * 2;
            rotY += (targetRotY - rotY) * 0.05 + 0.002;
            rotX += (targetRotX - rotX) * 0.05 + 0.001;

            particles.forEach(p => {
                p.update(rotX, rotY);
                p.draw();
            });

            // 2. Update & Draw Side Dots
            sideParticles.forEach(p => {
                p.update(time);
                p.draw();
            });



            requestAnimationFrame(animate);
        }

        window.addEventListener('resize', () => {
            resize();
            init();
        });

        // Ensure canvas is sized before init
        resize();
        init();
        animate();
        console.log("Animation started.");
    } else {
        console.error("Canvas element not found!");
    }
});


