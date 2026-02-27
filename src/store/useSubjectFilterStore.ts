import { create } from 'zustand';

interface SubjectFilterState {
  selectedSubject: string | null;
  setSubject: (subject: string | null) => void;
  clearFilter: () => void;
}

export const useSubjectFilterStore = create<SubjectFilterState>((set) => ({
  selectedSubject: null,
  setSubject: (subject) => set({ selectedSubject: subject }),
  clearFilter: () => set({ selectedSubject: null }),
}));
