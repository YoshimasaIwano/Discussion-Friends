import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from './firebase/AuthContent';
import SignIn from './firebase/SignIn';
import { DiscussionProvider } from './hooks/DiscussionContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const rootEl = document.getElementById('root');

ReactDOM.render(
  <React.StrictMode>
    <AuthProvider>
      <DiscussionProvider>
        <SignIn />
      </DiscussionProvider>
    </AuthProvider>
  </React.StrictMode>,
  rootEl,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
