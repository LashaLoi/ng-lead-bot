import { google } from "googleapis";
import { JWT } from "google-auth-library";

import { dayjs } from "../../dayjs";

import type { NextApiRequest, NextApiResponse } from "next";

const {
  CLIENT_EMAIL,
  PRIVATE_KEY,
  CALENDAR_ID,
  BOT_ID,
  CHAT_ID,
  TEST_CHAT_ID,
  NODE_ENV,
} = process.env;

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
  try {
    const currentDay = dayjs();
    const currentDayFormat = currentDay.tz("Europe/Minsk").format("DD/MM/YYYY");

    const {
      data: { items = [] },
    } = await calendar.events.list({
      calendarId: CALENDAR_ID,
      auth: client,
    });

    const isMonday = false;

    const url = new URL(`https://api.telegram.org/${BOT_ID}/sendMessage`);

    url.searchParams.append(
      "chat_id",
      NODE_ENV === "development" ? TEST_CHAT_ID! : CHAT_ID!
    );
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
        .forEach((item) => {
          const day = dayjs(item.start!.dateTime!);

          const isCurrentDay =
            currentDayFormat !== day.tz("Europe/Minsk").format("DD/MM/YYYY");

          if (isCurrentDay) {
            return;
          }

          output += `\n${numbers[count] ?? "--"} <b>${day
            .tz("Europe/Minsk")
            .format("h:mm A")}</b> - <a href='${item.htmlLink}'>${
            item.summary
          }</a>`;

          count++;
        });

      if (count === 0) {
        output = "⭐️ <b>Сегодня нет мероприятий</b> ⭐️";
      }

      output += `\n\n 💒 ${currentDayFormat}`;

      url.searchParams.append("text", output);
    }

    const data = await fetch(url);
    const { ok } = (await data.json()) as { ok: boolean };

    ok
      ? res.status(200).json({ ok: true })
      : res.status(500).json({ ok: false });
  } catch (error) {
    console.error(error);

    res.status(500).json({ ok: false });
  }
}
