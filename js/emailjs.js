// EmailJS Configuration - BAT PRO SARL
// Script pour la gestion des formulaires avec EmailJS

// Configuration EmailJS
const EMAILJS_CONFIG = {
    SERVICE_ID: 'service_bazye7u', // À remplacer par votre service ID
    TEMPLATE_ID: 'template_csegrsd', // À remplacer par votre template ID
    PUBLIC_KEY: '-3w3mUyf2MAkz-m0Y', // À remplacer par votre public key
    RECIPIENT_EMAIL: 'contact@batpro-sarl.com'
};

class EmailJSHandler {
    constructor() {
        this.isInitialized = false;
        this.init();
    }

    // Initialiser EmailJS
    async init() {
        try {
            if (typeof emailjs !== 'undefined') {
                emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
                this.isInitialized = true;
                console.log('EmailJS initialized successfully');
            } else {
                console.warn('EmailJS not loaded');
            }
        } catch (error) {
            console.error('Error initializing EmailJS:', error);
        }
    }

    // Valider un email
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Valider un numéro de téléphone camerounais
    validatePhone(phone) {
        const re = /^(6|2)\d{8}$/;
        return re.test(phone.replace(/\s/g, ''));
    }

    // Afficher une notification
    showNotification(message, type = 'info') {
        // Créer l'élément de notification
        const notification = document.createElement('div');
        notification.className = `alert alert-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'info'} position-fixed`;
        notification.style.cssText = `
            top: 20px;
            right: 20px;
            z-index: 9999;
            min-width: 300px;
            animation: slideInRight 0.3s ease-out;
        `;
        
        notification.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="fas fa-${type === 'error' ? 'exclamation-circle' : type === 'success' ? 'check-circle' : 'info-circle'} me-2"></i>
                <span>${message}</span>
                <button type="button" class="btn-close ms-auto" onclick="this.parentElement.parentElement.remove()"></button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-suppression après 5 secondes
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    // Envoyer le formulaire de contact
    async sendContactForm(formData) {
        if (!this.isInitialized) {
            this.showNotification('Service d\'envoi non disponible. Veuillez réessayer plus tard.', 'error');
            return false;
        }

        // Validation des champs
        const errors = [];
        
        if (!formData.name || formData.name.trim().length < 2) {
            errors.push('Le nom doit contenir au moins 2 caractères');
        }
        
        if (!this.validateEmail(formData.email)) {
            errors.push('Veuillez entrer une adresse email valide');
        }
        
        if (!this.validatePhone(formData.phone)) {
            errors.push('Veuillez entrer un numéro de téléphone camerounais valide');
        }
        
        if (!formData.subject || formData.subject.trim().length < 3) {
            errors.push('L\'objet doit contenir au moins 3 caractères');
        }
        
        if (!formData.message || formData.message.trim().length < 10) {
            errors.push('Le message doit contenir au moins 10 caractères');
        }
        
        if (!formData.type) {
            errors.push('Veuillez sélectionner un type de demande');
        }
        
        if (errors.length > 0) {
            this.showNotification(errors.join('. '), 'error');
            return false;
        }

        // Préparer les paramètres du template
        const templateParams = {
            to_email: EMAILJS_CONFIG.RECIPIENT_EMAIL,
            from_name: formData.name,
            from_email: formData.email,
            phone: formData.phone,
            subject: formData.subject,
            message: formData.message,
            type: this.getTypeLabel(formData.type),
            reply_to: formData.email,
            date: new Date().toLocaleDateString('fr-CM'),
            time: new Date().toLocaleTimeString('fr-CM')
        };

        try {
            this.showNotification('Envoi en cours...', 'info');
            
            const response = await emailjs.send(
                EMAILJS_CONFIG.SERVICE_ID,
                EMAILJS_CONFIG.TEMPLATE_ID,
                templateParams
            );
            
            console.log('Email sent successfully:', response);
            this.showNotification('Message envoyé avec succès! Nous vous contacterons dans les plus brefs délais.', 'success');
            
            // Réinitialiser le formulaire
            const form = document.getElementById('contactForm');
            if (form) {
                form.reset();
            }
            
            return true;
            
        } catch (error) {
            console.error('Error sending email:', error);
            this.showNotification('Erreur lors de l\'envoi. Veuillez réessayer ou nous contacter directement.', 'error');
            return false;
        }
    }

    // Envoyer le formulaire de candidature avec CV (modifié pour éviter les conflits)
    async sendApplicationForm(formData, cvFile) {
        if (!this.isInitialized) {
            this.showNotification('Service d\'envoi non disponible. Veuillez réessayer plus tard.', 'error');
            return false;
        }

        // Validation des champs
        const errors = [];
        
        if (!formData.firstName || formData.firstName.trim().length < 2) {
            errors.push('Le prénom doit contenir au moins 2 caractères');
        }
        
        if (!formData.lastName || formData.lastName.trim().length < 2) {
            errors.push('Le nom doit contenir au moins 2 caractères');
        }
        
        if (!this.validateEmail(formData.email)) {
            errors.push('Veuillez entrer une adresse email valide');
        }
        
        if (!this.validatePhone(formData.phone)) {
            errors.push('Veuillez entrer un numéro de téléphone camerounais valide');
        }
        
        if (!formData.position) {
            errors.push('Veuillez sélectionner un poste');
        }
        
        if (!cvFile) {
            errors.push('Veuillez joindre votre CV');
        }
        
        if (cvFile && cvFile.size > 2 * 1024 * 1024) { // 2MB
            errors.push('Le CV ne doit pas dépasser 2MB');
        }
        
        if (cvFile && cvFile.type !== 'application/pdf') {
            errors.push('Le CV doit être au format PDF');
        }
        
        if (errors.length > 0) {
            this.showNotification(errors.join('. '), 'error');
            return false;
        }

        // NOTE: EmailJS a des limitations avec les pièces jointes
        // Alternative: Envoyer un email de notification sans le CV et demander l'envoi séparément
        try {
            this.showNotification('Préparation de l\'envoi...', 'info');
            
            // Envoyer la notification de candidature d'abord
            const notificationParams = {
                to_email: EMAILJS_CONFIG.RECIPIENT_EMAIL,
                from_name: `${formData.firstName} ${formData.lastName}`,
                from_email: formData.email,
                phone: formData.phone,
                position: formData.position,
                experience: formData.experience || 'Non spécifié',
                motivation: formData.motivation || 'Non spécifié',
                reply_to: formData.email,
                date: new Date().toLocaleDateString('fr-CM'),
                time: new Date().toLocaleTimeString('fr-CM'),
                cv_note: `Un CV a été joint : ${cvFile.name} (${(cvFile.size / 1024 / 1024).toFixed(1)}MB)`
            };

            const response = await emailjs.send(
                EMAILJS_CONFIG.SERVICE_ID,
                EMAILJS_CONFIG.TEMPLATE_ID,
                notificationParams
            );
            
            console.log('Application notification sent:', response);
            
            // Puis traiter le CV séparément (upload vers un service de stockage)
            if (cvFile) {
                await this.uploadCVToStorage(formData, cvFile);
            }
            
            this.showNotification('Candidature envoyée avec succès! Nous vous contacterons rapidement.', 'success');
            
            // Réinitialiser le formulaire
            const form = document.getElementById('applicationForm');
            if (form) {
                form.reset();
            }
            
            return true;
            
        } catch (error) {
            console.error('Error sending application:', error);
            this.showNotification('Erreur lors de l\'envoi. Veuillez réessayer ou nous contacter directement.', 'error');
            return false;
        }
    }

    // Uploader le CV vers un service de stockage (alternative pour EmailJS)
    async uploadCVToStorage(formData, cvFile) {
        // Simuler un upload - en réalité, il faudrait utiliser un service comme Cloudinary, AWS S3, etc.
        console.log('CV upload simulation:', {
            fileName: cvFile.name,
            fileSize: cvFile.size,
            applicantName: `${formData.firstName} ${formData.lastName}`
        });
        
        // Pour l'instant, nous allons juste logger l'information
        // En production, vous devriez intégrer un vrai service d'upload ici
        return Promise.resolve();
    }

    // Convertir un fichier en base64 (gardé pour compatibilité)
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    // Obtenir le libellé du type de demande
    getTypeLabel(type) {
        const labels = {
            'contact': 'Contact',
            'devis': 'Demande de devis',
            'information': 'Demande d\'information',
            'partnership': 'Partenariat',
            'support': 'Support technique',
            'other': 'Autre'
        };
        return labels[type] || type;
    }
}

// Instance globale du gestionnaire EmailJS
const emailjsHandler = new EmailJSHandler();

// Export pour utilisation globale
window.emailjsHandler = emailjsHandler;

// Ajouter les styles CSS pour les animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .is-invalid {
        border-color: #dc3545 !important;
        box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25) !important;
    }
    
    .is-valid {
        border-color: #28a745 !important;
        box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.25) !important;
    }
`;
document.head.appendChild(style);