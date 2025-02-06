const express = require('express');
const cors = require('cors');
const LunarCalendar = require('lunar-calendar');

const app = express();
app.use(cors());
app.use(express.json());

const tiangan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const dizhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

app.post('/api/bazi', (req, res) => {
  try {
    const { birthdate, birthtime } = req.body;
    const [year, month, day] = birthdate.split('-').map(Number);
    const [hour] = birthtime.split(':').map(Number);

    // 農曆轉換
    const lunarDate = LunarCalendar.solarToLunar(year, month, day);
    if (!lunarDate) throw new Error('農曆轉換失敗');

    // 年柱計算
    const yearGZ = LunarCalendar.getYearGanZhi(year);
    const yearPillar = tiangan[yearGZ[0]] + dizhi[yearGZ[1]];

    // 月柱計算
    const monthGZ = LunarCalendar.getMonthGanZhi(year, month, day);
    const monthPillar = tiangan[monthGZ[0]] + dizhi[monthGZ[1]];

    // 日柱計算
    const dayGZ = LunarCalendar.getDayGanZhi(year, month, day);
    const dayPillar = tiangan[dayGZ[0]] + dizhi[dayGZ[1]];

    // 時柱計算
    const shichenIndex = Math.floor((hour + 1) / 2) % 12;
    const timeZhi = dizhi[shichenIndex];
    const timeGan = tiangan[(dayGZ[0] % 5) * 2 + shichenIndex % 10];
    const timePillar = timeGan + timeZhi;

    res.json({
      bazi: {
        年柱: yearPillar,
        月柱: monthPillar,
        日柱: dayPillar,
        時柱: timePillar
      },
      農曆: `農曆${lunarDate.lYear}年${lunarDate.lMonth}月${lunarDate.lDay}日`
    });

  } catch (error) {
    console.error('伺服器錯誤:', error);
    res.status(500).json({
      錯誤: '內部伺服器錯誤',
      訊息: error.message
    });
  }
});

const PORT = 5001;
app.listen(PORT, () => console.log(`後端運行於 http://localhost:${PORT}`));