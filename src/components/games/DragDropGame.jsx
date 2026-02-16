import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { DragIndicator, CheckCircle, Refresh, Close } from '@mui/icons-material';

const DragDropGame = ({ level, onComplete }) => {
  const data = JSON.parse(level.correctAnswer);
  const [items, setItems] = useState([]);
  const [zones, setZones] = useState({});
  const [draggedItem, setDraggedItem] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [hoverZone, setHoverZone] = useState(null);

  useEffect(() => {
    const shuffled = [...data.items].sort(() => Math.random() - 0.5);
    setItems(shuffled.map(item => ({ name: item, placed: false })));
    const zoneObj = {};
    data.zones.forEach(zone => { zoneObj[zone] = null; });
    setZones(zoneObj);
  }, [level]);

  const handleDragStart = (e, item) => {
    e.dataTransfer.setData('text/plain', item);
    setDraggedItem(item);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, zone) => {
    e.preventDefault();
    e.stopPropagation();
    setHoverZone(null);
    
    const item = e.dataTransfer.getData('text/plain');
    if (!item || zones[zone]) return;
    
    const newZones = { ...zones, [zone]: item };
    setZones(newZones);
    setItems(prev => prev.map(i => i.name === item ? { ...i, placed: true } : i));
    setDraggedItem(null);
    
    checkCompletion(newZones);
  };

  const handleRemoveFromZone = (zone) => {
    if (completed) return;
    const item = zones[zone];
    setZones(prev => ({ ...prev, [zone]: null }));
    setItems(prev => prev.map(i => i.name === item ? { ...i, placed: false } : i));
  };

  const handleReset = () => {
    const shuffled = [...data.items].sort(() => Math.random() - 0.5);
    setItems(shuffled.map(item => ({ name: item, placed: false })));
    const zoneObj = {};
    data.zones.forEach(zone => { zoneObj[zone] = null; });
    setZones(zoneObj);
    setCompleted(false);
  };

  const checkCompletion = (currentZones) => {
    const allPlaced = Object.values(currentZones).every(v => v !== null);
    if (!allPlaced) return;
    
    const correct = Object.entries(currentZones).every(([zone, item]) => 
      data.correct[item] === zone
    );
    
    setCompleted(true);
    setTimeout(() => onComplete(correct), 500);
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography sx={{ color: '#6a0dad', fontWeight: 600 }}>
          Drag items from left to matching zones on right
        </Typography>
        <IconButton 
          onClick={handleReset}
          sx={{ 
            bgcolor: '#f3e8ff', 
            color: '#6a0dad',
            '&:hover': { bgcolor: '#e9d5ff' }
          }}
        >
          <Refresh />
        </IconButton>
      </Box>

      <Box sx={{ display: 'flex', gap: 3, width: '100%' }}>
        {/* Left Panel - Draggable Items */}
        <Box sx={{ 
          flex: '0 0 48%', 
          p: 3, 
          bgcolor: '#faf5ff', 
          borderRadius: 2, 
          border: '2px solid #c77dff',
          minHeight: 400,
          maxHeight: 600,
          overflowY: 'auto'
        }}>
          <Typography sx={{ fontWeight: 700, color: '#6a0dad', fontSize: '1.125rem', mb: 2 }}>
            Items to Match
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 1.5 }}>
            {items.filter(i => !i.placed).length === 0 ? (
              <Typography sx={{ color: '#9d4edd', fontStyle: 'italic', textAlign: 'center', mt: 4, gridColumn: '1 / -1' }}>
                All items placed! ✓
              </Typography>
            ) : (
              items.filter(i => !i.placed).map(item => (
                <Box
                  key={item.name}
                  draggable={!completed}
                  onDragStart={(e) => handleDragStart(e, item.name)}
                  sx={{
                    aspectRatio: '1/1',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 0.5,
                    p: 1,
                    bgcolor: 'white',
                    border: '2px solid #6a0dad',
                    borderRadius: 2,
                    cursor: completed ? 'not-allowed' : 'grab',
                    fontWeight: 600,
                    color: '#6a0dad',
                    boxShadow: '0 2px 8px rgba(106,13,173,0.2)',
                    fontSize: '0.75rem',
                    textAlign: 'center',
                    wordBreak: 'break-word',
                    '&:active': { cursor: 'grabbing' },
                    '&:hover': completed ? {} : { 
                      bgcolor: '#f3e8ff',
                      boxShadow: '0 4px 12px rgba(106,13,173,0.3)',
                      transform: 'scale(1.05)'
                    },
                    transition: 'all 0.2s'
                  }}
                >
                  <DragIndicator sx={{ fontSize: '1rem' }} />
                  {item.name}
                </Box>
              ))
            )}
          </Box>
        </Box>

        {/* Right Panel - Drop Zones */}
        <Box sx={{ 
          flex: '0 0 48%', 
          p: 3, 
          bgcolor: '#f3e8ff', 
          borderRadius: 2, 
          border: '2px solid #c77dff',
          minHeight: 400,
          maxHeight: 600,
          overflowY: 'auto'
        }}>
          <Typography sx={{ fontWeight: 700, color: '#6a0dad', fontSize: '1.125rem', mb: 2 }}>
            Drop Zones
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 1.5 }}>
            {data.zones.map(zone => {
              const hasItem = zones[zone] !== null;
              const isCorrect = hasItem && completed && data.correct[zones[zone]] === zone;
              const isWrong = hasItem && completed && data.correct[zones[zone]] !== zone;
              const isHovering = hoverZone === zone && !hasItem;
              
              return (
                <Box
                  key={zone}
                  onDragOver={handleDragOver}
                  onDragEnter={() => !hasItem && setHoverZone(zone)}
                  onDragLeave={() => setHoverZone(null)}
                  onDrop={(e) => handleDrop(e, zone)}
                  sx={{
                    aspectRatio: '1/1',
                    p: 1,
                    border: '3px dashed',
                    borderColor: isCorrect ? '#10b981' : isWrong ? '#ef4444' : hasItem ? '#6a0dad' : isHovering ? '#c77dff' : '#d1d5db',
                    borderRadius: 2,
                    bgcolor: isCorrect ? '#f0fdf4' : isWrong ? '#fee2e2' : hasItem ? 'white' : isHovering ? 'white' : 'transparent',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 0.5,
                    transition: 'all 0.3s',
                    transform: isHovering ? 'scale(1.05)' : 'scale(1)',
                    boxShadow: isHovering ? '0 8px 20px rgba(106,13,173,0.3)' : 'none',
                    position: 'relative'
                  }}
                >
                  <Typography sx={{ fontWeight: 700, color: '#6a0dad', fontSize: '0.75rem', textAlign: 'center', wordBreak: 'break-word' }}>
                    {zone}
                  </Typography>
                  {hasItem ? (
                    <Box sx={{ 
                      px: 1, 
                      py: 0.5, 
                      bgcolor: isCorrect ? '#10b981' : isWrong ? '#ef4444' : '#6a0dad', 
                      color: 'white', 
                      borderRadius: 1, 
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      fontSize: '0.7rem',
                      textAlign: 'center',
                      wordBreak: 'break-word',
                      maxWidth: '100%',
                      position: 'relative'
                    }}>
                      {zones[zone]}
                      {isCorrect && <CheckCircle sx={{ fontSize: '0.9rem' }} />}
                      {!completed && (
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveFromZone(zone)}
                          sx={{
                            position: 'absolute',
                            top: -8,
                            right: -8,
                            p: 0.3,
                            bgcolor: 'rgba(0,0,0,0.5)',
                            color: 'white',
                            '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                          }}
                        >
                          <Close sx={{ fontSize: '0.8rem' }} />
                        </IconButton>
                      )}
                    </Box>
                  ) : (
                    <Typography sx={{ color: '#9d4edd', fontSize: '0.65rem', fontStyle: 'italic' }}>
                      Drop here
                    </Typography>
                  )}
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default DragDropGame;
