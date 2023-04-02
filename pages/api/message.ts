import type { NextApiRequest, NextApiResponse } from "next";

const { BOT_ID, CHAT_ID, TEST_CHAT_ID, NODE_ENV } = process.env;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ ok: boolean }>
) {
  const { value }: { value: string } = JSON.parse(req.body);

  const url = new URL(`https://api.telegram.org/${BOT_ID}/sendMessage`);

  url.searchParams.append(
    "chat_id",
    NODE_ENV === "development" ? TEST_CHAT_ID! : CHAT_ID!
  );
  url.searchParams.append("parse_mode", "HTML");
  url.searchParams.append("disable_web_page_preview", "true");
  url.searchParams.append("text", value);

  const data = await fetch(url);
  const { ok } = (await data.json()) as { ok: boolean };

  ok ? res.status(200).json({ ok: true }) : res.status(500).json({ ok: false });
}
