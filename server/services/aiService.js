const OpenAI = require('openai');

let openai;

function getOpenAIClient() {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }
  return openai;
}

/**
 * Validate if a photo contains faces/selfies
 * Returns analysis with hasFace, isSelfie, description, confidence
 */
async function validatePhoto(imageBase64) {
  try {
    const client = getOpenAIClient();
    
    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `Você é um sistema de validação de fotos para uma aplicação infantil de combate ao vício digital. 
Sua tarefa é analisar fotos enviadas por crianças e adolescentes como prova de atividades offline.

REGRAS CRÍTICAS:
1. Detectar se a foto contém rostos humanos
2. Identificar se é uma selfie
3. Descrever o que aparece na foto
4. Avaliar se a foto é uma prova válida de uma atividade offline

Responda APENAS em formato JSON válido com os seguintes campos:
{
  "hasFace": boolean,
  "isSelfie": boolean,
  "description": "string - descrição detalhada em português do que aparece na foto",
  "confidence": number (0-100),
  "isValidActivityProof": boolean,
  "feedback": "string - feedback em português sobre a foto",
  "detectedActivity": "string - qual atividade parece ser (null se não identificar)"
}

Seja sempre rigoroso na detecção de rostos. Quando houver rosto, isSelfie=true geralmente quando a pessoa está claramente a segurar o telemóvel.`
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analise esta foto e determine se contém rostos humanos, se é uma selfie, e se é uma prova válida de atividade offline.'
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`
              }
            }
          ]
        }
      ],
      max_tokens: 500,
      temperature: 0.3
    });

    const content = response.choices[0].message.content;
    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error('Failed to parse AI response');
  } catch (error) {
    console.error('AI Photo Validation Error:', error);
    return {
      hasFace: false,
      isSelfie: false,
      description: 'Erro na análise da foto',
      confidence: 0,
      isValidActivityProof: false,
      feedback: 'Não foi possível analisar a foto. Tente novamente.',
      detectedActivity: null
    };
  }
}

/**
 * Generate personalized activity suggestions based on user preferences
 */
async function generateActivitySuggestions(preferences, context = {}) {
  try {
    const client = getOpenAIClient();
    
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Você é um assistente que sugere atividades offline criativas e divertidas para crianças e adolescentes (10-18 anos).
O objetivo é combater o vício digital incentivando atividades offline.

Regras:
- Sugestões devem ser apropriadas para a idade
- Atividades devem ser divertidas e envolventes
- Considere o contexto (tempo disponível, localização)
- Responda em português europeu
- Inclua uma breve descrição de cada atividade

Responda em formato JSON:
{
  "suggestions": [
    {
      "title": "string",
      "description": "string",
      "category": "string",
      "estimatedMinutes": number,
      "pointsValue": number,
      "requiresPhoto": boolean
    }
  ]
}`
        },
        {
          role: 'user',
          content: `Gere 5 sugestões de atividades offline personalizadas.
Preferências: ${preferences.join(', ')}
Idade: ${context.age || '10-18'}
Tempo disponível: ${context.availableTime || '30-60 minutos'}
Local: ${context.location || 'casa'}`
        }
      ],
      max_tokens: 1000,
      temperature: 0.8
    });

    const content = response.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error('Failed to parse AI response');
  } catch (error) {
    console.error('AI Suggestion Error:', error);
    // Return fallback suggestions
    return {
      suggestions: [
        { title: 'Passeio ao ar livre', description: 'Faça um passeio de 30 minutos pelo bairro', category: 'natureza', estimatedMinutes: 30, pointsValue: 15, requiresPhoto: true },
        { title: 'Leitura', description: 'Leia um livro ou revista por 20 minutos', category: 'leitura', estimatedMinutes: 20, pointsValue: 10, requiresPhoto: true },
        { title: 'Desenho', description: 'Desenhe algo que veja à sua volta', category: 'arte', estimatedMinutes: 25, pointsValue: 12, requiresPhoto: true },
        { title: 'Arrumar o quarto', description: 'Organize e arrume o seu quarto', category: 'domestica', estimatedMinutes: 30, pointsValue: 15, requiresPhoto: true },
        { title: 'Jogar à bola', description: 'Jogue futebol ou outro desporto com amigos', category: 'desporto', estimatedMinutes: 45, pointsValue: 20, requiresPhoto: true }
      ]
    };
  }
}

/**
 * Validate an activity description/task using AI
 */
async function validateActivity(activityData) {
  try {
    const client = getOpenAIClient();
    
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Você é um assistente educacional que valida atividades para uma app de combate ao vício digital.
Valide se a atividade proposta é adequada, segura e promotora de socialização/offline.

Responda em JSON:
{
  "isValid": boolean,
  "score": number (1-10),
  "feedback": "string - feedback construtivo em português",
  "suggestedPoints": number,
  "suggestedCategory": "string"
}`
        },
        {
          role: 'user',
          content: `Valide esta atividade: "${activityData.title}" - ${activityData.description || ''}\nCategoria: ${activityData.category || 'geral'}`
        }
      ],
      max_tokens: 300,
      temperature: 0.3
    });

    const content = response.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error('Failed to parse AI response');
  } catch (error) {
    console.error('AI Activity Validation Error:', error);
    return {
      isValid: true,
      score: 5,
      feedback: 'Atividade registada com sucesso.',
      suggestedPoints: 10,
      suggestedCategory: activityData.category || 'geral'
    };
  }
}

module.exports = {
  validatePhoto,
  generateActivitySuggestions,
  validateActivity
};
