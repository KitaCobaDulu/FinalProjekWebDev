const REPORT_TYPES = ["LOST", "FOUND"];
const CATEGORIES = [
  "ELECTRONIC",
  "DOCUMENT_CARD",
  "TUMBLER",
  "ACCESSORY",
  "STATIONERY",
  "OTHER",
];

const MAX_LIMIT = 50;

const CONTACT_TYPES = [
  "WHATSAPP",
  "LINE",
  "INSTAGRAM",
  "EMAIL"
];

const MAX_REPORT_ID = 2147483647; // batas tipe Int PostgreSQL pada kolom id

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

module.exports = {
  REPORT_TYPES,
  CATEGORIES,
  MAX_LIMIT,
  CONTACT_TYPES,
  MAX_REPORT_ID,
  MAX_IMAGE_SIZE,
  ALLOWED_IMAGE_TYPES,
};