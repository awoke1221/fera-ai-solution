export async function sendEmailViaResend({
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
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.FROM_EMAIL || "no-reply@feraaisolution.com";
  if (!resendApiKey) throw new Error("RESEND_API_KEY not configured");

  const body: Record<string, unknown> = {
    from: fromEmail,
    to: [to],
    subject,
  };

  if (html) body.html = html;
  if (text) body.text = text;

  if (attachments && attachments.length > 0) {
    body.attachments = attachments.map((a) => ({
      content: Buffer.from(a.content).toString("base64"),
      filename: a.filename,
    }));
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const textRes = await res.text();
    throw new Error(`Resend error: ${textRes}`);
  }

  return true;
}
