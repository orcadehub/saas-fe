import GenericPracticeTopics from './GenericPracticeTopics';
import { IconCalculator } from '@tabler/icons-react';

export default function QuantitativePractice() {
  return (
    <GenericPracticeTopics 
      category="quantitative" 
      title="Quantitative" 
      icon={IconCalculator} 
      fetchMethod="getQuantitativeTopics" 
    />
  );
}
