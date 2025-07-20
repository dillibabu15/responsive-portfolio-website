/**
 * Professional Portfolio JavaScript - Final Corrected Version
 * Author: D Dilli Babu
 * Description: A robust, class-based script for a modern portfolio website.
 * Features: Throttling, debouncing, Intersection Observers for animations
 * and nav highlighting, particle background, typing animation, and more.
 */

// --- UTILITY FUNCTIONS ---
const utils = {
  throttle: (func, limit) => {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    }
  },
  debounce: (func, delay) => {
    let timeoutId;
    return function() {
      const context = this;
      const args = arguments;
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(context, args), delay);
    }
  },
};

// --- NAVIGATION MANAGER ---
class NavigationManager {
  constructor() {
    this.navbar = document.getElementById('navbar');
    this.navLinks = document.getElementById('nav-links');
    this.mobileMenu = document.getElementById('mobile-menu');
    this.navItems = this.navLinks.querySelectorAll('a');
    this.sections = document.querySelectorAll('section[id]');
    
    this.init();
  }

  init() {
    // Handle navbar background change on scroll
    window.addEventListener('scroll', utils.throttle(() => this.handleNavbarBackground(), 100));
    
    this.handleMobileMenu();
    this.handleSmoothScrolling();
    this.initActiveSectionHighlighting();
  }

  handleNavbarBackground() {
    // Add a 'scrolled' class for styling via CSS, which is more flexible
    if (window.scrollY > 20) {
      this.navbar.classList.add('scrolled');
    } else {
      this.navbar.classList.remove('scrolled');
    }
  }

  handleMobileMenu() {
    this.mobileMenu.addEventListener('click', (e) => {
      e.stopPropagation();
      this.navLinks.classList.toggle('open');
      this.updateMobileMenuIcon();
    });

    this.navLinks.addEventListener('click', () => {
        this.navLinks.classList.remove('open');
        this.updateMobileMenuIcon();
    });
    
    // Close mobile menu when clicking outside of it
    document.addEventListener('click', (e) => {
      if (this.navLinks.classList.contains('open') && !this.navbar.contains(e.target)) {
        this.navLinks.classList.remove('open');
        this.updateMobileMenuIcon();
      }
    });
  }

  updateMobileMenuIcon() {
    const icon = this.mobileMenu.querySelector('i');
    if (this.navLinks.classList.contains('open')) {
      icon.classList.replace('fa-bars', 'fa-times');
    } else {
      icon.classList.replace('fa-times', 'fa-bars');
    }
  }

  handleSmoothScrolling() {
    this.navLinks.addEventListener('click', (e) => {
      if (e.target.tagName === 'A' && e.target.href.includes('#')) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        if (targetSection) {
          // CSS `scroll-behavior: smooth` handles the animation
          targetSection.scrollIntoView();
        }
      }
    });
  }

  initActiveSectionHighlighting() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          this.navItems.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('active');
            }
          });
        }
      });
    }, { rootMargin: '-30% 0px -70% 0px' }); // Highlights when section is in the middle third of the viewport

    this.sections.forEach(section => observer.observe(section));
  }
}

// --- SCROLL ANIMATIONS ---
class ScrollAnimations {
  constructor() {
    this.addAnimationAttributes(); 
    this.animatedElements = document.querySelectorAll('[data-animate]');
    this.initObserver();
  }

  addAnimationAttributes() {
    const elementsToAnimate = [
      { selector: '.hero-text', animation: 'fadeInUp' },
      { selector: '.hero-image', animation: 'fadeInRight' },
      { selector: '.about-text', animation: 'fadeInLeft' },
      { selector: '.about-visual', animation: 'fadeInRight' },
      { selector: '.timeline-item', animation: 'fadeInUp' },
      { selector: '.project-card', animation: 'fadeInUp' },
      { selector: '.skill-category', animation: 'fadeInUp' },
      { selector: '.contact-info', animation: 'fadeInLeft' },
      { selector: '.contact-form', animation: 'fadeInRight' }
    ];

    elementsToAnimate.forEach(({ selector, animation }) => {
      document.querySelectorAll(selector).forEach((el, index) => {
        el.setAttribute('data-animate', animation);
        // Stagger animations for list-like items
        if(el.classList.contains('project-card') || el.classList.contains('timeline-item')) {
           el.style.animationDelay = `${index * 0.1}s`;
        }
      });
    });
  }
  
  initObserver() {
    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    this.animatedElements.forEach(el => observer.observe(el));
  }
}

// --- TYPING ANIMATION ---
class TypingAnimation {
  constructor(element, texts, options = {}) {
    if (!element) return;
    this.element = element;
    this.texts = texts;
    this.options = { typeSpeed: 80, backSpeed: 40, backDelay: 2000, loop: true, ...options };
    this.textIndex = 0;
    this.charIndex = 0;
    this.isDeleting = false;
    
    this.cursor = document.createElement('span');
    this.cursor.className = 'typing-cursor';
    this.element.parentNode.insertBefore(this.cursor, this.element.nextSibling);
    
    setTimeout(() => this.type(), 500);
  }

  type() {
    const currentText = this.texts[this.textIndex];
    let displayText;
    
    if (this.isDeleting) {
      this.charIndex--;
    } else {
      this.charIndex++;
    }
    
    displayText = currentText.substring(0, this.charIndex);
    this.element.textContent = displayText;
    
    let typeSpeed = this.isDeleting ? this.options.backSpeed : this.options.typeSpeed;

    if (!this.isDeleting && this.charIndex === currentText.length) {
      typeSpeed = this.options.backDelay;
      this.isDeleting = true;
    } else if (this.isDeleting && this.charIndex === 0) {
      this.isDeleting = false;
      this.textIndex = (this.textIndex + 1) % this.texts.length;
      typeSpeed = 500; // Pause before typing next word
    }
    
    setTimeout(() => this.type(), typeSpeed);
  }
}

// --- CONTACT FORM HANDLER (with Formspree Integration) ---
class ContactFormHandler {
  constructor() {
    this.form = document.getElementById('contact-form');
    if (!this.form) return;
    
    this.submitBtn = this.form.querySelector('button[type="submit"]');
    this.formspreeEndpoint = 'https://formspree.io/f/xgvzoydp'; // Your Formspree URL
    this.init();
  }

  init() {
    this.form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtnOriginalHTML = this.submitBtn.innerHTML;

      this.setLoadingState(true);
      
      try {
        await this.submitForm();
        this.showMessage('Message sent successfully!', 'success');
        this.form.reset();
        this.form.querySelectorAll('.form-group.focused').forEach(el => el.classList.remove('focused'));
      } catch (error) {
        console.error('Form submission error:', error);
        this.showMessage('An error occurred. Please try again.', 'error');
      } finally {
        this.setLoadingState(false, submitBtnOriginalHTML);
      }
    });
    
    this.handleInputAnimation();
  }

  async submitForm() {
    const formData = new FormData(this.form);
    const object = Object.fromEntries(formData.entries());
    
    const response = await fetch(this.formspreeEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(object)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  handleInputAnimation() {
    this.form.querySelectorAll('input, textarea').forEach(input => {
      input.addEventListener('focus', () => input.parentNode.classList.add('focused'));
      input.addEventListener('blur', () => {
        if (!input.value) {
          input.parentNode.classList.remove('focused');
        }
      });
    });
  }

  setLoadingState(loading, originalHTML) {
    if (loading) {
      this.submitBtn.disabled = true;
      this.submitBtn.innerHTML = `<span class="loading"></span> Sending...`;
    } else {
      this.submitBtn.disabled = false;
      this.submitBtn.innerHTML = originalHTML;
    }
  }

  showMessage(message, type) {
    this.form.querySelector('.form-message')?.remove();
    const messageEl = document.createElement('div');
    messageEl.className = `form-message ${type}`;
    messageEl.textContent = message;
    this.form.appendChild(messageEl);
    
    setTimeout(() => {
      messageEl.style.animation = 'slideOut 0.3s ease forwards';
      setTimeout(() => messageEl.remove(), 300);
    }, 4000);
  }
}

// --- PARTICLE BACKGROUND ---
class ParticleBackground {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.particleCount = window.innerWidth < 768 ? 25 : 50;
    
    this.init();
  }

  init() {
    this.container.style.position = 'relative';
    this.canvas.style.cssText = `position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:0;`;
    this.container.prepend(this.canvas);
    
    this.resizeCanvas();
    this.createParticles();
    this.animate();
    
    window.addEventListener('resize', utils.debounce(() => {
        this.resizeCanvas();
        this.particles = [];
        this.createParticles();
    }, 250));
  }

  resizeCanvas() {
    this.canvas.width = this.container.offsetWidth;
    this.canvas.height = this.container.offsetHeight;
  }

  createParticles() {
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1,
      });
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      
      if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;
      
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(99, 102, 241, 0.5)`;
      this.ctx.fill();
    });
    
    requestAnimationFrame(() => this.animate());
  }
}


// --- DOMContentLoaded: Entry Point ---
document.addEventListener('DOMContentLoaded', () => {
  // Initialize all components
  new NavigationManager();
  new ScrollAnimations();
  new ContactFormHandler();
  new ParticleBackground('home'); // Attach particles to the Hero section
  
  // Initialize typing animation on the hero subtitle
  const typingElement = document.querySelector('.hero-subtitle');
  if (typingElement) {
    new TypingAnimation(typingElement, [
      "Full Stack Developer",
      "AI Enthusiast",
      "Creative Problem Solver",
      "B.Tech CSE Student"
    ]);
  }
  
  // Hook for a theme toggler button if you add one to your HTML
  const themeToggler = document.getElementById('theme-toggle');
  if(themeToggler) {
      themeToggler.addEventListener('click', () => {
          const currentTheme = document.documentElement.getAttribute('data-theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
          const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
          document.documentElement.setAttribute('data-theme', newTheme);
          localStorage.setItem('theme', newTheme);
      });

      // Apply saved theme on load
      const savedTheme = localStorage.getItem('theme');
      if(savedTheme) {
          document.documentElement.setAttribute('data-theme', savedTheme);
      }
  }
});