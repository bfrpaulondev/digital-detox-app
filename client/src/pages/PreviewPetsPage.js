import React, { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import PetAnimation from '../components/common/PetAnimation';

const speciesList = [
  { key: 'tartaruga', name: 'Tartaruga 🐢' },
  { key: 'gato', name: 'Gato 🐱' },
  { key: 'cao', name: 'Cão 🐶' },
  { key: 'passaro', name: 'Pássaro 🐦' }
];

const stages = [
  { stage: 1, label: 'Ovo 🥚' },
  { stage: 2, label: 'Bebé 🐣' },
  { stage: 3, label: 'Jovem 🐾' },
  { stage: 4, label: 'Adulto 👑' }
];

const moods = ['feliz', 'triste', 'com_fome', 'energico', 'doente', 'sonolento', 'brincalhao'];
const interactions = [null, 'feed', 'pet', 'play'];
const interactionLabels = { null: 'Normal', feed: 'Comendo 🍖', pet: 'Acariciar ❤️', play: 'Brincando ⭐' };

const PreviewPetsPage = () => {
  const [showInteractions, setShowInteractions] = useState(false);
  const [activeInteraction, setActiveInteraction] = useState(null);
  const [activeMood, setActiveMood] = useState('feliz');

  return (
    <Box sx={{
      minHeight: '100vh', bgcolor: '#F5F5F5', p: 3,
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
    }}>
      <Typography variant="h4" fontWeight={800} textAlign="center" sx={{ mb: 1 }}>
        🎨 Preview dos Bichinhos
      </Typography>
      <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 3 }}>
        4 espécies × 4 fases de evolução — {showInteractions ? 'Com interações' : 'Mood: ' + activeMood}
      </Typography>

      {/* Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        <Button
          variant={showInteractions ? 'outlined' : 'contained'}
          size="small"
          onClick={() => setShowInteractions(false)}
          sx={{ borderRadius: 2 }}
        >
          Por Mood
        </Button>
        <Button
          variant={showInteractions ? 'contained' : 'outlined'}
          size="small"
          onClick={() => setShowInteractions(true)}
          sx={{ borderRadius: 2 }}
        >
          Por Interação
        </Button>
      </Box>

      {!showInteractions ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5, mb: 3, flexWrap: 'wrap' }}>
          {moods.map(m => (
            <Button
              key={m}
              variant={activeMood === m ? 'contained' : 'text'}
              size="small"
              onClick={() => setActiveMood(m)}
              sx={{ borderRadius: 2, fontSize: 11, minWidth: 70 }}
            >
              {m === 'feliz' ? '😊 Feliz' : m === 'triste' ? '😢 Triste' : m === 'com_fome' ? '😫 Fome' :
                m === 'energico' ? '⚡ Energia' : m === 'doente' ? '🤒 Doente' :
                m === 'sonolento' ? '😴 Sono' : '😄 Brinca'}
            </Button>
          ))}
        </Box>
      ) : (
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5, mb: 3, flexWrap: 'wrap' }}>
          {interactions.map(inter => (
            <Button
              key={String(inter)}
              variant={activeInteraction === inter ? 'contained' : 'text'}
              size="small"
              onClick={() => setActiveInteraction(inter)}
              sx={{ borderRadius: 2, fontSize: 11, minWidth: 70 }}
            >
              {interactionLabels[inter]}
            </Button>
          ))}
        </Box>
      )}

      {/* Grid: 4 columns (species) × 4 rows (stages) */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 2,
        maxWidth: 900,
        mx: 'auto'
      }}>
        {/* Header row */}
        {speciesList.map(sp => (
          <Box key={sp.key} sx={{ textAlign: 'center', p: 1 }}>
            <Typography variant="subtitle1" fontWeight={700}>{sp.name}</Typography>
          </Box>
        ))}

        {/* Data rows */}
        {stages.map(st => (
          <React.Fragment key={st.stage}>
            {speciesList.map(sp => (
              <Box
                key={`${sp.key}-${st.stage}`}
                sx={{
                  bgcolor: 'white',
                  borderRadius: 3,
                  p: 1.5,
                  textAlign: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  border: '1px solid #E0E0E0',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
                  {st.label}
                </Typography>
                <PetAnimation
                  species={sp.key}
                  mood={showInteractions ? 'feliz' : activeMood}
                  evolutionStage={st.stage}
                  size={140}
                  interaction={showInteractions ? activeInteraction : null}
                />
              </Box>
            ))}
          </React.Fragment>
        ))}
      </Box>

      {/* Stage labels column */}
      <Box sx={{ maxWidth: 900, mx: 'auto', mt: 1 }}>
        <Typography variant="caption" color="text.secondary" textAlign="center" display="block">
          ← Ovo (Nv.1) | Bebé (Nv.5) | Jovem (Nv.10) | Adulto (Nv.15) →
        </Typography>
      </Box>
    </Box>
  );
};

export default PreviewPetsPage;
