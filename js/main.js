document.addEventListener("DOMContentLoaded", () => {

    // --- Configuration ---
    const config = {
        frameCount: 1600,
        framePath: (index) => `Cam%20Frames/cam-${index}.webp`, // URL encoded space
        scrollDistance: "800%", // The scroll length (pin duration). 800vh seems appropriate for 1600 frames to feel controlled.
    };

    // --- State ---
    const state = {
        images: [],
        framesLoaded: 0,
        currentFrame: 0
    };

    // --- Elements ---
    const canvas = document.getElementById("sequence-canvas");
    const context = canvas.getContext("2d");
    const loader = document.getElementById("loader");
    const loaderFill = document.querySelector(".progress-fill");
    const loaderText = document.querySelector(".loader-count");

    // --- GSAP Registration ---
    gsap.registerPlugin(ScrollTrigger);



    // --- Image Preloading ---
    const preloadImages = () => {
        for (let i = 1; i <= config.frameCount; i++) {
            const img = new Image();
            img.src = config.framePath(i);

            img.onload = () => {
                if (i === 1) console.log("Success loading first image:", img.src);
                state.framesLoaded++;
                updateLoader();
            };

            img.onerror = (e) => {
                console.error(`Failed to load frame ${i}. Src: ${img.src}`);
                // Still count it as loaded to prevent stuck loader, but it might blink
                state.framesLoaded++;
                updateLoader();
            };

            state.images[i] = img; // Store at index matching the file number (1-based)
        }
    };

    const updateLoader = () => {
        const percent = Math.round((state.framesLoaded / config.frameCount) * 100);
        loaderFill.style.width = `${percent}%`;
        loaderText.textContent = `${percent}%`;

        if (state.framesLoaded === config.frameCount) {
            initScrollAnimation();

            // Hide loader with a fade out
            gsap.to(loader, {
                opacity: 0,
                duration: 1,
                onComplete: () => {
                    loader.style.display = "none";
                    // Initialize Smooth Scrolling (Lenis) after load
                    initSmoothScroll();
                    // Start Page Animations
                    initPageAnimations();
                }
            });
        }
    };

    // --- Render Rendering ---
    const render = () => {
        // Ensure index is within bounds (1 to 1600)
        let frameIndex = Math.max(1, Math.min(Math.round(state.currentFrame), config.frameCount));
        const img = state.images[frameIndex];

        if (img) {
            // "Object-fit: cover" logic for canvas
            const hRatio = canvas.width / img.width;
            const vRatio = canvas.height / img.height;
            const ratio = Math.max(hRatio, vRatio);

            const centerShift_x = (canvas.width - img.width * ratio) / 2;
            const centerShift_y = (canvas.height - img.height * ratio) / 2;

            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(
                img,
                0, 0, img.width, img.height,
                centerShift_x, centerShift_y, img.width * ratio, img.height * ratio
            );
        }
    };

    // --- Scroll Animation ---
    const initScrollAnimation = () => {
        // Object to animate
        const playhead = { frame: 1 };

        gsap.to(playhead, {
            frame: config.frameCount,
            ease: "none",
            scrollTrigger: {
                trigger: "#section-sequence",
                start: "top top", // Start when section hits top of viewport
                end: `+=${config.scrollDistance}`, // Pin for this distance
                pin: true, // Pin the section
                scrub: 0.5, // Smooth scrubbing (0.5s lag)
                // markers: true, // Debug markers (remove in prod)
                onUpdate: (self) => {
                    // Update state and render
                    state.currentFrame = playhead.frame;
                    render();
                }
            }
        });

        // Initial render
        state.currentFrame = 1;
        render();
    };

    // --- Smooth Scroll (Lenis) ---
    const initSmoothScroll = () => {
        const lenis = new Lenis();

        lenis.on('scroll', ScrollTrigger.update);

        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });

        gsap.ticker.lagSmoothing(0);
    };

    // --- Canvas Sizing (Must be defined after render) ---
    const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        render(); // Re-render current frame on resize
    };
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas(); // Initial size

    // --- Additional Animations ---
    const initPageAnimations = () => {
        // Hero Reveal
        gsap.from(".reveal-text", {
            y: 100,
            opacity: 0,
            duration: 1.5,
            stagger: 0.2,
            ease: "power4.out",
            delay: 0.5
        });

        // Counter Animation
        const stats = document.querySelectorAll(".stat-num");
        stats.forEach(stat => {
            const target = parseInt(stat.getAttribute("data-target"));
            gsap.to(stat, {
                innerText: target,
                duration: 2,
                snap: { innerText: 1 },
                scrollTrigger: {
                    trigger: stat,
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                },
                onUpdate: function () {
                    stat.innerHTML = Math.ceil(this.targets()[0].innerText) + "+";
                }
            });
        });

        // Sequence Text Fade In/Out
        gsap.to(".sequence-overlay", {
            opacity: 1,
            scrollTrigger: {
                trigger: "#section-sequence",
                start: "center center",
                end: "bottom center",
                toggleActions: "play reverse play reverse",
                scrub: true
            }
        });

        // Gallery Deck Scroll Animation
        const cards = document.querySelectorAll(".deck-card");
        if (cards.length > 0) {
            // Initial State: Stack them nicely? They are absolute, so they are already stacked.
            // visual offset (optional, like a real stack)
            cards.forEach((card, index) => {
                card.style.zIndex = cards.length - index;
            });

            const deckTimeline = gsap.timeline({
                scrollTrigger: {
                    trigger: "#gallery",
                    start: "top top",
                    end: "+=" + (cards.length * 100) + "%", // 100% viewport height per card
                    pin: true,
                    scrub: 1,
                    // markers: true
                }
            });

            cards.forEach((card, i) => {
                if (i < cards.length - 1) {
                    deckTimeline.to(card, {
                        yPercent: -100,
                        opacity: 0,
                        rotation: -5,
                        scale: 0.9,
                        duration: 1,
                        ease: "power2.inOut"
                    });
                }
            });
        }

        // Tools Horizontal Scroll
        const track = document.querySelector(".tools-track");
        if (track) {
            const scrollLength = track.scrollWidth - window.innerWidth + 100; // Add buffer
            gsap.to(track, {
                x: -scrollLength,
                ease: "none",
                scrollTrigger: {
                    trigger: "#tools",
                    pin: true,
                    scrub: 1,
                    end: "+=" + scrollLength // Scroll distance matches track width
                }
            });
        }
    };

    // --- Navigation Logic ---
    const initNavigation = () => {
        const header = document.querySelector(".header");
        const toggle = document.querySelector(".mobile-toggle");
        const mobileMenu = document.querySelector(".mobile-menu");
        const mobileLinks = document.querySelectorAll(".mobile-link");
        const logo = document.querySelector(".logo");

        // Easter Egg: 5 Clicks to Admin
        let logoClicks = 0;
        let clickTimer;
        if (logo) {
            logo.addEventListener("click", (e) => {
                e.preventDefault(); // Prevent default # link
                logoClicks++;
                clearTimeout(clickTimer);

                if (logoClicks >= 5) {
                    window.location.href = "admin.html";
                } else {
                    // Reset count if not clicked rapidly (1 sec window)
                    clickTimer = setTimeout(() => { logoClicks = 0; }, 1000);
                }
            });
        }

        // Sticky Header
        window.addEventListener("scroll", () => {
            if (window.scrollY > 50) {
                header.classList.add("scrolled");
            } else {
                header.classList.remove("scrolled");
            }
        });

        // Mobile Menu Toggle
        toggle.addEventListener("click", () => {
            mobileMenu.classList.toggle("active");
            // Optional: Animate hamburger to X
        });

        // Close menu/link click
        mobileLinks.forEach((link, index) => {
            link.style.transitionDelay = `${index * 0.1}s`; // Stagger effect
            link.addEventListener("click", () => {
                mobileMenu.classList.remove("active");
            });
        });
    };

    // --- Archive / Dynamic Gallery Logic ---
    const loadArchive = async (filter = 'All') => {
        const container = document.getElementById('dynamic-gallery');
        if (!container) return; // Guard clause if section missing

        try {
            // Add loading state
            // container.innerHTML = '<div class="loader-spinner"...>Loading...</div>'; 

            let url = 'http://localhost:3000/api/images';
            if (filter !== 'All') {
                url += `?category=${filter}`;
            }

            const res = await fetch(url);
            const images = await res.json();

            container.innerHTML = ''; // Clear loader

            if (images.length === 0) {
                container.innerHTML = '<p style="color:#666; text-align:center; grid-column: 1/-1; padding:2rem;">No images found in Archive.</p>';
                return;
            }

            images.forEach((img, index) => {
                const item = document.createElement('div');
                item.className = `gallery-item glass-card`; // Uniform size
                item.innerHTML = `
                    <img src="${img.imageUrl}" alt="${img.title}">
                    <div class="overlay"><span>${img.category}</span></div>
                `;
                container.appendChild(item);
            });

            // Animate Entrance
            gsap.from(container.children, {
                y: 30, opacity: 0, duration: 0.5, stagger: 0.05
            });

        } catch (err) {
            console.error("Archive fetch error:", err);
            container.innerHTML = '<p style="color:red; text-align:center; grid-column: 1/-1;">Archive Offline (Server not running)</p>';
        }
    };

    // Initialize Archive
    loadArchive();

    // Filter Buttons
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const category = btn.getAttribute('data-filter');
            loadArchive(category);
        });
    });

    // --- Start ---
    preloadImages();
    initNavigation();
});
