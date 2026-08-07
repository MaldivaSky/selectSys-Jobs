export interface JobVacancy {
  id: string;
  title: string;
  titleJp: string;
  province: 'aichi' | 'shizuoka' | 'mie' | 'gunma' | 'kanagawa';
  provinceName: string;
  city: string;
  industry: string;
  salaryJpy: string;
  salaryBrlEst: string;
  nikkeiEligible: string;
  shift: string;
  overtimeHours: string;
}

export interface CandidateFormState {
  fullName: string;
  birthDate: string;
  generation: 'nissei' | 'sansei' | 'yonsei' | ' spouse' | 'other';
  phone: string;
  japanExperience: boolean;
  japanYears: number;
  lastProvince: string;
  lastFactoryType: string;
  footSizeCm: number;
  waistSizeCm: number;
  hasTattoo: boolean;
  healthConsent: boolean;
}
