import React from 'react'
import axios from 'axios'
import io from 'socket.io-client'
import { config } from 'config'
import { Col, Container, Row, Button, Form, Modal, ListGroup, Badge, Card, Alert } from 'react-bootstrap'
import img_user from 'assets/img/users/default-user.png'
import img_group from 'assets/img/users/default-group.png'

export default function Index() {
    // jika participant lebih dari 1 (bukan group) tampilkan nama user

    // chatrooms as contact
    const [rooms, setRooms] = React.useState([]);
    const [selectedRoom, setSelectedRoom] = React.useState(null);

    const [contacts, setContacts] = React.useState([]);
    const [contactsShowed, setContactsShowed] = React.useState([]);

    const [messages, setMessages] = React.useState([]);
    const [socket, setSocket] = React.useState(null);
    const [userId, setUserId] = React.useState(0);

    const [userTyping, setUserTyping] = React.useState(null);

    const [users, setUsers] = React.useState([]);
    const [userSelected, setUserSelected] = React.useState(null);
    const [userIdsChecked, setUserIdsChecked] = React.useState([]);
    
    const tempContactNameRef = React.useRef('');
    const tempGroupNameRef = React.useRef('');
    const contentMessageRef = React.useRef(null)
    const messageRef = React.useRef('');
    
    // modal
    const [isNewMessage, setIsNewMessage] = React.useState(false);
    const [isNewContact, setIsNewContact] = React.useState(false);
    const [isConfirmContact, setIsConfirmContact] = React.useState(false);
    const [isNewGroup, setIsNewGroup] = React.useState(false);

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
        }
        return contact
    }
    
    const setupSocket = (userId) =>{
        var newSocket = io(`${config.api_host}`, {
            query: {
                user_id: userId
            }
        })
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
        })
        if (participants.length > 0) {
            setRooms(participants)
            setSelectedRoom(getContent(participants[0]))
            setMessages(getContent(participants[0]).messages)
            contentMessageRef.current.scrollTop = contentMessageRef.current.scrollHeight
        }
        
    }, [])

    const refreshLastMessage = React.useCallback(async function(userId, message) {
        /* change '1' later */
        let mess =  message.newMessage;
        let participants = await axios.post(url, {
            user_id: userId,
        }).then(response => {
           return response.data.participants.map((val) => val)
        }).catch(err => {
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
        setContactsShowed(contacts_result)
    })

    // setup effect
    React.useEffect(() => {
        let id = parseInt(prompt('Masukan User id'));
        // let id = 1;
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
                contentMessageRef.current.scrollTop = contentMessageRef.current.scrollHeight
            })
        }
    }, [socket]);

    // get broadcast last message
    React.useEffect(() => {
        console.log('message refreshed');
        if (socket) {
            socket.on('newOnContacMessage', async (message) => {
                await refreshLastMessage(userId, message)
                contentMessageRef.current.scrollTop = contentMessageRef.current.scrollHeight
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

    // make all contacts keep showing
    React.useEffect(() => {
        setTimeout(() => {
            setContactsShowed(() => contacts)
        }, 100);
    }, [isNewMessage])

    const changeMessage = async () => {
        let temp_messages = await axios.post( `${config.api_host}/api/messages/chatroomId`, {
            chatroom_id: selectedRoom === null ? 1 : selectedRoom.detail_current.chatroom_id,
        }).then(response => {
            return response.data
        }).catch(err => {
        })
        await setMessages(temp_messages.data)
        contentMessageRef.current.scrollTop = contentMessageRef.current.scrollHeight
    }

    // remove value in array
    const removeA = (arr) => {
        var what, a = arguments, L = a.length, ax;
        while (L > 1 && arr.length) {
            what = a[--L];
            while ((ax= arr.indexOf(what)) !== -1) {
                arr.splice(ax, 1);
            }
        }
        return arr;
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
        }).catch(err => {})

        let participants = await axios.post(url, {
            user_id: userId,
        }).then(response => {
           return response.data.participants.map((val) => val)
        }).catch(err => {
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

    const newMessage = async () => {
        await getContacts(userId)
        setIsNewMessage(true)
    }

    const newGroup = async () => {
        await getContacts(userId)
        setIsNewGroup(true)
    }

    const selectNewMessage = async (chatroom_id, user_owned_id, user_saved_id) => {
        // change participant
        let participant_result = await axios.post(`${config.api_host}/api/participants/getAllDetailParticipantByUidAndContactId`, {
            chatroom_id: chatroom_id,
            user_owned_id: user_owned_id,
            user_saved_id: user_saved_id,
        }).then(response => {
            return response.data.participant
        }).catch(err => {
        })
        setSelectedRoom(() => getContent(participant_result[0]));
        setIsNewMessage(() => false);
    }

    const selectNewContact = async (event) => {
        setIsNewMessage(false)

        let users = await axios.post(`${config.api_host}/api/users/getAllUsersExceptsByUserId`, {
            user_id: userId
        }).then(response => {
            return response.data.users
        }).catch(err => {
        })
        setUsers(users)
        setIsNewContact(true);
    }

    const handleAddContact = async (user) => {
        setUserSelected(user)
        setIsNewContact(false)
        setIsConfirmContact(true)
    }

    const handleConfirmAddContact = async () => {
        let contact_name = tempContactNameRef.current.value,
            user_owned_id = userId,
            user_saved_id = userSelected.user_id;
        let newContact = await axios.post(`${config.api_host}/api/contacts/store`, {
            name: contact_name,
            user_owned_id: user_owned_id,
            user_saved_id: user_saved_id
        }).then(response => {
            return response.data.contact
        }).catch(err => {
        })

        setIsConfirmContact(false)
        newMessage()

        console.log(newContact)
        
    }

    const handleSearchContactNewMessage = (event) => {
        let query = event.target.value;
        setContactsShowed(() => contacts.filter(contact => contact.name.toLowerCase().indexOf(query) >= 0))
    }

    const handleCheckContactGroup = async (event) => {
        if (event.target.checked) {
            setUserIdsChecked([...userIdsChecked, event.target.value])
        } else {
            let userIds = userIdsChecked;
            if (userIds.indexOf(event.target.value) > -1) {
                userIds.splice(userIds.indexOf(event.target.value), 1)
            }
            setUserIdsChecked(userIds)
        }
    }

    const handleConfirmNewGroup = async (event) => {
        let user_ids = userIdsChecked;
        user_ids.push(userId)

        let newContact = await axios.post(`${config.api_host}/api/participants/storeGroup`, {
            name: tempGroupNameRef.current.value,
            user_ids: user_ids
        }).then(response => {
            return response.data
        }).catch(err => {
        })
        console.log(newContact)
        getrooms(userId)
        setIsNewGroup(false)
    }

    React.useEffect(() => {
        console.log(userIdsChecked)
    }, [userIdsChecked])

    if (socket === null && userId === null) {
        return (
            <>
                Waiting Data...
            </>
        )
    }
    return (
        <>
            <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
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
                                    <Button 
                                        variant="outline-light" 
                                        size="sm" onClick={() => newGroup()}>
                                            Grup Baru
                                    </Button>
                                </Col>
                                <Col xs="auto" className='pl-0'>
                                    <Button variant="outline-light" size="sm">Menu</Button>
                                </Col>
                            </Row>
                            {/* Contact List */}
                            <div style={{ height: 'calc(95% - 20px)', margin: '0 -15px', padding: '0 15px 40px', overflowX: 'hidden', overflowY: 'auto', scrollBehavior: 'smooth' }}>
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
                                    } else {
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
                                                            <img src={img_group} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        </div>  
                                                    </Col>
                                                    <Col className="text-white">
                                                        <Row>
                                                            <Col>
                                                                <h5 className="mb-0">
                                                                    { room.name }
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
                            </div>
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
                                                console.log('rooms', rooms)
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
                                    <small className="text-light">
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
                                    </small>
                                </Col>
                                <Col xs="auto" className="">
                                    <Button variant="outline-light" size="sm">Menu</Button>
                                </Col>
                            </Row>

                            {/* Message Box and list messages */}
                            <Row ref={contentMessageRef} className="bg-light" style={{ height: 'calc(100% - 140px)', overflowX: 'hidden', overflowY: 'auto', scrollBehavior: 'smooth' }}>
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
                    <Modal.Title>Buat Pesan</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Control 
                        type="text" className="mb-3" placeholder="Cari Kontak" 
                        onKeyUp={handleSearchContactNewMessage} />
                    <ListGroup defaultActiveKey="#link1">
                        {contactsShowed !== null ? contactsShowed.map((contact) => {
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
                    <Button variant="dark" onClick={selectNewContact}>
                        Tambah Kontak
                    </Button>
                </Modal.Footer>
            </Modal>
            {/* End of Modal New Message */}

            {/* Modal New Contact */}
            <Modal size="lg" show={isNewContact} onHide={() => setIsNewContact(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Tambah Kontak Baru</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {/* List Users */}
                    <Row>
                        {users && users.map(user => (
                            <Col xs="6" className="mb-4"> 
                                <Card style={{ cursor: 'pointer' }} onClick={() => {
                                    handleAddContact(user)
                                }}>
                                    <Card.Body>
                                        <Row noGutters={true}>
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
                                            <Col className='pl-3'>
                                                <h6 className="mb-0">{user.name}</h6>
                                                <small className="text-secondary">{user.email}</small>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => {
                        setIsNewContact(false)
                        setIsNewMessage(true)
                    }}>
                        Batal
                    </Button>
                </Modal.Footer>
            </Modal>
            {/* End of Modal New Message */}

            {/* Modal Confirm add Contract */}
            <Modal show={isConfirmContact} onHide={() => setIsConfirmContact(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Konfirmasi Kontak</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Card style={{ cursor: 'pointer' }}>
                        <Card.Body>
                            <Row noGutters={true} className="justify-content-center">
                                <Col xs="12" className="d-flex align-items-center justify-content-center">
                                    <div 
                                        className="bg-light"
                                        style={{ 
                                            width: '120px', 
                                            height: '120px', 
                                            borderRadius: '50%', 
                                            overflow: 'hidden', } }>
                                        <img src={img_user} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                </Col>
                                <Col xs="12" sm="8">
                                    <Form.Control ref={tempContactNameRef} placeholder="Nama Kontak" maxLength={25} className="text-center mb-3" />
                                </Col>
                                <Col xs="12" className='text-center'>
                                    <h5 className="mb-0">{isConfirmContact && userSelected.name}</h5>
                                    <div className="text-secondary">{isConfirmContact && userSelected.email}</div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => {
                        setIsConfirmContact(false)
                        setIsNewContact(true)
                    }}>
                        Kembali
                    </Button>
                    <Button variant="primary" onClick={handleConfirmAddContact}>
                        Konfirmasi
                    </Button>
                </Modal.Footer>
            </Modal>
            {/* End of Modal Confirm add Contract */}

            {/* Modal New Group */}
            <Modal show={isNewGroup} onHide={() => setIsNewGroup(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Buat Group</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Card style={{ cursor: 'pointer' }}>
                        <Card.Body>
                            <Row noGutters={true} className="justify-content-center">
                                <Col xs="12" className="d-flex align-items-center justify-content-center">
                                    <div 
                                        className="bg-light"
                                        style={{ 
                                            width: '120px', 
                                            height: '120px', 
                                            borderRadius: '50%', 
                                            overflow: 'hidden', } }>
                                        <img src={img_group} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                </Col>
                                <Col xs="12" sm="8">
                                    <Form.Control ref={tempGroupNameRef} placeholder="Nama Grup" maxLength={25} className="text-center mb-3" />
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                    <Card>
                        <Card.Body>
                            <h5>Pilih Kontak</h5>
                            <Form.Control 
                                type="text" className="mb-3" placeholder="Cari Kontak" 
                                onKeyUp={handleSearchContactNewMessage} />
                            <ListGroup defaultActiveKey="#link1">
                                {contactsShowed !== null ? contactsShowed.map((contact) => {
                                    return (
                                        <div key={contact.contact_id} className="mb-3">
                                            <Form.Check 
                                                custom
                                                type="checkbox"
                                                id={contact.contact_id}
                                                label={contact.name}
                                                value={contact.user_saved_id}
                                                onChange={handleCheckContactGroup}
                                            />
                                        </div>
                                    )
                                }) : ''
                                }
                            </ListGroup>
                        </Card.Body>
                    </Card>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setIsNewGroup(false)}>
                        Batal
                    </Button>
                    <Button variant="primary" onClick={handleConfirmNewGroup}>
                        Konfirmasi
                    </Button>
                </Modal.Footer>
            </Modal>
            {/* End of Modal New Group */}
        </>
    )
}
