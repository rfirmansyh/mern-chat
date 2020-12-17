import React from 'react'
import axios from 'axios'
import io from 'socket.io-client'
import { config } from 'config'
import { Col, Container, Row, Button, Form } from 'react-bootstrap'
import img_user from 'assets/img/users/1.png'

export default function TestRender() {
    // jika participant lebih dari 1 (bukan group) tampilkan nama user

    const url = `${config.api_host}/api/participants/getAllDetailParticipantsByUid`;

    const [messages, setMessages] = React.useState([])
    const [socket, setSocket] = React.useState(null);
    const [userId, setUserId] = React.useState(0);

    const messageRef = React.useRef('');
    const contentMessage = React.useRef(null)   

    const setupSocket = (userId) =>{
        var newSocket = io(`${config.api_host}`, {
            query: {
                user_id: userId
            }
        })
        console.log(newSocket);
        newSocket.on('connect', () => {
            alert('Connected !');
        })
        newSocket.emit('joinRoom', {
            chatroomId: 1
        })

        setSocket(newSocket);
    }
    // check group or user
    const getContent = (participant) => {
        let content;
        if (participant.users.length > 2) {
            return content = {
                detail_current: participant,
                group:  participant.chatroom_detail[0],
                messages:  participant.messages
            };
        } else {
            /* change '1' later */
            return content = {
                detail_current: participant,
                other: participant.users.filter(function(x) { return x.user_id !== 1 })[0],
                messages: participant.messages
            };
        }
    }


    React.useEffect(() => {
        let id = parseInt(prompt('Masukan User id'));
        setUserId(id);
        setupSocket(id);
        getMesages(id);

        return () => {
            console.log('done')
        }
    }, [])

    const sendMessage = () => {
        const user_id = userId
        const message = messageRef.current.value
        const chatroomId = 1

        if(socket) {
            socket.emit('chatroomMessage', {
                chatroomId: chatroomId,
                message: message,
                user_id: user_id
            })
            socket.on('newMessage', (message) => {
                const temp = [...messages];
                temp.push(message.newMessage)
                setMessages(temp);
                // contentMessage.current.scrollTop = contentMessage.current.scrollHeight
            })
        }

        messageRef.current.value = ""
    }

    

    return (
        <>
            {/* Message Box and list messages */}
            <button onClick={() => console.log(messages)}>check</button>
            <Container>
            <Row className="align-items-center" style={{ height: '60px' }}>
                <Col>
                    <Form.Control ref={messageRef} placeholder="Type Message..." />
                </Col>
                <Col xs="auto">
                    <Button onClick={(e) => sendMessage()} variant="primary">Send</Button>
                </Col>
            </Row>
            </Container>
            {/* <Container>
                <Row 
                    ref={contentMessage} className="bg-light" style={{ height: 'calc(100% - 140px)', overflowX: 'hidden', overflowY: 'auto', scrollBehavior: 'smooth' }}>
                    <Col className="h-100 p-4">
                        {messages && messages.map((value, idx) => {
                            return (
                                <Row key={value.__id} className="mb-3">
                                    <Col xs="8">
                                        <div className="bg-info d-inline-block p-2 rounded-lg">
                                            {value.message}
                                        </div>
                                    </Col>
                                </Row>
                            )
                        })}
                    </Col>
                </Row>
                <Row className="align-items-center" style={{ height: '60px' }}>
                    <Col>
                        <Form.Control ref={messageRef} placeholder="Type Message..." />
                    </Col>
                    <Col xs="auto">
                        <Button onClick={(e) => sendMessage()} variant="primary">Send</Button>
                    </Col>
                </Row>
            </Container> */}
        </>
    )
}
