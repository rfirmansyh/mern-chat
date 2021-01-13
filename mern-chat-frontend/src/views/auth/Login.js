import React from 'react'
import axios from 'axios'
import { config } from 'config'
import { withRouter } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Alert, Card } from "react-bootstrap";
import logo from 'assets/img/mernchat.png'

function Login(props) {

    const [alert, setAlert] = React.useState('');
    const emailRef = React.createRef();
    const passwordRef = React.createRef();
    
    const [isAuththenticated, setIsAuththenticated] = React.useState(false);

    React.useEffect(() => {
        checkToken()
    }, []);

    const checkToken = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsAuththenticated(true);
            props.history.push('/dashboard');
        }
    }

    const loginUser = () => {
        const email = emailRef.current.value;
        const password = passwordRef.current.value;
        
        axios.post(`${config.api_host}/auth/login`, {
            email,
            password
        }).then(response => {
            console.log(response);
            if (response.data.error === 1) {
                setAlert(response.data.message);
            } else {
                localStorage.setItem('token', response.data.token)
                props.history.push('/dashboard');
            }
        }).catch(err => {
            console.log(err);
        })

    }

    return (
        <>
        {!isAuththenticated &&
            <Container>
                <Row className="justify-content-center pt-5">
                    <Col sm="8" md="6" lg="5">
                    
                        <Card>
                            <Card.Body>
                                
                                <Row className="justify-content-center my-4">
                                    <Col xs="6" lg="4">
                                        <img src={logo} className="img-fluid" />
                                    </Col>
                                </Row>
                                
                                <h3 className="text-center">MernChat</h3>
                                <div className="text-center mb-4">Lest Connect !</div>

                                <Form.Group>
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control type="email" placeholder="Enter email" ref={emailRef} name="email" autoComplete="on" />
                                </Form.Group>

                                <Form.Group>
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control type="password" placeholder="Password" ref={passwordRef}  />
                                </Form.Group>

                                {alert ? <Alert variant="danger">{alert}</Alert> : ''}

                                <Row className="gutters-xs justify-content-end">
                                    <Col xs="12" sm="auto" className="mb-3 mb-sm-0">
                                        <Button variant="primary" type="submit" className="btn-block" onClick={loginUser}>
                                            Submit
                                        </Button>
                                    </Col>
                                    <Col xs="12" sm="auto">
                                        <Button variant="outline-primary" type="submit" className="btn-block" onClick={() => props.history.push('/register')}>
                                            Registrasi
                                        </Button>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    
                    </Col>
                </Row>
            </Container>
        } 
        </>
    )
}

export default withRouter(Login)