import { useState } from "react"
import { login, register } from "../services/authService"
import { Link } from "react-router-dom"
import Header from "../components/Header"


const Register = () => {
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: '',
        confPassword: ''
    })
    const [error, setError] = useState({})

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }
    const validateForm = () => {
        let newErrors = {};
        if (formData.email === '') {
            newErrors = { ...newErrors, email: 'Enter your email' }
        }
        if (formData.name === '') {
            newErrors = { ...newErrors, name: 'Enter your name' }
        }
        if (formData.password === '') {
            newErrors = { ...newErrors, password: 'Enter your password' }
        }
        if (formData.confPassword !== formData.password) {
            newErrors = { ...newErrors, confPassword: "Passwords doesn't match" }
        }
        setError(newErrors)
        return Object.keys(newErrors).length === 0;
    }
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }
        const res = await register(formData);
        alert(res);

    }
    return (
        <div>
            <Header/>
            {/* <div>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label>Email</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} />
                        {error.email && <p>*{error.email}</p>}
                    </div>
                    <div>
                        <label>Username</label>
                        <input type="text" name="username" value={formData.username} onChange={handleChange} />
                        {error.username && <p>*{error.username}</p>}
                    </div>
                    <div>
                        <label>Password</label>
                        <input type="password" name="password" value={formData.password} onChange={handleChange} />
                        {error.password && <p>*{error.password}</p>}
                    </div>
                    <div>
                        <label>Confirm Password</label>
                        <input type="password" name="confPassword" value={formData.confPassword} onChange={handleChange} />
                        {error.confPassword && <p>*{error.confPassword}</p>}
                    </div>
                    <button type="submit">Submit</button>
                </form>
                <h4>Don't have an accout <Link to='/login'>Login</Link></h4>
            </div> */}
            <div className="flex min-h-full flex-col justify-center px-6 py-8 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                    <img
                        alt="Your Company"
                        src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
                        className="mx-auto h-10 w-auto"
                    />
                    <h2 className="mt-8 text-center text-2xl/9 font-bold tracking-tight text-white">Register to Sahaay</h2>
                </div>
                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm/6 font-medium text-gray-100">
                                Email Address
                            </label>
                            <div className="mt-2">
                                <input
                                    type="text"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="someone@example.com"
                                    required
                                    className="block bg-white/5 rounded-md w-full px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="username" className="block text-sm/6 font-medium text-gray-100">
                                Username
                            </label>
                            <div className="mt-2">
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                    className="block bg-white/5 rounded-md w-full px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm/6 font-medium text-gray-100">
                                Password
                            </label>
                            <div className="mt-2">
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="block bg-white/5 rounded-md w-full px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="confPassword" className="block text-sm/6 font-medium text-gray-100">
                                Confirm Password
                            </label>
                            <div className="mt-2">
                                <input
                                    type="password"
                                    name="confPassword"
                                    value={formData.confPassword}
                                    onChange={handleChange}
                                    required
                                    className="block bg-white/5 rounded-md w-full px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                              type="submit" className="flex justify-center w-full bg-indigo-500 rounded-md px-3 py-1.5 text-sm/6 font-semibold text-white hover:bg-indigo-400 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">
                              Sign up
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

    )
}

export default Register;