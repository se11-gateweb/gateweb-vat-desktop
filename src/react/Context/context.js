import React, { useReducer } from 'react';
import PropTypes from 'prop-types';
import {
  MainReducer, initialMainState, AuthReducer, authInitialState,
} from '../Reducers';

const AppStateContext = React.createContext();
const AppDispatchContext = React.createContext();

export function useAppState() {
  const context = React.useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAuthState must be used within a AuthProvider');
  }

  return context;
}

export function useAppDispatch() {
  const context = React.useContext(AppDispatchContext);
  if (context === undefined) {
    throw new Error('useAuthDispatch must be used within a AuthProvider');
  }

  return context;
}

const combineDispatch = (...dispatches) => (action) => dispatches.forEach((dispatch) => dispatch(action));

export function AppContextProvider({ children }) {
  const [auth, authDispatch] = useReducer(AuthReducer, authInitialState);
  const [appData, appDispatch] = useReducer(MainReducer, initialMainState);
  const combinedDispatch = React.useCallback(combineDispatch(authDispatch, appDispatch), [authDispatch, appDispatch]);
  const combinedState = React.useMemo(() => ({ auth, appData }), [auth, appData]);

  return (
    <AppStateContext.Provider value={combinedState}>
      <AppDispatchContext.Provider value={combinedDispatch}>
        {children}
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
}

AppContextProvider.propTypes = {
  children: PropTypes.any,
};
