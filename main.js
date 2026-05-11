import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// Evita que ScrollTrigger haga refresh cuando la URL bar de Chrome mobile
// aparece/desaparece (causa saltos y bloqueos de scroll en Android)
ScrollTrigger.config({ ignoreMobileResize: true });

// Wrapper seguro: no hace refresh en mobile (evita bloqueos por URL bar de Chrome Android)
// FIX: era recursión infinita — ahora llama correctamente a ScrollTrigger.refresh()
const safeRefresh = () => {
    if (!window.matchMedia("(hover: none)").matches) {
        ScrollTrigger.refresh();
    }
};

// FIX FLASHAZO AL VOLVER A LA PESTAÑA:
// GSAP compensa el tiempo perdido (lagSmoothing) saltando animaciones al estado final de golpe.
// Desactivarlo evita el flash al cambiar de pestaña.
// Solución oficial GreenSock: gsap.com/community/forums/topic/26602
gsap.ticker.lagSmoothing(false);

/**
 * OddXandre Portfolio
 * Premium ease: cubic-bezier(0.16, 1, 0.3, 1)
 */

const PREMIUM_EASE = "cubic-bezier(0.16, 1, 0.3, 1)";
const LINE_EASE = "expo.out";

window.addEventListener("load", () => {
    // --- 1. CONSTANTES Y SELECCIÓN DE ELEMENTOS ---
    const navLinks = document.querySelectorAll(".nav-links a, .mobile-logo");
    const activePill = document.querySelector(".active-pill");
    const pageContent = document.querySelector("#page-content");

    // --- 2. AYUDANTES (HELPERS) ---
    const getCleanPath = (path) => {
        if (!path) return "index";
        let base = path.split("?")[0].split("#")[0];
        let clean = base.replace(/\/$/, "").split("/").pop().replace(".html", "");
        return (clean === "" || clean === "index") ? "index" : clean;
    };

    const updateYear = () => {
        const yearElement = document.getElementById("current-year");
        if (yearElement) yearElement.textContent = new Date().getFullYear();
    };

    const normalizeUrlHistory = (href) => {
        return href === "index.html" ? "/" : href;
    };

    // --- 3. INICIALIZADORES DE COMPONENTES ---

    function initParallax() {
        const heroImg = document.querySelector(".hero-header-img");
        if (!heroImg || heroImg.hasParallax) return;
        heroImg.hasParallax = true;

        const xTo = gsap.quickTo(heroImg, "x", { duration: 1.2, ease: "power2.out" });
        const yTo = gsap.quickTo(heroImg, "y", { duration: 1.2, ease: "power2.out" });

        // THROTTLE: Solo ejecutar cada 16ms (60fps máximo)
        let ticking = false;
        let lastX = 0, lastY = 0;

        window.addEventListener("mousemove", (e) => {
            if (!document.contains(heroImg)) return;

            lastX = e.clientX;
            lastY = e.clientY;

            if (!ticking) {
                requestAnimationFrame(() => {
                    const { innerWidth, innerHeight } = window;
                    xTo(-((lastX - innerWidth / 2) / innerWidth) * 6.5);
                    yTo(-((lastY - innerHeight / 2) / innerHeight) * 2.5);
                    ticking = false;
                });
                ticking = true;
            }
        });
    }
    function initHome(isReturning) {
        if (!document.querySelector(".hero-container")) return;

        const navbar = document.querySelector(".navbar");
        gsap.killTweensOf([".hero-header-img", ".hero-text-line", ".navbar"]);
        updateYear();
        initParallax();

        const isDesktop = !mobileQuery.matches;

        if (isReturning) {
            if (isDesktop) {
                gsap.set(".navbar", { y: 0, autoAlpha: 1 });
            } else {
                // En móvil forzamos limpieza para que mande el CSS
                gsap.set(".navbar", { clearProps: "transform", autoAlpha: 1 });
            }
            gsap.set(".hero-header-img", { autoAlpha: 0.05 });
            gsap.set(".hero-footer-text .hero-text-line", { y: "0%", autoAlpha: 1 });
            gsap.set(".hero-center-logo", { y: "0%", autoAlpha: 0.5 });
            gsap.set(".hero-signature", { clipPath: "inset(0% 0 0 0)", autoAlpha: 1, scale: 1 });
        } else {
            gsap.set(".hero-header-img", { autoAlpha: 0, scale: 0.95 });
            gsap.set(".hero-text-line, .hero-center-logo", { y: "105%", autoAlpha: 0 });
            gsap.set(".hero-signature", { clipPath: "inset(100% 0 0 0)", autoAlpha: 0, scale: 1.05 });
        }
    }

    function initRollingText() {
        document.querySelectorAll('.nav-links a, .cta-button, .download-text, .back-text, .next-text').forEach(link => {
            if (link.querySelector('.roll-char-wrapper') || link.classList.contains('logo-item') || link.querySelector('img')) return;

            let text = link.textContent.trim().toUpperCase();
            if (!text) return;

            // ELIMINAR TILDES SOLO PARA EL MENÚ ANIMADO (Previene roturas de fuente)
            text = text.replace(/Í/g, 'I')
                .replace(/Á/g, 'A')
                .replace(/É/g, 'E')
                .replace(/Ó/g, 'O')
                .replace(/Ú/g, 'U');

            link.innerHTML = '';

            [...text].forEach((char, i) => {
                const wrapper = document.createElement('span');
                wrapper.className = 'roll-char-wrapper';

                if (char === ' ') {
                    wrapper.innerHTML = '&nbsp;';
                    wrapper.style.display = 'inline';
                } else {
                    const createChar = (cls) => {
                        const s = document.createElement('span');
                        s.className = `roll-char ${cls}`;
                        s.textContent = char;
                        s.style.transitionDelay = `${i * 0.02}s`;
                        return s;
                    };
                    wrapper.append(createChar('original'), createChar('clone'));
                }
                link.appendChild(wrapper);
            });
        });
    }

    let manifestoST = null;
    function initManifesto() {
        const manifestoText = document.querySelector(".manifesto-text");
        if (!manifestoText) return;

        if (manifestoST) manifestoST.kill();

        if (!manifestoText.querySelector(".word-span")) {
            const words = manifestoText.textContent.replace(/\s+/g, " ").trim().split(" ");
            manifestoText.innerHTML = "";
            words.forEach(word => {
                const span = document.createElement("span");
                span.textContent = word;
                span.className = "word-span";
                manifestoText.append(span, " ");
            });
        }

        gsap.set(".word-span", { opacity: 0.05 }); // Más tenue inicialmente
        manifestoST = ScrollTrigger.create({
            trigger: ".manifesto-container",
            start: "top 90%", // Empieza antes
            end: "bottom 50%", // Termina más tarde
            scrub: 1.5, // Scrub más suave (1.5 segundos de delay)
            // Stagger aumentado y duración extendida para suavidad suprema
            animation: gsap.to(".word-span", { opacity: 0.95, stagger: 0.08, duration: 1.8, ease: "power1.inOut" })
        });
    }

    function initCTA() {
        const btn = document.querySelector(".cta-button");
        if (!btn) return;
        gsap.fromTo(btn, { y: 60, autoAlpha: 0 }, {
            y: 0, autoAlpha: 1, duration: 2.0, ease: PREMIUM_EASE,
            scrollTrigger: { trigger: ".cta-container", start: "top 95%", toggleActions: "play none none reverse" }
        });
    }

    function initFooter() {
        const footerSection = document.querySelector(".footer-section");
        const pageContent = document.querySelector("#page-content");
        const yearSpan = document.querySelector("#current-year");

        if (!footerSection || !pageContent) return;

        if (yearSpan) yearSpan.textContent = new Date().getFullYear();

        const isMobile = () => window.innerWidth <= 768;

        // Variable para evitar múltiples ejecuciones
        let isAdjusting = false;
        let lastHeight = 0;

        function adjustFooterSpacer() {
            if (isAdjusting) return;

            isAdjusting = true;

            const footerHeight = footerSection.offsetHeight;

            if (footerHeight > 0 && footerHeight !== lastHeight) {
                lastHeight = footerHeight;
                // Aplicar en todos los tamaños: el footer es fixed y tapa contenido siempre
                pageContent.style.marginBottom = `${footerHeight}px`;

                setTimeout(() => {
                    safeRefresh();
                    isAdjusting = false;
                }, 100);
            } else {
                isAdjusting = false;
            }
        }

        // Ejecutar solo UNA VEZ al cargar
        adjustFooterSpacer();

        // Cargar imágenes
        footerSection.querySelectorAll("img").forEach(img => {
            if (!img.complete) {
                img.onload = adjustFooterSpacer;
            }
        });

        // Resize con debounce largo
        let resizeTimeout;
        window.addEventListener("resize", () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(adjustFooterSpacer, 300); // 300ms de delay
        });
    }


    function initContactBorder() {
        if (!document.querySelector(".contact-border-svg")) return;

        function updateBorderPaths() {
            const svg = document.querySelector(".contact-border-svg");
            const width = svg.clientWidth;
            const height = svg.clientHeight;
            const radius = 20; // Radio de la esquina

            // Path Izquierdo: Centro -> Curva -> Top -> Bottom
            // M W/2,0 L R,0 Q 0,0 0,R L 0,H
            const pathLeftStr = `M ${width / 2},0 L ${radius},0 Q 0,0 0,${radius} L 0,${height}`;

            // Path Derecho: Centro -> Curva -> Top -> Bottom
            // M W/2,0 L W-R,0 Q W,0 W,R L W,H
            const pathRightStr = `M ${width / 2},0 L ${width - radius},0 Q ${width},0 ${width},${radius} L ${width},${height}`;

            const pathLeft = document.querySelector(".border-path-left");
            const pathRight = document.querySelector(".border-path-right");

            if (pathLeft && pathRight) {
                pathLeft.setAttribute("d", pathLeftStr);
                pathRight.setAttribute("d", pathRightStr);

                // Preparar para stroke animation
                const lenLeft = pathLeft.getTotalLength();
                const lenRight = pathRight.getTotalLength();

                pathLeft.style.strokeDasharray = lenLeft;
                pathLeft.style.strokeDashoffset = lenLeft;

                pathRight.style.strokeDasharray = lenRight;
                pathRight.style.strokeDashoffset = lenRight;
            }
        }

        // Calcular paths iniciales
        updateBorderPaths();

        // Recalcular en resize
        window.addEventListener("resize", () => {
            updateBorderPaths();
            safeRefresh();
        });

        safeRefresh();
    }

    function initContactCard() {
        const card = document.querySelector(".contact-card");
        if (!card) return;

        // Apple-style card entrance: scale + opacity
        gsap.set(card, { scale: 0.97, autoAlpha: 0 });

        const isContactPage = document.body.classList.contains("page-contact");

        if (isContactPage) {
            // On the dedicated contact page the card is already in view on load,
            // so fire the animation directly (no scroll needed).
            gsap.to(card, {
                scale: 1,
                autoAlpha: 1,
                duration: 1.2,
                delay: 0.3,
                ease: PREMIUM_EASE
            });
        } else {
            // On other pages (index.html) use the scroll trigger as before.
            gsap.to(card, {
                scale: 1,
                autoAlpha: 1,
                duration: 1.2,
                ease: PREMIUM_EASE,
                scrollTrigger: {
                    trigger: ".contact-cta-section",
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                }
            });
        }
    }

    // --- Contact Bento Page ---
    let bentoClockInterval = null;

    function initContactPage() {
        const bentoGrid = document.querySelector(".bento-grid");
        if (!bentoGrid) return;

        // 1. Live Clock (CET)
        if (bentoClockInterval) clearInterval(bentoClockInterval);
        const clockEl = document.getElementById("bento-clock");
        if (clockEl) {
            function updateClock() {
                const now = new Date();
                const timeStr = now.toLocaleTimeString("es-ES", {
                    timeZone: "Europe/Madrid",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit"
                });
                clockEl.textContent = timeStr;
            }
            updateClock();
            bentoClockInterval = setInterval(updateClock, 1000);
        }

        // 2. Staggered Card Entrance
        const cards = bentoGrid.querySelectorAll(".bento-card");
        if (cards.length > 0) {
            gsap.set(cards, { autoAlpha: 0, y: 40 });
            gsap.to(cards, {
                autoAlpha: 1,
                y: 0,
                duration: 1.2,
                stagger: 0.12,
                ease: PREMIUM_EASE,
                delay: 0.2
            });
        }
    }

    function initScrollIndicator() {
        const indicator = document.querySelector(".scroll-indicator");
        if (!indicator) return;

        gsap.to(indicator, {
            autoAlpha: 0,
            y: 20,
            duration: 0.6,
            ease: PREMIUM_EASE,
            scrollTrigger: {
                trigger: ".hero-container",
                start: "bottom 90%",
                toggleActions: "play none none reverse"
            }
        });
    }

    function initBackToTop() {
        let btn = document.querySelector(".back-to-top");

        // No mostrar en Trabajo, Contacto ni Sobre mí
        const hiddenPages = ["work", "contact", "about"]; // Añadido "about" aquí
        const currentPath = getCleanPath(window.location.pathname);

        if (hiddenPages.includes(currentPath)) {
            if (btn) btn.remove();
            return;
        }

        // Resto de la lógica para crear el botón en otras páginas...
        if (!btn) {
            btn = document.createElement("button");
            btn.className = "back-to-top";
            btn.setAttribute("aria-label", "Volver arriba");
            btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>`;
            document.body.appendChild(btn);

            btn.addEventListener("click", () => {
                gsap.to(window, {
                    scrollTo: { y: 0, autoKill: false },
                    duration: 1.5,
                    ease: PREMIUM_EASE
                });
            });
        }

        gsap.set(btn, { display: "flex" });

        const contactSection = document.querySelector(".contact-cta-section");
        ScrollTrigger.create({
            trigger: contactSection || document.body,
            start: contactSection ? "top 80%" : "800 top",
            onEnter: () => btn.classList.add("visible"),
            onLeaveBack: () => btn.classList.remove("visible")
        });
    }

    function initMarquee() {
        const track = document.querySelector(".marquee-track");
        if (!track) return;
        const items = track.querySelectorAll(".marquee-item");
        if (items.length === 0) return;

        let moveDistance = 0;
        for (let i = 0; i < items.length / 2; i++) {
            const gap = parseFloat(window.getComputedStyle(track).gap) || 0;
            moveDistance += items[i].offsetWidth + gap;
        }

        gsap.to(track, {
            x: -moveDistance, duration: 45, ease: "none", repeat: -1, // Un poco más lento (45s) para elegancia
            onReverseComplete: function () { this.totalTime(this.rawTime() + this.duration() * 100); }
        });
    }

    function initPhilosophy() {
        const cards = document.querySelectorAll(".philosophy-card");
        if (cards.length === 0) return;

        ScrollTrigger.saveStyles(".philosophy-card");
        let mm = gsap.matchMedia();

        mm.add("(min-width: 768px)", () => {
            gsap.set(cards, { y: 80, autoAlpha: 0 });
            gsap.to(cards, {
                y: 0, autoAlpha: 1, stagger: 0.2, duration: 2.0, ease: PREMIUM_EASE,
                scrollTrigger: { trigger: ".philosophy-section", start: "top 80%", end: "top 20%", scrub: 1.2, invalidateOnRefresh: true }
            });
        });
        mm.add("(max-width: 767px)", () => gsap.set(cards, { y: 0, autoAlpha: 1 }));
    }

    function initExperience() {
        const intro = document.querySelectorAll(".experience-title, .experience-description, .download-link");
        const header = document.querySelector(".experience-table-header");
        const headerLabels = document.querySelectorAll(".header-label");
        const items = document.querySelectorAll(".experience-item");

        if (!header || items.length === 0) return;

        // Estado inicial
        gsap.set(intro, { autoAlpha: 0, y: 60 });
        gsap.set(headerLabels, { autoAlpha: 0, y: 30 });
        gsap.set([items, header], { "--line-scale": 0, autoAlpha: (i, t) => t.classList.contains('experience-item') ? 0 : 1, y: (i, t) => t.classList.contains('experience-item') ? 60 : 0 });

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: ".experience-container",
                start: "top 90%", // Start antes para más tiempo
                end: "bottom 20%",
                toggleActions: "play none none reverse"
            }
        });

        // Secuencia de animación
        tl.to(".experience-title", { autoAlpha: 1, y: 0, duration: 1.8, ease: PREMIUM_EASE })
            .to(".experience-description", { autoAlpha: 0.5, y: 0, duration: 1.8, ease: PREMIUM_EASE }, "-=1.5") // Overlap extremo
            .to(".download-link", { autoAlpha: 1, y: 0, duration: 1.8, ease: PREMIUM_EASE, onComplete: () => gsap.set(".download-link", { clearProps: "opacity" }) }, "-=1.6")

            .to(header, { "--line-scale": 1, duration: 1.5, ease: LINE_EASE }, "-=1.2")
            .to(headerLabels, { autoAlpha: 0.4, y: 0, duration: 1.2, stagger: 0.08, ease: PREMIUM_EASE }, "-=1.3")

            .to(items, {
                autoAlpha: 1,
                y: 0,
                "--line-scale": 1,
                duration: 1,
                ease: PREMIUM_EASE,
                stagger: 0.12
            }, "-=1.0");
    }

    function initWorkPage() {
        const gridItems = document.querySelectorAll(".work-item");
        if (gridItems.length === 0) return;

        gsap.killTweensOf(gridItems);

        gsap.set(gridItems, {
            autoAlpha: 0,
            y: 60,
            scale: 1,
            force3D: true
        });

        gsap.to(gridItems, {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 1.75,
            stagger: 0.15,
            ease: "expo.out",
            overwrite: "auto"
        });

        gridItems.forEach(item => {
            const container = item.querySelector(".work-image-container");
            const img = item.querySelector(".work-image, .placeholder-image");
            const HOVER_DURATION = 0.4;

            item.addEventListener("mouseenter", () => {
                // Dim others
                gsap.to(Array.from(gridItems).filter(i => i !== item), {
                    autoAlpha: 0.4,
                    duration: HOVER_DURATION,
                    ease: PREMIUM_EASE,
                    overwrite: "auto"
                });

                gsap.to(item, {
                    y: -6,
                    autoAlpha: 1,
                    duration: HOVER_DURATION,
                    ease: PREMIUM_EASE,
                    overwrite: "auto"
                });
                if (container) {
                    gsap.to(container, {
                        boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
                        duration: HOVER_DURATION,
                        ease: PREMIUM_EASE,
                        overwrite: "auto"
                    });
                }
                if (img) {
                    gsap.to(img, {
                        scale: 1.0075, // Sutil
                        duration: HOVER_DURATION + 0.2,
                        ease: PREMIUM_EASE,
                        overwrite: "auto"
                    });
                }
            });

            item.addEventListener("mouseleave", () => {
                // Reset all
                gsap.to(gridItems, {
                    autoAlpha: 1,
                    duration: HOVER_DURATION,
                    ease: PREMIUM_EASE,
                    overwrite: "auto"
                });

                gsap.to(item, {
                    y: 0,
                    duration: HOVER_DURATION,
                    ease: PREMIUM_EASE,
                    overwrite: "auto"
                });
                if (container) {
                    gsap.to(container, {
                        boxShadow: "0 0px 0px rgba(0,0,0,0)",
                        duration: HOVER_DURATION,
                        ease: PREMIUM_EASE,
                        overwrite: "auto"
                    });
                }
                if (img) {
                    gsap.to(img, {
                        scale: 1,
                        duration: HOVER_DURATION,
                        ease: PREMIUM_EASE,
                        overwrite: "auto"
                    });
                }
            });
        });
    }

    let lbItems = [];
    let lbIndex = 0;

    const updateLightboxContent = (initialState = null) => {
        const lightbox = document.getElementById("lightbox");
        if (!lightbox) return;
        const content = lightbox.querySelector(".lightbox-content");
        const counter = lightbox.querySelector(".lightbox-counter");

        const item = lbItems[lbIndex];
        content.innerHTML = "";

        if (item.tagName === "IMG") {
            const img = document.createElement("img");
            img.src = item.src;
            img.alt = item.alt || "Project Image";
            content.appendChild(img);
        } else if (item.tagName === "VIDEO") {
            const videoWrapper = document.createElement("div");
            videoWrapper.className = "lightbox-video-wrapper";

            const isNoControls = item.classList.contains("no-controls");

            const video = document.createElement("video");
            const src = item.querySelector("source") ? item.querySelector("source").src : item.src;
            video.src = src;
            video.loop = true;
            video.playsInline = true;

            if (isNoControls) {
                video.autoplay = true;
                video.muted = true;
                video.controls = false;
                videoWrapper.appendChild(video);
            } else {
                video.controls = true; // Controles nativos siempre — Samsung Browser los necesita desde el inicio
                video.autoplay = false;
                video.muted = false;

                if (initialState) {
                    video.currentTime = initialState.currentTime;
                    if (!initialState.paused) {
                        video.muted = false; // Unmute on expansion because it's a user action
                        video.autoplay = true;
                        // Force play in case autoplay is blocked while unmuted
                        setTimeout(() => {
                            video.play().catch(() => {
                                video.muted = true;
                                video.play();
                            });
                        }, 100);
                    }
                }

                videoWrapper.appendChild(video);
            }
            content.appendChild(videoWrapper);
        }

        counter.textContent = `${lbIndex + 1} / ${lbItems.length}`;
    };

    const nextLbItem = () => {
        if (lbItems.length === 0) return;
        lbIndex = (lbIndex + 1) % lbItems.length;
        updateLightboxContent();
    };

    const prevLbItem = () => {
        if (lbItems.length === 0) return;
        lbIndex = (lbIndex - 1 + lbItems.length) % lbItems.length;
        updateLightboxContent();
    };

    const closeLightbox = () => {
        const lightbox = document.getElementById("lightbox");
        if (!lightbox) return;
        lightbox.classList.remove("active");

        setTimeout(() => { lightbox.querySelector(".lightbox-content").innerHTML = ""; }, 600);
    };

    const openLightbox = (index, videoState = null) => {
        const lightbox = document.getElementById("lightbox");
        if (!lightbox) return;
        lbIndex = index;
        updateLightboxContent(videoState);
        lightbox.classList.add("active");
    };

    function initLightbox() {
        // Collect all gallery items
        const galleryItems = document.querySelectorAll(".gallery-item img, .gallery-item video");
        if (galleryItems.length === 0) {
            lbItems = [];
            return;
        }
        lbItems = Array.from(galleryItems);

        // Create lightbox if not exists
        let lightbox = document.getElementById("lightbox");
        if (!lightbox) {
            lightbox = document.createElement("div");
            lightbox.id = "lightbox";
            lightbox.innerHTML = `
                <div class="lightbox-overlay"></div>
                <div class="lightbox-container">
                    <button class="lightbox-close" aria-label="Cerrar">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                    <div class="lightbox-content"></div>
                    <button class="lightbox-prev" aria-label="Anterior">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    </button>
                    <button class="lightbox-next" aria-label="Siguiente">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </button>
                    <div class="lightbox-counter">1 / 1</div>
                </div>
            `;
            document.body.appendChild(lightbox);

            // Close events
            lightbox.querySelector(".lightbox-close").addEventListener("click", () => closeLightbox());
            lightbox.querySelector(".lightbox-overlay").addEventListener("click", () => closeLightbox());

            // Nav events
            lightbox.querySelector(".lightbox-next").addEventListener("click", (e) => { e.stopPropagation(); nextLbItem(); });
            lightbox.querySelector(".lightbox-prev").addEventListener("click", (e) => { e.stopPropagation(); prevLbItem(); });

            // Keyboard
            document.addEventListener("keydown", (e) => {
                if (!lightbox.classList.contains("active")) return;
                if (e.key === "Escape") closeLightbox();
                if (e.key === "ArrowRight") nextLbItem();
                if (e.key === "ArrowLeft") prevLbItem();
            });
        }

        // Attach click to current items
        galleryItems.forEach((item, index) => {
            if (!item.classList.contains("no-controls")) {
                item.style.cursor = "zoom-in";
            }
            // Replace with clone to clear old project listeners if navigating back
            const newItem = item.cloneNode(true);
            item.parentNode.replaceChild(newItem, item);
            // Add play button overlay for gallery videos
            if (newItem.tagName === "VIDEO") {
                // Controles nativos siempre visibles — compatible con Samsung Browser, Chrome, Safari
                if (!newItem.classList.contains("no-controls")) {
                    newItem.controls = true;
                    newItem.removeAttribute("controlsList");
                }
            } else {
                // Images still open lightbox
                newItem.addEventListener("click", () => openLightbox(index));
            }
        });
    }


    // ── ABOUT PAGE ───────────────────────────────────────────────────
    function initAboutPage() {
        const cells = document.querySelectorAll('.about-cell');
        if (!cells.length) return;

        // Detectar qué celdas están en la primera fila (navbar encima)
        const totalCells = cells.length;
        const cols = window.innerWidth <= 768 ? 1 : window.innerWidth <= 1024 ? 2 : 3;

        cells.forEach((cell, i) => {
            // Entrada: fade escalonado
            cell.classList.remove('is-visible', 'is-hovered', 'is-leaving', 'is-returning', 'is-returned');
            void cell.offsetWidth;
            setTimeout(() => cell.classList.add('is-visible'), 80 + i * 100);

            const title = cell.querySelector('.about-cell-title');
            const desc = cell.querySelector('.about-cell-desc');
            if (!title || !desc) return;

            let t1 = null, t2 = null;

            function calcVars() {
                const cellH = cell.getBoundingClientRect().height;
                const titleH = title.getBoundingClientRect().height;
                const bottomOffset = 64; // bottom: 4rem = 64px
                // Índice: 5.5rem=88px para primera fila, 4rem=64px para el resto
                const isFirstRow = i < cols;
                const indexBottom = isFirstRow ? 88 : 64;
                const targetTitleTop = indexBottom + 16; // 1rem gap bajo el índice

                // Título está a: cellH - bottomOffset - titleH desde el top
                const titleCurrentTop = cellH - bottomOffset - titleH;
                const lift = titleCurrentTop - targetTitleTop;
                const exit = cellH + 20; // sale completamente por arriba

                cell.style.setProperty('--title-hover-y', `translateY(-${Math.max(lift, 20)}px)`);
                cell.style.setProperty('--title-exit-y', `translateY(-${exit}px)`);
            }

            // ── MOBILE ACCORDION ──────────────────────────────────────
            cell.onclick = function () {
                if (window.innerWidth <= 1000) {
                    const isActive = this.classList.contains('is-active-mobile');
                    cells.forEach(c => c.classList.remove('is-active-mobile'));
                    if (!isActive) this.classList.add('is-active-mobile');
                }
            };

            cell.addEventListener('mouseenter', () => {
                clearTimeout(t1);
                clearTimeout(t2);
                calcVars();
                cell.classList.remove('is-leaving', 'is-returning', 'is-returned');
                cell.classList.add('is-hovered');
            });

            cell.addEventListener('mouseleave', () => {
                cell.classList.remove('is-hovered');
                cell.classList.add('is-leaving');

                t1 = setTimeout(() => {
                    cell.classList.remove('is-leaving');
                    cell.classList.add('is-returning');

                    t2 = setTimeout(() => {
                        cell.classList.remove('is-returning');
                        cell.classList.add('is-returned');
                        setTimeout(() => cell.classList.remove('is-returned'), 800);
                    }, 32);
                }, 520);
            });
        });
    }
    function initAll() {
        // Limpiar ScrollTriggers anteriores del contenido para evitar duplicados
        ScrollTrigger.getAll().forEach(st => {
            const trigger = st.vars.trigger;
            if (trigger && typeof trigger === "string" && trigger !== ".hero-container") {
                st.kill();
            }
        });

        initHome(true);
        initRollingText();

        updatePillFromPath(window.location.pathname, true);
        requestAnimationFrame(() => {
            updatePillFromPath(window.location.pathname, true);
        });

        initManifesto();
        initPhilosophy();
        initExperience();
        initCTA();
        initContactCard();
        initContactPage();
        initWorkPage();
        initScrollIndicator();
        initBackToTop();
        initProjectNav();
        initMarquee();
        initFooter();
        initLightbox();

        // About page
        if (document.querySelector('.about-header')) {
            initAboutPage();
        }
    }

    // --- 4. LÓGICA DE NAVEGACIÓN Y PILL ---


    const PROJECTS = [
        "project-tito-david",
        "project-inboxe",
        "project-palena",
        "project-beyond-frames",
        "project-copao",
        "project-benahavis",
        "project-infoca",
        "project-nook"
    ];

    function initProjectNav() {
        const nextBtn = document.querySelector(".next-project");
        if (!nextBtn) return;

        const currentPath = getCleanPath(window.location.pathname).toLowerCase();
        const currentIndex = PROJECTS.findIndex(p => p === currentPath);

        if (currentIndex !== -1) {
            const nextIndex = (currentIndex + 1) % PROJECTS.length;
            nextBtn.setAttribute("href", `${PROJECTS[nextIndex]}.html`);
        }
    }

    const mobileQuery = window.matchMedia("(max-width: 1000px)");

    function movePill(targetLink, instant = false) {
        if (!activePill || !targetLink) return;

        const isMobile = mobileQuery.matches;
        const navbar = document.querySelector(".navbar");

        // Limpiar estados de todos los links
        navLinks.forEach(link => {
            link.classList.remove("active");
            link.style.removeProperty("display");
            const li = link.closest("li");
            if (li) li.style.removeProperty("display");
        });

        if (isMobile && navbar) {
            // Asegurar que en móvil no haya nada de JS pisando la posición
            gsap.set(navbar, { clearProps: "transform,left,top,width" });
        }

        const rect = targetLink.getBoundingClientRect();
        const navList = targetLink.closest(".nav-links");

        if (!navList || isMobile) {
            // En móvil o si no hay lista, la pill se oculta (CSS también lo hace)
            gsap.to(activePill, { opacity: 0, duration: 0.3 });
        } else {
            const parentRect = navList.getBoundingClientRect();
            const width = rect.width;
            const left = rect.left - parentRect.left;

            if (width > 0) {
                gsap[instant ? "set" : "to"](activePill, {
                    width, left, opacity: 1,
                    ...(instant ? {} : { duration: 0.9, ease: PREMIUM_EASE })
                });
            }
        }

        targetLink.classList.add("active");

        if (isMobile) {
            const currentPath = getCleanPath(targetLink.getAttribute("href") || "");
            navLinks.forEach(link => {
                const linkPath = getCleanPath(link.getAttribute("href") || "");
                if (linkPath === currentPath && !link.querySelector("img") && !link.classList.contains("mobile-logo")) {
                    const li = link.closest("li");
                    if (li) li.style.setProperty("display", "none", "important");
                    link.style.setProperty("display", "none", "important");
                }
            });
            // Asegurar que el home item se oculte si estamos en home
            if (currentPath === "index") {
                const homeItem = document.querySelector(".home-nav-item");
                if (homeItem) homeItem.style.setProperty("display", "none", "important");
            }
        }
    }

    function updatePillFromPath(path, instant = false) {
        let cleanPath = getCleanPath(path);
        if (cleanPath.startsWith("project-")) cleanPath = "work";

        const isMobile = mobileQuery.matches;

        // Intentar encontrar el link correcto según el modo
        const target = Array.from(navLinks).find(link => {
            if (!link.closest(".nav-links")) return false;
            const h = getCleanPath(link.getAttribute("href") || "");
            const isLogo = link.classList.contains("logo-item");
            // En escritorio priorizamos el logo para Home, en móvil el link de texto
            return h === cleanPath && (isMobile ? !isLogo : isLogo);
        }) || Array.from(navLinks).find(link => link.closest(".nav-links") && getCleanPath(link.getAttribute("href") || "") === cleanPath);

        if (target) {
            movePill(target, instant);
        }
    }

    async function loadPage(url, transitionType = "normal") {
        try {
            const response = await fetch(url);
            const text = await response.text();
            const doc = new DOMParser().parseFromString(text, "text/html");
            const newContent = doc.querySelector("#page-content");
            const currentContent = document.querySelector("#page-content");

            if (newContent && currentContent) {
                // Ocultar Back to Top
                const btn = document.querySelector(".back-to-top");
                if (btn) btn.classList.remove("visible");

                // Animación según tipo de transición
                const isNext = transitionType === "nextProject";
                const exitVars = isNext
                    ? { autoAlpha: 0, x: -50, duration: 0.8, stagger: 0.05, ease: PREMIUM_EASE }
                    : { autoAlpha: 0, y: -30, duration: 0.8, stagger: 0.1, ease: PREMIUM_EASE };

                // Capturar referencia a los hijos ANTES de animar (para clearProps posterior)
                const childrenToAnimate = Array.from(currentContent.children);

                // Animación de salida
                gsap.to(childrenToAnimate, {
                    ...exitVars,
                    onComplete: () => {
                        // 1. Limpieza de estilos GSAP inline en los nodos animados
                        childrenToAnimate.forEach(child => {
                            gsap.set(child, { clearProps: "all" });
                        });
                        gsap.set(currentContent, { clearProps: "all" });

                        // 2. Actualización de scroll y contenido del DOM
                        window.scrollTo(0, 0);
                        currentContent.innerHTML = newContent.innerHTML;

                        // Sincronizar clase del body para CSS específico (ej. .page-contact)
                        document.body.className = doc.body.className;

                        const isAboutPage = !!document.querySelector('.about-header');

                        // --- FIX SAFARI: EJECUCIÓN DIFERIDA ---
                        // Dejamos que el navegador termine de procesar el cambio de HTML antes de ejecutar JS pesado
                        requestAnimationFrame(() => {

                            // Inicializar toda la lógica del nuevo contenido
                            initAll();

                            if (!isAboutPage) {
                                // Fade-in de los elementos que no tienen animación propia
                                const itemsToFadeIn = Array.from(currentContent.children).filter(child => {
                                    return !child.classList.contains('work-grid');
                                });

                                if (itemsToFadeIn.length > 0) {
                                    const entryVars = isNext
                                        ? { autoAlpha: 0, x: 50 }
                                        : { autoAlpha: 0, y: 20 };

                                    gsap.fromTo(itemsToFadeIn,
                                        entryVars,
                                        {
                                            autoAlpha: 1,
                                            x: 0,
                                            y: 0,
                                            duration: 0.8,
                                            ease: PREMIUM_EASE,
                                            clearProps: "transform,opacity"
                                        }
                                    );
                                }
                            }

                            // 3. Respiro final para que Safari asiente el layout antes de calcular ScrollTriggers
                            setTimeout(() => {
                                ScrollTrigger.refresh();
                                updatePillFromPath(window.location.pathname, true);
                            }, 150);
                        });

                        document.title = doc.title;
                        updateMobileLabel(url);
                    }
                });
            }
        } catch (err) {
            window.location.href = url;
        }
    }

    function updateMobileLabel(url) {
        const label = document.querySelector(".current-page-label");
        if (!label) return;

        const cleanPath = getCleanPath(url);
        const map = {
            "work": "Trabajo",
            "about": "Sobre mí",
            "contact": "Contacto"
        };

        let name = "Inicio";

        // Lógica mejorada: Si el path contiene "project-" o es "work", la etiqueta es "Trabajo"
        if (cleanPath.includes("project-") || cleanPath === "work") {
            name = "Trabajo";
        } else {
            Object.keys(map).forEach(k => {
                if (url.includes(k)) name = map[k];
            });
        }

        label.textContent = name;
    }

    // --- 5. EVENTOS Y CARGA INICIAL ---

    if (window.location.pathname.endsWith(".html")) {
        history.replaceState(null, "", normalizeUrlHistory(window.location.pathname));
    }

    const hasSeenLoader = sessionStorage.getItem("hasSeenLoader");

    if (!hasSeenLoader) {
        const tl = gsap.timeline({
            defaults: { ease: PREMIUM_EASE, force3D: true }
        });

        tl.to(".loader-mask", { y: "0%", duration: 1.8, delay: 1.2, ease: PREMIUM_EASE })
            .to(".loader", { autoAlpha: 0, duration: 0.8, onComplete: () => document.querySelector(".loader")?.remove() })
            .to(".navbar", { y: 0, autoAlpha: 1, duration: 1.0, clearProps: "all" }, "-=0.6")
            .add(() => {
                sessionStorage.setItem("hasSeenLoader", "true");
                initParallax();
                updatePillFromPath(window.location.pathname, true);
            });

    } else {
        gsap.set(".loader", { autoAlpha: 0, display: "none" });
        gsap.set(".navbar", { y: 0, autoAlpha: 1 });

        initHome(true);
        updatePillFromPath(window.location.pathname, true);
    }
    // Event listener delegado para todos los enlaces internos (NAVAR, BOTONES, PROYECTOS)
    document.addEventListener("click", (e) => {
        const link = e.target.closest(".nav-links a, .mobile-logo, .project-link, .back-to-work, .next-project, .cta-button, .download-link");
        if (!link) return;

        const href = link.getAttribute("href");
        // Ignorar externos, hashes, descargas o esquemas específicos
        if (!href || href === "#" || link.hasAttribute("download") || href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:")) return;

        e.preventDefault();

        const transitionType = link.classList.contains("next-project") ? "nextProject" : "normal";

        if (getCleanPath(href) === getCleanPath(window.location.pathname)) return;

        // Cerrar menú móvil si está abierto
        document.querySelector(".nav-links")?.classList.remove("nav-active");
        document.querySelector(".menu-toggle")?.classList.remove("open");
        document.querySelector(".mobile-controls")?.classList.remove("controls-open");

        // Mover la pill si el link está en la navbar
        if (link.closest(".nav-links")) {
            movePill(link);
        } else {
            // Si no está en la navbar, intentamos mapear a la sección correcta
            const cleanHref = getCleanPath(href);
            let targetNav = null;
            if (cleanHref.startsWith("project-")) {
                targetNav = Array.from(navLinks).find(l => getCleanPath(l.getAttribute("href")) === "work");
            } else {
                targetNav = Array.from(navLinks).find(l => getCleanPath(l.getAttribute("href")) === cleanHref);
            }
            if (targetNav) movePill(targetNav);
        }

        history.pushState(null, "", normalizeUrlHistory(href));
        loadPage(href, transitionType);
    });

    window.addEventListener("popstate", () => {
        const path = window.location.pathname;
        loadPage(path === "/" ? "index.html" : path);
        updatePillFromPath(path);
    });

    function handleResize() {
        const isDesktop = !mobileQuery.matches;
        const navbar = document.querySelector(".navbar");

        if (isDesktop) {
            document.querySelector(".nav-links")?.classList.remove("nav-active");
            document.querySelector(".menu-toggle")?.classList.remove("open");
            document.querySelector(".mobile-controls")?.classList.remove("controls-open");
        }

        // LIMPIEZA AGRESIVA PARA EVITAR NAVBAR CENTRADA EN MÓVIL
        if (navbar) {
            if (!isDesktop) {
                // En móvil forzamos que el CSS mande borrando estilos GSAP
                gsap.set(navbar, { clearProps: "transform,left,top,width,padding,margin,background,background-image" });
            } else {
                // En escritorio reajustamos
                gsap.set(navbar, { clearProps: "width,padding,background,background-image" });
            }
        }

        // Forzar recalculo de la barra con un pequeño delay para que el layout asiente
        if (activePill) gsap.set(activePill, { opacity: 0 }); // Ocultar mientras reajustamos

        requestAnimationFrame(() => {
            updatePillFromPath(window.location.pathname, true);
            updateMobileLabel(window.location.pathname);

            // Re-check after a bit just in case
            setTimeout(() => {
                updatePillFromPath(window.location.pathname, true);
                safeRefresh();
            }, 100);
        });

        clearTimeout(window.resizeTimeout);
        window.resizeTimeout = setTimeout(() => {
            initManifesto();
            safeRefresh();
        }, 150);
    }

    window.addEventListener("resize", handleResize);
    mobileQuery.addListener(handleResize);
    mobileQuery.addEventListener("change", handleResize);

    const mobileControls = document.querySelector(".mobile-controls");
    if (mobileControls) {
        mobileControls.addEventListener("click", () => {
            document.querySelector(".nav-links").classList.toggle("nav-active");
            document.querySelector(".menu-toggle").classList.toggle("open");
            mobileControls.classList.toggle("controls-open");
        });
    }

    function initCustomCursor() {
        if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches || document.querySelector(".custom-cursor")) return;

        const cursor = document.createElement("div");
        cursor.className = "custom-cursor";
        const follower = document.createElement("div");
        follower.className = "cursor-follower";
        document.body.append(cursor, follower);

        gsap.set([cursor, follower], {
            xPercent: -50,
            yPercent: -50,
            force3D: true // Forzar GPU
        });

        let pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        let mouse = { ...pos };

        const xCursorTo = gsap.quickTo(cursor, "x", { duration: 0.15, ease: "power3.out" });
        const yCursorTo = gsap.quickTo(cursor, "y", { duration: 0.15, ease: "power3.out" });

        // THROTTLE el mousemove para reducir ejecuciones
        let rafId;
        window.addEventListener("mousemove", (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;

            if (!rafId) {
                rafId = requestAnimationFrame(() => {
                    xCursorTo(mouse.x);
                    yCursorTo(mouse.y);
                    rafId = null;
                });
            }
        });

        // OPTIMIZAR el ticker - usar transform en vez de gsap.set
        gsap.ticker.add(() => {
            const dt = 1.0 - Math.pow(0.8, gsap.ticker.deltaRatio());
            const last = { ...pos };
            pos.x += (mouse.x - pos.x) * dt;
            pos.y += (mouse.y - pos.y) * dt;

            const dx = pos.x - last.x, dy = pos.y - last.y;
            const vel = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
            const stretch = Math.min(vel * 0.005, 0.08);

            // Usar transform directo (no gsap.set) para evitar reflows
            follower.style.transform = `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%) rotate(${angle}deg) scaleX(${1 + stretch}) scaleY(${1 - stretch})`;
        });

        const toggleCursor = (add) => {
            cursor.classList[add ? 'add' : 'remove']("active");
            follower.classList[add ? 'add' : 'remove']("active");
        };

        document.body.addEventListener("mouseover", (e) => {
            if (e.target.closest("a, button, .cta-button, .menu-toggle, .download-link, .work-item")) toggleCursor(true);
        });
        document.body.addEventListener("mouseout", (e) => {
            if (e.target.closest("a, button, .cta-button, .menu-toggle, .download-link, .work-item")) toggleCursor(false);
        });
        document.addEventListener("mouseleave", () => {
            cursor.style.opacity = 0;
            follower.style.opacity = 0;
        });
        document.addEventListener("mouseenter", () => {
            cursor.style.opacity = 1;
            follower.style.opacity = 1;
        });
    }

    // Inicialización global de componentes
    initAll();
});