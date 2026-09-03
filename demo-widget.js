/* FM Program Advisor widget — GitHub Pages build. Uses window.AdvisorBrain (demo-brain.js).
   Same rules as the server sandbox: 6 hesitation triggers + 3 cart rescues, one proactive
   attempt per session, dismissed = silent, never proactive on checkout.
   ?fast=1 speeds timers 5× for showcases (labeled on screen). */
(function () {
  const PAGE = document.body.dataset.advisorPage || 'landing';
  const FAST = new URLSearchParams(location.search).get('fast') === '1' ? 5 : 1;
  const T = ms => Math.round(ms / FAST);
  const sid = sessionStorage.advisor_sid || (sessionStorage.advisor_sid = 'S' + Date.now() + Math.random().toString(36).slice(2, 7));

  const css = `
  .adv-bubble{position:fixed;bottom:22px;right:22px;width:58px;height:58px;border-radius:50%;background:#1d4ed8;color:#fff;
    display:flex;align-items:center;justify-content:center;font:700 24px/1 -apple-system,sans-serif;cursor:pointer;
    box-shadow:0 6px 20px rgba(29,78,216,.35);z-index:9999;border:none}
  .adv-panel{position:fixed;bottom:92px;right:22px;width:360px;max-width:calc(100vw - 32px);height:480px;max-height:70vh;
    background:#fff;border:1px solid #e5e7eb;border-radius:16px;box-shadow:0 12px 40px rgba(0,0,0,.16);z-index:9999;
    display:none;flex-direction:column;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
  .adv-panel.open{display:flex}
  .adv-head{background:#1d4ed8;color:#fff;padding:12px 16px;font-size:14px;display:flex;justify-content:space-between;align-items:center}
  .adv-head b{display:block;font-size:15px}
  .adv-head span{opacity:.85;font-size:11.5px}
  .adv-x{background:none;border:none;color:#fff;font-size:20px;cursor:pointer;padding:0 4px}
  .adv-msgs{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px;background:#f9fafb}
  .adv-m{max-width:85%;padding:9px 13px;border-radius:13px;font-size:13.5px;line-height:1.5;white-space:pre-wrap}
  .adv-m.a{background:#fff;border:1px solid #e5e7eb;border-bottom-left-radius:4px;align-self:flex-start}
  .adv-m.u{background:#1d4ed8;color:#fff;border-bottom-right-radius:4px;align-self:flex-end}
  .adv-m.typing{color:#9ca3af;font-style:italic}
  .adv-in{display:flex;border-top:1px solid #e5e7eb;background:#fff}
  .adv-in input{flex:1;border:none;padding:13px 14px;font-size:13.5px;outline:none}
  .adv-in button{border:none;background:#1d4ed8;color:#fff;padding:0 18px;font-size:13.5px;font-weight:600;cursor:pointer}
  .adv-note{font-size:10.5px;color:#9ca3af;text-align:center;padding:4px 8px 8px;background:#fff}
  .adv-src{font-size:10px;color:#6b7280;align-self:flex-start;margin:-6px 0 0 4px}
  .adv-warn{background:#fef3c7;border:1px solid #f59e0b;color:#92400e;font-size:12px;border-radius:10px;padding:8px 12px;align-self:center;text-align:center}`;
  const style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);

  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const pick = sel => document.querySelector(sel);
  const pickAll = sel => Array.prototype.slice.call(document.querySelectorAll(sel));

  const bubble = el('button', 'adv-bubble', '💬'); bubble.title = 'Ask the program advisor';
  const panel = el('div', 'adv-panel');
  const head = el('div', 'adv-head');
  const headL = el('div');
  headL.appendChild(el('b', null, 'FHEA Program Advisor'));
  headL.appendChild(el('span', null, 'AI assistant · human colleague one message away'));
  const xBtn = el('button', 'adv-x', '×'); xBtn.setAttribute('aria-label', 'dismiss');
  head.append(headL, xBtn);
  const msgs = el('div', 'adv-msgs');
  const inWrap = el('div', 'adv-in');
  const input = el('input'); input.placeholder = 'Ask anything about the certification…';
  const send = el('button', null, 'Send');
  inWrap.append(input, send);
  const B = window.AdvisorBrain;
  const live = B && B.mode() !== 'scripted';
  const note = el('div', 'adv-note');
  const noteLabel = el('span', null, 'SANDBOX — connecting to live brain…' + (FAST > 1 ? ' · fast triggers ×5' : '') + ' · ');
  note.appendChild(noteLabel);
  const brainLink = el('a', null, live ? 'disconnect brain' : 'connect live brain');
  brainLink.href = 'javascript:void(0)';
  brainLink.onclick = () => { if (live) { if (confirm('Disconnect the live brain from this browser?')) B.disconnect(); } else B.connect(); };
  note.appendChild(brainLink);
  panel.append(head, msgs, inWrap, note);
  document.body.append(bubble, panel);

  let opened = false, proactiveDone = sessionStorage.advisor_proactive === '1', dismissed = sessionStorage.advisor_dismissed === '1';
  const addMsg = (t, cls) => { const d = el('div', 'adv-m ' + cls, t); msgs.appendChild(d); msgs.scrollTop = msgs.scrollHeight; return d; };
  const open = () => { panel.classList.add('open'); opened = true; warnScripted(); };

  async function agentTurn(payload) {
    const t = addMsg('…', 'a typing');
    try {
      let out;
      try { out = await window.AdvisorBrain.chat(sid, payload); }
      catch (first) { await new Promise(r => setTimeout(r, 4000)); out = await window.AdvisorBrain.chat(sid, payload); }
      t.remove(); if (out.suppressed) return;
      addMsg(out.reply, 'a');
      noteLabel.textContent = 'SANDBOX — LIVE course-trained brain (34 course docs)' + (FAST > 1 ? ' · fast triggers ×5' : '') + ' · ';
      if (out.sources && out.sources.length) { const s = el('div', 'adv-src', '\ud83d\udcda from the course: ' + out.sources.join(' \u00b7 ')); msgs.appendChild(s); msgs.scrollTop = msgs.scrollHeight; }
      if (!opened) open();
    }
    catch (e) { t.className = 'adv-m adv-warn'; t.textContent = 'Live course-trained brain is unreachable right now (server offline). Please try again later so you see the real thing, not a limited preview.'; }
  }
  async function userSend() {
    const v = input.value.trim(); if (!v) return; input.value = '';
    addMsg(v, 'u'); await agentTurn({ message: v });
  }
  send.onclick = userSend; input.addEventListener('keydown', e => { if (e.key === 'Enter') userSend(); });
  let scriptedWarned = false;
  function warnScripted() {
    if (scriptedWarned || !window.AdvisorBrain || window.AdvisorBrain.mode() !== 'scripted') return;
    scriptedWarned = true;
    msgs.appendChild(el('div', 'adv-m adv-warn', 'Note: the live course-trained brain is OFFLINE. This is a limited scripted preview with landing-page facts only. Course-depth answers require the live brain.'));
  }
  bubble.onclick = () => { panel.classList.toggle('open'); opened = panel.classList.contains('open'); warnScripted(); };
  xBtn.onclick = () => { panel.classList.remove('open'); dismissed = true; sessionStorage.advisor_dismissed = '1'; window.AdvisorBrain.dismiss(sid); };

  function proactive(trigger) {
    if (dismissed) return;
    if (PAGE === 'checkout') return;
    if (trigger.indexOf('cart_') === 0) {
      if (sessionStorage['advisor_r_' + trigger]) return;
      sessionStorage['advisor_r_' + trigger] = '1';
    } else {
      if (proactiveDone) return;
      proactiveDone = true; sessionStorage.advisor_proactive = '1';
    }
    agentTurn({ trigger });
  }

  if (PAGE === 'landing') {
    let maxScroll = 0, ctaClicked = false; const t0 = Date.now();
    addEventListener('scroll', () => { maxScroll = Math.max(maxScroll, (scrollY + innerHeight) / document.body.scrollHeight); }, { passive: true });
    pickAll('[data-cta]').forEach(n => n.addEventListener('click', () => { ctaClicked = true; }));
    const dwellCheck = setInterval(() => { if (Date.now() - t0 >= T(45000) && maxScroll >= 0.6 && !ctaClicked) { clearInterval(dwellCheck); proactive('dwell_scroll'); } }, 500);

    const price = pick('#price-block');
    if (price) {
      let vis = 0, inView = false;
      new IntersectionObserver(es => es.forEach(e => { inView = e.isIntersecting; }), { threshold: 0.5 }).observe(price);
      const pTimer = setInterval(() => { if (inView) { vis += 250; if (vis >= T(10000)) { clearInterval(pTimer); proactive('price_dwell'); } } }, 250);
    }
    let faqOpens = 0;
    const onFaqOpen = () => { faqOpens += 1; if (faqOpens >= 2) proactive('faq_repeat'); };
    pickAll('[data-faq]').forEach(n => n.addEventListener('click', onFaqOpen));

    const last = Number(localStorage.advisor_lastvisit) || 0;
    if (last && Date.now() - last < 14 * 864e5 && Date.now() - last > T(60000)) setTimeout(() => proactive('repeat_visit'), 3000);
    localStorage.advisor_lastvisit = String(Date.now());

    if (new URLSearchParams(location.search).get('known') === '1') setTimeout(() => proactive('known_contact'), 2500);

    let idleT = setTimeout(() => proactive('idle'), T(90000));
    ['scroll', 'mousemove', 'keydown', 'click', 'touchstart'].forEach(ev =>
      addEventListener(ev, () => { clearTimeout(idleT); idleT = setTimeout(() => proactive('idle'), T(90000)); }, { passive: true }));
  }

  if (PAGE === 'cart') {
    document.addEventListener('mouseout', e => { if (!e.relatedTarget && e.clientY <= 0) proactive('cart_exit'); });
    const coupon = pick('[data-coupon]');
    if (coupon) coupon.addEventListener('focus', () => setTimeout(() => proactive('cart_coupon'), T(8000)), { once: true });
    const pay = pick('[data-payment]');
    if (pay) new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) setTimeout(() => proactive('cart_stall'), T(30000)); }), { threshold: 0.5 }).observe(pay);
  }
})();
