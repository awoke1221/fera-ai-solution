export async function sendEmailViaSendGrid({
  to,
  subject,
  html,
  text,
  attachments,
}: {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  attachments?: Array<{ filename: string; content: string; type?: string }>;
}) {
  const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
  const FROM_EMAIL = process.env.FROM_EMAIL || "no-reply@feraaisolution.com";
  if (!SENDGRID_API_KEY) throw new Error("SENDGRID_API_KEY not configured");

  const body: any = {
    personalizations: [
      {
        to: [{ email: to }],
      },
    ],
    from: { email: FROM_EMAIL },
    subject: subject,
    content: [],
  };

  if (html) body.content.push({ type: "text/html", value: html });
  if (text && !html) body.content.push({ type: "text/plain", value: text });

  if (attachments && attachments.length > 0) {
    body.attachments = attachments.map((a) => ({
      content: Buffer.from(a.content).toString("base64"),
      filename: a.filename,
      type: a.type || "application/octet-stream",
      disposition: "attachment",
    }));
  }

  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SENDGRID_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const textRes = await res.text();
    throw new Error(`SendGrid error: ${textRes}`);
  }

  return true;
}
