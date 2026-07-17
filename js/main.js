// ========== Language Management ==========
class LanguageManager {
    constructor() {
        this.currentLang = 'pt';
        this.init();
    }

    init() {
        // Set up language switchers
        const langSwitches = document.querySelectorAll('.lang-switch, .lang-switch-footer');
        langSwitches.forEach(switcher => {
            switcher.addEventListener('click', () => this.toggleLanguage());
        });
    }

    toggleLanguage() {
        this.currentLang = this.currentLang === 'pt' ? 'en' : 'pt';
        this.updateContent();
        this.updateSwitchers();
    }

    updateContent() {
        // Update all elements with data attributes
        document.querySelectorAll('[data-pt][data-en]').forEach(el => {
            const text = el.getAttribute(`data-${this.currentLang}`);
            if (text) el.textContent = text;
        });

        // Update placeholders
        document.querySelectorAll('[data-placeholder-pt][data-placeholder-en]').forEach(el => {
            const placeholder = el.getAttribute(`data-placeholder-${this.currentLang}`);
            if (placeholder) el.placeholder = placeholder;
        });

        // Update word rotation
        if (window.wordRotator) {
            window.wordRotator.updateLanguage(this.currentLang);
        }
    }

    updateSwitchers() {
        // Update all language switchers
        document.querySelectorAll('.lang-pt').forEach(el => {
            el.classList.toggle('active', this.currentLang === 'pt');
        });
        document.querySelectorAll('.lang-en').forEach(el => {
            el.classList.toggle('active', this.currentLang === 'en');
        });
    }
}

// ========== Word Rotator ==========
class WordRotator {
    constructor() {
        this.wordIndex = 0;
        this.currentLang = 'pt';
        this.element = document.querySelector('.hero-dynamic');
        this.isDesktop = window.innerWidth > 640;
        this.autoInterval = null;
        this.accumulator = 0;
        this.touchY = null;

        this.words = {
            pt: ['produtos digitais', 'projetos proprietários', 'experimentos digitais', 'times de tecnologia'],
            en: ['digital products', 'proprietary projects', 'digital experiments', 'technology teams']
        };

        this.init();
    }

    init() {
        if (!this.element) return;

        // Parse words from data attributes
        const ptWords = this.element.getAttribute('data-words-pt');
        const enWords = this.element.getAttribute('data-words-en');

        if (ptWords) {
            try {
                this.words.pt = JSON.parse(ptWords);
            } catch (e) {
                console.error('Error parsing PT words:', e);
            }
        }

        if (enWords) {
            try {
                this.words.en = JSON.parse(enWords);
            } catch (e) {
                console.error('Error parsing EN words:', e);
            }
        }

        this.setupInteraction();
        this.handleResize();
        window.addEventListener('resize', () => this.handleResize());
    }

    updateLanguage(lang) {
        this.currentLang = lang;
        this.updateWord();
    }

    advanceWord(direction = 1) {
        const words = this.words[this.currentLang];
        const n = words.length;
        this.wordIndex = ((this.wordIndex + direction) % n + n) % n;
        this.updateWord();
    }

    updateWord() {
        if (!this.element) return;

        const words = this.words[this.currentLang];
        const word = words[this.wordIndex];

        // Create new element with animation
        const newElement = document.createElement('span');
        newElement.className = 'hero-dynamic';
        newElement.textContent = word;
        newElement.style.animation = 'wordin 0.5s ease both';

        // Replace old element
        this.element.parentNode.replaceChild(newElement, this.element);
        this.element = newElement;
    }

    setupInteraction() {
        this.handleResize();
    }

    startDesktopInteraction() {
        if (this.desktopActive) return;
        this.desktopActive = true;
        this.stopAutoRotation();

        // Mouse wheel
        window.addEventListener('wheel', this.onWheel = (e) => {
            if (e.ctrlKey) return;
            this.accumulator += e.deltaY;
            if (Math.abs(this.accumulator) >= 70) {
                const direction = this.accumulator > 0 ? 1 : -1;
                this.accumulator = 0;
                this.advanceWord(direction);
            }
        }, { passive: true });

        // Touch
        window.addEventListener('touchstart', this.onTouchStart = (e) => {
            this.touchY = e.touches[0].clientY;
        }, { passive: true });

        window.addEventListener('touchmove', this.onTouchMove = (e) => {
            if (this.touchY == null) return;
            const dy = this.touchY - e.touches[0].clientY;
            if (Math.abs(dy) >= 44) {
                this.touchY = e.touches[0].clientY;
                this.advanceWord(dy > 0 ? 1 : -1);
            }
        }, { passive: true });

        // Keyboard
        window.addEventListener('keydown', this.onKeyDown = (e) => {
            const tag = (document.activeElement || {}).tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA') return;

            if (e.key === 'ArrowDown' || e.key === 'PageDown') {
                this.advanceWord(1);
            } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
                this.advanceWord(-1);
            }
        });
    }

    stopDesktopInteraction() {
        if (!this.desktopActive) return;
        this.desktopActive = false;

        if (this.onWheel) window.removeEventListener('wheel', this.onWheel);
        if (this.onTouchStart) window.removeEventListener('touchstart', this.onTouchStart);
        if (this.onTouchMove) window.removeEventListener('touchmove', this.onTouchMove);
        if (this.onKeyDown) window.removeEventListener('keydown', this.onKeyDown);
    }

    startAutoRotation() {
        if (this.autoActive) return;
        this.autoActive = true;
        this.stopDesktopInteraction();

        this.autoInterval = setInterval(() => {
            this.advanceWord(1);
        }, 2600);
    }

    stopAutoRotation() {
        if (!this.autoActive) return;
        this.autoActive = false;

        if (this.autoInterval) {
            clearInterval(this.autoInterval);
            this.autoInterval = null;
        }
    }

    handleResize() {
        const mobile = window.innerWidth <= 640;
        const wrapper = document.querySelector('.wrapper');
        const hero = document.querySelector('.hero');
        const html = document.documentElement;
        const body = document.body;

        if (mobile) {
            // Mobile settings
            html.style.height = 'auto';
            html.style.overflow = 'auto';
            body.style.height = 'auto';
            body.style.overflow = 'auto';

            if (wrapper) {
                wrapper.style.height = 'auto';
                wrapper.style.minHeight = '100vh';
                wrapper.style.overflow = 'visible';
            }

            if (hero) {
                hero.style.overflow = 'visible';
                hero.style.justifyContent = 'flex-start';
                hero.style.padding = '8px 0 40px';
            }

            this.stopDesktopInteraction();
            this.startAutoRotation();
        } else {
            // Desktop settings
            html.style.height = '';
            html.style.overflow = '';
            body.style.height = '';
            body.style.overflow = '';

            if (wrapper) {
                wrapper.style.height = '100vh';
                wrapper.style.minHeight = '';
                wrapper.style.overflow = 'hidden';
            }

            if (hero) {
                hero.style.overflow = 'hidden';
                hero.style.justifyContent = 'center';
                hero.style.padding = 'clamp(12px, 2.5vh, 36px) 0';
            }

            this.stopAutoRotation();
            this.startDesktopInteraction();
        }
    }
}

// ========== Form Handler ==========
class FormHandler {
    constructor() {
        this.form = document.getElementById('captureForm');
        this.ideaInput = document.getElementById('ideaInput');
        this.emailInput = document.getElementById('emailInput');
        this.charCount = document.querySelector('.char-count');
        this.transitionSplash = document.getElementById('transitionSplash');

        this.init();
    }

    init() {
        if (!this.form) return;

        // Character counter
        if (this.ideaInput && this.charCount) {
            this.ideaInput.addEventListener('input', () => {
                const length = this.ideaInput.value.length;
                this.charCount.textContent = `${length}/500`;
            });
        }

        // Form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Email validation visual feedback
        if (this.emailInput) {
            this.emailInput.addEventListener('blur', () => {
                if (this.emailInput.value && !this.validateEmail(this.emailInput.value)) {
                    this.emailInput.classList.add('error');
                }
            });

            this.emailInput.addEventListener('input', () => {
                this.emailInput.classList.remove('error');
            });
        }
    }

    validateEmail(email) {
        return /.+@.+\..+/.test(email);
    }

    handleSubmit(e) {
        e.preventDefault();

        const idea = (this.ideaInput.value || '').trim();
        const email = (this.emailInput.value || '').trim();

        // Validate email
        if (!this.validateEmail(email)) {
            this.emailInput.classList.add('error');
            this.emailInput.focus();
            return;
        }

        // Store data in localStorage
        try {
            if (idea) localStorage.setItem('tatu-ideia', idea);
            if (email) localStorage.setItem('tatu-email', email);
        } catch (err) {
            console.error('Error saving to localStorage:', err);
        }

        // Show transition splash
        if (this.transitionSplash) {
            this.transitionSplash.style.display = 'flex';

            // Navigate after animation
            setTimeout(() => {
                const queryParam = idea ? `?ideia=${encodeURIComponent(idea)}` : '';
                // Navigate to AI conversation page
                window.location.href = 'conversa-ia.html' + queryParam;
            }, 900);
        }
    }
}

// ========== Initialize Everything ==========
document.addEventListener('DOMContentLoaded', () => {
    console.log('Tatusoft website initialized');

    // Initialize managers
    window.languageManager = new LanguageManager();
    window.wordRotator = new WordRotator();
    window.formHandler = new FormHandler();

    // Page show event (for back button)
    window.addEventListener('pageshow', () => {
        const splash = document.getElementById('transitionSplash');
        if (splash) {
            splash.style.display = 'none';
        }
    });

    // Smooth fade-in on load
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';

    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});