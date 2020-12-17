import React from 'react'
import axios from 'axios'
import { config } from 'config'
import { withRouter } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap";

function Login(props) {

    const [alert, setAlert] = React.useState('');
    const emailRef = React.createRef();
    const passwordRef = React.createRef();

    const loginUser = () => {
        const email = emailRef.current.value;
        const password = passwordRef.current.value;
        console.log(config.api_host);
        props.history.push('/dashboard');
        // axios.post(`${config.api_host}/auth/login`, {
        //     email,
        //     password
        // }).then(response => {
        //     console.log(response);
        //     if (response.data.error === 1) {
        //         setAlert(response.data.message);
        //     } else {
        //         localStorage.setItem('token', response.data.token)
        //     }
        // }).catch(err => {
        //     console.log(err);
        // })

    }

    return (
        <>
        <Container>
            <Row className="justify-content-center pt-5">
                <Col lg="5">
                
                    <Form.Group>
                        <Form.Label>Email</Form.Label>
                        <Form.Control type="email" placeholder="Enter email" ref={emailRef} />
                    </Form.Group>

                    <Form.Group>
                        <Form.Label>Password</Form.Label>
                        <Form.Control type="password" placeholder="Password" ref={passwordRef} />
                    </Form.Group>

                    {/* {alert ? <Alert variant="danger">{alert}</Alert> : ''} */}

                    <Button variant="primary" type="submit" onClick={loginUser}>
                        Submit
                    </Button>
                
                </Col>
            </Row>
        </Container>
        </>
    )
}

export default withRouter(Login)