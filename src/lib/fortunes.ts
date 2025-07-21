export const fortunes = [
  "Your kindness will be repaid tenfold today! 🌟",
  "A beautiful surprise awaits you this week! ✨",
  "Your creativity will lead to amazing opportunities! 🎨",
  "Someone special is thinking of you right now! 💝",
  "Your positive energy is contagious - keep shining! ☀️",
  "An unexpected gift will brighten your day! 🎁",
  "Your hard work will soon pay off magnificently! 💪",
  "A door to new adventures is about to open! 🚪",
  "Your smile will light up someone's world today! 😊",
  "Good fortune follows you wherever you go! 🍀",
  "Your dreams are closer than you think! 🌙",
  "A special friendship will blossom soon! 🌸",
  "Your wisdom will guide someone to success! 🦉",
  "An amazing opportunity is heading your way! 🎯",
  "Your generosity will return to you multiplied! 💖",
  "A joyful reunion is in your near future! 🤗",
  "Your talents will be recognized and celebrated! 🏆",
  "A stroke of good luck will change everything! ⚡",
  "Your patience will be rewarded beyond measure! ⏰",
  "A beautiful memory will be made today! 📸"
];

export const gifts = [
  { name: "₦1,000 Gift Voucher", value: 1000 },
  { name: "₦2,000 Shopping Credit", value: 2000 },
  { name: "₦3,000 Restaurant Voucher", value: 3000 },
  { name: "₦4,000 Entertainment Pass", value: 4000 },
  { name: "₦5,000 Premium Voucher", value: 5000 },
];

export const getRandomFortune = () => {
  return fortunes[Math.floor(Math.random() * fortunes.length)];
};

export const getRandomGift = () => {
  return gifts[Math.floor(Math.random() * gifts.length)];
};