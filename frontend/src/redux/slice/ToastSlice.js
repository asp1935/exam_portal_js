import { createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';

const ToastSlice = createSlice({
  name: 'toast',
  initialState: null,
  reducers: {
    showToast: (_, action) => {
      const { message, type = 'success' } = action.payload;
      toast[type](message, { toastId: message }); 
    },
  },
});

export const { showToast } = ToastSlice.actions;
export default ToastSlice.reducer;
