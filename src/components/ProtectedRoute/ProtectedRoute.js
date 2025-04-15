import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { routes } from '~/config'; // Sửa import

function ProtectedRoute({ children }) {
  const user = localStorage.getItem('user');
  if (!user) {
    return <Navigate to={routes.login} replace />; // Sửa config.routes.login thành routes.login
  }
  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProtectedRoute;
