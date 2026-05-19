import { lazy } from 'react';

// project imports
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';
import ErrorBoundary from './ErrorBoundary';
import { DashboardProvider } from 'contexts/DashboardContext';
import { PracticeProvider } from 'contexts/PracticeContext';
import { AssessmentsProvider } from 'contexts/AssessmentsContext';
import { LabsProvider } from 'contexts/LabsContext';

// page routing
const Landing = Loadable(lazy(() => import('views/landing')));
const Services = Loadable(lazy(() => import('views/landing/Services')));
const Pricing = Loadable(lazy(() => import('views/landing/Pricing')));
const LoginPage = Loadable(lazy(() => import('views/pages/authentication/Login')));
const RegisterPage = Loadable(lazy(() => import('views/pages/authentication/Register')));
const ForgotPassword = Loadable(lazy(() => import('views/pages/authentication/ForgotPassword')));
const Dashboard = Loadable(lazy(() => import('views/dashboard')));
const Leaderboard = Loadable(lazy(() => import('views/leaderboard')));
const Assessments = Loadable(lazy(() => import('views/assessments')));
const AssessmentDetails = Loadable(lazy(() => import('views/assessments/AssessmentDetails')));
const AssessmentTaking = Loadable(lazy(() => import('views/assessments/AssessmentTaking')));
const AssessmentResults = Loadable(lazy(() => import('views/assessments/AssessmentResults')));
const AssessmentPractice = Loadable(lazy(() => import('views/assessments/AssessmentPractice')));
const FrontendPractice = Loadable(lazy(() => import('views/assessments/FrontendPractice')));
const MongoDBPractice = Loadable(lazy(() => import('views/assessments/MongoDBPractice')));
const SQLPractice = Loadable(lazy(() => import('views/assessments/SQLPractice')));
const StudyMaterials = Loadable(lazy(() => import('views/study-materials')));
const StudyMaterialDetail = Loadable(lazy(() => import('views/study-materials/StudyMaterialDetail')));
const Quizzes = Loadable(lazy(() => import('views/quizzes')));
const QuizDetails = Loadable(lazy(() => import('views/quizzes/QuizDetails')));
const Courses = Loadable(lazy(() => import('views/courses')));
const CourseEnrollment = Loadable(lazy(() => import('views/courses/CourseEnrollment')));
const CourseDashboard = Loadable(lazy(() => import('views/courses/CourseDashboard')));
const Practice = Loadable(lazy(() => import('views/practice')));
const ProgrammingPractice = Loadable(lazy(() => import('views/practice/ProgrammingPractice')));
const ProgrammingQuestions = Loadable(lazy(() => import('views/practice/ProgrammingQuestions')));
const ProgrammingQuestionPractice = Loadable(lazy(() => import('views/practice/QuestionPracticePage')));
const GamifiedPractice = Loadable(lazy(() => import('views/practice/GamifiedPractice')));
const GamifiedQuestions = Loadable(lazy(() => import('views/practice/GamifiedQuestions')));
const GamePlayer = Loadable(lazy(() => import('views/practice/GamePlayer')));
const PracticeLeaderboard = Loadable(lazy(() => import('views/practice/PracticeLeaderboard')));
const AssessmentQuestions = Loadable(lazy(() => import('views/practice/AssessmentQuestions')));
const QuestionSolver = Loadable(lazy(() => import('views/practice/QuestionSolver')));
const QuestionPracticePage = Loadable(lazy(() => import('views/practice/QuestionPracticePage')));
const AptitudePractice = Loadable(lazy(() => import('views/practice/AptitudePractice')));
const VerbalPractice = Loadable(lazy(() => import('views/practice/VerbalPractice')));
const QuantitativePractice = Loadable(lazy(() => import('views/practice/QuantitativePractice')));
const AptitudeQuestions = Loadable(lazy(() => import('views/practice/AptitudeQuestions')));
const VerbalQuestions = Loadable(lazy(() => import('views/practice/VerbalQuestions')));
const QuantitativeQuestions = Loadable(lazy(() => import('views/practice/QuantitativeQuestions')));
const CompanyPractice = Loadable(lazy(() => import('views/practice/CompanyPractice')));
const IDE = Loadable(lazy(() => import('views/ide')));
const Labs = Loadable(lazy(() => import('views/playgrounds')));
const LabDetail = Loadable(lazy(() => import('views/playgrounds/LabDetail')));
const LabPractice = Loadable(lazy(() => import('views/playgrounds/LabPractice')));
const TechnologyLabs = Loadable(lazy(() => import('views/playgrounds/TechnologyLabs')));
const AIMock = Loadable(lazy(() => import('views/ai-mock')));
const ResumeBasedMock = Loadable(lazy(() => import('views/ai-mock/ResumeBasedMock')));
const TopicBasedMock = Loadable(lazy(() => import('views/ai-mock/TopicBasedMock')));
const LanguageBasedMock = Loadable(lazy(() => import('views/ai-mock/LanguageBasedMock')));
const JDBasedMock = Loadable(lazy(() => import('views/ai-mock/JDBasedMock')));
const CodingChallengeMock = Loadable(lazy(() => import('views/ai-mock/CodingChallengeMock')));
const InterviewPage = Loadable(lazy(() => import('views/ai-mock/InterviewPage')));
const CodeInterviewPage = Loadable(lazy(() => import('views/ai-mock/CodeInterviewPage')));
const ResultPage = Loadable(lazy(() => import('views/ai-mock/ResultPage')));
const GenAIPlayground = Loadable(lazy(() => import('views/genai')));
const Certificates = Loadable(lazy(() => import('views/certificates/StudentCertificates')));
const CertificateView = Loadable(lazy(() => import('views/certificates/CertificateView')));
const AccountSettings = Loadable(lazy(() => import('views/pages/user-profile/Settings')));
const CodingProfiles = Loadable(lazy(() => import('views/pages/user-profile/CodingProfiles')));
const TestExecutionPage = Loadable(lazy(() => import('views/practice/TestExecutionPage')));
const MCQPracticePage = Loadable(lazy(() => import('views/practice/MCQPracticePage')));
const TopicPracticePage = Loadable(lazy(() => import('views/practice/TopicPracticePage')));
const DSAPractice = Loadable(lazy(() => import('views/practice/DSAPractice')));
const DSAQuestions = Loadable(lazy(() => import('views/practice/DSAQuestions')));

import LandingLayout from 'layout/LandingLayout';

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  errorElement: <ErrorBoundary />,
  children: [
    {
      path: '/',
      element: <LandingLayout />,
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
          path: '/login',
          element: <LoginPage />
        },
        {
          path: '/register',
          element: <RegisterPage />
        },
        {
          path: '/forgot-password',
          element: <ForgotPassword />
        }
      ]
    },
    {
      path: '/assessments/:id/take',
      element: <AssessmentTaking />
    },

    {
      path: '/',
      element: (
        <LabsProvider>
          <DashboardProvider>
            <AssessmentsProvider>
              <PracticeProvider>
                <MainLayout />
              </PracticeProvider>
            </AssessmentsProvider>
          </DashboardProvider>
        </LabsProvider>
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
          path: 'assessments/:id/practice-frontend',
          element: <FrontendPractice />
        },
        {
          path: 'assessments/:id/practice-mongodb',
          element: <MongoDBPractice />
        },
        {
          path: 'assessments/:id/practice-sql',
          element: <SQLPractice />
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
          path: 'courses',
          element: <Courses />
        },
        {
          path: 'courses/:courseId',
          element: <CourseEnrollment />
        },
        {
          path: 'courses/:courseId/dashboard',
          element: <CourseDashboard />
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
          path: 'practice/dsa',
          element: <DSAPractice />
        },
        {
          path: 'practice/dsa/:topic',
          element: <DSAQuestions />
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
          path: 'practice/leaderboard',
          element: <PracticeLeaderboard />
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
          path: 'practice/mcq/:id',
          element: <MCQPracticePage />
        },
        {
          path: 'practice/:category/topic/:topic',
          element: <TopicPracticePage />
        },
        {
          path: 'practice/:category/test-execution',
          element: <TestExecutionPage />
        },
        {
          path: 'practice/aptitude',
          element: <AptitudePractice />
        },
        {
          path: 'practice/aptitude/:topic',
          element: <AptitudeQuestions />
        },
        {
          path: 'practice/verbal',
          element: <VerbalPractice />
        },
        {
          path: 'practice/verbal/:topic',
          element: <VerbalQuestions />
        },
        {
          path: 'practice/quantitative',
          element: <QuantitativePractice />
        },
        {
          path: 'practice/quantitative/:topic',
          element: <QuantitativeQuestions />
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
          path: 'labs/technology/:technology',
          element: <TechnologyLabs />
        },
        {
          path: 'labs/:labId',
          element: <LabDetail />
        },
        {
          path: 'labs/:labId/:questionId',
          element: <LabPractice />
        },
        {
          path: 'ai-mock',
          element: <AIMock />
        },
        {
          path: 'ai-mock/resume',
          element: <ResumeBasedMock />
        },
        {
          path: 'ai-mock/topic',
          element: <TopicBasedMock />
        },
        {
          path: 'ai-mock/language',
          element: <LanguageBasedMock />
        },
        {
          path: 'ai-mock/jd',
          element: <JDBasedMock />
        },
        {
          path: 'ai-mock/coding',
          element: <CodingChallengeMock />
        },
        {
          path: 'ai-mock/interview/:id',
          element: <InterviewPage />
        },
        {
          path: 'ai-mock/code-interview/:id',
          element: <CodeInterviewPage />
        },
        {
          path: 'ai-mock/result',
          element: <ResultPage />
        },
        {
          path: 'genai',
          element: <GenAIPlayground />
        },
        {
          path: 'certificates',
          element: <Certificates />
        },
        {
          path: 'certificates/:id',
          element: <CertificateView />
        },
        {
          path: 'user/account-settings',
          element: <AccountSettings />
        },
        {
          path: 'user/coding-profiles',
          element: <CodingProfiles />
        }
      ]
    }
  ]
};

export default MainRoutes;
