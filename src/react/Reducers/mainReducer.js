import actionTypes from '../Actions/actionTypes';

export const initialMainState = {
  fileLists: {},
  clientLists: [],
  scannerName: '',
};

export const MainReducer = (state = initialMainState, action) => {
  switch (action.type) {
    case actionTypes.BUSINESS_ENTITY_LIST_RECEIVED:
      return { ...state, fileLists: action.payload };
    case actionTypes.GET_CLIENT_LIST_SUCCESS:
      return { ...state, clientLists: action.payload };
    case actionTypes.GET_CLIENT_LIST_FAILED:
      return {...state,  clientLists: []}
    case actionTypes.GET_SCAN_DEVICE:
      return { ...state, scannerName: action.payload };
    default:
      return state;
  }
};
