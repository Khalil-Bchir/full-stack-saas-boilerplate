import { combineReducers } from '@reduxjs/toolkit';

//v1 reducers
import authReducer from './v1/authSlice';

const rootReducer = combineReducers({
  //v1 reducers
  auth: authReducer,
});

export default rootReducer;
