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
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzhVk6BZ1o6ZhnTAeRe2OWYBh7D4unYpipHmCS7d_Yv9oxKX9RYZNGFjAx1Je_W0wpT/exec";

const form = document.getElementById("appointmentForm");
const submitBtn = form.querySelector('button[type="submit"]');

// hidden iframe fallback submit (no CORS issues)
function submitViaHiddenForm(data) {
    let iframe = document.querySelector('iframe[name="hidden_iframe_for_submit"]');
    if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.name = "hidden_iframe_for_submit";
        iframe.style.display = "none";
        document.body.appendChild(iframe);
    }

    const hf = document.createElement('form');
    hf.action = SCRIPT_URL;
    hf.method = 'POST';
    hf.target = iframe.name;
    hf.style.display = 'none';

    for (const key in data) {
        const inp = document.createElement('input');
        inp.type = 'hidden';
        inp.name = key;
        inp.value = data[key] || "";
        hf.appendChild(inp);
    }

    document.body.appendChild(hf);
    hf.submit();

    setTimeout(() => {
        document.body.removeChild(hf);
    }, 2000);

    // Updated success message for fallback mode
    showTempMsg("आपका अनुरोध संसाधित हो रहा है। धन्यवाद!", 'success'); 
}

// Try fetch using URLSearchParams
async function submitViaFetch(data) {
    const params = new URLSearchParams();
    Object.keys(data).forEach(k => params.append(k, data[k] || ""));

    const res = await fetch(SCRIPT_URL, {
        method: 'POST',
        body: params,
    });

    let text = await res.text().catch(() => null);
    try {
        if (!res.ok) throw new Error("Network response not ok: " + res.status);
        const maybeJson = text ? JSON.parse(text) : null;
        if (maybeJson && maybeJson.status === "success") {
            return { ok: true, response: maybeJson };
        } else if (maybeJson && maybeJson.status) {
            return { ok: false, error: maybeJson };
        } else {
            return { ok: true, responseText: text };
        }
    } catch (err) {
        if (res.ok) return { ok: true, responseText: text };
        return { ok: false, error: err.message || text || "Unknown error" };
    }
}

// Simple front-end validation
function validate(data) {
    if (!data.name) return "कृपया अपना नाम दर्ज करें।";
    if (!data.phone) return "कृपया फ़ोन नंबर दर्ज करें।";
    if (!/^\+?[0-9\-\s]{7,15}$/.test(data.phone)) return "अमान्य फ़ोन नंबर।";
    if (!data.email) return "कृपया ईमेल पता दर्ज करें।";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return "अमान्य ईमेल पता।";
    if (data.service === "") return "कृपया एक सेवा का चयन करें।";
    return null;
}

form.addEventListener("submit", async function (e) {
    e.preventDefault();
    submitBtn.disabled = true;
    const originalBtnText = submitBtn.innerText;
    submitBtn.innerText = "भेज रहा है...";

    const data = {
        name: form.querySelector('input[placeholder="Your Name"]').value.trim(),
        phone: form.querySelector('input[placeholder="Phone Number"]').value.trim(),
        email: form.querySelector('input[placeholder="Email Address"]').value.trim(),
        service: form.querySelector('select').value,
        message: form.querySelector('textarea').value.trim()
    };

    // Validate
    const vErr = validate(data);
    if (vErr) {
        showTempMsg(vErr, 'error'); // Using toast for validation error
        submitBtn.disabled = false;
        submitBtn.innerText = originalBtnText;
        return;
    }

    try {
        const result = await submitViaFetch(data);

        if (result.ok) {
            // Success
            submitBtn.innerText = "Sent ✓";
            form.reset();
            // New Success Message
            showTempMsg("We have received your request. We will get in touch with you shortly!", 'success'); 
        } else {
            // Fallback to hidden form submit
            console.warn("Fetch returned error, falling back to hidden form:", result);
            submitViaHiddenForm(data);
        }
    } catch (err) {
        console.error("Fetch failed, fallback to hidden form:", err);
        // Fallback due to network/CORS error
        submitViaHiddenForm(data);
    } finally {
        setTimeout(() => {
            submitBtn.disabled = false;
            submitBtn.innerText = originalBtnText;
        }, 3000); // Increased delay for visual confirmation
    }
});