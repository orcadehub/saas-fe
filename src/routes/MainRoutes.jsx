import { lazy } from 'react';

// project imports
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';
import ErrorBoundary from './ErrorBoundary';
import { DashboardProvider } from 'contexts/DashboardContext';
import { PracticeProvider } from 'contexts/PracticeContext';
import { AssessmentsProvider } from 'contexts/AssessmentsContext';

// page routing
const Landing = Loadable(lazy(() => import('views/landing')));
const Services = Loadable(lazy(() => import('views/landing/Services')));
const Pricing = Loadable(lazy(() => import('views/landing/Pricing')));
const Dashboard = Loadable(lazy(() => import('views/dashboard')));
const Leaderboard = Loadable(lazy(() => import('views/leaderboard')));
const Assessments = Loadable(lazy(() => import('views/assessments')));
const AssessmentDetails = Loadable(lazy(() => import('views/assessments/AssessmentDetails')));
const AssessmentTaking = Loadable(lazy(() => import('views/assessments/AssessmentTaking')));
const AssessmentResults = Loadable(lazy(() => import('views/assessments/AssessmentResults')));
const AssessmentPractice = Loadable(lazy(() => import('views/assessments/AssessmentPractice')));
const StudyMaterials = Loadable(lazy(() => import('views/study-materials')));
const StudyMaterialDetail = Loadable(lazy(() => import('views/study-materials/StudyMaterialDetail')));
const Quizzes = Loadable(lazy(() => import('views/quizzes')));
const QuizDetails = Loadable(lazy(() => import('views/quizzes/QuizDetails')));
const Practice = Loadable(lazy(() => import('views/practice')));
const ProgrammingPractice = Loadable(lazy(() => import('views/practice/ProgrammingPractice')));
const ProgrammingQuestions = Loadable(lazy(() => import('views/practice/ProgrammingQuestions')));
const ProgrammingQuestionPractice = Loadable(lazy(() => import('views/practice/QuestionPracticePage')));
const GamifiedPractice = Loadable(lazy(() => import('views/practice/GamifiedPractice')));
const GamifiedQuestions = Loadable(lazy(() => import('views/practice/GamifiedQuestions')));
const GamePlayer = Loadable(lazy(() => import('views/practice/GamePlayer')));
const AssessmentQuestions = Loadable(lazy(() => import('views/practice/AssessmentQuestions')));
const QuestionSolver = Loadable(lazy(() => import('views/practice/QuestionSolver')));
const QuestionPracticePage = Loadable(lazy(() => import('views/practice/QuestionPracticePage')));
const AptitudePractice = Loadable(lazy(() => import('views/practice/AptitudePractice')));
const VerbalPractice = Loadable(lazy(() => import('views/practice/VerbalPractice')));
const QuantitativePractice = Loadable(lazy(() => import('views/practice/QuantitativePractice')));
const CompanyPractice = Loadable(lazy(() => import('views/practice/CompanyPractice')));
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
      path: '/pricing',
      element: <Pricing />
    },
    {
      path: '/assessments/:id/take',
      element: <AssessmentTaking />
    },
    {
      path: '/',
      element: (
        <DashboardProvider>
          <AssessmentsProvider>
            <PracticeProvider>
              <MainLayout />
            </PracticeProvider>
          </AssessmentsProvider>
        </DashboardProvider>
      ),
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
          path: 'study-materials/:id',
          element: <StudyMaterialDetail />
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
          path: 'practice/programming',
          element: <ProgrammingPractice />
        },
        {
          path: 'practice/programming/:topic',
          element: <ProgrammingQuestions />
        },
        {
          path: 'practice/programming/:topic/:id',
          element: <ProgrammingQuestionPractice />
        },
        {
          path: 'practice/gamified',
          element: <GamifiedPractice />
        },
        {
          path: 'practice/gamified/:subtopicId',
          element: <GamifiedQuestions />
        },
        {
          path: 'practice/gamified/:subtopicId/:questionId',
          element: <GamePlayer />
        },
        {
          path: 'practice/assessment',
          element: <AssessmentQuestions />
        },
        {
          path: 'practice/assessment/:id',
          element: <QuestionPracticePage />
        },
        {
          path: 'practice/aptitude',
          element: <AptitudePractice />
        },
        {
          path: 'practice/verbal',
          element: <VerbalPractice />
        },
        {
          path: 'practice/quantitative',
          element: <QuantitativePractice />
        },
        {
          path: 'practice/company',
          element: <CompanyPractice />
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
