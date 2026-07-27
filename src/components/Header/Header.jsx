import "./Header.css";

function Header({ toggleSidebar }) {

  return (

    <header className="header">

      <div className="logo">

        <span className="logo-icon">
          💬
        </span>

        <h1 className="logo-title">
          ConnectChat
        </h1>

      </div>

      <button
        className="menu-btn"
        onClick={toggleSidebar}
      >
        ☰
      </button>

    </header>

  );

}

export default Header;