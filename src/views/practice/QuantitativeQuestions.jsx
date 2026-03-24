import GenericPracticeQuestions from './GenericPracticeQuestions';
import { IconCalculator } from '@tabler/icons-react';

export default function QuantitativeQuestions() {
  return (
    <GenericPracticeQuestions 
      category="quantitative" 
      title="Quantitative" 
      icon={IconCalculator} 
      fetchMethod="getQuantitativeTopicQuestions" 
    />
  );
}
