import { useSelector, useDispatch } from 'react-redux';
import { getRole, selectUserRole } from '../store/userSlice';

export const useUser = () => {
  const dispatch = useDispatch();
  const role = useSelector(selectUserRole);

  const getUserRole = () => {
    dispatch(getRole());
    return role;
  };

  return {
    role,
    getUserRole,
  };
};
