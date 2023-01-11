const user = localStorage.getItem('currentUser')
  ? JSON.parse(localStorage.getItem('currentUser'))
  : { taxId: '', username: '', token: '' };
// const user = {}
export const authInitialState = {
  user: '' || user,
  loading: false,
  errorMessage: null,
};

export const AuthReducer = (initialState, action) => {
  switch (action.type) {
    case 'REQUEST_LOGIN':
      return {
        ...initialState,
        loading: true,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...initialState,
        user: action.payload,
        loading: false,
      };
    case 'LOGOUT':
      return {
        ...initialState,
        user: '',
        token: '',
      };

    case 'LOGIN_ERROR':
      return {
        ...initialState,
        loading: false,
        errorMessage: action.error.errorMsg,
      };

    default:
      console.log('mainReducer initial state', initialState);
      return initialState;
  }
};
