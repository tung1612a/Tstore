import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getRole, selectUserRole } from '../store/userSlice';

export const useUser = () => {
  const dispatch = useDispatch();
  const role = useSelector(selectUserRole);

  React.useEffect(() => {
    dispatch(getRole());
  }, [dispatch]);

  return {
    role,
    refreshRole: () => dispatch(getRole()),
  };
};
