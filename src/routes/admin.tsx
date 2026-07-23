import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";


export const Route = createFileRoute("/admin")({
  component: Admin,
});


type Card = {
  id: number;
  name: string;
  category: string;
  price: string;
  oldPrice: string;
};



function Admin() {

  const navigate = useNavigate();


  // Vérification connexion admin

  useEffect(() => {

    const isAdmin = localStorage.getItem("adminAuth");

    if (!isAdmin) {

      navigate({
        to: "/admin-login",
      });

    }

  }, [navigate]);





  const defaultCards: Card[] = [

    {
      id: 1,
      name: "Canva Pro",
      category: "Design",
      price: "10 DT",
      oldPrice: "20 DT",
    },


    {
      id: 2,
      name: "Adobe Creative Cloud Pro",
      category: "Creative",
      price: "40 DT",
      oldPrice: "",
    },


    {
      id: 3,
      name: "Microsoft Office Professional Plus",
      category: "Productivity",
      price: "80 DT",
      oldPrice: "140 DT",
    },

  ];





  const [cards, setCards] = useState<Card[]>(() => {


    const saved = localStorage.getItem(
      "floatingCards"
    );


    if(saved){

      return JSON.parse(saved);

    }


    return defaultCards;


  });







  // Modifier une carte

  const updateCard = (
    id:number,
    field:keyof Card,
    value:string
  )=>{


    const updatedCards = cards.map((card)=>{


      if(card.id === id){


        return {

          ...card,

          [field]: value,

        };


      }


      return card;


    });



    setCards(updatedCards);


  };









  // Sauvegarde

  const saveCards = ()=>{


    localStorage.setItem(
      "floatingCards",
      JSON.stringify(cards)
    );



    // informe Hero/FloatingCard

    window.dispatchEvent(
      new Event("floatingCardsUpdated")
    );



    alert(
      "Floating Cards mises à jour ✅"
    );


  };









  // Logout

  const logout = ()=>{


    localStorage.removeItem(
      "adminAuth"
    );


    navigate({
      to:"/admin-login",
    });


  };









  return (

    <div
      className="
      min-h-screen
      bg-background
      p-6
      "
    >



      {/* HEADER */}

      <div
        className="
        flex
        justify-between
        items-center
        mb-10
        "
      >


        <h1
          className="
          text-3xl
          font-bold
          "
        >

          TunisiaSubs Admin

        </h1>




        <Button
          variant="destructive"
          onClick={logout}
        >

          Déconnexion

        </Button>



      </div>









      {/* FLOATING CARDS */}


      <div
        className="
        max-w-3xl
        rounded-3xl
        border
        p-6
        "
      >



        <h2
          className="
          text-2xl
          font-bold
          mb-6
          "
        >

          Gestion Floating Cards Hero

        </h2>







        {
          cards.map((card)=>(


            <div
              key={card.id}

              className="
              mb-6
              rounded-2xl
              border
              p-5
              space-y-4
              "
            >




              <h3
                className="
                font-bold
                text-lg
                "
              >

                Carte {card.id}

              </h3>









              <div>


                <label>
                  Nom produit
                </label>


                <input

                  className="
                  w-full
                  rounded-xl
                  border
                  p-3
                  "

                  value={card.name}

                  onChange={(e)=>
                    updateCard(
                      card.id,
                      "name",
                      e.target.value
                    )
                  }

                />


              </div>









              <div>


                <label>
                  Catégorie
                </label>


                <input

                  className="
                  w-full
                  rounded-xl
                  border
                  p-3
                  "

                  value={card.category}

                  onChange={(e)=>
                    updateCard(
                      card.id,
                      "category",
                      e.target.value
                    )
                  }

                />


              </div>









              <div>


                <label>
                  Prix
                </label>


                <input

                  className="
                  w-full
                  rounded-xl
                  border
                  p-3
                  "

                  value={card.price}

                  onChange={(e)=>
                    updateCard(
                      card.id,
                      "price",
                      e.target.value
                    )
                  }

                />


              </div>









              <div>


                <label>
                  Ancien prix
                </label>


                <input

                  className="
                  w-full
                  rounded-xl
                  border
                  p-3
                  "

                  value={card.oldPrice}

                  onChange={(e)=>
                    updateCard(
                      card.id,
                      "oldPrice",
                      e.target.value
                    )
                  }

                />


              </div>





            </div>


          ))
        }









        <Button

          onClick={saveCards}

          className="
          w-full
          "

        >

          Sauvegarder les modifications

        </Button>





      </div>




    </div>


  );


}
