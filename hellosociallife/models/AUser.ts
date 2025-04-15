// models/User.ts
export class User {
    private _name: string;
    private _email: string;
    private _bio : string | null;
    private _image: string | null;
  
    constructor(name: string, email: string, bio?: string, image?: string ) {
      this._name = name;
      this._email = email;
      this._bio = bio || null;
      this._image = image || null;
    }
  
    // Getters
    get image(): string | null {
      return this._image;
    }
  
    get name(): string {
      return this._name;
    }
  
    get email(): string {
      return this._email;
    }
    get bio(): string | null{
      return this._bio;
    }
  
    // Setters with validation
    set image(value: string | null) {
      if (value == undefined ) throw new Error("Image path cannot be empty");
      this._image = value;
    }
  
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
     set bio (value: string | null){
      if (value == undefined ) throw new Error ("Bio can not be empty!");
      this._bio = value;
     }
  
    // Utility method
    toJSON(): object {
      return {
        name: this._name,
        email: this._email,
        bio: this._bio,
        image: this._image
      };
    }
  
    // Static factory method
    static fromObject(obj: { name: string; email: string; bio? : string; image?: string }): User {
      return new User( obj.name, obj.email, obj.bio, obj.image);
    }
  }
  
 
