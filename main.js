document.addEventListener('DOMContentLoaded', () => {
    // Mobile menu toggle
    const menuToggle = document.getElementById('menuToggle');
    const mobileMenu = document.getElementById('mobileMenu');

    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
            menuToggle.classList.toggle('active'); // Optional: for animating the hamburger icon
        });

        // Close mobile menu when a link is clicked
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                menuToggle.classList.remove('active');
            });
        });
    }

    // Smooth scroll for navigation links
    document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Dynamic gallery population (example images from Pexels)
    const galleryGrid = document.getElementById('galleryGrid');
    if (galleryGrid) {
        const galleryImages = [
            '9.jpg',
            '2.jpg',
            '3.jpg',
            '4.jpg',
            '1.jpg',
            '8.jpg',
            '7.jpg',
            '10.jpg',
            '11.jpg'
        ];

        galleryImages.forEach(src => {
            const div = document.createElement('div');
            div.classList.add('gallery-item');
            const img = document.createElement('img');
            img.src = src;
            img.alt = 'Salon work showcase';
            img.loading = 'lazy';
            div.appendChild(img);
            galleryGrid.appendChild(div);
        });
    }

    // Scroll reveal effect
    const revealElements = document.querySelectorAll('.reveal-item');

    const observerOptions = {
        root: null, // viewport
        rootMargin: '0px',
        threshold: 0.1 // 10% of item visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Stop observing once visible
            }
        });
    }, observerOptions);

    revealElements.forEach(el => {
        observer.observe(el);
    });

    // Handle "Book Now" links to scroll to appointment form on appointment.html
    const bookNowLinks = document.querySelectorAll('a[href="appointment.html"]');
    bookNowLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default navigation
            // Navigate to appointment.html with a hash to trigger scroll
            window.location.href = 'appointment.html#appointmentFormSection';
        });
    });

    /* === VIDEO SLOWING PART (ADDED) ===
       Applies a playbackRate to reel videos (and hero if present).
       Default: 0.75 (change below or call setPlaybackRate(n) at runtime).
    */
    (function setupVideoSpeed() {
        let playbackRate = 0.75; // <-- change this value to slow/faster (1.0 = normal)

        // helper to apply rate to matching videos
        function applyRate(rate) {
            // target reel videos + hero video if present
            const vids = Array.from(document.querySelectorAll('video.instagram-reel-video, video.hero-video, video.hero-video-container video'));
            vids.forEach(v => {
                try {
                    v.playbackRate = rate;
                } catch (e) { /* ignore */ }
            });
        }

        // initial apply
        applyRate(playbackRate);

        // expose setter to window so you can change speed from console if needed
        window.setPlaybackRate = function (rate) {
            if (typeof rate !== 'number' || !isFinite(rate) || rate <= 0) return;
            playbackRate = rate;
            applyRate(playbackRate);
            console.info('Playback rate set to', playbackRate);
        };

        // If videos are added later dynamically (rare), observe DOM and re-apply
        const mo = new MutationObserver(mutations => {
            // small debounce
            if (mutations.length) {
                applyRate(playbackRate);
            }
        });
        mo.observe(document.body, { childList: true, subtree: true });

        // Optional: ensure currently playing videos are resumed with new rate
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') applyRate(playbackRate);
        });
    })();
    /* === end video slowing === */
});
