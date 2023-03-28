import { google } from "googleapis";
import { JWT } from "google-auth-library";

import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse<{}>
) {
  const options = {
    email: process.env.CLIENT_EMAIL,
    key: process.env.PRIVATE_KEY,
    scopes: [
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/calendar.events",
    ],
  };

  const client = new JWT(options);
  const calendar = google.calendar({ version: "v3" });

  try {
    const {
      data: { items },
    } = await calendar.events.list({
      calendarId: process.env.CALENDAR_ID,
      auth: client,
    });

    const output = `<b>Внимание!</b>%0A%0A- Я люблю Викторию!%0A- И Бога!`;

    // item.summary

    await fetch(
      `https://api.telegram.org/${process.env.BOT_ID}/sendMessage?chat_id=${process.env.CHAT_ID}&parse_mode=HTML&text=${output}`
    );

    // items?.forEach((item) => {

    // });

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error(error);

    res.status(500).json({ ok: false });
  }
}
