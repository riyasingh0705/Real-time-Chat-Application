import { useEffect, useRef, useState } from "react";

import {
  Reply,
  Pencil,
  Copy,
  Trash2,
} from "lucide-react";

import "./ChatWindow.css";


function ChatWindow({
  messages,
  typingUser,
  onReaction,
  onReply,
  onEdit,
  deleteForMe,
  deleteForEveryone,
}) {


  const bottomRef = useRef(null);

  const reactionRef = useRef(null);


  const [menu, setMenu] = useState(null);

  const [copied, setCopied] = useState(false);

  const [activeReaction, setActiveReaction] = useState(null);

  const [deleteConfirm, setDeleteConfirm] = useState(false);



  const avatarColors = [
    "#6366F1",
    "#8B5CF6",
    "#EC4899",
    "#F97316",
    "#14B8A6",
    "#10B981",
    "#0EA5E9",
    "#F43F5E",
    "#F59E0B",
    "#22C55E",
  ];



  const emojis = [
    "👍",
    "❤️",
    "😂",
    "😮",
    "😢",
    "🙏",
  ];



  const getAvatarColor = (name) => {

    let hash = 0;


    for(let i=0;i<name.length;i++){

      hash += name.charCodeAt(i);

    }


    return avatarColors[
      hash % avatarColors.length
    ];

  };



  // Auto scroll

  useEffect(()=>{

    bottomRef.current?.scrollIntoView({
      behavior:"smooth",
    });


  },[messages,typingUser]);



  // Close context menu

  useEffect(()=>{


    const closeMenu = ()=>{

      setMenu(null);

    };


    window.addEventListener(
      "click",
      closeMenu
    );


    return ()=>{

      window.removeEventListener(
        "click",
        closeMenu
      );

    };


  },[]);



  // Close reaction popup when clicking outside

  useEffect(()=>{


    const closeReaction = (event)=>{


      if(
        reactionRef.current &&
        !reactionRef.current.contains(event.target)
      ){

        setActiveReaction(null);

      }


    };



    document.addEventListener(
      "mousedown",
      closeReaction
    );



    return ()=>{


      document.removeEventListener(
        "mousedown",
        closeReaction
      );


    };


  },[]);



  // Copy Message

  const copyMessage = async () => {

  try {

    const text = menu.message.text;


    if (navigator.clipboard && window.isSecureContext) {

      await navigator.clipboard.writeText(text);

    } else {

      const textarea = document.createElement("textarea");

      textarea.value = text;

      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";

      document.body.appendChild(textarea);

      textarea.focus();
      textarea.select();

      document.execCommand("copy");

      document.body.removeChild(textarea);

    }


    setCopied(true);


    setTimeout(() => {

      setCopied(false);

    }, 2000);


  } catch(error) {

    console.log(
      "Copy failed",
      error
    );

  }


  setMenu(null);

};

    return (

    <div className="chat-window">


      {messages.map((message,index)=>{


        if(message.system){


          return (

            <div
              key={message.id}
              className="system-message"
            >

              {message.text}

            </div>

          );


        }



        const previous = messages[index-1];



        const showAvatar =
          !message.own &&
          (
            !previous ||
            previous.system ||
            previous.sender !== message.sender
          );



        const showSender =
          !message.own &&
          (
            !previous ||
            previous.system ||
            previous.sender !== message.sender
          );




        return (

          <div
            key={message.id}
            className={`message-row ${
              message.own ? "own-row" : ""
            }`}
          >



            {!message.own && (

              showAvatar ?


              <div
                className="message-avatar"
                style={{
                  background:
                  getAvatarColor(message.sender)
                }}
              >

                {
                  message.sender
                  .charAt(0)
                  .toUpperCase()
                }


              </div>


              :

              <div className="avatar-placeholder"></div>


            )}




            <div className="message-group">



              {showSender && (

                <div className="sender">

                  {message.sender}

                </div>

              )}




              <div

                className={`message ${
                  message.own ? "own" : ""
                }`}


                onContextMenu={(e)=>{


                  e.preventDefault();



                  const menuWidth = 300;
                  const menuHeight = 250;
                  const padding = 24;



                  let x = e.clientX;
                  let y = e.clientY;



                  if(
                    x + menuWidth >
                    window.innerWidth - padding
                  ){

                    x =
                    window.innerWidth -
                    menuWidth -
                    padding;

                  }



                  if(
                    y + menuHeight >
                    window.innerHeight - padding
                  ){

                    y =
                    window.innerHeight -
                    menuHeight -
                    padding;

                  }




                  if(x < padding){

                    x = padding;

                  }




                  if(y < padding){

                    y = padding;

                  }



                  setMenu({

                    id:message.id,

                    x,

                    y,

                    message,

                  });



                }}

              >




                {message.reply && (

                  <div className="reply-box">


                    <div className="reply-name">

                      {message.reply.sender}

                    </div>


                    <div className="reply-content">

                      {message.reply.text}

                    </div>


                  </div>

                )}





                <p>

                  {message.text}

                </p>




                <div className="time">


                  {message.edited && (

                    <span className="edited-text">

                      edited

                    </span>

                  )}



                  <span className="message-time">

                    {message.time}

                  </span>


                </div>

                            {
                  message.reactions &&
                  Object.keys(message.reactions).length > 0 &&

                  <div className="reactions">


                    {
                      Object.entries(message.reactions).map(
                        ([emoji, users]) => (


                          <div

                            key={emoji}

                            ref={reactionRef}

                            className="reaction-wrapper"


                            onClick={(e)=>{


                              e.stopPropagation();


                              setActiveReaction(

                                activeReaction ===
                                message.id + emoji

                                ?

                                null

                                :

                                message.id + emoji

                              );


                            }}

                          >



                            <div className="reaction">


                              {emoji} {users.length}


                            </div>





                            {
                              activeReaction ===
                              message.id + emoji && (


                                <div className="reaction-popup">


                                  <div className="reaction-title">


                                    {emoji} {users.length}


                                  </div>




                                  <div className="reaction-line"></div>





                                  {
                                    users.map(
                                      (user,index)=>(


                                        <div

                                          key={index}

                                          className="reaction-user"

                                        >

                                          {user}

                                        </div>


                                      )
                                    )
                                  }




                                </div>


                              )
                            }



                          </div>


                        )
                      )
                    }



                  </div>


                }


              </div>


            </div>


          </div>


        );


      })}

    
      {
        typingUser && (

          <div className="typing-indicator">


            <span className="typing-name">

              {typingUser}

            </span>


            <span>
              is typing
            </span>


            <span className="dots">

              <span>.</span>
              <span>.</span>
              <span>.</span>

            </span>


          </div>

        )
      }





      {/* CONTEXT MENU */}

      {
        menu && (

          <div

            className="context-menu"

            style={{
              top:menu.y,
              left:menu.x,
            }}


            onClick={(e)=>e.stopPropagation()}

          >




            {/* Emoji reactions */}


            <div className="context-emojis">


              {
                emojis.map((emoji)=>(


                  <button

                    key={emoji}

                    className="emoji-btn"


                    onClick={()=>{


                      onReaction?.(
                        menu.id,
                        emoji
                      );


                      setMenu(null);


                    }}

                  >

                    {emoji}


                  </button>


                ))
              }


            </div>





            <div className="context-divider"></div>





            {/* Reply */}


            <button

              className="menu-item"

              onClick={()=>{


                onReply(menu.message);


                setMenu(null);


              }}

            >

              <Reply
                size={18}
                className="menu-icon"
              />

              Reply


            </button>





            {/* Edit */}

            {
              menu.message.own && (

                <button

                  className="menu-item"

                  onClick={()=>{


                    onEdit({

                      id:menu.message.id,

                      text:menu.message.text,

                    });



                    setMenu(null);


                  }}

                >


                  <Pencil
                    size={18}
                    className="menu-icon"
                  />


                  Edit


                </button>

              )
            }







            {/* Copy */}


            <button

              className="menu-item"

              onClick={copyMessage}

            >

              <Copy
                size={18}
                className="menu-icon"
              />

              Copy


            </button>






            {/* Delete */}


            <button

              className="menu-item delete"

              onClick={()=>{


                setDeleteConfirm(true);


              }}

            >


              <Trash2
                size={18}
                className="menu-icon"
              />


              Delete


            </button>






            {
              deleteConfirm && (

                <div className="delete-popup">


                  <div className="delete-title">

                    Delete message?

                  </div>





                  <button

                    className="menu-item"

                    onClick={()=>{


                      deleteForMe(
                        menu.message.id
                      );


                      setDeleteConfirm(false);

                      setMenu(null);


                    }}

                  >

                    Delete for me


                  </button>





                  {
                    menu.message.own && (

                      <button

                        className="menu-item delete"


                        onClick={()=>{


                          deleteForEveryone(
                            menu.message.id
                          );


                          setDeleteConfirm(false);

                          setMenu(null);


                        }}

                      >

                        Delete for everyone


                      </button>


                    )
                  }





                  <button

                    className="menu-item cancel"

                    onClick={()=>{


                      setDeleteConfirm(false);


                    }}

                  >

                    Cancel


                  </button>



                </div>


              )
            }





          </div>

        )
      }






      {/* COPY TOAST */}


      {
        copied && (

          <div className="copy-toast">

            Message copied

          </div>

        )
      }





      <div ref={bottomRef}></div>


    </div>

  );


}


export default ChatWindow;