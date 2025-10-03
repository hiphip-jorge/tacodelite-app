import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

function Home() {
    const features = [
        {
            icon: '🌮',
            title: 'Fresh Food',
            description: 'Prepped daily with premium ingredients',
        },
        {
            icon: '⭐',
            title: 'Quality Service',
            description: 'Exceptional customer service and attention to detail',
        },
        {
            icon: '🍽️',
            title: 'Catering',
            description: 'Perfect for events and parties',
        },
    ];

    return (
        <div className='min-h-screen'>
            {/* Hero Section */}
            <section className='relative bg-gray-900 text-white overflow-hidden'>
                {/* Background Accent Elements */}
                <div className='absolute inset-0 overflow-hidden'>
                    <div className='absolute -top-40 -right-40 w-80 h-80 bg-taco-yellow-500/10 rounded-full blur-3xl'></div>
                    <div className='absolute -bottom-40 -left-40 w-80 h-80 bg-taco-blue-500/10 rounded-full blur-3xl'></div>
                    <div className='absolute top-1/2 left-1/4 w-32 h-32 bg-taco-green-500/10 rounded-full blur-2xl'></div>
                </div>

                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10'>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className='text-center'
                    >
                        <h1 className='text-4xl md:text-6xl font-hobo mb-6'>
                            Welcome to Taco Delite
                        </h1>
                        <p className='text-xl md:text-2xl mb-8 max-w-3xl mx-auto'>
                            The best Tex-Mex food in Plano. Fresh ingredients,
                            bold flavors, and friendly service.
                        </p>
                        <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                            <Link
                                to='/menu'
                                className='btn-primary text-lg px-8 py-3 inline-block'
                            >
                                View Menu
                            </Link>
                            <Link
                                to='/contact'
                                className='btn-secondary text-lg px-8 py-3 inline-block'
                            >
                                Order Now
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section className='py-20 bg-gray-800'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className='text-center mb-16'
                    >
                        <h2 className='text-3xl md:text-4xl font-secular text-white mb-4'>
                            Why Choose Taco Delite?
                        </h2>
                        <p className='text-xl text-gray-300 max-w-2xl mx-auto'>
                            We're committed to serving the most delicious and
                            freshest Tex-Mex food
                        </p>
                    </motion.div>

                    <div className='grid md:grid-cols-3 gap-8'>
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{
                                    duration: 0.8,
                                    delay: index * 0.2,
                                }}
                                className='text-center p-6'
                            >
                                <div className='text-6xl mb-4'>
                                    {feature.icon}
                                </div>
                                <h3 className='text-xl font-secular text-white mb-2'>
                                    {feature.title}
                                </h3>
                                <p className='text-gray-300'>
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className='py-20 bg-gray-900'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className='text-3xl md:text-4xl font-secular text-white mb-6'>
                            Ready for Amazing Tex-Mex?
                        </h2>
                        <p className='text-xl text-gray-300 mb-8 max-w-2xl mx-auto'>
                            Order online for pickup or delivery, or visit us in
                            person for the full experience
                        </p>
                        <Link
                            to='/menu'
                            className='btn-primary text-lg px-8 py-3 inline-block'
                        >
                            Order Now
                        </Link>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}

export default Home;
