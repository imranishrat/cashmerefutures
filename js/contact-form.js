(function () {
  var form = document.getElementById("contact-form");
  if (!form) return;

  var statusEl = document.getElementById("form-status");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var data = new FormData(form);
    var submitBtn = form.querySelector("button[type='submit']");

    statusEl.textContent = "Sending…";
    statusEl.className = "form-status";
    if (submitBtn) submitBtn.disabled = true;

    fetch(form.action, {
      method: "POST",
      body: data,
      headers: { "Accept": "application/json" }
    })
      .then(function (response) {
        if (response.ok) {
          statusEl.textContent = "Thanks — your message has been sent. We'll be in touch.";
          statusEl.className = "form-status success";
          form.reset();
        } else {
          return response.json().then(function (json) {
            throw new Error((json && json.error) || "Something went wrong.");
          });
        }
      })
      .catch(function () {
        statusEl.textContent = "Something went wrong sending this — please try emailing us directly instead.";
        statusEl.className = "form-status error";
      })
      .finally(function () {
        if (submitBtn) submitBtn.disabled = false;
      });
  });
})();
