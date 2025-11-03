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
            '9.jpg', '2.jpg', '3.jpg', '4.jpg', '1.jpg', '8.jpg', '7.jpg', '10.jpg', '11.jpg'
        ];

        galleryImages.forEach(src => {
            const div = document.createElement('div');
            div.classList.add('gallery-item', 'reveal-item'); // Added reveal-item class
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

    /* === VIDEO SLOWING PART === */
    (function setupVideoSpeed() {
        let playbackRate = 0.75; // Adjust this value (1.0 = normal speed)

        function applyRate(rate) {
            const vids = Array.from(document.querySelectorAll('video.instagram-reel-video, video.hero-video, video.hero-video-container video'));
            vids.forEach(v => {
                try {
                    v.playbackRate = rate;
                } catch (e) { /* ignore */ }
            });
        }
        applyRate(playbackRate);

        window.setPlaybackRate = function (rate) {
            if (typeof rate !== 'number' || !isFinite(rate) || rate <= 0) return;
            playbackRate = rate;
            applyRate(playbackRate);
            console.info('Playback rate set to', playbackRate);
        };
    
        const mo = new MutationObserver(mutations => {
            if (mutations.length) {
                applyRate(playbackRate);
            }
        });
        mo.observe(document.body, { childList: true, subtree: true });

        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') applyRate(playbackRate);
        });
    })();
    /* === end video slowing === */
});

// ======== TOAST NOTIFICATION SYSTEM (NEW) ========

const toastContainer = document.getElementById("toastContainer");

/**
 * Shows a custom styled toast notification.
 * @param {string} msg - The message to display.
 * @param {'success'|'error'} type - The type of notification (influences color and icon).
 * @param {number} duration - How long the toast remains visible (in milliseconds).
 */
function showTempMsg(msg, type = 'success', duration = 4000) {
    if (!toastContainer) return alert(msg); 

    const toast = document.createElement('div');
    toast.classList.add('toast', type);

    // Using a placeholder icon since we don't know the exact icon library used.
    // Replace <i> tags with appropriate code if you are using Font Awesome.
    let iconHTML = '';
    if (type === 'success') {
        iconHTML = '<i class="fas fa-check-circle"></i>'; // Placeholder: Check Mark Icon
    } else if (type === 'error') {
        iconHTML = '<i class="fas fa-times-circle"></i>'; // Placeholder: X Mark Icon
    }

    toast.innerHTML = `${iconHTML} ${msg}`;
    toastContainer.appendChild(toast);
    
    // Force reflow and apply 'show' class
    void toast.offsetWidth; 
    toast.classList.add('show');

    // Auto-hide timer
    const timer = setTimeout(() => {
        toast.classList.remove('show');
        toast.addEventListener('transitionend', () => {
            toast.remove();
        });
    }, duration);

    // Click to dismiss
    toast.addEventListener('click', () => {
        clearTimeout(timer);
        toast.classList.remove('show');
        toast.addEventListener('transitionend', () => {
            toast.remove();
        });
    });
}


// ======== FORM SUBMISSION LOGIC (UPDATED) ========