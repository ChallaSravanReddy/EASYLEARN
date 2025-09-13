import "./Register.css";

export default function Register() {
  return (
    <div className="flex h-screen">
      <div className="hidden md:flex w-1/2 bg-yellow-400 items-center justify-center">
        {/* You can put illustration image here */}
      </div>
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 p-8">
        <h2 className="text-3xl font-bold mb-6">Create Your Account</h2>
        <form className="w-80 space-y-4">
          <input type="text" placeholder="Full Name" className="w-full p-2 border rounded" />
          <input type="email" placeholder="Email" className="w-full p-2 border rounded" />
          <input type="password" placeholder="Password" className="w-full p-2 border rounded" />
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" />
            I agree to Terms & Privacy
          </label>
          <button className="w-full bg-yellow-500 text-white py-2 rounded">Create Account</button>
        </form>
      </div>
    </div>
  );
}
