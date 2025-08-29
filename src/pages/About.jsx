import React from 'react'
import { motion } from 'framer-motion'

function About() {
    const highlights = [
        {
            icon: '🏆',
            title: 'Quality First',
            description: 'We use only the freshest ingredients and traditional recipes'
        },
        {
            icon: '👨‍🍳',
            title: 'Expert Chefs',
            description: 'Our team brings years of experience in authentic Mexican cuisine'
        },
        {
            icon: '🤝',
            title: 'Community',
            description: 'Serving the Plano communities since 1989'
        }
    ]

    return (
        <div className="min-h-screen bg-gray-900 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-4xl md:text-5xl font-hobo text-white mb-6">
                        About Taco Delite
                    </h1>
                    <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                        We're passionate about bringing authentic Mexican flavors to North Texas
                    </p>
                </motion.div>

                {/* Story Section */}
                <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="text-3xl font-secular text-white mb-6">
                            Our Story
                        </h2>
                        <p className="text-lg text-gray-300 mb-4">
                            Founded in 1989, Taco Delite began as a small family-owned restaurant
                            with a big dream: to serve the most authentic Mexican food in Texas.
                        </p>
                        <p className="text-lg text-gray-300 mb-4">
                            What started as a humble taco stand has grown into one of the most
                            beloved Mexican restaurants in Plano, known for our
                            fresh ingredients, bold flavors, and warm hospitality.
                        </p>
                        <p className="text-lg text-gray-300">
                            Today, we continue to honor our family traditions while serving
                            thousands of happy customers who have become part of our extended family.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="relative"
                    >
                        <img
                            src="/assets/taco_delite.webp"
                            alt="Taco Delite Restaurant"
                            className="rounded-lg shadow-lg w-full"
                        />
                    </motion.div>
                </div>

                {/* Highlights Section */}
                <div className="mb-20">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-3xl font-secular text-white text-center mb-12"
                    >
                        What Makes Us Special
                    </motion.h2>

                    <div className="grid md:grid-cols-3 gap-8">
                        {highlights.map((highlight, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: index * 0.2 }}
                                className="text-center p-6 bg-gray-800 rounded-lg shadow-md border border-gray-700"
                            >
                                <div className="text-6xl mb-4">{highlight.icon}</div>
                                <h3 className="text-xl font-secular text-white mb-3">
                                    {highlight.title}
                                </h3>
                                <p className="text-gray-300">{highlight.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Values Section */}
                <div className="bg-gray-800 rounded-lg shadow-lg p-8 md:p-12 border border-gray-700">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-8"
                    >
                        <h2 className="text-3xl font-secular text-white mb-4">
                            Our Values
                        </h2>
                        <p className="text-lg text-gray-300">
                            The principles that guide everything we do
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-xl font-secular text-white mb-3">
                                Authenticity
                            </h3>
                            <p className="text-gray-300">
                                We stay true to traditional Mexican recipes and cooking methods,
                                ensuring every dish tastes like it came straight from Mexico.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-xl font-secular text-white mb-3">
                                Freshness
                            </h3>
                            <p className="text-gray-300">
                                We source the highest quality ingredients and prepare everything
                                fresh daily, never using frozen or pre-made items.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-xl font-secular text-white mb-3">
                                Service
                            </h3>
                            <p className="text-gray-300">
                                We treat every customer like family, providing warm, friendly
                                service that makes you feel welcome from the moment you walk in.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-xl font-secular text-white mb-3">
                                Community
                            </h3>
                            <p className="text-gray-300">
                                We're proud to be part of the Plano and Richardson communities,
                                supporting local events and giving back whenever we can.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default About
