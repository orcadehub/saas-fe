import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Button, Card, CardContent, Chip, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, TextField, Dialog, DialogTitle, 
  DialogContent, DialogActions, IconButton, FormControl, InputLabel, Select, MenuItem,
  TablePagination, Tooltip
} from '@mui/material';
import { 
  IconArrowLeft, IconEdit, IconEye, IconPlayerPlay, IconRefresh, IconPlayerStop, IconSearch 
} from '@tabler/icons-react';
import MainCard from 'ui-component/cards/MainCard';

const API_BASE_URL = import.meta.env.DEV ? 'http://localhost:4000/api' : 'https://backend.orcode.in/api';

const InstructorAssessmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [students, setStudents] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [actionDialog, setActionDialog] = useState({ open: false, type: '', student: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [newStartTime, setNewStartTime] = useState('');
  const [duration, setDuration] = useState(60);
  const [earlyStartBuffer, setEarlyStartBuffer] = useState(5);
  const [maxTabSwitches, setMaxTabSwitches] = useState(3);
  const [assessmentStatus, setAssessmentStatus] = useState('draft');
  const [allowedIPs, setAllowedIPs] = useState('');
  const [allowedLanguages, setAllowedLanguages] = useState(['python', 'cpp', 'java', 'c']);
  const [showKeyInsights, setShowKeyInsights] = useState(false);
  const [showAlgorithmSteps, setShowAlgorithmSteps] = useState(false);
  const [markAllInProgressOpen, setMarkAllInProgressOpen] = useState(false);
  const [markAllResumeOpen, setMarkAllResumeOpen] = useState(false);
  const [markAllCompletedResumeOpen, setMarkAllCompletedResumeOpen] = useState(false);
  const [deleteAllAttemptsOpen, setDeleteAllAttemptsOpen] = useState(false);
  const [markCompletedOpen, setMarkCompletedOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (assessment?.startTime) {
      const updateTimer = () => {
        const now = new Date().getTime();
        const startTime = new Date(assessment.startTime).getTime();
        const endTime = startTime + (assessment.duration * 60 * 1000);
        
        if (now < startTime) {
          setTimeLeft({ type: 'starts', time: startTime - now });
        } else if (now < endTime) {
          setTimeLeft({ type: 'ends', time: endTime - now });
        } else {
          setTimeLeft({ type: 'expired', time: 0 });
        }
      };
      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [assessment]);

  useEffect(() => {
    if (id) {
      fetchAssessmentDetails();
      fetchStudentAttempts();
      const interval = setInterval(fetchStudentAttempts, 10000);
      return () => clearInterval(interval);
    }
  }, [id]);

  const fetchAssessmentDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/assessments/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setAssessment(data);
      if (data.startTime) {
        const localTime = new Date(data.startTime);
        const year = localTime.getFullYear();
        const month = String(localTime.getMonth() + 1).padStart(2, '0');
        const day = String(localTime.getDate()).padStart(2, '0');
        const hours = String(localTime.getHours()).padStart(2, '0');
        const minutes = String(localTime.getMinutes()).padStart(2, '0');
        setNewStartTime(`${year}-${month}-${day}T${hours}:${minutes}`);
      }
      setDuration(data.duration || 60);
      setEarlyStartBuffer(data.earlyStartBuffer || 5);
      setMaxTabSwitches(data.maxTabSwitches || 3);
      setAssessmentStatus(data.status || 'draft');
      setAllowedIPs(data.allowedIPs ? data.allowedIPs.join(', ') : '');
      setAllowedLanguages(data.allowedLanguages || ['python', 'cpp', 'java', 'c']);
      setShowKeyInsights(data.showKeyInsights || false);
      setShowAlgorithmSteps(data.showAlgorithmSteps || false);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchStudentAttempts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/assessments/${id}/attempts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleUpdateSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/assessments/${id}/update-time`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          startTime: newStartTime, 
          duration,
          earlyStartBuffer,
          maxTabSwitches,
          status: assessmentStatus,
          allowedIPs: allowedIPs.split(',').map(ip => ip.trim()).filter(ip => ip),
          allowedLanguages,
          showKeyInsights,
          showAlgorithmSteps
        })
      });
      fetchAssessmentDetails();
      setEditOpen(false);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleStudentAction = async (action, attemptId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/assessments/attempts/${attemptId}/${action}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      fetchStudentAttempts();
      setActionDialog({ open: false, type: '', student: null });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleMarkAllInProgressCompleted = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/assessments/${id}/mark-all-inprogress-completed`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchStudentAttempts();
      setMarkAllInProgressOpen(false);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleMarkAllInProgressResume = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/assessments/${id}/mark-all-inprogress-resume`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchStudentAttempts();
      setMarkAllResumeOpen(false);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleMarkAllCompletedResume = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/assessments/${id}/mark-all-completed-resume`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchStudentAttempts();
      setMarkAllCompletedResumeOpen(false);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDeleteAllAttempts = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/assessments/${id}/delete-all-attempts`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchStudentAttempts();
      setDeleteAllAttemptsOpen(false);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleMarkCompleted = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/assessments/${id}/update-time`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'completed' })
      });
      fetchAssessmentDetails();
      setMarkCompletedOpen(false);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const formatTimeLeft = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'NOT_STARTED': 'default',
      'IN_PROGRESS': 'primary',
      'INTERRUPTED': 'warning',
      'RESUME_ALLOWED': 'info',
      'COMPLETED': 'success',
      'AUTO_SUBMITTED': 'secondary',
      'TAB_SWITCH_VIOLATION': 'error',
      'TERMINATED': 'error'
    };
    return colors[status] || 'default';
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.studentEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.attemptStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const paginatedStudents = filteredStudents.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (!assessment) return <Typography>Loading...</Typography>;

  return (
    <MainCard>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, cursor: 'pointer' }} 
           onClick={() => navigate('/instructor/assessments')}>
        <IconArrowLeft />
        <Typography variant="h3" sx={{ fontWeight: 600 }}>
          Assessment Control Center
        </Typography>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
                {assessment.title}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip label={`${assessment.duration} min`} color="primary" size="small" />
                <Chip label={`${assessment.questions?.length || 0} questions`} color="secondary" size="small" />
                <Chip label={`Tab Limit: ${maxTabSwitches === -1 ? '∞' : maxTabSwitches}`} size="small" />
                {assessment.startTime && (
                  <Chip label={new Date(assessment.startTime).toLocaleString()} size="small" />
                )}
                <Chip label={assessment.status?.toUpperCase()} 
                      color={assessment.status === 'active' ? 'success' : 'default'} size="small" />
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {timeLeft && (
                <Chip 
                  label={
                    timeLeft.type === 'starts' ? `Starts in: ${formatTimeLeft(timeLeft.time)}` :
                    timeLeft.type === 'ends' ? `Ends in: ${formatTimeLeft(timeLeft.time)}` :
                    'Expired'
                  }
                  color={
                    timeLeft.type === 'starts' ? 'primary' :
                    timeLeft.type === 'ends' ? 'warning' :
                    'error'
                  }
                  sx={{ fontWeight: 600, fontSize: '0.9rem' }}
                />
              )}
              <Button variant="outlined" startIcon={<IconEye />}
                      onClick={() => navigate(`/instructor/assessments/${id}/view`)}>
                View
              </Button>
              <Button variant="outlined" startIcon={<IconEdit />} onClick={() => setEditOpen(true)}>
                Edit
              </Button>
              {timeLeft?.type === 'expired' && assessment.status !== 'completed' && (
                <Button variant="contained" color="success" onClick={() => setMarkCompletedOpen(true)}>
                  Mark Completed
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                Students ({filteredStudents.length})
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Status</InputLabel>
                  <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="NOT_STARTED">Not Started</MenuItem>
                    <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                    <MenuItem value="COMPLETED">Completed</MenuItem>
                    <MenuItem value="INTERRUPTED">Interrupted</MenuItem>
                  </Select>
                </FormControl>
                <TextField size="small" placeholder="Search..." value={searchTerm}
                           onChange={(e) => setSearchTerm(e.target.value)}
                           InputProps={{ startAdornment: <IconSearch size={18} /> }} />
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button variant="contained" size="small" color="warning"
                      onClick={() => setMarkAllInProgressOpen(true)}>
                Mark All In-Progress as Completed
              </Button>
              <Button variant="contained" size="small" color="success"
                      onClick={() => setMarkAllResumeOpen(true)}>
                Mark All In-Progress as Resume
              </Button>
              <Button variant="contained" size="small" color="secondary"
                      onClick={() => setMarkAllCompletedResumeOpen(true)}>
                Mark All Completed as Resume
              </Button>
              <Button variant="contained" size="small" color="error"
                      onClick={() => setDeleteAllAttemptsOpen(true)}>
                Delete All Attempts
              </Button>
            </Box>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Start Time</TableCell>
                  <TableCell>Time Used</TableCell>
                  <TableCell>Tab Switches</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">No students found</TableCell>
                  </TableRow>
                ) : (
                  paginatedStudents.map((student) => (
                    <TableRow key={student._id}>
                      <TableCell>{student.studentName || 'Unknown'}</TableCell>
                      <TableCell>{student.studentEmail || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip label={student.attemptStatus || 'NOT_STARTED'} 
                              color={getStatusColor(student.attemptStatus)} size="small" />
                      </TableCell>
                      <TableCell>
                        {student.startedAt ? new Date(student.startedAt).toLocaleTimeString() : '-'}
                      </TableCell>
                      <TableCell>
                        {student.timeUsedSeconds ? 
                          `${Math.floor(student.timeUsedSeconds / 60)}:${String(student.timeUsedSeconds % 60).padStart(2, '0')}` 
                          : '0:00'}
                      </TableCell>
                      <TableCell>
                        {student.tabSwitchCount || 0} / {maxTabSwitches === -1 ? '∞' : maxTabSwitches}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="Allow Resume">
                            <IconButton size="small" color="success"
                                        onClick={() => setActionDialog({ open: true, type: 'resume', student })}>
                              <IconPlayerPlay size={18} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Allow Retake">
                            <IconButton size="small" color="warning"
                                        onClick={() => setActionDialog({ open: true, type: 'retake', student })}>
                              <IconRefresh size={18} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Terminate">
                            <IconButton size="small" color="error"
                                        onClick={() => setActionDialog({ open: true, type: 'terminate', student })}>
                              <IconPlayerStop size={18} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination component="div" count={filteredStudents.length} page={page}
                           onPageChange={(e, newPage) => setPage(newPage)} rowsPerPage={rowsPerPage}
                           onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                           rowsPerPageOptions={[10, 20, 30]} />
        </CardContent>
      </Card>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Assessment Settings</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField fullWidth label="Duration (minutes)" type="number" value={duration}
                       onChange={(e) => setDuration(parseInt(e.target.value) || 0)} />
            <TextField fullWidth label="Start Time" type="datetime-local" value={newStartTime}
                       onChange={(e) => setNewStartTime(e.target.value)} InputLabelProps={{ shrink: true }} />
            <FormControl fullWidth>
              <InputLabel>Allow Late Start</InputLabel>
              <Select value={earlyStartBuffer} label="Allow Late Start"
                      onChange={(e) => setEarlyStartBuffer(e.target.value)}>
                <MenuItem value={0}>No late start allowed</MenuItem>
                {Array.from({ length: Math.floor(duration / 10) }, (_, i) => (i + 1) * 10).map(minutes => (
                  <MenuItem key={minutes} value={minutes}>{minutes} minutes after start</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Max Tab Switches</InputLabel>
              <Select value={maxTabSwitches} label="Max Tab Switches"
                      onChange={(e) => setMaxTabSwitches(e.target.value)}>
                <MenuItem value={-1}>Unlimited</MenuItem>
                {[0,1,2,3,4,5,6,7,8,9,10].map(n => <MenuItem key={n} value={n}>{n}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select value={assessmentStatus} label="Status"
                      onChange={(e) => setAssessmentStatus(e.target.value)}>
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="active">Active</MenuItem>
              </Select>
            </FormControl>
            <TextField fullWidth label="Allowed IP Addresses (comma separated)" 
                       placeholder="192.168.1.1, 10.0.0.1" value={allowedIPs}
                       onChange={(e) => setAllowedIPs(e.target.value)}
                       helperText="Leave empty to allow from any IP" multiline rows={2} />
            <FormControl fullWidth>
              <InputLabel>Allowed Languages</InputLabel>
              <Select multiple value={allowedLanguages} label="Allowed Languages"
                      onChange={(e) => setAllowedLanguages(e.target.value)}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => <Chip key={value} label={value.toUpperCase()} size="small" />)}
                        </Box>
                      )}>
                <MenuItem value="python">Python</MenuItem>
                <MenuItem value="cpp">C++</MenuItem>
                <MenuItem value="java">Java</MenuItem>
                <MenuItem value="c">C</MenuItem>
                <MenuItem value="javascript">JavaScript</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Show Key Insights</InputLabel>
              <Select value={showKeyInsights} label="Show Key Insights"
                      onChange={(e) => setShowKeyInsights(e.target.value)}>
                <MenuItem value={true}>Yes - Show to students</MenuItem>
                <MenuItem value={false}>No - Hide from students</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Show Algorithm Steps</InputLabel>
              <Select value={showAlgorithmSteps} label="Show Algorithm Steps"
                      onChange={(e) => setShowAlgorithmSteps(e.target.value)}>
                <MenuItem value={true}>Yes - Show to students</MenuItem>
                <MenuItem value={false}>No - Hide from students</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateSettings} variant="contained">Update</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={actionDialog.open} onClose={() => setActionDialog({ open: false, type: '', student: null })}>
        <DialogTitle>
          {actionDialog.type === 'resume' && 'Allow Resume'}
          {actionDialog.type === 'retake' && 'Allow Retake'}
          {actionDialog.type === 'terminate' && 'Terminate Attempt'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to {actionDialog.type} for {actionDialog.student?.studentName}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialog({ open: false, type: '', student: null })}>Cancel</Button>
          <Button onClick={() => handleStudentAction(actionDialog.type, actionDialog.student?._id)}
                  variant="contained" color={actionDialog.type === 'terminate' ? 'error' : 'primary'}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={markAllInProgressOpen} onClose={() => setMarkAllInProgressOpen(false)}>
        <DialogTitle>Mark All In-Progress as Completed</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to mark all IN_PROGRESS students as COMPLETED?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMarkAllInProgressOpen(false)}>Cancel</Button>
          <Button onClick={handleMarkAllInProgressCompleted} variant="contained" color="warning">Confirm</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={markAllResumeOpen} onClose={() => setMarkAllResumeOpen(false)}>
        <DialogTitle>Mark All In-Progress as Resume Allowed</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to mark all IN_PROGRESS students as RESUME_ALLOWED?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMarkAllResumeOpen(false)}>Cancel</Button>
          <Button onClick={handleMarkAllInProgressResume} variant="contained" color="success">Confirm</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={markAllCompletedResumeOpen} onClose={() => setMarkAllCompletedResumeOpen(false)}>
        <DialogTitle>Mark All Completed as Resume Allowed</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to mark all COMPLETED students as RESUME_ALLOWED?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMarkAllCompletedResumeOpen(false)}>Cancel</Button>
          <Button onClick={handleMarkAllCompletedResume} variant="contained" color="secondary">Confirm</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteAllAttemptsOpen} onClose={() => setDeleteAllAttemptsOpen(false)}>
        <DialogTitle>Delete All Attempts</DialogTitle>
        <DialogContent>
          <Typography color="error" fontWeight="bold" mb={1}>⚠️ WARNING: This action cannot be undone!</Typography>
          <Typography>Are you sure you want to delete ALL student attempts for this assessment?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteAllAttemptsOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteAllAttempts} variant="contained" color="error">Delete All</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={markCompletedOpen} onClose={() => setMarkCompletedOpen(false)}>
        <DialogTitle>Mark Assessment as Completed</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to mark this assessment as completed? This will prevent any further student attempts.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMarkCompletedOpen(false)}>Cancel</Button>
          <Button onClick={handleMarkCompleted} variant="contained" color="success">Mark Completed</Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
};

export default InstructorAssessmentDetails;
