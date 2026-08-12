export function formatDateToICS(dt: string | Date) {
  const d = new Date(dt);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    d.getUTCFullYear() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    "T" +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    "Z"
  );
}

export function generateICS({
  uid,
  title,
  description,
  startTime,
  durationMinutes,
  url,
  organizerEmail,
}: {
  uid: string;
  title: string;
  description?: string | null;
  startTime: string;
  durationMinutes?: number;
  url?: string | null;
  organizerEmail?: string | null;
}) {
  const dtstart = formatDateToICS(startTime);
  const dtend = formatDateToICS(
    new Date(
      new Date(startTime).getTime() + (durationMinutes || 60) * 60000,
    ).toISOString(),
  );

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Fera AI//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${formatDateToICS(new Date().toISOString())}`,
    `DTSTART:${dtstart}`,
    `DTEND:${dtend}`,
    `SUMMARY:${(title || "Event").replace(/\n/g, " ")}`,
    `DESCRIPTION:${(description || "").replace(/\n/g, " \n")}`,
  ];

  if (organizerEmail) {
    lines.push(`ORGANIZER:mailto:${organizerEmail}`);
  }
  if (url) {
    lines.push(`URL:${url}`);
  }

  lines.push("END:VEVENT", "END:VCALENDAR");
  return lines.join("\r\n");
}
