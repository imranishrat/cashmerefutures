(function () {
  var form = document.getElementById("contact-form");
  if (!form) return;

  var statusEl = document.getElementById("form-status");
  var directEmailLink = document.getElementById("direct-email-link");

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
        if (!response.ok) {
          return response.json().catch(function () {
            return {};
          }).then(function (json) {
            throw new Error((json && json.error) || "Something went wrong.");
          });
        }

        statusEl.textContent = "Thanks — your message has been sent. We'll be in touch.";
        statusEl.className = "form-status success";
        form.reset();
      })
      .catch(function () {
        statusEl.textContent = "We couldn't send the form just now. Please use the email option below instead.";
        statusEl.className = "form-status error";
      })
      .finally(function () {
        if (submitBtn) submitBtn.disabled = false;
      });
  });

  /*
   * Open Outlook on the web for a dependable browser-based email option.
   * If Outlook Web is unavailable, fall back to the user's normal mail handler.
   */
  if (directEmailLink) {
    directEmailLink.addEventListener("click", function (e) {
      var outlookUrl = directEmailLink.getAttribute("href");
      if (!outlookUrl) return;

      var fallback = "mailto:hello@cashmerefutures.com";
      var opened = window.open(outlookUrl, "_blank", "noopener,noreferrer");

      if (!opened) {
        e.preventDefault();
        window.location.href = fallback;
      } else {
        e.preventDefault();
      }
    });
  }
})();
