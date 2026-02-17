import { lazy } from 'react';

// project imports
import Loadable from 'ui-component/Loadable';
import MinimalLayout from 'layout/MinimalLayout';
import ErrorBoundary from './ErrorBoundary';
import { DashboardProvider } from 'contexts/DashboardContext';
import { AssessmentsProvider } from 'contexts/AssessmentsContext';

// maintenance routing
const LoginPage = Loadable(lazy(() => import('views/pages/authentication/Login')));
const RegisterPage = Loadable(lazy(() => import('views/pages/authentication/Register')));

// ==============================|| AUTHENTICATION ROUTING ||============================== //

const AuthenticationRoutes = {
  path: '/',
  element: (
    <DashboardProvider>
      <AssessmentsProvider>
        <MinimalLayout />
      </AssessmentsProvider>
    </DashboardProvider>
  ),
  errorElement: <ErrorBoundary />,
  children: [
    {
      path: '/login',
      element: <LoginPage />
    },
    {
      path: '/pages/login',
      element: <LoginPage />
    },
    {
      path: '/pages/register',
      element: <RegisterPage />
    }
  ]
};

export default AuthenticationRoutes;
