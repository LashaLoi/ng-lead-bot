import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
import ru from "dayjs/locale/ru";
import timezone from "dayjs/plugin/timezone";
import weekday from "dayjs/plugin/weekday";

dayjs.locale(ru);
dayjs.extend(isToday);
dayjs.extend(timezone);
dayjs.extend(weekday);

export { dayjs };
