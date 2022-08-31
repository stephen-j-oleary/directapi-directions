
import mongoose from "mongoose";
import mongooseToSwagger from "mongoose-to-swagger";
import crypto from "crypto";
import uniqueValidator from "mongoose-unique-validator";


const DEFAULT_SCOPE = [
  "user:read",
  "user:update",
  "user:delete",
  "client:read",
  "client:write",
  "client:update",
  "client:delete"
];


/**
 * Generates a unique id
 * @returns {string}
 */
const generateId = () => crypto.randomUUID();

/**
 * Generates a random salt to be used for hashing passwords
 * @returns {string}
 */
const generateSalt = () => crypto.randomBytes(16).toString("hex");

/**
 * Hashes the given password
 * @param {string} pass The unhashed password
 * @param {string} salt The salt used to hash the password
 * @returns {string} One or two letters representing the user's first and last name
*/
const hashPassword = (pass, salt) => crypto.pbkdf2Sync(pass, salt, 1000, 64, "sha512").toString("hex");

/**
 * Generates the user's initials from their name
 * @param {string} name The user's name
 * @returns {string}
 */
const generateInitials = (name) => name.split(" ").map(n => n[0]).filter((_, i, a) => (i === 0 || i === a.length)).join("");


const schema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  salt: {
    type: String,
    required: true,
    immutable: true,
    default: generateSalt
  },
  name: {
    type: String,
    required: true
  },
  initials: String,
  user_id: {
    type: String,
    required: true,
    unique: true,
    immutable: true,
    default: generateId
  },
  scope: {
    type: [String],
    required: true,
    default: DEFAULT_SCOPE
  },
  clients: [String]
});


schema.plugin(uniqueValidator);


// Hash password before saving
schema.pre("save", function preSave(next) {
  if (this.isModified("password")) this.password = hashPassword(this.password, this.salt);
  if (this.isModified("name")) this.initials = generateInitials(this.name);

  next();
});


/**
 * Compares a password against the stored password
 * @param {string} pass The password to compare
 * @returns {boolean}
 */
schema.methods.comparePassword = function comparePassword(pass) {
  return (hashPassword(pass, this.salt) === this.password);
};


/**
 * Checks if the user has access to the scope
 * @param {string} scope The scope to check
 * @returns {boolean}
 */
schema.methods.hasScope = function hasScope(scope) {
  if (!scope) return true;

  const scopeArr = scope.split(" ");
  // Checks if user has access to every item in the requested scope
  return scopeArr.every(item => this.scope.includes(item));
};



const model = mongoose.model("User", schema);
export const openApiSchema = mongooseToSwagger(model);
export default model;
