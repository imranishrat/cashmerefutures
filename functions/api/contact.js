export async function onRequestPost(context) {
  const request = context.request;
  const env = context.env;

  const origin = request.headers.get("Origin");
  if (origin && origin !== "https://cashmerefutures.com" && origin !== "https://www.cashmerefutures.com") {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" }
    });
  }

  const form = await request.formData();
  const name = String(form.get("name") || "").trim();
  const email = String(form.get("email") || "").trim();
  const organisation = String(form.get("organisation") || "").trim();
  const role = String(form.get("role") || "").trim();
  const message = String(form.get("message") || "").trim();
  const honeypot = String(form.get("_gotcha") || "").trim();

  // Silently accept likely bot submissions without sending mail.
  if (honeypot) {
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  if (!name || !email || !message || name.length > 120 || email.length > 254 || message.length > 5000) {
    return new Response(JSON.stringify({ error: "Please check the required fields and try again." }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return new Response(JSON.stringify({ error: "Please enter a valid email address." }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  const subject = `Cashmere Futures collaboration enquiry — ${name}`;
  const text = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Organisation: ${organisation || "Not provided"}`,
    `Role: ${role || "Not provided"}`,
    "",
    "Message:",
    message
  ].join("\n");

  const html = `
    <h2>Cashmere Futures collaboration enquiry</h2>
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Organisation:</strong> ${escapeHtml(organisation || "Not provided")}</p>
    <p><strong>Role:</strong> ${escapeHtml(role || "Not provided")}</p>
    <hr>
    <p><strong>Message:</strong></p>
    <p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
  `;

  try {
    await env.EMAIL.send({
      from: "hello@cashmerefutures.com",
      to: "hello@cashmerefutures.com",
      replyTo: email,
      subject,
      text,
      html
    });
  } catch (error) {
    console.error("Cloudflare Email Service send failed", error);
    return new Response(JSON.stringify({ error: "Unable to send the message right now." }), {
      status: 502,
      headers: { "Content-Type": "application/json" }
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}

export async function onRequest(context) {
  if (context.request.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: { Allow: "POST" }
    });
  }

  return onRequestPost(context);
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
