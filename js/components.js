// Components Loader - BAT PRO SARL
// Script pour charger dynamiquement les composants réutilisables

class ComponentsLoader {
    constructor() {
        this.componentsPath = 'components/';
        this.loadedComponents = new Map();
    }

    // Charger un composant HTML
    async loadComponent(componentName) {
        if (this.loadedComponents.has(componentName)) {
            return this.loadedComponents.get(componentName);
        }

        try {
            const response = await fetch(`${this.componentsPath}${componentName}.html`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const html = await response.text();
            this.loadedComponents.set(componentName, html);
            return html;
        } catch (error) {
            console.error(`Error loading component ${componentName}:`, error);
            return '';
        }
    }

    // Injecter un composant dans un élément
    async injectComponent(elementId, componentName) {
        const element = document.getElementById(elementId);
        if (!element) {
            console.error(`Element with id ${elementId} not found`);
            return;
        }

        const html = await this.loadComponent(componentName);
        element.innerHTML = html;
        
        // Réinitialiser les scripts MDB après injection
        this.initializeMDB();
    }

    // Charger plusieurs composants
    async loadMultipleComponents(components) {
        const promises = components.map(({ elementId, componentName }) => 
            this.injectComponent(elementId, componentName)
        );
        await Promise.all(promises);
    }

    // Réinitialiser les scripts MDB après chargement dynamique
    initializeMDB() {
        if (typeof mdb !== 'undefined') {
            // Réinitialiser les tooltips
            const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-mdb-toggle="tooltip"]'));
            tooltipTriggerList.map(function (tooltipTriggerEl) {
                return new mdb.Tooltip(tooltipTriggerEl);
            });

            // Réinitialiser les modals
            const modalTriggerList = [].slice.call(document.querySelectorAll('[data-mdb-toggle="modal"]'));
            modalTriggerList.map(function (modalTriggerEl) {
                return new mdb.Modal(modalTriggerEl);
            });

            // Réinitialiser les dropdowns
            const dropdownTriggerList = [].slice.call(document.querySelectorAll('[data-mdb-toggle="dropdown"]'));
            dropdownTriggerList.map(function (dropdownTriggerEl) {
                return new mdb.Dropdown(dropdownTriggerEl);
            });
        }
    }
}

// Instance globale du loader
const componentsLoader = new ComponentsLoader();

// Fonction pour charger les composants standards
async function loadStandardComponents() {
    try {
        await componentsLoader.loadMultipleComponents([
            { elementId: 'header', componentName: 'header' },
            { elementId: 'footer', componentName: 'footer' }
        ]);
    } catch (error) {
        console.error('Error loading standard components:', error);
    }
}

// Fonction pour charger le hero section
async function loadHeroSection(title = null, subtitle = null, btn1Text = null, btn2Text = null) {
    try {
        await componentsLoader.injectComponent('hero', 'hero');
        
        // Personnaliser le contenu si fourni
        if (title) {
            const titleElement = document.getElementById('heroTitle');
            if (titleElement) titleElement.innerHTML = title;
        }
        
        if (subtitle) {
            const subtitleElement = document.getElementById('heroSubtitle');
            if (subtitleElement) subtitleElement.textContent = subtitle;
        }
        
        if (btn1Text) {
            const btn1Element = document.getElementById('heroBtn1');
            if (btn1Element) btn1Element.innerHTML = `<i class="fas fa-rocket me-2"></i>${btn1Text}`;
        }
        
        if (btn2Text) {
            const btn2Element = document.getElementById('heroBtn2');
            if (btn2Element) btn2Element.innerHTML = `<i class="fas fa-envelope me-2"></i>${btn2Text}`;
        }
        
        // Réinitialiser les compteurs après le chargement du hero
        setTimeout(() => {
            initializeCounters();
        }, 100);
    } catch (error) {
        console.error('Error loading hero section:', error);
    }
}

// Fonction pour charger le CTA banner
async function loadCTABanner(title = null, subtitle = null, btn1Text = null, btn2Text = null) {
    try {
        await componentsLoader.injectComponent('cta', 'cta');
        
        // Personnaliser le contenu si fourni
        if (title) {
            const titleElement = document.getElementById('ctaTitle');
            if (titleElement) titleElement.textContent = title;
        }
        
        if (subtitle) {
            const subtitleElement = document.getElementById('ctaSubtitle');
            if (subtitleElement) subtitleElement.textContent = subtitle;
        }
        
        if (btn1Text) {
            const btn1Element = document.getElementById('ctaBtn1');
            if (btn1Element) btn1Element.innerHTML = `<i class="fas fa-phone me-2"></i>${btn1Text}`;
        }
        
        if (btn2Text) {
            const btn2Element = document.getElementById('ctaBtn2');
            if (btn2Element) btn2Element.innerHTML = `<i class="fas fa-book me-2"></i>${btn2Text}`;
        }
    } catch (error) {
        console.error('Error loading CTA banner:', error);
    }
}

// Fonction pour charger le formulaire de contact
async function loadContactForm() {
    try {
        await componentsLoader.injectComponent('contact-form', 'contact-form');
        
        // Initialiser l'écouteur d'événement du formulaire après le chargement
        initializeContactForm();
    } catch (error) {
        console.error('Error loading contact form:', error);
    }
}

// Initialiser le formulaire de contact après son chargement dynamique
function initializeContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        // Supprimer l'ancien écouteur s'il existe
        contactForm.removeEventListener('submit', handleContactFormSubmit);
        
        // Ajouter le nouvel écouteur
        contactForm.addEventListener('submit', handleContactFormSubmit);
        
        // Initialiser la validation en temps réel
        initializeFormValidation();
    }
}

// Gestionnaire de soumission du formulaire de contact
async function handleContactFormSubmit(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        subject: document.getElementById('subject').value,
        message: document.getElementById('message').value,
        type: document.getElementById('type').value
    };
    
    // Utiliser le gestionnaire EmailJS s'il est disponible
    if (window.emailjsHandler) {
        await window.emailjsHandler.sendContactForm(formData);
    } else {
        console.error('EmailJS handler not available');
        alert('Service de messagerie non disponible. Veuillez réessayer plus tard.');
    }
}

// Initialiser la validation en temps réel pour les formulaires
function initializeFormValidation() {
    // Validation des emails
    const emailInputs = document.querySelectorAll('#contactForm input[type="email"]');
    emailInputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.value && window.emailjsHandler && !window.emailjsHandler.validateEmail(this.value)) {
                this.classList.add('is-invalid');
                this.classList.remove('is-valid');
            } else if (this.value) {
                this.classList.add('is-valid');
                this.classList.remove('is-invalid');
            }
        });
    });

    // Validation des téléphones
    const phoneInputs = document.querySelectorAll('#contactForm input[type="tel"]');
    phoneInputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.value && window.emailjsHandler && !window.emailjsHandler.validatePhone(this.value)) {
                this.classList.add('is-invalid');
                this.classList.remove('is-valid');
            } else if (this.value) {
                this.classList.add('is-valid');
                this.classList.remove('is-invalid');
            }
        });
    });
}

// Initialiser le formulaire de candidature
function initializeApplicationForm() {
    const applicationForm = document.getElementById('applicationForm');
    if (applicationForm) {
        // Supprimer l'ancien écouteur s'il existe
        applicationForm.removeEventListener('submit', handleApplicationFormSubmit);
        
        // Ajouter le nouvel écouteur
        applicationForm.addEventListener('submit', handleApplicationFormSubmit);
        
        // Initialiser la validation pour le formulaire de candidature
        initializeApplicationFormValidation();
    }
}

// Gestionnaire de soumission du formulaire de candidature
async function handleApplicationFormSubmit(e) {
    e.preventDefault();
    
    const formData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        age: document.getElementById('age').value,
        city: document.getElementById('city').value,
        country: document.getElementById('country').value,
        position: document.getElementById('position').value,
        experience: document.getElementById('experience').value,
        motivation: document.getElementById('motivation').value
    };
    
    const cvFile = document.getElementById('cv').files[0];
    
    // Utiliser le gestionnaire EmailJS s'il est disponible
    if (window.emailjsHandler) {
        await window.emailjsHandler.sendApplicationForm(formData, cvFile);
    } else {
        console.error('EmailJS handler not available');
        alert('Service de messagerie non disponible. Veuillez réessayer plus tard.');
    }
}

// Initialiser la validation pour le formulaire de candidature
function initializeApplicationFormValidation() {
    // Validation des emails
    const emailInputs = document.querySelectorAll('#applicationForm input[type="email"]');
    emailInputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.value && window.emailjsHandler && !window.emailjsHandler.validateEmail(this.value)) {
                this.classList.add('is-invalid');
                this.classList.remove('is-valid');
            } else if (this.value) {
                this.classList.add('is-valid');
                this.classList.remove('is-invalid');
            }
        });
    });

    // Validation des téléphones
    const phoneInputs = document.querySelectorAll('#applicationForm input[type="tel"]');
    phoneInputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.value && window.emailjsHandler && !window.emailjsHandler.validatePhone(this.value)) {
                this.classList.add('is-invalid');
                this.classList.remove('is-valid');
            } else if (this.value) {
                this.classList.add('is-valid');
                this.classList.remove('is-invalid');
            }
        });
    });
    
    // Validation du fichier CV
    const cvInput = document.getElementById('cv');
    if (cvInput) {
        cvInput.addEventListener('change', function() {
            if (this.files[0]) {
                const fileSize = this.files[0].size;
                const maxSize = 2 * 1024 * 1024; // 2MB
                
                if (fileSize > maxSize) {
                    if (window.emailjsHandler) {
                        window.emailjsHandler.showNotification('Le fichier ne doit pas dépasser 2MB', 'error');
                    } else {
                        alert('Le fichier ne doit pas dépasser 2MB');
                    }
                    this.value = '';
                } else if (this.files[0].type !== 'application/pdf') {
                    if (window.emailjsHandler) {
                        window.emailjsHandler.showNotification('Le fichier doit être au format PDF', 'error');
                    } else {
                        alert('Le fichier doit être au format PDF');
                    }
                    this.value = '';
                }
            }
        });
    }
}

// Initialisation au chargement du DOM
document.addEventListener('DOMContentLoaded', function() {
    // Charger automatiquement les composants standards si les éléments existent
    const headerElement = document.getElementById('header');
    const footerElement = document.getElementById('footer');
    
    if (headerElement || footerElement) {
        loadStandardComponents();
    }
    
    // Initialiser les animations et interactions
    initializeAnimations();
    // Ne pas initialiser les compteurs ici car ils seront dans le hero chargé dynamiquement
    // initializeCounters();
    initializeScrollEffects();
    
    // Initialiser le formulaire de candidature s'il existe (pour careers.html)
    initializeApplicationForm();
});

// Initialisation des animations
function initializeAnimations() {
    // Observer pour les animations au scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate__fadeInUp');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observer les éléments avec la classe 'animate-on-scroll'
    document.querySelectorAll('.animate-on-scroll').forEach(element => {
        observer.observe(element);
    });
}

// Initialisation des compteurs animés
function initializeCounters() {
    const counters = document.querySelectorAll('.counter');
    const speed = 200; // vitesse d'animation
    
    const counterObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                const counter = entry.target;
                const target = +counter.getAttribute('data-target');
                const increment = target / speed;
                
                const updateCount = () => {
                    const count = +counter.innerText;
                    if (count < target) {
                        counter.innerText = Math.ceil(count + increment);
                        setTimeout(updateCount, 10);
                    } else {
                        counter.innerText = target;
                    }
                };
                
                updateCount();
                counter.classList.add('counted');
                counterObserver.unobserve(counter);
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => {
        counterObserver.observe(counter);
    });
}

// Initialisation des effets de scroll
function initializeScrollEffects() {
    // Header scroll effect
    const header = document.querySelector('header');
    if (header) {
        let lastScrollTop = 0;
        
        window.addEventListener('scroll', function() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (scrollTop > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
            
            lastScrollTop = scrollTop;
        });
    }
}

// Export des fonctions pour utilisation globale
window.componentsLoader = componentsLoader;
window.loadStandardComponents = loadStandardComponents;
window.loadHeroSection = loadHeroSection;
window.loadCTABanner = loadCTABanner;
window.loadContactForm = loadContactForm;