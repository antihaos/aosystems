/* ============================================================
   AOSystems — интерактив
   ============================================================ */
(function () {
   "use strict";

   /* ---------- Бургер-меню ---------- */
   const navToggle = document.getElementById("nav-toggle");
   const nav = document.getElementById("nav");

   function closeNav() {
      nav.classList.remove("open");
      navToggle.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
   }

   if (navToggle && nav) {
      navToggle.addEventListener("click", function () {
         const isOpen = nav.classList.toggle("open");
         navToggle.classList.toggle("open", isOpen);
         navToggle.setAttribute("aria-expanded", String(isOpen));
      });

      // Закрытие по клику на ссылку
      nav.querySelectorAll("a").forEach(function (link) {
         link.addEventListener("click", closeNav);
      });

      // Закрытие по Escape
      document.addEventListener("keydown", function (e) {
         if (e.key === "Escape") closeNav();
      });
   }

   /* ---------- Плавное появление при скролле ---------- */
   const revealEls = document.querySelectorAll(".reveal");

   if ("IntersectionObserver" in window && revealEls.length) {
      const revealObserver = new IntersectionObserver(
         function (entries, observer) {
            entries.forEach(function (entry) {
               if (entry.isIntersecting) {
                  entry.target.classList.add("visible");
                  observer.unobserve(entry.target);
               }
            });
         },
         { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
      );

      revealEls.forEach(function (el) {
         revealObserver.observe(el);
      });
   } else {
      // Fallback: показать всё сразу
      revealEls.forEach(function (el) {
         el.classList.add("visible");
      });
   }

   /* ---------- Активный пункт меню при скролле ---------- */
   const sections = document.querySelectorAll("main section[id]");
   const navLinks = document.querySelectorAll(".nav-link");

   if ("IntersectionObserver" in window && sections.length && navLinks.length) {
      const sectionObserver = new IntersectionObserver(
         function (entries) {
            entries.forEach(function (entry) {
               if (entry.isIntersecting) {
                  const id = entry.target.getAttribute("id");
                  navLinks.forEach(function (link) {
                     const href = link.getAttribute("href");
                     link.classList.toggle(
                        "active",
                        href === "#" + id
                     );
                  });
               }
            });
         },
         { threshold: 0.5, rootMargin: "-20% 0px -40% 0px" }
      );

      sections.forEach(function (section) {
         sectionObserver.observe(section);
      });
   }

   /* ---------- Текущий год в футере ---------- */
   const yearEl = document.getElementById("year");
   if (yearEl) {
      yearEl.textContent = String(new Date().getFullYear());
   }

   /* ---------- Обработка формы обратной связи ---------- */
   const form = document.getElementById("contact-form");
   const status = document.getElementById("form-status");

   if (form && status) {
      form.addEventListener("submit", function (e) {
         e.preventDefault();

         const name = form.elements["name"];
         const email = form.elements["email"];
         const message = form.elements["message"];

         // Базовая валидация
         const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
         let valid = true;

         [name, email, message].forEach(function (field) {
            if (field) field.style.borderColor = "";
         });

         if (!name || !name.value.trim()) {
            if (name) name.style.borderColor = "#ff5c7a";
            valid = false;
         }

         if (!email || !emailPattern.test(email.value.trim())) {
            if (email) email.style.borderColor = "#ff5c7a";
            valid = false;
         }

         if (!message || !message.value.trim()) {
            if (message) message.style.borderColor = "#ff5c7a";
            valid = false;
         }

         if (!valid) {
            status.textContent = "Пожалуйста, заполните все поля корректно.";
            status.classList.add("error");
            return;
         }

         // Успех: формируем письмо через mailto и открываем почтовый клиент
         const recipient = "support@aosystems.ru";
         const subject = "Заявка с сайта AOSystems от " + name.value.trim();
         const body = [
            "Имя: " + name.value.trim(),
            "Email: " + email.value.trim(),
            "",
            "Сообщение:",
            message.value.trim(),
         ].join("\n");

         const mailtoUrl =
            "mailto:" + recipient +
            "?subject=" + encodeURIComponent(subject) +
            "&body=" + encodeURIComponent(body);

         window.location.href = mailtoUrl;

         status.classList.remove("error");
         status.textContent = "Открываем ваш почтовый клиент…";
         form.reset();
      });
   }

   /* ---------- Фоновая анимация (опционально) ---------- */
   (function initBackgroundAnimation() {
      const canvas = document.getElementById("bg-canvas");
      const toggle = document.getElementById("bg-toggle");
      if (!canvas || !toggle) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const STORAGE_KEY = "aosystems-bg-anim";
      const prefersReducedMotion =
         window.matchMedia &&
         window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      let running = false;
      let rafId = null;
      let particles = [];
      let width = 0;
      let height = 0;
      let dpr = 1;

      // Цвета в стиле сайта (неон)
      const COLORS = ["0, 229, 255", "138, 43, 226"];

      function resize() {
         dpr = Math.min(window.devicePixelRatio || 1, 2);
         width = window.innerWidth;
         height = window.innerHeight;
         canvas.width = Math.floor(width * dpr);
         canvas.height = Math.floor(height * dpr);
         canvas.style.width = width + "px";
         canvas.style.height = height + "px";
         ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      function createParticles() {
         // Плотность зависит от площади экрана, но ограничена для производительности
         const count = Math.min(90, Math.max(28, Math.round((width * height) / 22000)));
         particles = [];
         for (let i = 0; i < count; i++) {
            particles.push({
               x: Math.random() * width,
               y: Math.random() * height,
               vx: (Math.random() - 0.5) * 0.4,
               vy: (Math.random() - 0.5) * 0.4,
               r: Math.random() * 1.8 + 0.8,
               color: COLORS[i % COLORS.length],
            });
         }
      }

      function draw() {
         ctx.clearRect(0, 0, width, height);

         // Линии между близкими частицами
         for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            for (let j = i + 1; j < particles.length; j++) {
               const q = particles[j];
               const dx = p.x - q.x;
               const dy = p.y - q.y;
               const dist = Math.sqrt(dx * dx + dy * dy);
               if (dist < 130) {
                  const alpha = (1 - dist / 130) * 0.35;
                  ctx.strokeStyle = "rgba(" + p.color + "," + alpha + ")";
                  ctx.lineWidth = 0.6;
                  ctx.beginPath();
                  ctx.moveTo(p.x, p.y);
                  ctx.lineTo(q.x, q.y);
                  ctx.stroke();
               }
            }
         }

         // Сами частицы
         for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(" + p.color + ",0.85)";
            ctx.fill();
         }
      }

      function step() {
         for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0 || p.x > width) p.vx = -p.vx;
            if (p.y < 0 || p.y > height) p.vy = -p.vy;
         }
         draw();
         rafId = requestAnimationFrame(step);
      }

      function start() {
         if (running) return;
         running = true;
         resize();
         createParticles();
         rafId = requestAnimationFrame(step);
         document.body.classList.add("bg-anim-on");
         toggle.setAttribute("aria-pressed", "true");
         toggle.setAttribute("aria-label", "Выключить фоновую анимацию");
      }

      function stop() {
         if (!running) return;
         running = false;
         if (rafId) cancelAnimationFrame(rafId);
         rafId = null;
         ctx.clearRect(0, 0, width, height);
         document.body.classList.remove("bg-anim-on");
         toggle.setAttribute("aria-pressed", "false");
         toggle.setAttribute("aria-label", "Включить фоновую анимацию");
      }

      function setEnabled(on) {
         if (on) start();
         else stop();
         try {
            localStorage.setItem(STORAGE_KEY, on ? "on" : "off");
         } catch (e) {
            /* localStorage может быть недоступен — игнорируем */
         }
      }

      // Восстановление состояния из localStorage (по умолчанию — выключено)
      let saved = null;
      try {
         saved = localStorage.getItem(STORAGE_KEY);
      } catch (e) {
         saved = null;
      }
      const shouldStart = saved === "on" && !prefersReducedMotion;

      if (shouldStart) {
         start();
      }

      toggle.addEventListener("click", function () {
         setEnabled(!running);
      });

      // Пересчёт при изменении размера окна
      let resizeTimer = null;
      window.addEventListener("resize", function () {
         if (!running) return;
         clearTimeout(resizeTimer);
         resizeTimer = setTimeout(function () {
            resize();
            createParticles();
         }, 150);
      });

      // Пауза, когда вкладка неактивна — экономим ресурсы
      document.addEventListener("visibilitychange", function () {
         if (document.hidden) {
            if (rafId) {
               cancelAnimationFrame(rafId);
               rafId = null;
            }
         } else if (running) {
            rafId = requestAnimationFrame(step);
         }
      });
   })();
})();
