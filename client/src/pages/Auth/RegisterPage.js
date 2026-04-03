import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container, Box, Typography, TextField, Button, Alert, Link,
  MenuItem, Stepper, Step, StepLabel, Paper, InputAdornment, IconButton, Chip
} from '@mui/material';
import { Visibility, VisibilityOff, School, Person, FamilyRestroom } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { schoolAPI } from '../../services/api';

const steps = ['Tipo de Conta', 'Dados Pessoais', 'Informações Específicas'];

const RegisterPage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [schools, setSchools] = useState([]);
  const [formData, setFormData] = useState({
    role: '',
    fullName: '',
    dateOfBirth: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    school: '',
    studentNumber: '',
    grade: '',
    teacherNumber: '',
    subjects: [],
    parentCode: '',
    childCode: '',
    activityPreferences: []
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const preferences = [
    'desporto', 'arte', 'leitura', 'jogos_ar_livre', 'musica',
    'culinaria', 'jardinagem', 'natureza', 'tabuleiros', 'tecnologia_criativa'
  ];

  const prefLabels = {
    desporto: 'Desporto', arte: 'Arte', leitura: 'Leitura', jogos_ar_livre: 'Jogos ao Ar Livre',
    musica: 'Música', culinaria: 'Culinária', jardinagem: 'Jardinagem', natureza: 'Natureza',
    tabuleiros: 'Jogos de Tabuleiro', tecnologia_criativa: 'Tecnologia Criativa'
  };

  useEffect(() => {
    schoolAPI.getAll().then(res => {
      if (res.data.success) setSchools(res.data.data);
    }).catch(() => {});
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePrefToggle = (pref) => {
    setFormData(prev => ({
      ...prev,
      activityPreferences: prev.activityPreferences.includes(pref)
        ? prev.activityPreferences.filter(p => p !== pref)
        : [...prev.activityPreferences, pref]
    }));
  };

  const validateStep = () => {
    if (activeStep === 0 && !formData.role) {
      setError('Selecione o tipo de conta');
      return false;
    }
    if (activeStep === 1) {
      if (!formData.fullName || !formData.dateOfBirth || !formData.email || !formData.password) {
        setError('Preencha todos os campos obrigatórios');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('As senhas não coincidem');
        return false;
      }
      if (formData.password.length < 6) {
        setError('A senha deve ter pelo menos 6 caracteres');
        return false;
      }
    }
    setError('');
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
    setError('');
  };

  const handleSubmit = async () => {
    if (formData.role === 'student' && !formData.activityPreferences.length) {
      setError('Selecione pelo menos uma preferência de atividade');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const { confirmPassword, childCode, ...submitData } = formData;
      await register(submitData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Erro ao registar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default'
      }}
    >
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 4,
          px: 3,
          textAlign: 'center',
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24
        }}
      >
        <Typography variant="h5" fontWeight={800}>Criar Conta</Typography>
        <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
          Junte-se ao OFFOUT
        </Typography>
      </Box>

      <Container maxWidth="sm" sx={{ py: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map(label => (
            <Step key={label}><StepLabel>{label}</StepLabel></Step>
          ))}
        </Stepper>

        <Paper sx={{ p: 3, borderRadius: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {/* Step 0: Role Selection */}
          {activeStep === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom fontWeight={600}>Eu sou...</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                {[
                  { value: 'student', label: 'Aluno(a) / Estudante', icon: <Person sx={{ fontSize: 32 }} />, desc: '10-18 anos' },
                  { value: 'teacher', label: 'Professor(a)', icon: <School sx={{ fontSize: 32 }} />, desc: 'Ensino 2.º/3.º ciclo e secundário' },
                  { value: 'parent', label: 'Pai/Mãe', icon: <FamilyRestroom sx={{ fontSize: 32 }} />, desc: 'Vincular-se ao filho(a)' }
                ].map(role => (
                  <Paper
                    key={role.value}
                    onClick={() => setFormData(prev => ({ ...prev, role: role.value }))}
                    sx={{
                      p: 2,
                      cursor: 'pointer',
                      border: '2px solid',
                      borderColor: formData.role === role.value ? 'primary.main' : 'grey.200',
                      borderRadius: 3,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      bgcolor: formData.role === role.value ? 'primary.light10' : 'transparent',
                      transition: 'all 0.2s'
                    }}
                    elevation={0}
                  >
                    <Box sx={{ color: 'primary.main' }}>{role.icon}</Box>
                    <Box>
                      <Typography fontWeight={600}>{role.label}</Typography>
                      <Typography variant="caption" color="text.secondary">{role.desc}</Typography>
                    </Box>
                  </Paper>
                ))}
              </Box>
            </Box>
          )}

          {/* Step 1: Personal Data */}
          {activeStep === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom fontWeight={600}>Dados Pessoais</Typography>
              <TextField fullWidth label="Nome Completo" name="fullName" value={formData.fullName} onChange={handleChange} required sx={{ mb: 2 }} />
              <TextField fullWidth label="Data de Nascimento" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} required sx={{ mb: 2 }} InputLabelProps={{ shrink: true }} />
              <TextField fullWidth label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required sx={{ mb: 2 }} />
              <TextField fullWidth label="Senha" name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleChange} required sx={{ mb: 2 }} InputProps={{ endAdornment: (<InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)} edge="end">{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>) }} />
              <TextField fullWidth label="Confirmar Senha" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required sx={{ mb: 2 }} />
              <TextField fullWidth label="Telefone (opcional)" name="phone" value={formData.phone} onChange={handleChange} sx={{ mb: 2 }} />
            </Box>
          )}

          {/* Step 2: Role-specific Info */}
          {activeStep === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                {formData.role === 'student' ? 'Dados do Aluno' : formData.role === 'teacher' ? 'Dados do Professor' : 'Vincular ao Filho(a)'}
              </Typography>

              {(formData.role === 'student' || formData.role === 'teacher') && (
                <TextField
                  fullWidth
                  select
                  label={schools.length > 0 ? "Escola" : "Escola (a carregar...)"}
                  name="school"
                  value={formData.school}
                  onChange={handleChange}
                  sx={{ mb: 2 }}
                  helperText={schools.length === 0 ? "Pode registar sem escola e adicionar depois" : "Selecione a sua escola"}
                >
                  {schools.map(s => <MenuItem key={s._id || s.code} value={s.code}>{s.name}</MenuItem>)}
                </TextField>
              )}

              {formData.role === 'student' && (
                <>
                  <TextField fullWidth label="Número de Aluno (opcional)" name="studentNumber" value={formData.studentNumber} onChange={handleChange} sx={{ mb: 2 }} />
                  <TextField fullWidth select label="Ano Escolar" name="grade" value={formData.grade} onChange={handleChange} required sx={{ mb: 2 }}>
                    {[5,6,7,8,9,10,11,12].map(g => <MenuItem key={g} value={String(g)}>{g}.º ano</MenuItem>)}
                  </TextField>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1, mt: 2, fontWeight: 600 }}>
                    Preferências de Atividades
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {preferences.map(pref => (
                      <Chip
                        key={pref}
                        label={prefLabels[pref]}
                        onClick={() => handlePrefToggle(pref)}
                        color={formData.activityPreferences.includes(pref) ? 'primary' : 'default'}
                        variant={formData.activityPreferences.includes(pref) ? 'filled' : 'outlined'}
                      />
                    ))}
                  </Box>
                </>
              )}

              {formData.role === 'teacher' && (
                <TextField fullWidth label="Número de Professor (opcional)" name="teacherNumber" value={formData.teacherNumber} onChange={handleChange} sx={{ mb: 2 }} />
              )}

              {formData.role === 'parent' && (
                <TextField fullWidth label="Código do Filho(a) (apenas para 10-13 anos)" name="parentCode" value={formData.parentCode} onChange={handleChange} sx={{ mb: 2 }} helperText="Alunos de 14+ anos são autónomos e não precisam de supervisão parental" />
              )}
            </Box>
          )}

          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button onClick={activeStep === 0 ? () => navigate('/login') : handleBack}>
              {activeStep === 0 ? 'Voltar' : 'Anterior'}
            </Button>
            {activeStep < steps.length - 1 ? (
              <Button variant="contained" onClick={handleNext}>Seguinte</Button>
            ) : (
              <Button variant="contained" onClick={handleSubmit} disabled={loading}>
                {loading ? 'A registar...' : 'Registar'}
              </Button>
            )}
          </Box>

          <Typography variant="body2" textAlign="center" sx={{ mt: 2 }}>
            Já tem conta?{' '}
            <Link component={RouterLink} to="/login" underline="hover" fontWeight={600}>Entrar</Link>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default RegisterPage;
