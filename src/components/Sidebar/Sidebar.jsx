import "./Sidebar.css";

function Sidebar({
  onlineUsers,
  currentUser,
  sidebarOpen,
  closeSidebar,
}) {

  // Same colors as ChatWindow
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

  const getAvatarColor = (name) => {

    let hash = 0;

    for (let i = 0; i < name.length; i++) {

      hash += name.charCodeAt(i);

    }

    return avatarColors[
      hash % avatarColors.length
    ];

  };

  return (

    <>

      {/* Overlay (Mobile Only) */}

      <div
        className={
          sidebarOpen
            ? "sidebar-overlay show"
            : "sidebar-overlay"
        }
        onClick={closeSidebar}
      ></div>

      <aside
        className={
          sidebarOpen
            ? "sidebar open"
            : "sidebar"
        }
      >

        <div className="sidebar-header">

          <h3>

            Online Users ({onlineUsers.length})

          </h3>

        </div>

        {onlineUsers.map((user) => (

          <div
            className="user"
            key={user.id}
          >

            <div
              className="avatar"
              style={{
                background: getAvatarColor(
                  user.username
                ),
              }}
            >
              {user.username
                .charAt(0)
                .toUpperCase()}
            </div>

            <div className="user-info">

              <div className="user-top">

                <h4>{user.username}</h4>

                {user.username ===
                  currentUser && (

                  <span className="you-badge">

                    YOU

                  </span>

                )}

              </div>

              <div className="status-row">

                <span className="online-dot"></span>

                <span className="status-text">

                  Online

                </span>

              </div>

            </div>

          </div>

        ))}

      </aside>

    </>

  );

}

export default Sidebar;