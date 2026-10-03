// ====== EDIT THIS FILE: your shop details ======
export const SHOP = {
  name: "Jyro Footwear",
  tagline: "Comfort you can feel. Style people notice.",
  whatsapp: "923034455255", // 0303 4455255 -> country code 92, no leading 0
  phoneShow: "0303 4455255",
  city: "Lahore",
  ceo: "Javed Iqbal",
};

// Photos go in /public/images. Dummy pictures (.svg) are used now:
// replace them by writing your own file name, e.g. "/images/mine.jpg"
// oldPrice is optional (shows a discount). tag is optional ("New", "Hot", "Best seller").
export const PRODUCTS = [
  { id: 1, name: "Jyro Air Runner", category: "Sneakers", price: 4500, oldPrice: 5500, tag: "Best seller", image: "/images/shoe1.svg",
    description: "Light breathable mesh with a soft cushioned sole. Made for all-day comfort.",
    sizes: [40, 41, 42, 43, 44], colors: "Blue / White" },
  { id: 2, name: "Jyro Classic Oxford", category: "Formal", price: 6500, oldPrice: 7500, tag: "New", image: "/images/shoe2.svg",
    description: "Leather formal shoe with a polished finish. Perfect for office and weddings.",
    sizes: [40, 41, 42, 43], colors: "Brown" },
  { id: 3, name: "Jyro Street Pro", category: "Sneakers", price: 5200, tag: "Hot", image: "/images/shoe3.svg",
    description: "Bold street style with a durable rubber grip sole.",
    sizes: [39, 40, 41, 42, 43, 44], colors: "Red / White" },
  { id: 4, name: "Jyro Summer Slide", category: "Sandals", price: 1800, oldPrice: 2200, image: "/images/shoe4.svg",
    description: "Soft, lightweight and waterproof. Easy on and easy to clean.",
    sizes: [40, 41, 42, 43, 44], colors: "Green" },
  { id: 5, name: "Jyro Trail Boot", category: "Boots", price: 7800, tag: "New", image: "/images/shoe5.svg",
    description: "Strong ankle support and grip. Ready for rough roads and cold days.",
    sizes: [40, 41, 42, 43, 44], colors: "Tan" },
  { id: 6, name: "Jyro Night Sport", category: "Sports", price: 4900, oldPrice: 5800, image: "/images/shoe6.svg",
    description: "Black sport shoe with yellow accents. Light and stable for running and gym.",
    sizes: [40, 41, 42, 43, 44], colors: "Black / Yellow" },
];

export const REVIEWS = [
  { name: "Ali Raza", city: "Lahore", text: "Ordered on WhatsApp in 2 minutes. Shoes arrived next day and the fitting was perfect." },
  { name: "Usman Tariq", city: "Gujranwala", text: "Quality is much better than the price. Very comfortable for long walks." },
  { name: "Hamza Sheikh", city: "Faisalabad", text: "Size exchange was easy and the team replied fast. Will order again." },
];
