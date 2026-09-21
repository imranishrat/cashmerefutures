(function () {
  var form = document.getElementById("contact-form");
  if (!form) return;

  form.addEventListener("submit", function () {
    var emailField = form.querySelector("[name='email']");
    var replyToField = form.querySelector("[name='_replyto']");
    if (replyToField && emailField) replyToField.value = emailField.value;
  });
})();