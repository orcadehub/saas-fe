import { useState, useEffect, useRef } from 'react';
import { Box, Typography, Button, TextField, Card, CardContent, Chip, LinearProgress, Alert, Container, IconButton, Tooltip } from '@mui/material';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useAIMock } from 'contexts/AIMockContext';
import { Videocam, VolumeUp } from '@mui/icons-material';
import Avatar3D from 'components/Avatar3D';

export default function InterviewPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { submitAnswer, completeInterview } = useAIMock();
  const [questions, setQuestions] = useState(location.state?.questions || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
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
    const duration = location.state?.duration || 45;
    setTimeLeft(duration * 60);
  }, [location.state]);

  useEffect(() => {
    if (isRecording && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [isRecording]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    startRecording();
    enterFullscreen();
    return () => {
      stopRecording();
      exitFullscreen();
    };
  }, []);

  const enterFullscreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    }
  };

  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  };

  const startRecording = async () => {
    try {
      // Get screen recording with system audio (mandatory)
      const displayStream = await navigator.mediaDevices.getDisplayMedia({ 
        video: { displaySurface: 'monitor' },
        audio: { 
          echoCancellation: false,
          noiseSuppression: false,
          sampleRate: 44100,
          systemAudio: 'include'
        },
        preferCurrentTab: false,
        selfBrowserSurface: 'exclude',
        surfaceSwitching: 'exclude'
      });
      
      // Monitor if screen sharing stops
      displayStream.getVideoTracks()[0].onended = () => {
        alert('⚠️ Screen sharing stopped! Interview will be terminated.');
        stopRecording();
        navigate('/ai-mock');
      };
      
      // Get user camera
      const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      
      setStream(cameraStream);
      if (videoRef.current) {
        videoRef.current.srcObject = cameraStream;
      }

      const mediaRecorder = new MediaRecorder(displayStream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 2500000
      });
      mediaRecorderRef.current = mediaRecorder;
      recordedChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing screen:', error);
      alert('❌ Screen sharing is mandatory for the interview. Please allow screen recording.');
      navigate('/ai-mock');
    }
  };

  const stopRecording = () => {
    return new Promise((resolve) => {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.onstop = () => {
          resolve();
        };
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      } else {
        resolve();
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      stopSpeaking();
    });
  };

  const speakQuestion = (text) => {
    stopSpeaking();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.3;
    utterance.volume = 1;
    
    // Select female voice
    const voices = window.speechSynthesis.getVoices();
    const femaleVoice = voices.find(voice => 
      voice.name.includes('Google UK English Female') ||
      voice.name.includes('Microsoft Zira') ||
      voice.name.includes('Samantha') || 
      voice.name.includes('Victoria') ||
      voice.lang.includes('en-GB') && voice.name.includes('Female')
    ) || voices.find(voice => voice.name.includes('Female'));
    
    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }
    
    // Word highlighting synced with speech
    const words = text.split(' ');
    const totalDuration = (text.length / utterance.rate) * 60; // Estimate total duration
    const wordDuration = totalDuration / words.length;
    let wordIndex = 0;
    let intervalId;
    
    utterance.onstart = () => {
      setIsSpeaking(true);
      intervalId = setInterval(() => {
        if (wordIndex < words.length) {
          const highlighted = words.map((word, idx) => {
            if (idx < wordIndex) return `<span style="color: #1976d2;">${word}</span>`;
            if (idx === wordIndex) return `<span style="color: #1976d2; font-weight: 700; background: rgba(25, 118, 210, 0.1); padding: 2px 4px; border-radius: 4px;">${word}</span>`;
            return `<span style="color: #666;">${word}</span>`;
          }).join(' ');
          setHighlightedText(highlighted);
          wordIndex++;
        } else {
          clearInterval(intervalId);
        }
      }, wordDuration);
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
      clearInterval(intervalId);
      setTimeout(() => setHighlightedText(''), 500);
    };
    
    speechSynthesisRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setHighlightedText('');
  };

  const handleReExplain = () => {
    const currentQuestion = questions[currentIndex]?.question;
    if (currentQuestion) {
      speakQuestion(currentQuestion);
    }
  };

  useEffect(() => {
    const currentQuestion = questions[currentIndex]?.question;
    if (currentQuestion) {
      speakQuestion(currentQuestion);
    }
  }, [currentIndex]);

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

  const handleSubmitAnswer = async () => {
    stopSpeaking();
    
    if (answer.trim()) {
      await submitAnswer({ interviewId: id, questionIndex: currentIndex, answer });
      setAnswers({ ...answers, [currentIndex]: answer });
    }
    
    setAnswer('');
    
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
      <Box sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgcolor: 'rgba(0,0,0,0.8)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <Box sx={{ mb: 3 }}>
            <div style={{
              width: 60,
              height: 60,
              border: '4px solid rgba(255,255,255,0.3)',
              borderTop: '4px solid white',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto'
            }} />
          </Box>
          <Typography variant="h5" sx={{ color: 'white', mb: 1 }}>
            Finishing Interview...
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            Saving recording and calculating results
          </Typography>
        </Box>
      </Box>
    )}
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: '#f5f5f5',
      position: 'relative',
      display: 'flex'
    }}>
      {/* Left Side - Video & Avatar */}
      <Box sx={{ 
        width: '40%', 
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Top Half - User Video */}
        <Box sx={{ 
          height: '50vh',
          bgcolor: '#000',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <video
            ref={videoRef}
            autoPlay
            muted
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
          
          <Box sx={{ position: 'absolute', top: 20, left: 20 }}>
            <Alert severity="error" sx={{ bgcolor: 'rgba(211, 47, 47, 0.9)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Videocam />
                <Typography variant="body2">
                  {isRecording ? 'REC' : 'Not Recording'}
                </Typography>
              </Box>
            </Alert>
          </Box>
          
          <Box sx={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)' }}>
            <Button
              variant="contained"
              color={isRecording ? 'error' : 'success'}
              onClick={isRecording ? stopRecording : startRecording}
              size="large"
              sx={{ 
                minWidth: 120,
                fontWeight: 600,
                boxShadow: 3
              }}
            >
              {isRecording ? 'Stop' : 'Start'}
            </Button>
          </Box>
        </Box>

        {/* Bottom Half - AI Avatar */}
        <Box sx={{ 
          height: '50vh',
          bgcolor: '#1a1a2e',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <Box sx={{ width: '100%', height: '100%', m: 0, p: 0 }}>
            <Avatar3D isSpeaking={isSpeaking} />
          </Box>
          
          {/* Speak Button */}
          <Box sx={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleReExplain}
              startIcon={<VolumeUp />}
              sx={{ 
                minWidth: 140,
                fontWeight: 600,
                boxShadow: 3
              }}
            >
              Speak Question
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Right Side - Question & Answer */}
      <Box sx={{ flex: 1, p: 4, overflowY: 'auto', bgcolor: '#f5f5f5' }}>
        <Container maxWidth="md">
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="body2" color="text.secondary">
            Question {currentIndex + 1} of {questions.length}
          </Typography>
          <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4, mt: 1, width: 200 }} />
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: timeLeft < 60 ? 'error.main' : 'primary.main' }}>
            {formatTime(timeLeft)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Time Remaining
          </Typography>
        </Box>
      </Box>

      <Card sx={{ mb: 3, boxShadow: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
            <Chip label={questions[currentIndex]?.category} color="primary" />
          </Box>
          <Typography 
            variant="h4" 
            sx={{ mb: 3, fontWeight: 500, lineHeight: 1.6 }}
            dangerouslySetInnerHTML={{ 
              __html: highlightedText || questions[currentIndex]?.question 
            }}
          />
          <TextField
            fullWidth
            multiline
            rows={8}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer here..."
            variant="outlined"
          />
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button 
          disabled={currentIndex === 0 || isSpeaking}
          onClick={() => setCurrentIndex(currentIndex - 1)}
          size="large"
        >
          Previous
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSubmitAnswer}
          disabled={isSpeaking}
          size="large"
          color={currentIndex === questions.length - 1 ? 'error' : 'primary'}
        >
          {currentIndex === questions.length - 1 ? 'Finish Interview' : 'Next Question'}
        </Button>
      </Box>
        </Container>
      </Box>
    </Box>
    </>
  );
}
