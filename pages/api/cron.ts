import { google } from "googleapis";
import { JWT } from "google-auth-library";

import { dayjs } from "../../dayjs";

import type { NextApiRequest, NextApiResponse } from "next";

const { CLIENT_EMAIL, PRIVATE_KEY, CALENDAR_ID, BOT_ID, CHAT_ID } = process.env;

const options = {
  email: CLIENT_EMAIL,
  key: PRIVATE_KEY,
  scopes: [
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/calendar.events",
  ],
};

const client = new JWT(options);
const calendar = google.calendar({ version: "v3" });
const numbers = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse<{}>
) {
  if (!CLIENT_EMAIL || !PRIVATE_KEY || !CALENDAR_ID || !BOT_ID || !CHAT_ID) {
    return res.json({
      ok: false,
      message: "No env variables",
    });
  }

  try {
    const {
      data: { items = [] },
    } = await calendar.events.list({
      calendarId: CALENDAR_ID,
      auth: client,
    });

    const currentDayNumber = dayjs().weekday();
    const isMonday = currentDayNumber === 0;

    const url = new URL(`https://api.telegram.org/${BOT_ID}/sendMessage`);

    url.searchParams.append("chat_id", CHAT_ID);
    url.searchParams.append("parse_mode", "HTML");
    url.searchParams.append("disable_web_page_preview", "true");

    if (isMonday) {
      let output = "Мероприятия на этой неделе:";
    } else {
      let output = "⭐️ <b>Мероприятия на сегодня</b> ⭐️\n";
      let count = 0;

      items
        .filter((item) => item.start?.dateTime)
        .sort((itemA, itemB) =>
          dayjs(itemA.start!.dateTime!).isAfter(dayjs(itemB.start!.dateTime!))
            ? 1
            : -1
        )
        .forEach((item, i) => {
          const day = dayjs(item.start!.dateTime!);

          if (currentDayNumber !== day.weekday()) {
            return;
          }

          count++;

          output += `\n${numbers[i] ?? "--"} <b>${day.format(
            "h:mm A"
          )}</b> - <a href='${item.htmlLink}'>${item.summary}</a>`;
        });

      if (count === 0) {
        output = "⭐️ <b>Сегодня нет мероприятий</b> ⭐️";
      }

      output += `\n\n 💒 ${dayjs().format("DD/MM/YYYY")}`;

      url.searchParams.append("text", output);
    }

    const resp = await fetch(url);
    const data = await resp.json();

    if (!data.ok) {
      res.status(500).json({ ok: false });

      return;
    }

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error(error);

    res.status(500).json({ ok: false });
  }
}
