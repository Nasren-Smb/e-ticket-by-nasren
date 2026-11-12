document.addEventListener('DOMContentLoaded', () => {
  // Tangkap semua form dengan atribut data-confirm
  const confirmForms = document.querySelectorAll('form[data-confirm]');

  confirmForms.forEach(form => {
    form.addEventListener('submit', (event) => {
      const message = form.getAttribute('data-confirm') || 'Apakah Anda yakin ingin melanjutkan tindakan ini?';
      if (!window.confirm(message)) {
        event.preventDefault();
      }
    });
  });
});

