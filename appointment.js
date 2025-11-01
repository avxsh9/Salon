// Appointment Page Specific JavaScript

document.addEventListener('DOMContentLoaded', () => {
    const appointmentForm = document.getElementById('appointmentForm');
    const appointmentDateInput = document.getElementById('appointmentDate');
    const formMessageContainer = document.getElementById('formMessage'); // Get the pre-existing message container
  
    // Set minimum date for appointmentDate input to today
    if (appointmentDateInput) {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months start at 0!
      const dd = String(today.getDate()).padStart(2, '0');
      const minDate = `${yyyy}-${mm}-${dd}`;
      appointmentDateInput.setAttribute('min', minDate);
    }
  
    // Handle Appointment Form Submission
    if (appointmentForm) {
      appointmentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        console.log('Appointment form submitted.'); // Debugging log
  
        // Reset message container state
        if (formMessageContainer) {
          formMessageContainer.classList.remove('success', 'error');
          formMessageContainer.style.opacity = 0;
          formMessageContainer.style.transform = 'translateY(10px)';
          formMessageContainer.textContent = ''; // Clear previous message
        }
  
        // Basic client-side validation
        const inputs = appointmentForm.querySelectorAll('input, select, textarea');
        let allValid = true;
        inputs.forEach(input => {
          // For select elements, ensure a non-empty value is selected
          if (input.tagName === 'SELECT' && input.value === '') {
            allValid = false;
            input.reportValidity(); // Show browser's default validation message
          } else if (!input.checkValidity()) {
            allValid = false;
            input.reportValidity(); // Show browser's default validation message
          }
        });
  
        if (formMessageContainer) { // Only proceed if message container exists
          if (allValid) {
            console.log('Form is valid. Simulating submission...'); // Debugging log
            // Simulate form submission
            setTimeout(() => {
              formMessageContainer.textContent = 'Thank you for your appointment request! We will contact you soon.';
              formMessageContainer.classList.add('success');
              formMessageContainer.style.opacity = 1;
              formMessageContainer.style.transform = 'translateY(0)';
              appointmentForm.reset();
              console.log('Form submission simulated and reset.'); // Debugging log
            }, 500);
          } else {
            console.log('Form is invalid. Displaying error message.'); // Debugging log
            formMessageContainer.textContent = 'Please fill in all required fields correctly.';
            formMessageContainer.classList.add('error');
            formMessageContainer.style.opacity = 1;
            formMessageContainer.style.transform = 'translateY(0)';
          }
        } else {
            console.error('Form message container not found!'); // Fallback error
        }
      });
    } else {
        console.error('Appointment form element not found!'); // Fallback error
    }
  
    // Scroll to form section if hash is present in URL
    if (window.location.hash === '#appointmentFormSection') {
        const formSection = document.getElementById('appointmentFormSection');
        if (formSection) {
            // Use requestAnimationFrame for smoother scroll after layout render
            requestAnimationFrame(() => {
                formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        }
    }
  });
  