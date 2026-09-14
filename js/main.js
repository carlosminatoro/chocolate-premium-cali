/**
 * CACAO IMPERIAL & JABONERÍA BOTÁNICA
 * Interactive Logic: Parallax Scroll, Combo Selector, Dynamic Pricing, COD Checkout & WhatsApp API
 */

document.addEventListener('DOMContentLoaded', () => {
  // Configuration: Business WhatsApp Number (Cali, Colombia)
  const WHATSAPP_PHONE = '573150000000'; // Reemplazar con el número comercial de la marca

  // Combo definitions
  const COMBOS = {
    'individual': {
      id: 'individual',
      name: 'Individual Luxe Chocolate 80%',
      price: 32000,
      shipping: 9000,
      badge: 'Individual'
    },
    'duo': {
      id: 'duo',
      name: 'Duo Box Ritual & Maridaje (⭐ Más Elegido)',
      price: 55000,
      shipping: 9000,
      badge: 'Más Vendido'
    },
    'grand': {
      id: 'grand',
      name: 'Grand Gift Box de Lujo (Doble)',
      price: 98000,
      shipping: 0, // Envío Gratis en Cali
      badge: 'Envío Gratis'
    }
  };

  let currentComboId = 'duo'; // Preseleccionado por defecto

  // =========================================================================
  // 1. STEP-OUT STYLE PARALLAX SCROLL (Smooth 60fps with requestAnimationFrame)
  // =========================================================================
  const floatingElements = document.querySelectorAll('.floating-element');
  const heroSection = document.querySelector('.hero-section');
  const mobileBar = document.querySelector('.mobile-bottom-bar');
  let ticking = false;

  function updateParallax() {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    // Move floating accents at differentiated depths
    if (heroSection && scrollY < heroSection.offsetHeight + 200) {
      floatingElements.forEach((el) => {
        const speed = parseFloat(el.getAttribute('data-speed') || 0.15);
        const rotateSpeed = parseFloat(el.getAttribute('data-rotate') || 0);
        const yOffset = scrollY * speed;
        const rotation = scrollY * rotateSpeed;
        el.style.transform = `translate3d(0, ${yOffset}px, 0) rotate(${rotation}deg)`;
      });
    }

    // Toggle Mobile Floating Action Bar
    if (mobileBar) {
      if (scrollY > 380) {
        mobileBar.classList.add('visible');
      } else {
        mobileBar.classList.remove('visible');
      }
    }

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }, { passive: true });

  // Initial call
  updateParallax();

  // =========================================================================
  // 2. COMBO SELECTION & DYNAMIC PRICING CALCULATION
  // =========================================================================
  const radioLabels = document.querySelectorAll('.combo-radio-label');
  const radioInputs = document.querySelectorAll('input[name="combo_select"]');
  const selectButtons = document.querySelectorAll('.btn-select-combo');
  const summarySubtotal = document.getElementById('summary-subtotal');
  const summaryShipping = document.getElementById('summary-shipping');
  const summaryTotal = document.getElementById('summary-total');
  const barPrice = document.getElementById('bar-price');
  const barTitle = document.getElementById('bar-title');

  function formatCOP(amount) {
    return '$' + amount.toLocaleString('es-CO');
  }

  function updateComboSelection(comboId, scrollToForm = false) {
    const combo = COMBOS[comboId];
    if (!combo) return;

    currentComboId = comboId;

    // Update Radio UI inside Checkout Form
    radioLabels.forEach(label => {
      if (label.getAttribute('data-combo-id') === comboId) {
        label.classList.add('selected');
        const input = label.querySelector('input[type="radio"]');
        if (input) input.checked = true;
      } else {
        label.classList.remove('selected');
      }
    });

    // Update Live Order Summary
    const shippingText = combo.shipping === 0 ? 'GRATIS (Cali)' : formatCOP(combo.shipping);
    const grandTotal = combo.price + combo.shipping;

    if (summarySubtotal) summarySubtotal.textContent = formatCOP(combo.price) + ' COP';
    if (summaryShipping) summaryShipping.textContent = shippingText;
    if (summaryTotal) summaryTotal.textContent = formatCOP(grandTotal) + ' COP';

    // Update Mobile Sticky Bar
    if (barPrice) barPrice.textContent = formatCOP(grandTotal);
    if (barTitle) barTitle.textContent = combo.badge;

    // Smooth scroll to form if triggered from hero or cards
    if (scrollToForm) {
      const checkoutSection = document.getElementById('pedido-contraentrega');
      if (checkoutSection) {
        checkoutSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  // Radio button click listeners
  radioInputs.forEach(input => {
    input.addEventListener('change', (e) => {
      updateComboSelection(e.target.value, false);
    });
  });

  // Combo card CTA button click listeners
  selectButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const comboId = e.currentTarget.getAttribute('data-combo');
      updateComboSelection(comboId, true);
    });
  });

  // Initialize default combo state
  updateComboSelection('duo', false);

  // =========================================================================
  // 3. CHECKOUT FORM VALIDATION & DIRECT WHATSAPP COD DISPATCH
  // =========================================================================
  const orderForm = document.getElementById('cod-order-form');

  if (orderForm) {
    orderForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nombre = document.getElementById('nombre').value.trim();
      const telefono = document.getElementById('telefono').value.trim();
      const direccion = document.getElementById('direccion').value.trim();
      const barrio = document.getElementById('barrio').value.trim();
      const mensajeRegalo = document.getElementById('mensaje_regalo').value.trim();

      if (!nombre || !telefono || !direccion || !barrio) {
        alert('Por favor completa todos los datos de entrega para agendar tu pedido en Cali.');
        return;
      }

      const combo = COMBOS[currentComboId];
      const grandTotal = combo.price + combo.shipping;
      const fleteTexto = combo.shipping === 0 ? 'Envío GRATIS' : `$${combo.shipping.toLocaleString('es-CO')} COP`;

      // Structure high-converting order confirmation text
      let text = `👑 *NUEVO PEDIDO - CACAO IMPERIAL (CONTRA ENTREGA)*\n\n`;
      text += `Hola, deseo confirmar mi pedido para entrega en Cali:\n\n`;
      text += `📦 *Combo:* ${combo.name}\n`;
      text += `💰 *Valor Producto:* $${combo.price.toLocaleString('es-CO')} COP\n`;
      text += `🛵 *Flete local:* ${fleteTexto}\n`;
      text += `🏷️ *TOTAL A PAGAR AL RECIBIR:* $${grandTotal.toLocaleString('es-CO')} COP\n\n`;
      text += `📍 *DATOS DE ENTREGA EN CALI:*\n`;
      text += `👤 *Nombre:* ${nombre}\n`;
      text += `📱 *WhatsApp:* ${telefono}\n`;
      text += `🏠 *Dirección:* ${direccion}\n`;
      text += `🏡 *Barrio / Sector:* ${barrio}, Cali\n`;
      
      if (mensajeRegalo) {
        text += `💌 *Mensaje para la Tarjeta:* "${mensajeRegalo}"\n`;
      }

      text += `\n❄️ *Condición:* Empaque térmico con acumulador de frío.\n`;
      text += `💵 *Método de Pago:* Contra Entrega (Efectivo / Nequi / Daviplata al recibir).`;

      const encodedUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(text)}`;

      // Direct redirection to WhatsApp
      window.open(encodedUrl, '_blank');
    });
  }

  // =========================================================================
  // 4. ACCORDION FAQ INTERACTION
  // =========================================================================
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    if (questionBtn) {
      questionBtn.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        // Close others
        faqItems.forEach(other => other.classList.remove('active'));
        // Toggle current
        if (!isActive) {
          item.classList.add('active');
        }
      });
    }
  });

  // =========================================================================
  // 5. CHOCOLATE BOX SLIDER (Frente / Reverso + Touch Swipe en Móviles)
  // =========================================================================
  const chocolateSliders = document.querySelectorAll('.chocolate-slider-container');

  chocolateSliders.forEach(slider => {
    const track = slider.querySelector('.chocolate-slider-track');
    const slides = slider.querySelectorAll('.chocolate-slide');
    const prevBtn = slider.querySelector('.slider-nav-btn.prev');
    const nextBtn = slider.querySelector('.slider-nav-btn.next');
    const pills = slider.querySelectorAll('.toggle-pill');

    let currentSlide = 0;

    function goToSlide(index) {
      if (index < 0) index = 0;
      if (index >= slides.length) index = slides.length - 1;
      currentSlide = index;

      if (track) {
        track.style.transform = `translateX(-${currentSlide * 50}%)`;
      }

      slides.forEach((slide, idx) => {
        slide.classList.toggle('active', idx === currentSlide);
      });

      pills.forEach((pill, idx) => {
        pill.classList.toggle('active', idx === currentSlide);
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        goToSlide(currentSlide === 0 ? 1 : 0);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        goToSlide(currentSlide === 0 ? 1 : 0);
      });
    }

    pills.forEach((pill) => {
      pill.addEventListener('click', (e) => {
        e.stopPropagation();
        const slideIndex = parseInt(e.currentTarget.getAttribute('data-slide') || '0', 10);
        goToSlide(slideIndex);
      });
    });

    // Soporte para gestos táctiles (Swipe) en smartphones
    let startX = 0;
    let endX = 0;

    slider.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
    }, { passive: true });

    slider.addEventListener('touchend', (e) => {
      endX = e.changedTouches[0].clientX;
      const diff = startX - endX;
      if (Math.abs(diff) > 35) {
        if (diff > 0) {
          goToSlide(1); // Deslizar izquierda -> ver reverso
        } else {
          goToSlide(0); // Deslizar derecha -> ver frente
        }
      }
    }, { passive: true });
  });

  // Smooth scroll helper for internal anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '') return;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
});
