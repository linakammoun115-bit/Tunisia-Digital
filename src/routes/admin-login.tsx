import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";


export const Route = createFileRoute("/admin-login")({
  component: AdminLogin,
});



function AdminLogin() {


  const navigate = useNavigate();


  const [password, setPassword] = useState("");

  const [error, setError] = useState("");




  // Mot de passe admin
  // Change-le ici

  const ADMIN_PASSWORD = "123456";







  const handleLogin = ()=>{


    if(password === ADMIN_PASSWORD){


      localStorage.setItem(
        "adminAuth",
        "true"
      );



      navigate({
        to:"/admin",
      });



    }else{


      setError(
        "Mot de passe incorrect ❌"
      );


    }



  };









  return (


    <div

      className="
      min-h-screen
      flex
      items-center
      justify-center
      bg-background
      p-6
      "

    >




      <div

        className="
        w-full
        max-w-md
        rounded-3xl
        border
        p-8
        shadow-lg
        "

      >




        <h1

          className="
          text-3xl
          font-bold
          text-center
          mb-8
          "

        >

          TunisiaSubs Admin

        </h1>







        <div className="space-y-4">



          <div>


            <label
              className="
              text-sm
              text-muted-foreground
              "
            >

              Mot de passe admin

            </label>



            <input


              type="password"


              className="
              w-full
              rounded-xl
              border
              p-3
              mt-2
              "

              placeholder="Entrer le mot de passe"


              value={password}


              onChange={(e)=>
                setPassword(
                  e.target.value
                )
              }


              onKeyDown={(e)=>{

                if(e.key === "Enter"){

                  handleLogin();

                }

              }}


            />



          </div>







          {
            error && (

              <p
                className="
                text-red-500
                text-sm
                "
              >

                {error}

              </p>

            )
          }








          <Button

            className="
            w-full
            "

            onClick={handleLogin}

          >

            Se connecter

          </Button>







        </div>






      </div>





    </div>


  );


}
