import React from 'react'
import ReactDOM from 'react-dom/client';
import AppRoutes from "./react/Components/AppRoute";
import {AppContextProvider} from "./react/Context/context";

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <AppContextProvider>
      <AppRoutes/>
    </AppContextProvider>
  </React.StrictMode>
)
