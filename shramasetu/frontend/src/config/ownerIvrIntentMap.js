export const OWNER_INTENTS = {
  HIRE_LABOUR: 'HIRE_LABOUR',
  MANAGE_JOBS: 'MANAGE_JOBS',
  RENTALS: 'RENTALS',
  ATTENDANCE: 'ATTENDANCE',
  WAGES: 'WAGES',
  INSURANCE: 'INSURANCE',
  FEEDBACK: 'FEEDBACK',
  SUPPORT: 'SUPPORT',
  REPEAT: 'REPEAT'
};

export const ownerIvrIntentMap = [
  {
    intent: OWNER_INTENTS.HIRE_LABOUR,
    keywords: {
      en: ['post new job', 'hire 15 workers', 'coffee harvesting work', 'set wage 700 rupees', 'submit hiring request', '1', 'hire labour'],
      hi: ['1', '१', 'काम दो', 'नया काम'],
      kn: ['1', '೧', 'ಕೆಲಸ ಕೊಡಿ'],
      ta: ['1'],
      te: ['1'],
      ml: ['1'],
      mr: ['1'],
      bn: ['1'],
      gu: ['1'],
      pa: ['1']
    }
  },
  {
    intent: OWNER_INTENTS.MANAGE_JOBS,
    keywords: {
      en: ['open manage jobs', 'show active jobs', 'delete old job', 'edit coffee harvesting job', 'manage jobs', '2'],
      hi: ['2', '२', 'काम का प्रबंधन'],
      kn: ['2', '೨'],
      ta: ['2'],
      te: ['2'],
      ml: ['2'],
      mr: ['2'],
      bn: ['2'],
      gu: ['2'],
      pa: ['2']
    }
  },
  {
    intent: OWNER_INTENTS.RENTALS,
    keywords: {
      en: ['open rental marketplace', 'rent harvesting machine', 'show available equipment', 'rental', '3'],
      hi: ['3', '३', 'किराया'],
      kn: ['3', '೩', 'ಬಾಡಿಗೆ'],
      ta: ['3'],
      te: ['3'],
      ml: ['3'],
      mr: ['3'],
      bn: ['3'],
      gu: ['3'],
      pa: ['3']
    }
  },
  {
    intent: OWNER_INTENTS.ATTENDANCE,
    keywords: {
      en: ['open attendance management', 'mark worker present', 'show attendance report', 'attendance', '4'],
      hi: ['4', '४', 'हाजिरी', 'उपस्थिति'],
      kn: ['4', '೪', 'ಹಾಜರಾತಿ'],
      ta: ['4'],
      te: ['4'],
      ml: ['4'],
      mr: ['4'],
      bn: ['4'],
      gu: ['4'],
      pa: ['4']
    }
  },
  {
    intent: OWNER_INTENTS.WAGES,
    keywords: {
      en: ['open wages management', 'show payment details', 'release salary', 'wages', '5'],
      hi: ['5', '५', 'मजदूरी', 'पैसा', 'वेतन'],
      kn: ['5', '೫', 'ಸಂಬಳ', 'ವೇತನ'],
      ta: ['5'],
      te: ['5'],
      ml: ['5'],
      mr: ['5'],
      bn: ['5'],
      gu: ['5'],
      pa: ['5']
    }
  },
  {
    intent: OWNER_INTENTS.INSURANCE,
    keywords: {
      en: ['open health insurance', 'show insurance plans', 'insurance', '6'],
      hi: ['6', '६', 'बीमा'],
      kn: ['6', '೬', 'ವಿಮೆ'],
      ta: ['6'],
      te: ['6'],
      ml: ['6'],
      mr: ['6'],
      bn: ['6'],
      gu: ['6'],
      pa: ['6']
    }
  },
  {
    intent: OWNER_INTENTS.FEEDBACK,
    keywords: {
      en: ['rate worker', 'open feedback', 'feedback', 'rating', '7'],
      hi: ['7', '७', 'फीडबैक', 'रेटिंग'],
      kn: ['7', '೭', 'ಪ್ರತಿಕ್ರಿಯೆ'],
      ta: ['7'],
      te: ['7'],
      ml: ['7'],
      mr: ['7'],
      bn: ['7'],
      gu: ['7'],
      pa: ['7']
    }
  },
  {
    intent: OWNER_INTENTS.SUPPORT,
    keywords: {
      en: ['how to post a job', 'explain wage management', 'support', 'chat support', 'help', '8'],
      hi: ['8', '८', 'सहायता', 'मदद'],
      kn: ['8', '೮', 'ಸಹಾಯ'],
      ta: ['8'],
      te: ['8'],
      ml: ['8'],
      mr: ['8'],
      bn: ['8'],
      gu: ['8'],
      pa: ['8']
    }
  },
  {
    intent: OWNER_INTENTS.REPEAT,
    keywords: {
      en: ['repeat', 'repeat menu', 'say again', 'once more', '0', 'zero'],
      hi: ['दोहराएं', 'फिर से बोले', '०', '0', 'शून्य'],
      kn: ['ಪುನರಾವರ್ತಿಸಿ', 'ಮತ್ತೊಮ್ಮೆ ಹೇಳಿ', '೦', '0', 'ಶೂನ್ಯ'],
      ta: ['மீண்டும்', 'திரும்பச் சொல்', '0'],
      te: ['మళ్లీ చెప్పండి', 'పునరావృతం', '0'],
      ml: ['ആവർത്തിക്കുക', 'വീണ്ടും പറയുക', '0'],
      mr: ['पुन्हा सांगा', 'दोन्ही', '0'],
      bn: ['পুনরাবৃত্তি', 'আবার বলুন', '0'],
      gu: ['પુનરાવર્તન', 'ફરીથી બોલો', '0'],
      pa: ['ਦੁਹਰਾਓ', 'ਦੁਬਾਰਾ ਬੋਲੋ', '0']
    }
  }
];
