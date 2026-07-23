import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  ShieldCheck,
  Sparkles,
  Zap,
  Star,
  Gift,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
const subscriptions = [
  {
    name: "ChatGPT Plus",
    price: "20 DT",
    badge: "Best Seller",
    icon: "🤖",
    color: "from-emerald-400 to-green-600",
  },
  {
    name: "Canva Pro",
    price: "15 DT",
    badge: "Popular",
    icon: "🎨",
    color: "from-purple-400 to-pink-600",
  },
  {
    name: "Spotify Premium",
    price: "12 DT",
    badge: "Hot",
    icon: "🎵",
    color: "from-green-400 to-green-700",
  },
  {
    name: "Netflix Premium",
    price: "25 DT",
    badge: "Limited Offer",
    icon: "🎬",
    color: "from-red-500 to-red-800",
  },
  {
    name: "Microsoft 365",
    price: "18 DT",
    badge: "Pro",
    icon: "💻",
    color: "from-blue-400 to-blue-700",
  },
  {
    name: "Gemini Advanced",
    price: "22 DT",
    badge: "New",
    icon: "✨",
    color: "from-indigo-400 to-purple-700",
  },
];


const stats = [
  {
    value: "5000+",
    label: "Clients satisfaits",
  },
  {
    value: "4.9★",
    label: "Note moyenne",
  },
  {
    value: "< 5 min",
    label: "Livraison instantanée",
  },
  {
    value: "100%",
    label: "Paiement sécurisé",
  },
];


export function Hero() {

  const [menuOpen, setMenuOpen] = useState(false);


  return (
    <section
      className="
      relative
      min-h-screen
      overflow-hidden
      bg-[#050816]
      text-white
      "
    >

      {/* BACKGROUND EFFECTS */}

      <div className="absolute inset-0 overflow-hidden">


        <motion.div
          animate={{
            x:[0,100,0],
            y:[0,-80,0],
          }}
          transition={{
            duration:12,
            repeat:Infinity,
            ease:"easeInOut"
          }}
          className="
          absolute
          top-[-200px]
          left-[-150px]
          w-[500px]
          h-[500px]
          rounded-full
          bg-purple-600/30
          blur-[120px]
          "
        />


        <motion.div
          animate={{
            x:[0,-120,0],
            y:[0,100,0],
          }}
          transition={{
            duration:14,
            repeat:Infinity,
            ease:"easeInOut"
          }}
          className="
          absolute
          right-[-150px]
          top-[200px]
          w-[450px]
          h-[450px]
          rounded-full
          bg-cyan-500/30
          blur-[120px]
          "
        />


        <div
          className="
          absolute
          inset-0
          opacity-[0.15]
          bg-[linear-gradient(#ffffff12_1px,transparent_1px),linear-gradient(90deg,#ffffff12_1px,transparent_1px)]
          bg-[size:50px_50px]
          "
        />


      </div>



      {/* NAVBAR */}

      <nav
        className="
        relative
        z-20
        flex
        items-center
        justify-between
        px-6
        lg:px-16
        py-6
        "
      >

        <div
          className="
          flex
          items-center
          gap-2
          text-2xl
          font-bold
          "
        >

          <Sparkles
            className="
            text-cyan-400
            "
          />

          TunisiaSubs

        </div>



        <div
          className="
          hidden
          md:flex
          items-center
          gap-8
          text-sm
          text-white/70
          "
        >

          <a>
            Abonnements
          </a>

          <a>
            Comment ça marche
          </a>

          <a>
            FAQ
          </a>


          <button
            className="
            rounded-full
            bg-white
            text-black
            px-5
            py-2
            font-semibold
            hover:scale-105
            transition
            "
          >
            Commencer
          </button>

        </div>



        <button
          onClick={()=>setMenuOpen(!menuOpen)}
          className="
          md:hidden
          "
        >

          {
            menuOpen ?
            <X/>
            :
            <Menu/>
          }

        </button>


      </nav>



      {/* HERO CONTENT */}


      <div
        className="
        relative
        z-10
        max-w-7xl
        mx-auto
        px-6
        pt-16
        lg:pt-24
        "
      >


        <motion.div
          initial={{
            opacity:0,
            y:40
          }}
          animate={{
            opacity:1,
            y:0
          }}
          transition={{
            duration:.8
          }}
          className="
          max-w-3xl
          "
        >


          <div
            className="
            inline-flex
            items-center
            gap-2
            rounded-full
            border
            border-white/10
            bg-white/5
            backdrop-blur-xl
            px-4
            py-2
            text-sm
            mb-8
            "
          >

            <Zap
              size={16}
              className="text-yellow-400"
            />

            La plateforme #1 des abonnements digitaux en Tunisie

          </div>



          <h1
            className="
            text-5xl
            md:text-7xl
            font-black
            leading-tight
            "
          >

            Tous vos services premium.

            <span
              className="
              block
              bg-gradient-to-r
              from-cyan-400
              via-purple-400
              to-pink-500
              bg-clip-text
              text-transparent
              "
            >
              Moins cher. Instantanément.
            </span>

          </h1>


          <p
            className="
            mt-6
            text-lg
            text-white/60
            max-w-xl
            "
          >
            Accédez à ChatGPT Plus, Canva Pro, Netflix,
            Spotify et plusieurs services premium avec
            livraison rapide et paiement sécurisé.
          </p>



          <div
            className="
            flex
            flex-wrap
            gap-4
            mt-8
            "
          >

            <button
              className="
              group
              flex
              items-center
              gap-3
              rounded-full
              bg-white
              text-black
              px-7
              py-4
              font-bold
              hover:scale-105
              transition
              "
            >

              Voir les offres

              <ArrowRight
                className="
                group-hover:translate-x-1
                transition
                "
              />

            </button>


            <button
              className="
              flex
              items-center
              gap-2
              rounded-full
              border
              border-white/20
              bg-white/5
              backdrop-blur-xl
              px-7
              py-4
              "
            >
              <Gift size={18}/>
              Wheel Game
            </button>
          </div>
        </motion.div>
                {/* FLOATING SUBSCRIPTION CARDS */}

        <div
          className="
          relative
          mt-20
          lg:absolute
          lg:right-10
          lg:top-40
          lg:w-[520px]
          h-[520px]
          "
        >

          {subscriptions.map((sub, index) => (

            <motion.div
              key={sub.name}

              initial={{
                opacity:0,
                scale:.8
              }}

              animate={{
                opacity:1,
                scale:1,
                y:[
                  0,
                  index % 2 === 0 ? -18 : 18,
                  0
                ]
              }}

              transition={{
                duration:5 + index,
                repeat:Infinity,
                ease:"easeInOut"
              }}


              className={`
              absolute
              w-[190px]
              md:w-[210px]

              rounded-3xl
              border
              border-white/10

              bg-white/[0.08]

              backdrop-blur-2xl

              shadow-2xl

              p-5

              hover:scale-110

              transition

              ${

                index===0
                ?
                "top-0 left-20"
                :
                index===1
                ?
                "top-20 right-0"
                :
                index===2
                ?
                "top-52 left-0"
                :
                index===3
                ?
                "bottom-40 right-10"
                :
                index===4
                ?
                "bottom-0 left-32"
                :
                "bottom-20 right-48"

              }

              `}
            >


              {/* GLOW */}

              <div
                className={`
                absolute
                inset-0
                rounded-3xl
                bg-gradient-to-br
                ${sub.color}
                opacity-20
                blur-xl
                `}
              />


              <div
                className="
                relative
                "
              >


                {/* BADGE */}

                <div
                  className="
                  absolute
                  -top-3
                  -right-3

                  rounded-full

                  bg-gradient-to-r
                  from-yellow-400
                  to-orange-500

                  text-black

                  text-xs

                  font-bold

                  px-3
                  py-1
                  "
                >

                  {sub.badge}

                </div>



                {/* ICON */}

                <div
                  className="
                  text-4xl
                  mb-4
                  "
                >

                  {sub.icon}

                </div>



                <h3
                  className="
                  font-bold
                  text-lg
                  "
                >

                  {sub.name}

                </h3>



                <div
                  className="
                  flex
                  items-center
                  justify-between
                  mt-4
                  "
                >

                  <span
                    className="
                    font-black
                    text-xl
                    "
                  >

                    {sub.price}

                  </span>


                  <div
                    className="
                    rounded-full
                    bg-green-500/20
                    text-green-400
                    p-2
                    "
                  >

                    <Check
                      size={16}
                    />

                  </div>


                </div>


              </div>


            </motion.div>


          ))}



          {/* CENTER WHEEL GAME */}


          <motion.div

            animate={{
              rotate:[0,5,-5,0]
            }}

            transition={{
              duration:6,
              repeat:Infinity
            }}

            className="
            absolute
            top-[190px]
            left-[170px]

            w-[180px]
            h-[180px]

            rounded-full

            bg-gradient-to-br
            from-yellow-400
            via-orange-500
            to-red-500

            flex
            flex-col
            items-center
            justify-center

            text-black

            shadow-[0_0_80px_rgba(255,180,0,.5)]

            "
          >


            <Gift
              size={40}
            />


            <span
              className="
              font-black
              text-lg
              "
            >

              WIN

            </span>


            <span
              className="
              text-sm
              font-semibold
              "
            >

              Wheel Game

            </span>
          </motion.div>
        </div>
                {/* TRUST STATS */}

        <motion.div

          initial={{
            opacity:0,
            y:30
          }}

          whileInView={{
            opacity:1,
            y:0
          }}

          transition={{
            duration:.8
          }}

          className="
          mt-20

          grid
          grid-cols-2
          md:grid-cols-4

          gap-4

          max-w-4xl

          "
        >

          {stats.map((item)=>(

            <div

              key={item.label}

              className="
              rounded-3xl

              border
              border-white/10

              bg-white/[0.05]

              backdrop-blur-xl

              p-5

              text-center

              "

            >

              <h3
                className="
                text-3xl
                font-black
                bg-gradient-to-r
                from-cyan-400
                to-purple-400
                bg-clip-text
                text-transparent
                "
              >

                {item.value}

              </h3>


              <p
                className="
                mt-2
                text-sm
                text-white/60
                "
              >

                {item.label}

              </p>


            </div>

          ))}


        </motion.div>




        {/* SECURITY BADGES */}


        <div

          className="
          flex
          flex-wrap
          gap-4
          mt-10
          "

        >


          <div

            className="
            flex
            items-center
            gap-3

            rounded-full

            bg-white/5

            border
            border-white/10

            backdrop-blur-xl

            px-5
            py-3

            text-sm

            "

          >

            <ShieldCheck
              className="
              text-green-400
              "
            />

            Paiement sécurisé

          </div>



          <div

            className="
            flex
            items-center
            gap-3

            rounded-full

            bg-white/5

            border
            border-white/10

            backdrop-blur-xl

            px-5
            py-3

            text-sm

            "

          >

            <Zap
              className="
              text-yellow-400
              "
            />

            Livraison automatique

          </div>



          <div

            className="
            flex
            items-center
            gap-3

            rounded-full

            bg-white/5

            border
            border-white/10

            backdrop-blur-xl

            px-5
            py-3

            text-sm

            "

          >

            <Star
              className="
              text-orange-400
              "
            />

            Service premium

          </div>



        </div>



      </div>




      {/* MOBILE MENU */}

      {
        menuOpen && (

          <motion.div

            initial={{
              opacity:0,
              y:-20
            }}

            animate={{
              opacity:1,
              y:0
            }}

            className="
            absolute
            top-20
            left-5
            right-5

            z-50

            rounded-3xl

            border
            border-white/10

            bg-[#0b1020]/90

            backdrop-blur-xl

            p-6

            md:hidden

            "

          >

            <div
              className="
              flex
              flex-col
              gap-5
              text-white/80
              "
            >

              <a>
                Abonnements
              </a>

              <a>
                Comment ça marche
              </a>


              <a>
                FAQ
              </a>



              <button

                className="
                rounded-full

                bg-white

                text-black

                py-3

                font-bold

                "

              >

                Commencer

              </button>


            </div>


          </motion.div>

        )
      }
    </section>

  );

}
        
