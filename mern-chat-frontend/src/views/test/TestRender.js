import React from 'react'
import axios from 'axios'
import io from 'socket.io-client'
import { config } from 'config'
import { Col, Container, Row, Button, Form, Modal, ListGroup, Badge } from 'react-bootstrap'
import img_user from 'assets/img/users/default-user.png'

export default function Index() {
    // jika participant lebih dari 1 (bukan group) tampilkan nama user

    // chatrooms as contact
    const [rooms, setRooms] = React.useState([]);
    const [selectedRoom, setSelectedRoom] = React.useState(null);
    const [contacts, setContacts] = React.useState([]);
    const [messages, setMessages] = React.useState([]);
    const [socket, setSocket] = React.useState(null);
    const [userId, setUserId] = React.useState(0);

    const [userTyping, setUserTyping] = React.useState(null);
    
    const messageRef = React.useRef('');
    const contentMessage = React.useRef(null)

    // modal
    const [isNewMessage, setIsNewMessage] = React.useState(false);

    const url = `${config.api_host}/api/participants/getAllDetailParticipantsByUid`;

    const getIfInContact = (contact_id) => {
        let contact = null;
        if (contacts.length != 0) {
            contacts.map((v) => {
                if (v.user_saved_id === contact_id) {
                    contact = v;
                    return true
                }
            })
        } else {
            // console.log('waiiting data')
        }
        return contact
    }
    
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
            chatroomId: selectedRoom && selectedRoom.detail_current.chatroom_id
        })

        setSocket(newSocket);
    }

    const handleType = (e) => {
        const chatroomId = selectedRoom.detail_current.chatroom_id
        if (socket) {
            socket.emit('typing', {
                chatroomId: chatroomId,
                user_id: userId
            })
        }
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

    const refreshLastMessage = React.useCallback(async function(userId, message) {
        /* change '1' later */
        let mess =  message.newMessage;
        let participants = await axios.post(url, {
            user_id: userId,
        }).then(response => {
           return response.data.participants.map((val) => val)
        }).catch(err => {
            // console.log(err)
        })
        participants.sort((x, y) => {
            return x.chatroom_id == mess.chatroom_id ? -1 : y.chatroom_id === mess.chatroom_id ? 1 : 0;
        })
        setRooms(participants)
    }, [])

    const getContacts = React.useCallback(async function(userId) {
        let contacts_result = await axios.post(`${config.api_host}/api/contacts/getContactsByUserId`, {
            user_id: userId,
        }).then(response => {
            return response.data.contacts.map((val) => val)
        }).catch(err => {})
        
        setContacts(contacts_result)
    })

    // setup effect
    React.useEffect(() => {
        let id = parseInt(prompt('Masukan User id'));
        // let id = 1;3
        setUserId(id);
        setupSocket(id);
        getrooms(id);
        getContacts(id);

        return () => {
        }
    }, [])

    // new message effect
    React.useEffect(() => {
        if (socket) {
            socket.on('newMessage', async (message) => {
                await refreshLastMessage(userId, message)
                let message_result = { ...message.newMessage, "sender_name" : message.sender_name }
                setMessages((messages) => [...messages, message_result]);
                contentMessage.current.scrollTop = contentMessage.current.scrollHeight
            })
        }
    }, [socket]);

    // get broadcast last message
    React.useEffect(() => {
        console.log('message refreshed');
        if (socket) {
            socket.on('newOnContacMessage', async (message) => {
                await refreshLastMessage(userId, message)
                contentMessage.current.scrollTop = contentMessage.current.scrollHeight
            });
        }
    }, [socket]);

    // change room
    React.useEffect(() => {
        if (socket) {
            socket.emit('joinRoom', {
                chatroomId: selectedRoom !== null && selectedRoom.detail_current.chatroom_id
            });
            changeMessage()
        }

        return () => {
            if (socket) {
                socket.emit('leaveRoom', {
                    chatroomId: selectedRoom !== null && selectedRoom.detail_current.chatroom_id
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
            })
        }
    }, [socket])

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
        if (participant.chatroom_detail[0].room_type === '2') {
            return content = {
                detail_current: participant,
                room: participant.chatroom_detail[0],
                messages: participant.messages
            };
        } else {
            return content = {
                detail_current: participant,
                room: participant.users.filter(function(x) { return x.user_id !== userId })[0],
                messages: participant.messages,
            };
        }
        
    }

    const changeChatroom = async (selected_room) => {
        const chatroom_id_new = selected_room.detail_current.chatroom_id;

        await axios.post(`${config.api_host}/api/participants/updateZeroUnreadMessageByChatroomIdUserId`, {
            user_id: userId,
            chatroom_id: chatroom_id_new
        }).then(response => {
            // console.log(response.data)
        }).catch(err => {})

        let participants = await axios.post(url, {
            user_id: userId,
        }).then(response => {
           return response.data.participants.map((val) => val)
        }).catch(err => {
            // console.log(err)
        })
        setRooms(participants)
        
        setSelectedRoom(selected_room);
    }

    const sendMessage = async () => {
        const user_id = userId
        const message = messageRef.current.value
        const chatroomId = selectedRoom.detail_current.chatroom_id

        if(socket) {
            await axios.post(`${config.api_host}/api/participants/updateZeroUnreadMessageByChatroomIdUserId`, {
                user_id: userId,
                chatroom_id: chatroomId
            }).then(response => {
            }).catch(err => {})

            await socket.emit('chatroomMessage', {
                chatroomId: chatroomId,
                message: message,
                user_id: user_id
            })
            
            await axios.post(`${config.api_host}/api/participants/updateValueUnreadMessageByChatroomIdUserId`, {
                user_id: userId,
                chatroom_id: chatroomId
            }).then(response => {
            }).catch(err => {})
        }

        messageRef.current.value = ""
    }

    const newMessage = () => {
        setIsNewMessage(true)
        // console.log(contacts);
    }

    const selectNewMessage = async (chatroom_id, user_owned_id, user_saved_id) => {
        // change participant
        let participant_result = await axios.post(`${config.api_host}/api/participants/getAllDetailParticipantByUidAndContactId`, {
            chatroom_id: chatroom_id,
            user_owned_id: user_owned_id,
            user_saved_id: user_saved_id,
        }).then(response => {
            // console.log(response.data.participants.map(v => console.log(v)))
            return response.data.participant
        }).catch(err => {
            // console.log(err)
        })
        setSelectedRoom(() => getContent(participant_result[0]));
        setIsNewMessage(() => false);
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
                            <Row className="align-items-center justify-content-between bg-info py-3">
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
                                <Col xs="auto" className='px-0'>
                                    <Button 
                                        variant="outline-light" 
                                        size="sm" onClick={() => newMessage()} >
                                            Pesan Baru
                                    </Button>
                                </Col>
                                <Col xs="auto" className='px-1'>
                                    <Button variant="outline-light" size="sm">Grup Baru</Button>
                                </Col>
                                <Col xs="auto" className='pl-0'>
                                    <Button variant="outline-light" size="sm">Menu</Button>
                                </Col>
                            </Row>
                            {/* Contact List */}
                            {rooms.map((value, i) => {
                                const val_content = getContent(value)
                                const room = getContent(value).room
                                const last_message = getContent(value) && getContent(value).messages.length > 0 ?
                                                        getContent(value).messages[getContent(value).messages.length - 1].message : ''
                                if (last_message !== '' && val_content.detail_current.chatroom_detail[0].room_type === '1') {
                                    return (
                                        <Row 
                                            key={value && value.participant_id} 
                                            onClick={() => changeChatroom(getContent(value))} 
                                            className="align-items-center py-3 bg-secondary border-bottom" 
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
                                                <Col className="text-white">
                                                    <Row>
                                                        <Col>
                                                            <h5 className="mb-0">
                                                                { getIfInContact(room.user_id) !== null ? getIfInContact(room.user_id).name : room.name }
                                                            </h5>
                                                            <span>
                                                                { userTyping !== null && userTyping.id !== userId && userTyping.chatroom_id === val_content.detail_current.chatroom_id ? 
                                                                    `${userTyping.name} is Typing` : last_message }
                                                            </span>
                                                        </Col>
                                                        <Col xs="auto">
                                                            <Badge pill variant="warning">
                                                                { val_content && val_content.detail_current.unread_message > 0 ? val_content.detail_current.unread_message : '' }
                                                            </Badge>
                                                        </Col>
                                                    </Row>
                                                </Col>
                                        </Row>
                                    )
                                } 
                            })}
                        </Col>
                        
                        {/* Content Message */}
                        <Col className="h-100" style={{ overflow: 'hidden'}} >
                            {/* Row Profile group/other */}
                            <Row className="align-items-center justify-content-between bg-dark py-3">
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
                                    <h5 className="text-white mb-0">
                                        { 
                                            (() => {
                                                if (selectedRoom && selectedRoom.detail_current.chatroom_detail[0].room_type === '1') {
                                                    return getIfInContact(selectedRoom.room.user_id) !== null ? 
                                                            getIfInContact(selectedRoom.room.user_id).name : 
                                                            selectedRoom.room.name
                                                } else {
                                                    return selectedRoom && selectedRoom.room.name
                                                }
                                            })()
                                        }
                                    </h5>
                                    <div>
                                        { 
                                            (() => {
                                                if (selectedRoom && selectedRoom.detail_current.chatroom_detail[0].room_type === '2') {
                                                    return userTyping !== null && userTyping.id !== userId ?
                                                        `${userTyping.name} is Typing` :
                                                        selectedRoom && selectedRoom.detail_current.users.map((v, i) => {
                                                            if (i > 2) {
                                                                return '...';
                                                            } else {
                                                                return v.user_id !== userId ? `${v.name}, ` : ''
                                                            }
                                                        }).join('')+'You'
                                                } else {
                                                    return userTyping !== null && userTyping.id !== userId ? `${userTyping.name} is Typing` : ''
                                                }
                                            })()
                                        } 
                                    </div>
                                </Col>
                                <Col xs="auto" className="">
                                    <Button variant="outline-light" size="sm">Menu</Button>
                                </Col>
                            </Row>

                            {/* Message Box and list messages */}
                            <Row ref={contentMessage} className="bg-light" style={{ height: 'calc(100% - 140px)', overflowX: 'hidden', overflowY: 'auto', scrollBehavior: 'smooth' }}>
                                <Col className="h-100 p-4">
                                    {messages && messages.map((value, idx) => {
                                        if (value.user_id === userId) {
                                            return (
                                                <Row key={value.__id} className="justify-content-end mb-3">
                                                    <Col xs="8" className="d-flex flex-column align-items-end justify-content-end">
                                                        <div className="bg-primary text-white d-inline-block p-2 rounded-lg">
                                                            {value.message}
                                                        </div>
                                                        <div style={{ fontSize: '12px' }}>{value.user_name}</div>
                                                        <div className="text-secondary" style={{ fontSize: '10px' }}>{value.createdAt}</div>
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
                                                    <div style={{ fontSize: '12px' }}>{value.user_name}</div>
                                                    <div className="text-secondary" style={{ fontSize: '10px' }}>{value.createdAt}</div>
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

            {/* Modal New Message */}
            <Modal show={isNewMessage} onHide={() => setIsNewMessage(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Modal heading</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Control type="text" className="mb-3" placeholder="Cari Kontak" />
                    <ListGroup defaultActiveKey="#link1">
                        {contacts !== null ? contacts.map((contact) => {
                            return (
                                <ListGroup.Item action 
                                    onClick={() => selectNewMessage(contact.chatroom_id, contact.user_owned_id, contact.user_saved_id)}>
                                        {contact.name}
                                </ListGroup.Item>
                            )
                        }) : ''
                        }
                    </ListGroup>
                </Modal.Body>
                <Modal.Footer>
                <Button variant="secondary" onClick={() => setIsNewMessage(false)}>
                    Batal
                </Button>
                </Modal.Footer>
            </Modal>
            {/* End of Modal New Message */}

            
        </>
    )
}
