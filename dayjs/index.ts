import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
import ru from "dayjs/locale/ru";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import weekday from "dayjs/plugin/weekday";

dayjs.locale(ru);
dayjs.extend(isToday);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(weekday);

dayjs.tz.setDefault("Europe/Minsk");

export { dayjs };
