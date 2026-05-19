/* ==========================================================================
   Order Page — Logic for menu selection, address form, WhatsApp checkout
   ========================================================================== */

(function () {
  'use strict';

  const WHATSAPP_NUMBER = '919072460008';

  // ── State ──
  let cart = {};      // { itemName: { price, qty } }
  let currentStep = 1;
  let orderType = 'delivery';

  // ── DOM References ──
  const panels = {
    1: document.getElementById('panel-menu'),
    2: document.getElementById('panel-address'),
    3: document.getElementById('panel-checkout')
  };
  const steps = document.querySelectorAll('.order-step');
  const stepLines = document.querySelectorAll('.step-line');
  const summaryItems = document.getElementById('summary-items');
  const summaryTotal = document.getElementById('summary-total');
  const summaryTotalWrap = document.getElementById('summary-total-wrap');
  const btnNext = document.getElementById('btn-next');
  const summaryActions = document.getElementById('summary-actions');

  // Mobile
  const floatingCart = document.getElementById('floating-cart');
  const floatingCount = document.getElementById('floating-count');
  const floatingPrice = document.getElementById('floating-price');
  const mobileSummary = document.getElementById('mobile-summary');
  const mobileSummaryItems = document.getElementById('mobile-summary-items');
  const mobileTotal = document.getElementById('mobile-total');
  const mobileTotalWrap = document.getElementById('mobile-total-wrap');
  const mobileBtnNext = document.getElementById('mobile-btn-next');
  const mobileBtnClose = document.getElementById('mobile-btn-close');
  const mobileActions = document.getElementById('mobile-summary-actions');

  if (!panels[1]) return; // Not on order page

  // ── Check for pre-selected item from URL ──
  function checkUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const itemName = params.get('item');
    if (itemName) {
      const items = document.querySelectorAll('.order-item');
      items.forEach(item => {
        if (item.dataset.name === itemName) {
          const price = parseInt(item.dataset.price);
          cart[itemName] = { price, qty: 1 };
          const qtyEl = item.querySelector('.qty-value');
          if (qtyEl) { qtyEl.textContent = '1'; qtyEl.classList.add('has-items'); }
          item.classList.add('selected');
        }
      });
      updateSummary();
    }
  }

  // ── Quantity Buttons ──
  document.querySelectorAll('.order-item').forEach(item => {
    const name = item.dataset.name;
    const price = parseInt(item.dataset.price);
    const qtyEl = item.querySelector('.qty-value');
    const minusBtn = item.querySelector('.qty-minus');
    const plusBtn = item.querySelector('.qty-plus');
    const orderBtn = item.querySelector('.order-item-btn');

    plusBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!cart[name]) cart[name] = { price, qty: 0 };
      cart[name].qty++;
      qtyEl.textContent = cart[name].qty;
      qtyEl.classList.add('has-items');
      item.classList.add('selected');
      updateSummary();
    });

    minusBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (cart[name] && cart[name].qty > 0) {
        cart[name].qty--;
        qtyEl.textContent = cart[name].qty;
        if (cart[name].qty === 0) {
          delete cart[name];
          qtyEl.classList.remove('has-items');
          item.classList.remove('selected');
        }
        updateSummary();
      }
    });

    // Individual "Order Now" button — adds 1 and jumps to step 2
    if (orderBtn) {
      orderBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!cart[name] || cart[name].qty === 0) {
          cart[name] = { price, qty: 1 };
          qtyEl.textContent = '1';
          qtyEl.classList.add('has-items');
          item.classList.add('selected');
        }
        updateSummary();
        goToStep(2);
      });
    }
  });

  // ── Order Type Toggle ──
  document.querySelectorAll('.order-type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.order-type-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      orderType = btn.dataset.type;
      const deliveryFields = document.getElementById('delivery-fields');
      if (deliveryFields) {
        deliveryFields.style.display = orderType === 'delivery' ? 'block' : 'none';
      }
    });
  });

  // ── Update Summary ──
  function updateSummary() {
    const entries = Object.entries(cart).filter(([, v]) => v.qty > 0);
    const totalQty = entries.reduce((s, [, v]) => s + v.qty, 0);
    const totalPrice = entries.reduce((s, [, v]) => s + v.price * v.qty, 0);

    // Desktop summary
    if (entries.length === 0) {
      summaryItems.innerHTML = '<div class="summary-empty"><i class="fas fa-shopping-bag"></i><span>Your cart is empty</span></div>';
      summaryTotalWrap.style.display = 'none';
      btnNext.disabled = true;
      if (mobileBtnNext) mobileBtnNext.disabled = true;
      const inline1 = document.getElementById('inline-next-1');
      if (inline1) inline1.disabled = true;
    } else {
      let html = '';
      entries.forEach(([name, { price, qty }]) => {
        html += `<div class="summary-item">
          <span><span class="summary-item-name">${name}</span><span class="summary-item-qty"> × ${qty}</span></span>
          <span class="summary-item-price">₹${(price * qty).toLocaleString('en-IN')}</span>
        </div>`;
      });
      summaryItems.innerHTML = html;
      summaryTotal.textContent = `₹${totalPrice.toLocaleString('en-IN')}`;
      summaryTotalWrap.style.display = 'flex';
      btnNext.disabled = false;
      if (mobileBtnNext) mobileBtnNext.disabled = false;
      const inline1b = document.getElementById('inline-next-1');
      if (inline1b) inline1b.disabled = false;
    }

    // Mobile summary
    if (mobileSummaryItems) {
      mobileSummaryItems.innerHTML = summaryItems.innerHTML;
      mobileTotal.textContent = `₹${totalPrice.toLocaleString('en-IN')}`;
      mobileTotalWrap.style.display = entries.length > 0 ? 'flex' : 'none';
    }

    // Floating cart
    if (floatingCart) {
      if (totalQty > 0) {
        floatingCart.classList.add('has-items');
        floatingCount.textContent = totalQty;
        floatingPrice.textContent = `₹${totalPrice.toLocaleString('en-IN')}`;
      } else {
        floatingCart.classList.remove('has-items');
      }
    }

    updateButtons();
  }

  // ── Step Navigation ──
  function goToStep(step) {
    if (step < 1 || step > 3) return;

    // Validate before advancing
    if (step === 2 && Object.keys(cart).filter(k => cart[k].qty > 0).length === 0) return;
    if (step === 3 && !validateForm()) return;
    if (step === 3) buildCheckoutReview();

    currentStep = step;

    // Update panels
    Object.values(panels).forEach(p => { if (p) p.classList.remove('active'); });
    if (panels[step]) panels[step].classList.add('active');

    // Update step indicators
    steps.forEach((s, i) => {
      const sNum = i + 1;
      s.classList.remove('active', 'done');
      if (sNum === step) s.classList.add('active');
      else if (sNum < step) s.classList.add('done');
    });
    stepLines.forEach((line, i) => {
      line.classList.toggle('active', i < step - 1);
    });

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    updateButtons();

    // Close mobile summary if open
    if (mobileSummary) mobileSummary.classList.remove('open');
  }

  function updateButtons() {
    const entries = Object.entries(cart).filter(([, v]) => v.qty > 0);
    const hasItems = entries.length > 0;

    let btnHtml = '';
    let mobileBtnHtml = '';

    if (currentStep === 1) {
      btnHtml = `<button class="summary-btn summary-btn-primary" id="btn-next" ${!hasItems ? 'disabled' : ''}><i class="fas fa-arrow-right"></i> Continue to Details</button>`;
      mobileBtnHtml = `<button class="summary-btn summary-btn-primary" id="mobile-btn-next" ${!hasItems ? 'disabled' : ''}><i class="fas fa-arrow-right"></i> Continue to Details</button>
        <button class="summary-btn summary-btn-outline" id="mobile-btn-close">Close</button>`;
    } else if (currentStep === 2) {
      btnHtml = `<button class="summary-btn summary-btn-primary" id="btn-next"><i class="fas fa-check"></i> Review Order</button>
        <button class="summary-btn summary-btn-outline" id="btn-back"><i class="fas fa-arrow-left"></i> Back to Menu</button>`;
      mobileBtnHtml = `<button class="summary-btn summary-btn-primary" id="mobile-btn-next"><i class="fas fa-check"></i> Review Order</button>
        <button class="summary-btn summary-btn-outline" id="mobile-btn-close">Close</button>`;
    } else if (currentStep === 3) {
      btnHtml = `<button class="summary-btn summary-btn-whatsapp" id="btn-checkout"><i class="fab fa-whatsapp"></i> Send Order via WhatsApp</button>
        <button class="summary-btn summary-btn-outline" id="btn-back"><i class="fas fa-arrow-left"></i> Edit Details</button>`;
      mobileBtnHtml = `<button class="summary-btn summary-btn-whatsapp" id="mobile-btn-checkout"><i class="fab fa-whatsapp"></i> Send via WhatsApp</button>
        <button class="summary-btn summary-btn-outline" id="mobile-btn-close">Close</button>`;
    }

    summaryActions.innerHTML = btnHtml;
    if (mobileActions) mobileActions.innerHTML = mobileBtnHtml;

    // Re-bind buttons
    bindActionButtons();
  }

  function bindActionButtons() {
    const next = document.getElementById('btn-next');
    const back = document.getElementById('btn-back');
    const checkout = document.getElementById('btn-checkout');
    const mNext = document.getElementById('mobile-btn-next');
    const mClose = document.getElementById('mobile-btn-close');
    const mCheckout = document.getElementById('mobile-btn-checkout');

    if (next) next.addEventListener('click', () => goToStep(currentStep + 1));
    if (back) back.addEventListener('click', () => goToStep(currentStep - 1));
    if (checkout) checkout.addEventListener('click', sendWhatsApp);
    if (mNext) mNext.addEventListener('click', () => {
      if (mobileSummary) mobileSummary.classList.remove('open');
      goToStep(currentStep + 1);
    });
    if (mClose) mClose.addEventListener('click', () => {
      if (mobileSummary) mobileSummary.classList.remove('open');
    });
    if (mCheckout) mCheckout.addEventListener('click', sendWhatsApp);

    // Inline mobile panel buttons
    const inlineNext1 = document.getElementById('inline-next-1');
    const inlineNext2 = document.getElementById('inline-next-2');
    const inlineBack2 = document.getElementById('inline-back-2');
    const inlineCheckout = document.getElementById('inline-checkout');
    const inlineBack3 = document.getElementById('inline-back-3');

    if (inlineNext1) inlineNext1.addEventListener('click', () => goToStep(2));
    if (inlineNext2) inlineNext2.addEventListener('click', () => goToStep(3));
    if (inlineBack2) inlineBack2.addEventListener('click', () => goToStep(1));
    if (inlineCheckout) inlineCheckout.addEventListener('click', sendWhatsApp);
    if (inlineBack3) inlineBack3.addEventListener('click', () => goToStep(2));
  }

  // ── Floating Cart Click ──
  if (floatingCart) {
    floatingCart.addEventListener('click', () => {
      if (mobileSummary) {
        mobileSummary.style.display = 'block';
        // Force reflow
        mobileSummary.offsetHeight;
        mobileSummary.classList.add('open');
      }
    });
  }

  // Close mobile summary on overlay click
  if (mobileSummary) {
    mobileSummary.addEventListener('click', (e) => {
      if (e.target === mobileSummary) {
        mobileSummary.classList.remove('open');
      }
    });
  }

  // ── Form Validation ──
  function validateForm() {
    let valid = true;
    const name = document.getElementById('order-name');
    const phone = document.getElementById('order-phone');
    const address = document.getElementById('order-address');

    // Clear errors
    document.querySelectorAll('.form-input, .form-textarea').forEach(el => el.classList.remove('error'));
    document.querySelectorAll('.form-error').forEach(el => el.style.display = 'none');

    if (!name.value.trim()) {
      name.classList.add('error');
      document.getElementById('error-name').style.display = 'block';
      valid = false;
    }

    const phoneVal = phone.value.trim().replace(/\D/g, '');
    if (phoneVal.length < 10) {
      phone.classList.add('error');
      document.getElementById('error-phone').style.display = 'block';
      valid = false;
    }

    if (orderType === 'delivery' && !address.value.trim()) {
      address.classList.add('error');
      document.getElementById('error-address').style.display = 'block';
      valid = false;
    }

    return valid;
  }

  // ── Build Checkout Review ──
  function buildCheckoutReview() {
    const entries = Object.entries(cart).filter(([, v]) => v.qty > 0);
    const total = entries.reduce((s, [, v]) => s + v.price * v.qty, 0);

    // Items
    let itemsHtml = '';
    entries.forEach(([name, { price, qty }]) => {
      itemsHtml += `<div class="checkout-detail-row">
        <span>${name} × ${qty}</span>
        <span>₹${(price * qty).toLocaleString('en-IN')}</span>
      </div>`;
    });
    document.getElementById('checkout-items').innerHTML = itemsHtml;
    document.getElementById('checkout-total').innerHTML = `<div class="checkout-detail-row total"><span>Estimated Total</span><span>₹${total.toLocaleString('en-IN')}</span></div>`;

    // Customer
    const name = document.getElementById('order-name').value.trim();
    const phone = document.getElementById('order-phone').value.trim();
    document.getElementById('checkout-customer').innerHTML = `<p class="checkout-detail">${name}<br>${phone}</p>`;

    // Address
    const deliverySection = document.getElementById('checkout-delivery-section');
    if (orderType === 'delivery') {
      const address = document.getElementById('order-address').value.trim();
      const area = document.getElementById('order-area').value.trim();
      const pincode = document.getElementById('order-pincode').value.trim();
      let addrStr = address;
      if (area) addrStr += ', ' + area;
      if (pincode) addrStr += ' - ' + pincode;
      document.getElementById('checkout-address').innerHTML = `<p class="checkout-detail">${addrStr}</p>`;
      deliverySection.style.display = 'block';
    } else {
      deliverySection.style.display = 'none';
    }

    // Notes
    const notes = document.getElementById('order-notes').value.trim();
    const notesSection = document.getElementById('checkout-notes-section');
    if (notes) {
      document.getElementById('checkout-notes').textContent = notes;
      notesSection.style.display = 'block';
    } else {
      notesSection.style.display = 'none';
    }
  }

  // ── Send to WhatsApp ──
  function sendWhatsApp() {
    const entries = Object.entries(cart).filter(([, v]) => v.qty > 0);
    const total = entries.reduce((s, [, v]) => s + v.price * v.qty, 0);

    const name = document.getElementById('order-name').value.trim();
    const phone = document.getElementById('order-phone').value.trim();
    const notes = document.getElementById('order-notes').value.trim();

    let msg = `*New Order - Malabar Bakes*\n\n`;
    msg += `*Customer:* ${name}\n`;
    msg += `*Phone:* ${phone}\n`;
    msg += `*Type:* ${orderType === 'delivery' ? 'Delivery' : 'Pickup'}\n`;

    if (orderType === 'delivery') {
      const address = document.getElementById('order-address').value.trim();
      const area = document.getElementById('order-area').value.trim();
      const pincode = document.getElementById('order-pincode').value.trim();
      let addrStr = address;
      if (area) addrStr += ', ' + area;
      if (pincode) addrStr += ' - ' + pincode;
      msg += `*Address:* ${addrStr}\n`;
    }

    msg += `\n─────────────────\n`;
    msg += `*Order Items:*\n\n`;

    entries.forEach(([itemName, { price, qty }]) => {
      msg += `- ${itemName} x ${qty}  -  Rs.${(price * qty).toLocaleString('en-IN')}\n`;
    });

    msg += `\n─────────────────\n`;
    msg += `*Estimated Total: Rs.${total.toLocaleString('en-IN')}*\n`;

    if (notes) {
      msg += `\n*Special Instructions:*\n${notes}\n`;
    }

    msg += `\n_Sent from malabarbakes.netlify.app_`;

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  }

  // ── Init ──
  checkUrlParams();
  updateSummary();
  bindActionButtons();

})();
