import React from 'react'
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import App from './App';

import Login from './views/auth/Login'

// Dashboard
import Dashboard from './views/dashboard/Index'

// TESTING
import TestRender from 'views/test/TestRender';

export default function Routes() {
    return (
        <BrowserRouter>
            <Switch>
                <Route path="/" component={App} exact/>
                <Route 
                    path="/login" 
                    render={() => <Login />}
                    exact/>
                <Route 
                    path="/dashboard" 
                    render={() => <Dashboard />}
                    exact/>
            </Switch>
        </BrowserRouter>
    )
}
