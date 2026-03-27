(() => {
  function initStickyAddToCart() {
    const productSection = document.querySelector('.shopify-section-main-product-inner[data-prodify]');
    const stickyBar = document.querySelector('[data-sticky-atc]');

    if (!productSection || !stickyBar) {
      return;
    }

    const stickyButton = stickyBar.querySelector('[data-sticky-atc-button]');
    const stickyButtonText = stickyBar.querySelector('[data-sticky-atc-button-text]');
    const stickyPrice = stickyBar.querySelector('[data-sticky-atc-price]');
    const stickyImage = stickyBar.querySelector('[data-sticky-atc-image]');

    if (!stickyButton || !stickyButtonText) {
      return;
    }

    const getProductForm = () => productSection.querySelector('[data-prodify-product-form]');
    const getMainAddButton = () => {
      const productForm = getProductForm();
      return productForm ? productForm.querySelector('[name="add"]') : null;
    };

    const getPriceText = () => {
      const priceContainer = productSection.querySelector('[data-prodify-price-container]');

      if (!priceContainer) {
        return '';
      }

      const priceSpans = priceContainer.querySelectorAll('span');
      const activePrice = priceSpans[priceSpans.length - 1];

      if (activePrice && activePrice.textContent) {
        return activePrice.textContent.trim();
      }

      return priceContainer.textContent ? priceContainer.textContent.trim() : '';
    };

    const getVariantImageUrl = () => {
      const currentVariant = window && window.prodify ? window.prodify.currentVariant : null;
      const featuredMedia = currentVariant && currentVariant.featured_media ? currentVariant.featured_media : null;

      if (featuredMedia && featuredMedia.id) {
        const variantImage = productSection.querySelector(`.product-gallery__track img[data-media-id="${featuredMedia.id}"]`);

        if (variantImage && variantImage.currentSrc) {
          return variantImage.currentSrc;
        }

        if (variantImage && variantImage.src) {
          return variantImage.src;
        }
      }

      const fallbackImage = productSection.querySelector('.product-gallery__track img[data-media-id], .product-gallery__track img');

      if (fallbackImage && fallbackImage.currentSrc) {
        return fallbackImage.currentSrc;
      }

      if (fallbackImage && fallbackImage.src) {
        return fallbackImage.src;
      }

      return '';
    };

    const syncStickyState = () => {
      const addButton = getMainAddButton();

      if (!addButton) {
        stickyButton.setAttribute('disabled', 'disabled');
        stickyButtonText.textContent = 'Unavailable';
        return;
      }

      const buttonLabelSource = addButton.querySelector('span');
      const buttonLabel = buttonLabelSource && buttonLabelSource.textContent
        ? buttonLabelSource.textContent.trim()
        : addButton.textContent.trim();

      if (buttonLabel) {
        stickyButtonText.textContent = buttonLabel;
      }

      if (addButton.hasAttribute('disabled')) {
        stickyButton.setAttribute('disabled', 'disabled');
      } else {
        stickyButton.removeAttribute('disabled');
      }

      if (stickyPrice) {
        const currentPriceText = getPriceText();
        if (currentPriceText) {
          stickyPrice.textContent = currentPriceText;
        }
      }

      if (stickyImage) {
        const currentImage = getVariantImageUrl();

        if (currentImage && stickyImage.getAttribute('src') !== currentImage) {
          stickyImage.setAttribute('src', currentImage);
        }
      }
    };

    stickyButton.addEventListener('click', () => {
      const addButton = getMainAddButton();

      if (!addButton || addButton.hasAttribute('disabled')) {
        return;
      }

      addButton.click();
      requestAnimationFrame(syncStickyState);
      setTimeout(syncStickyState, 200);
    });

    productSection.addEventListener('change', () => {
      requestAnimationFrame(syncStickyState);
      setTimeout(syncStickyState, 120);
    });

    productSection.addEventListener('prodify:variant-media', () => {
      requestAnimationFrame(syncStickyState);
    });

    document.addEventListener('liquid-ajax-cart:request-end', () => {
      requestAnimationFrame(syncStickyState);
    });

    const observer = new MutationObserver(() => {
      requestAnimationFrame(syncStickyState);
    });

    observer.observe(productSection, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['disabled']
    });

    syncStickyState();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStickyAddToCart, { once: true });
  } else {
    initStickyAddToCart();
  }
})();
