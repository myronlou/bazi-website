const express = require('express');
const cors = require('cors');
const lunar = require('chinese-lunar-calendar');

const app = express();
app.use(cors());
app.use(express.json());

const tiangan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const dizhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 修复1：添加详细的错误日志
const getShiChen = (hour) => {
  console.log(`处理时辰计算，输入小时: ${hour}`);
  return Math.floor((hour + 1) / 2) % 12;
};

// 修复2：完整的农历转换逻辑
app.post('/api/bazi', (req, res) => {
  try {
    console.log('收到请求:', req.body);
    
    const { birthdate, birthtime } = req.body;
    const [year, month, day] = birthdate.split('-').map(Number);
    const [hour, minute] = birthtime.split(':').map(Number);

    // 修复3：验证日期有效性
    if (isNaN(year) || isNaN(month) || isNaN(day)) {
      throw new Error('无效的日期格式，请使用YYYY-MM-DD');
    }

    const lunarDate = lunar.solarToLunar(year, month, day);
    console.log('农历转换结果:', lunarDate);

    // 修复4：处理年份干支计算
    const yearGZ = lunar.getYearGZ(year);
    const yearPillar = tiangan[yearGZ.tg] + dizhi[yearGZ.dz];

    // 修复5：精确的月柱计算
    const monthGZ = lunar.getMonthGZ(year, month, day);
    const monthPillar = tiangan[monthGZ.tg] + dizhi[monthGZ.dz];

    // 修复6：日柱计算
    const dayGZ = lunar.getDayGZ(year, month, day);
    const dayPillar = tiangan[dayGZ.tg] + dizhi[dayGZ.dz];

    // 修复7：修正时干计算逻辑
    const shichenIndex = getShiChen(hour);
    const timeZhi = dizhi[shichenIndex];
    const dayGanIndex = dayGZ.tg;
    const timeGanIndex = (dayGanIndex % 5) * 2 + shichenIndex;
    const timeGan = tiangan[timeGanIndex % 10];
    const timePillar = timeGan + timeZhi;

    console.log('计算结果:', {
      yearPillar,
      monthPillar,
      dayPillar,
      timePillar
    });

    res.json({
      bazi: {
        year: yearPillar,
        month: monthPillar,
        day: dayPillar,
        time: timePillar
      },
      lunar: lunarDate
    });

  } catch (error) {
    // 修复8：返回详细错误信息
    console.error('服务器错误:', error.stack);
    res.status(500).json({
      error: '内部服务器错误',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// 修复9：确认端口配置
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`后端运行在 http://localhost:${PORT}`));