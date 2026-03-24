import GenericPracticeTopics from './GenericPracticeTopics';
import { IconBook } from '@tabler/icons-react';

export default function VerbalPractice() {
  return (
    <GenericPracticeTopics 
      category="verbal" 
      title="Verbal" 
      icon={IconBook} 
      fetchMethod="getVerbalTopics" 
    />
  );
}
