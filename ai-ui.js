// AI on/off button (left bar). Hides every AI button while AI is off.
(function () {
  'use strict';
  const btn = document.getElementById('aiBtn');
  if (!btn || !window.api || !window.api.aiGet) return;


  // Plain "Add" button next to the quick-add box, so adding a task still works with a click while AI is off
  // (the "AI add" button is hidden then). It does the same as pressing Enter in the box.
  const quick = document.getElementById('tkQuick'), aiAdd = document.getElementById('tkQuickAi');
  if (quick && aiAdd && !document.getElementById('tkQuickPlain')) {
    const plain = document.createElement('button');
    plain.id = 'tkQuickPlain'; plain.type = 'button'; plain.textContent = '+ Add'; plain.title = 'Add the task you typed (same as pressing Enter)';
    plain.addEventListener('click', () => quick.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })));
    aiAdd.parentNode.insertBefore(plain, aiAdd);
  }

  const st = document.createElement('style');
  st.textContent = `
    body.noai #tkPlan, body.noai #tkReview, body.noai #tkQuickAi, body.noai #tkfSuggest, body.noai #sumBtn,
    body.noai #aiDot, body.noai #aiState, body.noai #tkBrief,
    body.noai label.setRow:has(#setBrief), body.noai label.setRow:has(#setWeekly) { display: none !important; }
    #aiBtn.off { opacity: .6; }`;
  document.head.appendChild(st);

  function apply(on) {
    document.body.classList.toggle('noai', !on);
    btn.classList.toggle('off', !on);
    btn.querySelector('span:last-child').textContent = on ? 'AI: on' : 'AI: off';
    btn.title = on ? 'AI is on (needs Ollama). Click to turn it off.' : 'AI is off. Click to turn it on.';
  }

  btn.addEventListener('click', async () => {
    const cur = !document.body.classList.contains('noai');
    const r = await window.api.aiSet(!cur);
    apply(r.enabled);
    if (typeof toast === 'function') toast(r.enabled ? 'AI is on. It needs Ollama running on this PC.' : 'AI is off. Everything else works as normal.');
  });

  window.api.aiGet().then(r => apply(r.enabled)).catch(() => {});
})();
