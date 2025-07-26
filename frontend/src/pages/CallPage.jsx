import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import useAuthUser from '../hooks/useAuthUser';
import { getStreamToken } from '../lib/api';

import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  CallControls,
  SpeakerLayout,
  StreamTheme,
  CallingState,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";

import "@stream-io/video-react-sdk/dist/css/styles.css";
import toast from "react-hot-toast";
import PageLoader from "../components/PageLoader";
import { useQuery } from '@tanstack/react-query';

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY

const CallPage = () => {

  const { id:callId } = useParams();
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);

  const { authUser, isLoading } = useAuthUser();

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser  // this query will run only when authUser is available
  })

  useEffect(() => {
/**
 * Initializes a Stream video call by configuring the video client with the user's details
 * and joining the specified call. Sets up the video client and call instance upon successful
 * connection. Displays an error toast if unable to join the call.
 * 
 * Preconditions:
 * - Valid stream token, authenticated user, and callId must be available.
 * 
 * Postconditions:
 * - The Stream video client and call instance are initialized and stored in state.
 * - User joins the video call successfully or an error message is displayed.
 */

    const initCall = async () => {
      if (!tokenData?.token || !authUser || !callId) return;

      try {
        console.log("Initializing Stream video client...");

        const user = {
          id: authUser._id,
          name: authUser.fullName,
          image: authUser.profilePic,
        };

        const videoClient = new StreamVideoClient({
          apiKey: STREAM_API_KEY,
          user,
          token: tokenData.token,
        });

        const callInstance = videoClient.call("default", callId);

        await callInstance.join({ create: true });

        console.log("Joined call successfully");

        setClient(videoClient);
        setCall(callInstance);
      } 
      catch (error) {
        console.error("Error joining call:", error);
        toast.error("Could not join the call. Please try again.");
      } 
      finally {
        setIsConnecting(false);
      }
    };

    initCall();
  }, [tokenData, authUser, callId]);

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <div className="relative">
        {client && call ? (
          <StreamVideo client={client}>
            <StreamCall call={call}>
              <CallContent />
            </StreamCall>
          </StreamVideo>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p>Could not initialize call. Please refresh or try again later.</p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Returns the content of the call page. If the user has left the call, redirects them to the homepage.
 * Otherwise, displays the call controls and speaker layout.
 */
const CallContent = () => {
  
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState()

  const navigate = useNavigate();
  
  if (callingState === CallingState.LEFT) return navigate("/");

  return (
    <StreamTheme>
      <SpeakerLayout />
      <CallControls />
    </StreamTheme>
  );
}

export default CallPage