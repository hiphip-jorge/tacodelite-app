import React from 'react';
import { motion } from 'framer-motion';

function About() {
    const highlights = [
        {
            icon: '🏆',
            title: 'Quality First',
            description:
                'We focus on delivering quality fast food that beats our competitors',
        },
        {
            icon: '👨‍🍳',
            title: 'Expert Chefs',
            description:
                'Our team brings years of experience in Tex-Mex cuisine',
        },
        {
            icon: '🤝',
            title: 'Community',
            description: 'Serving the Plano communities since 1989',
        },
    ];

    return (
        <div className='min-h-screen bg-gray-900 py-8'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className='text-center mb-16'
                >
                    <h1 className='text-4xl md:text-5xl font-hobo text-white mb-6'>
                        About Taco Delite
                    </h1>
                    <p className='text-xl text-gray-300 max-w-3xl mx-auto'>
                        Continuing the Taco Delite tradition of bringing
                        authentic Tex-Mex flavors to North Texas
                    </p>
                </motion.div>

                {/* Story Section */}
                <div className='grid lg:grid-cols-2 gap-12 items-center mb-20'>
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className='text-3xl font-secular text-white mb-6'>
                            Our Story
                        </h2>
                        <p className='text-lg text-gray-300 mb-4'>
                            Founded in 1989, this location of Taco Delite began
                            as a branch of the original Taco Delite, striving to
                            continue serving the same quality and favorites that
                            made the original location beloved throughout Texas.
                        </p>
                        <p className='text-lg text-gray-300 mb-4'>
                            Owner Javier Garcia started working here in 1989 and
                            seized the opportunity to purchase the restaurant in
                            2007, helping this West Plano location grow into one
                            of the most beloved Tex-Mex restaurants in the area
                            while maintaining the same fresh ingredients, bold
                            flavors, and warm hospitality that customers have
                            come to expect from Taco Delite.
                        </p>
                        <p className='text-lg text-gray-300'>
                            Today, we continue to honor the Taco Delite legacy
                            while serving thousands of happy customers who have
                            become part of our extended family, carrying forward
                            the traditions and recipes that have made us a Texas
                            favorite.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className='relative'
                    >
                        <img
                            src='/assets/taco_delite.webp'
                            alt='Taco Delite Restaurant'
                            className='rounded-lg shadow-lg w-full'
                        />
                    </motion.div>
                </div>

                {/* Highlights Section */}
                <div className='mb-20'>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className='text-3xl font-secular text-white text-center mb-12'
                    >
                        What Makes Us Special
                    </motion.h2>

                    <div className='grid md:grid-cols-3 gap-8'>
                        {highlights.map((highlight, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{
                                    duration: 0.8,
                                    delay: index * 0.2,
                                }}
                                className='text-center p-6 bg-gray-800 rounded-lg shadow-md border border-gray-700'
                            >
                                <div className='text-6xl mb-4'>
                                    {highlight.icon}
                                </div>
                                <h3 className='text-xl font-secular text-white mb-3'>
                                    {highlight.title}
                                </h3>
                                <p className='text-gray-300'>
                                    {highlight.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Values Section */}
                <div className='bg-gray-800 rounded-lg shadow-lg p-8 md:p-12 border border-gray-700'>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className='text-center mb-8'
                    >
                        <h2 className='text-3xl font-secular text-white mb-4'>
                            Our Values
                        </h2>
                        <p className='text-lg text-gray-300'>
                            The principles that guide everything we do
                        </p>
                    </motion.div>

                    <div className='grid md:grid-cols-2 gap-8'>
                        <div>
                            <h3 className='text-xl font-secular text-white mb-3'>
                                Authenticity
                            </h3>
                            <p className='text-gray-300'>
                                We stay true to Tex-Mex traditions and cooking
                                methods, creating dishes that blend Mexican
                                inspiration with Texas flavors.
                            </p>
                        </div>
                        <div>
                            <h3 className='text-xl font-secular text-white mb-3'>
                                Freshness
                            </h3>
                            <p className='text-gray-300'>
                                As a fast food restaurant, we focus on
                                delivering quality ingredients and fresh
                                preparation that consistently beats our
                                competitors, ensuring every meal meets our
                                standards for taste and freshness.
                            </p>
                        </div>
                        <div>
                            <h3 className='text-xl font-secular text-white mb-3'>
                                Service
                            </h3>
                            <p className='text-gray-300'>
                                We treat every customer like family, providing
                                warm, friendly service that makes you feel
                                welcome from the moment you walk in.
                            </p>
                        </div>
                        <div>
                            <h3 className='text-xl font-secular text-white mb-3'>
                                Community
                            </h3>
                            <p className='text-gray-300'>
                                We're proud to be part of the Plano communities,
                                serving our neighbors and building lasting
                                relationships with families who have been coming
                                to us for generations.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default About;
