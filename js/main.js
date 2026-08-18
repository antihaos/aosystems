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

         // Успех (демо-режим: данные не отправляются на сервер)
         status.classList.remove("error");
         status.textContent = "Спасибо! Мы свяжемся с вами в ближайшее время.";
         form.reset();
      });
   }
})();
