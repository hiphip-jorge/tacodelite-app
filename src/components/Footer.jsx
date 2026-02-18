import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className='bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
                <div className='grid md:grid-cols-4 gap-8'>
                    {/* Company Info */}
                    <div className='md:col-span-2'>
                        <div className='flex items-center mb-4'>
                            <img
                                src='/assets/td-logo_2021.webp'
                                alt='Taco Delite'
                                width={80}
                                height={40}
                                className='h-10 w-auto mr-3'
                                loading='lazy'
                            />
                            <span className='text-xl font-hobo'>
                                Taco Delite
                            </span>
                        </div>
                        <p className='text-gray-600 dark:text-gray-300 mb-4 max-w-md'>
                            Serving flavorful Tex-Mex cuisine in Plano since
                            1989. Fresh ingredients, bold flavors, and friendly
                            service.
                        </p>
                        {/* <div className="flex space-x-4">
                            <a href="https://www.tiktok.com/@tacodelite15thst?is_from_webapp=1&sender_device=pc" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-taco-yellow-400 transition-colors">
                                🎥 TikTok
                            </a>
                        </div> */}
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className='text-lg font-secular mb-4'>
                            Quick Links
                        </h3>
                        <ul className='space-y-2'>
                            <li>
                                <Link
                                    to='/'
                                    className='text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors'
                                >
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to='/menu'
                                    className='text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors'
                                >
                                    Menu
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to='/about'
                                    className='text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors'
                                >
                                    About
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to='/contact'
                                    className='text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors'
                                >
                                    Contact
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className='text-lg font-secular mb-4'>Contact</h3>
                        <ul className='space-y-2 text-gray-600 dark:text-gray-300'>
                            <li>
                                <a
                                    href='https://maps.app.goo.gl/XhxheTxBpTHwJZ9ZA'
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors'
                                >
                                    📍 2957 W 15th St, Plano, TX 75075
                                </a>
                            </li>
                            <li>
                                <a
                                    href='tel:+19729645419'
                                    className='text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors'
                                >
                                    📞 (972) 964-5419
                                </a>
                            </li>
                            <li>
                                <a
                                    href='mailto:tacodelitewestplano@gmail.com'
                                    className='text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors'
                                >
                                    📧 tacodelitewestplano@gmail.com
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className='border-t border-gray-300 dark:border-gray-700 mt-8 pt-8 text-center'>
                    <p className='text-gray-500 dark:text-gray-400'>
                        © {currentYear} Taco Delite. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
