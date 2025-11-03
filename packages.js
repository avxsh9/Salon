document.addEventListener('DOMContentLoaded', () => {
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

    // --- 1. Master List of Packages/Prices for Dropdown ---
    // This list includes all bookable services and their prices.
    const packagePrices = [
        { name: "PRE-BRIDAL PACKAGE (₹10000)", price: 10000 },
        { name: "PRE-BRIDAL PACKAGE (₹15000)", price: 15000 },
        { name: "PRE-BRIDAL PACKAGE (₹20000)", price: 20000 },
        { name: "PRE-BRIDAL PACKAGE (₹25000)", price: 25000 },
        { name: "HD Bridal Makeup (MAKEUP STUDIO OR KRYOLAN HD)", price: 10000 },
        { name: "HD Bridal Makeup (MAC OR AIR BRUSH)", price: 15000 },
        { name: "HD Bridal Makeup (BOBBY BROWN)", price: 20000 },
        { name: "HD Bridal Makeup (NARS/ESTEE LAUDER)", price: 22000 },
        { name: "Consultation Booking", price: 0 } // For the general "Book Now" button
    ];

    // --- 2. Populate Time Slots (9 AM to 8 PM in 1-hour gaps) ---
    const generateTimeSlots = () => {
        appointmentTimeSelect.innerHTML = '<option value="">Select Time</option>'; // Default option
        for (let hour = 9; hour <= 20; hour++) { // 9 AM to 8 PM (20:00)
            let displayHour = hour;
            let ampm = 'AM';

            if (hour >= 12) {
                ampm = 'PM';
                if (hour > 12) {
                    displayHour = hour - 12;
                }
            }
            const timeText = `${displayHour.toString().padStart(2, '0')}:00 ${ampm}`; // e.g., 09:00 AM, 01:00 PM

            const option = document.createElement('option');
            option.value = timeText;
            option.textContent = timeText;
            appointmentTimeSelect.appendChild(option);
        }
    };

    // --- 3. Populate Price Select Dropdown (Auto-selects clicked price) ---
    const populatePriceSelect = (selectedPackageName, selectedPrice) => {
        priceSelect.innerHTML = ''; // Clear existing options
        let foundSelectedValue = null; // To store the value of the package to be selected

        const defaultOption = document.createElement('option');
        defaultOption.value = "";
        defaultOption.textContent = "Select Price";
        priceSelect.appendChild(defaultOption);

        packagePrices.forEach(p => {
            const option = document.createElement('option');
            option.value = p.price; // This is a number
            // Display format: ₹10,000/- (Package Name)
            option.textContent = `₹${p.price.toLocaleString('en-IN')}/- (${p.name.split('(')[0].trim()})`;

            // If this package matches the clicked one, mark it for selection
            if (p.name === selectedPackageName && p.price === selectedPrice) {
                foundSelectedValue = p.price; // Store the numeric price
                option.textContent = `₹${p.price.toLocaleString('en-IN')}/- (Auto Selected: ${p.name.split('(')[0].trim()})`; // Indicate auto-selection
            }
            priceSelect.appendChild(option);
        });

        // After all options are added, explicitly set the select's value
        if (foundSelectedValue !== null) {
            priceSelect.value = String(foundSelectedValue); // Convert to string for select.value
        } else {
            // If no specific package was found, ensure the default "Select Price" is shown
            priceSelect.value = "";
        }
    };

    // --- 4. Open Modal Handler ---
    bookNowBtns.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();

            const pkgName = button.getAttribute('data-package');
            const pkgPrice = parseInt(button.getAttribute('data-price'), 10);

            // 1. Clear previous user data and messages FIRST
            appointmentForm.reset();
            submissionMessage.style.display = 'none';
            appointmentForm.style.display = 'block'; // Ensure form is visible again after a previous submission

            // 2. Now, pre-fill the form fields with the new package data
            serviceNameInput.value = pkgName || "Consultation/Custom Booking";
            populatePriceSelect(pkgName, pkgPrice); // This will now correctly set the selected price

            // Generate time slots and open the modal
            generateTimeSlots();
            modal.style.display = 'block';
            modal.setAttribute('aria-hidden', 'false'); // For accessibility

            // Set min date for Appointment Date field (no past dates)
            document.getElementById('appointmentDate').min = new Date().toISOString().split("T")[0];
        });
    });

    // --- 5. Close Modal Handlers ---
    const closeModal = () => {
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true'); // For accessibility
    };

    closeBtn.addEventListener('click', closeModal);

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Allow closing with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            closeModal();
        }
    });

    // --- 6. Form Submission Handler (Simulated) ---
    appointmentForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Basic validation
        if (!document.getElementById('clientName').value ||
            !document.getElementById('phoneNumber').value ||
            !document.getElementById('appointmentDate').value ||
            !appointmentTimeSelect.value ||
            !priceSelect.value) {
            alert("Please fill in all required fields.");
            return;
        }

        const formData = {
            service: serviceNameInput.value,
            price: priceSelect.options[priceSelect.selectedIndex].text,
            name: document.getElementById('clientName').value,
            phone: document.getElementById('phoneNumber').value,
            date: document.getElementById('appointmentDate').value,
            time: appointmentTimeSelect.value
        };

        console.log("Appointment Request Submitted:", formData);

        // Simulate a successful submission
        appointmentForm.reset();
        appointmentForm.style.display = 'none';
        submissionMessage.style.display = 'block';

        // Close modal after 5 seconds
        setTimeout(() => {
            closeModal();
        }, 5000);
    });

    // --- 7. Mobile Menu Toggle ---
    menuToggle.addEventListener('click', () => {
        mainNav.classList.toggle('active');
        menuToggle.classList.toggle('active');
        // Toggle aria-expanded for accessibility
        const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true' || false;
        menuToggle.setAttribute('aria-expanded', !isExpanded);
    });

    // Close mobile menu when a link is clicked
    mainNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            if (mainNav.classList.contains('active')) {
                mainNav.classList.remove('active');
                menuToggle.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        });
    });

    // --- 8. Scroll Reveal Animations ---
    const revealItems = document.querySelectorAll('.reveal-item');

    const observerOptions = {
        threshold: 0.1, // Trigger when 10% of the item is visible
        rootMargin: "0px 0px -50px 0px" // Adjust when item is 50px from bottom of viewport
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Stop observing once visible
            }
        });
    }, observerOptions);

    revealItems.forEach(item => {
        observer.observe(item);
    });
});
