
import { useState } from "react";


export default function Home() {

  const [username, setUsername] = useState ("");
  const [password, setPassword] = useState ("");


  const testUsername = "diexiy";
  const testPassword = "lösenord";

  const handleLogin = ( e: React.MouseEvent) => {
      e.preventDefault();


      if ( username === testUsername && password === testPassword) {

          window.location.href = "/";
      } else {
          alert ("fel användernamn eller lösenord!!!");
      }
    }; 



      const reg_button = (e: React.MouseEvent) => {

          e.preventDefault();

          window.location.href = "/register";

  };


  
  
  return (
    
    <div style={{
      height: "100vh",         // full höjd på skärmen
      display: "flex",         // aktiverar flexbox
      justifyContent: "center", // centrerar horisontellt
      alignItems: "center",     // centrerar vertikalt
      flexDirection: "column",  // staplar allt uppifrån och ner
    }}>

      <h2> Logga in </h2>
      <form>

        <div>
            <label htmlFor="username">Användarnamn:</label><br />
            <input type="text" id="username" name="username" value= {username} onChange={(e) => setUsername(e.target.value)}/>

        </div>

        <div>
            <label htmlFor="password">Lösenord:</label>
            <br />
            <input type="password" id="password" name="password" value = {password} onChange={(e) => setPassword(e.target.value)}/>
        </div>
        < br />

          <button onClick={handleLogin}>Logga in</button> <br />

          <br />

          <br />
            <label> dont have an account? Create one! </label>

            < br />
          < button onClick= {reg_button}> Create account </button>

      </form>




    </div>


    );
  }
  