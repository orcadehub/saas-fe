import { useState, useEffect, useRef } from 'react';
import { Box, Typography, Button, Card, CardContent, Chip, LinearProgress, Alert, Container } from '@mui/material';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { submitAnswer, completeInterview } from 'services/aiMockService';
import { Videocam, VolumeUp, PlayArrow } from '@mui/icons-material';
import Avatar3D from 'components/Avatar3D';

export default function CodeInterviewPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState(location.state?.questions || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [code, setCode] = useState('');
  const [answers, setAnswers] = useState({});
  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [highlightedText, setHighlightedText] = useState('');
  const [isFinishing, setIsFinishing] = useState(false);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const speechSynthesisRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const duration = location.state?.duration || 60;
    setTimeLeft(duration * 60);
    startRecording();
    enterFullscreen();
    return () => {
      stopRecording();
      exitFullscreen();
    };
  }, []);

  useEffect(() => {
    if (isRecording && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => (prev <= 1 ? 0 : prev - 1));
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [isRecording]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const enterFullscreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) elem.requestFullscreen();
  };

  const exitFullscreen = () => {
    if (document.exitFullscreen) document.exitFullscreen();
  };

  const startRecording = async () => {
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({ 
        video: { displaySurface: 'monitor' },
        audio: { systemAudio: 'include' }
      });
      
      displayStream.getVideoTracks()[0].onended = () => {
        alert('⚠️ Screen sharing stopped!');
        navigate('/ai-mock');
      };
      
      const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(cameraStream);
      if (videoRef.current) videoRef.current.srcObject = cameraStream;

      const mediaRecorder = new MediaRecorder(displayStream);
      mediaRecorderRef.current = mediaRecorder;
      recordedChunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) recordedChunksRef.current.push(event.data);
      };
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      alert('❌ Screen sharing is mandatory');
      navigate('/ai-mock');
    }
  };

  const stopRecording = () => {
    return new Promise((resolve) => {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.onstop = () => resolve();
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      } else {
        resolve();
      }
      if (stream) stream.getTracks().forEach(track => track.stop());
    });
  };

  const downloadRecording = () => {
    if (recordedChunksRef.current.length > 0) {
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `interview_video_${id}.webm`;
      a.click();
    }
  };

  const speakQuestion = (text) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.3;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      setHighlightedText('');
    };
    window.speechSynthesis.speak(utterance);
  };

  const handleReExplain = () => {
    const currentQuestion = questions[currentIndex]?.question;
    if (currentQuestion) speakQuestion(currentQuestion);
  };

  useEffect(() => {
    const currentQuestion = questions[currentIndex]?.question;
    if (currentQuestion) speakQuestion(currentQuestion);
  }, [currentIndex]);

  const handleSubmitAnswer = async () => {
    if (code.trim()) {
      await submitAnswer({ interviewId: id, questionIndex: currentIndex, answer: code });
      setAnswers({ ...answers, [currentIndex]: code });
    }
    setCode('');
    
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsFinishing(true);
      await stopRecording();
      await new Promise(resolve => setTimeout(resolve, 1000));
      downloadRecording();
      const result = await completeInterview(id);
      navigate('/ai-mock/result', { state: { score: result.score } });
    }
  };

  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <>
    {isFinishing && (
      <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, bgcolor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h5" sx={{ color: 'white', mb: 1 }}>Finishing Interview...</Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>Saving recording</Typography>
        </Box>
      </Box>
    )}
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', display: 'flex' }}>
      <Box sx={{ width: '40%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ height: '50vh', bgcolor: '#000', position: 'relative' }}>
          <video ref={videoRef} autoPlay muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <Box sx={{ position: 'absolute', top: 20, left: 20 }}>
            <Alert severity="error" sx={{ bgcolor: 'rgba(211, 47, 47, 0.9)' }}>
              <Videocam /> {isRecording ? 'REC' : 'Not Recording'}
            </Alert>
          </Box>
        </Box>
        <Box sx={{ height: '50vh', bgcolor: '#1a1a2e', position: 'relative', overflow: 'hidden' }}>
          <Avatar3D isSpeaking={isSpeaking} />
          <Box sx={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)' }}>
            <Button variant="contained" color="primary" onClick={handleReExplain} startIcon={<VolumeUp />}>
              Speak Question
            </Button>
          </Box>
        </Box>
      </Box>

      <Box sx={{ flex: 1, p: 4, overflowY: 'auto', bgcolor: '#f5f5f5' }}>
        <Container maxWidth="md">
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="body2" color="text.secondary">Problem {currentIndex + 1} of {questions.length}</Typography>
              <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4, mt: 1, width: 200 }} />
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: timeLeft < 60 ? 'error.main' : 'primary.main' }}>
                {formatTime(timeLeft)}
              </Typography>
              <Typography variant="caption" color="text.secondary">Time Remaining</Typography>
            </Box>
          </Box>

          <Card sx={{ mb: 3, boxShadow: 3 }}>
            <CardContent sx={{ p: 4 }}>
              <Chip label={questions[currentIndex]?.category} color="primary" sx={{ mb: 2 }} />
              <Typography variant="h4" sx={{ mb: 3, fontWeight: 500, lineHeight: 1.6 }}>
                {questions[currentIndex]?.question}
              </Typography>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Write your code here..."
                style={{
                  width: '100%',
                  minHeight: '400px',
                  fontFamily: 'monospace',
                  fontSize: '14px',
                  padding: '16px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  resize: 'vertical'
                }}
              />
            </CardContent>
          </Card>

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button disabled={currentIndex === 0 || isSpeaking} onClick={() => setCurrentIndex(currentIndex - 1)} size="large">
              Previous
            </Button>
            <Button variant="contained" onClick={handleSubmitAnswer} disabled={isSpeaking} size="large"
              color={currentIndex === questions.length - 1 ? 'error' : 'primary'}>
              {currentIndex === questions.length - 1 ? 'Finish Interview' : 'Next Problem'}
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
    </>
  );
}
