export const taco_menu_icon = (
    <svg width="40" height="23" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M40 21.9H0S0 .5 19.6.5 40 21.9 40 21.9Z" fill="#8FD697"/>
        <path d="M40 22.1H0S0 5.3 19.6 5.3 40 22 40 22Z" fill="#43B64F"/>
    </svg>
);

export const menu_arrow = (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6" viewBox="0 0 320 240">
        {/* <!--! Font Awesome Pro 6.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --> */}
        <path d="M182.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-128 128c-9.2 9.2-11.9 22.9-6.9 34.9s16.6 19.8 29.6 19.8H288c12.9 0 24.6-7.8 29.6-19.8s2.2-25.7-6.9-34.9l-128-128z" fill="#297031"/>
    </svg>
)

export const home = (className='', fill='#000') => {
    return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
        {/* <!--! Font Awesome Pro 6.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --> */}
        <path className={className} fill={fill} d="M575.8 255.5c0 18-15 32.1-32 32.1h-32l.7 160.2c0 2.7-.2 5.4-.5 8.1V472c0 22.1-17.9 40-40 40H456c-1.1 0-2.2 0-3.3-.1c-1.4 .1-2.8 .1-4.2 .1H416 392c-22.1 0-40-17.9-40-40V448 384c0-17.7-14.3-32-32-32H256c-17.7 0-32 14.3-32 32v64 24c0 22.1-17.9 40-40 40H160 128.1c-1.5 0-3-.1-4.5-.2c-1.2 .1-2.4 .2-3.6 .2H104c-22.1 0-40-17.9-40-40V360c0-.9 0-1.9 .1-2.8V287.6H32c-18 0-32-14-32-32.1c0-9 3-17 10-24L266.4 8c7-7 15-8 22-8s15 2 21 7L564.8 231.5c8 7 12 15 11 24z"/>
    </svg>
    );
}

export const car = (className='', fill='#000') => {
    return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
        {/* <!--! Font Awesome Pro 6.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc.--> */}
        <path className={className} fill={fill} d="M171 96h53v96H111l31-76c5-12 16-20 29-20zm101 96V96h81c10 0 19 4 25 12l67 84H272zm256 1L428 68a96 96 0 0 0-75-36H171c-39 0-74 24-89 60L41 196c-24 10-41 33-41 60v112c0 18 14 32 32 32h33a96 96 0 0 0 190 0h130a96 96 0 0 0 190 0h33c18 0 32-14 32-32v-48c0-65-49-119-112-127zm-3 207a48 48 0 0 1-93-16 48 48 0 1 1 93 16zm-365 32a48 48 0 0 1-48-48 48 48 0 1 1 48 48z"/>
    </svg>)
}

export const utensils = (className='', fill='#000') => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
            {/* <!--! Font Awesome Pro 6.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --> */}
            <path className={className} fill={fill} d="M416 0C400 0 288 32 288 176V288c0 35.3 28.7 64 64 64h32V480c0 17.7 14.3 32 32 32s32-14.3 32-32V352 240 32c0-17.7-14.3-32-32-32zM64 16C64 7.8 57.9 1 49.7 .1S34.2 4.6 32.4 12.5L2.1 148.8C.7 155.1 0 161.5 0 167.9c0 45.9 35.1 83.6 80 87.7V480c0 17.7 14.3 32 32 32s32-14.3 32-32V255.6c44.9-4.1 80-41.8 80-87.7c0-6.4-.7-12.8-2.1-19.1L191.6 12.5c-1.8-8-9.3-13.3-17.4-12.4S160 7.8 160 16V150.2c0 5.4-4.4 9.8-9.8 9.8c-5.1 0-9.3-3.9-9.8-9L127.9 14.6C127.2 6.3 120.3 0 112 0s-15.2 6.3-15.9 14.6L83.7 151c-.5 5.1-4.7 9-9.8 9c-5.4 0-9.8-4.4-9.8-9.8V16zm48.3 152l-.3 0-.3 0 .3-.7 .3 .7z"/>
        </svg>)
}