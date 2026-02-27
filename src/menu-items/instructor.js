// assets
import { IconDashboard, IconClipboardList, IconUsers, IconChartBar, IconBriefcase, IconCode, IconBrain, IconBook } from '@tabler/icons-react';

// constant
const icons = { 
  IconDashboard,
  IconClipboardList,
  IconUsers,
  IconChartBar,
  IconBriefcase,
  IconCode,
  IconBrain,
  IconBook
};

// ==============================|| INSTRUCTOR MENU ITEMS ||============================== //

const instructor = {
  id: 'instructor',
  title: 'Instructor',
  type: 'group',
  children: [
    {
      id: 'instructor-dashboard',
      title: 'Dashboard',
      type: 'item',
      url: '/instructor/dashboard',
      icon: icons.IconDashboard,
      breadcrumbs: false
    },
    {
      id: 'quizzes',
      title: 'Quizzes',
      type: 'item',
      url: '/instructor/quizzes',
      icon: icons.IconClipboardList,
      breadcrumbs: false
    },
    {
      id: 'assessments',
      title: 'Assessments',
      type: 'item',
      url: '/instructor/assessments',
      icon: icons.IconClipboardList,
      breadcrumbs: false
    },
    {
      id: 'students',
      title: 'Students',
      type: 'item',
      url: '/instructor/students',
      icon: icons.IconUsers,
      breadcrumbs: false
    },
    {
      id: 'reports',
      title: 'Reports',
      type: 'item',
      url: '/instructor/reports',
      icon: icons.IconChartBar,
      breadcrumbs: false
    },
    {
      id: 'company-specific',
      title: 'Company Specific',
      type: 'item',
      url: '/instructor/company-specific',
      icon: icons.IconBriefcase,
      breadcrumbs: false
    },
    {
      id: 'practice',
      title: 'Practice Questions',
      type: 'item',
      url: '/instructor/practice',
      icon: icons.IconCode,
      breadcrumbs: false
    },
    {
      id: 'aptitude',
      title: 'Aptitude Questions',
      type: 'item',
      url: '/instructor/aptitude',
      icon: icons.IconBrain,
      breadcrumbs: false
    },
    {
      id: 'study-materials',
      title: 'Study Materials',
      type: 'item',
      url: '/instructor/study-materials',
      icon: icons.IconBook,
      breadcrumbs: false
    }
  ]
};

export default instructor;
