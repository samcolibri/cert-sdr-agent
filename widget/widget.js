/* FM Program Advisor widget — sandbox build.
   6 hesitation triggers (page) + 3 rescue moments (cart), one proactive attempt per session,
   dismissed = silent, never proactive on checkout. Embeds as a single <script src="/widget.js">. */
(function () {
  const API = (window.ADVISOR_API || '') + '/api';
  const PAGE = document.body.dataset.advisorPage || 'landing'; // landing | cart | checkout
  const sid = sessionStorage.advisor_sid || (sessionStorage.advisor_sid = 'S' + Date.now() + Math.random().toString(36).slice(2, 7));

  /* ---------- UI (built with createElement — no HTML string injection) ---------- */
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
  .adv-note{font-size:10.5px;color:#9ca3af;text-align:center;padding:4px 8px 8px;background:#fff}`;
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
  const note = el('div', 'adv-note', 'DEMO SANDBOX — AI assistant, answers only from verified program facts');
  panel.append(head, msgs, inWrap, note);
  document.body.append(bubble, panel);

  let opened = false, proactiveDone = sessionStorage.advisor_proactive === '1', dismissed = sessionStorage.advisor_dismissed === '1';
  const addMsg = (t, cls) => { const d = el('div', 'adv-m ' + cls, t); msgs.appendChild(d); msgs.scrollTop = msgs.scrollHeight; return d; };
  const open = () => { panel.classList.add('open'); opened = true; };

  async function post(path, payload) {
    const r = await fetch(API + path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ sessionId: sid, ...payload }) });
    return r.json();
  }
  async function agentTurn(payload) {
    const t = addMsg('…', 'a typing');
    try { const out = await post('/chat', payload); t.remove(); if (out.suppressed) return; addMsg(out.reply, 'a'); if (!opened) open(); }
    catch (e) { t.textContent = '(advisor unavailable)'; }
  }
  async function userSend() {
    const v = input.value.trim(); if (!v) return; input.value = '';
    addMsg(v, 'u'); await agentTurn({ message: v });
  }
  send.onclick = userSend; input.addEventListener('keydown', e => { if (e.key === 'Enter') userSend(); });
  bubble.onclick = () => { panel.classList.toggle('open'); opened = panel.classList.contains('open'); };
  xBtn.onclick = () => { panel.classList.remove('open'); dismissed = true; sessionStorage.advisor_dismissed = '1'; post('/dismiss', {}); };

  /* ---------- proactive engine ---------- */
  function proactive(trigger) {
    if (dismissed) return;                          // dismissed = silent for the session
    if (PAGE === 'checkout') return;                // never proactive on checkout
    if (trigger.indexOf('cart_') === 0) {           // rescue moments: allowed once each on cart page
      if (sessionStorage['advisor_r_' + trigger]) return;
      sessionStorage['advisor_r_' + trigger] = '1';
    } else {
      if (proactiveDone) return;                    // one proactive attempt per session
      proactiveDone = true; sessionStorage.advisor_proactive = '1';
    }
    agentTurn({ trigger });
  }

  if (PAGE === 'landing') {
    /* T1: 45s dwell + 60% scroll, no CTA click */
    let maxScroll = 0, ctaClicked = false; const t0 = Date.now();
    addEventListener('scroll', () => { maxScroll = Math.max(maxScroll, (scrollY + innerHeight) / document.body.scrollHeight); }, { passive: true });
    pickAll('[data-cta]').forEach(n => n.addEventListener('click', () => { ctaClicked = true; }));
    const dwellCheck = setInterval(() => { if (Date.now() - t0 >= 45000 && maxScroll >= 0.6 && !ctaClicked) { clearInterval(dwellCheck); proactive('dwell_scroll'); } }, 1000);

    /* T2: 10s cumulative in view of the price block */
    const price = pick('#price-block');
    if (price) {
      let vis = 0, inView = false;
      new IntersectionObserver(es => es.forEach(e => { inView = e.isIntersecting; }), { threshold: 0.5 }).observe(price);
      const pTimer = setInterval(() => { if (inView) { vis += 500; if (vis >= 10000) { clearInterval(pTimer); proactive('price_dwell'); } } }, 500);
    }
    /* T3: FAQ accordion opened 2+ times */
    let faqOpens = 0;
    const onFaqOpen = () => { faqOpens += 1; if (faqOpens >= 2) proactive('faq_repeat'); };
    pickAll('[data-faq]').forEach(n => n.addEventListener('click', onFaqOpen));

    /* T4: repeat visit within 14 days */
    const last = Number(localStorage.advisor_lastvisit) || 0;
    if (last && Date.now() - last < 14 * 864e5 && Date.now() - last > 60000) setTimeout(() => proactive('repeat_visit'), 4000);
    localStorage.advisor_lastvisit = String(Date.now());

    /* T5: known contact (HubSpot cookie match — simulated via ?known=1) */
    if (new URLSearchParams(location.search).get('known') === '1') setTimeout(() => proactive('known_contact'), 3000);

    /* T6: 90s idle mid-page */
    let idleT = setTimeout(() => proactive('idle'), 90000);
    ['scroll', 'mousemove', 'keydown', 'click', 'touchstart'].forEach(ev =>
      addEventListener(ev, () => { clearTimeout(idleT); idleT = setTimeout(() => proactive('idle'), 90000); }, { passive: true }));
  }

  if (PAGE === 'cart') {
    /* Rescue 1: exit intent */
    document.addEventListener('mouseout', e => { if (!e.relatedTarget && e.clientY <= 0) proactive('cart_exit'); });
    /* Rescue 2: coupon hunting */
    const coupon = pick('[data-coupon]');
    if (coupon) coupon.addEventListener('focus', () => setTimeout(() => proactive('cart_coupon'), 8000), { once: true });
    /* Rescue 3: payment stall — 30s idle on the payment section */
    const pay = pick('[data-payment]');
    if (pay) new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) setTimeout(() => proactive('cart_stall'), 30000); }), { threshold: 0.5 }).observe(pay);
  }
})();
