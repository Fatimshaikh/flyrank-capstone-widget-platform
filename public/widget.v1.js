(function () {
  var script = document.currentScript;
  var params = new URLSearchParams(script.src.split('?')[1]);
  var widgetId = params.get('id');
  var apiBase = script.src.split('/widget.v1.js')[0];

  fetch(apiBase + '/widgets/' + widgetId + '/config')
    .then(function (res) { return res.json(); })
    .then(function (config) { renderWidget(config); })
    .catch(function (err) { console.error('Widget failed to load:', err); });

  function renderWidget(config) {
    var container = document.createElement('div');
    container.style.cssText = 'border:1px solid #ccc;padding:16px;max-width:320px;font-family:sans-serif;';

    var title = document.createElement('h3');
    title.textContent = config.title;
    container.appendChild(title);

    if (config.description) {
      var desc = document.createElement('p');
      desc.textContent = config.description;
      container.appendChild(desc);
    }

    var form = document.createElement('form');
    (config.fields || []).forEach(function (field) {
      var label = document.createElement('label');
      label.textContent = field.label;
      label.style.display = 'block';
      var input = document.createElement('input');
      input.type = field.type === 'email' ? 'email' : 'text';
      input.name = field.name;
      input.required = !!field.required;
      input.style.cssText = 'display:block;width:100%;margin-bottom:8px;padding:6px;';
      form.appendChild(label);
      form.appendChild(input);
    });

    // Honeypot field - real users never see or fill this, bots often do
    var honeypot = document.createElement('input');
    honeypot.type = 'text';
    honeypot.name = 'website';
    honeypot.style.cssText = 'position:absolute;left:-9999px;';
    honeypot.tabIndex = -1;
    honeypot.autocomplete = 'off';
    form.appendChild(honeypot);

    var submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.textContent = config.button_text || 'Submit';
    form.appendChild(submitBtn);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var formData = new FormData(form);
      var data = {};
      formData.forEach(function (value, key) { data[key] = value; });

      fetch(apiBase + '/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ widget_id: config.id, data: data, website: data.website }),
      })
        .then(function (res) { return res.json(); })
        .then(function () {
          container.innerHTML = '<p>Thank you! Your submission was received.</p>';
        })
        .catch(function () {
          container.innerHTML = '<p>Something went wrong. Please try again.</p>';
        });
    });

    container.appendChild(form);
    (script.parentNode || document.body).appendChild(container);
  }
})();
