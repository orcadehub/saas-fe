import GenericPracticeQuestions from './GenericPracticeQuestions';
import { IconClipboardList } from '@tabler/icons-react';

export default function AptitudeQuestions() {
  return (
    <GenericPracticeQuestions 
      category="aptitude" 
      title="Aptitude" 
      icon={IconClipboardList} 
      fetchMethod="getAptitudeTopicQuestions" 
    />
  );
}
