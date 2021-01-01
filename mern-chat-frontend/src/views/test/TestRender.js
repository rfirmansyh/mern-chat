import React from 'react'
import axios from 'axios'
import io from 'socket.io-client'
import { config } from 'config'
import { useImmer } from 'use-immer'
import { Col, Container, Row, Button, Form } from 'react-bootstrap'
import img_user from 'assets/img/users/1.png'

export default function Index() {
    // jika participant lebih dari 1 (bukan group) tampilkan nama user

    // chatrooms as contact
    const [contacts, setContacts] = React.useState([]);
    const [userId, setUserId] = React.useState(0);
    const [socket, setSocket] = React.useState(null);
    const [selectedContact, setSelectedContact] = React.useState(null);
    
    
    const [messages, setMessages] = useImmer([]);
    
    const messageRef = React.useRef('');
    const contentMessage = React.useRef(null)

    const url = `${config.api_host}/api/participants/getAllDetailParticipantsByUid`;

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
            chatroomId: selectedContact === null ? 1 : selectedContact.detail_current.chatroom_id
        })

        setSocket(newSocket);
    }

    React.useEffect(() => {
        // let id = parseInt(prompt('Masukan User id'));
        let id = 1;
        setUserId(id);
        getContacts(id);
        setupSocket(id);

        return () => {
            console.log('done')
        }
    }, [])

    const getContacts = React.useCallback(async function(userId) {
        /* change '1' later */
        let participants = await axios.post(url, {
            user_id: userId,
        }).then(response => {
           return response.data.participants.map((val) => val)
        }).catch(err => {
            console.log(err)
        })
        setContacts(participants)
        setSelectedContact(getContent(participants[0]))
        setMessages(draft => {
            draft.push(['asdf']);
        })
        contentMessage.current.scrollTop = contentMessage.current.scrollHeight
    }, [])

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
        if (socket) {
            socket.on('newMessage', (message) => {
                setMessages(draft => {
                    draft.push('');
                    draft = '';
                });
                // contentMessage.current.scrollTop = contentMessage.current.scrollHeight
                contentMessage.current.scrollTop = contentMessage.current.scrollHeight
            })
        }
    }, []);
    

    const sendMessage = () => {
        const user_id = 1
        const message = messageRef.current.value
        const chatroomId = 1

        if(socket) {
            socket.emit('chatroomMessage', {
                chatroomId: 1,
                message: message,
                user_id: 1
            })
        }

        messageRef.current.value = ""
    }


    return (
        <>
            <div style={{ width: '100vw', height: '100vh' }}>
                <Container className="h-100">
                    <Row className="h-100">
                        {/* Sidebar */}
                        <Col lg="4" className="bg-light h-100 border-right">
                            {/* Profile */}
                            <Row className="align-items-center justify-content-between bg-secondary py-3">
                                <Col>
                                    <div 
                                        className="bg-light"
                                        style={{ 
                                            width: '50px', 
                                            height: '50px', 
                                            borderRadius: '50%', 
                                            overflow: 'hidden', } }>
                                        <img src={img_user} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                </Col>
                                <Col xs="auto" className="bg-white" style={{ cursor: 'pointer' }}>
                                    Story
                                </Col>
                            </Row>
                            {/* Contact List */}
                            <Row 
                                className="align-items-center py-3 bg-primary border-bottom" 
                                style={{ cursor: 'pointer' }}>
                                    <Col xs="auto">
                                        <div 
                                            className="bg-light"
                                            style={{ 
                                                width: '60px', 
                                                height: '60px', 
                                                borderRadius: '50%', 
                                                overflow: 'hidden', } }>
                                            <img src={img_user} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>  
                                    </Col>
                                    <Col >
                                        <h5 className="mb-0">asdfsadf</h5>
                                        <span>asdfasdf</span>
                                    </Col>
                            </Row>
                            <Row 
                                className="align-items-center py-3 bg-primary border-bottom" 
                                style={{ cursor: 'pointer' }}>
                                    <Col xs="auto">
                                        <div 
                                            className="bg-light"
                                            style={{ 
                                                width: '60px', 
                                                height: '60px', 
                                                borderRadius: '50%', 
                                                overflow: 'hidden', } }>
                                            <img src={img_user} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>  
                                    </Col>
                                    <Col>
                                        <h5 className="mb-0">
                                            asdfasdf
                                        </h5>
                                        <span>
                                            asdfasdf
                                        </span>
                                    </Col>
                            </Row>            
                        </Col>

                        {/* Content Message */}
                        <Col className="h-100" style={{ overflow: 'hidden'}} >
                            {/* Row Profile group/other */}
                            <Row className="align-items-center justify-content-between bg-success py-3">
                                <Col xs="auto">
                                    <div 
                                        className="bg-light"
                                        style={{ 
                                            width: '50px', 
                                            height: '50px', 
                                            borderRadius: '50%', 
                                            overflow: 'hidden', } }>
                                        <img src={img_user} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                </Col>
                                <Col>
                                    <h5 className="mb-0">
                                        {selectedContact !== null ? selectedContact.name : ''}
                                    </h5>
                                </Col>
                                <Col xs="auto" className="bg-white" style={{ cursor: 'pointer' }}>
                                    option
                                </Col>
                            </Row>
                            {/* Message Box and list messages */}
                            <Row ref={contentMessage} className="bg-light" style={{ height: 'calc(100% - 140px)', overflowX: 'hidden', overflowY: 'auto', scrollBehavior: 'smooth' }}>
                                <Col className="h-100 p-4">
                                {messages.map(v => (
                                    <Row className="mb-3">
                                        <Col xs="8">
                                            
                                                <div className="bg-info d-inline-block p-2 rounded-lg">
                                                    {v}
                                                </div>
                                        </Col>
                                    </Row>
                                ))}
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
                        </Col>
                    </Row>
                </Container>
            </div>
        </>
    )
}
