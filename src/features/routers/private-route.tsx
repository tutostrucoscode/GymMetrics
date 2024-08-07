import { Navigate, Outlet } from "react-router-dom";
import { Path } from "../../constants";

interface Props {
  canActivate: boolean;
  redirectPath?: string;
}

const PrivateRoute = ({ canActivate, redirectPath = Path.Auth }: Props) => {
  if (!canActivate) {
    return <Navigate to={redirectPath} replace />;
  }
  return <Outlet />;
};

export default PrivateRoute;
