import React from 'react'
import axios from 'axios'
import io from 'socket.io-client'
import { config } from 'config'
import { Col, Container, Row, Button, Form } from 'react-bootstrap'
import img_user from 'assets/img/users/1.png'

export default function Index() {
    // jika participant lebih dari 1 (bukan group) tampilkan nama user

    // chatrooms as contact
    const [rooms, setRooms] = React.useState([]);
    const [messages, setMessages] = React.useState([]);
    const [lastMessage, setLastMessage] = React.useState('');
    const [selectedRoom, setSelectedRoom] = React.useState(null);
    const [socket, setSocket] = React.useState(null);
    const [userId, setUserId] = React.useState(0);

    const [userTyping, setUserTyping] = React.useState(null);
    
    const messageRef = React.useRef('');
    const contentMessage = React.useRef(null)

    const url = `${config.api_host}/api/participants/getAllDetailParticipantsByUid`;

    
    const setupSocket = (userId) =>{
        var newSocket = io(`${config.api_host}`, {
            query: {
                user_id: userId
            }
        })
        // console.log(newSocket);
        newSocket.on('connect', () => {
            alert('Connected !');
        })
        newSocket.emit('joinRoom', {
            chatroomId: selectedRoom === null ? 1 : selectedRoom.detail_current.chatroom_id
        })

        setSocket(newSocket);
    }
    
    const getrooms = React.useCallback(async function(userId) {
        /* change '1' later */
        let participants = await axios.post(url, {
            user_id: userId,
        }).then(response => {
           return response.data.participants.map((val) => val)
        }).catch(err => {
            // console.log(err)
        })
        setRooms(participants)
        setSelectedRoom(getContent(participants[0]))
        setMessages(getContent(participants[0]).messages)
        contentMessage.current.scrollTop = contentMessage.current.scrollHeight
    }, [])

    React.useEffect(() => {
        // let id = parseInt(prompt('Masukan User id'));
        let id = 1;
        setUserId(id);
        getrooms(id);
        setupSocket(id);

        return () => {
            // console.log('done')
        }
    }, [])

    React.useEffect(() => {
        if (socket) {
            socket.on('newMessage', (message) => {
                setMessages((messages) => [...messages, message.newMessage]);
                contentMessage.current.scrollTop = contentMessage.current.scrollHeight
            })
        }
    }, [socket]);

    const refreshLastMessage = React.useCallback(async function(userId) {
        /* change '1' later */
        let participants = await axios.post(url, {
            user_id: userId,
        }).then(response => {
           return response.data.participants.map((val) => val)
        }).catch(err => {
            // console.log(err)
        })
        setRooms(participants)
    }, [])

    React.useEffect(() => {
        refreshLastMessage(userId)
        // setSelectedRoom(getContent(selectedRoom));
        // last_message = getContent(value) && getContent(value).messages.length > 1 ?
        //                     getContent(value).messages[getContent(value).messages.length - 1].message : ''
    }, [messages]);

    React.useEffect(() => {
        if (socket) {
            socket.emit('joinRoom', {
                chatroomId: selectedRoom === null ? 1 : selectedRoom.detail_current.chatroom_id
            });
            changeMessage()
        }

        return () => {
            if (socket) {
                socket.emit('leaveRoom', {
                    chatroomId: selectedRoom === null ? 1 : selectedRoom.detail_current.chatroom_id
                })
                setMessages([])
            }
        }
    }, [selectedRoom]);

    // effect on type
    React.useEffect(() => {
        if (socket) {
            socket.on('user_typing', (data) => {
                setUserTyping(data)
                // console.log(userTyping)
                contentMessage.current.scrollTop = contentMessage.current.scrollHeight
            })
        }
    }, [socket])

    const handleType = (e) => {
        const chatroomId = selectedRoom.detail_current.chatroom_id
        if (socket) {
            socket.emit('typing', {
                chatroomId: chatroomId,
                user_id: userId
            })
        }
    }

    // just check user typing
    React.useEffect(() => {
        setTimeout(() => {
            setUserTyping(null)
        }, 2000);
        // console.log(userTyping);
    }, [userTyping])

    const changeMessage = async () => {
        let temp_messages = await axios.post( `${config.api_host}/api/messages/chatroomId`, {
            chatroom_id: selectedRoom === null ? 1 : selectedRoom.detail_current.chatroom_id,
        }).then(response => {
            // console.log(response.data)
            return response.data
        }).catch(err => {
            // console.log(err)
        })
        await setMessages(temp_messages.data)
        contentMessage.current.scrollTop = contentMessage.current.scrollHeight
    }


    // check group or user
    const getContent = (participant) => {
        let content;
        if (participant.users.length > 2) {
            return content = {
                detail_current: participant,
                room:  participant.chatroom_detail[0],
                messages:  participant.messages
            };
        } else {
            /* change '1' later */
            return content = {
                detail_current: participant,
                room: participant.users.filter(function(x) { return x.user_id !== userId })[0],
                messages: participant.messages
            };
        }
    }

    const sendMessage = () => {
        const user_id = userId
        const message = messageRef.current.value
        const chatroomId = selectedRoom.detail_current.chatroom_id

        if(socket) {
            socket.emit('chatroomMessage', {
                chatroomId: chatroomId,
                message: message,
                user_id: user_id
            })

        }

        messageRef.current.value = ""
    }

    


    if (socket === null && userId === null) {
        return (
            <>
                Waiting Data...
            </>
        )
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
                            {rooms.map((value, i) => {
                                const room = getContent(value).room
                                const last_message = getContent(value) && getContent(value).messages.length > 0 ?
                                                        getContent(value).messages[getContent(value).messages.length - 1].message : ''
                                return (
                                    <Row 
                                        key={value && value.participant_id} 
                                        onClick={() => {
                                            setSelectedRoom(() => getContent(value));
                                        }} 
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
                                                <h5 className="mb-0">{ room ? room.name : '' }</h5>
                                                <span>{ last_message ? last_message : '' }</span>
                                            </Col>
                                    </Row>
                                )
                                
                                
                            })}
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
                                        { selectedRoom && selectedRoom.room.name ? selectedRoom.room.name : '' }
                                    </h5>
                                    <div>
                                        { userTyping !== null && userTyping.id !== userId ?
                                            `${userTyping.name} is Typing` :
                                            selectedRoom && selectedRoom.detail_current.users.map((v, i) => {
                                                if (i > 2) {
                                                    return '...';
                                                } else {
                                                    return v.user_id !== userId ? `${v.name}, ` : ''
                                                }
                                            }).join('')+'You' 
                                        } 
                                    </div>
                                </Col>
                                <Col xs="auto" className="bg-white" style={{ cursor: 'pointer' }}>
                                    option
                                </Col>
                            </Row>

                            {/* Message Box and list messages */}
                            <Row ref={contentMessage} className="bg-light" style={{ height: 'calc(100% - 140px)', overflowX: 'hidden', overflowY: 'auto', scrollBehavior: 'smooth' }}>
                                <Col className="h-100 p-4">
                                    {messages && messages.map((value, idx) => {
                                        if (value.user_id == userId) {
                                            return (
                                                <Row key={value.__id} className="justify-content-end mb-3">
                                                    <Col xs="8" className="d-flex justify-content-end">
                                                        <div className="bg-primary text-white d-inline-block p-2 rounded-lg">
                                                            {value.message}
                                                        </div>
                                                    </Col>
                                                </Row>
                                            )
                                        }
                                        return (
                                            <Row key={value.__id} className="mb-3">
                                                <Col xs="8">
                                                    <div className="bg-secondary text-white d-inline-block p-2 rounded-lg">
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
                                    <Form.Control ref={messageRef} onKeyUp={(e) => handleType(e)} placeholder="Type Message..." />
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
