class PredictiveSearch extends HTMLElement {
  constructor() {
    super();

    this.input = this.querySelector('input[type="search"]');
    this.predictiveSearchResults = this.querySelector('#predictive-search-target');
    this.statusElement = this.querySelector('[data-predictive-search-status]');
    this.clearButton = this.querySelector('#predictive-search-clear');

    this.visibilityObserver = null;
    this.typingTimer = null;
    this.messages = [];
    this.currentMessageIndex = 0;
    this.currentCharacterIndex = 0;
    this.isDeleting = false;
    this.wasDrawerVisible = false;
    this.shouldAnimatePlaceholder = false;
    this.activeRequestController = null;
    this.defaultStatusText = this.statusElement ? this.statusElement.textContent.trim() : '';

    this.handleInputChange = this.debounce(this.onChange.bind(this), 300);
    this.handleInputFocus = this.onInputFocus.bind(this);
    this.handleInputKeydown = this.onInputKeydown.bind(this);
    this.handleClearButtonClick = this.onClearButtonClick.bind(this);

    if (this.input && this.predictiveSearchResults) {
      this.input.addEventListener('input', this.handleInputChange);
      this.input.addEventListener('focus', this.handleInputFocus);
      this.input.addEventListener('keydown', this.handleInputKeydown);
    }

    if (this.clearButton) {
      this.clearButton.addEventListener('click', this.handleClearButtonClick);
    }

    this.initTypedPlaceholder();
    this.updateInputUiState();
  }

  disconnectedCallback() {
    this.stopTypedPlaceholderAnimation();
    this.abortPendingRequest();

    if (this.visibilityObserver) {
      this.visibilityObserver.disconnect();
      this.visibilityObserver = null;
    }

    if (this.input) {
      this.input.removeEventListener('input', this.handleInputChange);
      this.input.removeEventListener('focus', this.handleInputFocus);
      this.input.removeEventListener('keydown', this.handleInputKeydown);
    }

    if (this.clearButton) {
      this.clearButton.removeEventListener('click', this.handleClearButtonClick);
    }
  }

  initTypedPlaceholder() {
    if (!this.input) {
      return;
    }

    this.messages = this.parseMessages(this.input.dataset.messages);
    const fallbackPlaceholder = (this.input.dataset.fallbackPlaceholder || this.input.getAttribute('placeholder') || '').trim();

    if (!this.messages.length && fallbackPlaceholder) {
      this.messages = [fallbackPlaceholder];
    }

    if (!this.messages.length) {
      return;
    }

    this.input.setAttribute('placeholder', this.messages[0]);

    const enableTyping = this.input.dataset.enableTyping === 'true';
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.typingSpeed = this.parseDuration(this.input.dataset.typingSpeed, 60, 20);
    this.deletingSpeed = this.parseDuration(this.input.dataset.deletingSpeed, 35, 20);
    this.messagePause = this.parseDuration(this.input.dataset.messagePause, 1600, 200);
    this.shouldAnimatePlaceholder = enableTyping && !prefersReducedMotion && this.messages.length > 1;

    if (!this.shouldAnimatePlaceholder) {
      return;
    }

    this.visibilityObserver = new MutationObserver(() => {
      this.syncPlaceholderAnimationState();
    });
    this.visibilityObserver.observe(this, {
      attributes: true,
      attributeFilter: ['style', 'class']
    });

    this.syncPlaceholderAnimationState();
  }

  syncPlaceholderAnimationState() {
    const isDrawerVisible = window.getComputedStyle(this).display !== 'none';

    if (isDrawerVisible && !this.wasDrawerVisible) {
      this.startTypedPlaceholderAnimation();
    }

    if (!isDrawerVisible && this.wasDrawerVisible) {
      this.stopTypedPlaceholderAnimation();
      this.input.setAttribute('placeholder', this.messages[0]);
    }

    this.wasDrawerVisible = isDrawerVisible;
  }

  startTypedPlaceholderAnimation() {
    if (!this.input || !this.shouldAnimatePlaceholder || !this.messages.length) {
      return;
    }

    this.stopTypedPlaceholderAnimation();
    this.currentMessageIndex = 0;
    this.currentCharacterIndex = 0;
    this.isDeleting = false;
    this.input.setAttribute('placeholder', '');

    this.runTypingStep();
  }

  stopTypedPlaceholderAnimation() {
    if (this.typingTimer) {
      clearTimeout(this.typingTimer);
      this.typingTimer = null;
    }
  }

  runTypingStep() {
    if (!this.input || !this.shouldAnimatePlaceholder || !this.messages.length) {
      return;
    }

    const activeMessage = this.messages[this.currentMessageIndex];
    let nextDelay = this.typingSpeed;

    if (this.isDeleting) {
      this.currentCharacterIndex = Math.max(0, this.currentCharacterIndex - 1);
      nextDelay = this.deletingSpeed;
    } else {
      this.currentCharacterIndex = Math.min(activeMessage.length, this.currentCharacterIndex + 1);
    }

    this.input.setAttribute('placeholder', activeMessage.slice(0, this.currentCharacterIndex));

    if (!this.isDeleting && this.currentCharacterIndex === activeMessage.length) {
      this.isDeleting = true;
      nextDelay = this.messagePause;
    } else if (this.isDeleting && this.currentCharacterIndex === 0) {
      this.isDeleting = false;
      this.currentMessageIndex = (this.currentMessageIndex + 1) % this.messages.length;
    }

    this.typingTimer = setTimeout(() => {
      this.runTypingStep();
    }, nextDelay);
  }

  parseMessages(rawMessages) {
    if (!rawMessages) {
      return [];
    }

    try {
      const parsedMessages = JSON.parse(rawMessages);

      if (!Array.isArray(parsedMessages)) {
        return [];
      }

      return parsedMessages
        .map((message) => (typeof message === 'string' ? message.trim() : ''))
        .filter(Boolean);
    } catch (error) {
      return [];
    }
  }

  parseDuration(value, fallback, min) {
    const parsedValue = Number.parseInt(value, 10);

    if (Number.isNaN(parsedValue) || parsedValue < min) {
      return fallback;
    }

    return parsedValue;
  }

  getSearchTerm() {
    if (!this.input) {
      return '';
    }

    return this.input.value.trim();
  }

  onInputFocus() {
    const searchTerm = this.getSearchTerm();

    if (searchTerm.length) {
      this.getSearchResults(searchTerm);
    }
  }

  onInputKeydown(event) {
    if (event.key !== 'Escape') {
      return;
    }

    this.onClearButtonClick();
  }

  onClearButtonClick() {
    if (!this.input) {
      return;
    }

    this.input.value = '';
    this.abortPendingRequest();
    this.close();
    this.updateInputUiState();
    this.setStatus(this.defaultStatusText);
    this.input.focus();
  }

  onChange() {
    if (!this.input) {
      return;
    }

    const searchTerm = this.getSearchTerm();
    this.updateInputUiState();

    if (!searchTerm.length) {
      this.abortPendingRequest();
      this.close();
      this.setStatus(this.defaultStatusText);
      return;
    }

    this.getSearchResults(searchTerm);
  }

  setStatus(message) {
    if (!this.statusElement || !message) {
      return;
    }

    this.statusElement.textContent = message;
  }

  updateInputUiState() {
    if (!this.clearButton) {
      return;
    }

    const hasSearchTerm = this.getSearchTerm().length > 0;
    this.clearButton.classList.toggle('hidden', !hasSearchTerm);
  }

  abortPendingRequest() {
    if (this.activeRequestController) {
      this.activeRequestController.abort();
      this.activeRequestController = null;
    }
  }

  getSearchResults(searchTerm) {
    this.abortPendingRequest();

    const requestController = new AbortController();
    this.activeRequestController = requestController;
    this.setStatus(`Searching for "${searchTerm}"...`);

    const rootPath = window?.Shopify?.routes?.root || '/';
    const normalizedRootPath = rootPath.endsWith('/') ? rootPath : `${rootPath}/`;

    const searchSuggestUrl = `${normalizedRootPath}search/suggest?${new URLSearchParams({
      q: searchTerm,
      'resources[type]': 'product',
      'resources[limit]': '8',
      'resources[limit_scope]': 'each',
      'resources[options][fields]': 'title,product_type,variants.title,vendor',
      'resources[options][unavailable_products]': 'hide',
      'resources[options][prefix]': 'last',
      section_id: 'predictive-search-results'
    }).toString()}`;

    fetch(searchSuggestUrl, { signal: requestController.signal })
      .then((response) => {
        if (!response.ok) {
          const error = new Error(response.status);
          this.close();
          throw error;
        }

        return response.text();
      })
      .then((text) => {
        if (searchTerm !== this.getSearchTerm()) {
          return;
        }

        const parsedResults = new DOMParser().parseFromString(text, 'text/html');
        const resultSection = parsedResults.querySelector('#shopify-section-predictive-search-results');
        const resultList = parsedResults.querySelector('#predictive-search-results');

        let resultMarkup = '';

        if (resultSection) {
          resultMarkup = resultSection.innerHTML.trim();
        } else if (resultList) {
          resultMarkup = resultList.outerHTML.trim();
        }

        if (!resultMarkup.length) {
          this.close();
          this.setStatus(`No quick matches for "${searchTerm}".`);
          return;
        }

        this.predictiveSearchResults.innerHTML = resultMarkup;
        this.open();

        const resultCount = this.predictiveSearchResults.querySelectorAll('[role="option"]').length;
        if (resultCount > 0) {
          this.setStatus(`${resultCount} quick match${resultCount === 1 ? '' : 'es'} for "${searchTerm}".`);
        } else {
          this.setStatus(`No quick matches for "${searchTerm}".`);
        }
      })
      .catch((error) => {
        if (error.name === 'AbortError') {
          return;
        }

        this.close();
        this.setStatus('Unable to load quick matches. Please try again.');
        console.error('Predictive search request failed', error);
      })
      .finally(() => {
        if (this.activeRequestController === requestController) {
          this.activeRequestController = null;
        }
      });
  }

  open() {
    if (!this.predictiveSearchResults || !this.input) {
      return;
    }

    this.predictiveSearchResults.hidden = false;
    this.predictiveSearchResults.style.display = 'block';
    this.input.setAttribute('aria-expanded', 'true');
  }

  close() {
    if (!this.predictiveSearchResults || !this.input) {
      return;
    }

    this.predictiveSearchResults.hidden = true;
    this.predictiveSearchResults.style.display = 'none';
    this.input.setAttribute('aria-expanded', 'false');
  }

  debounce(fn, wait) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }
}
if (!customElements.get('predictive-search')) {
  customElements.define('predictive-search', PredictiveSearch);
}
