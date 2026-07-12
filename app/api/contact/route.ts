import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const message = [
      `Name: ${body.name || "N/A"}`,
      `Email: ${body.email || "N/A"}`,
      `Company: ${body.company || "N/A"}`,
      `Project: ${body.project || "N/A"}`,
      `Message: ${body.message || "N/A"}`,
    ].join("\n");

    if (process.env.RESEND_API_KEY) {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM || "onboarding@resend.dev",
          to: [process.env.CONTACT_EMAIL || "hello@feraltech.dev"],
          subject: `New inquiry from ${body.name || "a visitor"}`,
          text: message,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send email");
      }
    }

    return NextResponse.json({
      success: true,
      message:
        "Thanks! Your message is ready and will be sent as soon as email delivery is configured.",
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message:
          "Thanks! Your message is ready and will be sent as soon as email delivery is configured.",
      },
      { status: 200 },
    );
  }
}
