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
      const response = await axios.post('http://localhost:5001/api/bazi', formData);
      
      if (!response.data) {
        throw new Error('伺服器未返回資料');
      }
      
      setResult(response.data);
    } catch (err) {
      const errorMessage = err.response?.data?.訊息 || 
                          err.message || 
                          '未知錯誤，請檢查控制台';
      setError({
        訊息: errorMessage,
        詳細內容: err.response?.data
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          八字命盤計算器
          <Typography variant="caption" display="block" color="textSecondary">
            請輸入準確的出生日期與時間（北京時間）
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
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="出生時間"
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
                {loading ? <CircularProgress size={24} /> : '立即計算'}
              </Button>
            </Grid>
          </Grid>
        </form>

        {error && (
          <Alert severity="error" sx={{ mt: 3 }}>
            <Typography variant="body1">錯誤：{error.訊息}</Typography>
            {error.詳細內容 && (
              <pre style={{ whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(error.詳細內容, null, 2)}
              </pre>
            )}
          </Alert>
        )}

        {result && (
          <div style={{ marginTop: '2rem' }}>
            <Typography variant="h5" gutterBottom>
              計算結果
              <Typography variant="caption" display="block" color="textSecondary">
                農曆 {result.農曆}
              </Typography>
            </Typography>
            
            <Grid container spacing={2}>
              {Object.entries(result.bazi).map(([key, value]) => (
                <Grid item xs={6} sm={3} key={key}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'background.paper' }}>
                    <Typography variant="subtitle1" color="textSecondary">
                      {key}
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