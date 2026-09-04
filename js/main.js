// ========================================
// MAIN APPLICATION - WCDO Website
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    'use strict';
    
    // ========================================
    // NAVIGATION
    // ========================================
    const header = document.getElementById('header');
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Toggle mobile menu
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            this.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }
    
    // Close mobile menu on link click
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (hamburger) hamburger.classList.remove('active');
            if (navMenu) navMenu.classList.remove('active');
            
            // Update active link
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Header scroll effect
    window.addEventListener('scroll', function() {
        if (header) {
            if (window.scrollY > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
    });
    
    // ========================================
    // HERO SLIDER - FIXED
    // ========================================
    function initHeroSlider() {
        const slides = document.querySelectorAll('.hero-slider .slide');
        const dots = document.querySelectorAll('.slider-dots .dot');
        const prevBtn = document.getElementById('prevSlide');
        const nextBtn = document.getElementById('nextSlide');
        
        if (!slides.length) return;
        
        let currentSlide = 0;
        let slideInterval;
        const slideCount = slides.length;

        // Function to show a specific slide
        function showSlide(index) {
            // Remove active class from all slides
            slides.forEach(slide => slide.classList.remove('active'));
            dots.forEach(dot => dot.classList.remove('active'));

            // Add active class to the target slide and dot
            if (slides[index]) slides[index].classList.add('active');
            if (dots[index]) dots[index].classList.add('active');
            currentSlide = index;
        }

        // Function to go to next slide
        function goToNextSlide() {
            let next = currentSlide + 1;
            if (next >= slideCount) {
                next = 0;
            }
            showSlide(next);
        }

        // Function to go to previous slide
        function goToPrevSlide() {
            let prev = currentSlide - 1;
            if (prev < 0) {
                prev = slideCount - 1;
            }
            showSlide(prev);
        }

        // Start auto-sliding
        function startAutoSlide() {
            if (slideInterval) {
                clearInterval(slideInterval);
            }
            slideInterval = setInterval(goToNextSlide, 5000);
        }

        // Stop auto-sliding
        function stopAutoSlide() {
            if (slideInterval) {
                clearInterval(slideInterval);
                slideInterval = null;
            }
        }

        // Event listeners for controls
        if (prevBtn) {
            prevBtn.addEventListener('click', function(e) {
                e.preventDefault();
                stopAutoSlide();
                goToPrevSlide();
                startAutoSlide();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', function(e) {
                e.preventDefault();
                stopAutoSlide();
                goToNextSlide();
                startAutoSlide();
            });
        }

        // Event listeners for dots
        dots.forEach((dot, index) => {
            dot.addEventListener('click', function() {
                stopAutoSlide();
                showSlide(index);
                startAutoSlide();
            });
        });

        // Pause on hover
        const heroSlider = document.getElementById('heroSlider');
        if (heroSlider) {
            heroSlider.addEventListener('mouseenter', stopAutoSlide);
            heroSlider.addEventListener('mouseleave', startAutoSlide);
            
            // Touch events for mobile
            let touchStartX = 0;
            let touchEndX = 0;
            
            heroSlider.addEventListener('touchstart', function(e) {
                touchStartX = e.changedTouches[0].screenX;
                stopAutoSlide();
            }, { passive: true });
            
            heroSlider.addEventListener('touchend', function(e) {
                touchEndX = e.changedTouches[0].screenX;
                const swipeThreshold = 50;
                if (touchStartX - touchEndX > swipeThreshold) {
                    goToNextSlide();
                } else if (touchEndX - touchStartX > swipeThreshold) {
                    goToPrevSlide();
                }
                startAutoSlide();
            }, { passive: true });
        }

        // Keyboard navigation
        document.addEventListener('keydown', function(e) {
            if (e.key === 'ArrowLeft') {
                stopAutoSlide();
                goToPrevSlide();
                startAutoSlide();
            } else if (e.key === 'ArrowRight') {
                stopAutoSlide();
                goToNextSlide();
                startAutoSlide();
            }
        });

        // Start the slider
        showSlide(0);
        startAutoSlide();

        console.log('Hero Slider initialized successfully!');
    }

    // Initialize Hero Slider
    initHeroSlider();
    
    // ========================================
    // STATS COUNTER ANIMATION
    // ========================================
    let statsAnimated = false;
    
    function animateStats() {
        if (statsAnimated) return;
        
        const stats = document.querySelectorAll('.stat-number');
        if (stats.length === 0) return;
        
        stats.forEach(stat => {
            const parent = stat.parentElement;
            const target = parseInt(parent.getAttribute('data-count')) || 0;
            let current = 0;
            const increment = Math.ceil(target / 60);
            const duration = 2000;
            const stepTime = Math.floor(duration / 60);
            
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                stat.textContent = current.toLocaleString();
            }, stepTime);
        });
        
        statsAnimated = true;
    }
    
    // Trigger stats animation when in viewport
    const statsBar = document.querySelector('.stats-bar');
    if (statsBar) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateStats();
                }
            });
        }, { threshold: 0.3 });
        observer.observe(statsBar);
    }
    
    // ========================================
    // SCROLL TO TOP BUTTON
    // ========================================
    const scrollTopBtn = document.getElementById('scrollTop');
    
    window.addEventListener('scroll', function() {
        if (scrollTopBtn) {
            if (window.scrollY > 500) {
                scrollTopBtn.classList.add('visible');
            } else {
                scrollTopBtn.classList.remove('visible');
            }
        }
    });
    
    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    // ========================================
    // SMOOTH SCROLL FOR NAV LINKS
    // ========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const target = document.querySelector(targetId);
            if (target && header) {
                e.preventDefault();
                const headerHeight = header.offsetHeight;
                const targetPosition = target.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // ========================================
    // CONTACT FORM
    // ========================================
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('name')?.value.trim() || '';
            const email = document.getElementById('email')?.value.trim() || '';
            const message = document.getElementById('message')?.value.trim() || '';
            
            if (!name || !email || !message) {
                showNotification('Please fill in all required fields.', 'error');
                return;
            }
            
            if (!isValidEmail(email)) {
                showNotification('Please enter a valid email address.', 'error');
                return;
            }
            
            showNotification('Thank you! Your message has been sent. We\'ll get back to you soon.', 'success');
            this.reset();
        });
    }
    
    // ========================================
    // NEWSLETTER FORM
    // ========================================
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const input = this.querySelector('input[type="email"]');
            if (!input) return;
            const email = input.value.trim();
            
            if (!email || !isValidEmail(email)) {
                showNotification('Please enter a valid email address.', 'error');
                return;
            }
            
            showNotification('Thank you for subscribing to our newsletter!', 'success');
            input.value = '';
        });
    }
    
    // ========================================
    // DONATE FORM
    // ========================================
    const donateForm = document.getElementById('donateForm');
    const amountBtns = document.querySelectorAll('.amount-btn');
    const amountInput = document.getElementById('donationAmount');
    
    if (amountBtns.length > 0 && amountInput) {
        amountBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                amountBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                const amount = parseInt(this.getAttribute('data-amount'));
                if (!isNaN(amount)) {
                    amountInput.value = amount;
                }
            });
        });
    }
    
    if (donateForm) {
        donateForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('donorName')?.value.trim() || '';
            const email = document.getElementById('donorEmail')?.value.trim() || '';
            const amount = document.getElementById('donationAmount')?.value || '';
            
            if (!name || !email || !amount) {
                showNotification('Please fill in all required fields.', 'error');
                return;
            }
            
            if (!isValidEmail(email)) {
                showNotification('Please enter a valid email address.', 'error');
                return;
            }
            
            showNotification(`Thank you for your generous donation of KES ${parseInt(amount).toLocaleString()}! Your support makes a difference.`, 'success');
            this.reset();
            if (amountInput) amountInput.value = '2500';
            amountBtns.forEach(b => b.classList.remove('active'));
            const defaultBtn = document.querySelector('.amount-btn[data-amount="2500"]');
            if (defaultBtn) defaultBtn.classList.add('active');
        });
    }
    
    // ========================================
    // PROGRAMS FILTER
    // ========================================
    const filterBtns = document.querySelectorAll('.filter-btn');
    const programCards = document.querySelectorAll('.program-card');
    
    if (filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                filterBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                const filter = this.getAttribute('data-filter');
                
                programCards.forEach(card => {
                    if (filter === 'all' || card.getAttribute('data-category') === filter) {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }
    
    // ========================================
    // BLOG SEARCH
    // ========================================
    const blogSearch = document.getElementById('blogSearch');
    if (blogSearch) {
        blogSearch.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase().trim();
            const blogCards = document.querySelectorAll('.blog-card');
            
            blogCards.forEach(card => {
                const title = card.querySelector('h3')?.textContent?.toLowerCase() || '';
                const excerpt = card.querySelector('p')?.textContent?.toLowerCase() || '';
                const content = title + ' ' + excerpt;
                
                if (content.includes(searchTerm) || searchTerm === '') {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }
    
    // ========================================
    // GALLERY LIGHTBOX
    // ========================================
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    galleryItems.forEach(item => {
        item.addEventListener('click', function() {
            const img = this.querySelector('img');
            if (img) {
                openLightbox(img.src, img.alt);
            }
        });
    });
    
    function openLightbox(src, alt) {
        const overlay = document.createElement('div');
        overlay.className = 'lightbox-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.9);
            z-index: 3000;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            padding: 20px;
        `;
        
        const img = document.createElement('img');
        img.src = src;
        img.alt = alt || 'Gallery image';
        img.style.cssText = `
            max-width: 100%;
            max-height: 90vh;
            border-radius: 8px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.5);
        `;
        
        overlay.appendChild(img);
        document.body.appendChild(overlay);
        
        overlay.addEventListener('click', function() {
            this.remove();
        });
        
        document.addEventListener('keydown', function closeLightbox(e) {
            if (e.key === 'Escape') {
                const existing = document.querySelector('.lightbox-overlay');
                if (existing) {
                    existing.remove();
                }
                document.removeEventListener('keydown', closeLightbox);
            }
        });
    }
    
    // ========================================
    // UTILITY FUNCTIONS
    // ========================================
    
    function isValidEmail(email) {
        const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return pattern.test(email);
    }
    
    function showNotification(message, type = 'success') {
        const existing = document.querySelector('.notification');
        if (existing) {
            existing.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            padding: 18px 25px;
            background: ${type === 'success' ? 'linear-gradient(135deg, #2E7D32, #1B5E20)' : 'linear-gradient(135deg, #e53935, #c62828)'};
            color: white;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            z-index: 9999;
            max-width: 400px;
            font-weight: 500;
            animation: slideInRight 0.5s ease;
            display: flex;
            align-items: center;
            gap: 12px;
            cursor: pointer;
        `;
        
        const icon = document.createElement('i');
        icon.className = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
        icon.style.fontSize = '1.3rem';
        
        const text = document.createElement('span');
        text.textContent = message;
        
        notification.appendChild(icon);
        notification.appendChild(text);
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.5s ease forwards';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 500);
            }
        }, 5000);
        
        notification.addEventListener('click', function() {
            this.style.animation = 'slideOutRight 0.5s ease forwards';
            setTimeout(() => {
                if (this.parentNode) {
                    this.remove();
                }
            }, 500);
        });
    }
    
    // ========================================
    // LOAD TEAM MEMBERS (Dynamic)
    // ========================================
    function loadTeamMembers() {
        const teamGrid = document.getElementById('teamGrid');
        if (!teamGrid) return;
        
        const team = [
            { name: 'Veronicah Mweu', role: 'Chairperson', image: 'assets/images/Vero.png' },
            { name: 'Programs Administrator', role: 'BR Francis Musya', image: 'assets/images/Br.jpg' },
            { name: 'Programs Manager', role: 'Felix Muendo BSRV', image: 'assets/images/felix.jpg' },
            { name: 'Program Officer', role: 'Ann Mutie', image: 'assets/images/anna.jpg' }
        ];
        
        teamGrid.innerHTML = team.map(member => `
            <div class="team-card">
                <img src="${member.image}" alt="${member.name}" loading="lazy">
                <h4>${member.name}</h4>
                <p>${member.role}</p>
            </div>
        `).join('');
    }
    
    // ========================================
    // LOAD PROGRAMS (Dynamic)
    // ========================================
    function loadPrograms() {
        const programsGrid = document.getElementById('programsGrid');
        if (!programsGrid) return;
        
        const programs = [
            {
                id: 1,
                title: 'Community Health Outreach',
                category: 'health',
                image: 'assets/images/training 3.jpg',
                description: 'Mobile health clinics providing essential healthcare services to remote communities.',
                status: 'active',
                tag: 'Health'
            },
            {
                id: 2,
                title: 'Scholarship Program',
                category: 'education',
                image: 'assets/images/education.jpg',
                description: 'Providing educational opportunities for vulnerable children and youth.',
                status: 'active',
                tag: 'Education'
            },
            {
                id: 3,
                title: 'Skills Training Center',
                category: 'livelihood',
                image: 'assets/images/stakeholders.jpg',
                description: 'Vocational training programs for youth and women to create sustainable livelihoods.',
                status: 'active',
                tag: 'Livelihood'
            },
            {
                id: 4,
                title: 'Women Empowerment Initiative',
                category: 'inclusion',
                image: 'assets/images/women.jpg',
                description: 'Empowering women through leadership, entrepreneurship, and advocacy programs.',
                status: 'active',
                tag: 'Inclusion'
            },
            {
                id: 5,
                title: 'Community Leadership Program',
                category: 'empowerment',
                image: 'assets/images/us.jpg',
                description: 'Building community leadership capacity for sustainable development.',
                status: 'active',
                tag: 'Empowerment'
            },
            {
                id: 6,
                title: 'Disability Inclusion Project',
                category: 'inclusion',
                image: 'assets/images/stakeholders.jpg',
                description: 'Ensuring persons with disabilities have access to education, employment, and community participation.',
                status: 'active',
                tag: 'Inclusion'
            },
			{
                id: 7,
                title: 'Climate Action & Environmental Sustainability',
                category: 'Climate',
                image: 'assets/images/stakeholders.jpg',
                description: 'WCDO recognizes that climate change is one of the greatest threats to community development in Makueni County and across Kenya. Our climate action work focuses on empowering communities to adapt to changing environmental conditions while building long-term resilience. We work with community members to implement practical solutions that address both the causes and impacts of climate change, ensuring that vulnerable populations—especially women, youth, and marginalized groups—are at the center of climate action planning and implementation.',
                status: 'active',
                tag: 'Climate'
            }
        ];
        
        programsGrid.innerHTML = programs.map(program => `
            <div class="program-card" data-category="${program.category}">
                <img src="${program.image}" alt="${program.title}" loading="lazy">
                <div class="program-content">
                    <span class="program-tag">${program.tag}</span>
                    <h3>${program.title}</h3>
                    <p>${program.description}</p>
                    <div class="program-status">
                        <span class="status-badge ${program.status}">${program.status.charAt(0).toUpperCase() + program.status.slice(1)}</span>
                        <a href="contact.html" class="program-link">Learn More <i class="fas fa-arrow-right"></i></a>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    // ========================================
    // LOAD GALLERY (Dynamic)
    // ========================================
    function loadGallery() {
        const galleryGrid = document.getElementById('galleryGrid');
        if (!galleryGrid) return;
        
        const images = [
            'assets/images/stakeholders.jpg',
            'assets/images/us.jpg',
            'assets/images/community.jpg',
            'assets/images/women.jpg',
            'assets/images/education.jpg',
            'assets/images/IT.jpg'
        ];
        
        galleryGrid.innerHTML = images.map((img, index) => `
            <div class="gallery-item">
                <img src="${img}" alt="WCDO Community Activity ${index + 1}" loading="lazy">
                <div class="overlay">
                    <i class="fas fa-search-plus"></i>
                </div>
            </div>
        `).join('');
    }
    
    // Initialize dynamic content
    loadTeamMembers();
    loadPrograms();
    loadGallery();
    
    console.log('WCDO Website loaded successfully!');
});

// ========================================
// ADD CSS ANIMATIONS FOR NOTIFICATIONS
// ========================================
const styleSheet = document.createElement("style");
styleSheet.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(styleSheet);