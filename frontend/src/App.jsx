import React, { useState } from 'react';
import axios from 'axios';
import { 
  Container,
  TextField,
  Button,
  Paper,
  Typography,
  Grid,
  Alert,
  CircularProgress
} from '@mui/material';

function App() {
  const [formData, setFormData] = useState({ 
    birthdate: '', 
    birthtime: '12:00' 
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // 修复1：确认端口一致性
      const response = await axios.post('http://localhost:5001/api/bazi', formData);
      
      // 修复2：处理可能的空响应
      if (!response.data) {
        throw new Error('服务器返回空数据');
      }
      
      setResult(response.data);
    } catch (err) {
      // 修复3：显示详细错误信息
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          '未知错误，请检查控制台';
      setError({
        message: errorMessage,
        details: err.response?.data
      });
      console.error('完整错误信息:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          八字命盘计算器
          <Typography variant="caption" display="block" color="textSecondary">
            请输入准确的出生日期和时间（北京时间）
          </Typography>
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="出生日期"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                required
                value={formData.birthdate}
                onChange={(e) => setFormData({...formData, birthdate: e.target.value})}
                inputProps={{
                  max: new Date().toISOString().split('T')[0]
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="出生时间"
                type="time"
                fullWidth
                InputLabelProps={{ shrink: true }}
                required
                value={formData.birthtime}
                onChange={(e) => setFormData({...formData, birthtime: e.target.value})}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Button 
                variant="contained" 
                type="submit" 
                fullWidth
                size="large"
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : '立即计算'}
              </Button>
            </Grid>
          </Grid>
        </form>

        {error && (
          <Alert severity="error" sx={{ mt: 3 }}>
            <Typography variant="body1">错误: {error.message}</Typography>
            {error.details && (
              <Typography variant="body2" component="pre" sx={{ mt: 1 }}>
                {JSON.stringify(error.details, null, 2)}
              </Typography>
            )}
          </Alert>
        )}

        {result && (
          <div style={{ marginTop: '2rem' }}>
            <Typography variant="h5" gutterBottom>
              计算结果
              <Typography variant="caption" display="block" color="textSecondary">
                农历 {result.lunar.lunarYear}年{result.lunar.lunarMonth}月{result.lunar.lunarDay}日
              </Typography>
            </Typography>
            
            <Grid container spacing={2}>
              {Object.entries(result.bazi).map(([key, value]) => (
                <Grid item xs={6} sm={3} key={key}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'background.paper' }}>
                    <Typography variant="subtitle1" color="textSecondary">
                      {key}柱
                    </Typography>
                    <Typography variant="h3" component="div" sx={{ fontWeight: 700 }}>
                      {value}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </div>
        )}
      </Paper>
    </Container>
  );
}

export default App;