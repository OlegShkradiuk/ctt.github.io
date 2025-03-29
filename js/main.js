/**
 * Основной модуль сайта
 * Обрабатывает основные взаимодействия: плавную прокрутку, анимации, формы, модальные окна
 */
(function() {
    'use strict';
  
    // Конфигурация приложения
    const config = {
      animation: {
        elements: '.product-card, .advantage-card, .feature-item',
        threshold: 0.7 // 70% видимости элемента для запуска анимации
      },
      formSettings: {
        errorClass: 'error',
        successMessage: 'Спасибо! Ваша заявка принята. Мы свяжемся с вами в ближайшее время.',
        requiredFieldMessage: 'Пожалуйста, заполните все обязательные поля'
      }
    };
  
    /**
     * Инициализация приложения
     */
    function init() {
      setupSmoothScrolling();
      setupScrollAnimations();
      setupForms();
      setupModal();
      setupLazyLoading();
    }
  
    /**
     * Настройка плавной прокрутки для якорных ссылок
     */
    function setupSmoothScrolling() {
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
          if (this.getAttribute('href') === '#') return;
          
          e.preventDefault();
          scrollToTarget(this.getAttribute('href'));
        });
      });
    }
  
    /**
     * Плавная прокрутка к элементу
     * @param {string} targetSelector - CSS селектор целевого элемента
     */
    function scrollToTarget(targetSelector) {
      const target = document.querySelector(targetSelector);
      if (!target) return;
  
      const headerHeight = document.querySelector('.header').offsetHeight;
      const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  
    /**
     * Настройка анимаций при скролле
     */
    function setupScrollAnimations() {
      const animateElements = () => {
        document.querySelectorAll(config.animation.elements).forEach(element => {
          if (isElementInViewport(element)) {
            element.classList.add('animate');
          }
        });
      };
  
      // Запускаем сразу и при скролле
      animateElements();
      window.addEventListener('scroll', throttle(animateElements, 100));
    }
  
    /**
     * Проверка видимости элемента в viewport
     * @param {HTMLElement} element - Проверяемый элемент
     * @return {boolean} Виден ли элемент
     */
    function isElementInViewport(element) {
      const rect = element.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      return rect.top <= viewportHeight * config.animation.threshold;
    }
  
    /**
     * Настройка обработки форм
     */
    function setupForms() {
      document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function(e) {
          e.preventDefault();
          
          if (validateForm(this)) {
            submitForm(this);
          }
        });
      });
    }
  
    /**
     * Валидация формы
     * @param {HTMLFormElement} form - Форма для валидации
     * @return {boolean} Прошла ли форма валидацию
     */
    function validateForm(form) {
      let isValid = true;
      
      form.querySelectorAll('[required]').forEach(field => {
        if (!field.value.trim()) {
          field.classList.add(config.formSettings.errorClass);
          isValid = false;
        } else {
          field.classList.remove(config.formSettings.errorClass);
        }
      });
  
      if (!isValid) {
        alert(config.formSettings.requiredFieldMessage);
      }
  
      return isValid;
    }
  
    /**
     * "Отправка" формы (заглушка)
     * @param {HTMLFormElement} form - Форма для отправки
     */
    function submitForm(form) {
      // В реальном проекте здесь будет AJAX-запрос
      console.log('Форма отправлена:', Object.fromEntries(new FormData(form)));
      alert(config.formSettings.successMessage);
      form.reset();
    }
  
    /**
     * Настройка модального окна
     */
    function setupModal() {
      const modal = document.getElementById('callback-modal');
      if (!modal) return;
  
      const modalBtns = document.querySelectorAll('.callback-btn');
      const modalClose = document.querySelector('.modal-close');
  
      // Открытие модального окна
      modalBtns.forEach(btn => {
        btn.addEventListener('click', () => toggleModal(modal, true));
      });
  
      // Закрытие модального окна
      modalClose.addEventListener('click', () => toggleModal(modal, false));
      window.addEventListener('click', (e) => {
        if (e.target === modal) toggleModal(modal, false);
      });
    }
  
    /**
     * Переключение состояния модального окна
     * @param {HTMLElement} modal - Модальное окно
     * @param {boolean} show - Показать или скрыть
     */
    function toggleModal(modal, show) {
      modal.style.display = show ? 'flex' : 'none';
      document.body.style.overflow = show ? 'hidden' : '';
    }
  
    /**
     * Настройка ленивой загрузки изображений
     */
    function setupLazyLoading() {
      const lazyImages = document.querySelectorAll('img[loading="lazy"]');
      if (!lazyImages.length) return;
  
      if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target;
              if (img.dataset.src) {
                img.src = img.dataset.src;
              }
              img.classList.add('loaded');
              imageObserver.unobserve(img);
            }
          });
        });
  
        lazyImages.forEach(img => imageObserver.observe(img));
      } else {
        // Fallback для старых браузеров
        lazyImages.forEach(img => {
          if (img.dataset.src) img.src = img.dataset.src;
        });
      }
    }
  
    /**
     * Оптимизация частых событий (throttling)
     * @param {Function} func - Функция для оптимизации
     * @param {number} limit - Лимит времени (мс)
     * @return {Function} Оптимизированная функция
     */
    function throttle(func, limit) {
      let lastFunc;
      let lastRan;
      return function() {
        const context = this;
        const args = arguments;
        if (!lastRan) {
          func.apply(context, args);
          lastRan = Date.now();
        } else {
          clearTimeout(lastFunc);
          lastFunc = setTimeout(function() {
            if ((Date.now() - lastRan) >= limit) {
              func.apply(context, args);
              lastRan = Date.now();
            }
          }, limit - (Date.now() - lastRan));
        }
      };
    }
  
    // Запуск приложения после загрузки DOM
    document.addEventListener('DOMContentLoaded', init);
  })();