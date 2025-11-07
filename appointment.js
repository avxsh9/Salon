// appointment-debug.js — Refactored for Robustness and Clear Messaging
(() => {
  // === CONFIGURATION ===
  // !! DOUBLE-CHECK THIS URL !!
  // It must be the correct "exec" URL from your deployed Google Apps Script Web App.
  const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwjjmpBvWFz2YHWXLOOLZKVVPEJ1uwlPjRXln61MBPQpbV7LYo0S9HQbqjWO2WQh6mM/exec';
  const FETCH_TIMEOUT_MS = 8000; // 8s timeout for fetch

  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('appointmentForm');
    const msg = document.getElementById('formMessage');
    const dateInput = document.getElementById('appointmentDate');
    const submitBtn = form ? form.querySelector('button[type="submit"]') : null;

    if (!form) {
      console.error('appointmentForm not found. Check HTML ID.');
      return;
    }

    // --- SETUP ---

    // 1. Ensure fallback iframe exists
    let iframe = document.querySelector('iframe[name="hidden_iframe_appointment"]');
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.name = 'hidden_iframe_appointment';
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
    }

    // 2. Set min date to today
    if (dateInput) {
      const today = new Date();
      // Format as YYYY-MM-DD
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-based
      const dd = String(today.getDate()).padStart(2, '0');
      dateInput.min = `${yyyy}-${mm}-${dd}`;
    }

    // --- UTILITIES ---

    function show(m, cls = 'info') {
      if (!msg) return;
      msg.textContent = m;
      msg.className = 'form-message ' + cls;
      msg.style.opacity = 1;
    }
    function hide() { if (msg) msg.style.opacity = 0; }
    function setDisabled(v) { if (submitBtn) submitBtn.disabled = !!v; }

    // Promise wrapper for fetch with timeout (Kept for robustness)
    function fetchWithTimeout(url, options = {}, timeout = FETCH_TIMEOUT_MS) {
      return new Promise((resolve, reject) => {
        const ac = new AbortController();
        const id = setTimeout(() => {
          ac.abort();
          reject(new Error('timeout'));
        }, timeout);
        options.signal = ac.signal;
        fetch(url, options).then(response => {
          clearTimeout(id);
          resolve(response);
        }).catch(err => {
          clearTimeout(id);
          reject(err);
        });
      });
    }

    // --- CORE LOGIC ---

    async function tryFetchSubmit(payload) {
      console.log('tryFetchSubmit payload:', payload);
      const body = new URLSearchParams();
      // Prepare body for x-www-form-urlencoded
      Object.keys(payload).forEach(k => body.append(k, payload[k] || ''));

      try {
        console.log('Starting fetch to', WEB_APP_URL);
        
        // Use the fetch with timeout
        const res = await fetchWithTimeout(WEB_APP_URL, { method: 'POST', body }, FETCH_TIMEOUT_MS);
        
        const text = await res.text().catch(()=>'<no-text>');
        console.log('Fetch response status:', res.status, 'text:', text);

        let json = null;
        try { json = JSON.parse(text); } catch(e) { /* not json or invalid json */ }

        // Check if the HTTP status is OK (200-299)
        if (!res.ok) {
          console.warn('Server returned non-OK status', res.status);
          return { ok:false, reason:'http', status: res.status, text, json };
        }

        // Check for success status from Apps Script JSON response
        if (json && json.status === 'success') {
          console.log('Server saved successfully', json);
          return { ok:true, json, text };
        } 
        
        // Handle a successful HTTP request (200) but unexpected Apps Script response
        console.warn('Server returned OK status but unexpected body/JSON response:', text, json);
        return { ok:false, reason:'bad-response', text, json };
        
      } catch (err) {
        console.error('Fetch failed:', err);
        return { ok:false, reason:'network', error:String(err) };
      }
    }

    // Iframe Fallback (Kept for maximum compatibility)
    function submitIframe(payload) {
      console.log('Submitting via iframe fallback', payload);
      
      // Update/add form fields with payload data
      Object.keys(payload).forEach(k => {
        let el = form.querySelector(`[name="${k}"]`);
        if (!el) {
          el = document.createElement('input');
          el.type = 'hidden';
          el.name = k;
          form.appendChild(el);
        }
        el.value = payload[k] || '';
      });
      
      // Configure and submit the form via iframe
      form.action = WEB_APP_URL;
      form.method = 'post';
      form.target = 'hidden_iframe_appointment';
      form.submit();
      
      // Since we can't reliably track the iframe success/failure, we show a tentative message.
      show('Submission attempt via fallback mode. Please check Apps Script logs for confirmation.', 'info');
      // Set a short delay before reset to ensure submit fires
      setTimeout(() => form.reset(), 500); 
    }

    function validate(payload) {
      if (!payload.name) { show('Please enter your name.', 'error'); return false; }
      if (!/^[0-9]{10}$/.test(payload.phone)) { show('Please enter a valid 10-digit phone number.', 'error'); return false; }
      if (!/^\S+@\S+\.\S+$/.test(payload.email)) { show('Please enter a valid email address.', 'error'); return false; }
      if (!payload.service) { show('Please select a service.', 'error'); return false; }
      if (!payload.date) { show('Please choose an appointment date.', 'error'); return false; }
      if (!payload.time) { show('Please choose an appointment time.', 'error'); return false; }
      return true;
    }

    // --- FORM SUBMISSION HANDLER ---

    form.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      hide();
      setDisabled(true);

      const payload = {
        formType: form.querySelector('[name="formType"]')?.value || 'appointment',
        name: form.querySelector('[name="name"]')?.value?.trim() || '',
        phone: form.querySelector('[name="phone"]')?.value?.trim() || '',
        email: form.querySelector('[name="email"]')?.value?.trim() || '',
        service: form.querySelector('[name="service"]')?.value || '',
        date: form.querySelector('[name="date"]')?.value || '',
        time: form.querySelector('[name="time"]')?.value || '',
        message: form.querySelector('[name="message"]')?.value?.trim() || ''
      };

      if (!validate(payload)) { setDisabled(false); return; }

      show('Scheduling your appointment...', 'info');

      // 1. Try primary fetch method
      const result = await tryFetchSubmit(payload);
      console.log('tryFetchSubmit final result', result);

      if (result.ok) {
        // Success case
        show('✅ Appointment Confirmed! We look forward to seeing you. Please be on time.', 'success');
        form.reset();
        setDisabled(false);
        return;
      }

      // 2. If fetch fails, use iframe fallback
      console.warn(`Fetch failed (Reason: ${result.reason}). Falling back to iframe submission.`);
      show('Error submitting online. Retrying with alternate method. Check console for details.', 'error');
      
      // Use iframe for all critical failures (timeout, network, or bad response)
      submitIframe(payload);
      setDisabled(false);
      
      // Note: The form will only reset inside submitIframe after a delay.
    });
  });
})();