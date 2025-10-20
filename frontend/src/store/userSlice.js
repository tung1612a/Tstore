import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  role: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    getRole: (state) => {
      // Lấy role từ localStorage với key 'user'
      try {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          state.role = parsedUser.role || null;
        } else {
          state.role = null;
        }
      } catch (error) {
        console.error('Error getting role from localStorage:', error);
        state.role = null;
      }
    },
  },
});

export const { getRole } = userSlice.actions;

// Selector để lấy role
export const selectUserRole = (state) => state.user.role;

export default userSlice.reducer;
