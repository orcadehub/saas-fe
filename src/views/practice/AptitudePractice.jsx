import GenericPracticeTopics from './GenericPracticeTopics';
import { IconClipboardList } from '@tabler/icons-react';

export default function AptitudePractice() {
  return (
    <GenericPracticeTopics 
      category="aptitude" 
      title="Aptitude" 
      icon={IconClipboardList} 
      fetchMethod="getAptitudeTopics" 
    />
  );
}
