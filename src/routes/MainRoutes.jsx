import { lazy } from 'react';

// project imports
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';
import ErrorBoundary from './ErrorBoundary';

// page routing
const Landing = Loadable(lazy(() => import('views/landing')));
const Services = Loadable(lazy(() => import('views/landing/Services')));
const Dashboard = Loadable(lazy(() => import('views/dashboard')));
const Leaderboard = Loadable(lazy(() => import('views/leaderboard')));
const Assessments = Loadable(lazy(() => import('views/assessments')));
const AssessmentDetails = Loadable(lazy(() => import('views/assessments/AssessmentDetails')));
const AssessmentTaking = Loadable(lazy(() => import('views/assessments/AssessmentTaking')));
const AssessmentResults = Loadable(lazy(() => import('views/assessments/AssessmentResults')));
const AssessmentPractice = Loadable(lazy(() => import('views/assessments/AssessmentPractice')));
const StudyMaterials = Loadable(lazy(() => import('views/study-materials')));
const Quizzes = Loadable(lazy(() => import('views/quizzes')));
const QuizDetails = Loadable(lazy(() => import('views/quizzes/QuizDetails')));
const Practice = Loadable(lazy(() => import('views/practice')));
const IDE = Loadable(lazy(() => import('views/ide')));
const Labs = Loadable(lazy(() => import('views/playgrounds')));
const AIMock = Loadable(lazy(() => import('views/ai-mock')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  errorElement: <ErrorBoundary />,
  children: [
    {
      path: '/',
      element: <Landing />
    },
    {
      path: '/services',
      element: <Services />
    },
    {
      path: '/assessments/:id/take',
      element: <AssessmentTaking />
    },
    {
      path: '/',
      element: <MainLayout />,
      children: [
        {
          path: 'dashboard',
          element: <Dashboard />
        },
        {
          path: 'leaderboard',
          element: <Leaderboard />
        },
        {
          path: 'assessments',
          element: <Assessments />
        },
        {
          path: 'assessments/:id',
          element: <AssessmentDetails />
        },
        {
          path: 'assessments/:id/results',
          element: <AssessmentResults />
        },
        {
          path: 'assessments/:id/practice',
          element: <AssessmentPractice />
        },
        {
          path: 'study-materials',
          element: <StudyMaterials />
        },
        {
          path: 'quizzes',
          element: <Quizzes />
        },
        {
          path: 'quizzes/:id',
          element: <QuizDetails />
        },
        {
          path: 'practice',
          element: <Practice />
        },
        {
          path: 'ide',
          element: <IDE />
        },
        {
          path: 'labs',
          element: <Labs />
        },
        {
          path: 'ai-mock',
          element: <AIMock />
        }
      ]
    }
  ]
};

export default MainRoutes;
