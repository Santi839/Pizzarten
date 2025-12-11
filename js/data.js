// js/data.js
// Estos son los datos originales de fábrica de Pizzarten
const defaultData = {
    company: {
      name: "Pizzarten",
      slogan: "Arte Comestible",
      footerText: "© 2025 Pizzarten. Donde la cocina se encuentra con el diseño."
    },
    hero: {
      title: "OBRAS DE ARTE <br><span class='text-gradient'>RECIÉN HORNEADAS</span>",
      subtitle: "Masa madre de 48 horas, ingredientes de autor y diseño en cada bocado.",
      ctaButton: "Ver Galería de Sabores"
    },
    menu: [
      { 
        id: 1, 
        name: "La Da Vinci", 
        desc: "Prosciutto, rúcula fresca, parmesano reggiano y reducción de balsámico.", 
        price: 14.99, 
        img: "assets/img/la-da-vinci.png" 
      },
      { 
        id: 2, 
        name: "Picasso Picante", 
        desc: "Pepperoni doble, chorizo español, jalapeños y miel picante (hot honey).", 
        price: 13.50, 
        img: "assets/img/picasso-picante.png" 
      },
      { 
        id: 3, 
        name: "Cuatro Quesos Abstracta", 
        desc: "Gorgonzola, Mozzarella, Parmesano y Ricotta con toque de nuez.", 
        price: 12.00, 
        img: "assets/img/cuatro-quesos.png" 
      }
    ],
    combos: [
      {
        id: 101,
        title: "Dúo Creativo",
        desc: "2 Pizzas Medianas + 2 Bebidas Artesanales. Perfecto para compartir.",
        price: 18.99,
        badge: "BEST SELLER",
        img: "assets/img/duo-creativo.png" 
      },
      {
        id: 102,
        title: "Banquete del Maestro",
        desc: "3 Pizzas Grandes + Pan de Ajo + Refresco 2L. La fiesta completa.",
        price: 32.50,
        badge: "FAMILIAR",
        img: "assets/img/banquete-maestro.png" 
      }
    ]
  };