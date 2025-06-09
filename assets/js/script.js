// Futuristic Interactive Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Add data-text attribute to all h1 elements for glow effect
    document.querySelectorAll('h1').forEach(heading => {
        if (!heading.getAttribute('data-text')) {
            heading.setAttribute('data-text', heading.textContent);
        }
    });

    // Toggle mobile menu with animation
    document.querySelector('.navbar-toggle').addEventListener('click', function() {
        document.querySelector('.navbar-links').classList.toggle('active');
    });

    // Handle dropdown menus on mobile
    const dropdowns = document.querySelectorAll('.dropdown');

    if (window.innerWidth <= 768) {
        dropdowns.forEach(dropdown => {
            const link = dropdown.querySelector('a');
            link.addEventListener('click', function(e) {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    dropdown.classList.toggle('active');
                }
            });
        });
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        const navbar = document.querySelector('.navbar');
        const navbarLinks = document.querySelector('.navbar-links');
        const navbarToggle = document.querySelector('.navbar-toggle');

        if (!navbar.contains(e.target) && navbarLinks.classList.contains('active')) {
            navbarLinks.classList.remove('active');
        }
    });

    // Enhanced Hero Slider Functionality (only initialize if slider exists on the page)
    if (document.querySelector('.slider')) {
        const slides = document.querySelectorAll('.slide');
        const dots = document.querySelectorAll('.slider-dot');
        const prevBtn = document.querySelector('.slider-prev');
        const nextBtn = document.querySelector('.slider-next');
        let currentSlide = 0;
        let slideInterval;

        // Function to show a specific slide with enhanced animation
        function showSlide(index) {
            // Remove active class from all slides and dots
            slides.forEach(slide => {
                slide.classList.remove('active');
                // Reset the slide content animation
                const content = slide.querySelector('.slide-content');
                if (content) {
                    content.style.opacity = '0';
                    content.style.transform = 'translateY(30px)';
                }
            });
            dots.forEach(dot => dot.classList.remove('active'));

            // Add active class to current slide and dot
            slides[index].classList.add('active');
            dots[index].classList.add('active');

            // Update current slide index
            currentSlide = index;
        }

        // Function to show next slide
        function nextSlide() {
            let next = currentSlide + 1;
            if (next >= slides.length) {
                next = 0;
            }
            showSlide(next);
        }

        // Function to show previous slide
        function prevSlide() {
            let prev = currentSlide - 1;
            if (prev < 0) {
                prev = slides.length - 1;
            }
            showSlide(prev);
        }

        // Start automatic slideshow
        function startSlideshow() {
            slideInterval = setInterval(nextSlide, 7000); // Change slide every 7 seconds
        }

        // Stop automatic slideshow
        function stopSlideshow() {
            clearInterval(slideInterval);
        }

        // Event listeners for navigation with enhanced effects
        prevBtn.addEventListener('click', function() {
            prevSlide();
            stopSlideshow();
            startSlideshow(); // Restart the timer after manual navigation

            // Add click effect
            this.classList.add('clicked');
            setTimeout(() => this.classList.remove('clicked'), 300);
        });

        nextBtn.addEventListener('click', function() {
            nextSlide();
            stopSlideshow();
            startSlideshow(); // Restart the timer after manual navigation

            // Add click effect
            this.classList.add('clicked');
            setTimeout(() => this.classList.remove('clicked'), 300);
        });

        // Event listeners for dot indicators with enhanced effects
        dots.forEach((dot, index) => {
            dot.addEventListener('click', function() {
                showSlide(index);
                stopSlideshow();
                startSlideshow(); // Restart the timer after manual navigation

                // Add click effect to all dots
                dots.forEach(d => d.classList.remove('clicked'));
                this.classList.add('clicked');
                setTimeout(() => this.classList.remove('clicked'), 300);
            });
        });

        // Pause slideshow when hovering over the slider
        const slider = document.querySelector('.slider');
        slider.addEventListener('mouseenter', stopSlideshow);
        slider.addEventListener('mouseleave', startSlideshow);

        // Start the slideshow
        startSlideshow();
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80, // Offset for fixed header
                    behavior: 'smooth'
                });
            }
        });
    });

    // Add hover effect to feature cards
    document.querySelectorAll('.feature-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
            this.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.2), 0 0 15px rgba(0, 240, 255, 0.3)';

            // Animate the icon
            const icon = this.querySelector('i');
            if (icon) {
                icon.style.transform = 'scale(1.2) rotate(10deg)';
                icon.style.color = 'var(--accent-color)';
                icon.style.textShadow = '0 0 20px rgba(255, 42, 109, 0.6)';
            }
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = '';
            this.style.boxShadow = '';

            // Reset icon animation
            const icon = this.querySelector('i');
            if (icon) {
                icon.style.transform = '';
                icon.style.color = '';
                icon.style.textShadow = '';
            }
        });
    });

    // Add typing effect to CTA heading if it exists
    const ctaHeading = document.querySelector('.cta-section h2');
    if (ctaHeading) {
        const text = ctaHeading.textContent;
        ctaHeading.textContent = '';

        let i = 0;
        const typeWriter = () => {
            if (i < text.length) {
                ctaHeading.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 100);
            }
        };

        // Start typing effect when element is in viewport
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    typeWriter();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        observer.observe(ctaHeading);
    }

    // Add scroll reveal animations
    const revealElements = document.querySelectorAll('.feature-card, .cta-section, h1, h2, .btn');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    revealElements.forEach(el => {
        el.classList.add('reveal-element');
        revealObserver.observe(el);
    });
});
