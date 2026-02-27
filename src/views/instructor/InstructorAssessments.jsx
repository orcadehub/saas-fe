import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent,
  Chip,
  Tabs,
  Tab,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { IconPlus, IconClock, IconChecks, IconDownload, IconEye, IconTrash } from '@tabler/icons-react';
import MainCard from 'ui-component/cards/MainCard';

const API_BASE_URL = import.meta.env.DEV ? 'http://localhost:4000/api' : 'https://backend.orcode.in/api';

const InstructorAssessments = () => {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [downloadingAssessment, setDownloadingAssessment] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assessmentToDelete, setAssessmentToDelete] = useState(null);

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/assessments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setAssessments(data);
    } catch (error) {
      console.error('Error fetching assessments:', error);
    }
  };

  const handleDownloadResults = async (e, assessmentId, assessmentTitle) => {
    e.stopPropagation();
    setDownloadingAssessment(assessmentId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/assessments/${assessmentId}/results`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${assessmentTitle}_results.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading results:', error);
    } finally {
      setDownloadingAssessment(null);
    }
  };

  const handleDeleteAssessment = (e, assessmentId) => {
    e.stopPropagation();
    setAssessmentToDelete(assessmentId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/assessments/${assessmentToDelete}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchAssessments();
    } catch (error) {
      console.error('Error deleting assessment:', error);
    } finally {
      setDeleteDialogOpen(false);
      setAssessmentToDelete(null);
    }
  };

  const availableAssessments = assessments.filter(a => a.status === 'active' || a.status === 'draft');
  const completedAssessments = assessments.filter(a => a.status === 'completed' || a.status === 'expired');

  const renderAssessmentCards = (assessmentList) => (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: 'repeat(1, 1fr)',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)'
        },
        gap: 3
      }}
    >
      {assessmentList.length > 0 ? (
        assessmentList.map((assessment) => (
          <Card
            key={assessment._id}
            sx={{ 
              cursor: 'pointer',
              transition: 'all 0.3s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4
              },
              display: 'flex',
              flexDirection: 'column',
              height: '100%'
            }}
            onClick={() => navigate(`/instructor/assessments/${assessment._id}`)}
          >
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                  <Typography variant="h4" sx={{ fontWeight: 600, flex: 1 }}>
                    {assessment.title}
                  </Typography>
                  {assessment.status === 'active' && (
                    <Chip label="Active" color="success" size="small" icon={<IconChecks size={16} />} />
                  )}
                  {assessment.status === 'draft' && (
                    <Chip label="Draft" size="small" />
                  )}
                </Box>
                
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  <Chip 
                    icon={<IconClock size={16} />}
                    label={`${assessment.duration || 0} min`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                  <Chip 
                    label={`${assessment.questions?.length || 0} questions`}
                    size="small"
                    color="secondary"
                    variant="outlined"
                  />
                </Box>

                {assessment.batches && assessment.batches.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                      Batches:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {assessment.batches.map((batch) => (
                        <Chip key={batch._id} label={batch.name} size="small" />
                      ))}
                    </Box>
                  </Box>
                )}

                {assessment.startTime && (
                  <Box sx={{ mb: 2 }}>
                    <Chip 
                      label={new Date(assessment.startTime).toLocaleString()}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                )}

                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<IconEye size={16} />}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/instructor/assessments/${assessment._id}/view`);
                    }}
                    sx={{ flex: 1 }}
                  >
                    View
                  </Button>
                  {(assessment.status === 'completed' || assessment.status === 'expired') && (
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<IconDownload size={16} />}
                      onClick={(e) => handleDownloadResults(e, assessment._id, assessment.title)}
                      disabled={downloadingAssessment === assessment._id}
                      sx={{ flex: 1 }}
                    >
                      Results
                    </Button>
                  )}
                  <IconButton
                    size="small"
                    color="error"
                    onClick={(e) => handleDeleteAssessment(e, assessment._id)}
                  >
                    <IconTrash size={18} />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
        ))
      ) : (
        <Box sx={{ gridColumn: '1 / -1' }}>
          <MainCard>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                {tabValue === 0 ? 'No available assessments' : 'No completed assessments'}
              </Typography>
            </Box>
          </MainCard>
        </Box>
      )}
    </Box>
  );

  return (
    <MainCard>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 600, mb: 0.5 }}>
            Assessment Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create and manage assessments for your students
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<IconPlus />}
          onClick={() => navigate('/instructor/assessments/create')}
        >
          Create Assessment
        </Button>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label={`Available (${availableAssessments.length})`} />
          <Tab label={`Completed (${completedAssessments.length})`} />
        </Tabs>
      </Box>
      
      {tabValue === 0 && renderAssessmentCards(availableAssessments)}
      {tabValue === 1 && renderAssessmentCards(completedAssessments)}

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Assessment</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this assessment? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
};

export default InstructorAssessments;
