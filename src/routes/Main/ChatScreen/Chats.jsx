import { useContext, useState, useMemo, useCallback, useEffect, useRef, Fragment} from "react";
import { ChatContext } from "../../../ChatProvider";
import { AuthContext } from "../../../AuthProvider";
import { db } from "../../../../firebase";
import { useForm } from "react-hook-form";
import { debounce } from 'lodash';
import dayjs from "dayjs";
import { useElementOnScreen } from "../../../IntersectionObserver";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { ref, onChildAdded, onChildChanged, onChildRemoved, query, orderByChild, startAt, limitToLast } from 'firebase/database'
import {fetchChats, addMessage, editMessage, deleteMessage} from './useChatData';


const Chats = () => {

  const { register, handleSubmit, resetField } = useForm();
  const { data } = useContext(ChatContext);
  const {currUser} = useContext(AuthContext);
  const queryClient = useQueryClient();

  const messagesContainerRef = useRef(null);
  const [clicked, setClicked] = useState(false);
  const [points, setPoints] = useState({x: 0, y: 0});
  const [editState, setEditState] = useState({});
  const [contextMenuData, setContextMenuData] = useState(null);
  const chatsRef = useMemo(() =>  ref(db, "messages/" + data.chatID + "/"));
  const endTimestamp = useRef(0);
  const userSentChat = useRef(false);
  const initialMount = useRef(true);

  const [containerRef, isVisible] = useElementOnScreen({
    root: null,
    rootMargin: "0px",
    threshold: 1.0,
  });


  const chatData = useQuery({
    enabled: false,
    refetchOnWindowFocus: false,
    queryKey: [data.chatID],
  });

  const lastTimestamp = useQuery({
    enabled: false,
    refetchOnWindowFocus: false,
    queryKey: ['timestamp'],
  });

  const handleClick = useCallback(() => {
    setClicked(false);
    setContextMenuData(null);
  }, []);

  const handleChildAdded = useCallback((snap) => {
    console.log('handleChildAdded run');

    console.log(snap.val());
    const existingData = queryClient.getQueryData([data.chatID]) ?? [];
    queryClient.setQueryData([data.chatID], [...existingData, snap.val()]);
  }, [data.chatID])

  const handleChildChanged = useCallback((snap) => {
    const existingData = queryClient.getQueryData([data.chatID]) ?? [];
    const updatedData = existingData.map((chat) =>
      chat.id === snap.key ? snap.val() : chat
    );

    queryClient.setQueryData([data.chatID], updatedData);

  }, [data.chatID]);

  const handleChildRemoved = useCallback((snap) => {
    const existingData = queryClient.getQueryData([data.chatID]);
    const updatedData = existingData.filter((chat) => chat.id !== snap.key);
    queryClient.setQueryData([data.chatID], updatedData);
  }, [data.chatID]);



  useEffect(() => {
    if (!data.chatID) {
      console.info("chatID undefined");
      return;
    }

    const addedListenerQuery = query(chatsRef, orderByChild("timestamp"), startAt(endTimestamp.current), limitToLast(10));
    const childAddedListener = onChildAdded(addedListenerQuery, handleChildAdded);


    console.log('setting listeners');
    const otherListenersQuery = query(chatsRef, orderByChild("timestamp"), startAt(endTimestamp.current))

    const childChangedListener = onChildChanged(otherListenersQuery, handleChildChanged);
    const childRemovedListener = onChildRemoved(otherListenersQuery, handleChildRemoved);
    window.addEventListener("click", handleClick);
    return () => {
      childAddedListener();
      childChangedListener();
      childRemovedListener();
      window.removeEventListener("click", handleClick);
    }
  }, [data.chatID]);


  const calcTime = (time) => {
    const currTime = Date.now()
    const formattedTime = dayjs(time).format('h:mm A');
    if (currTime - time < 86400000) {
      return 'Today at ' + formattedTime;
    } else if (currTime - time < 172800000 ) {
      return 'Yesterday at' + formattedTime;
    }
    return dayjs(time).format('MM/DD/YYYY h:m A');
  }


  const handleContextMenu = (e, chat) => {
    e.preventDefault();
    setClicked(true);

    setPoints({x: e.pageX, y: e.pageY});
    setContextMenuData({ chatID: chat.id, text: chat.text });
    console.log('right cliecked');
  }

  const handleFetchMore = useMemo(() => debounce(async() => {
      const messageData = await fetchChats(endTimestamp.current, chatsRef);
      endTimestamp.current = messageData[0].timestamp;
      queryClient.setQueryData([data.chatID], [...messageData, ...queryClient.getQueryData([data.chatID])]);
  }, 300), [data.chatID]);

  useEffect(() => {
    if (isVisible) {
      //handleFetchMore();
      console.log('yo');
    }
  }, [isVisible]);

  const handleAddMessage = async(text) => {
    const prevTimestamp = localStorage.getItem('timestamp');
    const timeData = await addMessage(text, data.chatID, currUser.displayName, db, chatData, prevTimestamp);
    resetField('text');
    userSentChat.current = true;
    if (timeData.renderState) {
      //queryClient.setQueryData(['timestamp'], timeData.time);
      localStorage.setItem('timestamp', timeData.time);
    }
  }



  return(
    <section className="w-full">
      <div ref={messagesContainerRef} className="overflow-y-auto max-h-[400px] no-scrollbar w-full">
          <div ref={containerRef} className="ring h-10">Hello</div>
          <div>
            {chatData.isError ? (
              <div>{chatData.error}</div>
            ) : (
              <div>

                {chatData.data?.map((chat) => (
                  <Fragment key={chat.id}>
                    <div onContextMenu={(e) => handleContextMenu(e, chat)} className="hover:bg-gray-600">
                      {chat.renderTimeAndSender && (
                            <div className="flex">
                              <div>{chat.sender}</div>
                              <div>{calcTime(chat.timestamp)}</div>

                            </div>

                        )}
                      <div className="flex flex-col w-full">



                        {editState[chat.id] ? (
                          <form onSubmit={handleSubmit((text) => {
                            editMessage(chat.id, text.editMessage, data.chatID, db);
                            setEditState({id: false});
                            resetField('editMessage');
                            })}
                          >
                            <input placeholder={chat.text} {...register('editMessage', { required: false, maxLength: 200 })} />
                          </form>

                        ) : (

                          <div className="text-xl font-bold py-2 w-max">{chat.text}</div>
                        )}


                      </div>
                    </div>

                  </Fragment>

                ))}
              </div>
            )}


          <form onSubmit={handleSubmit(handleAddMessage)}

          >
            <input placeholder="Type here..." {...register('text', { required: false, maxLength: 200})} />

          </form>

          <button onClick={handleFetchMore}>Load more</button>
        </div>


      </div>
      {clicked && (
        <div className="fixed bg-gray-500 border border-gray-600 shadow p-2 flex flex-col" style={{top: points.y, left: points.x}}>
          <button onClick={() => setEditState((prev) => ({...prev, [contextMenuData.chatID]: true }))}>Edit</button>
          <button onClick={() => deleteMessage(contextMenuData.chatID, db, data.chatID)}>Delete</button>
        </div>
      )}




    </section>
  )
}

export default Chats;
