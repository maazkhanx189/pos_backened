import React from 'react'

const Pricing = () => {
    return (
        <>
            <div className="grid grid-cols-3 gap-5">

                <div className="border p-5">
                    <h2>Free</h2>
                    <h1>$0</h1>
                </div>

                <div className="border p-5">
                    <h2>Basic</h2>
                    <h1>$10/month</h1>
                </div>

                <div className="border p-5">
                    <h2>Pro</h2>
                    <h1>$25/month</h1>
                </div>

            </div>
        </>
    )
}

export default Pricing