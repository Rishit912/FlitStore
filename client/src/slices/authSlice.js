import {createSlice} from '@reduxjs/toolkit';

  // check if user data exists in localStorage

  const initialState = {
    userInfo: localStorage.getItem('userInfo')
        ? JSON.parse(localStorage.getItem('userInfo'))
        : null,
    };

    const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
 
        // login success 

        setCredentials: (state, action) => {
            state.userInfo = action.payload;

            // store user data in localStorage
            localStorage.setItem('userInfo', JSON.stringify(action.payload));
        },

        // logout action

        logout: (state, action) => {
            state.userInfo = null;

            // remove user data from localStorage
            localStorage.removeItem('userInfo');
        },
    },
});

export const {setCredentials, logout} = authSlice.actions;

export default authSlice.reducer;
