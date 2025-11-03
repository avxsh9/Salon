// contact.js - submits contactForm to same router web app (form-encoded + iframe fallback)
(() => {
    const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbx1xQpsmkuuIHIavOLDFi_-BnWIjNSsyeuSmZtbX7x06roBPtZ_6gctRYi6HXY7cbrH/exec'; // <- keep same router URL
  
    document.addEventListener('DOMContentLoaded', () => {
      const form = document.getElementById('contactForm');
      const msg = document.getElementById('contactFormMessage');
  
      if (!form) return;
  
      // ensure iframe for fallback
      let iframe = document.querySelector('iframe[name="hidden_iframe_contact"]');
      if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.name = 'hidden_iframe_contact';
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
      }
  
      function show(text, cls='info') {
        if (!msg) return;
        msg.textContent = text;
        msg.className = 'form-message ' + cls;
        msg.style.opacity = 1;
      }
      function hide() { if (msg) msg.style.opacity = 0; }
  
      async function submitFetch(payload) {
        try {
          const body = new URLSearchParams();
          Object.keys(payload).forEach(k => body.append(k, payload[k] || ''));
          const res = await fetch(WEB_APP_URL, { method: 'POST', body });
          const text = await res.text();
          let json = null;
          try { json = JSON.parse(text); } catch(e){}
          console.log('contact response', res.status, text);
          if (res.ok && json && json.status === 'success' && json.formType === 'contact') {
            show('Message sent — we will contact you soon!', 'success');
            form.reset();
            return true;
          } else {
            show('Server reply unexpected — fallback submit.', 'error');
            return false;
          }
        } catch (err) {
          console.error('contact fetch err', err);
          show('Network error — trying alternate submit', 'error');
          return false;
        }
      }
  
      function submitIframe(payload) {
        // ensure fields with name exist (they do in our HTML)
        form.action = WEB_APP_URL;
        form.method = 'post';
        form.target = 'hidden_iframe_contact';
        form.submit();
        show('Message submitted (fallback). We will contact you soon.', 'success');
        setTimeout(()=> form.reset(), 400);
      }
  
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        hide();
  
        const payload = {
          formType: form.querySelector('[name="formType"]')?.value || 'contact',
          fullname: form.querySelector('[name="fullname"]')?.value?.trim() || '',
          phone: form.querySelector('[name="phone"]')?.value?.trim() || '',
          email: form.querySelector('[name="email"]')?.value?.trim() || '',
          service: form.querySelector('[name="service"]')?.value || '',
          message: form.querySelector('[name="message"]')?.value?.trim() || ''
        };
  
        // basic validation
        if (!payload.fullname) { show('Name required', 'error'); return; }
        if (!/^[0-9]{10}$/.test(payload.phone)) { show('Enter valid 10-digit phone', 'error'); return; }
        if (!/^\S+@\S+\.\S+$/.test(payload.email)) { show('Enter valid email', 'error'); return; }
  
        show('Submitting...', 'info');
        const ok = await submitFetch(payload);
        if (!ok) submitIframe(payload);
      });
    });
  })();
  