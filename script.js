const burger = document.querySelector('.burger');
const nav = document.querySelector('.site-nav');
const navLinks = nav ? nav.querySelectorAll('a') : [];

if (burger && nav) {
  burger.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });
}

const filters = document.querySelectorAll('.filter');
const galleryItems = document.querySelectorAll('.gallery__item');

filters.forEach((button) => {
  button.addEventListener('click', () => {
    filters.forEach((btn) => {
      btn.classList.remove('is-active');
      btn.setAttribute('aria-selected', 'false');
    });
    button.classList.add('is-active');
    button.setAttribute('aria-selected', 'true');

    const filter = button.dataset.filter;
    galleryItems.forEach((item) => {
      const isMatch = filter === 'all' || item.dataset.type === filter;
      item.style.display = isMatch ? 'block' : 'none';
    });
  });
});

const form = document.querySelector('.form');
const successMessage = document.querySelector('.form__success');

const validators = {
  name: (value) => value.trim().length >= 2,
  phone: (value) => value.replace(/\D/g, '').length >= 10,
  message: (value) => value.trim().length >= 10,
};

const errorMessages = {
  name: 'Введите имя не короче 2 символов.',
  phone: 'Укажите телефон (минимум 10 цифр).',
  message: 'Сообщение должно быть не короче 10 символов.',
};

const showError = (input, message) => {
  const error = input.parentElement.querySelector('.error');
  input.setAttribute('aria-invalid', 'true');
  error.textContent = message;
};

const clearError = (input) => {
  const error = input.parentElement.querySelector('.error');
  input.removeAttribute('aria-invalid');
  error.textContent = '';
};

if (form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    let isValid = true;
    successMessage.textContent = '';

    Object.keys(validators).forEach((field) => {
      const input = form.elements[field];
      if (!validators[field](input.value)) {
        showError(input, errorMessages[field]);
        isValid = false;
      } else {
        clearError(input);
      }
    });

    if (isValid) {
      successMessage.textContent = 'Заявка отправлена. Бот скоро свяжется с вами в Telegram.';
      form.reset();
    }
  });
}
