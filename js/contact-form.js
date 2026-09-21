(function () {
  var form = document.getElementById("contact-form");
  if (!form) return;

  var statusEl = document.getElementById("form-status");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var submitBtn = form.querySelector("button[type='submit']");
    var emailField = form.querySelector("[name='email']");
    var replyToField = form.querySelector("[name='_replyto']");

    if (replyToField && emailField) replyToField.value = emailField.value;

    var data = {};
    new FormData(form).forEach(function (value, key) {
      data[key] = value;
    });

    statusEl.textContent = "Sending…";
    statusEl.className = "form-status";
    if (submitBtn) submitBtn.disabled = true;

    fetch(form.action, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(data)
    })
      .then(function (response) {
        return response.text().then(function (text) {
          var json;
          try {
            json = JSON.parse(text);
          } catch (err) {
            throw new Error("Form service returned an unexpected response (HTTP " + response.status + ").");
          }

          if (!response.ok || json.success !== true) {
            throw new Error(json.message || json.error || "Form service rejected the submission (HTTP " + response.status + ").");
          }

          return json;
        });
      })
      .then(function () {
        statusEl.textContent = "Thanks — your message has been sent. We'll be in touch.";
        statusEl.className = "form-status success";
        form.reset();
      })
      .catch(function (error) {
        console.error("Contact form error:", error);
        statusEl.textContent = error.message + " Please try again or email us directly.";
        statusEl.className = "form-status error";
      })
      .finally(function () {
        if (submitBtn) submitBtn.disabled = false;
      });
  });
})();