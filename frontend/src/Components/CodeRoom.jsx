import React, { useEffect, useState, useRef } from 'react';
import { throttle } from 'lodash';
import { io } from 'socket.io-client';
import { useParams, useSearchParams } from 'react-router-dom';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/theme-solarized_dark';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/mode-java';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/mode-c_cpp';

import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';

import axios from 'axios';

import openai from 'openai';

// Import any additional CodeMirror modes or addons if needed

import Avatar from 'react-avatar';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import NotWorking from './NotWorking';

const APIkey = process.env.REACT_APP_OPENAI_API_KEY;
const client = new openai({
    apiKey: APIkey,
    dangerouslyAllowBrowser: true,
});

function CodeRoom() {
    // const URL = 'https://syntaxsquad-py2d.onrender.com/';
    const URL = 'http://localhost:3000/';

    const [users, setUsers] = useState([]);
    const emitTimeoutRef = useRef(null);

    const navigate = useNavigate();
    const [output, setOutput] = useState('');

    const [searchParams, setSearchParams] = useSearchParams();
    const username = searchParams.get('username');

    const [chatMessages, setChatMessages] = useState([]);
    const [isChatbotOpen, setIsChatbotOpen] = useState(false);

    let controller = new AbortController();

    const [codeText, setCodeText] = useState();
    const { id } = useParams();

    // chatbot
    const handleChatSubmit = async (message) => {
        const userMessage = { sender: 'user', text: message };
        setChatMessages((prev) => [...prev, userMessage]);

        try {
            const response = await axios.post(
                'https://api.openai.com/v1/completions',
                {
                    model: 'gpt-3.5-turbo', // Change this if you use a different model
                    messages: [message, { role: 'system', content: 'You are a helpful assistant.' }],
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${APIkey}`,
                    },
                },
            );

            // const response = await axios.post(
            //     // 'https://api.openai.com/v1/engines/davinci-codex/completions',
            //     'https://api.chatanywhere.tech',
            //     {
            //         prompt: message,
            //         max_tokens: 150,
            //         n: 1,
            //         stop: null,
            //         temperature: 0.5,
            //     },
            //     {
            //         headers: {
            //             Authorization: `Bearer ${APIkey}`,
            //             'Content-Type': 'application/json',
            //         },
            //     },
            // );
            console.log(response);

            const botMessage = { sender: 'bot', text: response.data.choices[0].text.trim() };
            setChatMessages((prev) => [...prev, botMessage]);
        } catch (error) {
            console.error('Error fetching AI response:', error);
        }
    };
    const handleSendMessage = (e) => {
        e.preventDefault();
        const input = e.target.elements.message;
        const message = input.value;
        if (message) {
            handleChatSubmit(message);
            input.value = '';
        }
    };

    const handlerCodewriter = throttle((newValue) => {
        setCodeText(newValue);

        const socket = io(URL);
        socket.emit('codebase', { id, newValue });
    }, 300); // Throttle the emit every 300ms

    const handlerCopyRoomId = async () => {
        try {
            await navigator.clipboard.writeText(id);
            toast.success('Room ID copied !', {
                position: 'top-right',
                theme: 'dark',
            }); // Reset copied state after 2 seconds
        } catch (error) {
            toast.error('Room ID not copied !', {
                position: 'top-right',
                theme: 'dark',
            });
        }
    };

    const [language, setLanguage] = useState('javascript');

    const handleLanguageChange = (e) => {
        setLanguage(e.target.value);
    };

    const outputWithBreaks = output.split('\n').map((line, index) => <div key={index}>{line}</div>);

    const handlerLeaveRoom = () => {
        navigate('/');
    };
    const handlerCodeRun = async () => {
        const socket = io(URL);

        try {
            const timer = setTimeout(() => {
                controller.abort();
                controller = new AbortController();
                throw new Error('time limit exceeded: infinite loop');
            }, 5000);

            const res = await fetch(URL + 'execute-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    code: codeText,
                    language: language, // Pass the selected language
                }),
            });

            const json = await res.json();
            clearTimeout(timer);
            console.log(json);
            socket.emit('output-sync-req', { id, output: json.output });
        } catch (error) {
            socket.emit('output-sync-req', { id, output: error.message });
            console.log(error.message);
        }
    };

    const myMeeting = async (element) => {
        const appID = 1842127259;
        const serverSecret = '85f0b624542025e25978a20abdc88dc7';
        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(appID, serverSecret, id, Date.now().toString(), username);
        const zp = ZegoUIKitPrebuilt.create(kitToken);

        zp.joinRoom({
            container: element,
            scenario: {
                mode: ZegoUIKitPrebuilt.GroupCall, // To implement 1-on-1 calls, modify the parameter here to [ZegoUIKitPrebuilt.OneONoneCall].
            },
            showScreenSharingButton: false,
        });
    };

    useEffect(() => {
        if (language === 'javascript') {
            setCodeText(`console.log('Hello, World!');`);
        } else if (language === 'java') {
            setCodeText(`public class Main \n { public static void main(String[] args) \n {\n System.out.println("Hello, World!"); \n} \n}`);
        } else if (language === 'python') {
            setCodeText(`print('Hello, World!')`);
        } else if (language === 'c_cpp') {
            setCodeText(`#include <iostream>\nint main() { \nstd::cout << "Hello, World!" << std::endl; \nreturn 0; \n}`);
        }
    }, [language]);

    useEffect(() => {
        console.log(codeText);
        const socket = io(URL);
        socket.emit('room-join', { username: username, roomId: id });
        //  navigate('/code/'+roomId)
        socket.on('joined', (msg) => {
            toast(msg.username + ' Joined ' + msg.roomId);
        });
        socket.emit('users-info', id);
        socket.on('users', (roomUsers) => {
            console.log(roomUsers);
            setUsers(roomUsers);
        });
        socket.on('code-sync', (msg) => {
            // console.log(msg)
            setCodeText(msg);
        });

        socket.on('output-sync', (msg) => {
            setOutput(msg);

            console.log(msg);
        });
        socket.on('error', (error) => {
            console.error('Socket error:', error);
        });

        return () => {
            socket.disconnect();
            if (emitTimeoutRef.current) {
                clearTimeout(emitTimeoutRef.current);
            }
        };
    }, []);
    return (
        <>
            <div className="max-md:hidden  -z-10 w-full h-[100vh] text-slate-400 bg-slate-900  flex justify-center items-center flex-col  p-10 ">
                <img className=" absolute  -z-0 top-0 right-0 backdrop-blur-lg" src="https://tailwindcss.com/_next/static/media/docs-dark@30.1a9f8cbf.avif" />

                <div className="w-full h-full z-30 flex">
                    <div className="min-w-72 h-[100%] bg-gray-500/50 rounded-lg p-2 justify-center items-start">
                        <div className=" h-[70%]">
                            <div className=" m-1  text-md text-gray-300 font-bold ">Connected Users :</div>

                            {users.map((user, index) => {
                                return <Avatar key={index} name={user.username} size="45" className="  rounded-lg  m-1 " textSizeRatio={2.5} />;
                            })}
                        </div>

                        <div className=" h-[30%]  w-full flex flex-col justify-center ">
                            <p className=" pl-1 mb-1 font-bold text-white">Room Id:</p>
                            <div className=" w-full h-9 rounded-lg bg-gray-500/50 backdrop-blur-lg mb-2 flex  items-center p-2 text-ellipsis overflow-hidden">
                                <p className=" text-gray-200 text-ellipsis  whitespace-nowrap overflow-hidden  ">{id}</p>
                            </div>
                            <button onClick={handlerCopyRoomId} className=" text-white mb-2 bg-gradient-to-r  from-green-300 to-green-500/80  w-full h-9 rounded-lg ">
                                Copy Room ID
                            </button>
                            <button className=" text-white bg-gradient-to-r from-cyan-500 to-blue-500  w-full h-9 rounded-lg" onClick={handlerLeaveRoom}>
                                Leave
                            </button>
                        </div>
                    </div>

                    <div className=" ml-3 h-full">
                        <div className=" w-full flex items-center justify-between pb-1 h-[6%]">
                            <select onChange={handleLanguageChange} value={language} className="rounded-lg p-1 text-sm bg-gray-500/50 text-white">
                                <option value="javascript">JavaScript</option>
                                <option value="java">Java</option>
                                <option value="python">Python</option>
                                <option value="c_cpp">C/C++</option>
                            </select>
                            <button className=" w-20 text-sm h-7 bg-blue-500 text-white rounded-md" onClick={handlerCodeRun}>
                                Run Code{' '}
                            </button>
                        </div>

                        <div className="max-h-[90%]">
                            <AceEditor
                                className="text-white bg-gray-500/50 rounded-lg "
                                mode={language} // Dynamically set the language mode
                                theme="monokai"
                                fontSize={18}
                                value={codeText}
                                onChange={handlerCodewriter}
                                name="codeeditor"
                                editorProps={{ $blockScrolling: true }}
                                setOptions={{
                                    enableBasicAutocompletion: true,
                                    enableLiveAutocompletion: true,
                                    enableSnippets: false,
                                }}
                            />
                            {/* <textarea   placeholder=' Code here'  className=' w-full h-full bg-gray-500/50 rounded-lg  text-white p-3 ' name="" id="" cols="30" rows="10"></textarea> */}

                            {/* <AceEditor
                            className=" text-white bg-gray-500/50   h-96  rounded-lg"
                            mode="javascript" // specify the language mode
                            theme="monokai" // specify the theme
                            fontSize={18}
                            value={codeText}
                            // onChange={newValue => console.log('change', newValue)} // handle change event
                            onChange={handlerCodewriter}
                            name="codeeditor" // unique ID for the editor
                            editorProps={{ $blockScrolling: true }}
                            // editor props
                            
                            setOptions={{
                                enableBasicAutocompletion: true,
                                enableLiveAutocompletion: true,
                                enableSnippets: false,
                            }}
                            // set options
                        /> */}
                        </div>
                    </div>
                    <div className=" h-[99%] w-full rounded-lg ml-5">
                        <div className=" w-full   h-[44%]  bg-gray-500/40 p-3  rounded-lg">
                            <p className=" font-bold text-white ">OUTPUT</p>
                            <div className="  h-[90%]  overflow-y-auto ">{outputWithBreaks}</div>
                        </div>

                        <div className=" w-full  mt-[2%]  h-[44%]  bg-gray-500/40 rounded-lg ">
                            <div ref={myMeeting}></div>
                        </div>
                    </div>
                    {/* Chat Interface */}
                    {isChatbotOpen && (
                        <div className="chat-container absolute right-20 bottom-14 w-[30%] h-80 bg-gray-500 z-50 rounded-lg p-3 mt-5">
                            <div className="chat-messages h-[80%] overflow-y-auto pr-1">
                                {chatMessages.map((msg, index) => (
                                    <div key={index} className="">
                                        <span className={msg.sender === 'user' ? 'text-blue-700' : 'text-green-400'}>{msg.sender === 'user' ? 'You: ' : 'Bot: '}</span>
                                        <span className="text-white">{msg.text}</span>
                                    </div>
                                ))}
                            </div>
                            <form onSubmit={handleSendMessage} className="relative -bottom-5 w-full flex">
                                <input type="text" name="message" placeholder="Ask a question..." className="flex-1 p-2 mr-2 text-black rounded-lg" />
                                <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
                                    Send
                                </button>
                            </form>
                        </div>
                    )}
                </div>
                {/* <div className=" w-full h-10 absolute bottom-0 flex justify-center items-center">Developed By Tarun Kataria With ♥</div> */}
                {/* <button
                    onClick={() => {
                        setIsChatbotOpen(!isChatbotOpen);
                    }}
                    className="mb-4 absolute bottom-2 right-5 bg-blue-500 cursor-pointer text-white rounded-lg p-2">
                    {isChatbotOpen ? 'Close ' : 'Open '}
                </button> */}
            </div>
            <NotWorking />
        </>
    );
}

export default CodeRoom;
