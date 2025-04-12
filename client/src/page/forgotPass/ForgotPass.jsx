import React from 'react'
import './ForgotPass.scss'
import { Link } from 'react-router-dom'

export const ForgotPass = () => {
    return (
        <div class="forgotPass">
            <form action="">
                <h1>Your email</h1>
                <div className="input-group">
                   
                    <input
                        name="email"
                        type="email"
                        placeholder="example@gmail.com"
                        required
                    />
                </div>
                <button type="submit">Send</button>
            </form>
        </div>
    )
}
