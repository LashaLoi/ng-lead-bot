import { NextResponse } from "next/server";

const {
  CLIENT_EMAIL,
  PRIVATE_KEY,
  CALENDAR_ID,
  BOT_ID,
  CHAT_ID,
  TEST_CHAT_ID,
} = process.env;

export function middleware() {
  if (
    !CLIENT_EMAIL ||
    !PRIVATE_KEY ||
    !CALENDAR_ID ||
    !BOT_ID ||
    !CHAT_ID ||
    !TEST_CHAT_ID
  ) {
    return new NextResponse(
      JSON.stringify({ ok: false, message: "No env variables" }),
      { status: 401, headers: { "content-type": "application/json" } }
    );
  }
}

export const config = {
  matcher: "/api/:function*",
};
