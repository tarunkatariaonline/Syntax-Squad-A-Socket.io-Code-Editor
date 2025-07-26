import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useParams, useSearchParams } from "react-router-dom";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/theme-solarized_dark";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { debounce } from "lodash";

import Avatar from "react-avatar";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import NotWorking from "./NotWorking";
import { BASE_URL } from "../../utils";
import axios from "axios";

function CodeRoom() {
  const [users, setUsers] = useState([]);
  const [output, setOutput] = useState("");
  const [codeText, setCodeText] = useState('console.log("hello world")');
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const username = searchParams.get("username");
  const navigate = useNavigate();
  const socketRef = useRef(null);
  const controllerRef = useRef(new AbortController());
  const debounceRef = useRef(null);

  // Initialize debounce for code sync
  useEffect(() => {
    debounceRef.current = debounce((newValue) => {
      if (socketRef.current?.connected) {
        socketRef.current.emit("codebase", { id, newValue });
      }
    }, 300);

    return () => debounceRef.current?.cancel();
  }, [id]);

  // Socket.io connection and event handlers
  useEffect(() => {
    socketRef.current = io(BASE_URL);

    // Join room with user info
    socketRef.current.emit("room-join", {
      username,
      roomId: id,
      socketId: socketRef.current.id,
    });

    // Request users info after joining
    socketRef.current.emit("users-info", id);

    // Event handlers
    const handleJoined = (msg) => {
      toast(`${msg.username} joined ${msg.roomId}`);
      // Refresh users list when someone new joins
      socketRef.current.emit("users-info", id);
    };

    const handleUsers = (roomUsers) => {
      console.log("Received users:", roomUsers);
      setUsers(roomUsers);
    };

    const handleCodeSync = (msg) => {
      if (msg !== codeText) {
        setCodeText(msg);
      }
    };

    const handleOutputSync = (msg) => {
      setOutput(msg);
    };

    socketRef.current.on("joined", handleJoined);
    socketRef.current.on("users", handleUsers);
    socketRef.current.on("code-sync", handleCodeSync);
    socketRef.current.on("output-sync", handleOutputSync);

    return () => {
      socketRef.current.off("joined", handleJoined);
      socketRef.current.off("users", handleUsers);
      socketRef.current.off("code-sync", handleCodeSync);
      socketRef.current.off("output-sync", handleOutputSync);
      socketRef.current.disconnect();
    };
  }, [id, username]);
  const handlerCodewriter = (newValue) => {
    setCodeText(newValue);
    debounceRef.current(newValue);
  };

  const handlerCopyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(id);
      toast.success("Room ID copied!", {
        position: "top-right",
        theme: "dark",
      });
    } catch (error) {
      toast.error("Failed to copy Room ID", {
        position: "top-right",
        theme: "dark",
      });
    }
  };

  const handlerLeaveRoom = () => {
    navigate("/");
  };

  async function decodeOutput(token) {
    try {
      const response = await axios.request({
        method: "GET",
        url: "https://judge0-ce.p.rapidapi.com/submissions/" + token,
        params: {
          base64_encoded: "false",
          fields: "*",
        },
        headers: {
          "x-rapidapi-key":
            "f18cc140f3msh04604cec00b1c02p18a1f3jsnd96c25c21552",
          "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
        },
      });
      console.log(response.data.stdout);
      setOutput(response.data.stdout);
      socketRef.current.emit("output-sync-req", {
        id,
        output: response.data.stdout || "No output",
      });
    } catch (error) {
      socketRef.current.emit("output-sync-req", {
        id,
        output: error.message || "Execution failed",
      });
      console.log("error while exe");
      setOutput("Error while executing code.");
    }
  }
  async function submitCode() {
    try {
      setOutput("Executing...");
      socketRef.current.emit("output-sync-req", {
        id,
        output: "Executing...",
      });
      const response = await axios.request({
        method: "POST",
        url: "https://judge0-ce.p.rapidapi.com/submissions",
        params: {
          base64_encoded: "true",
          wait: "false",
          fields: "*",
        },
        headers: {
          "x-rapidapi-key":
            "f18cc140f3msh04604cec00b1c02p18a1f3jsnd96c25c21552",
          "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
          "Content-Type": "application/json",
        },
        data: {
          language_id: 63,
          source_code: btoa(codeText),
          stdin: "",
        },
      });
      console.log(response.data);
      //here we are getting token and as response.data
      decodeOutput(response.data.token);
    } catch (error) {
      console.error(error);
      socketRef.current.emit("output-sync-req", {
        id,
        output: error.message || "Execution failed",
      });
      console.log("error while exe");
      setOutput("Error while executing code.");
    }
  }

  const myMeeting = (element) => {
    const appID = 1842127259;
    const serverSecret = "85f0b624542025e25978a20abdc88dc7";
    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appID,
      serverSecret,
      id,
      Date.now().toString(),
      username
    );
    const zp = ZegoUIKitPrebuilt.create(kitToken);
    zp.joinRoom({
      container: element,
      scenario: { mode: ZegoUIKitPrebuilt.GroupCall },
      showScreenSharingButton: false,
    });
  };

  const outputWithBreaks = output.split("\n").map((line, index) => (
    <div key={index} className="font-mono text-sm">
      {line}
    </div>
  ));

  return (
    <>
      <div className="max-md:hidden -z-10 w-full h-[100vh] text-slate-400 bg-slate-900 flex justify-center items-center flex-col p-10">
        <div className="w-full h-full z-30 flex">
          {/* Left Sidebar */}
          <div className="w-72 h-[98%] bg-gray-500/50 rounded-lg p-2 justify-center items-start">
            <div className="h-[70%] overflow-y-auto">
              <div className="m-1 text-md text-gray-300 font-bold">
                Connected Users ({users.length})
              </div>
              <div className="flex flex-wrap">
                {users.map((user, index) => (
                  <div key={index} className="m-1 flex flex-col items-center">
                    <Avatar
                      name={user.username}
                      size="45"
                      className="rounded-lg"
                      textSizeRatio={2.5}
                    />
                    <span className="text-xs text-gray-300 mt-1">
                      {user.username}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="h-[30%] w-full flex flex-col justify-center">
              <p className="pl-1 mb-1 font-bold text-white">Room Id:</p>
              <div className="w-full h-9 rounded-lg bg-gray-500/50 backdrop-blur-lg mb-2 flex items-center p-2 text-ellipsis overflow-hidden">
                <p className="text-gray-200 text-ellipsis whitespace-nowrap overflow-hidden">
                  {id}
                </p>
              </div>
              <button
                onClick={handlerCopyRoomId}
                className="text-white mb-2 bg-gradient-to-r from-green-300 to-green-500/80 w-full h-9 rounded-lg hover:opacity-90 transition-opacity"
              >
                Copy Room ID
              </button>
              <button
                className="text-white bg-gradient-to-r from-cyan-500 to-blue-500 w-full h-9 rounded-lg hover:opacity-90 transition-opacity"
                onClick={handlerLeaveRoom}
              >
                Leave Room
              </button>
            </div>
          </div>

          {/* Main Editor Area */}
          <div className="ml-3 w-full h-full rounded-lg flex">
            <AceEditor
              className="text-white bg-gray-500/50 h-96 rounded-lg"
              mode="javascript"
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
              width="100%"
              height="100%"
            />

            <div className="w-96 h-[99%] rounded-lg ml-5">
              <div className="w-full flex justify-end">
                <button
                  onClick={submitCode}
                  className="w-20 text-sm h-8 mb-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center"
                >
                  Run
                </button>
              </div>

              <div className="w-full h-[44%] bg-gray-500/40 p-3 rounded-lg">
                <p className="font-bold text-white mb-2">OUTPUT</p>
                <div className="h-[90%] overflow-y-auto  p-2 rounded">
                  {output ? (
                    outputWithBreaks
                  ) : (
                    <div className="text-gray-500 italic">
                      Output will appear here...
                    </div>
                  )}
                </div>
              </div>

              <div className="w-full mt-[2%] h-[44%] bg-gray-500/40 rounded-lg overflow-hidden">
                <div ref={myMeeting} className="w-full h-full" />
              </div>
            </div>
          </div>
        </div>

        <div className="w-full h-10 absolute bottom-0 flex justify-center items-center text-gray-400 text-sm">
          Developed By Tarun Kataria With ♥
        </div>
      </div>
      <NotWorking />
    </>
  );
}

export default CodeRoom;
