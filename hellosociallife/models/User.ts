
import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

// 1. Define Mongoose Interface
export interface IUserDocument extends Document {
  name: string;
  email: string;
  password: string;
  bio?: string;
  image?: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// 2. Create Mongoose Schema
const UserSchema = new Schema<IUserDocument>({
  name: { 
    type: String, 
    required: true,
    validate: {
      validator: (v: string) => v.length >= 2,
      message: 'Name must be at least 2 characters long'
    }
  },
  email: { 
    type: String, 
    required: true,
    unique: true,
    validate: {
      validator: (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      message: 'Invalid email format'
    }
  },
  password: {
    type: String,
    required: true,
    select: false, // Password won't be returned in queries by default
    minlength: 8,
    validate: {
      validator: function(v: string) {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(v);
      },
      message: 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'
    }
  },
  bio: { type: String, default: null },
  image: { type: String, default: null }
});

// Password hashing middleware
UserSchema.pre<IUserDocument>('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err as Error);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// 3. Create User Class with MongoDB Integration
export class User {
  private _id?: mongoose.Types.ObjectId;
  private _name: string;
  private _email: string;
  private _password: string;
  private _bio: string | null;
  private _image: string | null;


  constructor(name: string, email: string, password: string, bio?: string, image?: string, id?: mongoose.Types.ObjectId) {
    this._name = name;
    this._email = email;
    this._password = password;
    this._bio = bio || null;
    this._image = image || null;
    this._id = this.id;
  }

  // Getters
  get id() { return this._id; }
  get name() { return this._name; }
  get email() { return this._email; }
  get bio() { return this._bio; }
  get image() { return this._image; }
  get password() { return this._password; }

  // Setters with validation
  set name(value: string) {
    if (!value || value.length < 2) {
      throw new Error("Name must be at least 2 characters long");
    }
    this._name = value;
  }

  set email(value: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      throw new Error("Invalid email format");
    }
    this._email = value;
  }

  set password(value: string) {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(value)) {
      throw new Error("Password must contain at least one uppercase letter, one lowercase letter, one number and one special character");
    }
    this._password = value;
  }

  set bio(value: string | null) {
    this._bio = value;
  }

  set image(value: string | null) {
    this._image = value;
  }

  // MongoDB Operations
  public async save(): Promise<User> {
    const UserModel = mongoose.model<IUserDocument>('User');
    const doc = await UserModel.create({
      _id: this._id,
      name: this._name,
      email: this._email,
      password: this._password,
      bio: this._bio,
      image: this._image
    });

    this._id = doc._id as mongoose.Types.ObjectId;

    return this;
  }

  public static async findById(id: string): Promise<User | null> {
    const UserModel = mongoose.model<IUserDocument>('User');
    const doc = await UserModel.findById(id);
    if (!doc) return null;
    return User.fromDocument(doc);
  }

  public static async findOne(emailOrUsername: string): Promise<User | null> {
    const UserModel = mongoose.model<IUserDocument>('User');
    const doc = await UserModel.findOne({
      $or: [{ email: emailOrUsername }, { name: emailOrUsername }],
    }).select('+password'); // Include password for authentication
    if (!doc) return null;
    return User.fromDocument(doc);
  }

  public static fromDocument(doc: IUserDocument): User {
    const user = new User(
      doc.name, 
      doc.email, 
      doc.password, 
      doc.bio || undefined, 
      doc.image || undefined
    );

    user._id = doc._id as mongoose.Types.ObjectId;
    return user;
  }

  public async comparePassword(candidatePassword: string): Promise<boolean> {
    const UserModel = mongoose.model<IUserDocument>('User');
    const doc = await UserModel.findById(this._id).select('+password');
    console.log(doc);
    if (!doc) return false;
    return doc.comparePassword(candidatePassword);
  }

  public toObject() {
    return {
      id: this._id?.toString(),
      name: this._name,
      email: this._email,
      bio: this._bio,
      image: this._image
      // Never include password in toObject output
    };
  }
}

// 4. Create Mongoose Model
export const UserModel = mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);
