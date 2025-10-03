import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import doorDashLogo from '../assets/logos/door-dash.png';
import uberEatsLogo from '../assets/logos/uber-eats.png';

function Contact() {
    useEffect(() => {
        // Scroll to top when contact page loads
        window.scrollTo(0, 0);
    }, []);
    const contactInfo = [
        {
            icon: '📍',
            title: 'Location',
            content: '2957 W 15th St, Plano, TX 75075',
            action: 'Get Directions',
            href: 'https://maps.google.com',
            external: true,
        },
        {
            icon: '📞',
            title: 'Phone',
            content: '(972) 964-5419',
            action: 'Call Now',
            href: 'tel:+19729645419',
            external: false,
        },
        {
            icon: '🕒',
            title: 'Hours',
            content: 'Mon-Sat: 7:00 AM - 9:00 PM',
            action: null,
            href: null,
            external: false,
        },
        {
            icon: '📧',
            title: 'Email',
            content: 'tacodelitewestplano@gmail.com',
            action: 'Send Email',
            href: 'mailto:tacodelitewestplano@gmail.com',
            external: false,
        },
    ];

    const deliveryOptions = [
        {
            name: 'DoorDash',
            logo: doorDashLogo,
            description: 'Order pickup or delivery through DoorDash',
            link: 'https://order.online/store/taco-delite-plano-303257/?hideModal=true&https://order.online/online-ordering/business/taco-delite-72799=&pickup=true',
        },
        {
            name: 'Uber Eats',
            logo: uberEatsLogo,
            description: 'Order pickup or delivery through Uber Eats',
            link: 'https://www.ubereats.com/store/taco-delite/yePg7_z7WKyrpiNL8V1J6w?diningMode=PICKUP&',
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
                    <h1 className='text-4xl md:text-5xl font-secular text-white mb-6'>
                        Contact Us
                    </h1>
                    <p className='text-xl text-gray-300 max-w-2xl mx-auto'>
                        We'd love to hear from you! Visit us, call us, or order
                        online.
                    </p>
                </motion.div>

                {/* Contact Information Grid */}
                <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16'>
                    {contactInfo.map((info, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: index * 0.1 }}
                            className='bg-gray-800 rounded-lg shadow-md p-6 text-center border border-gray-700'
                        >
                            <div className='text-4xl mb-4'>{info.icon}</div>
                            <h3 className='text-lg font-secular text-white mb-2'>
                                {info.title}
                            </h3>
                            <p className='text-gray-300 mb-4'>{info.content}</p>
                            {info.action && (
                                <a
                                    href={info.href}
                                    target={info.external ? '_blank' : '_self'}
                                    rel={
                                        info.external
                                            ? 'noopener noreferrer'
                                            : ''
                                    }
                                    className='btn-primary text-sm px-4 py-2 inline-block'
                                >
                                    {info.action}
                                </a>
                            )}
                        </motion.div>
                    ))}
                </div>

                {/* Map and Location Section */}
                <div className='grid lg:grid-cols-2 gap-12 mb-16'>
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className='text-3xl font-secular text-white mb-6'>
                            Visit Our Restaurant
                        </h2>
                        <p className='text-lg text-gray-300 mb-6'>
                            Located at the Prairie Creek Village Shopping Center
                            in Plano, our restaurant is easily accessible with
                            plenty of parking and a welcoming atmosphere for
                            dine-in customers.
                        </p>
                        <div className='space-y-4'>
                            <div className='flex items-start'>
                                <span className='text-taco-green-400 mr-3 mt-1'>
                                    📍
                                </span>
                                <div>
                                    <h3 className='font-semibold text-white'>
                                        Address
                                    </h3>
                                    <p className='text-gray-300'>
                                        2957 W 15th St
                                        <br />
                                        Plano, TX 75075
                                    </p>
                                </div>
                            </div>
                            <div className='flex items-start'>
                                <span className='text-taco-green-400 mr-3 mt-1'>
                                    🚗
                                </span>
                                <div>
                                    <h3 className='font-semibold text-white'>
                                        Parking
                                    </h3>
                                    <p className='text-gray-300'>
                                        Free parking available in our lot
                                    </p>
                                </div>
                            </div>
                            <div className='flex items-start'>
                                <span className='text-taco-green-400 mr-3 mt-1'>
                                    ♿
                                </span>
                                <div>
                                    <h3 className='font-semibold text-white'>
                                        Accessibility
                                    </h3>
                                    <p className='text-gray-300'>
                                        Wheelchair accessible entrance and
                                        seating
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className='bg-gray-800 rounded-lg p-8 border border-gray-700'
                    >
                        <div className='text-center mb-6'>
                            <div className='text-6xl mb-4'>🗺️</div>
                            <p className='text-gray-300 mb-4'>
                                Interactive Map
                            </p>
                        </div>

                        {/* Embedded Google Maps */}
                        <div className='w-full h-80 rounded-lg overflow-hidden shadow-lg'>
                            <iframe
                                src='https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d107014.04623459851!2d-97.06819412687852!3d33.0514921402157!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x864c22779cbdf961%3A0x122a03406b2f3e01!2sTaco%20Delite!5e0!3m2!1sen!2sus!4v1756496244594!5m2!1sen!2sus'
                                width='100%'
                                height='100%'
                                style={{ border: 0 }}
                                allowFullScreen=''
                                loading='lazy'
                                referrerPolicy='no-referrer-when-downgrade'
                                title='Taco Delite Location'
                            ></iframe>
                        </div>

                        {/* External link as backup */}
                        <div className='text-center mt-4'>
                            <a
                                href='https://maps.app.goo.gl/qGfa6SbxskxEtQ579'
                                target='_blank'
                                rel='noopener noreferrer'
                                className='text-blue-400 hover:text-blue-300 text-sm underline'
                            >
                                Open in Google Maps →
                            </a>
                        </div>
                    </motion.div>
                </div>

                {/* Delivery Options */}
                <div className='mb-16'>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className='text-3xl font-secular text-white text-center mb-12'
                    >
                        Order Online
                    </motion.h2>

                    <div className='grid md:grid-cols-2 gap-8'>
                        {deliveryOptions.map((option, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{
                                    duration: 0.8,
                                    delay: index * 0.2,
                                }}
                                className='bg-gray-800 rounded-lg shadow-md p-8 text-center border border-gray-700'
                            >
                                <div className='mb-4'>
                                    <div className='bg-gray-100 rounded-lg p-4 inline-block'>
                                        <img
                                            src={option.logo}
                                            alt={`${option.name} logo`}
                                            className='h-16 mx-auto object-contain'
                                        />
                                    </div>
                                </div>
                                <h3 className='text-2xl font-secular text-white mb-3'>
                                    {option.name}
                                </h3>
                                <p className='text-gray-300 mb-6'>
                                    {option.description}
                                </p>
                                <a
                                    href={option.link}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='btn-primary text-lg px-6 py-3 inline-block'
                                >
                                    Order on {option.name}
                                </a>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Catering Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className='bg-gray-800 rounded-lg shadow-lg p-8 md:p-12 text-center border border-gray-700'
                >
                    <h2 className='text-3xl font-secular text-white mb-6'>
                        Catering Services
                    </h2>
                    <p className='text-lg text-gray-300 mb-8 max-w-2xl mx-auto'>
                        Planning an event? Let us cater it! We offer delicious
                        Tex-Mex food for parties, corporate events, and special
                        occasions.
                    </p>
                    <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                        <a
                            href='tel:+19729645419'
                            className='btn-primary text-lg px-8 py-3 inline-block'
                        >
                            Call for Catering
                        </a>
                        <a
                            href='mailto:tacodelitewestplano@gmail.com'
                            className='btn-secondary text-lg px-8 py-3 inline-block'
                        >
                            Email Catering Request
                        </a>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

export default Contact;
