import GenericPracticeQuestions from './GenericPracticeQuestions';
import { IconBook } from '@tabler/icons-react';

export default function VerbalQuestions() {
  return (
    <GenericPracticeQuestions 
      category="verbal" 
      title="Verbal" 
      icon={IconBook} 
      fetchMethod="getVerbalTopicQuestions" 
    />
  );
}
