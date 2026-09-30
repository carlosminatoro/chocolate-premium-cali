/**
 * CACAO IMPERIAL & JABONERÍA BOTÁNICA
 * Interactive Logic: Parallax Scroll, Feature Flag (Soap Pilot vs Combo), Dynamic Pricing, COD Checkout & WhatsApp API
 */

document.addEventListener('DOMContentLoaded', () => {
  // Configuration: Business WhatsApp Number (Cali, Colombia)
  const WHATSAPP_PHONE = '573163840641'; // +57 316 3840641 (Cali, Colombia)

  // =========================================================================
  // 0. FEATURE FLAG: PILOTO SOLO JABÓN ("MONEY SOAP") vs COMBO DÚO
  // =========================================================================
  const urlParams = new URLSearchParams(window.location.search);
  const urlMode = urlParams.get('mode'); // ?mode=soap o ?mode=combo
  const savedMode = sessionStorage.getItem('site_mode');
  const serverDefaultMode = window.APP_DEFAULT_MODE || 'soap';

  let currentMode = (urlMode === 'soap' || urlMode === 'combo') 
    ? urlMode 
    : (savedMode === 'soap' || savedMode === 'combo') 
      ? savedMode 
      : serverDefaultMode;

  // Catálogos de ofertas diferenciados
  const ALL_COMBOS = {
    combo: {
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
        shipping: 0,
        badge: 'Envío Gratis'
      }
    },
    soap: {
      'soap_1': {
        id: 'soap_1',
        name: '1 Barra Jabón de Cacao Puro Sello Rojo',
        price: 28000,
        shipping: 9000,
        badge: 'Individual'
      },
      'soap_2': {
        id: 'soap_2',
        name: 'Pack Dúo Cacao Puro (2 Jabones ⭐ Más Vendido)',
        price: 49000,
        shipping: 9000,
        badge: 'Más Vendido'
      },
      'soap_4': {
        id: 'soap_4',
        name: 'Caja Colección Cacao Puro (4 Jabones 🎁 Envío Gratis)',
        price: 89000,
        shipping: 0,
        badge: 'Envío Gratis'
      }
    }
  };

  let currentComboId = currentMode === 'soap' ? 'soap_2' : 'duo';

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
    const catalog = ALL_COMBOS[currentMode] || ALL_COMBOS['soap'];
    const combo = catalog[comboId] || catalog[currentMode === 'soap' ? 'soap_2' : 'duo'];
    if (!combo) return;

    currentComboId = combo.id;

    // Update Radio UI inside Checkout Form
    radioLabels.forEach(label => {
      if (label.getAttribute('data-combo-id') === combo.id) {
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

  function applySiteMode(mode) {
    currentMode = mode;
    sessionStorage.setItem('site_mode', mode);

    if (mode === 'soap') {
      document.body.classList.add('mode-soap');
      document.body.classList.remove('mode-combo');
    } else {
      document.body.classList.add('mode-combo');
      document.body.classList.remove('mode-soap');
    }

    // Actualizar indicador visual del switcher en el footer
    const modeLabel = document.getElementById('mode-name-label');
    if (modeLabel) {
      modeLabel.textContent = mode === 'soap' ? '🧼 Piloto Solo Jabón' : '🍫 Combo Dúo (Chocolate + Jabón)';
    }

    // Inicializar combo predeterminado según el modo
    const defaultCombo = mode === 'soap' ? 'soap_2' : 'duo';
    updateComboSelection(defaultCombo, false);
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

  // Botón switcher en el footer para alternar en vivo
  const btnToggleMode = document.getElementById('btn-toggle-mode');
  if (btnToggleMode) {
    btnToggleMode.addEventListener('click', () => {
      const nextMode = currentMode === 'soap' ? 'combo' : 'soap';
      applySiteMode(nextMode);
    });
  }

  // Activar modo inicial
  applySiteMode(currentMode);

  // =========================================================================
  // 2.5 VIDEO TAB SWITCHER: Video Oficial vs Unboxing Short
  // =========================================================================
  const videoTabBtns = document.querySelectorAll('.video-tab-btn');
  const containerPromo = document.getElementById('container-video-promo');
  const containerShort = document.getElementById('container-video-short');
  const promoVideo = document.getElementById('promo-native-video');
  const shortIframe = document.getElementById('short-iframe');

  videoTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-video');
      videoTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      if (target === 'promo') {
        if (containerPromo) containerPromo.style.display = 'block';
        if (containerShort) containerShort.style.display = 'none';
        if (shortIframe) {
          const src = shortIframe.src;
          shortIframe.src = src; // Pause iframe
        }
      } else {
        if (containerPromo) containerPromo.style.display = 'none';
        if (containerShort) containerShort.style.display = 'block';
        if (promoVideo) promoVideo.pause();
      }
    });
  });

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

      const catalog = ALL_COMBOS[currentMode] || ALL_COMBOS['soap'];
      const combo = catalog[currentComboId] || catalog[currentMode === 'soap' ? 'soap_2' : 'duo'];
      const grandTotal = combo.price + combo.shipping;
      const fleteTexto = combo.shipping === 0 ? 'Envío GRATIS' : `$${combo.shipping.toLocaleString('es-CO')} COP`;

      let text = '';
      if (currentMode === 'soap') {
        text += `👑 *NUEVO PEDIDO CONTRA ENTREGA - JABÓN DE CACAO PURO (MONEY SOAP)* 👑\n\n`;
        text += `Hola, deseo confirmar mi pedido del Jabón de Cacao Puro con Dinero Oculto para entrega en Cali:\n\n`;
        text += `📦 *Pack:* ${combo.name}\n`;
        text += `💰 *Valor Producto:* $${combo.price.toLocaleString('es-CO')} COP\n`;
        text += `🛵 *Flete local:* ${fleteTexto}\n`;
        text += `🏷️ *TOTAL A PAGAR AL RECIBIR:* $${grandTotal.toLocaleString('es-CO')} COP\n\n`;
        text += `📍 *DATOS DE ENTREGA EN CALI:*\n`;
        text += `👤 *Nombre:* ${nombre}\n`;
        text += `📱 *WhatsApp:* ${telefono}\n`;
        text += `🏠 *Dirección:* ${direccion}\n`;
        text += `🏡 *Barrio / Sector:* ${barrio}, Cali\n`;
        if (mensajeRegalo) {
          text += `💌 *Dedicatoria:* "${mensajeRegalo}"\n`;
        }
        text += `\n💵 *Método de Pago:* Contra Entrega (Efectivo / Nequi / Daviplata al recibir).`;
      } else {
        text += `👑 *NUEVO PEDIDO - CACAO IMPERIAL (CONTRA ENTREGA)* 👑\n\n`;
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
      }

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
  // 5. PRODUCT BOX SLIDERS (Chocolate y Jabón con Touch Swipe en Móviles)
  // =========================================================================
  const productSliders = document.querySelectorAll('.chocolate-slider-container, .soap-slider-container');

  productSliders.forEach(slider => {
    const track = slider.querySelector('.chocolate-slider-track, .soap-slider-track');
    const slides = slider.querySelectorAll('.chocolate-slide, .soap-slide');
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
    let startY = 0;
    let endX = 0;
    let isSwiping = false;

    slider.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      isSwiping = false;
    }, { passive: true });

    slider.addEventListener('touchmove', (e) => {
      const diffX = Math.abs(e.touches[0].clientX - startX);
      const diffY = Math.abs(e.touches[0].clientY - startY);
      if (diffX > 12 || diffY > 12) {
        isSwiping = true;
      }
    }, { passive: true });

    slider.addEventListener('touchend', (e) => {
      endX = e.changedTouches[0].clientX;
      const diff = startX - endX;
      if (Math.abs(diff) > 35) {
        isSwiping = true;
        if (diff > 0) {
          goToSlide(1); // Deslizar izquierda -> ver siguiente
        } else {
          goToSlide(0); // Deslizar derecha -> ver anterior
        }
      }
      setTimeout(() => { isSwiping = false; }, 180);
    }, { passive: true });
  });

  // =========================================================================
  // 6. IMAGE LIGHTBOX & WRAPPER DETAIL ZOOM (AMPLIAR ENVOLTURAS)
  // =========================================================================
  const lightbox = document.getElementById('image-lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxSwitch = document.getElementById('lightbox-switch');
  const lightboxPillFront = document.getElementById('lightbox-pill-front');
  const lightboxPillBack = document.getElementById('lightbox-pill-back');
  const lightboxCloseBtn = document.getElementById('lightbox-close');
  const lightboxBackdrop = document.getElementById('lightbox-backdrop');
  const lightboxImgFrame = document.getElementById('lightbox-img-frame');

  const CHOCOLATE_DETAILS = {
    0: {
      src: 'assets/img/chocolate-front.jpg',
      title: 'Envoltura Frontal • Chocolate Imperial 80%',
      caption: 'Edición de Autor con ganache de Whisky & Pistacho en leña. Destellos dorados y sello imperial de garantía.',
      alt: 'Chocolate Imperial 80% - Cara Frontal'
    },
    1: {
      src: 'assets/img/chocolate-back.jpg',
      title: 'Reverso • Información Nutricional e Ingredientes',
      caption: 'Cacao fino de aroma 80%, registro oficial de elaboración artesanal, tabla nutricional y notas de cata.',
      alt: 'Chocolate Imperial 80% - Reverso Nutricional'
    }
  };

  const SOAP_DETAILS = {
    0: {
      src: 'assets/img/jabon-cuadrado.png',
      title: 'Barra Cuadrada Artesanal • Cacao Puro & Sello Floral',
      caption: 'Elaborado con manteca y cacao puro. Huele delicioso a chocolate y sus partículas retiran células muertas dejando la piel luminosa y suavecita. Cápsula impermeable con premio real en efectivo.',
      alt: 'Jabón Imperial Cuadrado Cacao Puro'
    },
    1: {
      src: 'assets/img/jabon-corazon.png',
      title: 'Corazón Botánico Artesanal • Cacao Exfoliante',
      caption: 'Formato artesanal de corazón con partículas naturales de grano de cacao para masaje exfoliante. Piel suavecita y luminosa con irresistible aroma a chocolate y billetes de premio ocultos.',
      alt: 'Jabón Imperial Corazón Cacao Exfoliante'
    }
  };

  let currentLightboxProduct = 'chocolate';
  let currentLightboxIndex = 0;

  function openLightbox(product, slideIndex = 0) {
    if (!lightbox) return;
    currentLightboxProduct = product;
    currentLightboxIndex = slideIndex;

    // Resetear posible zoom 1.5x previo
    if (lightboxImgFrame) {
      lightboxImgFrame.classList.remove('is-zoomed');
    }

    if (lightboxSwitch) {
      lightboxSwitch.style.display = 'inline-flex';
    }

    if (product === 'chocolate') {
      if (lightboxPillFront) lightboxPillFront.textContent = 'Cara Frontal';
      if (lightboxPillBack) lightboxPillBack.textContent = 'Cara Posterior (Nutricional)';
    } else {
      if (lightboxPillFront) lightboxPillFront.textContent = 'Barra Cuadrada';
      if (lightboxPillBack) lightboxPillBack.textContent = 'Corazón Exfoliante';
    }

    updateLightboxProductView(product, slideIndex);

    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // Bloquear scroll de fondo
  }

  function updateLightboxProductView(product, slideIndex) {
    currentLightboxIndex = slideIndex;
    const catalog = product === 'chocolate' ? CHOCOLATE_DETAILS : SOAP_DETAILS;
    const data = catalog[slideIndex] || catalog[0];

    if (lightboxImg) {
      lightboxImg.src = data.src;
      lightboxImg.alt = data.alt;
    }
    if (lightboxTitle) lightboxTitle.textContent = data.title;
    if (lightboxCaption) lightboxCaption.textContent = data.caption;

    if (lightboxPillFront) lightboxPillFront.classList.toggle('active', slideIndex === 0);
    if (lightboxPillBack) lightboxPillBack.classList.toggle('active', slideIndex === 1);
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    if (lightboxImgFrame) {
      lightboxImgFrame.classList.remove('is-zoomed');
    }
    document.body.style.overflow = '';
  }

  if (lightboxPillFront) {
    lightboxPillFront.addEventListener('click', (e) => {
      e.stopPropagation();
      updateLightboxProductView(currentLightboxProduct, 0);
    });
  }

  if (lightboxPillBack) {
    lightboxPillBack.addEventListener('click', (e) => {
      e.stopPropagation();
      updateLightboxProductView(currentLightboxProduct, 1);
    });
  }

  if (lightboxCloseBtn) {
    lightboxCloseBtn.addEventListener('click', closeLightbox);
  }

  if (lightboxBackdrop) {
    lightboxBackdrop.addEventListener('click', closeLightbox);
  }

  // Alternar zoom 1.5x al tocar la imagen dentro del modal para leer letras pequeñas
  if (lightboxImgFrame) {
    lightboxImgFrame.addEventListener('click', () => {
      lightboxImgFrame.classList.toggle('is-zoomed');
    });
  }

  // Cerrar con tecla Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox && lightbox.classList.contains('active')) {
      closeLightbox();
    }
  });

  // Conectar evento click en todas las tarjetas de producto marcadas
  document.querySelectorAll('.zoomable-target').forEach((target) => {
    target.addEventListener('click', (e) => {
      // Ignorar si se hizo click en flechas o píldoras del slider
      if (e.target.closest('.slider-nav-btn, .slider-toggle-pills')) {
        return;
      }
      const product = target.getAttribute('data-product') || 'chocolate';
      let slideIdx = 0;
      if (product === 'chocolate') {
        const activeSlide = target.querySelector('.chocolate-slide.active');
        if (activeSlide) {
          const allSlides = Array.from(target.querySelectorAll('.chocolate-slide'));
          slideIdx = allSlides.indexOf(activeSlide);
          if (slideIdx < 0) slideIdx = 0;
        }
      } else if (product === 'soap') {
        const activeSlide = target.querySelector('.soap-slide.active');
        if (activeSlide) {
          const allSlides = Array.from(target.querySelectorAll('.soap-slide'));
          slideIdx = allSlides.indexOf(activeSlide);
          if (slideIdx < 0) slideIdx = 0;
        }
      }
      openLightbox(product, slideIdx);
    });
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
