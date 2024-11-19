import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import duration from 'dayjs/plugin/duration'
import minMax from 'dayjs/plugin/minMax'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(minMax)
dayjs.extend(relativeTime)
dayjs.extend(duration)
dayjs.locale('zh-cn')

export default dayjs
