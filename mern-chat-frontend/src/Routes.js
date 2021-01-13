import React from 'react'
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import App from './App';

import Login from './views/auth/Login'

// Dashboard
import Dashboard from './views/dashboard/Index'

// TESTING
import TestRender from 'views/test/TestRender';
import Register from 'views/auth/Register';

export default function Routes() {
    return (
        <BrowserRouter>
            <Switch>
                {/* <Route path="/" component={App} exact/> */}
                <Route 
                    path="/" 
                    render={() => <Login />}
                    exact/>
                <Route 
                    path="/register" 
                    render={() => <Register />}
                    exact/>
                <Route 
                    path="/dashboard" 
                    render={() => <Dashboard />}
                    exact/>
                <Route 
                    path="/test/render" 
                    render={() => <TestRender />}
                    exact/>
            </Switch>
        </BrowserRouter>
    )
}
