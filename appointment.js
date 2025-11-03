// appointment-debug.js — fetch with timeout, verbose logging, iframe fallback
(() => {
  const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbyjQPyOIFVpDXHb22SxDOHQHsZpzs3Vx2t7gSE3PzkigROdgD6XZxA1zjR9EsBYCi_y/exec'; // replace if needed
  const FETCH_TIMEOUT_MS = 8000; // 8s

  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('appointmentForm');
    const msg = document.getElementById('formMessage');
    const dateInput = document.getElementById('appointmentDate');
    const submitBtn = form ? form.querySelector('button[type="submit"]') : null;

    if (!form) {
      console.error('appointmentForm not found');
      return;
    }

    // ensure fallback iframe
    let iframe = document.querySelector('iframe[name="hidden_iframe_appointment"]');
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.name = 'hidden_iframe_appointment';
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
    }

    if (dateInput) {
      const t = new Date();
      dateInput.min = `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`;
    }

    function show(m, cls='info') {
      if (!msg) return;
      msg.textContent = m;
      msg.className = 'form-message ' + cls;
      msg.style.opacity = 1;
    }
    function hide() { if (msg) msg.style.opacity = 0; }
    function setDisabled(v) { if (submitBtn) submitBtn.disabled = !!v; }

    // promise wrapper for fetch with timeout
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

    async function tryFetchSubmit(payload) {
      console.log('tryFetchSubmit payload:', payload);
      const body = new URLSearchParams();
      Object.keys(payload).forEach(k => body.append(k, payload[k] || ''));

      try {
        console.log('Starting fetch to', WEB_APP_URL);
        const res = await fetchWithTimeout(WEB_APP_URL, { method: 'POST', body }, FETCH_TIMEOUT_MS);
        const text = await res.text().catch(()=>'<no-text>');
        console.log('Fetch response status:', res.status, 'text:', text);

        // Attempt to parse JSON safely
        let json = null;
        try { json = JSON.parse(text); } catch(e) { /* not json */ }

        if (!res.ok) {
          console.warn('Server returned non-OK status', res.status);
          return { ok:false, reason:'http', status: res.status, text, json };
        }

        if (json && json.status === 'success') {
          console.log('Server saved successfully', json);
          return { ok:true, json, text };
        } else {
          console.warn('Server returned unexpected body', text, json);
          return { ok:false, reason:'bad-response', text, json };
        }
      } catch (err) {
        console.error('Fetch failed:', err);
        return { ok:false, reason:'network', error:String(err) };
      }
    }

    function submitIframe(payload) {
      console.log('Submitting via iframe fallback', payload);
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
      form.action = WEB_APP_URL;
      form.method = 'post';
      form.target = 'hidden_iframe_appointment';
      form.submit();
      show('Submitted via fallback iframe. If sheet still not updated, check Apps Script logs.', 'success');
      setTimeout(()=>form.reset(), 300);
    }

    function validate(payload) {
      if (!payload.name) { show('Name required','error'); return false; }
      if (!/^[0-9]{10}$/.test(payload.phone)) { show('Enter valid 10-digit phone','error'); return false; }
      if (!/^\S+@\S+\.\S+$/.test(payload.email)) { show('Enter valid email','error'); return false; }
      if (!payload.service) { show('Choose a service','error'); return false; }
      if (!payload.date) { show('Choose a date','error'); return false; }
      if (!payload.time) { show('Choose a time','error'); return false; }
      return true;
    }

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

      show('Submitting (debug mode)...', 'info');

      const result = await tryFetchSubmit(payload);
      console.log('tryFetchSubmit result', result);

      if (result.ok) {
        show('Appointment received — we will contact you soon!', 'success');
        form.reset();
        setDisabled(false);
        return;
      }

      // If network error or timeout or wrong routing, fallback
      if (result.reason === 'timeout') {
        console.warn('Fetch timed out. Falling back to iframe.');
        show('Request timed out — trying alternate submit...', 'error');
        submitIframe(payload);
        setDisabled(false);
        return;
      }

      if (result.reason === 'network') {
        show('Network error — using fallback submit. Open DevTools Console for details.', 'error');
        submitIframe(payload);
        setDisabled(false);
        return;
      }

      if (result.reason === 'bad-response' || result.reason === 'http' || (result.json && result.json.formType && result.json.formType.toLowerCase() !== 'appointment')) {
        // server didn't confirm or routed elsewhere
        console.warn('Server routing/response issue:', result);
        show('Server response unexpected — using fallback submit. Check router or formType.', 'error');
        submitIframe(payload);
        setDisabled(false);
        return;
      }

      // fallback default
      submitIframe(payload);
      setDisabled(false);
    });

  }); // DOMContentLoaded
})();


