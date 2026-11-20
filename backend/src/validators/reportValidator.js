const { REPORT_TYPES, CATEGORIES, CONTACT_TYPES } = require("../constants");

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DATE_TIME_PATTERN = /^\d{4}-\d{2}-\d{2}T/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function toTrimmedString(value) {
  return typeof value === "string" ? value.trim() : "";
}

// Mengembalikan objek Date jika valid, atau null jika tidak.
function parseDate(value) {
  if (typeof value !== "string") return null;

  const isDateOnly = DATE_ONLY_PATTERN.test(value);
  if (!isDateOnly && !DATE_TIME_PATTERN.test(value)) return null;

  // new Date("2026-02-31") diam-diam bergeser ke 3 Maret. Karena itu bagian
  // tanggalnya (10 karakter pertama) dicek balik agar tanggal yang tidak ada
  // di kalender ditolak, baik untuk format YYYY-MM-DD maupun ISO lengkap.
  const datePart = value.slice(0, 10);
  const checkDate = new Date(datePart);
  if (isNaN(checkDate.getTime())) return null;
  if (checkDate.toISOString().slice(0, 10) !== datePart) return null;

  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
}

// Tanggal tanpa jam dibandingkan dengan hari ini di WIB,
// karena server berjalan dalam UTC.
function isFutureDate(rawValue, date) {
  if (DATE_ONLY_PATTERN.test(rawValue)) {
    const todayWIB = new Date().toLocaleDateString("en-CA", {
      timeZone: "Asia/Jakarta",
    });
    return rawValue > todayWIB;
  }
  return date > new Date();
}

function validateReportInput(body) {
  const input = body || {};
  const errors = [];

  const addError = (field, message) => errors.push({ field, message });

  const checkRequiredLength = (field, value, min, max) => {
    if (!value) {
      addError(field, `${field} wajib diisi`);
    } else if (value.length < min || value.length > max) {
      addError(field, `${field} harus ${min} sampai ${max} karakter`);
    }
  };

  const checkOneOf = (field, value, allowedValues) => {
    if (!allowedValues.includes(value)) {
      addError(
        field,
        `${field} harus salah satu dari: ${allowedValues.join(", ")}`,
      );
    }
  };

  const itemName = toTrimmedString(input.itemName);
  const description = toTrimmedString(input.description);
  const location = toTrimmedString(input.location);
  const reporterName = toTrimmedString(input.reporterName);
  const contactValue = toTrimmedString(input.contactValue);

  checkOneOf("type", input.type, REPORT_TYPES);
  checkRequiredLength("itemName", itemName, 3, 100);

  // Checkpoint 2: foto belum didukung, jadi deskripsi wajib.
  // Checkpoint 3: syaratnya menjadi "deskripsi kosong DAN tidak ada foto".
  if (!description) {
    addError("description", "Isi deskripsi atau unggah foto (minimal salah satu)");
  } else if (description.length > 500) {
    addError("description", "description maksimal 500 karakter");
  }

  checkOneOf("category", input.category, CATEGORIES);
  checkRequiredLength("location", location, 2, 100);

  const parsedDate = parseDate(input.date);
  if (!parsedDate) {
    addError("date", "date harus berupa tanggal yang valid (format YYYY-MM-DD)");
  } else if (isFutureDate(input.date, parsedDate)) {
    addError("date", "date tidak boleh di masa depan");
  }

  checkRequiredLength("reporterName", reporterName, 2, 100);
  checkOneOf("contactType", input.contactType, CONTACT_TYPES);

  if (!contactValue) {
    addError("contactValue", "contactValue wajib diisi");
  } else if (contactValue.length > 100) {
    addError("contactValue", "contactValue maksimal 100 karakter");
  } else if (input.contactType === "EMAIL" && !EMAIL_PATTERN.test(contactValue)) {
    addError("contactValue", "contactValue harus berupa email yang valid");
  }

  if (errors.length > 0) {
    return { errors, data: null };
  }

  // Hanya field yang diizinkan yang diteruskan (id, status, dan imageUrl
  // dari klien sengaja diabaikan).
  return {
    errors,
    data: {
      type: input.type,
      itemName,
      description: description || null, // null jika kosong (foto menyusul di Checkpoint 3)
      category: input.category,
      location,
      date: parsedDate.toISOString(),
      reporterName,
      contactType: input.contactType,
      contactValue,
    },
  };
}

module.exports = { validateReportInput };