import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";


export const Route = createFileRoute("/admin")({
  component: Admin,
});


type Product = {
  id:number;
  name:string;
  price:string;
  active:boolean;
};


type FloatingCard = {
  id:number;
  name:string;
  category:string;
  price:string;
  oldPrice:string;
  active:boolean;
};




function Admin(){


const navigate = useNavigate();



useEffect(()=>{

const auth = localStorage.getItem("adminAuth");

if(!auth){

navigate({
to:"/admin-login"
});

}

},[navigate]);





// =====================
// PRODUITS
// =====================


const [products,setProducts]=useState<Product[]>(()=>{


const saved = localStorage.getItem("products");


return saved 
? JSON.parse(saved)
:
[
{
id:1,
name:"Canva Pro",
price:"10 DT",
active:true
},
{
id:2,
name:"Adobe Pro",
price:"40 DT",
active:true
}
];


});







// =====================
// FLOATING CARDS
// =====================


const [cards,setCards]=useState<FloatingCard[]>(()=>{


const saved =
localStorage.getItem("floatingCards");


return saved
?
JSON.parse(saved)
:
[
{
id:1,
name:"Canva Pro",
category:"Design",
price:"10 DT",
oldPrice:"20 DT",
active:true
},
{
id:2,
name:"Adobe Creative Cloud",
category:"Creative",
price:"40 DT",
oldPrice:"",
active:true
},
{
id:3,
name:"Microsoft Office",
category:"Productivity",
price:"80 DT",
oldPrice:"140 DT",
active:true
}
];


});







// =====================
// CLIENTS / COMMANDES
// =====================


const [clients] = useState([
{
id:1,
name:"Client test",
status:"Actif"
}
]);



const [orders] = useState([
{
id:1,
product:"Canva Pro",
status:"En attente"
}
]);







// =====================
// SAUVEGARDE
// =====================


const saveCards = ()=>{


localStorage.setItem(
"floatingCards",
JSON.stringify(cards)
);


window.dispatchEvent(
new Event("floatingCardsUpdated")
);



alert(
"Floating Cards sauvegardées ✅"
);


};






const saveProducts = ()=>{


localStorage.setItem(
"products",
JSON.stringify(products)
);


alert(
"Produits sauvegardés ✅"
);


};







const updateCard=(id:number,field:keyof FloatingCard,value:any)=>{


setCards(
cards.map(card=>

card.id===id
?
{
...card,
[field]:value
}
:
card

)
);


};






const logout=()=>{


localStorage.removeItem(
"adminAuth"
);


navigate({
to:"/admin-login"
});


};







return (


<div className="
min-h-screen
bg-background
p-6
">





<div className="
flex
justify-between
items-center
mb-10
">


<h1 className="
text-3xl
font-bold
">

Admin Dashboard

</h1>



<Button
variant="destructive"
onClick={logout}
>

Déconnexion

</Button>


</div>






{/* STATS */}


<div className="
grid
md:grid-cols-3
gap-5
mb-10
">


<div className="border rounded-2xl p-5">
<h3>Produits</h3>
<p className="text-3xl font-bold">
{products.length}
</p>
</div>



<div className="border rounded-2xl p-5">
<h3>Clients</h3>
<p className="text-3xl font-bold">
{clients.length}
</p>
</div>



<div className="border rounded-2xl p-5">
<h3>Commandes</h3>
<p className="text-3xl font-bold">
{orders.length}
</p>
</div>


</div>









{/* PRODUITS */}


<div className="
border
rounded-3xl
p-6
mb-10
">


<h2 className="
text-2xl
font-bold
mb-5
">

Gestion Produits

</h2>



{
products.map(product=>(


<div
key={product.id}
className="
border
rounded-xl
p-4
mb-3
flex
justify-between
"
>


<div>

<b>{product.name}</b>

<p>
{product.price}
</p>

</div>



<input
type="checkbox"
checked={product.active}
onChange={()=>{


setProducts(
products.map(p=>

p.id===product.id
?
{
...p,
active:!p.active
}
:
p

)
)


}}
/>



</div>


))
}




<Button
onClick={saveProducts}
className="w-full"
>

Sauvegarder produits

</Button>



</div>









{/* FLOATING CARDS */}



<div className="
border
rounded-3xl
p-6
">


<h2 className="
text-2xl
font-bold
mb-5
">

Gestion Floating Cards Hero

</h2>



{

cards.map(card=>(


<div
key={card.id}
className="
border
rounded-2xl
p-5
mb-5
space-y-3
"
>


<input
className="border p-3 rounded-xl w-full"
value={card.name}
onChange={(e)=>
updateCard(
card.id,
"name",
e.target.value
)
}
/>



<input
className="border p-3 rounded-xl w-full"
value={card.category}
onChange={(e)=>
updateCard(
card.id,
"category",
e.target.value
)
}
/>



<input
className="border p-3 rounded-xl w-full"
value={card.price}
onChange={(e)=>
updateCard(
card.id,
"price",
e.target.value
)
}
/>



<input
className="border p-3 rounded-xl w-full"
value={card.oldPrice}
onChange={(e)=>
updateCard(
card.id,
"oldPrice",
e.target.value
)
}
/>



<label>

<input
type="checkbox"
checked={card.active}
onChange={()=>
updateCard(
card.id,
"active",
!card.active
)
}
/>

 Active

</label>



</div>


))

}




<Button
onClick={saveCards}
className="w-full"
>

Sauvegarder Floating Cards

</Button>




</div>







</div>


);


}
