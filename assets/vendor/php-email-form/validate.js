(function () {
  "use strict";

  // Helper to select elements
  const select = (el, all = false) => {
    el = el.trim();
    if (all) return [...document.querySelectorAll(el)];
    else return document.querySelector(el);
  };

  // Helper for adding event listeners
  const on = (type, el, listener, all = false) => {
    let selectEl = select(el, all);
    if (selectEl) {
      if (all) selectEl.forEach(e => e.addEventListener(type, listener));
      else selectEl.addEventListener(type, listener);
    }
  };

  // Main form logic
  let forms = select('.php-email-form', true);

  forms.forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();

      let thisForm = this;
      let action = thisForm.getAttribute('action');

      if (!action) {
        displayError(thisForm, 'The form action property is not set!');
        return;
      }

      let submitButton = thisForm.querySelector('button[type="submit"]');
      submitButton.disabled = true;

      thisForm.querySelector('.loading').classList.add('d-block');
      thisForm.querySelector('.error-message').classList.remove('d-block');
      thisForm.querySelector('.sent-message').classList.remove('d-block');

      let formData = new FormData(thisForm);

      php_email_form_submit(thisForm, action, formData, submitButton);
    });
  });

  function php_email_form_submit(thisForm, action, formData, submitButton) {
    fetch(action, {
      method: 'POST',
      body: formData,
      headers: { 'X-Requested-With': 'XMLHttpRequest' }
    })
      .then(response => {
        if (response.ok) return response.text();
        else throw new Error(`${response.status} ${response.statusText}`);
      })
      .then(data => {
        thisForm.querySelector('.loading').classList.remove('d-block');
        submitButton.disabled = false;

        try {
          let response = JSON.parse(data);
          if (response.ok) {
            thisForm.querySelector('.sent-message').classList.add('d-block');
            thisForm.reset();
          } else {
            throw new Error('Form submission failed');
          }
        } catch (error) {
          thisForm.querySelector('.error-message').innerHTML = error.message || error;
          thisForm.querySelector('.error-message').classList.add('d-block');
        }
      })
      .catch(error => {
        thisForm.querySelector('.loading').classList.remove('d-block');
        submitButton.disabled = false;
        thisForm.querySelector('.error-message').innerHTML = error.message || error;
        thisForm.querySelector('.error-message').classList.add('d-block');
      });
  }

  function displayError(thisForm, error) {
    thisForm.querySelector('.loading').classList.remove('d-block');
    thisForm.querySelector('.error-message').innerHTML = error;
    thisForm.querySelector('.error-message').classList.add('d-block');
  }

})();
