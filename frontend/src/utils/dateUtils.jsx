// utils/dateUtils.js

// 补零工具函数
const pad = (n) => (n < 10 ? `0${n}` : `${n}`);

// 时间格式化工具对象
const DateUtils = {
  /**
   * 转换为 YYYY-MM-DD 格式（本地时间）
   * @param {string|Date|null|undefined} input - 时间输入（ISO 字符串、时间戳等）
   * @returns {string} 格式化后的日期字符串，如 "2025-08-11"
   */
  formatDateYMD(input) {
    if (!input) return '';
    const d = new Date(input);
    if (Number.isNaN(d.getTime())) return '';
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  },

  /**
   * 转换为 YYYY-MM-DDTHH:mm 格式，用于 <input type="datetime-local" />
   * @param {string|Date|null|undefined} input - 时间输入
   * @returns {string} 格式化后的日期时间字符串，如 "2025-08-11T16:30"
   */
  toInputDateTimeLocal(input) {
    if (!input) return '';
    const d = new Date(input);
    if (Number.isNaN(d.getTime())) return '';
    const y = d.getFullYear();
    const m = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hh = pad(d.getHours());
    const mm = pad(d.getMinutes());
    return `${y}-${m}-${day}T${hh}:${mm}`;
  },

  /**
   * 从 datetime-local 输入值解析为 Date 对象（本地时间）
   * @param {string} value - 格式如 "2025-08-11T16:30"
   * @returns {Date | null} 解析后的时间对象，失败返回 null
   */
  fromInputDateTimeLocal(value) {
    if (!value) return null;
    // 注意：datetime-local 输入是本地时间，直接构造即可
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  },

  /**
   * 获取当前时间的 datetime-local 格式（用于默认值）
   * @returns {string}
   */
  nowInputDateTimeLocal() {
    return this.toInputDateTimeLocal(new Date());
  },

  // 可扩展：格式化为 YYYY-MM-DD HH:mm
  formatDateTime(input) {
    if (!input) return '';
    const d = new Date(input);
    if (Number.isNaN(d.getTime())) return '';
    const y = d.getFullYear();
    const m = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hh = pad(d.getHours());
    const mm = pad(d.getMinutes());
    return `${y}-${m}-${day} ${hh}:${mm}`;
  },
};

export default DateUtils;

// 也可以按需导出
// export { formatDateYMD, toInputDateTimeLocal, ... };