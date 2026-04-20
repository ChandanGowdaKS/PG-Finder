console.log("JS FILE LOADED");

(() => {
  'use strict';

  const getFeedbackNode = (control) => {
    const fieldWrapper = control.parentElement;
    if (!fieldWrapper) {
      return null;
    }

    return fieldWrapper.querySelector('.form-feedback');
  };

  const syncFieldState = (control, forceVisible = false) => {
    const feedback = getFeedbackNode(control);
    const isValid = control.checkValidity();
    const shouldShow = forceVisible || control.dataset.touched === 'true' || control.form.classList.contains('was-validated');

    control.classList.toggle('border-red-500', !isValid && shouldShow);
    control.classList.toggle('focus:ring-red-500', !isValid && shouldShow);
    control.classList.toggle('border-gray-300', isValid || !shouldShow);

    if (feedback) {
      if (!isValid && shouldShow) {
        feedback.textContent = control.validationMessage || 'This field is required.';
        feedback.classList.remove('hidden');
      } else {
        feedback.classList.add('hidden');
      }
    }
  };

  const forms = document.querySelectorAll('.needs-validation');

  Array.from(forms).forEach((form) => {
    const controls = form.querySelectorAll('input, textarea, select');

    controls.forEach((control) => {
      const eventName = control.tagName === 'SELECT' || control.type === 'file' ? 'change' : 'input';

      control.addEventListener(eventName, () => {
        control.dataset.touched = 'true';
        syncFieldState(control);
      });

      control.addEventListener('blur', () => {
        control.dataset.touched = 'true';
        syncFieldState(control);
      });
    });

    form.addEventListener('submit', (event) => {
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }

      form.classList.add('was-validated');
      controls.forEach((control) => syncFieldState(control, true));
    }, false);
  });
})();

(() => {
  const filtersForm = document.getElementById('listingFiltersForm');
  const countNode = document.getElementById('liveResultsCount');

  if (!filtersForm || !countNode) {
    return;
  }

  const countUrl = filtersForm.dataset.liveCountUrl;
  const applyBtn = document.getElementById('applyFiltersBtn');
  let debounceTimer;

  const setBusy = (isBusy) => {
    if (isBusy) {
      countNode.textContent = '...';
      if (applyBtn) {
        applyBtn.disabled = true;
        applyBtn.classList.add('opacity-60');
      }
      return;
    }

    if (applyBtn) {
      applyBtn.disabled = false;
      applyBtn.classList.remove('opacity-60');
    }
  };

  const fetchLiveCount = async () => {
    try {
      setBusy(true);
      const formData = new FormData(filtersForm);
      formData.delete('page');
      const searchParams = new URLSearchParams(formData);
      const response = await fetch(`${countUrl}?${searchParams.toString()}`, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load live count');
      }

      const payload = await response.json();
      countNode.textContent = String(payload.totalListings ?? countNode.dataset.initialCount ?? 0);
    } catch (error) {
      console.error(error);
      countNode.textContent = String(countNode.dataset.initialCount ?? 0);
    } finally {
      setBusy(false);
    }
  };

  const onFilterInput = () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(fetchLiveCount, 250);
  };

  const watchedControls = filtersForm.querySelectorAll('input, select');
  watchedControls.forEach((control) => {
    const eventName = control.tagName === 'SELECT' ? 'change' : 'input';
    control.addEventListener(eventName, onFilterInput);
  });
})();