/**
 * DEALFINDER USA — YOUR PRODUCT LIST
 * ----------------------------------
 * This file is the only place you need to edit to add, remove or update listings.
 * All products below are DEMOS. All demo prices and discounts are EXAMPLES, not real offers.
 *
 * HOW TO MAKE A REAL AFFILIATE LISTING:
 *   1. Replace title, description, features and image with accurate, permitted content.
 *   2. Set affiliateUrl to the complete Amazon Associates product URL WITH YOUR TAG.
 *   3. Change status from "demo" to "live".
 *   4. Keep category one of: Tech, Audio, Home, Gaming, Kitchen, Lifestyle.
 *   5. Published/live listings do NOT display sample prices or discounts. Buyers
 *      click through to Amazon to check the actual price and availability.
 *
 * Sample new listing:
 * {
 *   id: "my-unique-product-id",
 *   title: "Actual product name",
 *   category: "Tech",
 *   description: "Accurate, short description of the actual item.",
 *   features: ["Feature 1", "Feature 2"],
 *   image: "assets/camera.svg", // replace with a properly licensed image
 *   price: null,
 *   originalPrice: null,
 *   status: "live",
 *   affiliateUrl: "https://www.amazon.com/dp/REALASIN?tag=YOURTAG-20",
 *   featured: true
 * }
 *
 * IMPORTANT: Do not embed API secrets in this public file. Do not copy Amazon
 * product images or scrape Amazon pricing. Refer to the README for policy notes.
 */
window.DEALFINDER_PRODUCTS = [
  {id:'orbit-headphones',title:'Orbit Studio Headphones',category:'Audio',description:'An elevated, immersive listening concept with a clean, over-ear silhouette.',features:['Wireless audio','Over-ear design'],image:'assets/headphones.svg',price:79.99,originalPrice:129.99,status:'demo',affiliateUrl:'',featured:true},
  {id:'flux-keyboard',title:'Flux Mechanical Keyboard',category:'Tech',description:'A compact desk companion concept with tactile keys and a modern profile.',features:['Compact layout','Desktop setup'],image:'assets/keyboard.svg',price:64.99,originalPrice:89.99,status:'demo',affiliateUrl:'',featured:true},
  {id:'bolt-power-bank',title:'Bolt Portable Power Bank',category:'Tech',description:'A sleek take on everyday portable charging, made for days on the move.',features:['Portable power','Travel ready'],image:'assets/power-bank.svg',price:29.99,originalPrice:49.99,status:'demo',affiliateUrl:'',featured:false},
  {id:'pulse-watch',title:'Pulse Smartwatch',category:'Tech',description:'A streamlined wrist-worn tech concept with a crisp, readable face.',features:['Wearable tech','Modern display'],image:'assets/smartwatch.svg',price:89.99,originalPrice:139.99,status:'demo',affiliateUrl:'',featured:false},
  {id:'echo-speaker',title:'Echoform Bluetooth Speaker',category:'Audio',description:'A bold, minimal speaker concept for immersive sound and everyday listening.',features:['Portable audio','Wireless'],image:'assets/speaker.svg',price:49.99,originalPrice:79.99,status:'demo',affiliateUrl:'',featured:true},
  {id:'cloud-earbuds',title:'Cloud Wireless Earbuds',category:'Audio',description:'A light and simple listening concept with a pocket-friendly charging case.',features:['True wireless','Compact case'],image:'assets/earbuds.svg',price:39.99,originalPrice:69.99,status:'demo',affiliateUrl:'',featured:false},
  {id:'arc-lamp',title:'Arc Adjustable Desk Lamp',category:'Home',description:'Focused lighting meets sleek design in this minimal desk lamp concept.',features:['Desk essentials','Adjustable arm'],image:'assets/lamp.svg',price:35.99,originalPrice:54.99,status:'demo',affiliateUrl:'',featured:false},
  {id:'brew-coffee',title:'Brewline Coffee Station',category:'Kitchen',description:'A compact counter-top coffee concept with a clean, modern footprint.',features:['Countertop','Everyday brew'],image:'assets/coffee-maker.svg',price:99.99,originalPrice:149.99,status:'demo',affiliateUrl:'',featured:true},
  {id:'air-purifier',title:'Airflow Home Purifier',category:'Home',description:'A soft-edged air purifier concept designed to blend into your living space.',features:['Modern home','Compact form'],image:'assets/purifier.svg',price:119.99,originalPrice:169.99,status:'demo',affiliateUrl:'',featured:false},
  {id:'nova-controller',title:'Nova Wireless Controller',category:'Gaming',description:'A balanced, comfortable controller concept in a striking modern finish.',features:['Wireless gaming','Ergonomic grip'],image:'assets/controller.svg',price:44.99,originalPrice:69.99,status:'demo',affiliateUrl:'',featured:true},
  {id:'stride-backpack',title:'Stride Everyday Backpack',category:'Lifestyle',description:'A refined everyday-carry backpack concept for travel and your daily commute.',features:['Everyday carry','Travel'],image:'assets/backpack.svg',price:39.99,originalPrice:64.99,status:'demo',affiliateUrl:'',featured:false},
  {id:'frame-camera',title:'Frame Mirrorless Camera',category:'Lifestyle',description:'A minimalist creator-camera concept for capturing everyday adventures.',features:['Photography','Creator gear'],image:'assets/camera.svg',price:399.99,originalPrice:499.99,status:'demo',affiliateUrl:'',featured:false},
  {id:'glide-vacuum',title:'Glide Robot Vacuum',category:'Home',description:'A low-profile automatic floor-care concept for simpler everyday routines.',features:['Smart home','Floor care'],image:'assets/robot-vacuum.svg',price:189.99,originalPrice:249.99,status:'demo',affiliateUrl:'',featured:false}
];
