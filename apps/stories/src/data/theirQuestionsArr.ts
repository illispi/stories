export interface QuestionPersonal {
  question: string;
  questionType:
    | "selection"
    | "integer"
    | "text"
    | "yesOrNo"
    | "multiSelect"
    | "submit";
  questionDB: keyof PersonalQuestions;
  selections?: string[];
  multiSelect?: [keyof PersonalQuestions, string][];
  skip?: keyof PersonalQuestions;
}

export const questions: QuestionPersonal[] = [];
{
}
