import { useEffect, useRef, useState } from "react";
import CallMember from "../../components/callMember/callMember";
import "./Call.css";
import * as signalR from "@microsoft/signalr";

function Call() {
  const localVideoRef = useRef(null);
  const screenShareRef = useRef(null);
  const connectionRef = useRef(null);
  const peersRef = useRef({});
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const [participants, setParticipants] = useState([]);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [mainVideo, setMainVideo] = useState(null);
  const roomId = "1";
  // Use a persistent userId that won't change on refresh
  const userId =
    localStorage.getItem("callUserId") ||
    Math.random().toString(36).substring(2, 9);

  // Store userId in localStorage to keep it persistent across refreshes
  useEffect(() => {
    if (!localStorage.getItem("callUserId")) {
      localStorage.setItem("callUserId", userId);
    }
  }, [userId]);

  useEffect(() => {
    const startCall = async () => {
      try {
        //Cream Conexiunea cu SignalR
        const connection = new signalR.HubConnectionBuilder()
          .withUrl(`https://localhost:7242/Call?userId=${userId}`) // Pass userId in query string
          .withAutomaticReconnect()
          .build();

        setupSignalRHandlers(connection);

        await connection.start();
        console.log("SignalR connected");
        connectionRef.current = connection;

        // Get local stream
        const localStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });

        localStreamRef.current = localStream;

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
        }

        // Intram in camera dupa ce avea stream-ul local
        await connection.invoke("JoinRoom", roomId);
        console.log(`Joined room ${roomId} as user ${userId}`);
      } catch (error) {
        console.error("Error starting call:", error);
      }
    };

    // Set up all SignalR handlers
    const setupSignalRHandlers = (connection) => {
      // Handle pentru intrarea unui nou user
      connection.on("UserJoined", async (newUserId) => {
        console.log(`User ${newUserId} joined the room`);

        if (newUserId !== userId && localStreamRef.current) {
          // Cream o noua conexiune pt user-ul asta
          await createPeerConnection(newUserId, localStreamRef.current, true);
        }
      });

      // Handle pentru iesirea unui user
      connection.on("UserLeft", (departedUserId) => {
        console.log(`User ${departedUserId} left the room`);

        if (peersRef.current[departedUserId]) {
          peersRef.current[departedUserId].close();
          delete peersRef.current[departedUserId];
        }

        setParticipants((prevParticipants) =>
          prevParticipants.filter((p) => p.id !== departedUserId)
        );
      });

      connection.on("ReceiveSignal", async (fromUserId, signalData) => {
        console.log(`Received signal from ${fromUserId}:`, signalData);

        try {
          const signal = JSON.parse(signalData);

          if (fromUserId !== userId && localStreamRef.current) {
            if (signal.offer) {
              await handleOffer(
                fromUserId,
                signal.offer,
                localStreamRef.current
              );
            } else if (signal.answer && peersRef.current[fromUserId]) {
              await peersRef.current[fromUserId].setRemoteDescription(
                new RTCSessionDescription(signal.answer)
              );
            } else if (signal.ice && peersRef.current[fromUserId]) {
              try {
                await peersRef.current[fromUserId].addIceCandidate(
                  new RTCIceCandidate(signal.ice)
                );
              } catch (e) {
                console.error("Error adding ICE candidate:", e);
              }
            }
          }
        } catch (error) {
          console.error("Error handling signal:", error);
        }
      });

      // Lista cu useri din camera
      connection.on("ExistingUsers", async (existingUsers) => {
        console.log("Existing users:", existingUsers);

        if (localStreamRef.current) {
          // Cream peer connection pt fiecare user din camera
          for (const existingUser of existingUsers) {
            if (existingUser !== userId) {
              try {
                await createPeerConnection(
                  existingUser,
                  localStreamRef.current,
                  false
                );
              } catch (error) {
                console.error(
                  `Error creating peer connection for ${existingUser}:`,
                  error
                );
              }
            }
          }
        }
      });
    };

    // Creare de peer connetion pt un anumit user
    const createPeerConnection = async (peerId, stream, isInitiator) => {
      // Verificam daca avem deja o conexiune cu acesta
      if (peersRef.current[peerId]) {
        console.log(`Already have a connection to ${peerId}, closing old one`);
        peersRef.current[peerId].close();
      }

      // Stun serverele
      const peer = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
          {
            urls: "turn:openrelay.metered.ca:80",
            username: "openrelayproject",
            credential: "openrelayproject",
          },
        ],
        iceCandidatePoolSize: 10,
      });

      peersRef.current[peerId] = peer;

      // Adaugam stream-urie locale pt fiecare peer
      stream.getTracks().forEach((track) => {
        console.log(`Adding track to peer ${peerId}:`, track.kind);
        peer.addTrack(track, stream);
      });

      peer.onicecandidate = ({ candidate }) => {
        if (candidate) {
          console.log(`Sending ICE candidate to ${peerId}`);
          connectionRef.current.invoke(
            "SendSignal",
            roomId,
            userId,
            peerId,
            JSON.stringify({ ice: candidate })
          );
        }
      };

      peer.onconnectionstatechange = () => {
        console.log(`Peer ${peerId} connection state:`, peer.connectionState);
      };

      peer.onicegatheringstatechange = () => {
        console.log(
          `Peer ${peerId} ICE gathering state:`,
          peer.iceGatheringState
        );
      };

      peer.onsignalingstatechange = () => {
        console.log(`Peer ${peerId} signaling state:`, peer.signalingState);
      };

      peer.ontrack = (event) => {
        console.log(`Got track from ${peerId}:`, event.track.kind);

        const remoteStream = event.streams[0];

        if (remoteStream) {
          setParticipants((prev) => {
            const filtered = prev.filter((p) => p.id !== peerId);

            return [
              ...filtered,
              {
                id: peerId,
                stream: remoteStream,
                name: `User ${peerId.substring(0, 4)}`,
              },
            ];
          });
        }
      };

      // Creem si trimitem oferta
      if (isInitiator) {
        try {
          const offer = await peer.createOffer();
          console.log(`Created offer for ${peerId}`);

          await peer.setLocalDescription(offer);
          console.log(`Set local description for ${peerId}`);

          connectionRef.current.invoke(
            "SendSignal",
            roomId,
            userId,
            peerId,
            JSON.stringify({ offer: peer.localDescription })
          );
        } catch (error) {
          console.error(`Error creating offer for ${peerId}:`, error);
        }
      }

      return peer;
    };

    // Raspundem la o oferta de la alt peer
    const handleOffer = async (peerId, offer, localStream) => {
      let peer = peersRef.current[peerId];

      if (!peer) {
        peer = await createPeerConnection(peerId, localStream, false);
      }

      try {
        await peer.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peer.createAnswer();

        await peer.setLocalDescription(answer);

        connectionRef.current.invoke(
          "SendSignal",
          roomId,
          userId,
          peerId,
          JSON.stringify({ answer: peer.localDescription })
        );
      } catch (error) {
        console.error(`Error handling offer from ${peerId}:`, error);
      }
    };

    startCall();

    return () => {
      // Inchidem conexiunile
      Object.values(peersRef.current).forEach((peer) => {
        if (peer && peer.close) {
          peer.close();
        }
      });

      // Parasim camera in care ne aflam
      if (
        connectionRef.current &&
        connectionRef.current.state === "Connected"
      ) {
        connectionRef.current.invoke("LeaveRoom", roomId).catch(console.error);
        connectionRef.current.stop().catch(console.error);
      }

      // Oprim stream-urile
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }

      // Oprim screen share-ul
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Buton camera
  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
      }
    }
    console.log(participants);
  };

  // Buton audio
  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
      }
    }
  };

  // Buton ShareScreen
  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });

        screenStreamRef.current = screenStream;

        if (screenShareRef.current) {
          screenShareRef.current.srcObject = screenStream;
        }

        screenStream.getVideoTracks()[0].onended = () => {
          stopScreenSharing();
        };

        // Afisam share-ul si pt ceilalti participanti
        Object.entries(peersRef.current).forEach(([peerId, peer]) => {
          // Replace video track with screen track for each peer
          const sender = peer
            .getSenders()
            .find((s) => s.track && s.track.kind === "video");

          if (sender) {
            sender.replaceTrack(screenStream.getVideoTracks()[0]);
          }
        });

        setIsScreenSharing(true);
      } else {
        stopScreenSharing();
      }
    } catch (error) {
      console.error("Error toggling screen share:", error);
    }
  };

  // Oprire Share
  const stopScreenSharing = () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop());

      if (localStreamRef.current) {
        const videoTrack = localStreamRef.current.getVideoTracks()[0];

        if (videoTrack) {
          Object.values(peersRef.current).forEach((peer) => {
            const sender = peer
              .getSenders()
              .find((s) => s.track && s.track.kind === "video");

            if (sender) {
              sender.replaceTrack(videoTrack);
            }
          });
        }
      }

      screenStreamRef.current = null;
      setIsScreenSharing(false);
    }
  };

  const toggleVideoMain = (id, source) => {
    const video = document.getElementById("main-video");
    const main = document.getElementById("main");
    const calls = document.getElementById("all-calls");

    if (id !== mainVideo) {
      video.style.display = "flex";
      calls.style.paddingTop = "10px";

      if (main) {
        main.srcObject = source;
      }

      setMainVideo(id);
    } else {
      video.style.display = "none";
      calls.style.paddingTop = "60px";

      if (main) {
        main.srcObject = null;
      }

      setMainVideo(null);
    }
  };

  return (
    <div className="container-call">
      <div id="main-video">
        <video
          id="main"
          autoPlay
          playsInline
          className="call-member-video"
        ></video>
      </div>
      <div id="all-calls" className="all-calls">
        {/* Video-ul local */}
        <div className="call-member-container">
          <video
            className="call-member-video"
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
          ></video>
          <div className="call-member-name">You ({userId.substring(0, 4)})</div>
        </div>
        {participants.map((participant) =>
          participant.stream ? (
            <div
              key={participant.id}
              id={participant.id}
              className="call-member-container"
              onClick={(element) => {
                if (element && participant.stream) {
                  toggleVideoMain(participant.id, participant.stream);
                }
              }}
            >
              <video
                className="call-member-video"
                autoPlay
                playsInline
                ref={(element) => {
                  if (element && participant.stream) {
                    element.srcObject = participant.stream;
                  }
                }}
              ></video>
              <div className="call-member-name">{participant.name}</div>
            </div>
          ) : (
            <CallMember
              onClick={(element) => {
                if (element && participant.stream) {
                  toggleVideoMain(participant.id, participant.stream);
                }
              }}
              id={participant.id}
              key={participant.id}
              name={participant.name}
              image="https://i.pinimg.com/736x/f1/0f/f7/f10ff70a7155e5ab666bcdd1b45b726d.jpg"
            ></CallMember>
          )
        )}
        <CallMember
          name="Membru1"
          image="https://i.redd.it/rrrtcx1xq5mc1.jpeg"
        />
        <CallMember
          name="Ma-ta"
          image="https://i.pinimg.com/474x/51/e9/a5/51e9a52f8a061a560925605c816a41b8.jpg"
        />
      </div>
      <div className="controller">
        <button className="controller-button" onClick={toggleAudio}>
          Mic
        </button>
        <button className="controller-button" onClick={toggleVideo}>
          Camera
        </button>
        <button
          className="controller-button"
          onClick={toggleScreenShare}
          style={isScreenSharing ? { backgroundColor: "#4CAF50" } : {}}
        >
          {isScreenSharing ? "Stop Share" : "Share Screen"}
        </button>
        <button
          className="controller-button"
          onClick={() => (window.location.href = "/")}
        >
          Leave
        </button>
      </div>
    </div>
  );
}

export default Call;
