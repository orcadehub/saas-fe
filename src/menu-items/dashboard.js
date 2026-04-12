import { IconDashboard, IconClipboardList, IconTrophy, IconCode, IconTerminal2, IconBrain, IconRobot, IconDeviceGamepad2, IconBook, IconBooks, IconSparkles, IconCertificate } from '@tabler/icons-react';

// constant
const icons = { 
  IconDashboard,
  IconClipboardList,
  IconTrophy,
  IconCode,
  IconTerminal2,
  IconBrain,
  IconRobot,
  IconDeviceGamepad2,
  IconBook,
  IconBooks,
  IconSparkles,
  IconCertificate
};

// ==============================|| DASHBOARD MENU ITEMS ||============================== //

const dashboard = {
  id: 'dashboard',
  title: '',
  type: 'group',
  children: [
    {
      id: 'dashboard',
      title: 'Dashboard',
      type: 'item',
      url: '/dashboard',
      icon: icons.IconDashboard,
      breadcrumbs: false
    },
    {
      id: 'orca',
      title: 'ORCA',
      type: 'item',
      url: '/practice/programming',
      icon: icons.IconCode,
      breadcrumbs: false
    },
    {
      id: 'leaderboard',
      title: 'Leaderboard',
      type: 'item',
      url: '/leaderboard',
      icon: icons.IconTrophy,
      breadcrumbs: false
    },
    {
      id: 'assessments',
      title: 'Assessments & Quizzes',
      type: 'item',
      url: '/assessments',
      icon: icons.IconClipboardList,
      breadcrumbs: false
    },
    {
      id: 'study-materials',
      title: 'Study Materials',
      type: 'item',
      url: '/study-materials',
      icon: icons.IconBooks,
      breadcrumbs: false
    },
    {
      id: 'practice',
      title: 'Practice',
      type: 'item',
      url: '/practice',
      excludeFromActive: ['/practice/programming'],
      icon: icons.IconTerminal2,
      breadcrumbs: false
    },
    {
      id: 'ide',
      title: 'IDE',
      type: 'item',
      url: '/ide',
      icon: icons.IconBrain,
      breadcrumbs: false
    },
    {
      id: 'labs',
      title: 'Labs',
      type: 'item',
      url: '/labs',
      icon: icons.IconDeviceGamepad2,
      breadcrumbs: false
    },
    {
      id: 'ai-mock',
      title: 'AI Mock',
      type: 'item',
      url: '/ai-mock',
      icon: icons.IconRobot,
      breadcrumbs: false
    },
    {
      id: 'genai',
      title: 'GenAI Playground',
      type: 'item',
      url: '/genai',
      icon: icons.IconSparkles,
      breadcrumbs: false
    },
    {
      id: 'certificates',
      title: 'Certificates',
      type: 'item',
      url: '/certificates',
      icon: icons.IconCertificate,
      breadcrumbs: false
    }
  ]
};

export default dashboard;
