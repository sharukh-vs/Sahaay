import { useState } from "react";
import { login } from "../services/authService";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";

const Login = () => {
    const [loginData, setLoginData] = useState({
        email: '',
        password: ''
    })
    const navigate=useNavigate();
    const [error, setError] = useState({});
    const validate = () => {
        let formError = {}
        if (loginData.email === '') {
            formError = { ...formError, email: 'Email is required' }
        }
        if (loginData.password === '') {
            formError = { ...formError, password: 'Password is required' }
        }
        return Object.keys(formError).length === 0
    }

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        const response = await login({ email: loginData.email, password: loginData.password })
        console.log(response);
        if(response.status === 200)
            navigate("/dashboard")
    }

    return (
        <>
            <Header />
            {/* <div>
                <form onSubmit={handleLogin}>
                    <div>
                        <label>E-mail</label>
                        <input type="email" name="email" value={loginData.email}
                            onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                            className="border border-gray-400 p-2 rounded w-full" />
                    </div>
                    <div>
                        <label>Password</label>
                        <input type="password" name="password" value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} />
                    </div>
                    <button type="submit">Login</button>
                </form>
                <h4>Don't have an account <Link to='/register'>Register</Link></h4>
            </div> */}
            <div className="h-full bg-gray-900">
                <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
                    <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                        <img
                            alt="Sahaay logo"
                            src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
                            className="mx-auto h-10 w-auto"
                        />
                        <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-white">Sign in to your account</h2>
                    </div>
                    <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div>
                                <label htmlFor="email" className="block text-sm/6 font-medium text-gray-100">
                                    Email address
                                </label>
                                <div className="mt-2">
                                    <input
                                        name="email"
                                        type="email"
                                        required
                                        autoComplete="email"
                                        value={loginData.email}
                                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                                        className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                                    />
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center justify-between">
                                    <label htmlFor="password" className="block text-sm/6 font-medium text-gray-100">
                                        Password
                                    </label>
                                    <div className="text-sm">
                                        <a href="#" className="font-semibold  text-indigo-400 hover:text-indigo-300">
                                            Forgot Password?
                                        </a>
                                    </div>
                                </div>
                                <div className="mt-2">
                                    <input
                                      name="password"
                                      type="password"
                                      required
                                      value={loginData.password} 
                                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                                      autoComplete="current-password"
                                      className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                                    />
                                </div>
                            </div>
                            <div>
                                <button
                                  type="submit"
                                  className="flex w-full justify-center bg-indigo-500 rounded-md px-3 py-1.5 texy-sm/6 font-semibold text-white hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                                >Sign in</button>
                            </div>
                        </form>
                        <p className="mt-10 text-center text-sm/6 text-gray-400">
                            Still not registered?{' '}
                            <Link to="/register" className="font-semibold text-indigo-400 hover:text-indigo-300">
                            Register Now</Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Login;