// Initialize Lucide icons
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();

    // Mobile Menu Toggle
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileBtn && navLinks) {
        mobileBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = mobileBtn.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.setAttribute('data-lucide', 'x');
            } else {
                icon.setAttribute('data-lucide', 'menu');
            }
            lucide.createIcons();
        });
        
        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                mobileBtn.querySelector('i').setAttribute('data-lucide', 'menu');
                lucide.createIcons();
            });
        });
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                // Offset for fixed header
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });

    // Antigravity Background Animation (3D Globe + Side Frequency Dots)
    const canvas = document.getElementById('bg-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height;
        let animationFrameId;

        // Responsive Configuration
        const isMobile = window.innerWidth < 768;
        
        // Globe Particles - Reduce count on mobile for performance
        let particles = [];
        const particleCount = isMobile ? 600 : 1200;

        // Side Frequency Dots
        let sideParticles = [];
        const sideCountPerSide = isMobile ? 8 : 15; 

        // Interaction State
        let mouseX = 0;
        let mouseY = 0;
        let isTyping = false;
        let typingTimeout;
        
        // Performance optimization: Throttle resize events
        let resizeTimeout;

        // Detect Typing
        const inputs = document.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                isTyping = true;
                clearTimeout(typingTimeout);
                typingTimeout = setTimeout(() => {
                    isTyping = false;
                }, 200); 
            });
        });

        function resize() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            // Re-init particles on significant resize if needed, 
            // but for smooth mobile browser address bar interaction, maybe just update bounds.
            // For now, we'll keep it simple.
        }

        // --- Globe Particle Class ---
        class Particle {
            constructor(theta, phi) {
                this.theta = theta;
                this.phi = phi;
                this.size = isMobile ? 0.6 : 0.8;
                this.baseColor = `rgba(59, 130, 246`;
            }

            update(rotationX, rotationY) {
                // Adjust globe size for mobile
                const globeScale = isMobile ? 0.25 : 0.35;
                const r = Math.min(width, height) * globeScale;

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
                const perspective = isMobile ? 250 : 300;
                const scale = perspective / (perspective + z2);
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
                const verticalSpan = isMobile ? 0.8 : 0.6;
                const startRatio = isMobile ? 0.1 : 0.2;
                
                const spacing = height * verticalSpan / total;
                const startY = height * startRatio;
                this.baseY = startY + index * spacing;

                this.baseX = side === 'left' ? (isMobile ? 15 : 40) : width - (isMobile ? 15 : 40);
                this.x = this.baseX;
                this.y = this.baseY;

                this.size = isMobile ? 1.5 : 2.5;
                this.color = side === 'left' ? 'rgba(59, 130, 246, 1.0)' : 'rgba(139, 92, 246, 1.0)';
            }

            update(time) {
                if (isTyping) {
                    const speed = 8;
                    const frequency = 0.8;
                    const wave = Math.sin(time * speed + this.index * frequency);
                    // Less extreme stretch on mobile
                    const toggleFactor = isMobile ? 3 : 5;
                    const stretch = 1 + ((wave + 1) / 2) * toggleFactor;

                    this.x = this.baseX; 
                    this.scaleX = stretch;
                    this.scaleY = 1;
                    this.alpha = 1.0;
                } else {
                    this.x = this.baseX;
                    this.scaleX = 1;
                    this.scaleY = 1;
                    this.alpha = 0.6;
                }
            }

            draw() {
                ctx.beginPath();
                // Add glow effect - reduce for mobile performance
                if (!isMobile) {
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = this.color;
                }

                ctx.ellipse(this.x, this.y, this.size * this.scaleX, this.size * this.scaleY, 0, 0, Math.PI * 2);
                ctx.fillStyle = this.color.replace('1.0)', `${this.alpha})`);
                ctx.fill();

                if (!isMobile) {
                    ctx.shadowBlur = 0;
                }
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

            // Init Side Particles
            sideParticles = [];
            for (let i = 0; i < sideCountPerSide; i++) {
                sideParticles.push(new SideParticle('left', i, sideCountPerSide));
                sideParticles.push(new SideParticle('right', i, sideCountPerSide));
            }
        }

        // Track mouse - normalize for mobile touch if needed
        document.addEventListener('mousemove', (e) => {
            mouseX = (e.clientX - window.innerWidth / 2) * 0.001;
            mouseY = (e.clientY - window.innerHeight / 2) * 0.001;
        });
        
        // Basic touch interaction for mobile
        document.addEventListener('touchmove', (e) => {
             if (e.touches.length > 0) {
                const touch = e.touches[0];
                mouseX = (touch.clientX - window.innerWidth / 2) * 0.001;
                mouseY = (touch.clientY - window.innerHeight / 2) * 0.001;
             }
        }, { passive: true });


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

            animationFrameId = requestAnimationFrame(animate);
        }

        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                resize();
                // Optionally re-init to adjust particle counts dynamically
                // init(); 
            }, 100);
        });

        // Ensure canvas is sized before init
        init();
        animate();
    }
});


