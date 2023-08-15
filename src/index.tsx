import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, HashRouter } from "react-router-dom";
import { Provider } from "react-redux";

import "./index.scss";
import App from "./App";
import store from "Store";

const root = document.getElementById('root');

ReactDOM.render(
    <React.StrictMode>
        <Provider store={store}>
            <HashRouter>
                <App />
            </HashRouter>
        </Provider>
    </React.StrictMode>
    , root
);