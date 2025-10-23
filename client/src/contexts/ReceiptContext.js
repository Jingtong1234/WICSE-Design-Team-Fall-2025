import React, { createContext, useContext, useReducer } from 'react';

const ReceiptContext = createContext();

// Action types
const RECEIPT_ACTIONS = {
  ADD_RECEIPT: 'ADD_RECEIPT',
  UPDATE_RECEIPT: 'UPDATE_RECEIPT',
  DELETE_RECEIPT: 'DELETE_RECEIPT',
  SET_CURRENT_RECEIPT: 'SET_CURRENT_RECEIPT',
  CLEAR_CURRENT_RECEIPT: 'CLEAR_CURRENT_RECEIPT',
};

// Initial state
const initialState = {
  receipts: [],
  currentReceipt: null,
  loading: false,
  error: null,
};

// Reducer
const receiptReducer = (state, action) => {
  switch (action.type) {
    case RECEIPT_ACTIONS.ADD_RECEIPT:
      return {
        ...state,
        receipts: [...state.receipts, action.payload],
        currentReceipt: action.payload,
      };

    case RECEIPT_ACTIONS.UPDATE_RECEIPT:
      return {
        ...state,
        receipts: state.receipts.map((receipt) =>
          receipt.id === action.payload.id ? action.payload : receipt,
        ),
        currentReceipt: action.payload,
      };

    case RECEIPT_ACTIONS.DELETE_RECEIPT:
      return {
        ...state,
        receipts: state.receipts.filter(
          (receipt) => receipt.id !== action.payload,
        ),
        currentReceipt:
          state.currentReceipt?.id === action.payload
            ? null
            : state.currentReceipt,
      };

    case RECEIPT_ACTIONS.SET_CURRENT_RECEIPT:
      return {
        ...state,
        currentReceipt: action.payload,
      };

    case RECEIPT_ACTIONS.CLEAR_CURRENT_RECEIPT:
      return {
        ...state,
        currentReceipt: null,
      };

    default:
      return state;
  }
};

// Provider component
export const ReceiptProvider = ({ children }) => {
  const [state, dispatch] = useReducer(receiptReducer, initialState);

  // Actions
  const addReceipt = (receiptData) => {
    const receipt = {
      ...receiptData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: RECEIPT_ACTIONS.ADD_RECEIPT, payload: receipt });
    return receipt;
  };

  const updateReceipt = (receiptData) => {
    dispatch({ type: RECEIPT_ACTIONS.UPDATE_RECEIPT, payload: receiptData });
  };

  const deleteReceipt = (receiptId) => {
    dispatch({ type: RECEIPT_ACTIONS.DELETE_RECEIPT, payload: receiptId });
  };

  const setCurrentReceipt = (receipt) => {
    dispatch({ type: RECEIPT_ACTIONS.SET_CURRENT_RECEIPT, payload: receipt });
  };

  const clearCurrentReceipt = () => {
    dispatch({ type: RECEIPT_ACTIONS.CLEAR_CURRENT_RECEIPT });
  };

  const value = {
    ...state,
    addReceipt,
    updateReceipt,
    deleteReceipt,
    setCurrentReceipt,
    clearCurrentReceipt,
  };

  return (
    <ReceiptContext.Provider value={value}>{children}</ReceiptContext.Provider>
  );
};

// Custom hook to use the context
export const useReceipt = () => {
  const context = useContext(ReceiptContext);
  if (!context) {
    throw new Error('useReceipt must be used within a ReceiptProvider');
  }
  return context;
};

export default ReceiptContext;
