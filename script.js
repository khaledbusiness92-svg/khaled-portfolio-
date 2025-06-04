// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("=== DOM Loaded ===");

  // Initialize all DOM elements
  const menuBtn = document.querySelector(".menu-btn");
  const navLinks = document.querySelector(".nav-links");
  const body = document.body;
  const progressBar = document.querySelector(".reading-progress-bar");
  const backToTopButton = document.getElementById("backToTop");
  const themeToggle = document.getElementById("themeToggle");
  const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
  const fullImageModal = document.getElementById("fullImageModal");
  const modalFullImg = document.getElementById("modalFullImg");
  const closeModalBtn = document.querySelector(".close-modal");
  const contactForm = document.getElementById("contactForm");
  const navbar = document.querySelector(".navbar");

  console.log("DOM Elements Status:", {
    menuBtn: menuBtn ? "Found" : "Not found",
    navLinks: navLinks ? "Found" : "Not found",
    progressBar: progressBar ? "Found" : "Not found",
    backToTopButton: backToTopButton ? "Found" : "Not found",
    themeToggle: themeToggle ? "Found" : "Not found",
    fullImageModal: fullImageModal ? "Found" : "Not found",
    modalFullImg: modalFullImg ? "Found" : "Not found",
    closeModalBtn: closeModalBtn ? "Found" : "Not found",
    contactForm: contactForm ? "Found" : "Not found",
    navbar: navbar ? "Found" : "Not found",
  });

  // Dark Mode Toggle
  function updateThemeIcon(theme) {
    if (!themeToggle) return;
    const icon = themeToggle.querySelector("i");
    if (icon) {
      icon.className = theme === "dark" ? "fas fa-sun" : "fas fa-moon";
    }
  }

  // Check for saved theme preference
  if (themeToggle) {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      document.body.setAttribute("data-theme", savedTheme);
      updateThemeIcon(savedTheme);
    } else if (prefersDarkScheme.matches) {
      document.body.setAttribute("data-theme", "dark");
      updateThemeIcon("dark");
    }

    themeToggle.addEventListener("click", () => {
      const currentTheme = document.body.getAttribute("data-theme");
      const newTheme = currentTheme === "dark" ? "light" : "dark";
      document.body.setAttribute("data-theme", newTheme);
      localStorage.setItem("theme", newTheme);
      updateThemeIcon(newTheme);
    });
  }

  // Portfolio Filter Animation
  function filterPortfolioItems(category) {
    console.log("=== Starting Portfolio Filter ===");
    console.log("Filtering for category:", category);

    const items = document.querySelectorAll(".portfolio-item");
    console.log("Total portfolio items found:", items.length);

    let visibleCount = 0;
    items.forEach((item) => {
      const itemCategory = item.getAttribute("data-category");
      console.log("Checking item:", {
        element: item,
        category: itemCategory,
        shouldShow: itemCategory === category,
      });

      if (itemCategory === category) {
        visibleCount++;
        item.style.display = "flex";
        item.style.opacity = "1";
        item.style.transform = "scale(1)";
        console.log("Showing item:", itemCategory);
      } else {
        item.style.display = "none";
        item.style.opacity = "0";
        item.style.transform = "scale(0.8)";
        console.log("Hiding item:", itemCategory);
      }
    });

    console.log("Filter complete. Visible items:", visibleCount);
  }

  // Initialize Portfolio
  console.log("=== Initializing Portfolio ===");

  const categoryButtons = document.querySelectorAll(".category-btn");
  console.log("Found category buttons:", categoryButtons.length);

  categoryButtons.forEach((btn) => {
    console.log("Button found:", {
      text: btn.textContent.trim(),
      category: btn.getAttribute("data-category"),
    });
  });

  // Set initial state
  console.log("Setting initial state to restaurant category");
  filterPortfolioItems("restaurant");

  // Add click event listeners
  categoryButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const category = button.getAttribute("data-category");
      console.log("Button clicked:", {
        text: button.textContent.trim(),
        category: category,
      });

      // Update active state
      categoryButtons.forEach((btn) => {
        const wasActive = btn.classList.contains("active");
        btn.classList.remove("active");
        console.log("Button state updated:", {
          text: btn.textContent.trim(),
          wasActive: wasActive,
          isActive: false,
        });
      });

      button.classList.add("active");
      console.log("Set active button:", button.textContent.trim());

      // Filter items
      filterPortfolioItems(category);
    });
  });

  // Initialize show full buttons
  console.log("=== Initializing Show Full Buttons ===");

  const showFullBtns = document.querySelectorAll(".show-full-btn");
  console.log("Found show full buttons:", showFullBtns.length);

  showFullBtns.forEach((btn, index) => {
    console.log(`Initializing button ${index + 1}:`, {
      element: btn,
      parent: btn.closest(".portfolio-item")?.getAttribute("data-category"),
    });

    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      console.log("Show full button clicked:", {
        button: this,
        parent: this.closest(".portfolio-item")?.getAttribute("data-category"),
      });

      const portfolioItem = this.closest(".portfolio-item");
      if (!portfolioItem) {
        console.error("Could not find parent portfolio item!");
        return;
      }

      const img = portfolioItem.querySelector("img");
      if (!img || !img.src) {
        console.error("Could not find image in portfolio item!");
        return;
      }

      console.log("Found image:", {
        src: img.src,
        alt: img.alt,
      });

      if (fullImageModal && modalFullImg) {
        modalFullImg.src = img.src;
        modalFullImg.alt = img.alt;
        fullImageModal.classList.add("active");
        document.body.style.overflow = "hidden";
        console.log("Modal opened successfully");
      } else {
        console.error("Modal elements not found!");
      }
    });
  });

  // Modal event listeners
  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", () => {
      console.log("Close button clicked");
      if (fullImageModal) {
        fullImageModal.classList.remove("active");
        document.body.style.overflow = "";
        console.log("Modal closed successfully");
      }
    });
  }

  if (fullImageModal) {
    fullImageModal.addEventListener("click", (e) => {
      if (e.target === fullImageModal) {
        console.log("Modal background clicked");
        fullImageModal.classList.remove("active");
        document.body.style.overflow = "";
      }
    });
  }

  // Close modal with Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && fullImageModal?.classList.contains("active")) {
      console.log("Escape key pressed");
      fullImageModal.classList.remove("active");
      document.body.style.overflow = "";
    }
  });

  // Prevent modal from closing when clicking on the image
  if (modalFullImg) {
    modalFullImg.addEventListener("click", (e) => {
      console.log("Modal image clicked");
      e.stopPropagation();
    });
  }

  // Reading Progress Bar
  if (progressBar) {
    window.addEventListener("scroll", () => {
      const windowHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      const scrolled = (window.scrollY / windowHeight) * 100;
      progressBar.style.width = `${scrolled}%`;
    });
  }

  // Back to Top Button
  if (backToTopButton) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 300) {
        backToTopButton.classList.add("visible");
      } else {
        backToTopButton.classList.remove("visible");
      }
    });

    backToTopButton.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  }

  // Mobile Menu Toggle
  if (menuBtn && navLinks) {
    function toggleMenu() {
      navLinks.classList.toggle("active");
      if (navLinks.classList.contains("active")) {
        body.style.overflow = "hidden";
      } else {
        body.style.overflow = "";
      }
    }

    menuBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleMenu();
    });

    // Close menu when clicking outside
    document.addEventListener("click", (e) => {
      if (
        navLinks.classList.contains("active") &&
        !menuBtn.contains(e.target) &&
        !navLinks.contains(e.target)
      ) {
        toggleMenu();
      }
    });

    // Close menu when clicking on a link
    document.querySelectorAll(".nav-links a").forEach((link) => {
      link.addEventListener("click", () => {
        if (navLinks.classList.contains("active")) {
          toggleMenu();
        }
      });
    });
  }

  // Contact Form Handling
  if (contactForm) {
    const formInputs = contactForm.querySelectorAll("input, textarea");

    function validateInput(input) {
      const value = input.value.trim();
      const isValid = value !== "";

      if (input.type === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        input.classList.toggle("valid", emailRegex.test(value));
        input.classList.toggle(
          "invalid",
          !emailRegex.test(value) && value !== ""
        );
      } else {
        input.classList.toggle("valid", isValid);
        input.classList.toggle("invalid", !isValid);
      }
    }

    formInputs.forEach((input) => {
      input.addEventListener("input", function () {
        validateInput(this);
      });

      input.addEventListener("blur", function () {
        validateInput(this);
      });
    });

    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const name = document.getElementById("name")?.value;
      const email = document.getElementById("email")?.value;
      const subject = document.getElementById("subject")?.value;
      const message = document.getElementById("message")?.value;

      if (!name || !email || !subject || !message) {
        alert("Please fill in all fields");
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        alert("Please enter a valid email address");
        return;
      }

      const mailtoLink = `mailto:khaled1762005@gmail.com?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(
        `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
      )}`;
      window.location.href = mailtoLink;
      contactForm.reset();
      alert(
        "Thank you for your message! Your email client will open to send the message."
      );
    });
  }

  // Smooth Scrolling
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        const headerOffset = 80;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition =
          elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });

        // Close mobile menu if open
        if (navLinks && navLinks.classList.contains("active")) {
          navLinks.classList.remove("active");
          body.style.overflow = "";
        }
      }
    });
  });

  // Navbar Background Change
  if (navbar) {
    let lastScroll = 0;

    window.addEventListener("scroll", () => {
      const currentScroll = window.pageYOffset;

      if (currentScroll > 50) {
        navbar.style.background = "var(--navbar-bg)";
        navbar.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.1)";
        navbar.classList.add("scrolled");
      } else {
        navbar.style.background = "var(--navbar-bg)";
        navbar.style.boxShadow = "none";
        navbar.classList.remove("scrolled");
      }

      if (currentScroll > lastScroll && currentScroll > 100) {
        navbar.style.transform = "translateY(-100%)";
      } else {
        navbar.style.transform = "translateY(0)";
      }

      lastScroll = currentScroll;
    });
  }

  // Handle window resize
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (
        window.innerWidth > 768 &&
        navLinks &&
        navLinks.classList.contains("active")
      ) {
        navLinks.classList.remove("active");
        body.style.overflow = "";
      }
    }, 250);
  });
});

// Skills Animation
const animateSkills = () => {
  skillBars.forEach((bar) => {
    const percentage = bar.getAttribute("data-progress");
    bar.style.width = percentage + "%";
  });
};

// Animate skills when they come into view
const observerOptions = {
  threshold: 0.5,
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      animateSkills();
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll(".skill-category").forEach((category) => {
  observer.observe(category);
});
