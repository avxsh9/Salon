
document.addEventListener('DOMContentLoaded', () => {
    /* =================== CONFIG =================== */
    const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxSHWSDHySe0FuEFZK-vOL9jL2tY-rvHwTsNf8b4V7SjiyO7zo2cj4ylNnZ0wakx0OOJA/exec";
    const modal = document.getElementById('bookingModal');
    const closeBtn = document.querySelector('.close-btn');
    const bookNowBtns = document.querySelectorAll('.book-now-btn');
    const serviceNameInput = document.getElementById('serviceName');
    const priceSelect = document.getElementById('priceSelect');
    const appointmentTimeSelect = document.getElementById('appointmentTime');
    const appointmentForm = document.getElementById('appointmentForm');
    const submissionMessage = document.getElementById('submissionMessage');
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');
    const submitBtn = appointmentForm ? appointmentForm.querySelector("button[type='submit']") : null;

    /* --- Packages / Prices --- */
    const packagePrices = [
        { name: "PRE-BRIDAL PACKAGE (₹10000)", price: 10000 },
        { name: "PRE-BRIDAL PACKAGE (₹15000)", price: 15000 },
        { name: "PRE-BRIDAL PACKAGE (₹20000)", price: 20000 },
        { name: "PRE-BRIDAL PACKAGE (₹25000)", price: 25000 },
        { name: "HD Bridal Makeup (MAKEUP STUDIO OR KRYOLAN HD)", price: 10000 },
        { name: "HD Bridal Makeup (MAC OR AIR BRUSH)", price: 15000 },
        { name: "HD Bridal Makeup (BOBBY BROWN)", price: 20000 },
        { name: "HD Bridal Makeup (NARS/ESTEE LAUDER)", price: 22000 },
        { name: "Consultation Booking", price: 0 }
    ];

    /* ---------------- Helpers ---------------- */
    const isPhoneValid = (phone) => {
        const digits = (phone || '').replace(/\D/g, '');
        return /^[6-9]\d{9}$/.test(digits);
    };

    const setMinDateToday = () => {
        const dateEl = document.getElementById('appointmentDate');
        if (!dateEl) return;
        const today = new Date();
        dateEl.min = today.toISOString().split('T')[0];
        if (!dateEl.value) dateEl.value = dateEl.min;
    };

    const formatTimeLabel = (hh, mm) => {
        let hour = parseInt(hh, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        hour = ((hour + 11) % 12) + 1;
        return `${hour}:${mm} ${ampm}`;
    };

    /* ---------------- Time slots ---------------- */
    const generateTimeSlots = () => {
        if (!appointmentTimeSelect) return;
        appointmentTimeSelect.innerHTML = '<option value="">Select Time</option>';
        for (let hour = 9; hour <= 20; hour++) {
            const hh = String(hour).padStart(2, '0');
            const opt = document.createElement('option');
            opt.value = `${hh}:00`;
            opt.textContent = formatTimeLabel(hh, '00');
            appointmentTimeSelect.appendChild(opt);
        }
    };

    /* ---------------- Price dropdown ---------------- */
    const populatePriceSelect = (selectedPackageName, selectedPrice) => {
        if (!priceSelect) return;
        priceSelect.innerHTML = '';
        const defaultOption = document.createElement('option');
        defaultOption.value = "";
        defaultOption.textContent = "Select Price";
        priceSelect.appendChild(defaultOption);

        let foundSelectedValue = null;

        packagePrices.forEach(p => {
            const option = document.createElement('option');
            option.value = String(p.price);
            option.textContent = `₹${p.price.toLocaleString('en-IN')}/- (${p.name.split('(')[0].trim()})`;

            if (selectedPackageName && p.name === selectedPackageName && p.price === selectedPrice) {
                foundSelectedValue = String(p.price);
                option.textContent = `₹${p.price.toLocaleString('en-IN')}/- (Auto Selected: ${p.name.split('(')[0].trim()})`;
            }
            priceSelect.appendChild(option);
        });

        priceSelect.value = foundSelectedValue !== null ? foundSelectedValue : "";
    };

    /* ---------------- UI helpers ---------------- */
    const showSubmissionMessage = (html, success = true) => {
        if (!submissionMessage) return;
        submissionMessage.innerHTML = html;
        submissionMessage.style.display = 'block';
        submissionMessage.style.borderLeft = success ? '4px solid var(--success)' : '4px solid var(--error)';
        submissionMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    const clearSubmissionMessage = () => {
        if (!submissionMessage) return;
        submissionMessage.style.display = 'none';
        submissionMessage.innerHTML = '';
    };

    const disableSubmit = (disable = true) => {
        if (!submitBtn) return;
        submitBtn.disabled = disable;
        submitBtn.style.opacity = disable ? '0.6' : '1';
        submitBtn.textContent = disable ? 'SENDING...' : 'CONFIRM APPOINTMENT';
    };

    /* ---------------- Book Now click -> open modal ---------------- */
    if (bookNowBtns && bookNowBtns.length) {
      bookNowBtns.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();

            const pkgName = button.getAttribute('data-package') || "Consultation Booking";
            const pkgPrice = parseInt(button.getAttribute('data-price') || "0", 10);

            // reset UI
            if (appointmentForm) appointmentForm.reset();
            clearSubmissionMessage();
            if (appointmentForm) appointmentForm.style.display = 'block';

            // prefill
            if (serviceNameInput) serviceNameInput.value = pkgName;
            populatePriceSelect(pkgName, pkgPrice);

            generateTimeSlots();
            setMinDateToday();

            if (modal) {
              modal.style.display = 'block';
              modal.setAttribute('aria-hidden', 'false');
            }

            // focus first input for accessibility
            const firstInput = appointmentForm ? appointmentForm.querySelector('input, select, textarea') : null;
            if (firstInput) firstInput.focus();
        });
      });
    }

    /* ---------------- Modal close handlers ---------------- */
    const closeModal = () => {
        if (!modal) return;
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal && modal.style.display === 'block') closeModal(); });

    /* ---------------- Form submit -> POST to Apps Script (URL-encoded) ---------------- */
    if (appointmentForm) {
      appointmentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearSubmissionMessage();

        const clientNameEl = document.getElementById('clientName');
        const phoneEl = document.getElementById('phoneNumber');
        const dateEl = document.getElementById('appointmentDate');

        const clientName = clientNameEl ? clientNameEl.value.trim() : '';
        const phone = phoneEl ? phoneEl.value.trim() : '';
        const date = dateEl ? dateEl.value : '';
        const time = appointmentTimeSelect ? appointmentTimeSelect.value : '';
        const priceVal = priceSelect ? priceSelect.value : '';
        const priceText = priceSelect && priceSelect.selectedIndex >= 0 ? priceSelect.options[priceSelect.selectedIndex].text : '';

        // validations
        if (!clientName || !phone || !date || !time || !priceVal) {
            showSubmissionMessage('<strong>Please fill in all required fields.</strong>', false);
            return;
        }
        if (!isPhoneValid(phone)) {
            showSubmissionMessage('<strong>Enter a valid 10-digit Indian phone number (starts with 6-9).</strong>', false);
            return;
        }
        // date must be >= min
        const minDate = dateEl ? dateEl.min : null;
        if (minDate && new Date(date) < new Date(minDate)) {
            showSubmissionMessage('<strong>Please pick a valid appointment date.</strong>', false);
            return;
        }

        // payload for URL-encoded POST
        const payload = {
            service: serviceNameInput ? serviceNameInput.value : 'Consultation',
            price: priceText || `₹${priceVal}`,
            name: clientName,
            phone: phone.replace(/\s+/g, ''),
            date,
            time,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        };

        // UI lock
        disableSubmit(true);

        try {
            // convert to application/x-www-form-urlencoded
            const formBody = new URLSearchParams(payload).toString();

            const res = await fetch(WEB_APP_URL, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
                },
                body: formBody,
                mode: 'cors'
            });

            const resText = await res.text();
            let json = null;
            try { json = JSON.parse(resText); } catch (err) { json = null; }

            console.log('Server response (text):', resText, 'parsed:', json, 'status:', res.status);

            if (!res.ok && !json) {
                showSubmissionMessage('<strong>Server error — please try again later.</strong>', false);
                disableSubmit(false);
                return;
            }

            if (json && json.status === 'success') {
                if (json.mailSent === false) {
                    showSubmissionMessage(
                        `<strong>Appointment saved ✅</strong><br/>But email failed to send: <em>${json.mailError || 'Unknown error'}</em><br/>We saved it in row: ${json.savedRow || 'N/A'}.`,
                        false
                    );
                } else {
                    showSubmissionMessage(
                        `<strong>Appointment confirmed! ✅</strong><br/>We sent a notification email to the salon. Your booking ref: ${json.savedRow || 'N/A'}.`,
                        true
                    );
                }
                if (appointmentForm) appointmentForm.reset();
                if (appointmentForm) appointmentForm.style.display = 'none';

                setTimeout(() => {
                    closeModal();
                    clearSubmissionMessage();
                }, 4000);
            } else {
                const msg = (json && json.message) ? json.message : resText || 'Unknown server error';
                showSubmissionMessage(`<strong>Could not save appointment:</strong> ${msg}`, false);
            }
        } catch (err) {
            console.error('Submit error:', err);
            showSubmissionMessage(`<strong>Network/Server error:</strong> ${err.message || err}`, false);
        } finally {
            disableSubmit(false);
        }
      });
    }

    /* ---------------- Mobile menu toggle ---------------- */
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            menuToggle.classList.toggle('active');
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true' || false;
            menuToggle.setAttribute('aria-expanded', String(!isExpanded));
        });

        mainNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (mainNav.classList.contains('active')) {
                    mainNav.classList.remove('active');
                    menuToggle.classList.remove('active');
                    menuToggle.setAttribute('aria-expanded', 'false');
                }
            });
        });
    }

    /* ---------------- Scroll reveal ---------------- */
    const revealItems = document.querySelectorAll('.reveal-item');
    const observerOptions = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" };
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                obs.unobserve(entry.target);
            }
        });
    }, observerOptions);
    revealItems.forEach(item => observer.observe(item));

    /* ---------------- Init on load ---------------- */
    generateTimeSlots();
    setMinDateToday();
});

