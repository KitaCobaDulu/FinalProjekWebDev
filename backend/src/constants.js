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

module.exports = {
  REPORT_TYPES,
  CATEGORIES,
  MAX_LIMIT,
  CONTACT_TYPES,
  MAX_REPORT_ID
};