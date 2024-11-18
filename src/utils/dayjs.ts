import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import minMax from 'dayjs/plugin/minMax';

dayjs.extend(minMax);
dayjs.locale('zh-cn');

export default dayjs;
